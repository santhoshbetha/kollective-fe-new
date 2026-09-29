// apiClient.js
import { useAuthStore } from '../store/auth/useAuthStore';
import { useTimelineBufferStore } from '../store/useTimelineBufferStore';
import queryClient from './queryClient';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');
const API_HOST = API_BASE.replace(/\/api\/v1\/?$/, '');

export async function apiFetch(endpoint, options = {}, queryClient) {
    const { token, activeAccount } = useAuthStore.getState();
    let url = endpoint || '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
        // Already absolute URL
    } else if (url.startsWith('/api/v1')) {
        url = `${API_BASE}${url.replace('/api/v1', '')}`;
    } else if (url.startsWith('/api/')) {
        url = `${API_HOST}${url}`;
    } else {
        const cleanEndpoint = url.startsWith('/') ? url : `/${url}`;
        url = `${API_BASE}${cleanEndpoint}`;
    }

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
        ...(token ? {
            'Authorization': `Bearer ${token}`,
            'X-Active-Account-Id': activeAccount?.id || ''
        } : {})
    };

    const response = await fetch(url, { ...options, headers });

    // 🚨 GLOBAL INTERCEPTION: Detect Revoked Token
    if (response.status === 401) {
        console.warn('Token revoked or expired. Initiating global logout.');

        // 1. Wipe out TanStack Query cache safely so no stale data leaks to the next session
        if (queryClient && typeof queryClient.clear === 'function') {
            queryClient.clear();
        }

        // 2. Clear buffers and tear down auth tokens
        useTimelineBufferStore.getState().clearBuffer();
        useAuthStore.getState().executeGlobalLogout();

        throw new Error('Session expired. Please log in again.');
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
        if (response.status === 204) {
            data = {};
        } else {
            try {
                data = await response.json();
            } catch (e) {
                if (!response.ok) {
                    throw new Error(`Server returned invalid JSON with status ${response.status}`);
                }
                data = {};
            }
        }
    } else {
        const text = await response.text();
        if (!response.ok) {
            throw new Error(text || `Server error (${response.status})`);
        }
        return text;
    }

    if (!response.ok) {
        let errorMessage = data?.message || data?.error;
        const errObj = data?.errors?.errors || data?.errors;
        if (!errorMessage && errObj) {
            if (typeof errObj === 'object') {
                const parts = Object.entries(errObj).map(([field, msgs]) => {
                    const formattedMsgs = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
                    return `${field}: ${formattedMsgs}`;
                });
                if (parts.length > 0) errorMessage = parts.join('; ');
            } else {
                errorMessage = String(errObj);
            }
        }
        if (!errorMessage) {
            errorMessage = `Request failed with status ${response.status}`;
        }
        const err = new Error(errorMessage);
        err.status = response.status;
        err.data = data;
        throw err;
    }

    return data;
}

export async function apiFetchPosts(url, options = {}) {
    let timeoutId = null;
    const controller = options.signal ? null : new AbortController();

    try {
        let fetchOptions = options;

        // Apply automatic 10-second timeout to context endpoints if no signal is provided
        if (url.includes('/context') && !options.signal) {
            timeoutId = setTimeout(() => controller.abort(), 10000);
            fetchOptions = { ...options, signal: controller.signal };
        }

        // Pass the imported queryClient down to support security cache clearing
        return await apiFetch(url, fetchOptions, queryClient);

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Fetch request timed out');
        }
        throw error;
    } finally {
        if (timeoutId) clearTimeout(timeoutId); // Prevent memory leaks
    }
}

