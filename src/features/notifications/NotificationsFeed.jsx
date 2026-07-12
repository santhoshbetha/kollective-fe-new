// src/features/notifications/NotificationsFeed.jsx
import React from 'react';
import { useNotificationsQuery } from './useNotificationsQuery';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

export function NotificationsFeed() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useNotificationsQuery();

    const sentinelRef = useIntersectionObserver({
        onIntersect: fetchNextPage,
        enabled: hasNextPage && !isFetchingNextPage,
    });

    if (status === 'pending') {
        return <div className="py-12 text-center text-text-secondary font-medium">Synchronizing your alerts...</div>;
    }

    if (status === 'error') {
        return <div className="py-12 text-center text-rose-500 font-medium">Failed to retrieve notification logs.</div>;
    }

    const notifications = data?.pages.flatMap((page) => page.notifications || []) || [];

    // Helper dictionary mapping notification actions to UI icons and colors
    const typeConfigs = {
        like: { icon: 'favorite', style: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
        bookmark: { icon: 'bookmark', style: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
        follow: { icon: 'person_add', style: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
        mention: { icon: 'alternate_email', style: 'text-primary-container bg-primary-container/10 border-primary-container/20' },
        jury_assignment: { icon: 'gavel', style: 'text-rose-500 bg-rose-500/10 border-rose-500/20 font-bold' }
    };

    return (
        <div className="notifications-feed w-full flex flex-col gap-4">
            {notifications.length === 0 ? (
                <div className="py-16 text-center text-text-secondary/60 bg-surface-container-low border border-white/5 rounded-2xl p-8">
                    <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">notifications_off</span>
                    <p className="font-medium">Your notification stream is quiet.</p>
                </div>
            ) : (
                <div className="notifications-list flex flex-col gap-3">
                    {notifications.map((notif) => {
                        const config = typeConfigs[notif.type] || { icon: 'info', style: 'text-text-secondary bg-white/5 border-white/10' };

                        return (
                            <article
                                key={notif.id}
                                className={`flex items-start gap-4 bg-surface-container-low border p-5 rounded-2xl transition-colors hover:bg-surface-container-high/40 ${notif.unread ? 'border-primary-container/30 bg-primary-container/5' : 'border-white/5'
                                    }`}
                            >
                                {/* Variant Status Icon badge indicator */}
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${config.style}`}>
                                    <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-text-primary text-sm truncate">{notif.actorName}</span>
                                        <span className="text-text-secondary text-xs truncate">{notif.actorHandle}</span>
                                        <span className="text-text-secondary/40 text-xs ml-auto shrink-0">{notif.timeAgo}</span>
                                    </div>
                                    <p className="text-text-secondary text-body-md leading-relaxed">{notif.message}</p>

                                    {notif.targetContent && (
                                        <blockquote className="mt-2 pl-4 border-l-2 border-white/10 text-text-secondary/70 text-sm italic line-clamp-2">
                                            "{notif.targetContent}"
                                        </blockquote>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* 🛑 INFINITE SCROLL SENTINEL CONTAINER */}
            <div ref={sentinelRef} className="infinite-scroll-sentinel py-8 flex items-center justify-center w-full">
                {isFetchingNextPage && (
                    <p className="loading-more-text text-text-secondary text-sm font-medium flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full"></span>
                        Syncing alerts log...
                    </p>
                )}
                {!hasNextPage && notifications.length > 0 && (
                    <p className="end-of-feed-text text-text-secondary/50 text-sm font-medium">
                        You have reviewed your full notification history.
                    </p>
                )}
            </div>
        </div>
    );
}
