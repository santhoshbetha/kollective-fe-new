// src/pages/FollowedTagsPage.jsx
import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useFollowedTagsQuery, useRelationshipMutations } from '../features/relationships/useRelationshipsFeature';

export const FollowedTagsPage = () => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useFollowedTagsQuery();
    const mutation = useRelationshipMutations();

    const tags = data?.pages.flatMap((p) => p.tags || p || []) || [];

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4">
                <h1 className="text-2xl font-black text-text-primary tracking-tight">Followed Metadata Tags</h1>
                <p className="text-xs text-text-secondary mt-0.5">Tracked automated topic keywords curated into your main timeline channels.</p>
            </div>

            {status === 'pending' ? (
                <div className="text-center py-12"><span className="animate-spin inline-block w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full" /></div>
            ) : tags.length === 0 ? (
                <div className="p-12 text-center border border-white/5 bg-surface-container-low/40 rounded-2xl">
                    <p className="text-sm text-text-secondary">No catalogued hashtags pinned yet.</p>
                </div>
            ) : (
                <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-2xl w-full">
                    <Virtuoso
                        useWindowScroll
                        data={tags}
                        endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                        itemContent={(idx, tag) => (
                            <div className="flex items-center justify-between p-5 border-b border-[#262626] last:border-b-0">
                                <span className="font-mono font-bold text-sm text-primary-container">#{tag.name}</span>
                                <button
                                    type="button"
                                    onClick={() => mutation.mutate({ id: tag.name, action: 'unfollow-tag' })}
                                    className="px-3 py-1.5 bg-surface-container-high border border-white/5 text-text-primary text-xs font-bold rounded-lg cursor-pointer"
                                >
                                    Unfollow
                                </button>
                            </div>
                        )}
                    />
                </div>
            )}
        </div>
    );
};
