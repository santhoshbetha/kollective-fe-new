// src/features/notifications/NotificationsFeed.jsx
import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import {
    useNotificationsQuery,
    useMarkNotificationsRead,
    useToggleFollowUser
} from './useNotificationsFeature';

export function NotificationsFeed() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useNotificationsQuery();
    const toggleFollowUser = useToggleFollowUser();

    // Flatten infinite scroll data layers into a unified array map
    const notifications = data?.pages.flatMap((page) => page.notifications || []) || [];

    const handleFollowBack = (username) => {
        toggleFollowUser.mutate(username);
    };

    if (status === 'pending') {
        return (
            <div className="max-w-3xl mx-auto py-12 flex justify-center items-center">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
            </div>
        );
    }

    if (status === 'error') {
        return <div className="text-center py-12 text-rose-500 font-bold border border-white/5 rounded-2xl">Failed to synchronize alerts.</div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-surface-container-low shadow-2xl animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">notifications</span>
                <h3 className="font-bold text-text-primary mb-2 text-lg">No notifications yet</h3>
                <p className="text-text-secondary text-sm">We'll let you know when something exciting happens!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <Virtuoso
                useWindowScroll
                data={notifications}
                endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                overscan={400}
                itemContent={(index, n) => {
                    const hasLeftBar = n.unread;
                    return (
                        <div className="pb-4">
                            <div className={`glass-panel rounded-2xl p-6 border relative overflow-hidden transition-all duration-300 flex items-start gap-4 ${hasLeftBar ? 'border-l-4 border-l-primary-container border-white/10 bg-primary-container/5' : 'border-white/5 bg-surface-container-low'
                                }`}>
                                {/* Visual Accent for Unread Notification */}
                                {n.unread && <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-primary-container"></div>}

                                {/* Avatar / Icon Element */}
                                {n.user ? (
                                    <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 p-[1px] ${hasLeftBar ? 'border-primary-container' : 'border-white/10'}`}>
                                        <img alt={n.user.name} className="w-full h-full rounded-full object-cover" src={n.user.avatar} />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest border border-white/5 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-primary-container">
                                            {n.type === 'event' ? 'calendar_month' : 'notifications'}
                                        </span>
                                    </div>
                                )}

                                {/* Content Message Board Block */}
                                <div className="flex-1 space-y-1 min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="min-w-0">
                                            {n.type === 'like' && (
                                                <p className="text-md text-text-primary">
                                                    <strong className="font-bold">{n.user.name}</strong> liked your post <span className="text-primary-container font-semibold italic">"{n.postTitle}"</span>
                                                </p>
                                            )}
                                            {n.type === 'follow' && (
                                                <p className="text-md text-text-primary"><strong className="font-bold">{n.user.name}</strong> started following you</p>
                                            )}
                                            {n.type === 'comment' && (
                                                <p className="text-md text-text-primary"><strong className="font-bold">{n.user.name}</strong> commented on your pulse</p>
                                            )}
                                            {n.type === 'event' && <p className="text-md text-text-primary font-bold">Event starting soon: {n.title}</p>}
                                            {n.type === 'highlight' && (
                                                <p className="text-md text-text-primary"><strong className="font-bold">{n.user.name}</strong> {n.title}</p>
                                            )}

                                            {n.description && <p className="text-sm text-text-secondary mt-0.5">{n.description}</p>}
                                            {n.commentText && (
                                                <blockquote className="border-l-2 border-white/10 pl-3 py-0.5 mt-2 text-sm text-text-secondary italic">
                                                    "{n.commentText}"
                                                </blockquote>
                                            )}
                                        </div>
                                        <span className="text-xs text-text-secondary whitespace-nowrap shrink-0">{n.time}</span>
                                    </div>

                                    {/* Actions / Status Badges Row */}
                                    <div className="pt-2 flex items-center gap-3">
                                        {n.type === 'like' && (
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-primary-container bg-primary-container/10 border border-primary-container/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                New Like
                                            </span>
                                        )}
                                        {n.type === 'comment' && (
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-text-primary bg-surface-container-high border border-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-[12px]">chat_bubble</span>
                                                Comment
                                            </span>
                                        )}
                                        {n.type === 'highlight' && (
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-text-secondary bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                Community Highlight
                                            </span>
                                        )}
                                        {n.type === 'follow' && (
                                            <button
                                                onClick={() => handleFollowBack(n.user.name)}
                                                disabled={toggleFollowUser.isPending}
                                                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer border ${n.following ? 'bg-surface-container-high border-white/5 text-text-secondary' : 'bg-primary-container text-white border-primary-container crimson-glow'
                                                    }`}
                                            >
                                                {n.following ? 'Following ✓' : 'Follow Back'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }}
                components={{
                    Footer: () => isFetchingNextPage && (
                        <div className="py-8 flex flex-col items-center gap-4 border-t border-white/5 bg-[#141414]">
                            <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Loading older notifications</p>
                        </div>
                    )
                }}
            />
        </div>
    );
}
