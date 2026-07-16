// src/features/timelines/useHashtagTimeline.js
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

// 📡 Infinite Query: Streams an incremental virtualized feed tracking specific topical hashtags
export function useHashtagTimelineQuery(tagId) {
    return useInfiniteQuery({
        queryKey: ['timelines', 'hashtag', tagId],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `?max_id=${pageParam}` : '';
            return apiFetch(`/api/v1/timelines/tag/${tagId}${maxIdParam}`); // Returns status array
        },
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
        enabled: !!tagId,
    });
}

// 🎛️ Mutation: Toggles relationship follow/unfollow boundaries over specific topic nodes
export function useFollowTagMutation(tagId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ isFollowing }) => {
            const method = 'POST';
            const endpoint = isFollowing ? `/api/v1/tags/${tagId}/unfollow` : `/api/v1/tags/${tagId}/follow`;
            return apiFetch(endpoint, { method });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timelines', 'hashtag', tagId] });
            queryClient.invalidateQueries({ queryKey: ['followed-tags'] });
        }
    });
}
