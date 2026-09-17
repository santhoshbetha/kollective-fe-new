// src/features/explore/useExploreQuery.js
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function useExploreQuery(searchTerm = '', searchType = 'posts') {
    const trimmed = typeof searchTerm === 'string' ? searchTerm.trim() : '';

    return useQuery({
        // 🔍 Sandbox cache arrays dynamically by search input criteria and type filters
        queryKey: ['explore', 'search', searchType, trimmed],
        queryFn: async () => {
            if (!trimmed) return [];

            try {
                const res = await apiFetch(`/search?q=${encodeURIComponent(trimmed)}&type=${searchType}`);
                if (res && res.data) return res.data;
                if (Array.isArray(res)) return res;
            } catch (err) {
                console.warn('Backend search failed, falling back to mock search:', err);
            }

            if (searchType === 'communities') {
                return api.getBusinesses ? api.getBusinesses() : [];
            }
            return api.getPosts ? api.getPosts() : [];
        },
        enabled: trimmed.length > 0,
        staleTime: 30 * 1000,
    });
}

