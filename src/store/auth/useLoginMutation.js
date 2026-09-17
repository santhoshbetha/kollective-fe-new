import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';
import { apiFetch } from '../../api/apiClient';

export function useLoginMutation() {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const setIsLoggingIn = useAuthStore((state) => state.setIsLoggingIn);

    return useMutation({
        mutationFn: async ({ email, password }) => {
            setIsLoggingIn(true);
            try {
                const res = await apiFetch('/api/users/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });

                if (res.error) {
                    throw new Error(res.error);
                }
                return res;
            } finally {
                setIsLoggingIn(false);
            }
        },

        onSuccess: (data) => {
            const token = data?.token || data?.data?.token;
            const user = data?.user || data?.data?.user;

            if (token && user) {
                localStorage.setItem('auth_token', token);
                localStorage.setItem('auth_user', JSON.stringify(user));
                setSession(token, user);
                queryClient.clear();
            }
        },
    });
}
