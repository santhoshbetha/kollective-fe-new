// src/features/profile/useGalleryFeature.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

import { usePostsStore } from '../../store/usePostsStore';

// 📡 Infinite Query: Pulls a specialized media-only attachment node stream for accounts
export function useAccountGalleryQuery(username) {
    return useInfiniteQuery({
        queryKey: ['profile', username, 'gallery'],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `&max_id=${pageParam}` : '';
            // Fetches account posts filtered explicitly down to attachments content parameters
            return apiFetch(`/api/v1/accounts/${username}/posts?only_media=true${maxIdParam}`);
        },
        getNextPageParam: (lastPage) =>
            lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
        initialPageParam: null,
        enabled: !!username,
    });
}

