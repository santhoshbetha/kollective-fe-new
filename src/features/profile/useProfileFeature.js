// src/features/profile/useProfileFeature.js
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { useAuthStore } from '../../store/auth/useAuthStore';
import * as api from '../../api/mockApi';

// 👤 Query: Fetches a single user profile record cleanly by their specific node handle index
export function useProfileQuery(username) {
    return useQuery({
        queryKey: ['profile', username],
        queryFn: async () => {
            return apiFetch(`/api/v1/accounts/${username}`);
        },
        enabled: !!username,
    });
}

// 🗳️ Infinite Query: Pulls a flat, virtualized feed of posts created strictly by this profile
export function useProfilePostsQuery(username) {
    return useInfiniteQuery({
        queryKey: ['profile', username, 'posts'],
        queryFn: async ({ pageParam = null }) => {
            const url = pageParam
                ? `/api/v1/accounts/${username}/statuses?max_id=${pageParam}`
                : `/api/v1/accounts/${username}/statuses`;
            return apiFetch(url);
        },
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
        enabled: !!username,
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
        // 1. Submit the updated user variables to your mockApi
        mutationFn: async (updatedData) => {
            // updatedData structure: { name: "...", bio: "...", avatar: "..." }
            return api.updateUser(updatedData);
        },

        // 2. Synchronize both your local store and TanStack cache fields on success
        onSuccess: (updatedUser) => {
            // Invalidate the primary user query cache key so view profiles sync across the app
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

            // Update your global Zustand auth store so sidebars and headers update instantly
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

            return apiFetch(`/api/v1/accounts/${username}/statuses?limit=20${excludeRepliesFlag}${maxIdParam}`);
        },
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
        enabled: !!username,
    });
}

