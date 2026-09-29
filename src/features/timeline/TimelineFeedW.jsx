// src/features/timeline/TimelineFeed.jsx
import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useHomeTimeline } from './useHomeTimeline';
import { useStore } from '../../store/useStore';
import { useFiltersQuery } from '../filters/useFiltersFeature';
import { PostCard } from './PostCard';
import { PostCardX2 } from './PostCardX2';
import { usePostsStore } from '../../store/usePostsStore';

import { useAuthStore } from '../../store/auth/useAuthStore';
import { processFeedPosts } from '../../utils/feedUtils';

export function TimelineFeedW() {
    const queryClient = useQueryClient();
    const { data: activeFilters } = useFiltersQuery();
    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    // 🎛️ Read the active tab out of your global Zustand store
    const activeTab = useStore((state) => state.homeFeedTab);

    const followingCount = currentUser?.following_count ?? currentUser?.followingCount ?? activeAccount?.following_count ?? activeAccount?.followingCount ?? 0;

    // 🔄 Fetch the infinite scroll data for this specific active tab
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useHomeTimeline();

    // 📡 Real-time Push Staging Buffer Query
    const { data: bufferedPosts = [] } = useQuery({
        queryKey: ['timeline', 'home', activeTab, 'buffer'],
        queryFn: () => [],
        staleTime: Infinity,
    });

    const unreadCount = bufferedPosts?.length || 0;

    // 1. Process items directly using useMemo to force a reference change when data changes
    const filteredPosts = useMemo(() => {
        const allPosts = data?.pages?.flatMap((page) => page?.posts || []) || [];

        // Ensure processFeedPosts returns a shallow copy [...result] 
        const processed = processFeedPosts(allPosts, {
            currentUser,
            activeAccount,
            activeFilters,
            isProfilePage: false,
        });

        if (activeTab === 'Voices') {
            return processed.filter(
                (p) => p.category === 'voice' || p.category === 'voices' || p.isVoice || p.type === 'voice'
            );
        }

        return processed;
    }, [data?.pages, currentUser, activeAccount, activeFilters, activeTab]);

    // 2. Safely sync background store as a fire-and-forget side effect (DO NOT READ FROM THIS FOR THIS RENDER)
    useEffect(() => {
        const allPosts = data?.pages?.flatMap((page) => page?.posts || []) || [];
        if (allPosts.length > 0) {
            usePostsStore.getState().importFetchedPosts(allPosts);
        }
    }, [data?.pages]);

    console.log("filteredPosts:::", filteredPosts);

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

                {activeTab === 'Following' && followingCount === 0 ? (
                    /* 👤 Following Tab Prompt when user follows 0 accounts */
                    <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-amber-500 mb-1">person_add</span>
                        <h3 className="font-bold text-text-primary text-lg">No followed users yet</h3>
                        <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                            You are not following anyone yet. Discover creators, journalists, and circles across the feed to see their pulses here!
                        </p>
                    </div>
                ) : filteredPosts?.length === 0 ? (
                    /* 🌌 Empty State Panel Container */
                    <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-text-secondary mb-1">
                            {activeTab === 'Following' ? 'group_off' : 'feed'}
                        </span>
                        <h3 className="font-bold text-text-primary text-lg">
                            {activeTab === 'Following' ? 'No recent pulses from followed users' : 'No pulses found'}
                        </h3>
                        <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                            {activeTab === 'Following'
                                ? "The creators you follow haven't posted recently."
                                : `No activity under the "${activeTab}" category yet. Be the first to share your voice!`}
                        </p>
                    </div>
                ) : (
                    /* 🏆 Your Custom Structured List Border Wrapping Shell */
                    <div className="flex flex-col border border-[#262626] bg-transparent overflow-hidden shadow-2xl">
                        {unreadCount > 0 && (
                            <div className="sticky top-[88px] z-30 w-full flex justify-center mb-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
                                <button
                                    onClick={() => {
                                        // 1. Fetch the items hidden inside the query client buffer cache array
                                        const bufferKey = ['timeline', 'home', activeTab, 'buffer'];
                                        const bufferedData = queryClient.getQueryData(bufferKey) || [];

                                        if (bufferedData.length > 0) {
                                            // 2. Prep them to prepend or overwrite your active global state layer
                                            usePostsStore.getState().importFetchedPosts(bufferedData);

                                            // 3. Wipe out the staging query buffer back to an empty array target state
                                            queryClient.setQueryData(bufferKey, []);

                                            // 4. Force a hard re-sync scroll top layout alignment back to the view crown
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }
                                    }}
                                    className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-primary-container text-white text-sm font-bold rounded-full shadow-lg hover:brightness-110 active:scale-95 transition-all border border-white/10"
                                >
                                    <span className="material-symbols-outlined text-[18px] animate-bounce">
                                        arrow_upward
                                    </span>
                                    <span>View {unreadCount} new {unreadCount === 1 ? 'pulse' : 'pulses'}</span>
                                </button>
                            </div>
                        )}
                        <Virtuoso
                            useWindowScroll
                            data={filteredPosts}
                            computeItemKey={(index, post) => post?.id || index}
                            initialItemCount={filteredPosts.length > 0 ? Math.min(filteredPosts.length, 4) : 0}

                            /* 
                               🚀 Fluidity Trick: Tell Virtuoso to render hidden content 400px *ahead* 
                               of the viewport bottom. This will fire endReached early, pulling data 
                               before the user reaches the absolute bottom.
                            */
                            increaseViewportBy={400}

                            endReached={() => {
                                if (hasNextPage && !isFetchingNextPage) {
                                    fetchNextPage();
                                }
                            }}

                            // Keep overscan low/moderate if increaseViewportBy is active to manage DOM weight
                            overscan={200}

                            itemContent={(index, post) => (
                                <PostCard key={post?.id || index} post={post} isLast={index === filteredPosts.length - 1} />
                            )}
                            components={{
                                Footer: () => (
                                    <>
                                        {isFetchingNextPage && (
                                            <div className="py-12 flex flex-col items-center gap-4 border-t border-white/5 bg-[#141414]">
                                                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                                                <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
                                                    Loading older pulses
                                                </p>
                                            </div>
                                        )}
                                        {!hasNextPage && filteredPosts.length > 0 && (
                                            <div className="py-8 text-center bg-[#141414]">
                                                <p className="text-xs text-text-secondary uppercase tracking-wider italic opacity-60">
                                                    You've caught up with everything.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )
                            }}
                        />
                    </div>
                )}
            </div>
        </PullToRefresh>
    );
}
