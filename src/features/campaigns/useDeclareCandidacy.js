// src/features/campaigns/useDeclareCandidacy.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useDeclareCandidacyMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ profession, manifesto, videoFile, accountId }) => {
            const formData = new FormData();
            formData.append('candidate[profession]', profession);
            formData.append('candidate[manifesto]', manifesto);
            formData.append('candidate[account_id]', accountId);
            formData.append('video', videoFile);

            return apiFetch('/api/v1/campaigns/declare', {
                method: 'POST',
                body: formData
            });
        },
        onSuccess: () => {
            // Invalidate the campaign registry queries to update candidate ranks instantly on screen
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        }
    });
}
