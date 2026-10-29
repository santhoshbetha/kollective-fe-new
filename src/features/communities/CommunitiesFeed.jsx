import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useStore } from '../../store/useStore';
import { useCommunitiesFeed } from './useCommunitiesFeed';
import { PostCard } from '../../components/posts/PostCard';
import { usePostsStore } from '../../store/usePostsStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { processFeedPosts } from '../../utils/feedUtils';
import { getFeedScrollTarget, clearFeedScrollTarget } from '../../utils/feedScrollManager';

export function CommunitiesFeed() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const activeTab = useStore((state) => state.communitiesTab);
    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    const userState = currentUser?.state || currentUser?.political_location?.state || activeAccount?.state;
    const userStreetAddress =
        currentUser?.street_address ||
        currentUser?.street ||
        currentUser?.address ||
        currentUser?.district_l1 ||
        currentUser?.district_l1_id ||
        currentUser?.city_id ||
        currentUser?.county ||
        currentUser?.political_location?.street ||
        currentUser?.political_location?.address ||
        currentUser?.location ||
        activeAccount?.street_address ||
        activeAccount?.district_l1 ||
        activeAccount?.district_l1_id;

    // 🔄 TanStack Infinite Query Pull mapped strictly by geographic scope key
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useCommunitiesFeed();

    // 📡 Real-time Push Staging Buffer Query
    const { data: bufferedPosts = [] } = useQuery({
        queryKey: ['communities', 'feed', activeTab, 'buffer'],
        queryFn: () => [],
        staleTime: Infinity,
        // Provide safe layout parameters in case the return signature deviates
        initialData: () => []
    });

    const unreadCount = bufferedPosts?.length || 0;

    // Clean, predictable flat map matching the standardized shape
    const allPosts = data?.pages?.flatMap((page) => page?.posts || []) || [];

    // Synchronize with the global Zustand background store safely
    useEffect(() => {
        if (allPosts.length > 0) {
            usePostsStore.getState().importFetchedPosts(allPosts);
        }
    }, [allPosts]); // Safely tracks a reliable reference change on query changes

    // Compute presentation layout data reactively
    const filteredPosts = useMemo(() => {
        return processFeedPosts(allPosts, {
            currentUser,
            activeAccount,
            isProfilePage: false // Explicitly pass context constraints to prevent layout derivation bugs
        });
    }, [allPosts, currentUser, activeAccount]);

    const virtuosoRef = useRef(null);
    const scrollRestoredRef = useRef(false);

    // Prevent default browser scroll clamping on route back
    useEffect(() => {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            const original = window.history.scrollRestoration;
            window.history.scrollRestoration = 'manual';
            return () => {
                window.history.scrollRestoration = original;
            };
        }
    }, []);

    // 🎯 SCROLL RESTORATION: Check if returning from post details page
    const scrollTarget = useMemo(() => {
        return getFeedScrollTarget(window.location.pathname);
    }, []);

    // Determine target index within the filtered posts
    const targetItemIndex = useMemo(() => {
        if (!scrollTarget || !filteredPosts || filteredPosts.length === 0) return undefined;
        const targetId = scrollTarget.postId;
        const targetDisplayId = scrollTarget.displayPostId;

        const idx = filteredPosts.findIndex((p) => {
            const pId = p?.id ? String(p.id) : '';
            const pReblogId = p?.reblog?.id ? String(p.reblog.id) : (p?.reblog_of_id ? String(p.reblog_of_id) : '');
            return (
                (targetId && (pId === targetId || pReblogId === targetId)) ||
                (targetDisplayId && (pId === targetDisplayId || pReblogId === targetDisplayId))
            );
        });

        return idx >= 0 ? idx : undefined;
    }, [scrollTarget, filteredPosts]);

    // Precise scroll alignment after initial render
    useEffect(() => {
        if (!scrollTarget || scrollRestoredRef.current) return;

        if (targetItemIndex !== undefined) {
            const targetId = scrollTarget.postId || scrollTarget.displayPostId;
            // The position the card had on screen before navigating (fallback to 80 if unknown)
            const targetTop = typeof scrollTarget.cardTop === 'number' ? scrollTarget.cardTop : 80;

            const alignToPost = () => {
                const el =
                    (targetId && document.getElementById(`post-${targetId}`)) ||
                    (scrollTarget.displayPostId && document.getElementById(`post-${scrollTarget.displayPostId}`)) ||
                    document.querySelector(`[data-post-id="${targetId}"]`) ||
                    document.querySelector(`[data-display-post-id="${targetId}"]`);

                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (Math.abs(rect.top - targetTop) > 4) {
                        const desiredScrollY = window.scrollY + rect.top - targetTop;
                        window.scrollTo({ top: Math.max(0, desiredScrollY), behavior: 'auto' });
                    }

                    el.classList.add('transition-all', 'duration-700', 'bg-primary-container/10');
                    setTimeout(() => {
                        el.classList.remove('bg-primary-container/10');
                    }, 1500);

                    scrollRestoredRef.current = true;
                    clearFeedScrollTarget();
                    return true;
                } else if (virtuosoRef.current) {
                    virtuosoRef.current.scrollToIndex({
                        index: targetItemIndex,
                        align: 'start',
                        offset: -targetTop,
                        behavior: 'auto',
                    });
                }
                return false;
            };

            const t1 = setTimeout(alignToPost, 60);
            const t2 = setTimeout(alignToPost, 200);
            const t3 = setTimeout(() => {
                alignToPost();
                scrollRestoredRef.current = true;
                clearFeedScrollTarget();
            }, 600);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        } else if (scrollTarget.scrollY > 0) {
            const restoreWindowScroll = () => {
                window.scrollTo({ top: scrollTarget.scrollY, behavior: 'auto' });
                scrollRestoredRef.current = true;
                clearFeedScrollTarget();
            };
            const t1 = setTimeout(restoreWindowScroll, 60);
            const t2 = setTimeout(restoreWindowScroll, 200);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }
    }, [targetItemIndex, scrollTarget]);

    const handleRefreshGesture = async () => {
        // 🧼 Clear out any hidden background buffer counts during a hard pull action
        queryClient.setQueryData(['communities', 'feed', activeTab, 'buffer'], []);

        // 🔄 Fire a hard refetch loop down the network pipe to fetch fresh data
        await refetch();
        return true;
    };

    const handleFlushBuffer = () => {
        if (unreadCount === 0) return;
        queryClient.setQueryData(['communities', 'feed', activeTab], (old) => {
            if (!old) return old;
            return {
                ...old,
                pages: old.pages.map((page, idx) => // 👈 Ensure this says "page"
                    idx === 0 ? { ...page, posts: [...bufferedPosts, ...page.posts] } : page // 👈 Ensure this maps "page"
                ),
            };
        });
        queryClient.setQueryData(['communities', 'feed', activeTab, 'buffer'], []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 💀 Preserved pulse animation skeleton component
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
            <div className="h-48 bg-surface-container-highest/10 rounded-xl mt-2"></div>
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
                        type="button"
                        className="unread-banner w-full bg-primary-container text-white border border-primary-container crimson-glow font-bold py-3.5 px-4 rounded-xl mb-6 transition-all hover:brightness-110 flex items-center justify-center gap-2 shadow-md animate-in fade-in slide-in-from-top duration-200 cursor-pointer border-none"
                        onClick={handleFlushBuffer}
                    >
                        <span className="material-symbols-outlined text-[18px]">distance</span>
                        View {unreadCount} new issues inside {activeTab}
                    </button>
                )}

                {/* 🗺️ Location Gate A: State Context Verification Prompt */}
                {/* 🗺️ Prompt to set state */}
                {activeTab === 'State' && !userState ? (
                    <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-4 my-2">
                        <span className="material-symbols-outlined text-5xl text-amber-500 mb-1">map</span>
                        <h3 className="font-bold text-text-primary text-xl">State Location Not Set</h3>
                        <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                            Please set your state location in settings to view state-level community updates and pulses.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/settings')}
                            className="mt-2 px-6 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md border-none"
                        >
                            Set State in Settings
                        </button>
                    </div>
                ) : activeTab === 'Local' && !userStreetAddress ? (
                    /* 📍 Location Gate B: Local Address Verification Prompt */
                    /* 📍 Prompt to set street address */
                    <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-4 my-2">
                        <span className="material-symbols-outlined text-5xl text-amber-500 mb-1">location_off</span>
                        <h3 className="font-bold text-text-primary text-xl">Street Address Not Set</h3>
                        <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                            Please set your street address in settings to view local neighborhood updates and pulses.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/settings')}
                            className="mt-2 px-6 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md border-none"
                        >
                            Set Street Address in Settings
                        </button>
                    </div>
                ) : filteredPosts?.length === 0 ? (
                    /* 🌌 Empty State Regional Fallback Container */
                    <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">distance</span>
                        <h3 className="font-bold text-text-primary text-lg">No geographic updates</h3>
                        <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                            No active concerning issues reported for the "{activeTab}" level yet.
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
                            ref={virtuosoRef}
                            useWindowScroll
                            data={filteredPosts}
                            /* 
                               ⚠️ CRITICAL FIX: Always compute keys based on the item id rather than index. 
                               This prevents violent layout repaints and enables hardware acceleration on scroll.
                            */
                            computeItemKey={(index, post) => post?.id || index}
                            initialTopMostItemIndex={
                                targetItemIndex !== undefined
                                    ? {
                                        index: targetItemIndex,
                                        align: 'start',
                                        offset: -(typeof scrollTarget?.cardTop === 'number' ? scrollTarget.cardTop : 80),
                                    }
                                    : undefined
                            }
                            initialScrollTop={
                                targetItemIndex === undefined && scrollTarget?.scrollY
                                    ? scrollTarget.scrollY
                                    : undefined
                            }
                            initialItemCount={
                                targetItemIndex !== undefined || (scrollTarget?.scrollY && scrollTarget.scrollY > 0)
                                    ? undefined
                                    : (filteredPosts.length > 0 ? Math.min(filteredPosts.length, 5) : 0)
                            }

                            /* 
                               🚀 Fluidity Secret: Render hidden content 400px *ahead* of the viewport bottom. 
                               This fires endReached early so data arrives before the user stops scrolling.
                            */
                            increaseViewportBy={400}
                            // Balanced overscan bounds to match pre-rendering window adjustments
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
                                                    // GEOGRAPHIC_STREAM_END: All regional entries synced.
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
