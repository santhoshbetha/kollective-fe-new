// src/features/suggestions/useSuggestionsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

// 📡 Query: Fetches a list of recommended accounts to follow from the local node registry
export function useSuggestionsQuery() {
    return useQuery({
        queryKey: ['suggestions', 'list'],
        queryFn: async () => {
            return apiFetch('/api/v1/suggestions'); // Returns array of account suggestions
        },
    });
}

// 🎛️ Mutation: Dispatches a quick follow command and updates local recommendations array mappings
export function useSuggestionFollowMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accountId) => {
            return apiFetch(`/api/v1/accounts/${accountId}/follow`, { method: 'POST' });
        },
        onSuccess: (_, accountId) => {
            // Optimistic cache cleanup: Remove the newly followed account from suggestions list instantly
            queryClient.setQueryData(['suggestions', 'list'], (oldData) => {
                if (!oldData) return oldData;
                return oldData.filter((item) => (item.id || item.account?.id) !== accountId);
            });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}
