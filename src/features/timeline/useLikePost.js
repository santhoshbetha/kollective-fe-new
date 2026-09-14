// src/features/timeline/useLikePost.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { apiFetch } from '../../api/apiClient';

export function useLikePost() {
    const queryClient = useQueryClient();
    const activeTab = useStore((state) => state.homeFeedTab);

    return useMutation({
        // 1. The actual network call to the Elixir REST endpoint
        mutationFn: async (postId) => {
            return apiFetch(`/api/v1/posts/${postId}/like`, { method: 'POST' });
        },

        // 2. The Optimistic UI Mutation Layer
        onMutate: async (postId) => {
            const queryKey = ['timeline', 'home', activeTab];

            // Cancel outgoing refetches so they don't overwrite our optimistic state
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the current cache value to use for a rollback on failure
            const previousTimeline = queryClient.getQueryData(queryKey);

            // Optimistically modify the cache immutably
            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) return oldData;

                const updatePost = (post) => {
                    if (post.id === postId) {
                        const isNowLiked = !post.liked;
                        return {
                            ...post,
                            liked: isNowLiked,
                            likesCount: isNowLiked
                                ? (post.likesCount || 0) + 1
                                : Math.max(0, (post.likesCount || 1) - 1),
                        };
                    }
                    return post;
                };

                if (oldData.pages) {
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => {
                            const postsList = Array.isArray(page) ? page : (page?.posts || []);
                            const updatedPosts = postsList.map(updatePost);
                            return Array.isArray(page) ? updatedPosts : { ...page, posts: updatedPosts };
                        }),
                    };
                }

                if (Array.isArray(oldData)) {
                    return oldData.map(updatePost);
                }

                if (oldData.posts) {
                    return { ...oldData, posts: oldData.posts.map(updatePost) };
                }

                return oldData;
            });

            // Return the rollback snapshot context object
            return { previousTimeline, queryKey };
        },

        // 3. Rollback Guard: If the network fails, revert to the snapshot data
        onError: (err, postId, context) => {
            console.error('Like mutation failed, rolling back UI state:', err);
            if (context?.previousTimeline) {
                queryClient.setQueryData(context.queryKey, context.previousTimeline);
            }
        },

        // 4. Sync Guard: Always refetch in the background to ensure data alignment
        onSettled: (data, error, postId, context) => {
            if (context?.queryKey) {
                queryClient.invalidateQueries({ queryKey: context.queryKey });
            }
        },
    });
}
