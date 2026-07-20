// src/features/campaigns/useCampaignDataHooks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

/**
 * 📡 1. QUERY: Fetches and ranks candidates based on voting scores
 * Targets: /api/v1/campaigns/candidates?country=US&district_id=TX-10
 */
export function useCampaignCandidatesQuery(country, districtId) {
    return useQuery({
        queryKey: ['campaigns', 'candidates', country, districtId],
        queryFn: async () => {
            const endpoint = `/api/v1/campaigns/candidates?country=${country}&district_id=${encodeURIComponent(districtId)}`;
            return apiFetch(endpoint); // Returns a sorted array of candidate objects
        },
        enabled: !!country && !!districtId,
    });
}

/**
 * 🎛️ 2. MUTATION: Handles Quora-style upvotes or downvotes
 * Updates local data immediately using optimistic cache mapping
 */
export function useVoteCandidateMutation(country, districtId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ candidateId, scoreDelta }) => {
            return apiFetch(`/api/v1/campaigns/candidates/${candidateId}/vote`, {
                method: 'POST',
                body: JSON.stringify({ delta: scoreDelta }),
            });
        },
        onMutate: async ({ candidateId, scoreDelta }) => {
            const cacheKey = ['campaigns', 'candidates', country, districtId];

            // Cancel outbound refetches to protect our temporary local cache mapping
            await queryClient.cancelQueries({ queryKey: cacheKey });
            const previousSnapshot = queryClient.getQueryData(cacheKey);

            // Optimistically adjust parameters instantly inside client memory
            queryClient.setQueryData(cacheKey, (oldList) => {
                if (!oldList) return [];
                return oldList
                    .map((cand) => cand.id === candidateId ? { ...cand, votes_count: cand.votes_count + scoreDelta } : cand)
                    .sort((a, b) => b.votes_count - a.votes_count); // Maintain deterministic sorting mechanics
            });

            return { previousSnapshot, cacheKey };
        },
        onError: (err, variables, context) => {
            // Revert to stable database values if the network pipeline fails
            if (context?.previousSnapshot) {
                queryClient.setQueryData(context.cacheKey, context.previousSnapshot);
            }
        },
        onSettled: (data, err, variables, context) => {
            queryClient.invalidateQueries({ queryKey: context.cacheKey });
        },
    });
}

/**
 * 🚨 3. MUTATION: Dispatches citizen-reported infraction tickets
 * Submits records to the database schema built in Part 1
 */
export function useReportAbuseMutation() {
    return useMutation({
        mutationFn: async ({ targetType, targetId, comment, reporterId }) => {
            return apiFetch('/api/v1/moderation/abuse_reports', {
                method: 'POST',
                body: JSON.stringify({
                    abuse_report: {
                        target_type: targetType, // "candidate" | "post" | "comment"
                        target_id: targetId,
                        comment: comment.trim(),
                        reporter_id: reporterId,
                    },
                }),
            });
        },
        onSuccess: () => {
            alert("Infraction report successfully submitted to the moderation panel audit index.");
        },
    });
}



/**
 * 📡 1. QUERY: Streams video assets for a target district level
 * Targets: /api/v1/campaigns/pitches?level=congress&code=TX-10
 */
export function useCandidatePitchesQuery(officeLevel, districtCode) {
    return useQuery({
        queryKey: ['campaigns', 'pitches', officeLevel, districtCode],
        queryFn: async () => {
            const endpoint = `/api/v1/campaigns/pitches?level=${officeLevel}&code=${encodeURIComponent(districtCode)}`;
            return apiFetch(endpoint); // Returns array of candidate video items sorted by score
        },
        enabled: !!officeLevel && !!districtCode,
    });
}

/**
 * 🎛️ 2. MUTATION: Modifies video scores up or down with optimistic responses
 */
export function useVotePitchMutation(officeLevel, districtCode) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ videoId, scoreDelta }) => {
            return apiFetch(`/api/v1/campaigns/pitches/${videoId}/vote`, {
                method: 'POST',
                body: JSON.stringify({ delta: scoreDelta }),
            });
        },
        onMutate: async ({ videoId, scoreDelta }) => {
            const cacheKey = ['campaigns', 'pitches', officeLevel, districtCode];

            await queryClient.cancelQueries({ queryKey: cacheKey });
            const previousSnapshot = queryClient.getQueryData(cacheKey);

            // Pre-render the voting score change at 60fps across layout items
            queryClient.setQueryData(cacheKey, (oldList) => {
                if (!oldList) return [];
                return oldList
                    .map((v) => v.id === videoId ? { ...v, votes_count: v.votes_count + scoreDelta } : v)
                    .sort((a, b) => b.votes_count - a.votes_count);
            });

            return { previousSnapshot, cacheKey };
        },
        onError: (err, variables, context) => {
            if (context?.previousSnapshot) {
                queryClient.setQueryData(context.cacheKey, context.previousSnapshot);
            }
        },
        onSettled: (data, err, variables, context) => {
            queryClient.invalidateQueries({ queryKey: context.cacheKey });
        },
    });
}

// src/features/campaigns/useCampaignDataHooks.js

export function useHyperLocalPitchesQuery(stage, userProfile) {
    return useQuery({
        queryKey: ['campaigns', 'pitches', stage, userProfile?.id],
        queryFn: async () => {
            // Dynamically target the endpoint scope based on the active filtration stage
            let targetCode = userProfile?.district_l1_code; // Default: Federal

            if (stage === 'booth') targetCode = userProfile?.polling_booth_id;
            if (stage === 'sub_district') targetCode = userProfile?.sub_district;

            return apiFetch(`/api/v1/campaigns/pitches?stage=${stage}&code=${encodeURIComponent(targetCode)}`);
        },
        enabled: !!userProfile,
    });
}

// src/features/campaigns/useCampaignDataHooks.js

/**
 * 📡 QUERY: Fetches local candidates filtered strictly by their current visibility tier
 * Targets: GET /api/v1/campaigns/pitches?level=municipal&code=austin_tx&stage=booth&booth_id=ward_4_b
 */
export function useFilteredLocalPitchesQuery(officeLevel, districtCode, stage, userLocationProfile) {
    return useQuery({
        queryKey: ['campaigns', 'pitches', officeLevel, districtCode, stage],
        queryFn: async () => {
            // 🎯 THE FILTRATION PASS: Adjust lookup scopes dynamically
            let locationScopeCode = districtCode;

            if (stage === 'booth') {
                locationScopeCode = userLocationProfile?.polling_booth_id; // Restricts view to neighborhood blocks
            } else if (stage === 'ward') {
                locationScopeCode = userLocationProfile?.sub_district;     // Restricts view to local ward sections
            }

            const endpoint = `/api/v1/campaigns/pitches?level=${officeLevel}&code=${encodeURIComponent(locationScopeCode)}&stage=${stage}`;
            return apiFetch(endpoint); // Returns a manageable array of candidates
        },
        enabled: !!officeLevel && !!districtCode && !!stage,
    });
}



