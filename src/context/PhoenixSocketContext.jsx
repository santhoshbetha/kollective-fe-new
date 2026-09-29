import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'phoenix';
import { useAuthStore } from '../store/auth/useAuthStore';

const PhoenixSocketContext = createContext(null);

export const PhoenixSocketProvider = ({ children }) => {
    // Listen to authentication states to react dynamically to logins/logouts
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const [socket, setSocket] = useState(null);
    const [channel, setChannel] = useState(null);
    //const [juryAlert, setJuryAlert] = useState(null);

    useEffect(() => {
        let phoenixSocket = null;
        let userChannel = null;

        try {
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/socket';

            // 🚀 ADVANCED GUEST ACCESS STRATEGY:
            // Dynamically load the token on connection if authenticated.
            // If they are a guest visitor, pass an empty string—your Elixir UserSocket 
            // connect/2 function can catch this to assign a guest socket room safely!
            phoenixSocket = new Socket(wsUrl, {
                params: {
                    token: isAuthenticated ? (localStorage.getItem("user_token") || "") : ""
                },
                // Back-off physics configuration multiplier for unstable networks
                reconnectAfterMs: (tries) => [1000, 2000, 5000, 10000][tries - 1] || 10000
            });

            phoenixSocket.connect();
            setSocket(phoenixSocket);

            // 🚀 AUTHENTICATED NOTIFICATION LANE:
            // Only mount and subscribe to private push notification channels if a user is logged in
            if (isAuthenticated && user?.handle) {
                const userId = user.handle.replace('@', '');
                userChannel = phoenixSocket.channel(`user:${userId}`, {});

                userChannel.join()
                    .receive('ok', () => console.log(`Connected secure sync channel: user:${userId}`))
                    .receive('error', resp => console.error('Private sync channel connection rejected:', resp));

                //userChannel.on('new_notification', (payload) => {
                //    if (payload.type === 'JURY_DUTY_ASSIGNED') {
                //        setJuryAlert(payload);
                //    }
                //});
                setChannel(userChannel);
            } else {
                // Wipe channels clean if unauthenticated visitor context is loaded
                setChannel(null);
            }

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
            if (userChannel) {
                try { userChannel.leave(); } catch (err) { console.error(err); }
            }
            if (phoenixSocket) {
                try { phoenixSocket.disconnect(); } catch (err) { console.error(err); }
            }
        };
    }, [user, isAuthenticated]); // Re-fire safely whenever authentication profiles shift

    return (
        <PhoenixSocketContext.Provider value={{ socket, channel, /*juryAlert, setJuryAlert */ }}>
            {children}
        </PhoenixSocketContext.Provider>
    );
};

export const useSocket = () => useContext(PhoenixSocketContext);
