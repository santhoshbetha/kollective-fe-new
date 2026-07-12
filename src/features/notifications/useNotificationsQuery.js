// src/features/notifications/useNotificationsQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useNotificationsQuery() {
    return useInfiniteQuery({
        queryKey: ['notifications', 'history'],
        queryFn: ({ pageParam }) => {
            const baseUrl = '/notifications';
            const path = pageParam ? `${baseUrl}?max_id=${pageParam}` : baseUrl;
            return apiFetch(path);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
}
