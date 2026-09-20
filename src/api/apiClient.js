// apiClient.js
import { useAuthStore } from '../store/auth/useAuthStore';
import { useTimelineBufferStore } from '../store/useTimelineBufferStore';
import { getMockPostContext } from './mockApi';

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

        // Extract cleaning methods cleanly from non-React environments
        const clearBuffer = useTimelineBufferStore.getState().clearBuffer;

        // Trigger the global tear-down sequence
        useAuthStore.getState().executeGlobalLogout(queryClient, clearBuffer);

        throw new Error('Session expired. Please log in again.');
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }
    } else {
        const text = await response.text();
        if (!response.ok) {
            throw new Error(text || `Server error (${response.status})`);
        }
        return text;
    }

    if (!response.ok) {
        const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
        const err = new Error(errorMessage);
        err.status = response.status;
        err.data = data;
        throw err;
    }

    return data;
}

export async function apiFetchPosts(url, options = {}) {
    try {
        const data = await apiFetch(url, options);
        if (data && (data.ancestors || data.focus || data.descendants || data.data)) {
            return data.data || data;
        }
        return data;
    } catch (err) {
        if (url.includes('/posts/') && url.includes('/context')) {
            const segments = url.split('/');
            const postId = segments[segments.length - 2];
            return getMockPostContext(postId);
        }
        throw err;
    }
}


