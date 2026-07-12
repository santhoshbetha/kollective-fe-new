// src/features/polls/usePollsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

// Hook A: Replaces polls and pollsLoading
export function usePollsQuery() {
    const { data, isPending } = useQuery({
        queryKey: ['polls', 'stream'],
        queryFn: api.getPolls,
    });

    return {
        polls: data?.polls || data || [],
        pollsLoading: isPending,
    };
}

// Hook B: Replaces voteInPoll
export function useVoteInPoll() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ pollId, optionIndex }) => {
            return api.voteInPoll(pollId, optionIndex);
        },
        // Triggers a targeted cache invalidation on success
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['polls', 'stream'] });
        },
    });
}
