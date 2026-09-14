// src/features/blocks/useBlocksFeature.js
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

// 🛑 Infinite Query: Fetches a flat, virtualized list of blocked user profiles from the server
export function useBlocksQuery() {
    return useInfiniteQuery({
        queryKey: ['blocks', 'list'],
        queryFn: async ({ pageParam = null }) => {
            const url = pageParam
                ? `/api/v1/blocks?max_id=${pageParam}`
                : '/api/v1/blocks';
            return apiFetch(url); // Returns an array of account objects
        },
        getNextPageParam: (lastPage) =>
            lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
        initialPageParam: null,
    });
}

// 🔓 Mutation: Dispatches a request to unblock an account and flushes the query data cache
export function useUnblockMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accountId) => {
            return apiFetch(`/api/v1/accounts/${accountId}/unblock`, {
                method: 'POST',
            });
        },
        onSuccess: (_, accountId) => {
            // 🛠️ Highly Optimized Cache Eviction: Instantly filters the unblocked user out of the cache list
            queryClient.setQueryData(['blocks', 'list'], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => {
                        if (Array.isArray(page)) {
                            return page.filter((account) => account.id !== accountId);
                        }
                        return {
                            ...page,
                            accounts: (page.accounts || []).filter((account) => account.id !== accountId),
                        };
                    }),
                };
            });
            // Fallback query syncing
            queryClient.invalidateQueries({ queryKey: ['blocks', 'list'] });
        },
    });
}
