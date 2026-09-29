// src/features/bookmarks/BookmarksFeed.jsx
import React, { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useBookmarksQuery } from './useBookmarksQuery';
import { PostCard } from '../timeline/PostCard';
import { usePostsStore } from '../../store/usePostsStore';
import { Bookmark, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to match local helper paths

export function BookmarksFeed({ activeFilter = 'All Categories' }) {
    // 🔄 Pull infinite pages from our TanStack query caching layout
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useBookmarksQuery();

    // Pull entities context directly from our client state store layer
    const storeEntities = usePostsStore((state) => state.entities);

    // 🚀 PERFORMANCE FIX: Compute and map unified posts parameters inline using memoized derivations
    const filteredBookmarks = useMemo(() => {
        // Flatten infinite pages without triggering intermediate side-effect store sync flushes
        const pagesArray = data?.pages || [];
        const rawPosts = pagesArray.flatMap((page) =>
            page?.data || page?.posts || (Array.isArray(page) ? page : [])
        );

        // Merge baseline network records with the active single-source-of-truth store entities
        const allMergedPosts = rawPosts.map((p) => {
            if (!p?.id) return null;
            return { ...p, ...(storeEntities[p.id] || {}) };
        }).filter(Boolean);

        // Process semantic filter rules matching
        return allMergedPosts.filter((post) => {
            // Guard clause: Filter out if explicitly removed locally from user bookmarks matrix
            if (post?.bookmarked === false || post?.isBookmarked === false) return false;
            if (activeFilter === 'All Categories') return true;

            const contentText = (post?.content || post?.text || '').toLowerCase();

            if (activeFilter === 'Manifestos') {
                return contentText.includes('sovereign') ||
                    contentText.includes('sovereignty') ||
                    contentText.includes('reclamation');
            }

            if (activeFilter === 'Strategy') {
                return contentText.includes('report') ||
                    contentText.includes('negotiations') ||
                    (Array.isArray(post?.tags) && post.tags.some(t => String(t).toLowerCase().includes('governance')));
            }

            return true;
        });
    }, [data?.pages, storeEntities, activeFilter]);

    if (status === 'pending') {
        return (
            <div className="py-12 flex flex-col items-center gap-4 font-mono text-xs text-text-secondary/40 select-none text-left">
                <RefreshCw className="w-5 h-5 animate-spin text-primary-container" />
                <p className="uppercase tracking-widest animate-pulse">// SYNCING_SAVED_ARCHIVES...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="py-12 text-center text-rose-400 border border-white/5 bg-[#141414] rounded-2xl font-mono text-xs select-none uppercase tracking-wider flex items-center justify-center gap-2 max-w-xl mx-auto">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>// ERROR_CRITICAL_FAILED_TO_SYNCHRONIZE_SAVED_BOOKMARKS</span>
            </div>
        );
    }

    if (filteredBookmarks.length === 0) {
        return (
            <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-surface-container-low shadow-2xl animate-in fade-in duration-200 select-none text-left font-sans">
                <Bookmark className="w-8 h-8 text-text-secondary/40 mb-4 block" />
                <h3 className="font-bold text-text-primary mb-1 text-lg">No saved posts found</h3>
                <p className="text-text-secondary text-xs leading-relaxed max-w-md font-medium font-sans">
                    {activeFilter === 'All Categories'
                        ? 'Save posts from the home timeline feed to read or refer to them here later!'
                        : `No saved posts match the "${activeFilter}" classification filter query.`}
                </p>
            </div>
        );
    }
    return (
        /* 🏆 Outer Structural Frame Shield Container */
        <div className="w-full relative border border-[#262626] bg-[#141414] overflow-hidden shadow-2xl rounded-xl">
            <Virtuoso
                useWindowScroll
                data={filteredBookmarks}
                computeItemKey={(index, post) => post?.id || index}
                increaseViewportBy={300}
                overscan={200}

                endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}

                components={{
                    List: React.forwardRef(({ children, style, ...props }, ref) => (
                        <div
                            {...props}
                            ref={ref}
                            style={{ ...style }}
                            className="flex flex-col w-full divide-y divide-white/5"
                        >
                            {children}
                        </div>
                    )),
                    Item: React.forwardRef(({ children, ...props }, ref) => (
                        <div {...props} ref={ref} className="w-full bg-[#141414]">
                            {children}
                        </div>
                    )),
                    Footer: () => isFetchingNextPage && (
                        /* ⏳ Infinite Page Append loading row block spinner */
                        <div className="py-8 flex flex-col items-center gap-3 border-t border-white/5 bg-[#141414] font-mono text-[10px] text-text-secondary/40 select-none">
                            <div className="w-5 h-5 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                            <p className="uppercase tracking-widest animate-pulse">// RETRIEVING_OLDER_ARCHIVE_LAYERS...</p>
                        </div>
                    )
                }}

                // 🚀 FIXED KEY IDENTIFIER: Uses post.id to seal structural animation frames cleanly
                itemContent={(index, post) => (
                    <div className="w-full animate-in fade-in duration-150">
                        <PostCard post={post} />
                    </div>
                )}
            />
        </div>
    );
}
