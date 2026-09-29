// src/hooks/useThreadWebSocketSync.js
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePostsStore } from '../store/usePostsStore';

export function useThreadWebSocketSync(currentPostId, phoenixSocketInstance) {
    const queryClient = useQueryClient();
    const threadKey = ['post', currentPostId, 'thread'];
    const importFetchedPosts = usePostsStore((state) => state.importFetchedPosts);
    const updatePostEntity = usePostsStore((state) => state.updatePostEntity);

    useEffect(() => {
        if (!currentPostId || !phoenixSocketInstance) return;

        // Establish channel attachment to the specific post details room topic pipeline
        const channel = phoenixSocketInstance.channel(`post_details:${currentPostId}`, {});

        channel.join()
            .receive("ok", () => console.log(`Successfully synced real-time data for post ${currentPostId}`))
            .receive("error", resp => console.error("Real-time join rejected", resp));

        // 🚀 Event A: Capture incoming streaming thread comments live
        channel.on("new_reply", ({ reply, author_shadow_banned }) => {
            if (author_shadow_banned) return; // Filter out shadow-banned noise instantly

            // Sync Zustand dictionary first
            usePostsStore.getState().importFetchedPosts([reply]);

            // Append safely to the TanStack structural cache loop array
            queryClient.setQueryData(threadKey, (oldData) => {
                if (!oldData) return oldData;
                const currentDescendants = Array.isArray(oldData.descendants) ? oldData.descendants : [];

                // Prevent duplicate elements if the author is the local poster
                if (currentDescendants.some(item => item.id === reply.id || item.id === `temp-${reply.id}`)) {
                    return oldData;
                }

                return {
                    ...oldData,
                    descendants: [...currentDescendants, reply]
                };
            });
        });

        // 🚀 Event B: Sync real-time engagement metric adjustments
        channel.on("metrics_updated", ({ post_id, likes_count, reblogs_count, replies_count }) => {
            const updater = (post) => ({
                ...post,
                likes_count: likes_count ?? post.likes_count,
                reblogs_count: reblogs_count ?? post.reblogs_count,
                replies_count: replies_count ?? post.replies_count
            });

            // Update local state store
            updatePostEntity(post_id, updater);

            // Mutate current active viewport cache list items safely
            queryClient.setQueryData(threadKey, (oldData) => {
                if (!oldData) return oldData;
                const updateList = (list) => Array.isArray(list) ? list.map(p => p.id === post_id ? updater(p) : p) : list;
                return {
                    ...oldData,
                    ancestors: updateList(oldData.ancestors),
                    focus: oldData.focus?.id === post_id ? updater(oldData.focus) : oldData.focus,
                    descendants: updateList(oldData.descendants)
                };
            });
        });

        return () => {
            channel.leave();
        };
    }, [currentPostId, phoenixSocketInstance, queryClient]);
}
