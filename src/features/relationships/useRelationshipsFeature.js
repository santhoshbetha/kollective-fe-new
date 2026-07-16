// src/features/relationships/useRelationshipsFeature.js
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

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
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
        enabled: !!id || type === 'requests',
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
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
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
        onSuccess: (_, variables) => {
            // Evict items from pending request caches or sync active lists instantly
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['followed-tags'] });
        }
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
