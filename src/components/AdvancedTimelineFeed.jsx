// src/components/AdvancedTimelineFeed.jsx
import React, { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import { PostCard } from './PostCard';

export function AdvancedTimelineFeed({ fetchUrlEndpoint, activeTab }) {

    // 🚀 Infinite Query mapping payload matrix parameters
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
        isError
    } = useInfiniteQuery({
        queryKey: ['timeline', fetchUrlEndpoint, activeTab],
        queryFn: async ({ pageParam = null }) => {
            const cursorQuery = pageParam ? `?cursor=${pageParam}` : '';
            const res = await apiFetch(`${fetchUrlEndpoint}${cursorQuery}`);
            return res?.data || res; // Expects layout shape: { posts: [...], next_cursor: "ULID" }
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage?.next_cursor || null,
        staleTime: 1000 * 60 * 2, // 2 minutes data freshness window guarantees stability
    });

    // Flatten pages cleanly into a singular list stream for the window scroller engine
    const flatPosts = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => page?.posts || page || []);
    }, [data]);

    if (isPending) return <LoadingSpinnerSkeleton />;
    if (isError) return <FeedErrorIndicator />;

    return (
        <Virtuoso
            useWindowScroll
            data={flatPosts}
            computeItemKey={(index, post) => post?.id || index}
            increaseViewportBy={500}
            overscan={300}

            // 🚀 The Pagination Engine: Triggers the fetch next page block as scroll limits near the end
            endReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            }}

            itemContent={(index, post) => (
                <PostCard
                    post={post}
                    isLast={index === flatPosts.length - 1}
                />
            )}

            components={{
                Footer: () => isFetchingNextPage ? (
                    <div className="w-full p-6 flex justify-center items-center bg-[#090d12]">
                        <span className="w-5 h-5 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
                    </div>
                ) : !hasNextPage ? (
                    <div className="w-full p-8 text-center text-xs font-mono text-text-secondary/30 bg-[#090d12]">
                        TIMELINE_END // You have completely digested the localized stream pool
                    </div>
                ) : null
            }}
        />
    );
}
