import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Upload, Trash2, Edit2, ZoomIn, ZoomOut, RotateCcw, Check, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/Dialog';

/**
 * ImageUploader component for Kollective99
 * Supports drag & drop file upload, previewing, cropping with aspect ratio & zoom, and image removal.
 */
export function ImageUploader({
    aspectRatio = 1, // 1 for square avatar, 3 for panoramic header banner
    maxSize = 5 * 1024 * 1024, // 5MB
    acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    value = '',
    onChange,
    onImageCropped,
    onImageRemove,
    className = '',
    mode = 'banner', // 'banner' | 'avatar' | 'compact'
    label = 'Upload Image',
    description = '',
}) {
    const [previewImage, setPreviewImage] = useState(value || '');
    const [rawImage, setRawImage] = useState(null);
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [error, setError] = useState(null);

    const inputRef = useRef(null);
    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    // Sync incoming value prop with previewImage state
    useEffect(() => {
        setPreviewImage(value || '');
    }, [value]);

    const handleFileSelect = (file) => {
        if (!file) return;
        setError(null);

        if (!acceptedFileTypes.includes(file.type)) {
            setError(`File format not supported. Please select JPG, PNG, WEBP, or GIF.`);
            return;
        }

        if (file.size > maxSize) {
            setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max limit is ${(maxSize / (1024 * 1024)).toFixed(0)}MB.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setRawImage(reader.result);
            setZoom(1);
            setCropOffset({ x: 0, y: 0 });
            setIsCropDialogOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    // Draw interactive preview inside Crop Modal Canvas
    const updateCanvasPreview = useCallback(() => {
        if (!canvasRef.current || !rawImage) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = rawImage;
        img.onload = () => {
            imgRef.current = img;
            const containerWidth = canvas.width;
            const containerHeight = canvas.height;

            ctx.clearRect(0, 0, containerWidth, containerHeight);

            // Compute scaled dimensions based on aspect ratio & zoom
            const scale = Math.max(containerWidth / img.width, containerHeight / img.height) * zoom;
            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;

            const drawX = (containerWidth - drawWidth) / 2 + cropOffset.x;
            const drawY = (containerHeight - drawHeight) / 2 + cropOffset.y;

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        };
    }, [rawImage, zoom, cropOffset]);

    useEffect(() => {
        if (isCropDialogOpen) {
            updateCanvasPreview();
        }
    }, [isCropDialogOpen, updateCanvasPreview]);

    // Canvas pan handlers
    const handleCanvasMouseDown = (e) => {
        setIsDraggingCanvas(true);
        setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDraggingCanvas) return;
        setCropOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleCanvasMouseUp = () => {
        setIsDraggingCanvas(false);
    };

    const handleApplyCrop = () => {
        if (!rawImage) return;

        const img = imgRef.current || new Image();
        if (!img.src) img.src = rawImage;

        // Create clean export canvas
        const exportCanvas = document.createElement('canvas');
        const targetWidth = aspectRatio > 1 ? 1200 : 400;
        const targetHeight = targetWidth / aspectRatio;

        exportCanvas.width = targetWidth;
        exportCanvas.height = targetHeight;

        const ctx = exportCanvas.getContext('2d');
        if (ctx) {
            const previewCanvas = canvasRef.current;
            const previewWidth = previewCanvas ? previewCanvas.width : targetWidth;
            const previewHeight = previewCanvas ? previewCanvas.height : targetHeight;

            const scale = Math.max(previewWidth / img.width, previewHeight / img.height) * zoom;
            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;

            const drawX = (previewWidth - drawWidth) / 2 + cropOffset.x;
            const drawY = (previewHeight - drawHeight) / 2 + cropOffset.y;

            // Map preview coordinates to export canvas coordinates
            const ratioX = targetWidth / previewWidth;
            const ratioY = targetHeight / previewHeight;

            ctx.drawImage(img, drawX * ratioX, drawY * ratioY, drawWidth * ratioX, drawHeight * ratioY);

            const croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.92);
            setPreviewImage(croppedDataUrl);

            if (onChange) onChange(croppedDataUrl);
            if (onImageCropped) onImageCropped(croppedDataUrl);

            setIsCropDialogOpen(false);
        }
    };

    const handleClearImage = (e) => {
        if (e) e.stopPropagation();
        setPreviewImage('');
        setRawImage(null);
        if (onChange) onChange('');
        if (onImageRemove) onImageRemove();
    };

    // Render logic for different modes (avatar vs banner)
    if (mode === 'avatar') {
        return (
            <div className={cn("relative flex items-center gap-6", className)}>
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={acceptedFileTypes.join(',')}
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />

                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#141414] bg-surface-container shadow-xl cursor-pointer group shrink-0"
                >
                    {previewImage ? (
                        <img src={previewImage} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high text-text-secondary group-hover:text-primary-container transition-colors">
                            <ImageIcon className="w-8 h-8 opacity-60" />
                            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Upload</span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                        <Upload className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h4 className="font-headline-md text-lg font-bold text-text-primary">{label}</h4>
                    <p className="text-xs text-text-secondary">{description || "Square format (400x400). Max limit 5MB."}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="px-4 py-1.5 bg-primary-container hover:bg-primary-container/90 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                        >
                            Upload Photo
                        </Button>
                        {previewImage && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearImage}
                                className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs rounded-xl cursor-pointer"
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                    {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
                </div>

                {/* CROP DIALOG */}
                {renderCropModal()}
            </div>
        );
    }

    // Default 'banner' / header image uploader mode
    return (
        <div className={cn("w-full flex flex-col gap-2", className)}>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={acceptedFileTypes.join(',')}
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ aspectRatio: aspectRatio }}
                className="relative w-full bg-surface-container rounded-2xl border-2 border-dashed border-white/10 overflow-hidden group cursor-pointer hover:border-primary-container/50 transition-all select-none shadow-inner"
            >
                {previewImage ? (
                    <>
                        <img src={previewImage} alt="Header banner preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <Button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                                className="px-4 py-2 bg-primary-container text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Change Banner</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={handleClearImage}
                                className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Remove</span>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-secondary group-hover:text-primary-container transition-colors p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container/20 transition-colors">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-text-primary block">{label}</span>
                            <span className="text-xs text-text-secondary">Drag & drop or click to upload (1500x500 banner format)</span>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-400 font-semibold mt-1">{error}</p>}

            {/* CROP DIALOG */}
            {renderCropModal()}
        </div>
    );

    function renderCropModal() {
        return (
            <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="max-w-lg bg-[#141414] text-white border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <DialogHeader className="border-b border-white/10 pb-4 p-0 bg-transparent flex flex-row items-center justify-between">
                        <DialogTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-primary-container" />
                            <span>Crop & Position Image</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 flex flex-col items-center gap-4">
                        <p className="text-xs text-text-secondary self-start">
                            Drag image to position, use the slider to adjust zoom scale.
                        </p>

                        {/* Interactive Canvas Stage */}
                        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 cursor-grab active:cursor-grabbing flex items-center justify-center">
                            <canvas
                                ref={canvasRef}
                                width={480}
                                height={480 / aspectRatio}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseUp}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* Zoom Controls */}
                        <div className="w-full flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-white/5">
                            <ZoomOut className="w-4 h-4 text-text-secondary shrink-0" />
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.05"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary-container"
                            />
                            <ZoomIn className="w-4 h-4 text-text-secondary shrink-0" />
                            <button
                                type="button"
                                onClick={() => { setZoom(1); setCropOffset({ x: 0, y: 0 }); }}
                                className="p-1 hover:text-primary-container text-text-secondary transition-colors cursor-pointer bg-transparent border-none"
                                title="Reset Zoom"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row justify-end gap-3 pt-2 border-t-0 p-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCropDialogOpen(false)}
                            className="px-5 py-2.5 bg-surface-container-high hover:bg-white/10 text-text-secondary font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApplyCrop}
                            className="px-6 py-2.5 bg-primary-container hover:bg-primary-container/90 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                        >
                            Apply & Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
}
