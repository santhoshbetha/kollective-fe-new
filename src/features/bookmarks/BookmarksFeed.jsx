// src/features/bookmarks/BookmarksFeed.jsx
import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useBookmarksQuery } from './useBookmarksQuery'; // 🚀 Pointing to your custom bookmarks infinite hook
import { PostCard } from '../timeline/PostCard';

export function BookmarksFeed({ activeFilter }) {
    // 🔄 TanStack Infinite Query Pull specifically sandboxed to bookmarks
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useBookmarksQuery();

    // Flatten our infinite pages array layout into a single flat array map
    const allPosts = data?.pages.flatMap((page) => page.posts || []) || [];

    // Filter bookmarked items based on semantic content string inspection matching
    const filteredBookmarks = allPosts.filter((post) => {
        // TanStack filter safety: Ensure the post is bookmarked first
        if (!post?.bookmarked) return false;
        if (activeFilter === 'All Categories') return true;

        // Use a clean local variable proxy fallback check to handle text or content variables safely
        const contentText = (post?.content || post?.text || '').toLowerCase();

        if (activeFilter === 'Manifestos') {
            return contentText.includes('sovereign') ||
                contentText.includes('sovereignty') ||
                contentText.includes('reclamation');
        }

        if (activeFilter === 'Strategy') {
            return contentText.includes('report') ||
                contentText.includes('negotiations') ||
                post?.tags?.some(tag => tag.toLowerCase().includes('governance'));
        }

        return true;
    });

    if (status === 'pending') {
        return <div className="text-center py-12 text-text-secondary font-medium">Retrieving saved archive...</div>;
    }

    if (status === 'error') {
        return <div className="text-center py-12 text-rose-500 font-bold border border-white/5 rounded-2xl">Failed to synchronize saved bookmarks.</div>;
    }

    if (filteredBookmarks.length === 0) {
        return (
            /* 🌌 Empty State Results Panel Container Frame Layout */
            <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-surface-container-low shadow-2xl animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
                    bookmark
                </span>
                <h3 className="font-bold text-text-primary mb-2 text-lg">No saved posts found</h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
                    {activeFilter === 'All Categories'
                        ? 'Save posts from the home feed to read or refer to them later!'
                        : `No saved posts match the "${activeFilter}" category.`}
                </p>
            </div>
        );
    }

    return (
        /* 🏆 Custom Outer Frame Styling Shield Container */
        <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-[16px] overflow-hidden shadow-2xl">
            <Virtuoso
                useWindowScroll
                data={filteredBookmarks}
                endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                overscan={400}
                itemContent={(index, post) => (
                    <PostCard key={index} post={post} />
                )}
                components={{
                    Footer: () => isFetchingNextPage && (
                        <div className="py-8 flex flex-col items-center gap-4 border-t border-white/5 bg-[#141414]">
                            <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">
                                Retrieving older bookmarks
                            </p>
                        </div>
                    )
                }}
            />
        </div>
    );
}
