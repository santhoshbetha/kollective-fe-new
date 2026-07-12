// src/features/profile/useProfileFeature.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth/useAuthStore';
import * as api from '../../api/mockApi';

export function useUpdateUser() {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const token = useAuthStore((state) => state.token);

    return useMutation({
        // 1. Submit the updated user variables to your mockApi
        mutationFn: async (updatedData) => {
            // updatedData structure: { name: "...", bio: "...", avatar: "..." }
            return api.updateUser(updatedData);
        },

        // 2. Synchronize both your local store and TanStack cache fields on success
        onSuccess: (updatedUser) => {
            // Invalidate the primary user query cache key so view profiles sync across the app
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

            // Update your global Zustand auth store so sidebars and headers update instantly
            if (updatedUser) {
                setSession(token, updatedUser);
            }
        },
    });
}
