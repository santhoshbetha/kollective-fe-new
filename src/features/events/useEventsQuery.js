// src/features/events/useEventsQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useEventsQuery() {
    return useInfiniteQuery({
        queryKey: ['events', 'list'],
        queryFn: async ({ pageParam }) => {
            const cursorParam = pageParam ? `?cursor=${pageParam}` : '';
            try {
                const res = await apiFetch(`/events${cursorParam}`);
                if (res && (res.data || Array.isArray(res))) {
                    return res;
                }
            } catch (err) {
                console.warn('apiFetch failed for events query, falling back to mockApi', err);
            }
            return api.getEvents({ max_id: pageParam });
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage?.next_cursor ?? lastPage?.nextCursor ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
    });
}
