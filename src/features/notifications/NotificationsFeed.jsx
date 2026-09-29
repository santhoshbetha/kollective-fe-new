// src/features/notifications/NotificationsFeed.jsx
import React, { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useNotificationsQuery } from './useNotificationsFeature';
import { NotificationRow } from './NotificationRow';
import { Bell } from 'lucide-react';

export function NotificationsFeed() {
    // Connects our real-time WebSocket coupled network polling query channel
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useNotificationsQuery();

    // 🚀 PERFORMANCE FIX: Memoize infinite layers to stop scroll stuttering re-render loops
    const notifications = useMemo(() => {
        return data?.pages?.flatMap((page) => page?.notifications || page?.data || (Array.isArray(page) ? page : [])) || [];
    }, [data?.pages]);

    if (status === 'pending') {
        return (
            <div className="max-w-3xl mx-auto py-20 flex flex-col items-center justify-center gap-4 font-mono text-xs text-text-secondary/40 select-none">
                <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                <p className="uppercase tracking-widest animate-pulse">// ACCESSING_ALERT_REGISTRIES...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center py-12 text-red-400 font-mono text-xs border border-white/5 bg-[#141414] rounded-2xl max-w-3xl mx-auto select-none uppercase tracking-wider">
                // ERROR_CRITICAL_FAILED_TO_SYNCHRONIZE_ALERTS
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-surface-container-low shadow-2xl animate-in fade-in duration-200 font-sans select-none text-left">
                <Bell className="w-8 h-8 text-text-secondary/40 mb-4 block" />
                <h3 className="font-bold text-text-primary mb-1 text-xl">No notifications yet</h3>
                <p className="text-text-secondary text-md font-medium max-w-sm font-sans leading-relaxed">
                    We'll let you know when something exciting happens inside your network coordinate coordinate mesh!
                </p>
            </div>
        );
    }

    return (
        <div className="w-full relative">
            {/* 🏆 PERFORMANCE VIEWPORT: Hardware accelerated virtual rows list rendering */}
            <Virtuoso
                useWindowScroll
                data={notifications}
                computeItemKey={(index, item) => item?.id || index}
                increaseViewportBy={350}
                overscan={150}

                endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}

                components={{
                    List: React.forwardRef(({ children, style, ...props }, ref) => (
                        <div
                            {...props}
                            ref={ref}
                            style={{ ...style }}
                            className="flex flex-col w-full"
                        >
                            {children}
                        </div>
                    )),
                    Item: React.forwardRef(({ children, ...props }, ref) => (
                        <div {...props} ref={ref} className="w-full bg-transparent">
                            {children}
                        </div>
                    )),
                    Footer: () => isFetchingNextPage && (
                        /* ⏳ Infinite Page Append Loading Row Blocks */
                        <div className="py-8 flex flex-col items-center gap-3 border-t border-white/5 font-mono text-[10px] text-text-secondary/30 select-none">
                            <div className="w-5 h-5 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                            <p className="uppercase tracking-widest animate-pulse">// RETRIEVING_OLDER_LOGS...</p>
                        </div>
                    )
                }}

                // 🚀 FIXED IDENTITY KEYS: Employs specific ID checking parameters to freeze DOM state leaking
                itemContent={(index, item) => (
                    <div className="w-full animate-in fade-in duration-100">
                        <NotificationRow item={item} />
                    </div>
                )}
            />
        </div>
    );
}
