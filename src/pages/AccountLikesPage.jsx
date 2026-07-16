// src/pages/AccountLikesPage.jsx
import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useAccountLikesQuery } from '../features/profile/useLikesFeature';
import { PostCard } from '../features/timeline/PostCard';

export const AccountLikesPage = () => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAccountLikesQuery();
    const likedPosts = data?.pages.flatMap((page) => page.statuses || page || []) || [];

    if (status === 'pending') {
        return (
            <div className="pt-32 text-center flex flex-col items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary/40">Loading liked indexes...</span>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4 select-none">
                <h1 className="text-2xl font-black text-text-primary tracking-tight">Favourited Pulses</h1>
                <p className="text-xs text-text-secondary mt-0.5">Chronological storage mapping tracking signatures you have liked across the node.</p>
            </div>

            {likedPosts.length === 0 ? (
                <div className="p-12 text-center border border-white/5 bg-surface-container-low/40 rounded-2xl">
                    <p className="text-sm text-text-secondary">No favorites documented across this directory yet.</p>
                </div>
            ) : (
                <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-2xl w-full">
                    <Virtuoso
                        useWindowScroll
                        data={likedPosts}
                        endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                        overscan={400}
                        itemContent={(index, post) => (
                            <PostCard post={post} isLast={index === likedPosts.length - 1} />
                        )}
                    />
                </div>
            )}
        </div>
    );
};
