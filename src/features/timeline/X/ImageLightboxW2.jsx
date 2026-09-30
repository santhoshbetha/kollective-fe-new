// src/features/timeline/ImageLightbox.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export function ImageLightbox({ isOpen, images, activeIndex, setActiveIndex, onClose }) {
    const mediaList = images || [];
    const totalImages = mediaList.length;

    // 🚀 Gesture and Layout Vector References
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchStartX, setTouchStartX] = useState(null);
    const [dragOffsetY, setDragOffsetY] = useState(0);
    const [dragOffsetX, setDragOffsetX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleNext = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % totalImages);
    }, [totalImages, setActiveIndex]);

    const handlePrev = useCallback(() => {
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
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleNext, handlePrev, totalImages, onClose]);

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
        // If the swipe motion is heavily dominant horizontally, lock out down-drag triggers
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            setDragOffsetX(deltaX);
        } else {
            setDragOffsetX(0);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);

        // 🚀 CRITICAL ACCENT GATES: Threshold verification benchmarks
        if (dragOffsetY > 120) {
            // Dismiss Canvas completely if swiped down far enough
            onClose();
        } else if (dragOffsetX > 80 && totalImages > 1) {
            // Swipe Right-to-Left: Jump back to previous asset index point
            handlePrev();
        } else if (dragOffsetX < -80 && totalImages > 1) {
            // Swipe Left-to-Right: Jump ahead to next asset index point
            handleNext();
        }

        // Snap parameters smoothly back onto native grid layouts via CSS transition frames
        setDragOffsetY(0);
        setDragOffsetX(0);
    };

    return createPortal(
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] backdrop-blur-md flex flex-col justify-between p-4 select-none touch-none animate-in fade-in duration-200"
            style={{
                // 🎨 Dynamic Elastic alpha blending: background clears up as you drag away
                backgroundColor: `rgba(0, 0, 0, ${Math.max(0.3, 0.95 - Math.abs(dragOffsetY) / 500)})`,
                transition: isDragging ? 'none' : 'background-color 0.25s ease-out'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* 🧭 Top Overlay Navigation Header Toolbar Panel */}
            <div className="w-full flex justify-between items-center z-30 relative">
                <div className="bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-text-secondary select-none">
                    {activeIndex + 1} / {totalImages}
                </div>

                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="w-10 h-10 rounded-xl bg-surface-container-high/40 hover:bg-white/10 border border-white/5 hover:border-white/10 text-text-primary transition-all flex items-center justify-center cursor-pointer active:scale-95 group"
                >
                    <span className="material-symbols-outlined text-[22px] transition-transform group-hover:rotate-90">close</span>
                </button>
            </div>

            {/* 🖼️ Central Fullscreen Active Media Stage Screen */}
            <div className="flex-1 w-full flex items-center justify-between relative max-h-[85vh] z-20">

                {/* Left Pagination Slider Arrow Button (Hidden on Mobile Touches via CSS pointer filters) */}
                {totalImages > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="hidden md:flex absolute left-4 w-12 h-12 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 text-text-primary transition-all items-center justify-center cursor-pointer active:scale-95 z-30"
                    >
                        <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                    </button>
                )}

                {/* Focused Screen Main Display Media Node Container */}
                <div
                    className="w-full h-full flex items-center justify-center p-2 relative select-none"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        // 🚀 Apply transform offsets matching active finger coordinates in real-time
                        transform: `translate3d(${dragOffsetX}px, ${dragOffsetY}px, 0) scale(${Math.max(0.75, 1 - Math.abs(dragOffsetY) / 1200)})`,
                        transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)'
                    }}
                >
                    <img
                        alt={`Fullscreen light-box visualization asset ${activeIndex}`}
                        src={mediaList[activeIndex]}
                        className="max-w-full max-h-full object-contain rounded-xl border border-white/5 shadow-2xl pointer-events-none select-none"
                    />
                </div>

                {/* Right Pagination Slider Arrow Button */}
                {totalImages > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="hidden md:flex absolute right-4 w-12 h-12 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 text-text-primary transition-all items-center justify-center cursor-pointer active:scale-95 z-30"
                    >
                        <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                    </button>
                )}

            </div>

            {/* 🧭 Bottom Inline Indicator Dot Array Footer */}
            <div className="w-full flex justify-center items-center gap-1.5 pb-2 z-30 relative select-none">
                {totalImages > 1 && mediaList.map((_, idx) => {
                    const isIndicatorActive = activeIndex === idx;
                    return (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${isIndicatorActive ? 'w-6 bg-primary-container' : 'w-1.5 bg-white/20'
                                }`}
                        />
                    );
                })}
            </div>

        </div>,
        document.body
    );
}
