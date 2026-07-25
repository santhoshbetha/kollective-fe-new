// src/features/campaigns/useCandidacyApplication.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

/**
 * 📡 QUERY: Fetches the current user's running validation application status
 */
export function useCandidacyApplicationQuery() {
    return useQuery({
        queryKey: ['campaigns', 'my-application'],
        queryFn: async () => {
            // Returns candidacy application object or null if none exists
            return apiFetch('/api/v1/campaigns/my-application');
        }
    });
}

/**
 * 🎛️ MUTATION: Submits a fresh working-class portfolio file packet
 */
export function useSubmitCandidacyApplicationMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ profession, proofFile }) => {
            const formData = new FormData();
            formData.append('candidate_application[declared_profession]', profession);
            formData.append('proof', proofFile); // Raw document asset attachment chunk

            return fetch('/api/v1/campaigns/apply', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt_auth_token')}`
                },
                body: formData
            }).then(res => {
                if (!res.ok) throw new Error("Portfolio ingestion failure.");
                return res.json();
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns', 'my-application'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    });
}
