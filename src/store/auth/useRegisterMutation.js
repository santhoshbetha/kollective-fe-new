import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';
import { apiFetch } from '../../api/apiClient';

export function useRegisterMutation() {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);

    return useMutation({
        mutationFn: async (registrationPayload) => {
            const isOrg = registrationPayload.accountType === 'organization';
            const userPayload = {
                email: registrationPayload.email,
                password: registrationPayload.password,
                username: (registrationPayload.username || '').replace(/^@/, ''),
                type: isOrg ? 'organization' : 'citizen',
                display_name: isOrg ? registrationPayload.organizationName : registrationPayload.fullName,
                representative_name: isOrg ? registrationPayload.fullName : undefined,
                date_of_birth: !isOrg ? registrationPayload.dob : undefined,
                country: registrationPayload.country,
                public_key: registrationPayload.public_key,
            };

            const res = await apiFetch('/api/users/register', {
                method: 'POST',
                body: JSON.stringify({ user: userPayload }),
            });

            if (res.errors) {
                const errorMsgs = Object.entries(res.errors)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join('; ');
                throw new Error(errorMsgs || 'Registration failed');
            }
            if (res.error) {
                throw new Error(res.error);
            }

            return res;
        },
        onSuccess: (data) => {
            const token = data.data?.token || data.token;
            const user = data.data?.user || data.user;

            if (token && user) {
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user_token', token);
                localStorage.setItem('socket_token', token);
                localStorage.setItem('auth_user', JSON.stringify(user));
                setSession(token, user);
                queryClient.clear();
            }
        },
        /*onError: (error) => {
            console.error("Registration error", error);
            setSession(null, null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_token');
            localStorage.removeItem('socket_token');
            localStorage.removeItem('auth_user');
            queryClient.clear();
            navigate('/login');
        }*/
    });
}
