// src/pages/HashtagTimelinePage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import { useHashtagTimelineQuery, useFollowTagMutation } from '../features/timelines/useHashtagTimeline';
import { PostCard } from '../features/timeline/PostCard';

export const HashtagTimelinePage = () => {
    const { id: tagId } = useParams();
    const navigate = useNavigate();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useHashtagTimelineQuery(tagId);
    const followMutation = useFollowTagMutation(tagId);

    const posts = data?.pages.flatMap((page) => page.statuses || page || []) || [];

    // Extract state properties directly from your first response page header metrics if available
    const isFollowingTag = data?.pages[0]?.following ?? false;

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 Top Action Navigation Header Toolbar Panel */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 select-none">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-container border border-white/5 flex items-center justify-center text-primary-container text-xl font-mono font-black shadow-inner">
                        #
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text-primary tracking-tight">#{tagId}</h1>
                        <p className="text-xs text-text-secondary mt-0.5">Public collective channel stream tracking topic properties</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={followMutation.isPending}
                        onClick={() => followMutation.mutate({ isFollowing: isFollowingTag })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isFollowingTag
                                ? 'bg-surface-container-high border-white/5 text-text-secondary'
                                : 'bg-primary-container text-white border-primary-container crimson-glow font-black'
                            }`}
                    >
                        {isFollowingTag ? 'Pinned ✓' : 'Pin Tag'}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-surface-container border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer">Back</button>
                </div>
            </div>

            {/* 🥞 VIRTUALIZED CONTINUOUS FLOW MAP CANVAS */}
            {status === 'pending' ? (
                <div className="py-12 text-center"><div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin mx-auto" /></div>
            ) : posts.length === 0 ? (
                <div className="p-12 text-center border border-white/5 bg-surface-container-low/40 rounded-2xl">
                    <p className="text-sm text-text-secondary">No recorded updates registered under this hashtag coordinate yet.</p>
                </div>
            ) : (
                <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-2xl w-full">
                    <Virtuoso
                        useWindowScroll
                        data={posts}
                        endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                        overscan={400}
                        itemContent={(index, post) => (
                            <PostCard post={post} isLast={index === posts.length - 1} />
                        )}
                    />
                </div>
            )}
        </div>
    );
};
