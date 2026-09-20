// src/features/communities/useCommunitiesFeed.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useCountry } from '../../hooks/useCountry';
import { usePostsStore } from '../../store/usePostsStore';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useCommunitiesFeed() {
    const importFetchedPosts = usePostsStore((state) => state.importFetchedPosts);
    // Read the active geo-scoped tab out of your global useStore
    const activeTab = useStore((state) => state.communitiesTab); // 'Local' | 'State' | 'Country' | 'World'
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { countryCode, countryName } = useCountry();

    const countryKey = countryCode || countryName || 'US';

    return useInfiniteQuery({
        // 🚀 Sandbox the cache keys cleanly by geo-scope and detected country
        queryKey: ['communities', 'feed', activeTab, isAuthenticated, countryKey],
        queryFn: async ({ pageParam }) => {
            let effectiveTab = activeTab || 'Local';
            if (!isAuthenticated && (effectiveTab === 'Local' || effectiveTab === 'State')) {
                effectiveTab = 'Country';
            }
            const scope = effectiveTab.toLowerCase();
            const detectedCountry = countryCode || countryName || 'US';
            const countryParam = (!isAuthenticated && detectedCountry)
                ? `&country=${encodeURIComponent(detectedCountry)}&country_code=${encodeURIComponent(countryCode || 'US')}`
                : '';
            const baseUrl = `/posts?scope=${scope}${countryParam}`;
            const path = pageParam ? `${baseUrl}&max_id=${pageParam}` : baseUrl;
            try {
                const res = await apiFetch(path);
                if (res && (res.data || Array.isArray(res))) {
                    return res;
                }
            } catch (err) {
                console.warn('apiFetch failed for communities feed, falling back to mockApi getPosts', err);
            }
            return api.getPosts({ scope, max_id: pageParam, country: detectedCountry });
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage?.next_cursor ?? lastPage?.nextCursor ?? lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
}


