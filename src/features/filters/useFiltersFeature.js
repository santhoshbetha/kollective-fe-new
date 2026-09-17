// src/features/filters/useFiltersFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

// 🔍 Query: Fetches all active content filter rule arrays from the Elixir server
export function useFiltersQuery() {
    return useQuery({
        queryKey: ['filters', 'list'],
        queryFn: async () => {
            const res = await apiFetch('/api/v1/filters');
            return Array.isArray(res) ? res : (res?.data || []);
        },
    });
}

// ➕ Mutation: Appends a brand new keyword filter phrase rule securely
export function useCreateFilterMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newFilterPayload) => {
            return apiFetch('/api/v1/filters', {
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
            return apiFetch(`/api/v1/filters/${filterId}`, {
                method: 'DELETE',
            });
        },
        onSuccess: (_, filterId) => {
            // Local optimistic cache ejection mapping routine
            queryClient.setQueryData(['filters', 'list'], (oldData) => {
                if (!oldData) return oldData;
                if (Array.isArray(oldData)) {
                    return oldData.filter((item) => item.id !== filterId);
                }
                if (Array.isArray(oldData.data)) {
                    return { ...oldData, data: oldData.data.filter((item) => item.id !== filterId) };
                }
                return oldData;
            });
            queryClient.invalidateQueries({ queryKey: ['filters', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['timeline'] });
        },
    });
}
