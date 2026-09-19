// hooks/useUserNotifications.js
import { useEffect } from 'react';
import { Socket } from 'phoenix';

export default function useUserNotifications(currentUserId, onAlertReceived) {
    useEffect(() => {
        if (!currentUserId) return;

        const token = localStorage.getItem('socket_token');
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/socket';

        const socket = new Socket(wsUrl, { params: { token } });
        socket.connect();

        // Connect to the specific channel topic we constructed in our backend Endpoint broadcast
        const topic = `users_socket:${currentUserId}`;
        const channel = socket.channel(topic, {});

        channel.join()
            .receive('ok', () => console.log('Connected to personal systemic notification matrix'))
            .receive('error', (err) => console.error('Connection rejected', err));

        // Listen specifically for the "new_invitation_received" event
        channel.on('new_invitation_received', (payload) => {
            onAlertReceived(payload);
        });

        return () => {
            channel.leave();
            socket.disconnect();
        };
    }, [currentUserId]);
}
