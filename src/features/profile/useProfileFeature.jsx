// src/features/profile/useProfileFeature.js
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useAccountsStore } from '../../store/useAccountsStore';

/**
 * 👤 Query: Fetches a single user profile record cleanly by their specific username handle
 */
export function useProfileQuery(username) {
    return useQuery({
        queryKey: ['profile', username],
        queryFn: async () => {
            const res = await apiFetch(`/api/v1/accounts/${username}`);
            // Unpack if the backend returns a wrapped data payload object
            return res?.data || res;
        },
        enabled: !!username,
        staleTime: 1000 * 60 * 5, // Profile metadata remains fresh for 5 minutes
    });
}

/**
 * 🚀 UNIFIED PAGINATION CURSOR EXTRACTOR
 * Safely parses layout variations to align with Elixir/Oban next_cursor conventions.
 */
const getNextCursor = (lastPage) => {
    if (!lastPage) return undefined;

    // 1. Check for dedicated next_cursor token returned from your Elixir queries
    if (lastPage.next_cursor) return lastPage.next_cursor;
    if (lastPage.nextPageId) return lastPage.nextPageId;

    // 2. Fallback to extracting the ID of the last item in the list array
    const posts = lastPage.posts || lastPage.data || (Array.isArray(lastPage) ? lastPage : []);
    if (posts.length > 0) {
        return posts[posts.length - 1]?.id;
    }

    return undefined;
};

/**
 * 🗳️ Upgraded Infinite Query: Handles both split-mode root tracking and complete reply streams.
 * Replaces both previous duplicate functions with a single, highly performant query pipeline.
 * 
 * @param {string} username - Target handle to load posts for
 * @param {string} currentMode - 'root_only' or 'with_replies'
 */
export function useProfileTimelineQuery(username, currentMode = 'with_replies') {
    return useInfiniteQuery({
        queryKey: ['profile', username, 'timeline-stream', currentMode],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `&max_id=${pageParam}` : '';
            // Enforce Fediverse parameters: root_only triggers the exclude_replies flag on Elixir
            const excludeRepliesFlag = currentMode === 'root_only' ? '&exclude_replies=true' : '';

            const res = await apiFetch(
                `/api/v1/accounts/${username}/posts?limit=20${excludeRepliesFlag}${maxIdParam}`
            );
            return res?.data || res;
        },
        getNextPageParam: getNextCursor,
        initialPageParam: null,
        enabled: !!username,
    });
}

/**
 * 🎛️ Mutation: Dispatches persistent profile description modifications to your storage layer
 */
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
            const accountObj = updatedData?.data || updatedData;

            if (accountObj && accountObj.id) {
                // Sync Zustand normalization directory cache tables instantly
                useAccountsStore.getState().importFetchedAccounts([accountObj]);
            }

            // Invalidate and refresh query states concurrently across all active screen panels
            queryClient.invalidateQueries({ queryKey: ['profile', username] });
            queryClient.setQueryData(['profile', username], accountObj);
        },
    });
}

/**
 * ⚙️ Mutation: Syncs logged-in identity modifications with your secure authentication sessions
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();
    const setSession = useAuthStore((state) => state.setSession);
    const token = useAuthStore((state) => state.token);
    const currentUser = useAuthStore((state) => state.user);

    return useMutation({
        mutationFn: async (updatedData) => {
            const res = await apiFetch('/profile', {
                method: 'PUT',
                body: JSON.stringify(updatedData),
            });
            return res?.data || res?.user || res;
        },
        onSuccess: (updatedUser) => {
            // Flash absolute auth query identifiers cleanly
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

            if (updatedUser) {
                const userObj = updatedUser.data || updatedUser.user || updatedUser;

                // 🚀 STRUCTURAL NORMALIZATION FIX: Standardize asset parameter names
                const mergedUser = {
                    ...currentUser,
                    ...userObj,
                    avatar: userObj.avatar_url || userObj.avatar || currentUser?.avatar,
                    avatar_url: userObj.avatar_url || userObj.avatar || currentUser?.avatar_url,
                    banner: userObj.cover_image_url || userObj.banner || userObj.header || currentUser?.banner,
                    cover_image_url: userObj.cover_image_url || userObj.banner || userObj.header || currentUser?.cover_image_url,
                };

                // Update authentication layer session keys
                setSession(token, mergedUser);

                // Also update the global Accounts directory if the user has a profile row matching
                if (mergedUser.username) {
                    queryClient.invalidateQueries({ queryKey: ['profile', mergedUser.username] });
                    queryClient.setQueryData(['profile', mergedUser.username], mergedUser);
                }
            }
        },
    });
}

/**
 * 🔀 Mutation: Toggles the follow connection status between user handles via the backend API
 */
export function useToggleFollowMutation(username) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ targetId }) => {
            const idToUse = targetId || username;
            return apiFetch('/api/v1/relationships/toggle', {
                method: 'POST',
                body: JSON.stringify({
                    target_id: idToUse,
                    type: 'follow',
                }),
            });
        },
        onSuccess: (res) => {
            const relationshipState = res?.data || res;

            // Flash queries in parallel to trigger fresh data hydration layouts instantly
            if (username) {
                queryClient.invalidateQueries({ queryKey: ['profile', username] });
                queryClient.invalidateQueries({ queryKey: ['profile', username, 'timeline-stream'] });
            }
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['timeline'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        },
    });
}

/**
 * 📡 Infinite Query: Pulls a user's connections roster (followers or following)
 * @param {string} username - Target user handle
 * @param {string} connectionType - 'followers' or 'following'
 */
export function useProfileConnectionsQuery(username, connectionType) {
    return useInfiniteQuery({
        queryKey: ['profile', username, 'connections', connectionType],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `?max_id=${pageParam}` : '';
            const res = await apiFetch(`/api/v1/accounts/${username}/${connectionType}${maxIdParam}`);
            return res?.data || res; // Expects shape: { accounts: [...], next_cursor: "ULID" }
        },
        getNextPageParam: (lastPage) => lastPage?.next_cursor || undefined,
        initialPageParam: null,
        enabled: !!username && (connectionType === 'followers' || connectionType === 'following'),
    });
}

