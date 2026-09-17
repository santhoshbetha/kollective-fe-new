// src/features/profile/usePinnedPostsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

import { usePostsStore } from '../../store/usePostsStore';

// 📌 Query: Pulls the small array of pinned spotlight posts for a specific profile node
export function usePinnedPostsQuery(accountId) {
    return useQuery({
        queryKey: ['profile', accountId, 'pinned-posts'],
        queryFn: async () => {
            return apiFetch(`/api/v1/accounts/${accountId}/posts?pinned=true`); // Returns flat array of statuses
        },
        enabled: !!accountId,
        select: (data) => {
            if (!Array.isArray(data)) return data;
            return usePostsStore.getState().importFetchedPosts(data);
        },
    });
}

// 🔓 Mutation: Dispatches a request to unpin a post and invalidates local caches instantly
export function useUnpinPostMutation(accountId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId) => {
            return apiFetch(`/api/v1/posts/${postId}/unpin`, {
                method: 'POST',
            });
        },
        onSuccess: () => {
            // Refresh the specific user's profile and timeline queries concurrently
            queryClient.invalidateQueries({ queryKey: ['profile', accountId, 'pinned-posts'] });
            queryClient.invalidateQueries({ queryKey: ['timeline'] });
        },
    });
}
