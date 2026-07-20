// src/features/campaigns/useDeclareCandidacy.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useDeclareCandidacyMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ profession, manifesto, videoFile, accountId }) => {
            // 1. Pack variables inside a native Multi-part FormData object boundary
            const formData = new FormData();
            formData.append('candidate[profession]', profession);
            formData.append('candidate[manifesto]', manifesto);
            formData.append('candidate[account_id]', accountId);
            formData.append('video', videoFile); // Binds the raw binary video file stream chunk

            // 2. Transmit straight to your Phoenix Elixir router endpoint
            return fetch('/api/v1/campaigns/declare', {
                method: 'POST',
                headers: {
                    // Explicitly omit 'Content-Type' header; the browser will automatically 
                    // set it to multipart/form-data with the correct boundary token signature.
                    'Authorization': `Bearer ${localStorage.getItem('jwt_auth_token')}`
                },
                body: formData
            }).then(res => {
                if (!res.ok) throw new Error("Candidacy broadcasting failure.");
                return res.json();
            });
        },
        onSuccess: () => {
            // Invalidate the campaign registry queries to update candidate ranks instantly on screen
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        }
    });
}
