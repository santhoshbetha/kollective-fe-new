// src/features/schedule/useScheduleQuery.js
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useScheduleQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['schedule', 'timeline'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/events');
                return res?.data || res?.events || res;
            } catch (err) {
                console.warn('Backend schedule query failed, falling back to mockApi', err);
                return api.getSchedule();
            }
        },
        staleTime: 30 * 1000,
    });

    return {
        schedule: Array.isArray(data) ? data : (data?.schedule || []),
        scheduleLoading: isPending,
        scheduleError: error,
    };
}

