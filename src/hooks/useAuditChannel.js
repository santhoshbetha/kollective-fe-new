// hooks/useAuditChannel.js
import { useEffect, useState } from 'react';
import { Socket } from 'phoenix';

export default function useAuditChannel(activeOrgId, onNewLogReceived) {
    const [channel, setChannel] = useState(null);

    useEffect(() => {
        if (!activeOrgId) return;

        // 1. Fetch user socket token (generated upon login)
        const token = localStorage.getItem('socket_token');
        const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:4000/socket';

        // 2. Initialize connection
        const socket = new Socket(wsUrl, { params: { token } });
        socket.connect();

        // 3. Join the explicit organization topic
        const topic = `org_admin_audit:${activeOrgId}`;
        const channelInstance = socket.channel(topic, {});

        channelInstance
            .join()
            .receive('ok', () => console.log(`Successfully joined real-time audit logs for Org: ${activeOrgId}`))
            .receive('error', (resp) => console.error('Unable to join channel', resp));

        // 4. Bind listener for the backend broadcast event
        channelInstance.on('new_audit_log', (newLog) => {
            onNewLogReceived(newLog);
        });

        setChannel(channelInstance);

        // Cleanup phase: Leave channel and terminate connection if unmounting
        return () => {
            channelInstance.leave();
            socket.disconnect();
        };
    }, [activeOrgId]); // Re-runs naturally if organization switcher alters identity context

    return channel;
}
