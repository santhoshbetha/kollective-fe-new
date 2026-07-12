// src/features/explore/useExploreQuery.js
import { useQuery } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

export function useExploreQuery(searchTerm, searchType = 'posts') {
    return useQuery({
        // 🔍 Sandbox cache arrays dynamically by search input criteria and type filters
        queryKey: ['explore', 'search', searchType, searchTerm],
        queryFn: async () => {
            // If there is no search input, return a blank array placeholder safely
            if (!searchTerm.trim()) return [];

            // Route the query logic down to specific mockApi controllers depending on selection type
            if (searchType === 'communities') {
                return api.getBusinesses ? api.getBusinesses() : []; // Adjust to your mock names
            }

            return api.getPosts ? api.getPosts() : [];
        },
        // Only fire network calls if the user has actually typed something into the input field
        enabled: searchTerm.trim().length > 0,
        staleTime: 30 * 1000, // 30 seconds cache window
    });
}
