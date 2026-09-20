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
                const { apiFetch } = await import('../../api/apiClient');
                const res = await apiFetch('/events/filter_by_date', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(filterPayload)
                });
                result = res?.data || res?.events || res;
            } catch (err) {
                console.warn('Backend POST filter_by_date failed, falling back to mock filter:', err);
                result = api.filterEventsByDate(filterPayload);
            }
            if (Array.isArray(result)) {
                return result.map(normalizeEvent);
            }
            return result;
        }
    });
}


// Hook B: Replaces toggleEventInterest
export function useToggleEventInterest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId) => {
            return api.toggleEventInterest(eventId);
        },
        // Optimistic Update: instantly flip state on click without deep nesting
        onSuccess: () => {
            // Safely invalidate just the events cache to trigger a localized background update
            queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
        },
    });
}

// Hook D: Replaces toggleEventAttendance
export function useToggleEventAttendance(eventId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return api.toggleEventAttendance(eventId);
        },
        onSuccess: () => {
            // Invalidate both the events grid list and specific expanded layout detail keys
            queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['event', eventId, 'details'] });
        },
    });
}

// Hook E: Replaces addEventComment
export function useAddEventComment(eventId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentText) => {
            return api.addEventComment(eventId, commentText);
        },
        onSuccess: () => {
            // Invalidate the detailed log parameters for this unique entity so the thread updates
            queryClient.invalidateQueries({ queryKey: ['event', eventId, 'details'] });
        },
    });
}

