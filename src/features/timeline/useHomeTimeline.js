import { useInfiniteQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useCountry } from '../../hooks/useCountry';
import { usePostsStore } from '../../store/usePostsStore';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useHomeTimeline() {
    const importFetchedPosts = usePostsStore((state) => state.importFetchedPosts);
    // Read the live active tab out of your unified Zustand useStore
    const activeTab = useStore((state) => state.homeFeedTab); // 'All Activity' | 'Voices' | 'Popular' | 'Following'
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { countryCode, countryName } = useCountry();

    const countryKey = countryCode || countryName || 'US';

    return useInfiniteQuery({
        // 🚀 Include activeTab and country info in the Query Key array
        queryKey: ['timeline', 'home', activeTab, isAuthenticated, countryKey],
        queryFn: async ({ pageParam }) => {
            const categoryParam = activeTab === 'All Activity' ? '' : `&category=${encodeURIComponent(activeTab.toLowerCase())}`;
            const cursorParam = pageParam ? `&cursor=${pageParam}` : '';
            const detectedCountry = countryCode || countryName || 'US';
            const countryParam = (!isAuthenticated && detectedCountry)
                ? `&country=${encodeURIComponent(detectedCountry)}&country_code=${encodeURIComponent(countryCode || 'US')}`
                : '';
            const path = `/posts?sort=newest${categoryParam}${countryParam}${cursorParam}`;
            try {
                const res = await apiFetch(path);
                if (res && (res.data || Array.isArray(res))) {
                    return res;
                }
            } catch (err) {
                console.warn('apiFetch failed for home timeline, falling back to mockApi', err);
            }
            return api.getPosts({ tab: activeTab, max_id: pageParam, country: detectedCountry });
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



