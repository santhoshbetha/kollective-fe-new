// src/features/polls/usePollsQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function usePollsQuery() {
    return useInfiniteQuery({
        queryKey: ['polls', 'stream'],
        queryFn: ({ pageParam }) => {
            const baseUrl = '/api/v1/polls';
            const path = pageParam ? `${baseUrl}?max_id=${pageParam}` : baseUrl;
            return apiFetch(path);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage?.nextCursor ?? lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
    });
}
