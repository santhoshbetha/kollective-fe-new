// src/features/events/useEventsFeature.js
import {
    useQuery,
    useInfiniteQuery,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';
import { normalizeEvent } from '../../utils/eventUtils';

/**
 * 📡 Hook A: Pulls a flat, comprehensive listing of upcoming community events
 */
export function useEventsQuery() {
    const { data, isPending } = useQuery({
        queryKey: ['events', 'list'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/events');
                if (res && (res.data || Array.isArray(res))) {
                    return res;
                }
            } catch (err) {
                console.warn('apiFetch failed for events query, falling back to mockApi', err);
            }
            return api.getEvents();
        },
    });

    const rawList = data?.events || data?.data || (Array.isArray(data) ? data : []);
    const normalizedEvents = Array.isArray(rawList) ? rawList.map(normalizeEvent) : [];

    return {
        events: normalizedEvents,
        eventsLoading: isPending,
    };
}

export function useEventsInfiniteQuery() {
    return useInfiniteQuery({
        queryKey: ['events', 'list'],
        queryFn: async ({ pageParam }) => {
            const cursorParam = pageParam ? `?cursor=${pageParam}` : '';
            try {
                const res = await apiFetch(`/events${cursorParam}`);
                if (res && (res.data || Array.isArray(res))) {
                    return res;
                }
            } catch (err) {
                console.warn('apiFetch failed for events query, falling back to mockApi', err);
            }
            return api.getEvents({ max_id: pageParam });
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage?.next_cursor ?? lastPage?.nextCursor ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
    });
}


/**
 * 🚀 UPGRADED INFINITE QUERY: Cursor-based paginated events loader
 * Seamlessly hooks your structural calendars straight into your React Virtuoso scrollers.
 */
export function useInfiniteEventsQuery(scope = 'all') {
    return useInfiniteQuery({
        queryKey: ['events', 'infinite', scope],
        queryFn: async ({ pageParam = null }) => {
            const cursorQuery = pageParam ? `?cursor=${pageParam}` : '';
            const res = await apiFetch(`/events/paginated${cursorQuery}`);
            return res?.data || res; // Expects shape: { events: [...], next_cursor: "ULID" }
        },
        getNextPageParam: (lastPage) => lastPage?.next_cursor || undefined,
        initialPageParam: null,
    });
}

/**
 * 🎛️ Hook: Filters active events by date, distance, or scope via secure POST queries
 */
export function useFilterEvents() {
    return useMutation({
        mutationFn: async (filterPayload) => {
            let result;
            try {
                const res = await apiFetch('/events/filter_by_date', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(filterPayload)
                });
                result = res?.data || res?.events || res;
            } catch (err) {
                console.warn('Backend POST filter_by_date failed, falling back to mock filter:', err);
                result = await api.filterEventsByDate(filterPayload);
            }
            if (Array.isArray(result)) {
                return result.map(normalizeEvent);
            }
            return result;
        }
    });
}

/**
 * 🪐 HELPER: Reusable, deep structural cache updating macro
 * Sanitizes both standalone list queries and paginated page parameters concurrently
 */
const performCacheUpdate = (queryClient, partialMatchKey, targetId, transformer) => {
    queryClient.setQueriesData({ queryKey: partialMatchKey }, (oldCacheData) => {
        if (!oldCacheData) return oldCacheData;

        const mutateNode = (item) => item.id === targetId ? transformer(item) : item;
        const mutateArray = (arr) => Array.isArray(arr) ? arr.map(mutateNode) : arr;

        if (Array.isArray(oldCacheData)) return mutateArray(oldCacheData);

        if (oldCacheData.pages) {
            return {
                ...oldCacheData,
                pages: oldCacheData.pages.map((page) => {
                    const list = Array.isArray(page) ? page : (page?.events || page?.data || []);
                    const updated = mutateArray(list);
                    return Array.isArray(page) ? updated : { ...page, events: updated };
                })
            };
        }

        if (oldCacheData.data) return { ...oldCacheData, data: mutateArray(oldCacheData.data) };
        if (oldCacheData.events) return { ...oldCacheData, events: mutateArray(oldCacheData.events) };

        return oldCacheData;
    });
};

/**
 * ⚡ Hook B: Toggles a user's interest ('Interested' status indicator flag)
 */
export function useToggleEventInterest(defaultEventId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId) => {
            const targetId = eventId || defaultEventId;
            let result;
            try {
                const res = await apiFetch(`/events/${targetId}/rsvp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'interested' })
                });
                if (res) result = res?.data || res;
            } catch (err) {
                console.warn('Backend toggleEventInterest failed, falling back to mockApi:', err);
            }
            if (!result && typeof api.toggleEventInterest === 'function') {
                result = await api.toggleEventInterest(targetId);
            }
            return result;
        },
        onMutate: async (eventId) => {
            const targetId = eventId || defaultEventId;

            // 🚀 CACHE FIX: Cancel matching queries cleanly before modifying state
            await queryClient.cancelQueries({ queryKey: ['events'] });

            performCacheUpdate(queryClient, ['events'], targetId, (item) => {
                const nextInterested = !item.isInterested;
                return {
                    ...item,
                    isInterested: nextInterested,
                    interestedCount: nextInterested
                        ? (item.interestedCount || 0) + 1
                        : Math.max(0, (item.interestedCount || 1) - 1)
                };
            });
        },
        onSettled: (data, error, variables) => {
            const targetId = variables || defaultEventId;
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event', targetId] });
        },
    });
}

/**
 * 🎫 Hook D: Toggles a user's direct active attendance ('Going' / RSVP joining matrix)
 */
export function useToggleEventAttendance(defaultEventId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId) => {
            const targetId = eventId || defaultEventId;
            let result;
            try {
                const res = await apiFetch(`/kollective/events/${targetId}/join`, {
                    method: 'POST'
                });
                if (res) result = res?.data || res;
            } catch (err) {
                console.warn('Backend toggleEventAttendance failed, falling back to mockApi:', err);
            }
            if (!result && typeof api.toggleEventAttendance === 'function') {
                result = await api.toggleEventAttendance(targetId);
            }
            return result;
        },
        onMutate: async (eventId) => {
            const targetId = eventId || defaultEventId;
            await queryClient.cancelQueries({ queryKey: ['events'] });

            performCacheUpdate(queryClient, ['events'], targetId, (item) => {
                const nextAttending = !item.isAttending;
                return {
                    ...item,
                    isAttending: nextAttending,
                    attendeesCount: nextAttending
                        ? (item.attendeesCount || 0) + 1
                        : Math.max(0, (item.attendeesCount || 1) - 1)
                };
            });
        },
        onSettled: (data, error, variables) => {
            const targetId = variables || defaultEventId;
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event', targetId] });
        },
    });
}

/**
 * 💬 Hook E: Dispatches discussion comments into an event's feed room
 */
/**
 * 💬 Upgraded Mutation: Dispatches a discussion comment into an event's feed room
 * Replaces both broken duplicates with a uniform, multi-cache invalidation matrix.
 * 
 * @param {string} defaultEventId - The contextual current event ID bounding the workspace
 */
export function useAddEventComment(defaultEventId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            let targetId = defaultEventId;
            let text = '';
            let parentId = null;
            let imageUrl = null; // 🚀 SYNTAX FIX: Declared variable to prevent un-scoped runtime memory leaks

            if (typeof payload === 'string') {
                text = payload;
            } else if (payload && typeof payload === 'object') {
                targetId = payload.eventId || defaultEventId;
                text = payload.commentText || payload.text || payload.content || '';
                parentId = payload.parentId || payload.parent_id || null;
                imageUrl = payload.imageUrl || payload.image_url || null;
            }

            let result;
            try {
                const res = await apiFetch(`/events_comments/${targetId}/comment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text,
                        content: text,
                        parent_id: parentId,
                        image_url: imageUrl
                    })
                });
                if (res) result = res?.data || res;
            } catch (err) {
                console.warn('Backend addEventComment failed, falling back to mockApi:', err);
            }

            if (!result && typeof api.addEventComment === 'function') {
                result = await api.addEventComment(targetId, text, { parent_id: parentId, image_url: imageUrl });
            }

            return result;
        },

        // 🚀 THE REAL-TIME HANDSHAKE FIX:
        // Clear specific details subkeys concurrently to reflect the new comment instantly
        onSuccess: (data, payload) => {
            const targetId = (typeof payload === 'object' && payload?.eventId) ? payload.eventId : defaultEventId;

            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event', targetId] });

            // 🎯 Clear both possible discussion subkeys so the comments list updates live
            queryClient.invalidateQueries({ queryKey: ['event', targetId, 'details'] });
            queryClient.invalidateQueries({ queryKey: ['event_comments', targetId] });
        },
    });
}

/**
 * 📡 Hook F: Fetches internal discussion subkey logs for a single target event
 */
export function useEventCommentsQuery(eventId) {
    return useQuery({
        queryKey: ['event_comments', eventId],
        enabled: Boolean(eventId),
        queryFn: async () => {
            try {
                const res = await apiFetch(`/event_comments?event_id=${eventId}`);
                if (res && (res.data || Array.isArray(res))) {
                    return res.data || res;
                }
            } catch (err) {
                console.warn('apiFetch failed for event_comments, returning empty array:', err);
            }
            return [];
        },
    });
}

/**
 * ❤️ Hook G: Likes a specific discussion message comment node inline
 */
export function useLikeEventComment(eventId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentId) => {
            let result;
            try {
                const res = await apiFetch(`/event_comments/${commentId}/like`, {
                    method: 'POST'
                });
                if (res) result = res?.data || res;
            } catch (err) {
                console.warn('Backend like comment failed:', err);
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event_comments', eventId] });
        },
    });
}

/**
 * 🎫 Mutation: Dispatches a new community event layout to your Elixir storage layer
 */
export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventData) => {
            const payload = eventData.event ? eventData : { event: eventData };

            // Call your live Phoenix REST endpoints
            const res = await apiFetch('/events', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            return res?.data || res;
        },

        // 🚀 THE CACHE INVALIDATION FIX:
        // Wipe all variations of your event lists to display the new item instantly
        onSuccess: () => {
            // Drops the legacy non-paginated events cache list
            queryClient.invalidateQueries({ queryKey: ['events', 'list'] });

            // 🎯 Drops your brand new paginated infinite scroller caches completely
            queryClient.invalidateQueries({ queryKey: ['events', 'infinite'] });
        },
    });
}

