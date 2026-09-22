// src/features/events/useEventsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';
import { normalizeEvent } from '../../utils/eventUtils';

// Hook A: Replaces events and eventsLoading
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

// Hook to filter events by date, distance, or state via POST call
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


// Hook B: Replaces toggleEventInterest
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
            await queryClient.cancelQueries({ queryKey: ['events'] });

            const updateItem = (item) => {
                if (item.id === targetId) {
                    const nextInterested = !item.isInterested;
                    return {
                        ...item,
                        isInterested: nextInterested,
                        interestedCount: nextInterested
                            ? (item.interestedCount || 0) + 1
                            : Math.max(0, (item.interestedCount || 1) - 1)
                    };
                }
                return item;
            };

            const updateCache = (old) => {
                if (!old) return old;
                if (Array.isArray(old)) return old.map(updateItem);
                if (old.data && Array.isArray(old.data)) return { ...old, data: old.data.map(updateItem) };
                if (old.events && Array.isArray(old.events)) return { ...old, events: old.events.map(updateItem) };
                return old;
            };

            queryClient.setQueriesData({ queryKey: ['events'] }, updateCache);
        },
        onSettled: (data, error, variables) => {
            const targetId = variables || defaultEventId;
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['event', targetId] });
        },
    });
}

// Hook D: Replaces toggleEventAttendance
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

            const updateItem = (item) => {
                if (item.id === targetId) {
                    const nextAttending = !item.isAttending;
                    return {
                        ...item,
                        isAttending: nextAttending,
                        attendeesCount: nextAttending
                            ? (item.attendeesCount || 0) + 1
                            : Math.max(0, (item.attendeesCount || 1) - 1)
                    };
                }
                return item;
            };

            const updateCache = (old) => {
                if (!old) return old;
                if (Array.isArray(old)) return old.map(updateItem);
                if (old.data && Array.isArray(old.data)) return { ...old, data: old.data.map(updateItem) };
                if (old.events && Array.isArray(old.events)) return { ...old, events: old.events.map(updateItem) };
                return old;
            };

            queryClient.setQueriesData({ queryKey: ['events'] }, updateCache);
        },
        onSettled: (data, error, variables) => {
            const targetId = variables || defaultEventId;
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['event', targetId] });
        },
    });
}

// Hook E: Replaces addEventComment
export function useAddEventComment(defaultEventId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            let targetId = defaultEventId;
            let text = '';
            let parentId = null;

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
                    body: JSON.stringify({ text, content: text, parent_id: parentId, image_url: imageUrl })
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
        onSuccess: (data, payload) => {
            const targetId = (typeof payload === 'object' && payload?.eventId) ? payload.eventId : defaultEventId;
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['event', targetId] });
            queryClient.invalidateQueries({ queryKey: ['event_comments', targetId] });
        },
    });
}

// Hook F: Fetches discussion comments for an event
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

// Hook G: Likes a specific event comment
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


