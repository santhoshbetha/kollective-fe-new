// src/features/events/useCreateEvent.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        // 1. Deliver the structured event variables to your Elixir REST API
        mutationFn: async (eventData) => {
            // eventData is an object: { title: "...", description: "...", date: "...", location: "..." }
            return apiFetch('/events', {
                method: 'POST',
                body: JSON.stringify(eventData),
            });
        },

        // 2. Clear out old stale caches immediately upon a successful creation run
        onSuccess: () => {
            // Invalidate the primary event query array key.
            // This forces the active EventsFeed to dump its stale cache data 
            // and issue a fresh network query to immediately display the new item.
            queryClient.invalidateQueries({
                queryKey: ['events', 'list'],
            });
        },
    });
}
