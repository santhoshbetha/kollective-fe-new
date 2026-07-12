// src/features/communities/useCirclesFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

// Hook A: Handles fetching suggested circles
export function useSuggestedCirclesQuery() {
    const { data, isPending } = useQuery({
        queryKey: ['communities', 'suggestions'],
        queryFn: api.getSuggestedCircles,
        staleTime: 3 * 60 * 1000, // 3 minutes in cache
    });

    return {
        suggestedCircles: data?.circles || data || [],
        suggestedCirclesLoading: isPending,
    };
}

// Hook B: Handles toggling a circle membership state (Join / Leave)
export function useToggleJoinCircle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (circleId) => {
            return api.toggleJoinCircle(circleId);
        },
        onSuccess: () => {
            // Invalidate both suggestions and active feeds so states sync immediately
            queryClient.invalidateQueries({ queryKey: ['communities', 'suggestions'] });
            queryClient.invalidateQueries({ queryKey: ['communities', 'feed'] });
        },
    });
}
