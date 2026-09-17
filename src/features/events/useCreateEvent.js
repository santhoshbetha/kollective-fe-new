// src/features/events/useCreateEvent.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventData) => {
            const payload = eventData.event ? eventData : { event: eventData };
            try {
                const res = await apiFetch('/events', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                if (res && (res.data || res.status === 'ok' || res.id)) {
                    return res.data || res;
                }
            } catch (err) {
                console.warn('Backend create event failed, falling back to mockApi', err);
            }
            return api.createEvent ? api.createEvent(eventData) : eventData;
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
