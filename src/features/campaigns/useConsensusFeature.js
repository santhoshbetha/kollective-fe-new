// src/features/campaigns/useConsensusFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

/**
 * 📡 QUERY: Streams the vetting winner consensus spotlight for a district tier
 * Targets: GET /api/v1/campaigns/consensus?level=congress&code=TX-10
 */
export function useConsensusNomineeQuery(officeLevel, districtCode) {
    return useQuery({
        queryKey: ['campaigns', 'consensus', officeLevel, districtCode],
        queryFn: async () => {
            const endpoint = `/api/v1/campaigns/consensus?level=${officeLevel}&code=${encodeURIComponent(districtCode)}`;
            return apiFetch(endpoint); // Returns a single candidate object preloaded with user metadata
        },
        enabled: !!officeLevel && !!districtCode,
    });
}

/**
 * 🎛️ MUTATION: Commits a secure digital signature to an independent ballot access petition
 */
export function useSignPetitionMutation(officeLevel, districtCode) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (candidateId) => {
            return apiFetch(`/api/v1/campaigns/candidates/${candidateId}/sign_petition`, {
                method: 'POST',
            });
        },
        onSuccess: () => {
            // Invalidate the cache to instantly update petition progress counts across the layout
            queryClient.invalidateQueries({ queryKey: ['campaigns', 'consensus', officeLevel, districtCode] });
        }
    });
}
