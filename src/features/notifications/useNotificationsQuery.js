// src/features/notifications/useNotificationsQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

import { useAccountsStore } from '../../store/useAccountsStore';
import { usePostsStore } from '../../store/usePostsStore';

export function useNotificationsQuery() {
    return useInfiniteQuery({
        queryKey: ['notifications', 'history'],
        queryFn: ({ pageParam }) => {
            const baseUrl = '/api/v1/notifications';
            const path = pageParam ? `${baseUrl}?max_id=${pageParam}` : baseUrl;
            return apiFetch(path);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage?.nextCursor ?? lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
    });
}

