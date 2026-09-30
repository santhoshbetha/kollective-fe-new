// src/components/CascadedPostRow.jsx
import React, { useState } from 'react';
import { ImageCarouselModal } from './ImageCarouselModal';

// 🛑 HOOK IS GONE FROM HERE: Moved strictly into state attributes passed down
export function CascadedPostRowX({
    post,
    isFocus,
    isAncestor,
    hasNextReply,
    onClick,
    onReplyClick,
    onLike,
    onBookmark
}) {
    // Local simple component variables are completely safe
    const [showCw, setShowCw] = useState(false);
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const authorHandle = post.author?.handle || `@${post.author?.name.toLowerCase().replace(/\s+/g, '')}@kollective.social`;

    const handleRowClick = (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('span.cursor-pointer')) {
            return;
        }
        if (!isFocus) onClick(post.id);
    };

    // Helper inside layout mapping parameters
    const renderText = (text) => {
        if (!text) return null;
        return text.split(/(\s+)/).map((word, idx) => {
            if (word.startsWith('@')) {
                return (
                    <span key={idx} className="text-primary-container font-bold hover:underline cursor-pointer">
                        {word}
                    </span>
                );
            }
            return word;
        });
    };

    return (
        <div
            onClick={handleRowClick}
            className={`flex flex-col relative p-6 border-b border-[#262626] last:border-b-0 transition-colors ${isFocus ? 'bg-[#181818]' : 'bg-[#141414] hover:bg-white/[0.015] cursor-pointer'
                }`}
        >
            {isAncestor && hasNextReply && (
                <div className="absolute top-[72px] bottom-0 w-[2px] bg-white/10 left-[48px] -translate-x-1/2 z-0" />
            )}

            <div className="flex gap-4 z-10 relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#1A1616]">
                    {post.author?.avatar ? (
                        <img src={post.author.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary-container flex items-center justify-center font-bold text-white uppercase text-lg">
                            {post.author?.name ? post.author.name[0] : '?'}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-text-primary text-sm md:text-base hover:underline truncate">
                                {post.author?.name}
                            </span>
                            {post.author?.verified && (
                                <span className="material-symbols-outlined text-[16px] text-text-secondary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    verified
                                </span>
                            )}
                            <span className="text-xs text-text-secondary font-mono truncate">{authorHandle}</span>
                        </div>
                        <span className="text-xs text-text-secondary shrink-0">{post.time || 'Just now'}</span>
                    </div>

                    {isFocus && post.title && (
                        <h2 className="font-headline-lg text-2xl font-bold mb-4 text-text-primary tracking-tight leading-snug">
                            {post.title}
                        </h2>
                    )}

                    {/* Inline Content Warning (No extra hook component wraps) */}
                    {post.contentWarning ? (
                        <div className="mt-2 p-4 bg-surface-crimson-low/10 rounded-xl border border-primary-container/20 space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-bold text-primary font-mono uppercase tracking-wider">
                                    ⚠️ CW: {post.contentWarning}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setShowCw(!showCw); }}
                                    className="px-2.5 py-1 bg-surface-container text-text-primary rounded text-xs font-bold hover:bg-primary-container hover:text-white transition-colors cursor-pointer"
                                >
                                    {showCw ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {showCw && (
                                <p className={`text-text-secondary leading-relaxed pt-2 border-t border-white/5 whitespace-pre-wrap ${isFocus ? 'text-lg' : 'text-sm'}`}>
                                    {renderText(post.text)}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className={`text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap ${isFocus ? 'text-lg' : 'text-sm'}`}>
                            {renderText(post.text)}
                        </p>
                    )}

                    {/* Carousel Images Layout */}
                    {post.images && post.images.length > 0 && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-white/5 shadow-inner">
                            {post.images.length === 1 ? (
                                <div className="aspect-[16/9] w-full overflow-hidden">
                                    <img src={post.images[0]} alt={post.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                                </div>
                            ) : post.images.length === 2 ? (
                                <div className="grid grid-cols-2 gap-2 aspect-[16/9] w-full overflow-hidden">
                                    <img src={post.images[0]} alt={post.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                                    <img src={post.images[1]} alt={post.imageAlts?.[1] || "Attached image 1"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(1); setCarouselOpen(true); }} />
                                </div>
                            ) : post.images.length === 3 ? (
                                <div className="grid grid-cols-2 gap-2 aspect-[16/9] w-full overflow-hidden">
                                    <div className="h-full w-full relative overflow-hidden">
                                        <img src={post.images[0]} alt={post.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                                    </div>
                                    <div className="flex flex-col gap-2 h-full overflow-hidden">
                                        <div className="flex-1 min-h-0 overflow-hidden flex">
                                            <img src={post.images[1]} alt={post.imageAlts?.[1] || "Attached image 1"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(1); setCarouselOpen(true); }} />
                                        </div>
                                        <div className="flex-1 min-h-0 overflow-hidden flex">
                                            <img src={post.images[2]} alt={post.imageAlts?.[2] || "Attached image 2"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(2); setCarouselOpen(true); }} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-[16/9] w-full overflow-hidden">
                                    <img src={post.images[0]} alt={post.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                                    <img src={post.images[1]} alt={post.imageAlts?.[1] || "Attached image 1"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(1); setCarouselOpen(true); }} />
                                    <img src={post.images[2]} alt={post.imageAlts?.[2] || "Attached image 2"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(2); setCarouselOpen(true); }} />
                                    <img src={post.images[3]} alt={post.imageAlts?.[3] || "Attached image 3"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(3); setCarouselOpen(true); }} />
                                </div>
                            )}
                        </div>
                    )}

                    {post.image && (!post.images || post.images.length === 0) && (
                        <div className="mt-3 aspect-[16/9] rounded-xl overflow-hidden border border-white/5 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }}>
                            <img src={post.image} alt={post.imageMeta || "Attached image"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300" />
                        </div>
                    )}

                    <div className="pt-4 flex items-center gap-8 text-text-secondary">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onReplyClick(post.author?.name); }}
                            className="flex items-center gap-1.5 text-sm hover:text-primary-container bg-transparent border-none cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">reply</span>
                            <span>{post.commentsCount || 0}</span>
                        </button>

                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
                            className={`flex items-center gap-1.5 text-sm transition-colors bg-transparent border-none cursor-pointer ${post.liked ? 'text-primary-container font-black' : 'hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post.liked ? "'FILL' 1" : "'FILL' 0" }}>
                                favorite
                            </span>
                            <span>{(post.likes || 0).toLocaleString()}</span>
                        </button>

                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onBookmark(post.id); }}
                            className={`flex items-center gap-1.5 text-sm transition-colors bg-transparent border-none cursor-pointer ml-auto ${post.bookmarked ? 'text-amber-500' : 'hover:text-amber-500'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">bookmark</span>
                        </button>
                    </div>

                </div>
            </div>

            <ImageCarouselModal
                isOpen={carouselOpen}
                onClose={() => setCarouselOpen(false)}
                images={post.images && post.images.length > 0 ? post.images : post.image ? [post.image] : []}
                imageAlts={post.images && post.images.length > 0 ? post.imageAlts : post.image ? [post.imageMeta || ""] : []}
                initialIndex={carouselIndex}
                post={post}
            />
        </div>
    );
}

// Helper: Hides sensitive data or spoilers behind a button toggle natively
const ContentWarningWrapper = ({ warning, children }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="mt-3 p-4 bg-surface-crimson-low/10 rounded-xl border border-primary-container/20 space-y-3">
            <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm font-bold text-primary font-mono uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px] text-primary">warning</span>
                    Content Warning: {warning}
                </span>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShow(!show); }}
                    className="px-3.5 py-1.5 bg-surface-container text-text-primary rounded-lg text-sm font-bold hover:bg-primary-container hover:text-white transition-all cursor-pointer"
                >
                    {show ? 'Hide Details' : 'Show Details'}
                </button>
            </div>
            {show && <div className="pt-3 border-t border-white/5">{children}</div>}
        </div>
    );
};

// Helper: Parses word tokens to extract profile handle syntax highlights automatically
const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\s+)/).map((word, idx) => {
        if (word.startsWith('@')) {
            return (
                <span key={idx} className="text-primary-container font-bold hover:underline cursor-pointer">
                    {word}
                </span>
            );
        }
        return word;
    });
};

function renderTextN(text) {
    if (!text) return '';
    let result = text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    result = result.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-container hover:underline">$1</a>');
    result = result.replace(/@([a-zA-Z0-9_]+)/g, '<a href="/profile/$1" class="text-primary-container hover:underline">@$1</a>');
    return result;
}

