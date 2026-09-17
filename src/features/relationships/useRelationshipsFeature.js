// src/features/relationships/useRelationshipsFeature.js
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { useAccountsStore } from '../../store/useAccountsStore';

const getNextCursor = (lastPage) =>
    lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined;

// 📡 Unified Infinite Queries for Relationship Data Streams
export function useRelationshipsQuery({ id, type }) {
    return useInfiniteQuery({
        queryKey: ['profile', id, type],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `?max_id=${pageParam}` : '';
            // Dynamically handles: accounts/:id/followers | accounts/:id/following | follow_requests
            const endpoint = type === 'requests'
                ? `/api/v1/follow_requests${maxIdParam}`
                : `/api/v1/accounts/${id}/${type}${maxIdParam}`;
            return apiFetch(endpoint);
        },
        getNextPageParam: getNextCursor,
        initialPageParam: null,
        enabled: !!id || type === 'requests',
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

// 🏷️ Infinite Query for Followed Metadata Hashtags
export function useFollowedTagsQuery() {
    return useInfiniteQuery({
        queryKey: ['followed-tags', 'list'],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `?max_id=${pageParam}` : '';
            return apiFetch(`/api/v1/followed_tags${maxIdParam}`);
        },
        getNextPageParam: getNextCursor,
        initialPageParam: null,
    });
}

// 🎛️ Dynamic Mutation Matrix Panel
export function useRelationshipMutations(accountId) {
    const queryClient = useQueryClient();

    // Handles follow/unfollow and request actions (authorize/reject)
    return useMutation({
        mutationFn: async ({ id, action }) => {
            const endpoint = matchActionEndpoint(id, action);
            return apiFetch(endpoint, { method: 'POST' });
        },
        onSuccess: (_data, variables) => {
            // Evict items from pending request caches or sync active lists instantly
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (accountId || variables?.id) {
                queryClient.invalidateQueries({ queryKey: ['profile', accountId || variables.id] });
            }
            queryClient.invalidateQueries({ queryKey: ['followed-tags'] });
        }
    });
}

// 🤝 Optimistic follow toggle integrated with normalized Zustand entities
export function useToggleFollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (targetUserId) => {
            return apiFetch(`/api/v1/accounts/${targetUserId}/follow`, { method: 'POST' });
        },
        onMutate: async (targetUserId) => {
            const previousAccount = useAccountsStore.getState().entities[targetUserId];
            if (previousAccount) {
                const isFollowing = !previousAccount.following;
                useAccountsStore.getState().importFetchedAccounts([
                    {
                        ...previousAccount,
                        following: isFollowing,
                        followersCount: isFollowing
                            ? (previousAccount.followersCount || 0) + 1
                            : Math.max(0, (previousAccount.followersCount || 1) - 1),
                    }
                ]);
            }
            return { previousAccount, targetUserId };
        },
        onError: (err, targetUserId, context) => {
            if (context?.previousAccount) {
                useAccountsStore.getState().importFetchedAccounts([context.previousAccount]);
            }
        },
        onSuccess: (data, targetUserId) => {
            if (data) {
                useAccountsStore.getState().importFetchedAccounts([data]);
            }
            queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'history'] });
        },
    });
}

function matchActionEndpoint(id, action) {
    switch (action) {
        case 'authorize': return `/api/v1/follow_requests/${id}/authorize`;
        case 'reject': return `/api/v1/follow_requests/${id}/reject`;
        case 'unfollow': return `/api/v1/accounts/${id}/unfollow`;
        case 'unfollow-tag': return `/api/v1/tags/${id}/unfollow`;
        default: return `/api/v1/accounts/${id}/follow`;
    }
}
