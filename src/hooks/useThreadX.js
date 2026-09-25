import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetchPosts } from '../api/apiClient';
import { usePostsStore } from '../store/usePostsStore';
import { useQueryClient } from '@tanstack/react-query';

export function useThreadX(currentPostId) {
    // 1. Single scalar selector to avoid returning dynamic object references
    const entities = usePostsStore((state) => state.entities);
    const queryClient = useQueryClient();

    // 2. Prepare placeholder data using what we already have in Zustand
    const placeholderFocusPost = useMemo(() => {
        if (!currentPostId) return undefined;
        const existingPost = entities[currentPostId];
        if (!existingPost) return undefined;

        return {
            ancestors: [],
            focus: existingPost,
            descendants: [],
            isPlaceholder: true
        };
    }, [entities, currentPostId]);

    const { data: threadContext, refetch: refetchThreadContext } = useQuery({
        queryKey: ['post', currentPostId, 'thread'],
        queryFn: async () => {
            const res = await apiFetchPosts(`/api/v1/posts/${currentPostId}/context`);
            console.log("useThread context res::", res)
            return res;
        },
        retry: 1,
        placeholderData: placeholderFocusPost,
        select: (data) => {
            if (!data) return { ancestors: [], focus: null, descendants: [] };

            // If it's structured placeholder, return it directly
            if (data.isPlaceholder) return data;

            // Pure structural mapping using Zustand entities
            const ancestors = Array.isArray(data.ancestors)
                ? data.ancestors.map((p) => (p?.id ? { ...p, ...(entities[p.id] || {}) } : p))
                : [];
            const focus = data.focus
                ? (data.focus?.id ? { ...data.focus, ...(entities[data.focus.id] || {}) } : data.focus)
                : null;
            const descendants = Array.isArray(data.descendants)
                ? data.descendants.map((p) => (p?.id ? { ...p, ...(entities[p.id] || {}) } : p))
                : [];

            return { ancestors, focus, descendants, _raw: data };
        },
    });

    // 3. Perform side-effects ONLY when a new network fetch completes (dataUpdatedAt changes)
    // This breaks the infinite re-render loop completely
    useEffect(() => {
        if (!threadContext?._raw) return;

        const { ancestors, focus, descendants } = threadContext._raw;
        const importFetchedPosts = usePostsStore.getState().importFetchedPosts;

        if (Array.isArray(ancestors) && ancestors.length > 0) importFetchedPosts(ancestors);
        if (focus) importFetchedPosts([focus]);
        if (Array.isArray(descendants) && descendants.length > 0) importFetchedPosts(descendants);
    }, [threadContext?.dataUpdatedAt]);

    return { threadContext, refetchThreadContext };
}
