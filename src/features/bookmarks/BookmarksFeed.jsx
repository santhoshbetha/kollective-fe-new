// src/features/bookmarks/BookmarksFeed.jsx
import React from 'react';
import { useBookmarksQuery } from './useBookmarksQuery';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { PostCard } from '../timeline/PostCard';

export function BookmarksFeed() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useBookmarksQuery();

    // 🚀 Attach our non-blocking native scroll observer sentinel node
    const sentinelRef = useIntersectionObserver({
        onIntersect: fetchNextPage,
        enabled: hasNextPage && !isFetchingNextPage,
    });

    if (status === 'pending') {
        return <div className="py-12 text-center text-text-secondary font-medium">Synchronizing your bookmarks...</div>;
    }

    if (status === 'error') {
        return <div className="py-12 text-center text-rose-500 font-medium">Failed to retrieve bookmarked updates.</div>;
    }

    const posts = data?.pages.flatMap((page) => page.posts || []) || [];

    return (
        <div className="bookmarks-feed w-full flex flex-col gap-4">
            {posts.length === 0 ? (
                <div className="py-16 text-center text-text-secondary/60 bg-surface-container-low border border-white/5 rounded-2xl p-8">
                    <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">bookmark_border</span>
                    <p className="font-medium">You haven't saved any broadcasts yet.</p>
                    <p className="text-sm text-text-secondary/50 mt-1">Bookmarked posts will safely appear here for quick access.</p>
                </div>
            ) : (
                <div className="posts-list flex flex-col gap-4">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}

            {/* 🛑 INFINITE SCROLL SENTINEL ANCHOR ELEMENT */}
            <div ref={sentinelRef} className="infinite-scroll-sentinel py-8 flex items-center justify-center w-full">
                {isFetchingNextPage && (
                    <p className="loading-more-text text-text-secondary text-sm font-medium flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full"></span>
                        Retrieving saved items...
                    </p>
                )}
                {!hasNextPage && posts.length > 0 && (
                    <p className="end-of-feed-text text-text-secondary/50 text-sm font-medium">
                        You have reviewed your complete bookmarked history.
                    </p>
                )}
            </div>
        </div>
    );
}
