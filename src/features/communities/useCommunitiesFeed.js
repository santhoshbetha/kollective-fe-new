// src/features/communities/useCommunitiesFeed.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { apiFetch } from '../../api/apiClient';

export function useCommunitiesFeed() {
    // Read the active geo-scoped tab out of your global useStore
    const activeTab = useStore((state) => state.communitiesTab); // 'Local' | 'State' | 'Country' | 'World'

    return useInfiniteQuery({
        // 🚀 Sandbox the cache keys cleanly by geo-scope
        queryKey: ['communities', 'feed', activeTab],
        queryFn: ({ pageParam }) => {
            const baseUrl = `/communities?scope=${activeTab.toLowerCase()}`;
            const path = pageParam ? `${baseUrl}&max_id=${pageParam}` : baseUrl;
            return apiFetch(path);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
}
