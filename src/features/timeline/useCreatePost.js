// src/features/timeline/useCreatePost.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useCreatePost() {
    const queryClient = useQueryClient();

    // Read the active tab so we know which specific timeline cache to refresh
    const activeTab = useStore((state) => state.homeFeedTab);

    return useMutation({
        // 1. Submit the new post schema to your Elixir REST API
        mutationFn: async (postData) => {
            // postData is an object: { content: "..." }
            //return apiFetch('/posts', {
            //    method: 'POST',
            //    body: JSON.stringify(postData),
            //});
            return api.createPost(postData);
        },

        // 2. Safely synchronize your UI cache on a successful database insert
        onSuccess: () => {
            // Invalidate the active tab timeline query.
            // This tells TanStack Query that the cache data is stale, prompting an
            // immediate network refetch to pull down the newly inserted post.
            queryClient.invalidateQueries({
                queryKey: ['timeline', 'home', activeTab],
            });

            // Optional: Invalidate 'All Activity' too if you want it updated globally
            if (activeTab !== 'All Activity') {
                queryClient.invalidateQueries({
                    queryKey: ['timeline', 'home', 'All Activity'],
                });
            }
        },
    });
}
