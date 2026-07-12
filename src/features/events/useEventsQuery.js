// src/features/events/useEventsQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useEventsQuery() {
    return useInfiniteQuery({
        queryKey: ['events', 'list'],
        queryFn: ({ pageParam }) => {
            const baseUrl = '/events';
            const path = pageParam ? `${baseUrl}?max_id=${pageParam}` : baseUrl;
            //   return apiFetch(path);
            return api.getEvents({ max_id: pageParam });
        },

        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
}
