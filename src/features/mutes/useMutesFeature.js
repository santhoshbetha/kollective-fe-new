// src/features/mutes/useMutesFeature.js
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

import { useAccountsStore } from '../../store/useAccountsStore';

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
        getNextPageParam: (lastPage) =>
            lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
        initialPageParam: null,
        select: (data) => {
            if (data?.pages) {
                const importFetchedAccounts = useAccountsStore.getState().importFetchedAccounts;
                data.pages.forEach((page) => {
                    if (!page) return;
                    const rawAccounts = Array.isArray(page) ? page : page.accounts || [];
                    if (rawAccounts.length > 0) importFetchedAccounts(rawAccounts);
                });
            }
            return data;
        },
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
            // Cascade structural sync to enforce query consistency across alternative feeds
            queryClient.invalidateQueries({ queryKey: ['mutes', 'list'] });
        },
    });
}
