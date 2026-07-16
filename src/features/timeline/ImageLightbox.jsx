// src/features/timeline/ImageLightbox.jsx
import React, { useEffect } from 'react';

export function ImageLightbox({ isOpen, images, activeIndex, setActiveIndex, onClose }) {
    const mediaList = images || [];
    const totalImages = mediaList.length;

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
        // Lock underlying document body scrolling parameters while fullscreen overlay is armed
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, activeIndex, totalImages]);

    if (!isOpen || totalImages === 0) return null;

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % totalImages);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200"
            onClick={onClose} // Clicking empty backdrop triggers closing lifecycle sequences
        >

            {/* 🧭 Top Overlay Navigation Header Toolbar Panel */}
            <div className="w-full flex justify-between items-center z-10 relative">
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
            <div className="flex-1 w-full flex items-center justify-between relative max-h-[85vh]">

                {/* Left Pagination Slider Arrow Button */}
                {totalImages > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 w-12 h-12 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 text-text-primary transition-all flex items-center justify-center cursor-pointer active:scale-95 z-20"
                    >
                        <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                    </button>
                )}

                {/* Focused Screen Main Display Media Node Container */}
                <div
                    className="w-full h-full flex items-center justify-center p-2 relative select-none"
                    onClick={(e) => e.stopPropagation()} // Stop propagation from closing the frame inside container boundaries
                >
                    <img
                        alt={`Fullscreen light-box visualization asset ${activeIndex}`}
                        src={mediaList[activeIndex]}
                        className="max-w-full max-h-full object-contain rounded-xl border border-white/5 shadow-2xl animate-in zoom-in-95 duration-200"
                    />
                </div>

                {/* Right Pagination Slider Arrow Button */}
                {totalImages > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 w-12 h-12 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 text-text-primary transition-all flex items-center justify-center cursor-pointer active:scale-95 z-20"
                    >
                        <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                    </button>
                )}

            </div>

            {/* 🧭 Bottom Inline Indicator Dot Array Footer */}
            <div className="w-full flex justify-center items-center gap-1.5 pb-2 z-10 relative select-none">
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

        </div>
    );
}
