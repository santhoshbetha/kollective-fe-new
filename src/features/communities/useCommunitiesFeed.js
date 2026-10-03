import { useInfiniteQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { usePostsStore } from '../../store/usePostsStore';
import { useCountry } from '../../hooks/useCountry'; // Verify path fits your directory layout
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useCommunitiesFeed() {
    // Read the active geo-scoped tab out of your global useStore
    const activeTab = useStore((state) => state.communitiesTab); // 'Local' | 'State' | 'Country' | 'World'
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const importFetchedPosts = usePostsStore((state) => state.importFetchedPosts);
    const { countryCode, countryName } = useCountry();
    const countryKey = countryCode || countryName || 'US';

    return useInfiniteQuery({
        // 🚀 THE TIMELINE CACHE MAP KEY UPGRADE:
        // Prefixed with 'timeline' to match your broad cache sweep partial matchers
        // This ensures deep-nested reblogs and likes reflect immediately across your geo-tabs
        queryKey: ['timeline', 'communities', 'feed', activeTab, isAuthenticated, countryKey],
        queryFn: async ({ pageParam }) => {
            let effectiveTab = activeTab || 'Local';
            if (!isAuthenticated && (effectiveTab === 'Local' || effectiveTab === 'State')) {
                effectiveTab = 'Country';
            }

            let scope = 'local';
            if (effectiveTab === 'Local') {
                scope = 'local';
            } else if (effectiveTab === 'State') {
                scope = 'state';
            } else if (effectiveTab === 'World') {
                scope = 'world';
            } else {
                scope = 'country';
            }

            const detectedCountry = countryCode || countryName || 'US';
            const countryParam = `&country=${encodeURIComponent(detectedCountry)}&country_code=${encodeURIComponent(countryCode || 'US')}`;
            const cursorParam = pageParam ? `&cursor=${pageParam}&max_id=${pageParam}` : '';
            const path = `/posts?scope=${scope}${countryParam}${cursorParam}`;

            let rawData;
            try {
                rawData = await apiFetch(path);
            } catch (err) {
                console.warn('apiFetch failed for communities feed, falling back to mockApi getPosts', err);
                rawData = await api.getPosts({ scope, max_id: pageParam, country: detectedCountry });
            }

            // 🛡️ Standardize target structure: Always extract an explicit posts array
            const posts = Array.isArray(rawData)
                ? rawData
                : (rawData?.data || rawData?.posts || rawData?.posts?.data || []);

            const nextCursor = rawData?.next_cursor ?? rawData?.nextCursor ?? rawData?.nextPageId ?? null;

            // 🚀 HYDRATION SYNC INTERCEPTOR:
            // Automatically push incoming geo-scoped posts directly into the Zustand Entities cache dictionary.
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
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
}
