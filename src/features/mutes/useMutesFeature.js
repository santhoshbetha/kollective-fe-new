// src/features/mutes/useMutesFeature.js
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

// 🔇 Infinite Query: Pulls a flat, paginated list of muted account credentials from the server
export function useMutesQuery() {
    return useInfiniteQuery({
        queryKey: ['mutes', 'list'],
        queryFn: async ({ pageParam = null }) => {
            const url = pageParam
                ? `/api/v1/mutes?max_id=${pageParam}`
                : '/api/v1/mutes';
            return apiFetch(url); // Returns an array list of user profile nodes
        },
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
    });
}

// 🔊 Mutation: Transmits an unmute request to the backend and handles instant local data eviction
export function useUnmuteMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accountId) => {
            return apiFetch(`/api/v1/accounts/${accountId}/unmute`, {
                method: 'POST',
            });
        },
        onSuccess: (_, accountId) => {
            // 🛠️ Optimistic Cache Modification: Evicts the unmuted user from the active memory cache block instantly
            queryClient.setQueryData(['mutes', 'list'], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        accounts: (page.accounts || page || []).filter((account) => account.id !== accountId),
                    })),
                };
            });
            // Cascade structural sync to enforce query consistency across alternative feeds
            queryClient.invalidateQueries({ queryKey: ['mutes', 'list'] });
        },
    });
}
