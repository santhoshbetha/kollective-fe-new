// src/features/notifications/useNotificationListener.js
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { Socket } from 'phoenix'; // Standard Phoenix frontend JS client dependency package

export function useNotificationListener() {
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((state) => state.user);

    // Extract clean ID string parameter safely out of authentication tokens
    const accountId = currentUser?.id;

    useEffect(() => {
        if (!accountId) return;

        // 1. Initialize Phoenix socket client connections
        const token = useAuthStore.getState().token || localStorage.getItem('jwt_auth_token');
        const socket = new Socket('/socket', { params: { token } });
        socket.connect();

        // 2. Bind into the specific user notification room channel matrix
        const channel = socket.channel(`notifications:user:${accountId}`, {});

        channel.join()
            .receive("ok", () => console.log("🎰 Real-time notification array stream synchronized securely."))
            .receive("error", resp => console.error("Unable to join notification matrix channel room", resp));

        // 3. 🎯 THE REAL-TIME CACHE INTERCEPT MATRIX:
        // Captures incoming alerts and instantly injects them into the data feed layer.
        channel.on("new_notification", (incomingNotification) => {

            // Update the TanStack query data cache key pool instantly
            queryClient.setQueryData(['notifications', 'history'], (oldCacheData) => {
                if (!oldCacheData) return oldCacheData;

                if (oldCacheData.pages) {
                    // Infinite query cache structure
                    return {
                        ...oldCacheData,
                        pages: oldCacheData.pages.map((page, index) => {
                            if (index === 0) {
                                return {
                                    ...page,
                                    notifications: [incomingNotification, ...(page.notifications || [])]
                                };
                            }
                            return page;
                        })
                    };
                }

                if (Array.isArray(oldCacheData)) {
                    return [incomingNotification, ...oldCacheData];
                }

                if (oldCacheData.notifications) {
                    return {
                        ...oldCacheData,
                        notifications: [incomingNotification, ...(oldCacheData.notifications || [])]
                    };
                }

                return oldCacheData;
            });

            queryClient.invalidateQueries({ queryKey: ['notifications', 'history'] });
        });

        // 🧼 Clean up channel socket registrations cleanly when user logs out or shifts pages
        return () => {
            channel.leave();
            socket.disconnect();
        };
    }, [accountId, queryClient]);
}
