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
                localStorage.setItem('user_token', token);
                localStorage.setItem('socket_token', token);
                localStorage.setItem('auth_user', JSON.stringify(user));
                localStorage.setItem('kollective-auth-secure-matrix', JSON.stringify({
                    state: {
                        token,
                        user,
                        isAuthenticated: true,
                        activeAccount: {
                            id: user.id ? String(user.id) : 'personal',
                            type: 'personal',
                            name: user.name || user.username || 'Personal Account',
                            username: user.username || (user.handle ? user.handle.replace('@', '') : 'user'),
                            handle: user.handle || (user.username ? `@${user.username}` : '@user'),
                            avatar: user.avatar || '/default-avatar.jpg',
                            role: user.role || 'citizen',
                            badge_type: user.badge_type || 'citizen'
                        },
                        permissions: []
                    },
                    version: 0
                }));
                setSession(token, user);
                queryClient.clear();
            }
        },
    });
}
