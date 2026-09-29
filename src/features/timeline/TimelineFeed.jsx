import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useHomeTimeline } from './useHomeTimeline';
import { useStore } from '../../store/useStore';
import { useFiltersQuery } from '../filters/useFiltersFeature';
import { PostCard } from './PostCard';
import { usePostsStore } from '../../store/usePostsStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { processFeedPosts } from '../../utils/feedUtils';

export function TimelineFeed() {
    const queryClient = useQueryClient();
    const { data: activeFilters } = useFiltersQuery();
    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    // 🎛️ Dynamic active feed channel pointer from your global state
    const activeTab = useStore((state) => state.homeFeedTab);

    const followingCount = currentUser?.following_count ?? currentUser?.followingCount ?? activeAccount?.following_count ?? activeAccount?.followingCount ?? 0;

    // 🔄 Infinite Query pagination data hook streams
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
    // 🚀 UNIFIED FILTERS PROCESSING LAYER
    const filteredPosts = useMemo(() => {
        const allPosts = data?.pages?.flatMap((page) => page?.posts || []) || [];

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

    // Reconcile background store normalization maps cleanly on data updates
    useEffect(() => {
        const allPosts = data?.pages?.flatMap((page) => page?.posts || []) || [];
        if (allPosts.length > 0) {
            usePostsStore.getState().importFetchedPosts(allPosts);
        }
    }, [data?.pages]);

    // Sync real-time unread buffer counts directly onto the browser layout header title strings
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
        queryClient.setQueryData(['timeline', 'home', activeTab, 'buffer'], []);
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
                    index === 0 ? { ...page, posts: [...bufferedPosts, ...page?.posts] } : page
                ),
            };
        });

        // Clear staging query buffer cache instantly
        queryClient.setQueryData(['timeline', 'home', activeTab, 'buffer'], []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const PostSkeleton = () => (
        <div className="glass-card rounded-[16px] p-6 border border-white/5 animate-pulse flex flex-col gap-4 bg-[#141414]">
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
        </div>
    );

    if (status === 'pending') {
        return (
            <div className="flex flex-col gap-6 p-4">
                <PostSkeleton />
                <PostSkeleton />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center py-12 text-rose-500 font-bold border border-white/5 rounded-2xl bg-[#141414]">
                Failed to synchronize updates.
            </div>
        );
    }
    return (
        <PullToRefresh
            onRefresh={handleRefreshGesture}
            pullingContent=""
            backgroundColor="transparent"
            maxPullDownDistance={90}
        >
            <div className="w-full flex flex-col p-4">

                {/* 🔔 Dynamic real-time staging banner alert */}
                {unreadCount > 0 && (
                    <button
                        className="unread-banner w-full bg-primary-container text-white border border-primary-container crimson-glow font-bold py-3.5 px-4 rounded-xl mb-6 transition-all hover:brightness-110 flex items-center justify-center gap-2 shadow-md animate-in fade-in slide-in-from-top duration-200 cursor-pointer border-none"
                        onClick={handleFlushBuffer}
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                        View {unreadCount} new pulses on {activeTab}
                    </button>
                )}

                {activeTab === 'Following' && followingCount === 0 ? (
                    <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-amber-500 mb-1">person_add</span>
                        <h3 className="font-bold text-text-primary text-lg">No followed users yet</h3>
                        <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                            You are not following anyone yet. Discover creators, journalists, and circles across the feed to see their pulses here!
                        </p>
                    </div>
                ) : filteredPosts?.length === 0 ? (
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
                    /* 🏆 Performant Viewport Boundary Shell Container */
                    <div className="flex flex-col border border-[#262626] bg-transparent overflow-hidden shadow-2xl relative">

                        {/* Sticky top tracking floating bubble shortcut button pill wrapper */}
                        {unreadCount > 0 && (
                            <div className="sticky top-[88px] z-30 w-full flex justify-center mb-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
                                <button
                                    onClick={handleFlushBuffer}
                                    className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-primary-container text-white text-sm font-bold rounded-full shadow-lg hover:brightness-110 active:scale-95 transition-all border border-white/10 cursor-pointer"
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
                            initialItemCount={filteredPosts.length > 0 ? Math.min(filteredPosts.length, 5) : 0}
                            increaseViewportBy={400}
                            overscan={200}
                            endReached={() => {
                                if (hasNextPage && !isFetchingNextPage) {
                                    fetchNextPage();
                                }
                            }}
                            itemContent={(index, post) => (
                                <PostCard
                                    post={post}
                                    isLast={index === filteredPosts.length - 1}
                                />
                            )}
                            components={{
                                Footer: () => (
                                    <>
                                        {isFetchingNextPage && (
                                            <div className="py-12 flex flex-col items-center gap-4 border-t border-white/5 bg-[#141414]">
                                                <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                                                <p className="text-text-secondary text-xs font-bold uppercase tracking-widest font-mono">
                                                    Synchronizing older pagination parameters...
                                                </p>
                                            </div>
                                        )}
                                        {!hasNextPage && filteredPosts.length > 0 && (
                                            <div className="py-8 text-center bg-[#141414] border-t border-white/5">
                                                <p className="text-xs text-text-secondary font-mono uppercase tracking-wider italic opacity-40">
                                                    // TIMELINE_END: Catch-up matrices complete.
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
