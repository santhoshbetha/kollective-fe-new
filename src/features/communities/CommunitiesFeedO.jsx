// src/pages/CommunitiesPage.jsx (Part 1 of 2)
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCommunitiesFeed } from './useCommunitiesFeed';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useStore } from '@/store/useStore';

export function CommunitiesFeedO() {
    const queryClient = useQueryClient();

    // 🎛️ Pull geo-scope variables and action setters from your original useStore
    const activeTab = useStore((state) => state.communitiesTab);
    const setCommunitiesTab = useStore((state) => state.setCommunitiesTab);

    // 🔄 Fetch paginated circles matching this specific active scope
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useCommunitiesFeed();

    // 🔔 Read the real-time push buffer linked specifically to this geo-scope
    const { data: bufferedCircles = [] } = useQuery({
        queryKey: ['communities', 'feed', activeTab, 'buffer'],
        queryFn: () => [],
        staleTime: Infinity,
    });

    const unreadCount = bufferedCircles.length;

    // 🚀 Attach our non-blocking infinite scroll node
    const sentinelRef = useIntersectionObserver({
        onIntersect: fetchNextPage,
        enabled: hasNextPage && !isFetchingNextPage,
    });

    const tabOptions = ['Local', 'State', 'Country', 'World'];

    // 🔄 Flush buffered items directly into page 0 of the active geo-scope cache
    const handleFlushBuffer = () => {
        if (unreadCount === 0) return;

        queryClient.setQueryData(['communities', 'feed', activeTab], (oldData) => {
            if (!oldData) return oldData;

            return {
                ...oldData,
                pages: oldData.pages.map((page, index) =>
                    index === 0
                        ? { ...page, items: [...bufferedCircles, ...page.items] }
                        : page
                ),
            };
        });

        // 🧼 Zero out just this tab's dynamic buffer cache key
        queryClient.setQueryData(['communities', 'feed', activeTab, 'buffer'], []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="communities-container w-full max-w-5xl mx-auto flex flex-col gap-6">

            {/* 🧭 Sub-Navigation Scope Header */}
            <div className="flex flex-col gap-4 border-b border-white/5 pb-2">
                <div>
                    <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">Circles</h2>
                    <p className="text-text-secondary text-body-sm">Explore and coordinate across geometric geographic scales.</p>
                </div>

                {/* Tab Controls */}
                <div className="flex gap-2 bg-surface-container-lowest p-1.5 rounded-xl border border-white/5 w-fit">
                    {tabOptions.map((tab) => {
                        const isSelected = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setCommunitiesTab(tab)}
                                className={`px-5 py-2.5 rounded-lg text-label-md font-bold transition-all duration-200 active:scale-95 cursor-pointer ${isSelected
                                    ? 'bg-primary-container text-white shadow-md shadow-primary-container/20'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-high/40'
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 🔔 Real-time Contextual Scope Update Banner */}
            {unreadCount > 0 && (
                <button
                    onClick={handleFlushBuffer}
                    className="unread-banner w-full bg-primary-container text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.99] shadow-md shadow-primary-container/10 animate-in fade-in slide-in-from-top duration-200"
                >
                    <span className="material-symbols-outlined text-[18px]">update</span>
                    See {unreadCount} new {unreadCount === 1 ? 'circle' : 'circles'} in {activeTab}
                </button>
            )}

            {/* 🚨 API Connection Query Status Guards */}
            {status === 'pending' && (
                <div className="py-12 text-center text-text-secondary font-medium">Loading {activeTab} circles...</div>
            )}

            {status === 'error' && (
                <div className="py-12 text-center text-rose-500 font-medium">Failed to synchronize communities.</div>
            )}

            {/* 🏙️ Main Community Grid/List Stream */}
            {status === 'success' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.pages.flatMap((page) => page.items || []).map((circle) => (
                        <article
                            key={circle.id}
                            className="group bg-surface-container-low border border-white/5 p-6 rounded-2xl shadow-sm transition-all duration-200 hover:bg-surface-container-high/40 hover:border-white/10 cursor-pointer flex flex-col gap-3"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest border border-white/5 flex items-center justify-center text-primary-container text-xl font-bold group-hover:scale-105 transition-transform">
                                        {circle.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-title-md text-text-primary group-hover:text-primary-container transition-colors font-extrabold">{circle.name}</h3>
                                        <p className="text-text-secondary text-label-sm">{circle.membersCount} members</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-text-secondary text-body-md line-clamp-2 leading-relaxed">{circle.description}</p>
                        </article>
                    ))}
                </div>
            )}

            {/* 🛑 THE INFINITE SCROLL SENTINEL NODE */}
            <div ref={sentinelRef} className="infinite-scroll-sentinel py-8 flex items-center justify-center w-full">
                {isFetchingNextPage && (
                    <p className="loading-more-text text-text-secondary text-sm font-medium flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full"></span>
                        Discovering more areas...
                    </p>
                )}
                {!hasNextPage && data?.pages?.[0]?.items?.length > 0 && (
                    <p className="end-of-feed-text text-text-secondary/50 text-sm font-medium">
                        You have discovered all circles mapped to {activeTab}.
                    </p>
                )}
            </div>
        </div>
    );
}
