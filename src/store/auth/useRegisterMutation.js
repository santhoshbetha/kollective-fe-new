import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';
import { apiFetch } from '../../api/apiClient';

export function useRegisterMutation() {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);

    return useMutation({
        mutationFn: async (formData) => {
            const isOrg = formData.accountType === 'organization';
            const userPayload = {
                email: formData.email,
                password: formData.password,
                username: (formData.username || '').replace(/^@/, ''),
                type: isOrg ? 'organization' : 'citizen',
                display_name: isOrg ? formData.organizationName : formData.fullName,
                representative_name: isOrg ? formData.fullName : undefined,
                date_of_birth: !isOrg ? formData.dob : undefined,
                country: formData.country,
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
                localStorage.setItem('auth_user', JSON.stringify(user));
                setSession(token, user);
                queryClient.clear();
            }
        },
    });
}
