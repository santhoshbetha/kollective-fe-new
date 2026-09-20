// src/features/bookmarks/useBookmarksQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

import { usePostsStore } from '../../store/usePostsStore';

export function useBookmarksQuery() {
    return useInfiniteQuery({
        // 🔒 Isolate bookmarks under their own dedicated cache root key
        queryKey: ['timeline', 'bookmarks'],
        queryFn: ({ pageParam }) => {
            const baseUrl = '/api/v1/bookmarks';
            const path = pageParam ? `${baseUrl}?max_id=${pageParam}` : baseUrl;
            return apiFetch(path);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage?.nextCursor ?? lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
        select: (data) => {
            if (!data?.pages) return data;
            const importFetchedPosts = usePostsStore.getState().importFetchedPosts;
            const pages = data.pages.map((page) => {
                if (!page) return page;
                const rawPosts = Array.isArray(page) ? page : page.statuses || page.posts || [];
                const imported = importFetchedPosts(rawPosts);
                if (Array.isArray(page)) return imported;
                return { ...page, statuses: imported, posts: imported };
            });
            return { ...data, pages };
        },
    });
}
