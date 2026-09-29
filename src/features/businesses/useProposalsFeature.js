// src/features/businesses/useProposalsFeature.js
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

/**
 * 📡 Hook A: Fetches a baseline, non-paginated listing array of business proposals
 */
export function useProposalsQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['proposals', 'stream'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/business_proposals');
                if (res && (res.status === 'success' || res.data)) {
                    return res.data || res;
                }
            } catch (e) {
                console.warn('apiFetch failed for proposals query, falling back to mock proposals stream', e);
            }
            return api.getProposals ? api.getProposals() : [];
        },
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    const parsedList = data?.proposals || data?.data || (Array.isArray(data) ? data : []);

    return {
        proposals: parsedList,
        proposalsLoading: isPending,
        proposalsError: error,
    };
}

/**
 * 🚀 UPGRADED INFINITE QUERY: Cursor-based paginated community proposals scroller
 * Automatically handles sequential record batch loading inside virtualized view canvases.
 */
export function useInfiniteProposalsQuery(filterMode = 'All') {
    return useInfiniteQuery({
        queryKey: ['proposals', 'infinite', filterMode],
        queryFn: async ({ pageParam = null }) => {
            const cursorParam = pageParam ? `?cursor=${pageParam}` : '';
            const filterParam = filterMode !== 'All' ? `&filter=${filterMode}` : '';

            const res = await apiFetch(`/business_proposals/paginated${cursorParam}${filterParam}`);
            return res?.data || res; // Expects layout envelope: { proposals: [...], next_cursor: "ULID" }
        },
        getNextPageParam: (lastPage) => lastPage?.next_cursor || undefined,
        initialPageParam: null,
        staleTime: 30 * 1000,
    });
}

/**
 * 📝 Hook B: Fetches deep profile parameters for a specific proposal item by ID
 */
export function useProposalDetailsQuery(id) {
    const { data, isPending, error } = useQuery({
        queryKey: ['proposals', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            try {
                const res = await apiFetch(`/business_proposals/${id}`);
                if (res && (res.status === 'success' || res.data)) {
                    return res.data || res;
                }
            } catch (e) {
                console.warn('apiFetch failed for proposal detail, falling back to mock details by ID', e);
            }
            return api.getProposalById ? api.getProposalById(id) : null;
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

/**
 * 🪐 MICRO INTERCEPTOR: Deep, multi-tier abstract structural query cache updating utility
 * Safely processes cache structures across flat arrays, map scopes, and infinite timeline pages.
 */
const performProposalCacheUpdate = (queryClient, partialKey, targetId, transformer) => {
    queryClient.setQueriesData({ queryKey: partialKey }, (oldCache) => {
        if (!oldCache) return oldCache;

        const mutateNode = (item) => item.id === targetId ? transformer(item) : item;
        const mutateArray = (arr) => Array.isArray(arr) ? arr.map(mutateNode) : arr;

        if (Array.isArray(oldCache)) return mutateArray(oldCache);

        if (oldCache.pages) {
            return {
                ...oldCache,
                pages: oldCache.pages.map((page) => {
                    const list = Array.isArray(page) ? page : (page?.proposals || page?.data || []);
                    const updated = mutateArray(list);
                    return Array.isArray(page) ? updated : { ...page, proposals: updated };
                })
            };
        }

        if (oldCache.data) return { ...oldCache, data: mutateArray(oldCache.data) };
        if (oldCache.proposals) return { ...oldCache, proposals: mutateArray(oldCache.proposals) };

        return oldCache;
    });
};

/**
 * 🚀 Hook C: Handles submitting a new community proposal
 */
export function useCreateProposal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (proposalData) => {
            const payload = proposalData.proposal ? proposalData : { proposal: proposalData };

            const res = await apiFetch('/business_proposals', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            return res?.data || res;
        },

        // 🚀 THE MULTI-CACHE INVALIDATION MATRIX:
        // Clear all cached proposal variations so the newly registered node displays live
        onSuccess: () => {
            // Drops the legacy non-paginated timeline stream lists cache
            queryClient.invalidateQueries({ queryKey: ['proposals', 'stream'] });

            // 🎯 Drops all active paginated infinite scroll directory states completely
            queryClient.invalidateQueries({ queryKey: ['proposals', 'infinite'] });
        },
    });
}

/**
 * 🗳️ Hook D: Handles casting a vote on an active proposal with Optimistic Updates
 */
export function useVoteOnProposal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ proposalId, voteType }) => {
            const res = await apiFetch(`/business_proposals/${proposalId}/votes`, {
                method: 'POST',
                body: JSON.stringify({ vote_type: voteType })
            });
            return res?.data || res;
        },

        // 🚀 HARDWARE-ACCELERATED OPTIMISTIC HANDSHAKE INTERCEPTOR:
        // Modifies metrics locally inside client state threads before the server resolves
        onMutate: async ({ proposalId, voteType }) => {
            // Cancel background refetches across the proposal network scope to avoid race conditions
            await queryClient.cancelQueries({ queryKey: ['proposals'] });

            // Snapshot past state so the engine can revert values back cleanly if the request drops
            const previousStreamData = queryClient.getQueryData(['proposals', 'stream']);
            const previousDetailsData = queryClient.getQueryData(['proposals', 'detail', proposalId]);

            const updateItemMetrics = (item) => {
                const currentVote = item.user_vote || item.userVote || null;
                let yesDelta = 0;
                let noDelta = 0;

                // Strip current weight parameters if rewriting an existing vote node
                if (currentVote === 'yes') yesDelta -= 1;
                if (currentVote === 'no') noDelta -= 1;

                // Attach structural properties for the new vote
                if (voteType === 'yes') yesDelta += 1;
                if (voteType === 'no') noDelta += 1;

                return {
                    ...item,
                    user_vote: voteType,
                    userVote: voteType,
                    yes_votes_count: Math.max(0, (item.yes_votes_count || item.yesCount || 0) + yesDelta),
                    no_votes_count: Math.max(0, (item.no_votes_count || item.noCount || 0) + noDelta),
                    yesCount: Math.max(0, (item.yesCount || 0) + yesDelta),
                    noCount: Math.max(0, (item.noCount || 0) + noDelta)
                };
            };

            // Apply mutation mapping instantly over flat list query scopes
            performProposalCacheUpdate(queryClient, ['proposals', 'stream'], proposalId, updateItemMetrics);

            // Apply mutation mapping instantly over infinite scroll page array sets
            performProposalCacheUpdate(queryClient, ['proposals', 'infinite'], proposalId, updateItemMetrics);

            // Apply mutation mapping instantly over targeted standalone lookup detail routes
            queryClient.setQueryData(['proposals', 'detail', proposalId], (oldDetail) => {
                if (!oldDetail) return oldDetail;
                return updateItemMetrics(oldDetail);
            });

            return { previousStreamData, previousDetailsData, proposalId };
        },

        // Roll back the user interface if the network pipeline rejects or drops frames
        onError: (err, variables, context) => {
            console.error('Optimistic vote update failed. Reverting cache segments...', err);

            if (context?.previousStreamData) {
                queryClient.setQueryData(['proposals', 'stream'], context.previousStreamData);
            }
            if (context?.previousDetailsData) {
                queryClient.setQueryData(['proposals', 'detail', context.proposalId], context.previousDetailsData);
            }
        },

        // Ensure everything is verified and synchronized cleanly with real-time state flags
        onSettled: (data, error, variables) => {
            const targetId = variables?.proposalId;
            queryClient.invalidateQueries({ queryKey: ['proposals'] });
            if (targetId) {
                queryClient.invalidateQueries({ queryKey: ['proposals', 'detail', targetId] });
            }
        },
    });
}
