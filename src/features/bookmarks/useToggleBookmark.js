// src/features/bookmarks/useToggleBookmark.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { useInvalidateBookmarkTrigger } from '../search/useGlobalSearch';
import { usePostsStore } from '../../store/usePostsStore';

/**
 * 🚀 PRODUCTION-GRADE BOOKMARK MUTATION:
 * Toggles a post's bookmark parameter and surgically modifies the TanStack Cache
 */
export function useToggleBookmark() {
    const queryClient = useQueryClient();
    const { ejectFromBookmarksCache } = useInvalidateBookmarkTrigger();

    return useMutation({
        mutationFn: async ({ postId, isCurrentlyBookmarked }) => {
            // Standard route toggle method configuration
            const method = isCurrentlyBookmarked ? 'DELETE' : 'POST';
            const res = await apiFetch(`/posts/${postId}/bookmark`, { method });
            return res?.data || res;
        },

        // ⚡ ATOMIC OPTIMISTIC FEEDBACK ENGINE:
        onMutate: async ({ postId, isCurrentlyBookmarked }) => {
            // Cancel outgoing fetches across the timeline and bookmarks scopes to dodge race drops
            await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
            await queryClient.cancelQueries({ queryKey: ['timeline'] });

            const targetBookmarkedState = !isCurrentlyBookmarked;

            // 1. Instantly flip the state indicator inside your client Zustand entity store
            const store = usePostsStore.getState();
            if (store.entities && store.entities[postId]) {
                store.importFetchedPosts([{
                    ...store.entities[postId],
                    bookmarked: targetBookmarkedState,
                    isBookmarked: targetBookmarkedState
                }]);
            }

            // 2. If it was unbookmarked, surgically evict it from the Bookmarks virtual list cache
            if (!targetBookmarkedState) {
                ejectFromBookmarksCache(postId);
            }

            return { postId, isCurrentlyBookmarked };
        },

        // Ensure cross-timeline cache matrices synchronize cleanly in the background
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline', 'posts'] });
        }
    });
}
