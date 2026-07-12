// src/features/timeline/useBookmarkPost.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { apiFetch } from '../../api/apiClient';

export function useBookmarkPost() {
    const queryClient = useQueryClient();
    const activeTab = useStore((state) => state.homeFeedTab);

    return useMutation({
        // 1. Asynchronous network call to the Elixir backend endpoint
        mutationFn: async (postId) => {
            return apiFetch(`/posts/${postId}/bookmark`, { method: 'POST' });
        },

        // 2. The Optimistic UI Mutation Layer
        onMutate: async (postId) => {
            const queryKey = ['timeline', 'home', activeTab];

            // Cancel any outgoing refetches so they don't overwrite our optimistic state
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the current cache value to use for a rollback on failure
            const previousTimeline = queryClient.getQueryData(queryKey);

            // Optimistically modify the cache immutably
            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        posts: page.posts.map((post) => {
                            if (post.id === postId) {
                                return {
                                    ...post,
                                    bookmarked: !post.bookmarked, // Instantly toggle state
                                };
                            }
                            return post;
                        }),
                    })),
                };
            });

            // Return the rollback snapshot context object
            return { previousTimeline, queryKey };
        },

        // 3. Rollback Guard: If the network fails, revert to the snapshot data
        onError: (err, postId, context) => {
            console.error('Bookmark mutation failed, rolling back UI state:', err);
            if (context?.previousTimeline) {
                queryClient.setQueryData(context.queryKey, context.previousTimeline);
            }
        },

        // 4. Sync Guard: Refetch in the background to guarantee data alignment
        onSettled: (data, error, postId, context) => {
            queryClient.invalidateQueries({ queryKey: context.queryKey });
        },
    });
}
