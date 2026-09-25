// src/features/bookmarks/useBookmarksQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useBookmarksQuery() {
    return useInfiniteQuery({
        // 🔒 Isolate bookmarks under their own dedicated cache root key
        queryKey: ['timeline', 'bookmarks'],
        queryFn: ({ pageParam }) => {
            const baseUrl = '/api/v1/bookmarks';
            const path = pageParam ? `${baseUrl}?cursor=${pageParam}` : baseUrl;
            return apiFetch(path);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => {
            if (!lastPage) return undefined;
            const cursor = lastPage.next_cursor ?? lastPage.nextCursor;
            return cursor && cursor !== "nil" && cursor !== "null" ? cursor : undefined;
        },
    });
}


