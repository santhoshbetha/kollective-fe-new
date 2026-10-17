// src/features/conversations/hooks/useDesktopBadging.js
import { useEffect } from 'react';
import { usePhoenixSocket } from '../../../context/PhoenixSocketContext';

export function useDesktopBadging(currentUserId) {
    const { socket } = usePhoenixSocket();

    useEffect(() => {
        if (!socket || !currentUserId) return;

        // Establish connection down the user's isolated notification stream scope
        const notificationChannel = socket.channel(`user_notifications:${currentUserId}`, {});

        notificationChannel.join()
            .receive("ok", () => console.log("📡 Notification sync pipeline anchored."))
            .receive("error", () => console.warn("Failed to lock notification matrix lanes."));

        // 📡 LISTEN FOR LIVE SERVER COUNTS OVERRIDES
        notificationChannel.on("badge_count_sync", (payload) => {
            const count = payload.unread_count || 0;

            // 🖥️ HARDWARE OPERATING SYSTEM DESKTOP INTEGRATION PIPELINES:
            // Checks for electron or tauri window app frame context containers parameters hooks
            if (window.Electron && window.Electron.updateBadgeCount) {
                window.Electron.updateBadgeCount(count);
            } else if (window.__TAURI__ && window.__TAURI__.notification) {
                // Tauri OS Badging Context call wrapper rules
                window.__TAURI__.invoke("set_badge_count", { count });
            }

            // Fallback: Sync browser tab document title count strings for standard desktop browsers
            document.title = count > 0 ? `(${count}) Kollective Mesh` : "Kollective Mesh";
        });

        return () => {
            notificationChannel.leave();
        };
    }, [socket, currentUserId]);
}
