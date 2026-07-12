// src/features/proposals/useProposalsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

// Hook A: Handles lazy-loading the proposal stream list
export function useProposalsQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['proposals', 'stream'],
        queryFn: api.getProposals,
        staleTime: 1 * 60 * 1000, // 1 minute cache validity
    });

    return {
        proposals: data?.proposals || data || [],
        proposalsLoading: isPending,
        proposalsError: error,
    };
}

// Hook B: Handles submitting a new community proposal
export function useCreateProposal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (proposalData) => {
            // proposalData structure: { title: "...", description: "...", budget: "..." }
            return api.createProposal(proposalData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proposals', 'stream'] });
        },
    });
}

// Hook C: Handles casting a vote on an active proposal
export function useVoteOnProposal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ proposalId, voteType }) => {
            // voteType can be 'sponsor' or 'abstain' / 'veto' depending on your api rules
            return api.voteInPoll(proposalId, voteType);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proposals', 'stream'] });
        },
    });
}
