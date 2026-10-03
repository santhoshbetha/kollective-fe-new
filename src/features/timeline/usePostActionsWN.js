import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { usePostsStore } from '../../store/usePostsStore';
import { apiFetch } from '../../api/apiClient';
import { useInvalidateBookmarkTrigger } from '../search/useGlobalSearch';

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

export function usePostActions(currentThreadId = null) {
    const queryClient = useQueryClient();
    const activeTab = useStore((state) => state.homeFeedTab);
    const { ejectFromBookmarksCache } = useInvalidateBookmarkTrigger();

    // 🚀 THE SYNCING FIX: Track dynamic key variations across timelines AND thread containers
    const homeTimelineKey = ['timeline', 'home', activeTab];
    const activeThreadKey = currentThreadId ? ['post', currentThreadId, 'thread'] : null;

    const updatePostEntity = usePostsStore((state) => state.updatePostEntity);

    // Dynamic cache update atomic mutator helper
    const syncAllCacheQueries = (postId, updater) => {
        // 1. Sync Zustand store
        if (typeof updatePostEntity === 'function') {
            updatePostEntity(postId, updater);
        }

        // 2. Sync Timeline Query Data
        queryClient.setQueryData(homeTimelineKey, (oldData) => updatePostsInCache(oldData, (p) => p.id === postId ? updater(p) : p));

        // 3. Sync Active Thread View Context Query Data
        if (activeThreadKey) {
            queryClient.setQueryData(activeThreadKey, (oldData) => {
                if (!oldData) return oldData;

                // Unpack ancestors/descendants lists if wrapped inside standard unified layout structures
                const updateList = (list) => Array.isArray(list) ? list.map((p) => p.id === postId ? updater(p) : p) : list;

                return {
                    ...oldData,
                    ancestors: updateList(oldData.ancestors),
                    focus: oldData.focus?.id === postId ? updater(oldData.focus) : oldData.focus,
                    descendants: updateList(oldData.descendants),
                    // Protect internal backed backing payloads
                    ...(oldData._raw ? {
                        _raw: {
                            ...oldData._raw,
                            ancestors: updateList(oldData._raw.ancestors),
                            focus: oldData._raw.focus?.id === postId ? updater(oldData._raw.focus) : oldData._raw.focus,
                            descendants: updateList(oldData._raw.descendants),
                        }
                    } : {})
                };
            });
        }
    };

    // 1. Toggle Reblog (Boost) Mutation
    const reblogMutation = useMutation({
        mutationFn: async (postId) => {
            // 🚀 REMOVED THE GUARD SHORT-CIRCUIT: Let the fetch fire so it hits your Elixir context toggle block!
            const res = await apiFetch(`/posts/${postId}/reblog`, { method: 'POST' });
            return res?.data || res;
        },
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: homeTimelineKey });
            if (activeThreadKey) await queryClient.cancelQueries({ queryKey: activeThreadKey });

            const prevTimeline = queryClient.getQueryData(homeTimelineKey);
            const prevThread = activeThreadKey ? queryClient.getQueryData(activeThreadKey) : null;

            syncAllCacheQueries(postId, (post) => {
                const isReblogged = !(post.reblogged || post.has_reblogged);
                const currentCount = post.reblogsCount || post.reblogs_count || post.shares || 0;
                const newCount = isReblogged ? currentCount + 1 : Math.max(0, currentCount - 1);

                return {
                    ...post,
                    reblogged: isReblogged,
                    has_reblogged: isReblogged,
                    reblogsCount: newCount,
                    reblogs_count: newCount,
                    shares: newCount,
                };
            });

            return { prevTimeline, prevThread };
        },
        onSuccess: (data, postId) => {
            if (data && data.id) {
                // Ensure backend confirmation shapes update the store fields securely
                syncAllCacheQueries(data.id, (post) => ({
                    ...post,
                    ...data,
                    reblogged: data.reblogged ?? post.reblogged,
                    has_reblogged: data.has_reblogged ?? post.has_reblogged,
                    reblogsCount: data.reblogsCount ?? data.reblogs_count ?? post.reblogsCount,
                    reblogs_count: data.reblogs_count ?? data.reblogsCount ?? post.reblogs_count,
                }));
            }
        },
        onError: (err, id, context) => {
            if (context?.prevTimeline) queryClient.setQueryData(homeTimelineKey, context.prevTimeline);
            if (context?.prevThread && activeThreadKey) queryClient.setQueryData(activeThreadKey, context.prevThread);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline'], refetchType: 'none' });
            if (activeThreadKey) queryClient.invalidateQueries({ queryKey: activeThreadKey, refetchType: 'none' });
        },
    });

    // 2. Toggle Like Mutation
    const likeMutation = useMutation({
        mutationFn: async (postId) => {
            return await apiFetch(`/posts/${postId}/like`, { method: 'POST' });
        },
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: homeTimelineKey });
            if (activeThreadKey) await queryClient.cancelQueries({ queryKey: activeThreadKey });

            const prevTimeline = queryClient.getQueryData(homeTimelineKey);
            const prevThread = activeThreadKey ? queryClient.getQueryData(activeThreadKey) : null;

            syncAllCacheQueries(postId, (post) => {
                const isLiked = !post.liked;
                const newLikes = isLiked
                    ? (post.likes || post.likes_count || 0) + 1
                    : Math.max(0, (post.likes || post.likes_count || 1) - 1);
                return {
                    ...post,
                    liked: isLiked,
                    has_liked: isLiked,
                    likes: newLikes,
                    likes_count: newLikes,
                    likesCount: newLikes
                };
            });

            return { prevTimeline, prevThread };
        },
        onError: (err, id, context) => {
            if (context?.prevTimeline) queryClient.setQueryData(homeTimelineKey, context.prevTimeline);
            if (context?.prevThread && activeThreadKey) queryClient.setQueryData(activeThreadKey, context.prevThread);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: homeTimelineKey, refetchType: 'none' });
            if (activeThreadKey) queryClient.invalidateQueries({ queryKey: activeThreadKey, refetchType: 'none' });
        },
    });

    // 3. Toggle Bookmark Mutation
    const bookmarkMutation = useMutation({
        mutationFn: async ({ postId, isCurrentlyBookmarked, reblogId }) => {
            // 🚀 TARGET FALLTHROUGH: Always dispatch network request against original content ID
            const targetId = reblogId || postId;
            const method = isCurrentlyBookmarked ? 'DELETE' : 'POST';
            console.log("bookmarkMutation postId", postId, reblogId, "method", method);
            return await apiFetch(`/posts/${targetId}/bookmark`, { method });
        },
        onMutate: async ({ postId, isCurrentlyBookmarked, reblogId }) => {
            const targetId = reblogId || postId;
            await queryClient.cancelQueries({ queryKey: homeTimelineKey });
            await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
            const nextBookmarkedState = !isCurrentlyBookmarked;
            // 1. Sync React Query caching layers
            if (typeof syncAllCacheQueries === 'function') {
                syncAllCacheQueries(targetId, (p) => ({ ...p, bookmarked: nextBookmarkedState }));
                if (reblogId) {
                    syncAllCacheQueries(postId, (p) => ({ ...p, bookmarked: nextBookmarkedState }));
                }
            }
            // 2. 🚀 ZUSTAND MUTATION UPGRADE: Update original target AND wrapper entities concurrently
            const store = usePostsStore.getState();
            const updatesBatch = [];

            // Update the source content entity reference
            if (store.entities[targetId]) {
                updatesBatch.push({
                    ...store.entities[targetId],
                    bookmarked: nextBookmarkedState,
                    isBookmarked: nextBookmarkedState
                });
            }
            // Update the timeline wrapper post reference if dealing with a reblog
            if (reblogId && store.entities[postId]) {
                updatesBatch.push({
                    ...store.entities[postId],
                    bookmarked: nextBookmarkedState,
                    isBookmarked: nextBookmarkedState,
                    reblog: {
                        ...store.entities[postId].reblog,
                        bookmarked: nextBookmarkedState,
                        isBookmarked: nextBookmarkedState
                    }
                });
            }
            if (updatesBatch.length > 0) {
                store.importFetchedPosts(updatesBatch);
            }
            // 3. Invalidation cache eviction clean up triggers
            if (!nextBookmarkedState) {
                ejectFromBookmarksCache(targetId);
            }
            return { targetId };
        },
        onError: (err, { targetId }, context) => {
            if (context?.targetId) {
                // Restore React Query cache
                queryClient.invalidateQueries({ queryKey: homeTimelineKey });
                queryClient.invalidateQueries({ queryKey: ['bookmarks'] });

                // Restore Zustand cache state
                const store = usePostsStore.getState();
                const entity = store.entities[context.targetId];

                if (entity) {
                    const wasBookmarked = entity.bookmarked || entity.isBookmarked;
                    store.importFetchedPosts([
                        {
                            ...entity,
                            bookmarked: !wasBookmarked,
                            isBookmarked: !wasBookmarked
                        }
                    ]);
                }
            }
        },
        onSettled: (data, error, { targetId }, context) => {
            if (!error) {
                // Network successful → Evict cache and refresh stale data
                ejectFromBookmarksCache(targetId);

                queryClient.invalidateQueries({
                    queryKey: homeTimelineKey,
                    refetchType: 'none'
                });

                queryClient.invalidateQueries({
                    queryKey: ['timeline', 'bookmarks'],
                    refetchType: 'none'
                });

                // Refresh related queries that depend on the bookmark state
                queryClient.invalidateQueries({
                    queryKey: ['posts', targetId],
                    refetchType: 'none'
                });
            }
        }
    });

    return {
        toggleLike: (id) => likeMutation.mutate(id),
        // 🚀 REMOVED THE EXTERNAL SHORT-CIRCUIT GUARD AT THE TRIGGER
        toggleReblog: (id) => reblogMutation.mutate(id),
        toggleBookmark: (id) => bookmarkMutation.mutate(id),
        isActionPending: likeMutation.isPending || reblogMutation.isPending || bookmarkMutation.isPending,
    };
}
