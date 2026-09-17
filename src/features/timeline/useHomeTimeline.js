import { useInfiniteQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { usePostsStore } from '../../store/usePostsStore';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useHomeTimeline() {
    const importFetchedPosts = usePostsStore((state) => state.importFetchedPosts);
    // Read the live active tab out of your unified Zustand useStore
    const activeTab = useStore((state) => state.homeFeedTab); // 'All Activity' | 'Voices' | 'Popular' | 'Following'

    return useInfiniteQuery({
        // 🚀 Include activeTab directly in the Query Key array
        queryKey: ['timeline', 'home', activeTab],
        queryFn: async ({ pageParam }) => {
            const categoryParam = activeTab === 'All Activity' ? '' : `&category=${encodeURIComponent(activeTab.toLowerCase())}`;
            const cursorParam = pageParam ? `&cursor=${pageParam}` : '';
            const path = `/posts?sort=newest${categoryParam}${cursorParam}`;
            try {
                const res = await apiFetch(path);
                if (res && (res.data || Array.isArray(res))) {
                    return res;
                }
            } catch (err) {
                console.warn('apiFetch failed for home timeline, falling back to mockApi', err);
            }
            return api.getPosts({ tab: activeTab, max_id: pageParam });
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage?.next_cursor ?? lastPage?.nextCursor ?? lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,

        // 🎯 THE HOOK INTERCEPT MATRIX:
        // This side-effect safely normalizes posts & profiles during query execution phases.
        select: (data) => {
            const allPosts = data.pages.flatMap((page) => (Array.isArray(page) ? page : page.data || page.posts || []));

            // Seed global post and account entity stores
            importFetchedPosts(allPosts);

            return data;
        }
    });
}
