// src/features/search/useGlobalSearch.js
import { useState, useEffect, useCallback, useMemo } from 'react';
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
            if (!debouncedSearch.trim()) return { posts: [], businesses: [], proposals: [], accounts: [] };

            // Calls the unified multi-entity global search endpoint
            const res = await apiFetch(`/search/global?q=${encodeURIComponent(debouncedSearch)}`);
            const data = res?.data || res || {};
            return {
                posts: Array.isArray(data.posts) ? data.posts : (data.posts?.results || []),
                businesses: Array.isArray(data.businesses) ? data.businesses : [],
                proposals: Array.isArray(data.proposals) ? data.proposals : [],
                accounts: Array.isArray(data.accounts) ? data.accounts : []
            };
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

    /**
     * Surgically drops an unbookmarked entity node from all active infinite pages
     */
    const ejectFromBookmarksCache = useCallback((targetPostId) => {
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
        const flipBookmarkOff = (oldCache) => {
            if (!oldCache) return oldCache;
            const updateItem = (item) =>
                item?.id === targetPostId ? { ...item, bookmarked: false, isBookmarked: false } : item;

            if (Array.isArray(oldCache)) return oldCache.map(updateItem);
            if (Array.isArray(oldCache.pages)) {
                return {
                    ...oldCache,
                    pages: oldCache.pages.map((page) => {
                        if (Array.isArray(page)) return page.map(updateItem);
                        return {
                            ...page,
                            data: Array.isArray(page?.data) ? page.data.map(updateItem) : page?.data,
                            posts: Array.isArray(page?.posts) ? page.posts.map(updateItem) : page?.posts
                        };
                    })
                };
            }
            return oldCache;
        };

        queryClient.setQueriesData({ queryKey: ['proposals'] }, flipBookmarkOff);
        queryClient.setQueriesData({ queryKey: ['timeline'] }, flipBookmarkOff);
    }, [queryClient]);

    /**
     * Hard-invalidation fallback to forcefully reload all active lists if an edge-case crash occurs
     */
    const forceHardRefresh = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: ['bookmarks'],
            refetchType: 'active'
        });
    }, [queryClient]);

    return useMemo(() => ({
        ejectFromBookmarksCache,
        forceHardRefresh
    }), [ejectFromBookmarksCache, forceHardRefresh]);
}
