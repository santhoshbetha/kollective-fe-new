// src/features/businesses/useBusinessesFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

// Hook A: Handles lazy-loaded business data fetching
export function useBusinessesQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['businesses', 'list'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/businesses');
                if (res && res.status === 'success' && res.data) {
                    return res.data;
                }
            } catch (e) {
                console.warn('Falling back to mock businesses', e);
            }
            return api.getBusinesses();
        },
        staleTime: 2 * 60 * 1000,
    });

    return {
        businesses: Array.isArray(data) ? data : (data?.businesses || []),
        businessesLoading: isPending,
        businessesError: error,
    };
}

export function useFilterBusinesses() {
    return useMutation({
        mutationFn: async (filterPayload) => {
            try {
                const res = await apiFetch('/businesses/filter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(filterPayload)
                });
                return res?.data || res?.businesses || res;
            } catch (err) {
                console.warn('Backend POST businesses/filter failed, falling back to mock filter:', err);
                return api.filterBusinesses(filterPayload);
            }
        }
    });
}

// Hook B: Handles single business details fetching by ID
export function useBusinessDetailsQuery(id) {
    const { data, isPending, error } = useQuery({
        queryKey: ['businesses', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            try {
                const res = await apiFetch(`/businesses/${id}`);
                if (res && res.status === 'success' && res.data) {
                    return res.data;
                }
            } catch (e) {
                console.warn('Falling back to mock business details by ID', e);
            }
            return api.getBusinessById(id);
        },
        enabled: Boolean(id),
        staleTime: 2 * 60 * 1000,
    });

    return {
        business: data,
        businessLoading: isPending,
        businessError: error,
    };
}

// Hook C: Handles business registration submission form mutations
export function useCreateBusiness() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (fullBusinessData) => {
            try {
                return await apiFetch('/businesses', {
                    method: 'POST',
                    body: JSON.stringify(fullBusinessData)
                });
            } catch (err) {
                console.warn('Backend create business failed, falling back to mockApi', err);
                return api.createBusiness(fullBusinessData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
        },
    });
}
