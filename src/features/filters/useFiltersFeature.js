// src/features/filters/useFiltersFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

// 🔍 Query: Fetches all active content filter rule arrays from the Elixir server
export function useFiltersQuery() {
    return useQuery({
        queryKey: ['filters', 'list'],
        queryFn: async () => {
            return apiFetch('/api/v2/filters'); // Returns an array of filter schema objects
        },
    });
}

// ➕ Mutation: Appends a brand new keyword filter phrase rule securely
export function useCreateFilterMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newFilterPayload) => {
            return apiFetch('/api/v2/filters', {
                method: 'POST',
                body: JSON.stringify(newFilterPayload),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['filters', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['timeline'] }); // Force timelines to re-filter
        },
    });
}

// 🗑️ Mutation: Evicts an existing keyword filter rule instance
export function useDeleteFilterMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (filterId) => {
            return apiFetch(`/api/v2/filters/${filterId}`, {
                method: 'DELETE',
            });
        },
        onSuccess: (_, filterId) => {
            // Local optimistic cache ejection mapping routine
            queryClient.setQueryData(['filters', 'list'], (oldData) => {
                if (!oldData) return oldData;
                return oldData.filter((item) => item.id !== filterId);
            });
            queryClient.invalidateQueries({ queryKey: ['filters', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['timeline'] });
        },
    });
}
