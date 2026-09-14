// src/store/auth/useSwitchAccount.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';

export function useSwitchAccountX(options = {}) {
    const queryClient = useQueryClient();
    const setAuthContext = useAuthStore((state) => state.setAuthContext);
    const updateActiveProfile = useAuthStore((state) => state.updateActiveProfile);

    return useMutation({
        mutationFn: async (targetAccountId) => {
            const currentToken = useAuthStore.getState().token;
            const headers = {
                'Content-Type': 'application/json',
                ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
            };

            const response = await fetch('/api/v1/sessions/switch_context', {
                method: 'POST',
                headers,
                body: JSON.stringify({ account_id: targetAccountId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'Failed to switch account context');
            }

            return response.json();
        },
        onSuccess: (data, variables, context) => {
            // 1. Extract payload entities
            const payloadToken = data.token || data.data?.token;
            const activeAccount = data.active_account || data.activeAccount || data.data?.active_account || data.data?.activeAccount;
            const permissions = data.permissions || data.data?.permissions || [];
            const profileData = data.profile || data.data?.profile;

            // 2. Commit auth context and tokens to store and localStorage
            setAuthContext(payloadToken, activeAccount, permissions);

            // 3. If additional profile fields were provided, update active account profile
            if (profileData) {
                updateActiveProfile(profileData);
            }

            // 4. Wipe out all cached data from the previous account context to prevent cross-contamination
            queryClient.clear();

            // 5. Invalidate and refetch active user queries to refresh all components
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            // 6. Invoke custom success callback if provided
            if (options.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            console.error('Account switch failed:', error);
            if (options.onError) {
                options.onError(error, variables, context);
            }
        },
        ...options,
    });
}

