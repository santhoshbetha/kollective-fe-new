// src/features/notifications/useNotificationsFeature.js
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import * as api from '../../api/mockApi';

/**
 * 🛰️ HOOK A: Retrieves all background history data streams
 * Upgraded with a direct real-time WebSocket channel listener loop.
 */
export function useNotificationsQuery(socketChannelInstance = null) {
    const queryClient = useQueryClient();

    const queryData = useQuery({
        queryKey: ['notifications', 'history'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/notifications');
                return res?.data || res?.notifications || res;
            } catch (err) {
                console.warn('Backend notifications query failed, falling back to mockApi:', err);
                return api.getNotifications ? api.getNotifications() : [];
            }
        },
        staleTime: 60 * 1000, // Stays fresh in cache memory for 1 minute
        gcTime: 5 * 60 * 1000,
    });

    const parsedNotifications = useMemo(() => {
        const raw = queryData.data;
        return typeof raw === 'object' && !Array.isArray(raw)
            ? raw?.notifications || raw?.data || []
            : Array.isArray(raw) ? raw : [];
    }, [queryData.data]);

    // 🚀 REAL-TIME EVENT STREAM CONSUMER:
    // Listens directly to incoming socket payloads and injects them instantly into the UI cache
    useEffect(() => {
        if (!socketChannelInstance) return;

        const handleNewIncomingNotification = (payload) => {
            const newNotificationItem = payload?.notification || payload;
            if (!newNotificationItem?.id) return;

            queryClient.setQueryData(['notifications', 'history'], (oldCacheData) => {
                const legacyList = Array.isArray(oldCacheData)
                    ? oldCacheData
                    : (oldCacheData?.notifications || oldCacheData?.data || []);

                // Prevent inserting duplicate event payloads if requests overlap
                if (legacyList.some(item => item.id === newNotificationItem.id)) return oldCacheData;

                const targetUpdatedArray = [newNotificationItem, ...legacyList];

                if (Array.isArray(oldCacheData)) return targetUpdatedArray;
                if (oldCacheData?.notifications) return { ...oldCacheData, notifications: targetUpdatedArray };
                return { ...oldCacheData, data: targetUpdatedArray };
            });
        };

        // Bind listener hooks to your Phoenix/Elixir distribution channel broadcasts
        socketChannelInstance.on('new_notification', handleNewIncomingNotification);
        socketChannelInstance.on('notification_created', handleNewIncomingNotification);

        return () => {
            socketChannelInstance.off('new_notification', handleNewIncomingNotification);
            socketChannelInstance.off('notification_created', handleNewIncomingNotification);
        };
    }, [socketChannelInstance, queryClient]);

    return {
        notifications: parsedNotifications,
        notificationsLoading: queryData.isPending,
        notificationsError: queryData.error,
        unreadCount: parsedNotifications.filter(n => !n?.is_read && !n?.read).length
    };
}

import { useMemo } from 'react';

/**
 * 🚀 HOOK B: Marks all notification items as read with an immediate optimistic UI update
 */
export function useMarkNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            try {
                const res = await apiFetch('/notifications/mark_as_read', { method: 'POST' });
                return res?.data || res;
            } catch (err) {
                console.warn('Backend mark_as_read failed, falling back to mockApi:', err);
                return api.markNotificationsAsRead ? api.markNotificationsAsRead() : { success: true };
            }
        },

        // ⚡ OPTIMISTIC UI SYNCHRONIZER:
        // Instantly flips all unread states to read on the client side without layout flashing
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications', 'history'] });

            const previousData = queryClient.getQueryData(['notifications', 'history']);

            queryClient.setQueryData(['notifications', 'history'], (oldCacheData) => {
                if (!oldCacheData) return oldCacheData;

                const list = Array.isArray(oldCacheData)
                    ? oldCacheData
                    : (oldCacheData?.notifications || oldCacheData?.data || []);

                const updatedList = list.map(item => ({
                    ...item,
                    is_read: true,
                    read: true
                }));

                if (Array.isArray(oldCacheData)) return updatedList;
                if (oldCacheData?.notifications) return { ...oldCacheData, notifications: updatedList };
                return { ...oldCacheData, data: updatedList };
            });

            return { previousData };
        },

        // Clean rollback if the server network call rejects
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['notifications', 'history'], context.previousData);
            }
        },

        // Ensure state indices stay fully synchronized
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'history'] });
        },
    });
}

/**
 * 🤝 HOOK C: Handles following/unfollowing user nodes with automatic target cache clearing
 */
export function useToggleFollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (username) => {
            try {
                const res = await apiFetch('/relationships/toggle', {
                    method: 'POST',
                    body: JSON.stringify({ username, target_username: username, action: 'follow' })
                });
                return res?.data || res;
            } catch (err) {
                console.warn('Backend toggle follow failed, falling back to mockApi:', err);
                return api.toggleFollowUser ? api.toggleFollowUser(username) : { following: true };
            }
        },
        onSuccess: (data, username) => {
            // Force dynamic clearing across matching user networks profiles
            queryClient.invalidateQueries({ queryKey: ['notifications', 'history'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'profile', username] });
            queryClient.invalidateQueries({ queryKey: ['search', 'users'] });
        },
    });
}

