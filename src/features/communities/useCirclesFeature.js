// src/features/communities/useCirclesFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

// Hook A: Handles fetching suggested circles
export function useSuggestedCirclesQuery() {
    const { data, isPending } = useQuery({
        queryKey: ['communities', 'suggestions'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/organizations/search');
                return res?.data || res?.circles || res;
            } catch (err) {
                console.warn('Backend suggested circles failed, falling back to mockApi', err);
                return api.getSuggestedCircles();
            }
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    return {
        suggestedCircles: Array.isArray(data) ? data : (data?.circles || []),
        suggestedCirclesLoading: isPending,
    };
}


// Hook B: Handles toggling a circle membership state (Join / Leave)
export function useToggleJoinCircle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (circleId) => {
            try {
                return await apiFetch(`/organizations/${circleId}/join`, { method: 'POST' });
            } catch (err) {
                console.warn('Backend toggle circle join failed, falling back to mockApi', err);
                return api.toggleJoinCircle(circleId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communities', 'suggestions'] });
            queryClient.invalidateQueries({ queryKey: ['communities', 'feed'] });
        },
    });
}

