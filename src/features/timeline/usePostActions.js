// src/features/timeline/usePostActions.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import * as api from '../../api/mockApi';

export function usePostActions() {
    const queryClient = useQueryClient();
    const activeTab = useStore((state) => state.homeFeedTab);
    const queryKey = ['timeline', 'home', activeTab];

    // 1. Toggle Like Mutation
    const likeMutation = useMutation({
        mutationFn: api.toggleLike,
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey });
            const previousTimeline = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        posts: page.posts.map((post) => {
                            if (post.id === postId) {
                                const isLiked = !post.liked;
                                return {
                                    ...post,
                                    liked: isLiked,
                                    likesCount: isLiked ? (post.likesCount || 0) + 1 : (post.likesCount || 1) - 1,
                                };
                            }
                            return post;
                        }),
                    })),
                };
            });

            return { previousTimeline };
        },
        onError: (err, id, context) => {
            if (context?.previousTimeline) queryClient.setQueryData(queryKey, context.previousTimeline);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // 2. Toggle Reblog (Boost) Mutation
    const reblogMutation = useMutation({
        mutationFn: api.toggleReblog,
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey });
            const previousTimeline = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        posts: page.posts.map((post) => {
                            if (post.id === postId) {
                                const isReblogged = !post.reblogged;
                                return {
                                    ...post,
                                    reblogged: isReblogged,
                                    reblogsCount: isReblogged ? (post.reblogsCount || 0) + 1 : (post.reblogsCount || 1) - 1,
                                };
                            }
                            return post;
                        }),
                    })),
                };
            });

            return { previousTimeline };
        },
        onError: (err, id, context) => {
            if (context?.previousTimeline) queryClient.setQueryData(queryKey, context.previousTimeline);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // 3. Toggle Bookmark Mutation
    const bookmarkMutation = useMutation({
        mutationFn: api.toggleBookmark,
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey });
            const previousTimeline = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        posts: page.posts.map((post) => (
                            post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post
                        )),
                    })),
                };
            });

            return { previousTimeline };
        },
        onError: (err, id, context) => {
            if (context?.previousTimeline) queryClient.setQueryData(queryKey, context.previousTimeline);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
            queryClient.invalidateQueries({ queryKey: ['timeline', 'bookmarks'] }); // Sync private bookmarks tab
        },
    });

    return {
        toggleLike: (id) => likeMutation.mutate(id),
        toggleReblog: (id) => reblogMutation.mutate(id),
        toggleBookmark: (id) => bookmarkMutation.mutate(id),
        isActionPending: likeMutation.isPending || reblogMutation.isPending || bookmarkMutation.isPending,
    };
}
