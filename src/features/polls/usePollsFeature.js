// src/features/polls/usePollsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

// Hook A: Replaces polls and pollsLoading
export function usePollsQuery(scope = 'all', status = 'All', country = null) {
    const { data, isPending } = useQuery({
        queryKey: ['polls', 'stream', scope, status, country],
        queryFn: async () => {
            try {
                let path = `/polls/stream?scope=${encodeURIComponent(scope)}`;
                if (status && status !== 'All') {
                    path += `&status=${encodeURIComponent(status)}`;
                }
                if (country) {
                    path += `&country=${encodeURIComponent(country)}`;
                }
                const res = await apiFetch(path);
                return res?.data || res?.polls || res;
            } catch (err) {
                console.warn('Backend polls query failed, falling back to mockApi', err);
                return api.getPolls();
            }
        },
    });

    return {
        polls: Array.isArray(data) ? data : (data?.polls || []),
        pollsLoading: isPending,
    };
}

// Hook B: Replaces voteInPoll
export function useVoteInPoll() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ pollId, optionIndex }) => {
            try {
                return await apiFetch(`/polls/${pollId}/votes`, {
                    method: 'POST',
                    body: JSON.stringify({ choices: [optionIndex] })
                });
            } catch (err) {
                console.warn('Backend vote poll failed, falling back to mockApi', err);
                return api.voteInPoll(pollId, optionIndex);
            }
        },
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


