// src/features/profile/ProfileFeed.jsx
import React, { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useProfilePostsQuery } from './useProfileFeature';
import { PostCard } from '../timeline/PostCard';
import { useProfileTimelineQuery } from './useProfileFeature';

export function ProfileFeed({ username }) {
    const [activeTab, setActiveTab] = useState('Posts'); // 'Posts' | 'Media' | 'Voices'
    //const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useProfilePostsQuery(username);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useProfileTimelineQuery(username, streamMode);

    // Flatten our dynamic infinite query pages into a unified sequential array mapping
    const allPosts = data?.pages.flatMap((page) => page.posts || []) || [];

    // Filter content tokens inside local memory buckets symmetrically
    const filteredPosts = allPosts.filter((post) => {
        if (activeTab === 'Media') return post.images && post.images.length > 0;
        if (activeTab === 'Voices') return !!post.isVoice;
        return true; // Default: 'Posts' returns the complete timeline sequence
    });

    if (status === 'pending') {
        return <div className="text-center py-12 text-xs font-bold font-mono uppercase tracking-widest text-text-secondary/40 animate-pulse">Syncing feed parameters...</div>;
    }

    return (
        <div className="w-full flex flex-col gap-4 mt-2">
            {/* 🧭 Local View Filter Tab Row Panel */}
            <div className="flex border-b border-white/5 bg-surface-container-lowest/30 p-1 rounded-xl select-none">
                {['Posts', 'Media', 'Voices'].map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border border-transparent cursor-pointer ${activeTab === tab
                            ? 'bg-surface-container-high text-text-primary border-white/5 font-black shadow-sm'
                            : 'text-text-secondary hover:text-text-primary bg-transparent'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 🥞 VIRTUALIZED TIMELINE INTERACTION STREAM CANVAS */}
            {filteredPosts.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-surface-container-low/40">
                    <span className="material-symbols-outlined text-3xl text-text-secondary/30 mb-2">grid_view</span>
                    <p className="text-sm font-medium text-text-secondary">No activity listed under this tab index yet.</p>
                </div>
            ) : (
                <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-2xl w-full">
                    <Virtuoso
                        useWindowScroll
                        data={filteredPosts}
                        endReached={() => {
                            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                        }}
                        overscan={400}
                        itemContent={(index, post) => (
                            <PostCard post={post} isLast={index === filteredPosts.length - 1} />
                        )}
                        components={{
                            Footer: () => isFetchingNextPage && (
                                <div className="py-8 flex flex-col items-center gap-2 border-t border-white/5 bg-[#141414]">
                                    <span className="animate-spin w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full" />
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary/40">Loading older pulses</span>
                                </div>
                            )
                        }}
                    />
                </div>
            )}
        </div>
    );
}
