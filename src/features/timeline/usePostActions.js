import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { usePostsStore } from '../../store/usePostsStore';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

function updatePostsInCache(oldData, updater) {
    if (!oldData) return oldData;

    if (oldData.pages) {
        return {
            ...oldData,
            pages: oldData.pages.map((page) => {
                const postsList = Array.isArray(page) ? page : (page?.posts || []);
                const updatedPosts = postsList.map(updater);
                return Array.isArray(page) ? updatedPosts : { ...page, posts: updatedPosts };
            }),
        };
    }

    if (Array.isArray(oldData)) {
        return oldData.map(updater);
    }

    if (oldData.posts) {
        return { ...oldData, posts: oldData.posts.map(updater) };
    }

    return oldData;
}

export function usePostActions() {
    const queryClient = useQueryClient();
    const activeTab = useStore((state) => state.homeFeedTab);
    const queryKey = ['timeline', 'home', activeTab];
    const updatePostEntity = usePostsStore((state) => state.updatePostEntity);

    // 1. Toggle Like Mutation
    const likeMutation = useMutation({
        mutationFn: async (postId) => {
            try {
                return await apiFetch(`/posts/${postId}/like`, { method: 'POST' });
            } catch (err) {
                console.warn('Backend like post failed, falling back to mockApi', err);
                return await api.toggleLike(postId);
            }
        },
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey });
            const previousTimeline = queryClient.getQueryData(queryKey);

            // Synchronize normalized Zustand post entity store
            updatePostEntity(postId, (post) => {
                const isLiked = !post.liked;
                const newLikes = isLiked
                    ? (post.likes || post.likesCount || 0) + 1
                    : Math.max(0, (post.likes || post.likesCount || 1) - 1);
                return {
                    ...post,
                    liked: isLiked,
                    has_liked: isLiked,
                    likes: newLikes,
                    likesCount: newLikes,
                    likes_count: newLikes,
                };
            });

            queryClient.setQueryData(queryKey, (oldData) =>
                updatePostsInCache(oldData, (post) => {
                    if (post.id === postId) {
                        const isLiked = !post.liked;
                        const newLikes = isLiked
                            ? (post.likes || post.likesCount || 0) + 1
                            : Math.max(0, (post.likes || post.likesCount || 1) - 1);
                        return {
                            ...post,
                            liked: isLiked,
                            has_liked: isLiked,
                            likes: newLikes,
                            likesCount: newLikes,
                            likes_count: newLikes,
                        };
                    }
                    return post;
                })
            );

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
        mutationFn: async (postId) => {
            try {
                return await apiFetch(`/posts/${postId}/reblog`, { method: 'POST' });
            } catch (err) {
                console.warn('Backend reblog post failed, falling back to mockApi', err);
                return await api.toggleReblog(postId);
            }
        },
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey });
            const previousTimeline = queryClient.getQueryData(queryKey);

            updatePostEntity(postId, (post) => {
                const isReblogged = !post.reblogged;
                const newCount = isReblogged
                    ? (post.reblogsCount || post.reblogs_count || 0) + 1
                    : Math.max(0, (post.reblogsCount || post.reblogs_count || 1) - 1);
                return {
                    ...post,
                    reblogged: isReblogged,
                    has_reblogged: isReblogged,
                    reblogsCount: newCount,
                    reblogs_count: newCount,
                };
            });

            queryClient.setQueryData(queryKey, (oldData) =>
                updatePostsInCache(oldData, (post) => {
                    if (post.id === postId) {
                        const isReblogged = !post.reblogged;
                        const newCount = isReblogged
                            ? (post.reblogsCount || post.reblogs_count || 0) + 1
                            : Math.max(0, (post.reblogsCount || post.reblogs_count || 1) - 1);
                        return {
                            ...post,
                            reblogged: isReblogged,
                            has_reblogged: isReblogged,
                            reblogsCount: newCount,
                            reblogs_count: newCount,
                        };
                    }
                    return post;
                })
            );

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
        mutationFn: async (postId) => {
            try {
                return await apiFetch(`/posts/${postId}/bookmark`, { method: 'POST' });
            } catch (err) {
                console.warn('Backend bookmark post failed, falling back to mockApi', err);
                return await api.toggleBookmark(postId);
            }
        },
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey });
            const previousTimeline = queryClient.getQueryData(queryKey);

            updatePostEntity(postId, (post) => ({ ...post, bookmarked: !post.bookmarked }));

            queryClient.setQueryData(queryKey, (oldData) =>
                updatePostsInCache(oldData, (post) =>
                    post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post
                )
            );

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
