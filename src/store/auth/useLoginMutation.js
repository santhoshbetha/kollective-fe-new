import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';

export function useLoginMutation() {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);

    return useMutation({
        // 1. Submit credentials to your Elixir backend
        mutationFn: async ({ email, password }) => {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            return response.json(); // Expected: { token: "ey...", user: { id: 1, name: "Alex" } }
        },

        // 2. Transition your storage, stores, and caches smoothly on success
        onSuccess: (data) => {
            const { token, user } = data;

            // A. Securely persist to localStorage for future app launches
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));

            // B. Update Zustand. This instantly flips `isAuthenticated` to true.
            // It also activates the `enabled` flags on your TanStack timeline queries.
            setSession(token, user);

            // C. Wipe out all existing query caches.
            // This guarantees no data contamination between previous sessions/guests.
            queryClient.clear();
        },
    });
}
