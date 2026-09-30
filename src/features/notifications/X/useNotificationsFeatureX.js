// src/features/notifications/useNotificationsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

// Hook A: Replaces notifications and notificationsLoading
export function useNotificationsQuery() {
    const { data, isPending } = useQuery({
        queryKey: ['notifications', 'history'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/notifications');
                return res?.data || res?.notifications || res;
            } catch (err) {
                console.warn('Backend notifications query failed, falling back to mockApi', err);
                return api.getNotifications();
            }
        },
        staleTime: 30 * 1000, // Stays fresh in memory for 30 seconds
    });

    return {
        notifications: Array.isArray(data) ? data : (data?.notifications || []),
        notificationsLoading: isPending,
    };
}

// Hook B: Replaces markNotificationsAsRead
export function useMarkNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            try {
                return await apiFetch('/notifications/mark_as_read', { method: 'POST' });
            } catch (err) {
                console.warn('Backend mark_as_read failed, falling back to mockApi', err);
                return api.markNotificationsAsRead();
            }
        },
        onSuccess: () => {
            // Safely flush the notification history key to remove unread styling markers
            queryClient.invalidateQueries({ queryKey: ['notifications', 'history'] });
        },
    });
}

// Hook C: Replaces toggleFollowUser
export function useToggleFollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (username) => {
            try {
                return await apiFetch('/relationships/toggle', {
                    method: 'POST',
                    body: JSON.stringify({ username, target_username: username, action: 'follow' })
                });
            } catch (err) {
                console.warn('Backend toggle follow failed, falling back to mockApi', err);
                return api.toggleFollowUser(username);
            }
        },
        onSuccess: () => {
            // Following updates user states and can fire a newsfeed alert notification
            queryClient.invalidateQueries({ queryKey: ['notifications', 'history'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }); // Invalidate profile if viewing one
        },
    });
}

