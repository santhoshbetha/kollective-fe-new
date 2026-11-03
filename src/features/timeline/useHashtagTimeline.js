// src/features/timeline/useHashtagTimeline.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

// 📡 Query: Streams a feed tracking specific topical hashtags
export function useHashtagTimelineQuery(tagId) {
    return useQuery({
        queryKey: ['timelines', 'hashtag', tagId],
        queryFn: async () => {
            if (!tagId) return { posts: [] };
            const cleanTag = encodeURIComponent(String(tagId).trim().toLowerCase());
            return apiFetch(`/api/v1/timelines/tag/${cleanTag}`);
        },
        enabled: !!tagId,
    });
}

// 🎛️ Mutation: Toggles relationship follow/unfollow boundaries over specific topic nodes
export function useFollowTagMutation(tagId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ isFollowing }) => {
            const cleanTag = encodeURIComponent(String(tagId).trim().toLowerCase());
            const method = 'POST';
            const endpoint = isFollowing ? `/api/v1/tags/${cleanTag}/unfollow` : `/api/v1/tags/${cleanTag}/follow`;
            return apiFetch(endpoint, { method });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timelines', 'hashtag', tagId] });
            queryClient.invalidateQueries({ queryKey: ['followed_tags'] });
            queryClient.invalidateQueries({ queryKey: ['followed-tags'] });
        }
    });
}
