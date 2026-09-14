// src/services/api.js
import { useAuthStore } from '../store/auth/useAuthStore';

class ApiService {
    constructor() {
        this.baseURL = '/api/v1';
    }

    formatUrl(url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        if (cleanUrl.startsWith('/api/')) {
            return cleanUrl;
        }
        return `${this.baseURL}${cleanUrl}`;
    }

    getHeaders(customHeaders = {}) {
        const state = useAuthStore.getState();
        const token = state.token;
        const activeAccount = state.activeAccount;

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(activeAccount?.id ? { 'X-Organization-Id': String(activeAccount.id) } : {}),
            ...customHeaders
        };
        return headers;
    }

    async request(method, url, data = null, config = {}) {
        const fullUrl = this.formatUrl(url);
        const headers = this.getHeaders(config.headers);

        const options = {
            method: method.toUpperCase(),
            headers,
            ...config
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
            options.body = typeof data === 'string' ? data : JSON.stringify(data);
        }

        const response = await fetch(fullUrl, options);
        let responseData = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json().catch(() => null);
        } else {
            responseData = await response.text().catch(() => null);
        }

        if (!response.ok) {
            const error = new Error(responseData?.error || responseData?.message || `HTTP error ${response.status}`);
            error.response = {
                data: responseData,
                status: response.status,
                headers: response.headers
            };
            throw error;
        }

        return {
            data: responseData,
            status: response.status,
            headers: response.headers
        };
    }

    get(url, config) {
        return this.request('GET', url, null, config);
    }

    post(url, data, config) {
        return this.request('POST', url, data, config);
    }

    put(url, data, config) {
        return this.request('PUT', url, data, config);
    }

    patch(url, data, config) {
        return this.request('PATCH', url, data, config);
    }

    delete(url, config) {
        return this.request('DELETE', url, null, config);
    }
}

const api = new ApiService();
export default api;
