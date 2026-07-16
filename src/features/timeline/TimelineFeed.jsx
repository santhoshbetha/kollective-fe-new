// src/features/timeline/TimelineFeed.jsx
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useHomeTimeline } from './useHomeTimeline';
import { useStore } from '../../store/useStore';
import { PostCard } from './PostCard';
import { useFiltersQuery } from '../filters/useFiltersFeature';

export function TimelineFeed() {
    const queryClient = useQueryClient();
    const { data: activeFilters } = useFiltersQuery();
    // 🎛️ Read the active tab out of your global Zustand store
    const activeTab = useStore((state) => state.homeFeedTab);

    // 🔄 Fetch the infinite scroll data for this specific active tab
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch  // Extract the native hard-reset fetch loop action tracker
    } = useHomeTimeline();

    // 🔔 READ THE BUFFER KEY LINKED SPECIFICALLY TO THIS ACTIVE TAB //TODO -- original: open this later
    // 📡 Real-time Push Staging Buffer Query
    //  const { data: bufferedPosts = [] } = useQuery({
    //      queryKey: ['timeline', 'home', activeTab, 'buffer'],
    //       queryFn: () => [],
    //      staleTime: Infinity, // Prevent automatic background refetching on the local array
    //  });

    const bufferedPosts = data?.pages?.[0]?.filter(post => {
        if (activeTab === 'All Activity') return true;
        return post?.category === activeTab;
    });

    console.log("homepage data =>", data);
    console.log("bufferedPosts =>", bufferedPosts);

    const unreadCount = bufferedPosts?.length;

    //const allPosts = data?.pages?.flatMap((page) => page?.posts || []) || []; //TODO -- original: open this later
    const allPosts = data?.pages?.[0]?.filter(post => {
        if (activeTab === 'All Activity') return true;
        return post?.category === activeTab;
    });

    const filteredPosts = allPosts?.filter((post) => {
        if (!activeFilters) return true;

        // Verify if the post content matches any active keyword mask strings
        const match = activeFilters?.find(f => post.text.toLowerCase().includes(f.title.toLowerCase()));

        if (match && match.filter_action === 'hide') {
            return false; // Drop post from screen rendering arrays completely!
        }
        return true;
    });

    // 🪟 Sync unread counts with the browser tab title (e.g., "(3) Kollective")
    // Sync tab counts to the browser window title
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

    const handleRefreshGesture = async () => {
        // 🧼 Clear out any hidden background buffer counts during a hard pull action
        queryClient.setQueryData(['timeline', 'home', activeTab, 'buffer'], []);

        // 🔄 Fire a hard refetch loop down the network pipe to fetch fresh data
        await refetch();
        return true;
    };

    const handleFlushBuffer = () => {
        if (unreadCount === 0) return;
        queryClient.setQueryData(['timeline', 'home', activeTab], (oldTimelineData) => {
            if (!oldTimelineData) return oldTimelineData;
            return {
                ...oldTimelineData,
                pages: oldTimelineData.pages?.map((page, index) =>
                    index === 0 ? { ...page, posts: [...bufferedPosts, ...page?.posts] } : p
                ),
            };
        });

        // 🧼 Clear out this tab's specific buffer cache key instantly
        queryClient.setQueryData(['timeline', 'home', activeTab, 'buffer'], []);

        // Smooth scroll the viewport back to the top of the timeline
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 💀 Your Custom Initial Skeleton Loader Component
    const PostSkeleton = () => (
        <div className="glass-card rounded-[16px] p-6 border border-white/5 animate-pulse flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest/20"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container-highest/20 rounded w-1/4"></div>
                    <div className="h-3 bg-surface-container-highest/10 rounded w-1/6"></div>
                </div>
            </div>
            <div className="space-y-2 mt-2">
                <div className="h-4 bg-surface-container-highest/20 rounded w-full"></div>
                <div className="h-4 bg-surface-container-highest/20 rounded w-5/6"></div>
            </div>
            <div className="h-4 bg-surface-container-highest/10 rounded-xl mt-2 py-24"></div>
        </div>
    );

    if (status === 'pending') {
        return (
            <div className="flex flex-col gap-6">
                <PostSkeleton />
                <PostSkeleton />
            </div>
        );
    }

    if (status === 'error') {
        return <div className="text-center py-12 text-rose-500 font-bold border border-white/5 rounded-2xl">Failed to synchronize updates.</div>;
    }

    return (
        <PullToRefresh
            onRefresh={handleRefreshGesture}
            pullingContent="" // Disables default plain text headers to preserve clean UI
            backgroundColor="transparent"
            maxPullDownDistance={90}
        >
            <div className="w-full flex flex-col">
                {/* 🔔 Dynamic real-time staging banner alert */}
                {unreadCount > 0 && (
                    <button
                        className="unread-banner w-full bg-primary-container text-white border border-primary-container crimson-glow font-bold py-3.5 px-4 rounded-xl mb-6 transition-all hover:brightness-110 flex items-center justify-center gap-2 shadow-md animate-in fade-in slide-in-from-top duration-200 cursor-pointer"
                        onClick={handleFlushBuffer}
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                        View {unreadCount} new pulses on {activeTab}
                    </button>
                )}

                {filteredPosts?.length === 0 ? (
                    /* 🌌 Empty State Panel Container */
                    <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414]">
                        <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">feed</span>
                        <h3 className="font-bold text-text-primary mb-2 text-lg">No pulses found</h3>
                        <p className="text-text-secondary text-sm">
                            No activity under the "{activeTab}" category yet. Be the first to share your voice!
                        </p>
                    </div>
                ) : (
                    /* 🏆 Your Custom Structured List Border Wrapping Shell */
                    <div className="flex flex-col border border-[#262626] bg-[#141414] overflow-hidden shadow-2xl">
                        <Virtuoso
                            useWindowScroll
                            data={allPosts}
                            endReached={() => {
                                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                            }}
                            overscan={400}
                            itemContent={(index, post) => (
                                <PostCard key={index} post={post} isLast={index === filteredPosts.length - 1} />
                            )}
                            components={{
                                Footer: () => isFetchingNextPage && (
                                    <div className="py-12 flex flex-col items-center gap-4 border-t border-white/5 bg-[#141414]">
                                        <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                                        <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
                                            Loading older pulses
                                        </p>
                                    </div>
                                )
                            }}
                        />
                    </div>
                )}
            </div>
        </PullToRefresh>
    );
}
