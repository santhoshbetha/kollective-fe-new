// src/features/search/useGlobalSearch.js
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

/**
 * ⏱️ Custom Debounce Hook: Prevents hammering the backend on every single keystroke
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * 🔎 Hook: Handles multi-entity global system search parsing
 */
export function useGlobalSearchQuery(searchTerm) {
    const debouncedSearch = useDebounce(searchTerm, 350);

    return useQuery({
        queryKey: ['system', 'search', debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch.trim()) return { posts: [], businesses: [], proposals: [] };

            // Calls a single cross-relational endpoint or aggregates local queries
            const res = await apiFetch(`/search?q=${encodeURIComponent(debouncedSearch)}`);
            return res?.data || res || { posts: [], businesses: [], proposals: [] };
        },
        enabled: debouncedSearch.trim().length > 1,
        staleTime: 15 * 1000,
        gcTime: 2 * 60 * 1000,
    });
}

/**
 * ⚡ CUSTOM CACHE INVALIDATE TRIGGER FOR BOOKMARKS
 * Surgically rewrites local query arrays instead of triggering heavy full-page re-refetches.
 */
export function useInvalidateBookmarkTrigger() {
    const queryClient = useQueryClient();

    return {
        /**
         * Surgically drops an unbookmarked entity node from all active infinite pages
         */
        ejectFromBookmarksCache: (targetPostId) => {
            if (!targetPostId) return;

            queryClient.setQueriesData({ queryKey: ['bookmarks'] }, (oldCache) => {
                if (!oldCache || !oldCache.pages) return oldCache;

                return {
                    ...oldCache,
                    pages: oldCache.pages.map((page) => {
                        const postsList = page?.data || page?.posts || (Array.isArray(page) ? page : []);

                        // Structural execution: Filter out the targeted post node cleanly
                        const alteredList = postsList.filter(post => post?.id !== targetPostId);

                        if (Array.isArray(page)) return alteredList;
                        return {
                            ...page,
                            data: page?.data ? alteredList : undefined,
                            posts: page?.posts ? alteredList : undefined
                        };
                    })
                };
            });

            // Simultaneously alert cross-timeline caches that the bookmark icon flag flipped off
            queryClient.setQueriesData({ queryKey: ['proposals'] }, (old) => old);
            queryClient.setQueriesData({ queryKey: ['timeline'] }, (old) => old);
        },

        /**
         * Hard-invalidation fallback to forcefully reload all active lists if an edge-case crash occurs
         */
        forceHardRefresh: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['bookmarks'],
                refetchType: 'active'
            });
        }
    };
}
