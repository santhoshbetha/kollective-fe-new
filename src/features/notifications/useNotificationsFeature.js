// src/features/notifications/useNotificationsFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../api/mockApi';

// Hook A: Replaces notifications and notificationsLoading
export function useNotificationsQuery() {
    const { data, isPending } = useQuery({
        queryKey: ['notifications', 'history'],
        queryFn: api.getNotifications,
        staleTime: 30 * 1000, // Stays fresh in memory for 30 seconds
    });

    return {
        notifications: data?.notifications || data || [],
        notificationsLoading: isPending,
    };
}

// Hook B: Replaces markNotificationsAsRead
export function useMarkNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.markNotificationsAsRead,
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
            return api.toggleFollowUser(username);
        },
        onSuccess: () => {
            // Following updates user states and can fire a newsfeed alert notification
            queryClient.invalidateQueries({ queryKey: ['notifications', 'history'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }); // Invalidate profile if viewing one
        },
    });
}
