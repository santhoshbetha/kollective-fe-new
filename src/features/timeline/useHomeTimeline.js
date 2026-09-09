// src/features/timeline/useHomeTimeline.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { useAccountsStore } from '../../store/useAccountsStore';
//import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi'

export function useHomeTimeline() {
    const importFetchedAccounts = useAccountsStore((state) => state.importFetchedAccounts);
    // Read the live active tab out of your unified Zustand useStore
    const activeTab = useStore((state) => state.homeFeedTab); // 'All Activity' | 'Voices' | 'Popular' | 'Following'

    return useInfiniteQuery({
        // 🚀 Include activeTab directly in the Query Key array
        queryKey: ['timeline', 'home', activeTab],
        /*queryFn: ({ pageParam }) => {
            const baseUrl = `/timelines/home?tab=${encodeURIComponent(activeTab)}`;
            const path = pageParam ? `${baseUrl}&max_id=${pageParam}` : baseUrl;
            return apiFetch(path);
        },*/
        queryFn: async ({ pageParam }) => {
            // You can pass your pagination parameter cursors or tabs directly 
            // into your mock functions if they support it
            return api.getPosts({ tab: activeTab, max_id: pageParam });
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

        // 🎯 THE HOOK INTERCEPT MATRIX:
        // This side-effect safely extracts profiles during query execution phases.
        select: (data) => {
            const allPosts = data.pages.flatMap((page) => page.posts || []);
            const authorsList = allPosts.map((post) => post.author).filter(Boolean);

            // Seed the global entities directory asynchronously
            importFetchedAccounts(authorsList);

            return data;
        }
    });
}
