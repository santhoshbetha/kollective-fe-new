// src/features/trending/useTrendingQuery.js
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useTrendingQuery() {
    const { data, isPending } = useQuery({
        queryKey: ['trending', 'topics'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/trending/tags');
                if (res && (res.topics || res.tags || Array.isArray(res))) {
                    return res;
                }
            } catch (err) {
                console.warn('Backend trending tags fetch failed, falling back to mockApi', err);
            }
            return api.getTrendingTopics();
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return {
        trendingTopics: data?.topics || data?.tags || (Array.isArray(data) ? data : []),
        trendingLoading: isPending,
    };
}

