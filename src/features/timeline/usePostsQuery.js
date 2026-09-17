// src/features/timeline/usePostsQuery.js
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

export function usePostsQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['posts', 'stream'], // Isolated cache root key
        queryFn: async () => {
            try {
                const res = await apiFetch('/posts');
                if (res && (res.data || Array.isArray(res))) {
                    return res;
                }
            } catch (err) {
                console.warn('apiFetch failed for posts query stream, falling back to mockApi', err);
            }
            return api.getPosts();
        },
    });

    return {
        // Safely extract the posts array, defaulting to an empty array if loading
        posts: data?.posts || data?.data || (Array.isArray(data) ? data : []),
        postsLoading: isPending,
        postsError: error
    };
}

