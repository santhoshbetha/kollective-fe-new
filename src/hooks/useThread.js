import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetchPosts } from '../api/apiClient';
import { usePostsStore } from '../store/usePostsStore';
import { useQueryClient } from '@tanstack/react-query';

export function useThread(currentPostId) {
    const entities = usePostsStore((state) => state.entities);
    const queryClient = useQueryClient();

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

    const queryResult = useQuery({
        queryKey: ['post', currentPostId, 'thread'],
        queryFn: async ({ signal }) => {
            // Pass queryClient and signal down into the timeout fetcher wrapper
            return await apiFetchPosts(`/api/v1/posts/${currentPostId}/context`, {
                signal  // Let TanStack Query manage auto-cancellation on component unmount
            });
        },
        retry: (failureCount, error) => {
            // 🛡️ Do not retry network calls if the item explicitly doesn't exist or is barred
            if (error?.status === 404 || error?.status === 403) return false;
            return failureCount < 1;
        },
        placeholderData: placeholderFocusPost,
        select: (data) => {
            if (!data) return { ancestors: [], focus: null, descendants: [] };
            if (data.isPlaceholder) return data;

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

    const { data, dataUpdatedAt, refetch, error } = queryResult;

    // ⚡ Compute human-readable error context payloads derived from backend status codes
    const errorDetails = useMemo(() => {
        if (!error) return null;

        const httpStatus = error.status;
        switch (httpStatus) {
            case 404:
                return {
                    code: 'NOT_FOUND',
                    message: 'This conversation thread has been deleted or does not exist.',
                    actionLabel: 'Return to feed'
                };
            case 403:
                return {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view this premium or private group thread.',
                    actionLabel: 'Go Back'
                };
            case 408:
            case 'AbortError':
                return {
                    code: 'TIMEOUT',
                    message: 'The connection timed out while gathering the pulses. Please try again.',
                    actionLabel: 'Retry connection'
                };
            default:
                return {
                    code: 'SERVER_ERROR',
                    message: error.message || 'An unexpected glitch loaded this thread. Our matrix is working on it.',
                    actionLabel: 'Reload thread'
                };
        }
    }, [error]);

    useEffect(() => {
        if (!data?._raw) return;

        const { ancestors, focus, descendants } = data._raw;
        const importFetchedPosts = usePostsStore.getState().importFetchedPosts;

        if (Array.isArray(ancestors) && ancestors.length > 0) importFetchedPosts(ancestors);
        if (focus) importFetchedPosts([focus]);
        if (Array.isArray(descendants) && descendants.length > 0) importFetchedPosts(descendants);
    }, [dataUpdatedAt, data?._raw]);

    return {
        data,
        isPending: queryResult.isPending,
        isError: queryResult.isError,
        error: errorDetails, // Exposes the highly useful parsed code and clean string format
        rawError: error,     // Kept available for raw debugging if needed
        refetch
    };
}
