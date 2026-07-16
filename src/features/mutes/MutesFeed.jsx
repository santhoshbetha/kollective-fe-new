// src/features/mutes/MutesFeed.jsx
import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useMutesQuery, useUnmuteMutation } from './useMutesFeature';

export function MutesFeed() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useMutesQuery();
    const unmuteMutation = useUnmuteMutation();

    // Normalize response pages down into a flat linear stream array map
    const mutedUsers = data?.pages.flatMap((page) => page.accounts || page || []) || [];

    if (status === 'pending') {
        return (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                <p className="text-text-secondary text-xs font-mono font-bold uppercase tracking-wider animate-pulse">Syncing mutes data matrix...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="glass-card p-8 rounded-2xl text-center border border-rose-500/10 bg-surface-container-low/50 text-rose-500 font-bold text-sm">
                Failed to fetch muted accounts registration parameters.
            </div>
        );
    }

    if (mutedUsers.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-surface-container-low/40 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-3xl text-text-secondary/40 mb-2">volume_off</span>
                <p className="text-sm font-medium text-text-secondary">No muted users found</p>
                <p className="text-xs text-text-secondary/50 mt-1 max-w-xs mx-auto">Accounts you mute will appear here. You won't see their posts or notifications, but they can still interact with your public updates.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-2xl w-full">
            <Virtuoso
                useWindowScroll
                data={mutedUsers}
                endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                overscan={400}
                itemContent={(index, user) => {
                    const userHandle = user.handle || `@${user.username?.toLowerCase()}@kollective.social`;
                    const isUnmuting = unmuteMutation.isPending && unmuteMutation.variables === user.id;

                    return (
                        <div className="flex items-center justify-between p-5 border-b border-[#262626] last:border-b-0 hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Profile Image Avatar Sizing Cap */}
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#1A1616]">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-primary-container flex items-center justify-center font-bold text-white uppercase text-sm">
                                            {user.username ? user.username[0] : '?'}
                                        </div>
                                    )}
                                </div>

                                {/* Account Metadata Information Content Block */}
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-text-primary text-sm truncate">{user.acct || user.name || user.username}</span>
                                        {user.verified && <span className="material-symbols-outlined text-primary-container text-sm">verified</span>}
                                    </div>
                                    <span className="text-xs font-mono font-bold text-text-secondary/40 truncate mt-0.5">{userHandle}</span>
                                </div>
                            </div>

                            {/* Action Unmute Trigger Button Control */}
                            <button
                                type="button"
                                disabled={isUnmuting}
                                onClick={() => unmuteMutation.mutate(user.id)}
                                className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-white/5 hover:border-white/10 text-text-primary rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                            >
                                {isUnmuting ? 'Unmuting...' : 'Unmute'}
                            </button>
                        </div>
                    );
                }}
                components={{
                    Footer: () => isFetchingNextPage && (
                        <div className="py-6 flex flex-col items-center gap-2 border-t border-white/5 bg-[#141414]">
                            <span className="animate-spin w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full" />
                        </div>
                    )
                }}
            />
        </div>
    );
}
