// src/features/timeline/usePostsQuery.js
import { useQuery } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

export function usePostsQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['posts', 'stream'], // Isolated cache root key
        queryFn: api.getPosts,
    });

    return {
        // Safely extract the posts array, defaulting to an empty array if loading
        posts: data?.posts || data || [],
        postsLoading: isPending,
        postsError: error
    };
}
