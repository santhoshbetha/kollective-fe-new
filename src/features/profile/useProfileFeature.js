// src/features/profile/useProfileFeature.js
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { useAuthStore } from '../../store/auth/useAuthStore';
import * as api from '../../api/mockApi';

import { usePostsStore } from '../../store/usePostsStore';

import { useAccountsStore } from '../../store/useAccountsStore';

// 👤 Query: Fetches a single user profile record cleanly by their specific node handle index
export function useProfileQuery(username) {
    return useQuery({
        queryKey: ['profile', username],
        queryFn: async () => {
            try {
                return await apiFetch(`/api/v1/accounts/${username}`);
            } catch (err) {
                console.warn('Backend profile query failed', err);
                throw err;
            }
        },
        enabled: !!username,
        select: (data) => {
            if (data && data.id) {
                useAccountsStore.getState().importFetchedAccounts([data]);
            }
            return data;
        },
    });
}

const getNextCursor = (lastPage) =>
    lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined;

// 🗳️ Infinite Query: Pulls a flat, virtualized feed of posts created strictly by this profile
export function useProfilePostsQuery(username) {
    return useInfiniteQuery({
        queryKey: ['profile', username, 'posts'],
        queryFn: async ({ pageParam = null }) => {
            const url = pageParam
                ? `/api/v1/accounts/${username}/posts?max_id=${pageParam}`
                : `/api/v1/accounts/${username}/posts`;
            return apiFetch(url);
        },
        getNextPageParam: getNextCursor,
        initialPageParam: null,
        enabled: !!username,
        select: (data) => {
            if (!data?.pages) return data;
            const importFetchedPosts = usePostsStore.getState().importFetchedPosts;
            const pages = data.pages.map((page) => {
                if (!page) return page;
                const rawPosts = Array.isArray(page) ? page : page.statuses || page.posts || [];
                const imported = importFetchedPosts(rawPosts);
                if (Array.isArray(page)) return imported;
                return { ...page, statuses: imported, posts: imported };
            });
            return { ...data, pages };
        },
    });
}

// 🎛️ Mutation: Dispatches persistent profile updates securely down to your Elixir storage layer
export function useUpdateProfileMutation(username) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updatedFields) => {
            return apiFetch(`/api/v1/accounts/update_credentials`, {
                method: 'PATCH',
                body: JSON.stringify(updatedFields),
            });
        },
        onSuccess: (updatedData) => {
            if (updatedData && updatedData.id) {
                useAccountsStore.getState().importFetchedAccounts([updatedData]);
            }
            // Flush caches concurrently to refresh presentation layers instantly
            queryClient.invalidateQueries({ queryKey: ['profile', username] });
            queryClient.setQueryData(['profile', username], updatedData);
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const token = useAuthStore((state) => state.token);

    return useMutation({
        mutationFn: async (updatedData) => {
            try {
                return await apiFetch('/profile', {
                    method: 'PUT',
                    body: JSON.stringify(updatedData),
                });
            } catch (err) {
                console.warn('Backend update user failed, falling back to mockApi', err);
                return api.updateUser(updatedData);
            }
        },

        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

            if (updatedUser) {
                setSession(token, updatedUser);
            }
        },
    });
}

// Add this or overwrite inside src/features/profile/useProfileFeature.js

// 📡 Upgraded Infinite Query: Handles split-mode root tracking or nested replay lists explicitly
export function useProfileTimelineQuery(username, currentMode) {
    return useInfiniteQuery({
        queryKey: ['profile', username, 'timeline-stream', currentMode],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `&max_id=${pageParam}` : '';

            // Enforce the Fediverse pattern: with_replies toggles the exclude_replies backend flag!
            const excludeRepliesFlag = currentMode === 'root_only' ? '&exclude_replies=true' : '';

            return apiFetch(`/api/v1/accounts/${username}/posts?limit=20${excludeRepliesFlag}${maxIdParam}`);
        },
        getNextPageParam: getNextCursor,
        initialPageParam: null,
        enabled: !!username,
        select: (data) => {
            if (!data?.pages) return data;
            const importFetchedPosts = usePostsStore.getState().importFetchedPosts;
            const pages = data.pages.map((page) => {
                if (!page) return page;
                const rawPosts = Array.isArray(page) ? page : page.statuses || page.posts || [];
                const imported = importFetchedPosts(rawPosts);
                if (Array.isArray(page)) return imported;
                return { ...page, statuses: imported, posts: imported };
            });
            return { ...data, pages };
        },
    });
}

