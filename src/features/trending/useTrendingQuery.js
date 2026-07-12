// src/features/trending/useTrendingQuery.js
import { useQuery } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

export function useTrendingQuery() {
    const { data, isPending } = useQuery({
        queryKey: ['trending', 'topics'],
        queryFn: api.getTrendingTopics,
        staleTime: 5 * 60 * 1000, // Trending data changes slowly, keep fresh for 5 mins
    });

    return {
        trendingTopics: data?.topics || data || [],
        trendingLoading: isPending,
    };
}
