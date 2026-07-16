// src/features/timeline/PostMedia.jsx
import React, { useState } from 'react';

export function PostMedia({ post, setCarouselIndex, setCarouselOpen }) {
    const attachments = post?.images || (post?.image ? [post.image] : []);
    const hasMedia = attachments.length > 0;

    // 🛡️ Soapbox Rule: Check if the media should be masked behind a content warning blur
    const isSensitive = !!post?.contentWarning;
    const [isRevealed, setIsRevealed] = useState(!isSensitive);

    if (!hasMedia) return null;

    const handleMediaClick = (e, index) => {
        e.stopPropagation();
        if (!isRevealed) {
            setIsRevealed(true);
            return;
        }
        setCarouselIndex(index);
        setCarouselOpen(true);
    };

    return (
        <div className="status-media-wrapper w-full mt-3 relative rounded-2xl overflow-hidden border border-white/5 shadow-sm group">

            {/* ⚠️ SENSITIVE MEDIA SHIELD MASK (The Soapbox Pattern) */}
            {!isRevealed && (
                <div
                    onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
                    className="absolute inset-0 bg-[#141414]/80 backdrop-blur-xl z-20 flex flex-col items-center justify-center gap-3 cursor-pointer select-none transition-all hover:bg-[#141414]/70"
                >
                    <span className="material-symbols-outlined text-primary-container text-[32px] animate-pulse">visibility_off</span>
                    <div className="text-center">
                        <p className="text-sm font-bold text-text-primary">Sensitive Content Guarded</p>
                        <p className="text-xs text-text-secondary mt-0.5">Click surface to reveal media layout parameters</p>
                    </div>
                </div>
            )}

            {/* 🖼️ DYNAMIC MULTI-IMAGE MOSAIC GRID MATRICES */}
            <div
                className={`grid gap-1.5 aspect-[16/10] w-full bg-surface-container-lowest ${attachments.length === 1 ? 'grid-cols-1' :
                        attachments.length === 2 ? 'grid-cols-2' :
                            attachments.length === 3 ? 'grid-cols-2 grid-rows-2' :
                                'grid-cols-2 grid-rows-2' // 4 images max
                    }`}
            >
                {attachments.slice(0, 4).map((mediaUrl, index) => {
                    // Dynamic rowspan calculation rule for the 3-image layout configuration setup
                    const isThreeImageFirst = attachments.length === 3 && index === 0;

                    return (
                        <div
                            key={index}
                            onClick={(e) => handleMediaClick(e, index)}
                            className={`relative overflow-hidden cursor-pointer ${isThreeImageFirst ? 'row-span-2' : ''
                                }`}
                        >
                            <img
                                alt={`Media asset link index ${index}`}
                                src={mediaUrl}
                                className={`w-full h-full object-cover transition-transform duration-500 ${isRevealed ? 'group-hover:scale-[1.02]' : 'blur-2xl'
                                    }`}
                                loading="lazy"
                            />

                            {/* 📊 Keep your beautiful overlay metadata indicators if it's the first image */}
                            {index === 0 && post?.imageMeta && isRevealed && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute bottom-4 left-4 flex items-center gap-3 z-10 animate-in fade-in duration-300">
                                        <div className="flex -space-x-2 select-none">
                                            <div className="w-6 h-6 rounded-full border border-surface-ink bg-primary-container/20 backdrop-blur-md" />
                                            <div className="w-6 h-6 rounded-full border border-surface-ink bg-white/5 backdrop-blur-md" />
                                        </div>
                                        <span className="text-[11px] font-mono font-black text-white/90 drop-shadow-sm tracking-wide bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5">
                                            {post.imageMeta}
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* ➕ Indicator overlay mask counter if there are more than 4 images */}
                            {index === 3 && attachments.length > 4 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                    <span className="text-xl font-black text-white font-mono">+{attachments.length - 4}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
