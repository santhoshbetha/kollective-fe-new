// src/features/communities/CommunitiesFeed.jsx
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useStore } from '../../store/useStore';
import { useCommunitiesFeed } from './useCommunitiesFeed'; // Assuming your custom geo hook path
import { PostCard } from '../timeline/PostCard';
import { useHomeTimeline } from '../timeline/useHomeTimeline';

export function CommunitiesFeed() {
    const queryClient = useQueryClient();
    const activeTab = useStore((state) => state.communitiesTab);

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
    });

    const unreadCount = bufferedPosts.length;
    //const allPosts = data?.pages.flatMap((page) => page.posts || []) || [];//TODO -- original: open this later

    //const { posts, isLoading: postsLoading } = usePostsQuery();

    const {
        data2,
        fetchNextPage2,
        hasNextPage2,
        isFetchingNextPage2,
        status2
    } = useHomeTimeline();

    console.log("Communities data2", data2);

    const getPostGeoScope = (post) => {
        // Map specific posts to scopes for realistic demo data
        if (post?.id === 'strike-post-1') return 'Country';
        if (post?.id === 'carousel-post-1') return 'Local';
        if (post?.id === 'renaissance-post') return 'World';
        if (post?.id === 'system-post-1') return 'Local';
        // Fallbacks
        if (post?.isVoice) return 'State';
        return 'Local';
    };

    const allPosts = data2?.pages?.[0]?.filter(post => getPostGeoScope(post) === activeTab);
    //const allPosts = data2?.pages.flatMap((page) => page.posts || []) || [];//posts?.filter(post => getPostGeoScope(post) === activeTab);
    console.log("Communities allPosts", data2?.pages?.[0], activeTab);

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
                pages: old.pages.map((p, idx) =>
                    idx === 0 ? { ...p, posts: [...bufferedPosts, ...p.posts] } : p
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

    //if (status === 'error') { //TODO -- original: open this later
    //     return <div className="text-center py-12 text-rose-500 font-bold border border-white/5 rounded-2xl">Failed to synchronize geographic pulses.</div>;
    // }

    return (
        <PullToRefresh
            onRefresh={handleRefreshGesture}
            pullingContent="" // Disables default plain text headers to preserve clean UI
            backgroundColor="transparent"
            maxPullDownDistance={90}
        >
            <div className="w-full flex flex-col">

                {/* 🔔 Dynamic scope-bound staging update banner */}
                {unreadCount > 0 && (
                    <button
                        className="unread-banner w-full bg-primary-container text-white border border-primary-container crimson-glow font-bold py-3.5 px-4 rounded-xl mb-6 transition-all hover:brightness-110 flex items-center justify-center gap-2 shadow-md animate-in fade-in slide-in-from-top duration-200 cursor-pointer"
                        onClick={handleFlushBuffer}
                    >
                        <span className="material-symbols-outlined text-[18px]">distance</span>
                        View {unreadCount} new issues inside {activeTab}
                    </button>
                )}

                {allPosts?.length === 0 ? (
                    /* 🌌 Empty State Panel Container */
                    <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414]">
                        <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">distance</span>
                        <h3 className="font-bold text-text-primary mb-2 text-lg">No geographic updates</h3>
                        <p className="text-text-secondary text-sm">
                            No active concerning issues reported for the "{activeTab}" level yet.
                        </p>
                    </div>
                ) : (
                    /* 🏆 Custom List Border Wrapping Shell */
                    <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-[16px] overflow-hidden shadow-2xl">
                        <Virtuoso
                            useWindowScroll
                            data={allPosts}
                            endReached={() => {
                                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                            }}
                            overscan={400}
                            itemContent={(index, post) => (
                                <PostCard key={index} post={post} isLast={index === allPosts.length - 1} />
                            )}
                            components={{
                                Footer: () => isFetchingNextPage && (
                                    <div className="py-12 flex flex-col items-center gap-4 border-t border-white/5 bg-[#141414]">
                                        <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                                        <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
                                            Loading older geographic pulses
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
