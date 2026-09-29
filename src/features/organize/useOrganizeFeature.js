// src/features/organize/useOrganizeFeature.js
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

/**
 * 📡 Hook A: Fetches a standard, non-paginated listing array of community actions
 */
export function useOrganizeActionsQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['organize', 'actions', 'list'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/actions');
                return res?.data || res?.actions || res;
            } catch (err) {
                console.warn('Backend actions query failed, falling back to mockApi:', err);
                return api.getOrganizeActions ? api.getOrganizeActions() : [];
            }
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    const parsedList = data?.actions || data?.data || (Array.isArray(data) ? data : []);

    return {
        organizeActions: parsedList,
        organizeActionsLoading: isPending,
        organizeActionsError: error,
    };
}

/**
 * 🚀 UPGRADED INFINITE QUERY: Cursor-based paginated organizing action loader
 * Seamlessly pairs with your virtualized scroll feeds to load items incrementally.
 */
export function useInfiniteOrganizeActionsQuery(scope = 'all') {
    return useInfiniteQuery({
        queryKey: ['organize', 'actions', 'infinite', scope],
        queryFn: async ({ pageParam = null }) => {
            const cursorQuery = pageParam ? `?cursor=${pageParam}` : '';
            const scopeQuery = scope !== 'all' ? `&scope=${encodeURIComponent(scope)}` : '';

            const res = await apiFetch(`/actions/paginated${cursorQuery}${scopeQuery}`);
            return res?.data || res; // Expects shape: { actions: [...], next_cursor: "ULID" }
        },
        getNextPageParam: (lastPage) => lastPage?.next_cursor || undefined,
        initialPageParam: null,
        staleTime: 30 * 1000,
    });
}

/**
 * 🪐 HELPER MACRO: Updates data structures across all caching envelopes concurrently
 */
const performActionCacheUpdate = (queryClient, partialKey, targetId, transformer) => {
    queryClient.setQueriesData({ queryKey: partialKey }, (oldCache) => {
        if (!oldCache) return oldCache;

        const mutateNode = (item) => item.id === targetId ? transformer(item) : item;
        const mutateArray = (arr) => Array.isArray(arr) ? arr.map(mutateNode) : arr;

        if (Array.isArray(oldCache)) return mutateArray(oldCache);

        if (oldCache.pages) {
            return {
                ...oldCache,
                pages: oldCache.pages.map((page) => {
                    const list = Array.isArray(page) ? page : (page?.actions || page?.data || []);
                    const updated = mutateArray(list);
                    return Array.isArray(page) ? updated : { ...page, actions: updated };
                })
            };
        }

        if (oldCache.data) return { ...oldCache, data: mutateArray(oldCache.data) };
        if (oldCache.actions) return { ...oldCache, actions: mutateArray(oldCache.actions) };

        return oldCache;
    });
};
/**
 * 🎫 Hook B: Handles casting an RSVP status on a community action with Optimistic Updates
 */
export function useRsvpToAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ actionId, status }) => {
            const res = await apiFetch(`/actions/${actionId}/rsvp`, {
                method: 'POST',
                body: JSON.stringify({ status })
            });
            return res?.data || res;
        },

        // 🚀 HARDWARE-ACCELERATED OPTIMISTIC UPDATES:
        // Modifies participant counters and indicators instantly without a network waiting flash
        onMutate: async ({ actionId, status }) => {
            // Cancel background fetches inside the organize query scope to avoid race state drops
            await queryClient.cancelQueries({ queryKey: ['organize'] });

            // Snapshot past cached dataset so the engine can restore cleanly if requests drop out
            const previousFlatActions = queryClient.getQueryData(['organize', 'actions', 'list']);

            const updateActionRsvpState = (actionItem) => {
                const currentStatus = actionItem.user_rsvp_status || actionItem.userStatus || null;
                let participantDelta = 0;

                // Adjust baseline numbers based on changes from previous states
                if (currentStatus === 'going' && status !== 'going') participantDelta -= 1;
                if (currentStatus !== 'going' && status === 'going') participantDelta += 1;

                return {
                    ...actionItem,
                    user_rsvp_status: status,
                    userStatus: status,
                    participants_count: Math.max(0, (actionItem.participants_count || actionItem.attendeesCount || 0) + participantDelta),
                    attendeesCount: Math.max(0, (actionItem.attendeesCount || 0) + participantDelta)
                };
            };

            // Inject the updated parameters into the legacy flat list query cache envelope instantly
            performActionCacheUpdate(queryClient, ['organize', 'actions', 'list'], actionId, updateActionRsvpState);

            // Inject the updated parameters into the upgraded infinite paginated query cache envelope instantly
            performActionCacheUpdate(queryClient, ['organize', 'actions', 'infinite'], actionId, updateActionRsvpState);

            return { previousFlatActions, actionId };
        },

        // Safely roll back the user interface if the network pipeline rejects or drops frames
        onError: (err, variables, context) => {
            console.error('Optimistic RSVP update failed. Reverting cache layout data segments:', err);
            if (context?.previousFlatActions) {
                queryClient.setQueryData(['organize', 'actions', 'list'], context.previousFlatActions);
            }
        },

        // Ensure everything is synchronized cleanly with live state indexes
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['organize', 'actions'] });
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
        },
    });
}

/**
 * 📝 Hook C: Dispatches a brand new initiative configuration to your Elixir storage layer
 */
export function useCreateAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (actionData) => {
            const payload = actionData.action ? actionData : { action: actionData };

            const res = await apiFetch('/actions', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            return res?.data || res;
        },

        // 🚀 THE MULTI-CACHE INVALIDATION MATRIX:
        // Wipe all cached variations of the actions feed to display the new item instantly
        onSuccess: () => {
            // Drops the legacy flat lists cache matrix
            queryClient.invalidateQueries({ queryKey: ['organize', 'actions', 'list'] });

            // 🎯 Drops all active paginated infinite scroll directory filters completely 
            queryClient.invalidateQueries({ queryKey: ['organize', 'actions', 'infinite'] });

            // Sync calendar schedules data panels
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
        },
    });
}
