// src/features/profile/useLikesFeature.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

// 📡 Infinite Query: Fetches a flat, virtual list stream tracking posts favorited by this account
export function useAccountLikesQuery() {
    return useInfiniteQuery({
        queryKey: ['profile', 'likes', 'infinite'],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `?max_id=${pageParam}` : '';
            return apiFetch(`/api/v1/favourites${maxIdParam}`); // Returns paginated statuses array
        },
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
    });
}
