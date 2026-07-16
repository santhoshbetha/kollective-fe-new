// src/features/profile/PinnedPostsSection.jsx
import React from 'react';
import { usePinnedPostsQuery, useUnpinPostMutation } from './usePinnedPostsFeature';
import { PostCard } from '../timeline/PostCard';

export function PinnedPostsSection({ accountId, isOwnProfile }) {
    const { data: pinnedPosts, isPending, isError } = usePinnedPostsQuery(accountId);
    const unpinMutation = useUnpinPostMutation(accountId);

    if (isPending || isError || !pinnedPosts || pinnedPosts.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-3 mt-4 animate-in fade-in duration-200 select-none">

            {/* 📌 Section Structural Heading Header Row */}
            <div className="flex items-center gap-2 px-1 text-text-secondary/50">
                <span className="material-symbols-outlined text-[16px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                    keep
                </span>
                <h3 className="text-[11px] font-mono font-black uppercase tracking-widest">
                    Pinned Highlights
                </h3>
            </div>

            {/* 🥞 Symmetrical Container Flat Mapping Stack */}
            <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-xl w-full relative">
                {pinnedPosts.map((post, idx) => {
                    const isUnpinning = unpinMutation.isPending && unpinMutation.variables === post.id;

                    return (
                        <div key={post.id} className="relative group">
                            {/* Inject the clean unified main presentation timeline layout component */}
                            <PostCard post={post} isLast={idx === pinnedPosts.length - 1} />

                            {/* 🔓 Administrative Unpin Toggle Action Button Overlay (Visible on hover if own profile) */}
                            {isOwnProfile && (
                                <button
                                    type="button"
                                    disabled={isUnpinning}
                                    onClick={(e) => { e.stopPropagation(); unpinMutation.mutate(post.id); }}
                                    className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 bg-surface-container-high/80 hover:bg-surface-container-highest border border-white/5 text-[10px] font-bold uppercase tracking-wider text-text-primary rounded-lg backdrop-blur-sm cursor-pointer border-none shadow-md"
                                >
                                    {isUnpinning ? 'Releasing...' : 'Unpin Node'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
