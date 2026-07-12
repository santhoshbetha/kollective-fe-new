// src/features/bookmarks/useBookmarksQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useBookmarksQuery() {
    return useInfiniteQuery({
        // 🔒 Isolate bookmarks under their own dedicated cache root key
        queryKey: ['timeline', 'bookmarks'],
        queryFn: ({ pageParam }) => {
            const baseUrl = '/posts/bookmarks';
            const path = pageParam ? `${baseUrl}?max_id=${pageParam}` : baseUrl;
            return apiFetch(path);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
}
