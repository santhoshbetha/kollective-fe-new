// src/features/organize/useOrganizeFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

// Hook A: Replaces organizeActions and organizeActionsLoading
export function useOrganizeActionsQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['organize', 'actions'],
        queryFn: api.getOrganizeActions,
        staleTime: 60 * 1000, // Stays fresh in cache for 1 minute
    });

    return {
        organizeActions: data?.actions || data || [],
        organizeActionsLoading: isPending,
        organizeActionsError: error,
    };
}

// Hook B: Replaces rsvpToAction
export function useRsvpToAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ actionId, status }) => {
            // status can be: 'attending', 'interested', or 'declined'
            return api.rsvpToAction(actionId, status);
        },
        onSuccess: () => {
            // Invalidate both the organizing action feeds and any dashboard scheduling query lists
            queryClient.invalidateQueries({ queryKey: ['organize', 'actions'] });
            queryClient.invalidateQueries({ queryKey: ['schedule'] }); // Updates schedule view if active
        },
    });
}

export function useCreateAction() {
    const queryClient = useQueryClient();

    return useMutation({
        // 1. Post the structured action parameters directly to your mockApi endpoint
        mutationFn: async (actionData) => {
            // actionData structure matches form state: { title: "...", description: "..." }
            return api.createAction(actionData);
        },

        // 2. Clear out old stale caches immediately upon a successful creation run
        onSuccess: () => {
            // Invalidate the primary organize action feed and any dashboard scheduling grids
            queryClient.invalidateQueries({ queryKey: ['organize', 'actions'] });
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
        },
    });
}
