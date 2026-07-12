// src/features/events/useEventsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

// Hook A: Replaces events and eventsLoading
export function useEventsQuery() {
    const { data, isPending } = useQuery({
        queryKey: ['events', 'list'],
        queryFn: api.getEvents,
    });

    return {
        events: data?.events || data || [],
        eventsLoading: isPending,
    };
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

