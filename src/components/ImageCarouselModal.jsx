import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePostActions } from '../features/timeline/usePostActions';

export const ImageCarouselModal = ({ isOpen, onClose, images = [], imageAlts = [], initialIndex = 0, post }) => {
  const { toggleLike, toggleReblog, toggleBookmark, isActionPending } = usePostActions();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false); // 1:1 scale vs fit toggle

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (activeIndex < images.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex flex-col justify-between select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Controls */}
      <div className="flex justify-between items-center w-full px-6 py-4 bg-black/30 z-10">
        <div className="flex items-center gap-4 text-white/70 text-sm font-semibold">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back</span>
          </button>
          <span>•</span>
          <span>{activeIndex + 1} / {images.length}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom / Aspect Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[15px] font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1 border-none outline-none"
            title="Toggle Fit / Zoom"
          >
            <span className="material-symbols-outlined text-sm">aspect_ratio</span>
            <span>{isZoomed ? "Fit" : "1:1"}</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors border-none outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Image Slider View */}
      <div className="flex-1 w-full flex items-center justify-between px-4 md:px-8 relative">
        {/* Left Arrow */}
        <div className="w-16 flex justify-start z-10">
          {activeIndex > 0 && (
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-black/50 border border-white/10 hover:bg-black/80 hover:scale-105 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all outline-none"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_left</span>
            </button>
          )}
        </div>

        {/* Center Active Image Container */}
        <div
          className="flex-1 h-full flex flex-col items-center justify-center p-2 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[activeIndex]}
            alt={imageAlts?.[activeIndex] || `Image ${activeIndex}`}
            className={`max-w-full rounded-lg shadow-2xl transition-all duration-300 ${isZoomed
              ? 'h-full object-cover max-h-[85vh] w-full aspect-[16/9]'
              : 'max-h-[75vh] object-contain'
              }`}
          />

          {/* Description Caption / ALT Text (Accessibility focused) */}
          {imageAlts?.[activeIndex] && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[15px] md:text-sm text-white/90 bg-black/75 px-4.5 py-2.5 rounded-xl max-w-[80vw] md:max-w-[50vw] text-center backdrop-blur-md shadow-lg border border-white/5 leading-relaxed">
              {imageAlts[activeIndex]}
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <div className="w-16 flex justify-end z-10">
          {activeIndex < images.length - 1 && (
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-black/50 border border-white/10 hover:bg-black/80 hover:scale-105 active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all outline-none"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_right</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Navigation Dots & Interactive Action Bar */}
      <div
        className="w-full flex flex-col items-center pb-6 bg-black/40 z-10 pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carousel Dot Indicators */}
        {images.length > 1 && (
          <div className="flex gap-2 justify-center mb-6">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer border-none outline-none ${idx === activeIndex ? 'bg-primary-container scale-125' : 'bg-white/20 hover:bg-white/40'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Interactive Post Actions */}
        {post && (
          <div className="flex items-center justify-center gap-10 md:gap-14 text-white/70">
            {/* Like Action */}
            <button
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-2 hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none outline-none ${post.liked ? 'text-primary-container font-semibold' : ''
                }`}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: post.liked ? "'FILL' 1" : "'FILL' 0" }}>
                thumb_up
              </span>
              <span className="text-sm">{post.likes}</span>
            </button>

            {/* Reblog / Boost Action */}
            <button
              onClick={() => toggleReblog(post.id)}
              className={`flex items-center gap-2 hover:text-green-500 transition-colors cursor-pointer bg-transparent border-none outline-none ${post.reblogged ? 'text-green-500 font-semibold' : ''
                }`}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: post.reblogged ? "'wght' 700" : "'wght' 400" }}>
                repeat
              </span>
              <span className="text-sm">{post.shares || 0}</span>
            </button>

            {/* Comment Count Display (Purely info inside slider) */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px]">mode_comment</span>
              <span className="text-sm">{post.commentsCount}</span>
            </div>

            {/* Bookmark Action */}
            <button
              onClick={() => toggleBookmark(post.id)}
              className={`flex items-center hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none outline-none ${post.bookmarked ? 'text-primary-container' : ''
                }`}
              title="Bookmark"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: post.bookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                bookmark
              </span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
