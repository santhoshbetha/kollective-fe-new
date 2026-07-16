// src/features/settings/useSettingsFeature.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { apiFetch } from '../../api/apiClient';

// 📧 Mutation: Updates the user's primary contact email parameters
export function useUpdateEmailMutation() {
    return useMutation({
        mutationFn: async (payload) => {
            return apiFetch('/api/v1/settings/change_email', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        },
    });
}

// 🔒 Mutation: Updates user cryptographic login key signatures
export function useUpdatePasswordMutation() {
    return useMutation({
        mutationFn: async (payload) => {
            return apiFetch('/api/v1/settings/change_password', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        },
    });
}

// ⚠️ Mutation: Permanent account destruction cascade
export function useDeleteAccountMutation() {
    const queryClient = useQueryClient();
    const logoutAction = useAuthStore((state) => state.logoutAction);

    return useMutation({
        mutationFn: async (payload) => {
            return apiFetch('/api/v1/settings/delete_account', {
                method: 'DELETE',
                body: JSON.stringify(payload),
            });
        },
        onSuccess: () => {
            // Clear persistent browser memory tokens completely
            localStorage.removeItem('jwt_auth_token');
            // Wipe query caches and drop auth state back to unauthenticated logs
            queryClient.clear();
            logoutAction();
        },
    });
}
