// src/features/polls/useCreatePoll.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useCreatePoll() {
    const queryClient = useQueryClient();

    return useMutation({
        // 1. Deliver the formatted poll payload to your Elixir REST API
        mutationFn: async (pollData) => {
            // pollData structure: { question: "...", options: ["Opt 1", "Opt 2", ...] }
            return apiFetch('/polls', {
                method: 'POST',
                body: JSON.stringify(pollData),
            });
        },

        // 2. Clear out stale stream caches immediately upon a successful creation run
        onSuccess: () => {
            // Invalidate the primary polls stream cache key.
            // This forces the PollsFeed to drop its stale metrics and perform an 
            // immediate background refetch, instantly placing the new poll at the top.
            queryClient.invalidateQueries({
                queryKey: ['polls', 'stream'],
            });
        },
    });
}
