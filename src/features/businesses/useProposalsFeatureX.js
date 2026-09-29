// src/features/businesses/useProposalsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

// Hook A: Handles lazy-loading the proposal stream list
export function useProposalsQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['proposals', 'stream'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/business_proposals');
                if (res && res.status === 'success' && res.data) {
                    return res.data;
                }
            } catch (e) {
                console.warn('Falling back to mock proposals stream', e);
            }
            return api.getProposals();
        },
        staleTime: 1 * 60 * 1000,
    });

    return {
        proposals: Array.isArray(data) ? data : (data?.proposals || []),
        proposalsLoading: isPending,
        proposalsError: error,
    };
}

// Hook B: Handles single proposal details fetching by ID
export function useProposalDetailsQuery(id) {
    const { data, isPending, error } = useQuery({
        queryKey: ['proposals', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            try {
                const res = await apiFetch(`/business_proposals/${id}`);
                if (res && res.status === 'success' && res.data) {
                    return res.data;
                }
            } catch (e) {
                console.warn('Falling back to mock proposal details by ID', e);
            }
            return api.getProposalById(id);
        },
        enabled: Boolean(id),
        staleTime: 1 * 60 * 1000,
    });

    return {
        proposal: data,
        proposalLoading: isPending,
        proposalError: error,
    };
}

// Hook C: Handles submitting a new community proposal
export function useCreateProposal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (proposalData) => {
            try {
                return await apiFetch('/business_proposals', {
                    method: 'POST',
                    body: JSON.stringify({ proposal: proposalData })
                });
            } catch (err) {
                console.warn('Backend create proposal failed, falling back to mockApi', err);
                return api.createProposal(proposalData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proposals', 'stream'] });
        },
    });
}

// Hook D: Handles casting a vote on an active proposal
export function useVoteOnProposal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ proposalId, voteType }) => {
            try {
                return await apiFetch(`/business_proposals/${proposalId}/votes`, {
                    method: 'POST',
                    body: JSON.stringify({ vote_type: voteType })
                });
            } catch (err) {
                console.warn('Backend vote proposal failed, falling back to mockApi', err);
                return api.voteInPoll(proposalId, voteType);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proposals', 'stream'] });
        },
    });
}
