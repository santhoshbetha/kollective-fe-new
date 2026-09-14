// src/features/events/useEventsQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

export function useEventsQuery() {
    return useInfiniteQuery({
        queryKey: ['events', 'list'],
        queryFn: ({ pageParam }) => {
            return api.getEvents({ max_id: pageParam });
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage?.nextCursor ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
    });
}
