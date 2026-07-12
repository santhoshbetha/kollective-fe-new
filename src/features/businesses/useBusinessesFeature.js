// src/features/businesses/useBusinessesFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

// Hook A: Handles lazy-loaded business data fetching
export function useBusinessesQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['businesses', 'list'],
        queryFn: api.getBusinesses,
        staleTime: 2 * 60 * 1000,
    });

    return {
        businesses: data?.businesses || data || [],
        businessesLoading: isPending,
        businessesError: error,
    };
}

// Hook B: Handles business registration submission form mutations
export function useCreateBusiness() {
    const queryClient = useQueryClient();

    return useMutation({
        // Receives the entire structured formData object payload dynamically
        mutationFn: async (fullBusinessData) => {
            return api.createBusiness(fullBusinessData);
        },
        onSuccess: () => {
            // Safely tell TanStack Query to refresh the business listing background cache
            queryClient.invalidateQueries({ queryKey: ['businesses', 'list'] });
        },
    });
}
