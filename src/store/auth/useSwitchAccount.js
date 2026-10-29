// src/store/auth/useSwitchAccount.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';
import { apiFetch } from '../../api/apiClient';
import { useTimelineBufferStore } from '../useTimelineBufferStore';
import { usePostsStore } from '../usePostsStore';
import { resolveActiveAccount } from './resolveActiveAccount';

/**
 * 🔄 Instant UI Account Switcher Hook
 * Rotates the database-backed session token via POST /api/v1/session/switch_profile,
 * overwrites the saved bearer token inside browser storage, updates the active account,
 * and clears client cache so consecutive requests reflect the new context.
 */
export function useSwitchAccount() {
    const queryClient = useQueryClient();
    const setActiveAccount = useAuthStore((state) => state.setActiveAccount);

    const mutation = useMutation({
        mutationFn: async (targetAccountId) => {
            const orgId = targetAccountId === 'personal' ? 'personal' : targetAccountId;
            const data = await apiFetch('/api/v1/session/switch_profile', {
                method: 'POST',
                body: JSON.stringify({ organization_id: orgId })
            });

            return { data, targetAccountId };
        },

        onSuccess: ({ data, targetAccountId }) => {
            const { token, user } = data;

            // 1. Storage Overwrite: Persist rotated token to browser localStorage
            if (token) {
                localStorage.setItem('auth_token', token);
                localStorage.setItem('bearer_token', token);
                localStorage.setItem('user_token', token);
                localStorage.setItem('socket_token', token);
            }

            const resolvedActiveAccount = resolveActiveAccount(data, targetAccountId);

            // 2. Update Zustand persistent store (which also syncs to 'kollective-auth-secure-matrix')
            const store = useAuthStore.getState();
            if (typeof store.rotateSession === 'function') {
                store.rotateSession(token, resolvedActiveAccount, user);
            } else {
                useAuthStore.setState({
                    ...(token ? { token } : {}),
                    ...(user ? { user } : {}),
                    activeAccount: resolvedActiveAccount
                });
            }

            // 3. Cache Eviction & In-flight Query Cancellation: Wipe query & timeline memory caches to force refetch under new context
            try {
                queryClient.cancelQueries();
            } catch (err) {
                console.warn('cancelQueries error:', err);
            }
            const clearBuffer = useTimelineBufferStore?.getState?.()?.clearBuffer;
            if (typeof clearBuffer === 'function') clearBuffer();
            if (usePostsStore?.getState?.()?.purgeStoreDataMatrix) {
                usePostsStore.getState().purgeStoreDataMatrix();
            }
            queryClient.clear();
        }
    });

    mutation.switchAccount = (targetAccountId) => mutation.mutate(targetAccountId);
    return mutation;
}