// src/features/events/EventsFeed.jsx
import React from 'react';
import { useEventsQuery } from './useEventsQuery';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

export function EventsFeed() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useEventsQuery();

    // Attach our non-blocking native scroll observer sentinel node
    const sentinelRef = useIntersectionObserver({
        onIntersect: fetchNextPage,
        enabled: hasNextPage && !isFetchingNextPage,
    });

    if (status === 'pending') {
        return <div className="py-12 text-center text-text-secondary font-medium">Synchronizing collective events...</div>;
    }

    if (status === 'error') {
        return <div className="py-12 text-center text-rose-500 font-medium">Failed to retrieve event calendar.</div>;
    }

    const events = data?.pages.flatMap((page) => page.events || []) || [];

    return (
        <div className="events-feed w-full flex flex-col gap-6">
            {events.length === 0 ? (
                <div className="py-16 text-center text-text-secondary/60 bg-surface-container-low border border-white/5 rounded-2xl p-8">
                    <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">calendar_today</span>
                    <p className="font-medium">No upcoming events scheduled.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((event) => (
                        <article
                            key={event.id}
                            className="group bg-surface-container-low border border-white/5 p-6 rounded-2xl shadow-sm transition-all duration-200 hover:bg-surface-container-high/40 hover:border-white/10 flex flex-col justify-between gap-4"
                        >
                            <div className="flex flex-col gap-2">
                                {/* Event Title */}
                                <h3 className="text-xl font-extrabold text-text-primary group-hover:text-primary-container transition-colors tracking-tight">
                                    {event.title}
                                </h3>

                                {/* Event Description */}
                                <p className="text-text-secondary text-body-md line-clamp-3 leading-relaxed">
                                    {event.description}
                                </p>
                            </div>

                            {/* Event Meta Metadata Footer */}
                            <div className="flex flex-col gap-1.5 pt-3 border-t border-white/5 text-label-sm text-text-secondary">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-primary-container">calendar_today</span>
                                    <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-primary-container">location_on</span>
                                    <span className="truncate">{event.location}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* 🛑 INFINITE SCROLL SENTINEL CONTAINER */}
            <div ref={sentinelRef} className="infinite-scroll-sentinel py-8 flex items-center justify-center w-full">
                {isFetchingNextPage && (
                    <p className="loading-more-text text-text-secondary text-sm font-medium flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full"></span>
                        Syncing calendar entries...
                    </p>
                )}
                {!hasNextPage && events.length > 0 && (
                    <p className="end-of-feed-text text-text-secondary/50 text-sm font-medium">
                        You have reviewed all scheduled events.
                    </p>
                )}
            </div>
        </div>
    );
}
