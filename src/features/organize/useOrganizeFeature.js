// src/features/organize/useOrganizeFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

// Hook A: Replaces organizeActions and organizeActionsLoading
export function useOrganizeActionsQuery() {
    const { data, isPending, error } = useQuery({
        queryKey: ['organize', 'actions'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/actions');
                return res?.data || res?.actions || res;
            } catch (err) {
                console.warn('Backend actions query failed, falling back to mockApi', err);
                return api.getOrganizeActions();
            }
        },
        staleTime: 60 * 1000,
    });

    return {
        organizeActions: Array.isArray(data) ? data : (data?.actions || []),
        organizeActionsLoading: isPending,
        organizeActionsError: error,
    };
}

// Hook B: Replaces rsvpToAction
export function useRsvpToAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ actionId, status }) => {
            try {
                return await apiFetch(`/actions/${actionId}/rsvp`, {
                    method: 'POST',
                    body: JSON.stringify({ status })
                });
            } catch (err) {
                console.warn('Backend rsvp action failed, falling back to mockApi', err);
                return api.rsvpToAction(actionId, status);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organize', 'actions'] });
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
        },
    });
}

export function useCreateAction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (actionData) => {
            try {
                return await apiFetch('/actions', {
                    method: 'POST',
                    body: JSON.stringify({ action: actionData })
                });
            } catch (err) {
                console.warn('Backend create action failed, falling back to mockApi', err);
                return api.createAction(actionData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organize', 'actions'] });
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
        },
    });
}

