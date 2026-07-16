// src/features/relationships/RelationshipList.jsx
import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useRelationshipsQuery, useRelationshipMutations } from './useRelationshipsFeature';

export function RelationshipList({ accountId, type }) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useRelationshipsQuery({ id: accountId, type });
    const mutation = useRelationshipMutations(accountId);

    const items = data?.pages.flatMap((p) => p.accounts || p || []) || [];

    if (status === 'pending') {
        return (
            <div className="py-12 flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="p-12 text-center border border-white/5 bg-surface-container-low/40 rounded-2xl animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-3xl text-text-secondary/30 mb-2">person_search</span>
                <p className="text-sm font-medium text-text-secondary">No connections tracked across this scope index.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-2xl w-full">
            <Virtuoso
                useWindowScroll
                data={items}
                endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                overscan={400}
                itemContent={(idx, user) => {
                    const userHandle = user.handle || `@${user.username}@kollective.social`;
                    const isProcessing = mutation.isPending && mutation.variables?.id === user.id;

                    return (
                        <div className="flex items-center justify-between p-5 border-b border-[#262626] last:border-b-0 hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#1A1616]">
                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-text-primary text-sm truncate">{user.name || user.username}</span>
                                    <span className="text-xs font-mono font-bold text-text-secondary/40 truncate">{userHandle}</span>
                                </div>
                            </div>

                            {/* 🎛️ Conditional Action Trigger Matrix Based on Row Context */}
                            <div className="flex gap-2">
                                {type === 'requests' ? (
                                    <>
                                        <button type="button" disabled={isProcessing} onClick={() => mutation.mutate({ id: user.id, action: 'authorize' })} className="px-3 py-1.5 bg-primary-container text-white text-xs font-bold rounded-lg cursor-pointer border-none shadow-md">Accept</button>
                                        <button type="button" disabled={isProcessing} onClick={() => mutation.mutate({ id: user.id, action: 'reject' })} className="px-3 py-1.5 bg-surface-container-high text-text-secondary text-xs font-bold rounded-lg cursor-pointer border-none">Deny</button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => mutation.mutate({ id: user.id, action: user.following ? 'unfollow' : 'follow' })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${user.following ? 'bg-surface-container-high border-white/5 text-text-secondary' : 'bg-primary-container text-white border-primary-container'}`}
                                    >
                                        {user.following ? 'Following' : 'Follow back'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
}
