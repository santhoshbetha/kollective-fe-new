// apiClient.js
import { useAuthStore } from '../store/auth/useAuthStore';
import { useTimelineBufferStore } from '../store/useTimelineBufferStore';

export async function apiFetch(endpoint, options = {}, queryClient) {
    const token = useAuthStore.getState().token;

    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`/api/v1${endpoint}`, { ...options, headers });

    // 🚨 GLOBAL INTERCEPTION: Detect Revoked Token
    if (response.status === 401) {
        console.warn('Token revoked or expired. Initiating global logout.');

        // Extract cleaning methods cleanly from non-React environments
        const clearBuffer = useTimelineBufferStore.getState().clearBuffer;

        // Trigger the global tear-down sequence
        useAuthStore.getState().executeGlobalLogout(queryClient, clearBuffer);

        throw new Error('Session expired. Please log in again.');
    }

    return response.json();
}
