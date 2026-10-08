// src/components/ImageLightbox.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to your layout helper directory path

/**
 * ⚡ ENHANCED SOVEREIGN MEDIA LIGHTBOX MATRIX
 * Integrates your exact vertical elastic drag dismissals and swipe pagination
 * while securely decoding 3-state backend media objects (url, static_url, blurhash)
 */
export function ImageLightbox({ isOpen, images, activeIndex, setActiveIndex, onClose }) {
    const mediaList = images || [];
    const totalImages = mediaList.length;

    // 🚀 Gesture and Layout Vector References
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchStartX, setTouchStartX] = useState(null);
    const [dragOffsetY, setDragOffsetY] = useState(0);
    const [dragOffsetX, setDragOffsetX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Media performance lifecycle state monitors
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const containerRef = useRef(null);

    const handleNext = useCallback(() => {
        setIsImageLoaded(false);
        setHasError(false);
        setActiveIndex((prev) => (prev + 1) % totalImages);
    }, [totalImages, setActiveIndex]);

    const handleParagraphPrev = useCallback(() => {
        setIsImageLoaded(false);
        setHasError(false);
        setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }, [totalImages, setActiveIndex]);

    // 🎹 Bind keyboard navigation watchdog rules for modern desktop layouts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowRight' && totalImages > 1) {
                handleNext();
            } else if (e.key === 'ArrowLeft' && totalImages > 1) {
                handleParagraphPrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleNext, handleParagraphPrev, totalImages, onClose]);

    // Reset layout loading flags cleanly whenever the index parameters switch
    useEffect(() => {
        setIsImageLoaded(false);
        setHasError(false);
    }, [activeIndex]);

    if (!isOpen || totalImages === 0 || typeof document === 'undefined') return null;

    // 🚀 Touch Mechanics Switchboard Handlers
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        setTouchStartY(touch.clientY);
        setTouchStartX(touch.clientX);
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];

        const deltaY = touch.clientY - touchStartY;
        const deltaX = touch.clientX - touchStartX;

        // 1. Elastic Vertical Down-Swipe Processing
        if (deltaY > 0) {
            setDragOffsetY(deltaY);
        } else {
            // Add resistive dampening physics to upward dragging behaviors
            setDragOffsetY(deltaY * 0.2);
        }

        // 2. Horizontal Pagination Track Control
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            setDragOffsetX(deltaX);
        } else {
            setDragOffsetX(0);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);

        // Threshold verification benchmarks
        if (dragOffsetY > 120) {
            onClose();
        } else if (dragOffsetX > 80 && totalImages > 1) {
            handleParagraphPrev();
        } else if (dragOffsetX < -80 && totalImages > 1) {
            handleNext();
        }

        setDragOffsetY(0);
        setDragOffsetX(0);
    };
    // 🚀 3-STATE RESOLVER ENGINE: Handles raw image string paths or backend media object blocks gracefully
    const currentMediaNode = mediaList[activeIndex];

    // Dynamically maps object keys (url, static_url) or handles plain string targets directly
    const targetFullMediaUrl = typeof currentMediaNode === 'object' && currentMediaNode !== null
        ? (currentMediaNode.url || currentMediaNode.static_url)
        : currentMediaNode;

    return createPortal(
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] backdrop-blur-md flex flex-col justify-between p-4 select-none touch-none animate-in fade-in duration-200 font-sans"
            style={{
                // 🎨 Dynamic Elastic alpha blending: background clears up as you drag away
                backgroundColor: `rgba(0, 0, 0, ${Math.max(0.4, 0.95 - Math.abs(dragOffsetY) / 500)})`,
                transition: isDragging ? 'none' : 'background-color 0.25s ease-out'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Top Index Toolbar Control Row */}
            <div className="w-full flex justify-between items-center z-30 relative select-none">
                <div className="bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-text-secondary select-none tracking-wider">
                    {activeIndex + 1} / {totalImages}
                </div>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="w-11 h-11 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer active:scale-95 outline-none"
                    aria-label="Close Lightbox"
                >
                    <X className="w-5 h-5 stroke-[2.5px]" />
                </button>
            </div>

            {/* Main Stage Media Content Viewport */}
            <div className="flex-1 w-full flex items-center justify-between relative max-h-[85vh] z-20">
                {totalImages > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleParagraphPrev(); }}
                        className="hidden md:flex absolute left-4 w-12 h-12 rounded-xl bg-black/60 hover:bg-neutral-800 border dark:border-white/10 border-black/10 text-white transition-all items-center justify-center cursor-pointer active:scale-95 z-30 outline-none"
                        aria-label="Previous Slide"
                    >
                        <ChevronLeft className="w-6 h-6 stroke-[2.5px]" />
                    </button>
                )}

                {/* 🎥 Interactive Fullscreen Canvas Grid */}
                <div
                    className="w-full h-full flex items-center justify-center p-2 relative select-none"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        // 🚀 Apply transform offsets matching active finger coordinates in real-time
                        transform: `translate3d(${dragOffsetX}px, ${dragOffsetY}px, 0) scale(${Math.max(0.75, 1 - Math.abs(dragOffsetY) / 1200)})`,
                        transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)'
                    }}
                >
                    {/* Buffering Indicator Spinner Stack */}
                    {!isImageLoaded && !hasError && (
                        <div className="absolute font-mono text-xs font-black text-white/40 uppercase tracking-widest animate-pulse">
                            Loading Source...
                        </div>
                    )}

                    {/* Error Interceptor Display Frame */}
                    {hasError && (
                        <div className="flex flex-col items-center justify-center gap-2 text-rose-400 font-bold text-sm">
                            <AlertTriangle className="w-6 h-6 text-rose-500" />
                            <span>Failed to parse lightbox media stream.</span>
                        </div>
                    )}

                    {!hasError && (
                        <img
                            alt={`Fullscreen lightbox visualization asset ${activeIndex}`}
                            src={targetFullMediaUrl}
                            onLoad={() => setIsImageLoaded(true)}
                            onError={() => setHasError(true)}
                            className={cn(
                                "max-w-full max-h-full object-contain rounded-xl border dark:border-white/10 border-black/10 shadow-2xl transition-opacity duration-200 pointer-events-none select-none",
                                !isImageLoaded ? "opacity-0" : "opacity-100"
                            )}
                        />
                    )}
                </div>

                {totalImages > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="hidden md:flex absolute right-4 w-12 h-12 rounded-xl bg-black/60 hover:bg-neutral-800 border dark:border-white/10 border-black/10 text-white transition-all items-center justify-center cursor-pointer active:scale-95 z-30 outline-none"
                        aria-label="Next Slide"
                    >
                        <ChevronRight className="w-6 h-6 stroke-[2.5px]" />
                    </button>
                )}
            </div>

            {/* Bottom Pagination Tracker Indicators Row */}
            <div className="w-full flex justify-center items-center gap-2 pb-2 z-30 relative select-none">
                {totalImages > 1 && mediaList.map((_, idx) => {
                    const isIndicatorActive = activeIndex === idx;
                    return (
                        <div
                            key={`lightbox-dot-${idx}`}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                isIndicatorActive ? 'w-6 bg-primary-container shadow-sm shadow-primary-container/40' : 'w-1.5 bg-white/20'
                            )}
                        />
                    );
                })}
            </div>
        </div>,
        document.body
    );
}
