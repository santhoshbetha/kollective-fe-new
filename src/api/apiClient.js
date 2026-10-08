// src/api/apiClient.js
import { useAuthStore } from '../store/auth/useAuthStore';
import { useTimelineBufferStore } from '../store/useTimelineBufferStore';
import queryClient from './queryClient';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api/v1').replace(/\/$/, '');
const API_HOST = API_BASE.replace(/\/api\/v1\/?$/, '');

/**
 * 🏆 MASTER APICLIENT FETCH CONFIGURATION MATRIX
 * Integrates your exact absolute endpoint mappings and response parsing hooks
 * with centralized persistent Zustand credential signers and context filters.
 */
export async function apiFetch(endpoint, options = {}, incomingQueryClient) {
    const { token, activeAccount } = useAuthStore.getState();
    let url = endpoint || '';

    console.log("apiFetch endpoint:;", endpoint);
    console.log("apiFetch options:;", options);
    console.log("apiFetch incomingQueryClient:;", incomingQueryClient);
    console.log("apiFetch token:;", token);
    console.log("apiFetch activeAccount:;", activeAccount);
    console.log("apiFetch API_BASE:;", API_BASE);
    console.log("apiFetch API_HOST:;", API_HOST);
    console.log("apiFetch url:;", url);

    // 1️⃣ Normalize absolute and host-relative request path destinations
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // Already absolute URL path matrix target
    } else if (url.startsWith('/api/v1')) {
        url = `${API_BASE}${url.replace('/api/v1', '')}`;
    } else if (url.startsWith('/api/')) {
        url = `${API_HOST}${url}`;
    } else {
        const cleanEndpoint = url.startsWith('/') ? url : `/${url}`;
        url = `${API_BASE}${cleanEndpoint}`;
    }

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    // 2️⃣ Merge content markers, custom headers, and persistent credential tokens
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
        ...(token ? {
            'Authorization': `Bearer ${token}`,
            'X-Active-Account-Id': activeAccount?.id || '',
            // 🚀 INTERCEPTOR SYNC: Maps organization workspace contextual header targets smoothly
            ...(activeAccount?.type === 'organization' ? { 'X-Workspace-Context-ID': activeAccount.id } : {})
        } : {})
    };

    const response = await fetch(url, { ...options, headers });

    console.log("apiFetch respnse:;", response)

    // 3️⃣ 🚨 GLOBAL RECOVERY INTERCEPTION: Catch systemic credential drops or token revocations
    if (response.status === 401 || response.status === 403) {
        console.warn('Token revoked or session expired. Initiating global logout evacuation.');

        // A. Safely clear local TanStack Query cache instances to protect user data leaking
        const targetQueryClient = incomingQueryClient || queryClient;
        if (targetQueryClient && typeof targetQueryClient.clear === 'function') {
            targetQueryClient.clear();
        }

        // B. Evacuate timeline timeline buffer memory streams
        if (useTimelineBufferStore?.getState()?.clearBuffer) {
            useTimelineBufferStore.getState().clearBuffer();
        }

        // C. Trigger multi-store secure destruction routines inside persistent store slices
        const authState = useAuthStore.getState();
        if (typeof authState.executeGlobalLogout === 'function') {
            authState.executeGlobalLogout();
        } else if (typeof authState.terminateAuthSession === 'function') {
            // Fallback backup hook connection reference
            authState.terminateAuthSession();
        }

        throw new Error('Session expired. Please log in again.');
    }

    // 4️⃣ Execute response body payload mapping and error text extraction loops
    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
        if (response.status === 204) {
            data = {};
        } else {
            try {
                data = await response.json();
                console.log("apiFetch data 1:;", data)
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
    // 5️⃣ Process comprehensive error payload string formatting parameters
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

    console.log("apiFetch data 2:;", data);
    return data;
}

/**
 * 🚀 SPECIALIZED TIMEOUT POST UTILITY DISPATCHER
 * Wraps outgoing posts stream metrics inside automated context abort loops
 */
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

        // Pass the imported queryClient down to support structural security cache clearing
        return await apiFetch(url, fetchOptions, queryClient);

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Fetch timeline context data request timed out across the network layer');
        }
        throw error;
    } finally {
        if (timeoutId) clearTimeout(timeoutId); // Prevent memory leaks across fast component re-renders
    }
}
