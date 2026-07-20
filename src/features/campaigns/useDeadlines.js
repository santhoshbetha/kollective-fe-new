// src/features/campaigns/useDeadlines.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

/**
 * 📡 QUERY: Potentially streams crowdsourced deadlines matching specific criteria
 */
export function useElectionDeadlinesQuery(stateCode, officeLevel, districtCode) {
    return useQuery({
        queryKey: ['campaigns', 'deadlines', stateCode, officeLevel, districtCode],
        queryFn: async () => {
            const endpoint = `/api/v1/campaigns/deadlines?state=${stateCode}&level=${officeLevel}&code=${encodeURIComponent(districtCode)}`;
            return apiFetch(endpoint); // Potentially returns flat array of deadline dates
        },
        enabled: !!stateCode,
    });
}

/**
 * 🎛️ MUTATION: Potentially commits a new deadline entry
 */
export function useLogDeadlineMutation(stateCode, officeLevel, districtCode) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            return apiFetch('/api/v1/campaigns/deadlines', {
                method: 'POST',
                body: JSON.stringify({ deadline: payload }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns', 'deadlines'] });
        },
    });
}
