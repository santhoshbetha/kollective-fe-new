// src/features/timeline/PostActionBar.jsx
import React from 'react';

export function PostActionBar({ post, onLike, onBookmark, onReplyClick }) {
    return (
        <div className="status-action-bar flex items-center gap-8 text-text-secondary pt-3 mt-1 select-none w-full">

            {/* 💬 Reply Button Control Trigger */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onReplyClick?.(post.author?.name); }}
                className="flex items-center gap-1.5 text-xs hover:text-primary-container bg-transparent border-none cursor-pointer transition-colors"
            >
                <span className="material-symbols-outlined text-[18px]">reply</span>
                <span className="font-mono">{post.commentsCount || 0}</span>
            </button>

            {/* 🚀 Boost / Reblog Button Control Trigger */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); alert('Post boosted to timeline logs!'); }}
                className={`flex items-center gap-1.5 text-xs transition-colors bg-transparent border-none cursor-pointer ${post.reblogged ? 'text-emerald-500' : 'hover:text-emerald-500'
                    }`}
            >
                <span className="material-symbols-outlined text-[18px]">repeat</span>
                <span className="font-mono">{post.shares || 0}</span>
            </button>

            {/* ❤️ Like / Favorite Button Control Trigger */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
                className={`flex items-center gap-1.5 text-xs transition-colors bg-transparent border-none cursor-pointer ${post.liked ? 'text-primary-container font-black' : 'hover:text-white'
                    }`}
            >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post.liked ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                </span>
                <span className="font-mono">{(post.likes || 0).toLocaleString()}</span>
            </button>

            {/* 🔖 Bookmark Button Control Trigger */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onBookmark(post.id); }}
                className={`flex items-center gap-1.5 text-xs transition-colors bg-transparent border-none cursor-pointer ml-auto ${post.bookmarked ? 'text-amber-500' : 'hover:text-amber-500'
                    }`}
            >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post.bookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                    bookmark
                </span>
            </button>

        </div>
    );
}
