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

export function useCryptographicVote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ pollId, optionId }) => {
            // 🎟️ STEP 1: Fetch a single-use blind token from the Auth pipeline
            const { votingToken } = await apiFetch(`/polls/${pollId}/request-token`, {
                method: 'POST'
            });

            // 🗳️ STEP 2: Deliver ONLY the option and token to the Ballot pipeline
            return apiFetch(`/polls/${pollId}/cast-vote`, {
                method: 'POST',
                body: JSON.stringify({
                    option_id: optionId,
                    proof_token: votingToken // 🔒 Zero account tracking markers sent here!
                }),
            });
        },
        onSuccess: () => {
            // Invalidate the active stream immediately to update percentages
            queryClient.invalidateQueries({ queryKey: ['polls', 'stream'] });
        },
    });
}


