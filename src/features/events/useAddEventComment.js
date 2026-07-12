// src/features/events/useAddEventComment.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useAddEventComment(eventId) {
    const queryClient = useQueryClient();

    return useMutation({
        // 1. Post the textual parameter directly to the Elixir event conversation endpoint
        mutationFn: async (commentText) => {
            return apiFetch(`/events/${eventId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content: commentText }),
            });
        },

        // 2. Refresh the event's detailed information logs on success
        onSuccess: () => {
            // Invalidate the cache for this specific event's details.
            // This tells TanStack Query to immediately pull down the updated conversation list.
            queryClient.invalidateQueries({
                queryKey: ['event', eventId, 'details'],
            });
        },
    });
}
