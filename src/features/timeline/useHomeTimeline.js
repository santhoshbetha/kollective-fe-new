import { useInfiniteQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useCountry } from '../../hooks/useCountry';
import { usePostsStore } from '../../store/usePostsStore';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useHomeTimeline() {
    const activeTab = useStore((state) => state.homeFeedTab);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const importFetchedPosts = usePostsStore((state) => state.importFetchedPosts);
    const { countryCode, countryName } = useCountry();
    const countryKey = countryCode || countryName || 'US';

    const accountContext = activeAccount?.type === 'organization' ? 'organization' : 'personal';
    const accountId = activeAccount?.id || 'personal';

    return useInfiniteQuery({
        // 🚀 THE TIMELINE CACHE MAP KEY: Matches your global syncAllCacheQueries partial matchers
        queryKey: ['timeline', 'home', activeTab, accountContext, accountId, isAuthenticated, countryKey],
        queryFn: async ({ pageParam, signal }) => {
            let filterQuery = '';
            let sortQuery = 'sort=newest';

            if (activeTab === 'Voices') {
                filterQuery = '&category=voice';
            } else if (activeTab === 'Following') {
                filterQuery = '&feed=following&filter=following';
            } else if (activeTab === 'Popular') {
                sortQuery = 'sort=top';
            }

            const cursorParam = pageParam ? `&cursor=${pageParam}` : '';
            const detectedCountry = countryCode || countryName || 'US';
            const countryParam = (!isAuthenticated && detectedCountry)
                ? `&country=${encodeURIComponent(detectedCountry)}&country_code=${encodeURIComponent(countryCode || 'US')}`
                : '';
            const contextParam = `context=${encodeURIComponent(accountContext)}`;
            const path = `/timeline?${contextParam}&${sortQuery}${filterQuery}${countryParam}${cursorParam}`;

            let rawData;
            try {
                rawData = await apiFetch(path, { signal });
            } catch (err) {
                if (signal?.aborted || err?.name === 'AbortError') {
                    throw err;
                }
                console.warn('apiFetch failed for home timeline, falling back to mockApi', err);
                rawData = await api.getPosts({ tab: activeTab, max_id: pageParam, country: detectedCountry });
            }

            // Standardize shapes into a reliable internal contract:
            const rawPosts = Array.isArray(rawData)
                ? rawData
                : (rawData?.data || rawData?.posts || rawData?.posts?.data || []);

            const posts = rawPosts.map((p) => {
                if (!p) return p;
                const authorObj = typeof p.author === 'string'
                    ? { name: p.author, username: p.author.toLowerCase().replace(/\s+/g, '_'), type: accountContext }
                    : p.author;
                return {
                    ...p,
                    text: p.text || p.content || p.body,
                    author: authorObj,
                };
            });

            const nextCursor = rawData?.next_cursor ?? rawData?.nextCursor ?? rawData?.nextPageId ?? null;

            // 🚀 HYDRATION SYNC INTERCEPTOR:
            // Automatically push incoming posts directly into the Zustand Entities cache dictionary.
            // This preserves optimistic interactions natively before rendering components to screen.
            if (Array.isArray(posts) && posts.length > 0) {
                importFetchedPosts(posts);
            }

            return { posts, nextCursor };
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,

        // 🚀 THE SCALING BOUNDARY FIX: Maintain a rolling window constraint of exactly 5 pages maximum.
        // Drops old pages out of active memory automatically, guaranteeing your wide cache scans stay ultra-fast.
        maxPages: 5,

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });
}







