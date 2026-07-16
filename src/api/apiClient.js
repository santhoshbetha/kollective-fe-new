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

// src/api/apiClient.js
import { getMockPostContext } from './mockApi';

export async function apiFetchPosts(url, options = {}) {
    // Intercept the post context pattern matching path strings
    if (url.includes('/posts/') && url.includes('/context')) {
        // Extract the id variable token out of the string split array indices
        const segments = url.split('/');
        const postId = segments[segments.length - 2];

        // Simulate async network latency promise timers safely
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getMockPostContext(postId));
            }, 400); // 400ms simulation time window
        });
    }

    // Fallback to standard fetch processing blocks when production endpoints go live
    // return fetch(url, options).then(res => res.json());
}

