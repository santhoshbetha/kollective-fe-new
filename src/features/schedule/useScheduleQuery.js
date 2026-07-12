// src/features/schedule/useScheduleQuery.js
import { useQuery } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

export function useScheduleQuery() {
    const { data, isPending, error } = useQuery({
        // Isolate schedule timeline data under its own unique cache boundary
        queryKey: ['schedule', 'timeline'],
        queryFn: api.getSchedule,
        staleTime: 30 * 1000, // Stays fresh in cache for 30 seconds before auto-refetching
    });

    return {
        schedule: data?.schedule || data || [],
        scheduleLoading: isPending,
        scheduleError: error,
    };
}
