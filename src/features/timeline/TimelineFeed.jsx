// features/timeline/TimelineFeed.jsx (Part 1 of 2)
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useHomeTimeline } from './useHomeTimeline';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useStore } from '../../store/useStore';

export function TimelineFeed() {
    const queryClient = useQueryClient();

    // 🎛️ Read the active tab out of your global Zustand store
    const activeTab = useStore((state) => state.homeFeedTab);

    // 🔄 Fetch the infinite scroll data for this specific active tab
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useHomeTimeline();

    // 🔔 READ THE BUFFER KEY LINKED SPECIFICALLY TO THIS ACTIVE TAB
    const { data: bufferedPosts = [] } = useQuery({
        queryKey: ['timeline', 'home', activeTab, 'buffer'],
        queryFn: () => [],
        staleTime: Infinity, // Prevent automatic background refetching on the local array
    });

    const unreadCount = bufferedPosts.length;

    // 🪟 Sync unread counts with the browser tab title (e.g., "(3) Kollective")
    useEffect(() => {
        const baseTitle = 'Kollective';
        if (unreadCount > 0) {
            const displayCount = unreadCount >= 50 ? '50+' : unreadCount;
            document.title = `(${displayCount}) ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
        return () => { document.title = baseTitle; };
    }, [unreadCount]);

    // 🚀 CONNECT THE INFINITE SCROLLER SENTINEL
    const sentinelRef = useIntersectionObserver({
        onIntersect: fetchNextPage,
        enabled: hasNextPage && !isFetchingNextPage,
    });
    // features/timeline/TimelineFeed.jsx (Part 2 of 2)

    // 🔄 Flush the tab-specific staging buffer into the active feed page array
    const handleFlushBuffer = () => {
        if (unreadCount === 0) return;

        queryClient.setQueryData(['timeline', 'home', activeTab], (oldTimelineData) => {
            if (!oldTimelineData) return oldTimelineData;

            return {
                ...oldTimelineData,
                pages: oldTimelineData.pages.map((page, index) =>
                    index === 0
                        ? { ...page, posts: [...bufferedPosts, ...page.posts] }
                        : page
                ),
            };
        });

        // 🧼 Clear out this tab's specific buffer cache key instantly
        queryClient.setQueryData(['timeline', 'home', activeTab, 'buffer'], []);

        // Smooth scroll the viewport back to the top of the timeline
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 🛑 API Query Status Guards
    if (status === 'pending') {
        return <div className="timeline-spinner p-6 text-center text-text-secondary">Loading your feed...</div>;
    }

    if (status === 'error') {
        return <div className="timeline-error p-6 text-center text-rose-500">Failed to fetch updates.</div>;
    }

    return (
        <div className="timeline-container w-full flex flex-col">

            {/* 🔔 Tab-Specific Unread Notification Banner */}
            {unreadCount > 0 && (
                <button
                    className="unread-banner w-full bg-primary-container text-white font-bold py-3 px-4 rounded-xl mb-4 transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2 shadow-md animate-in fade-in slide-in-from-top duration-200"
                    onClick={handleFlushBuffer}
                >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                    View {unreadCount} new {unreadCount === 1 ? 'post' : 'posts'} on {activeTab}
                </button>
            )}

            {/* 📝 Main Stream Content Grid */}
            <div className="posts-list flex flex-col gap-4">
                {data?.pages.flatMap((page) => page.posts).map((post) => (
                    <article key={post.id} className="post-card bg-surface-container-low border border-white/5 p-5 rounded-2xl shadow-sm transition-colors hover:bg-surface-container-high/40">
                        <p className="text-text-primary text-body-md leading-relaxed">{post.content}</p>
                    </article>
                ))}
            </div>

            {/* 🛑 THE INFINITE SCROLL TARGET EMBED */}
            <div ref={sentinelRef} className="infinite-scroll-sentinel py-8 flex items-center justify-center w-full">
                {isFetchingNextPage && (
                    <p className="loading-more-text text-text-secondary text-sm font-medium flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full"></span>
                        Fetching older posts...
                    </p>
                )}
                {!hasNextPage && data?.pages?.[0]?.posts?.length > 0 && (
                    <p className="end-of-feed-text text-text-secondary/60 text-sm font-medium">
                        You have caught up with everything on {activeTab}!
                    </p>
                )}
            </div>
        </div>
    );
}
