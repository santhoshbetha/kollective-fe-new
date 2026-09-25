// src/features/timeline/useCreatePost.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { apiFetch } from '../../api/apiClient';
import { usePostsStore } from '../../store/usePostsStore';

export function useCreatePost() {
    const queryClient = useQueryClient();
    const activeTab = useStore((state) => state.homeFeedTab);

    return useMutation({
        // 1. Submit the new post schema to your Elixir REST API
        mutationFn: async (postData) => {
            const payload = postData.post ? postData : { post: postData };
            const res = await apiFetch('/posts', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            return res?.data || res?.post || res;
        },

        // 2. Safely synchronize your UI cache on a successful database insert
        onSuccess: (newPost) => {
            // Import the freshly created post into client-side store if available
            if (newPost && (newPost.id || newPost.post?.id)) {
                try {
                    const postToImport = newPost.post ? newPost.post : newPost;
                    usePostsStore.getState().importFetchedPosts([postToImport]);
                } catch (e) {
                    console.error('Failed to import created post into Zustand store', e);
                }
            }

            // Invalidate the active tab timeline query
            queryClient.invalidateQueries({
                queryKey: ['timeline', 'home', activeTab],
            });

            // Invalidate all timeline queries
            queryClient.invalidateQueries({
                queryKey: ['timeline'],
            });

            // Invalidate profile queries so the user's profile timeline updates immediately
            queryClient.invalidateQueries({
                queryKey: ['profile'],
            });
        },
    });
}
