// src/context/PhoenixSocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'phoenix';
import { useAuthStore } from '../store/auth/useAuthStore';

const PhoenixSocketContext = createContext(null);

export const PhoenixSocketProvider = ({ children }) => {
    // Listen to authentication states to react dynamically to logins/logouts
    const user = useAuthStore((state) => state.user);
    const storeToken = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const [socket, setSocket] = useState(null);
    const [channel, setChannel] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotification, setLatestNotification] = useState(null);
    //const [juryAlert, setJuryAlert] = useState(null);

    useEffect(() => {
        let phoenixSocket = null;
        let notificationChannel = null;

        if (!isAuthenticated || !user?.id) {
            setSocket(null);
            setChannel(null);
            setUnreadCount(0);
            return;
        }

        try {
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/socket';
            const authToken = storeToken || localStorage.getItem("auth_token") || localStorage.getItem("user_token") || localStorage.getItem("jwt_auth_token") || localStorage.getItem("socket_token") || "";

            // 🚀 ADVANCED GUEST ACCESS STRATEGY:
            // Dynamically load the token on connection if authenticated.
            // If they are a guest visitor, pass an empty string—your Elixir UserSocket 
            // connect/2 function can catch this to assign a guest socket room safely!
            phoenixSocket = new Socket(wsUrl, {
                params: {
                    token: authToken
                },
                // Back-off physics configuration multiplier for unstable networks
                reconnectAfterMs: (tries) => [1000, 2000, 5000, 10000][tries - 1] || 10000
            });

            phoenixSocket.connect();
            setSocket(phoenixSocket);

            // ✅ FIX 1 & 2: Route using the correct prefix and the user's explicit ULID key
            const targetTopic = `user_notifications:${user.id}`;
            notificationChannel = phoenixSocket.channel(targetTopic, {});

            // Hydrate unread metrics upon successful network connection loops
            notificationChannel.on('initial_state', (payload) => {
                if (payload && typeof payload.unread_count === 'number') {
                    setUnreadCount(payload.unread_count);
                }
            });

            // ✅ FIX 3: Catch the exact network event string passed from the backend
            notificationChannel.on('new_notification', (payload) => {
                console.log("⚡ Real-time Notification Node Received:", payload);
                setLatestNotification(payload);
                setUnreadCount((prev) => prev + 1);
            });

            notificationChannel.join()
                .receive('ok', () => console.log(` Connected secure sync channel: ${targetTopic}`))
                .receive('error', resp => console.error('Private sync channel connection rejected:', resp));

            //userChannel.on('new_notification', (payload) => {
            //    if (payload.type === 'JURY_DUTY_ASSIGNED') {
            //        setJuryAlert(payload);
            //    }
            //});
            setChannel(notificationChannel);

        } catch (e) {
            console.error("Phoenix socket initialization execution bypassed:", e);
        }

        // --- DEMO SIMULATED NOTIFICATION ---
        // Dispatches a simulated peer verification jury alert to let user verify the popup integration
        //const timer = setTimeout(() => {
        //    console.log("Simulating socket notification event JURY_DUTY_ASSIGNED...");
        //    setJuryAlert({
        //        type: 'JURY_DUTY_ASSIGNED',
        //        application_id: '201',
        //        message: 'Blind jury duty assignment generated.'
        //    });
        //}, 8000);

        // Cleanup cycle hooks protect memory limits against memory leaks
        return () => {
            if (notificationChannel) {
                try { notificationChannel.leave(); } catch (err) { console.error(err); }
            }
            if (phoenixSocket) {
                try { phoenixSocket.disconnect(); } catch (err) { console.error(err); }
            }
        };
    }, [user?.id, storeToken, isAuthenticated]); // Re-fire safely when user keys shift

    return (
        <PhoenixSocketContext.Provider value={{
            socket,
            channel,
            unreadCount,
            setUnreadCount,
            latestNotification,
            setLatestNotification
            /*juryAlert, setJuryAlert */
        }}>
            {children}
        </PhoenixSocketContext.Provider>
    );
};

const defaultSocketContext = {
    socket: null,
    channel: null,
    unreadCount: 0,
    setUnreadCount: () => {},
    latestNotification: null,
    setLatestNotification: () => {}
};

export const useSocket = () => useContext(PhoenixSocketContext) || defaultSocketContext;

