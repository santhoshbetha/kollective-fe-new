// src/features/businesses/useBusinessesFeature.js
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

/**
 * 📡 Hook A: Fetches a flat fallback array of registered local businesses
 */
export function useBusinessesQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['businesses', 'list'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/businesses');
                if (res && (res.status === 'success' || res.data)) {
                    return res.data || res;
                }
            } catch (e) {
                console.warn('apiFetch failed for businesses query, falling back to mockApi', e);
            }
            return api.getBusinesses();
        },
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    const parsedList = data?.businesses || data?.data || (Array.isArray(data) ? data : []);

    return {
        businesses: parsedList,
        businessesLoading: isPending,
        businessesError: error,
    };
}

/**
 * 🚀 UPGRADED INFINITE QUERY: Cursor-based paginated business loader
 * Efficiently loads chunks of the business directory as the user scrolls.
 */
export function useInfiniteBusinessesQuery(category = 'All') {
    return useInfiniteQuery({
        queryKey: ['businesses', 'infinite', category],
        queryFn: async ({ pageParam = null }) => {
            const cursorQuery = pageParam ? `?cursor=${pageParam}` : '';
            const categoryQuery = category !== 'All' ? `&category=${encodeURIComponent(category)}` : '';

            const res = await apiFetch(`/businesses/paginated${cursorQuery}${categoryQuery}`);
            return res?.data || res; // Expects layout structure: { businesses: [...], next_cursor: "ULID" }
        },
        getNextPageParam: (lastPage) => lastPage?.next_cursor || undefined,
        initialPageParam: null,
        staleTime: 60 * 1000,
    });
}

/**
 * 🎛️ Hook: Filters businesses dynamically via a secure POST query endpoint
 */
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
                return api.filterBusinesses ? api.filterBusinesses(filterPayload) : [];
            }
        }
    });
}

/**
 * 🪐 UTILITY: Reusable, multi-envelope deep cache mutation updates helper macro
 */
const performBusinessCacheUpdate = (queryClient, partialKey, targetId, transformer) => {
    queryClient.setQueriesData({ queryKey: partialKey }, (oldCache) => {
        if (!oldCache) return oldCache;

        const mutateNode = (item) => item.id === targetId ? transformer(item) : item;
        const mutateArray = (arr) => Array.isArray(arr) ? arr.map(mutateNode) : arr;

        if (Array.isArray(oldCache)) return mutateArray(oldCache);

        if (oldCache.pages) {
            return {
                ...oldCache,
                pages: oldCache.pages.map((page) => {
                    const list = Array.isArray(page) ? page : (page?.businesses || page?.data || []);
                    const updated = mutateArray(list);
                    return Array.isArray(page) ? updated : { ...page, businesses: updated };
                })
            };
        }

        if (oldCache.data) return { ...oldCache, data: mutateArray(oldCache.data) };
        if (oldCache.businesses) return { ...oldCache, businesses: mutateArray(oldCache.businesses) };

        return oldCache;
    });
};

/**
 * 🏢 Hook B: Handles single business details fetching by ID
 */
export function useBusinessDetailsQuery(id) {
    const { data, isPending, error } = useQuery({
        queryKey: ['businesses', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            try {
                const res = await apiFetch(`/businesses/${id}`);
                if (res && (res.status === 'success' || res.data)) {
                    return res.data || res;
                }
            } catch (e) {
                console.warn('apiFetch failed for business details by ID, falling back to mockApi', e);
            }
            return api.getBusinessById ? api.getBusinessById(id) : null;
        },
        enabled: Boolean(id),
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    return {
        business: data,
        businessLoading: isPending,
        businessError: error,
    };
}

/**
 * 📝 Hook C: Handles business registration submission form mutations
 */
export function useCreateBusiness() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (fullBusinessData) => {
            const payload = fullBusinessData.business ? fullBusinessData : { business: fullBusinessData };

            // Dispatch payload metrics directly onto Phoenix routing endpoints
            const res = await apiFetch('/businesses', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            return res?.data || res;
        },

        // 🚀 THE REAL-TIME SYNC FIX: 
        // Force the app to clear out all stale listing query keys immediately upon creation
        onSuccess: () => {
            // Drops the legacy non-paginated flat business lists cache matrix
            queryClient.invalidateQueries({
                queryKey: ['businesses', 'list']
            });

            // 🎯 Drops all active paginated infinite scroll directory filters completely 
            queryClient.invalidateQueries({
                queryKey: ['businesses', 'infinite']
            });
        },
    });
}
