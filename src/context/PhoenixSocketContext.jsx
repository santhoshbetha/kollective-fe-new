import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'phoenix';
import { useAuthStore } from '../store/auth/useAuthStore';

const PhoenixSocketContext = createContext(null);

export const PhoenixSocketProvider = ({ children }) => {
    const user = useAuthStore((state) => state.user);
    const [socket, setSocket] = useState(null);
    const [channel, setChannel] = useState(null);
    //const [juryAlert, setJuryAlert] = useState(null);

    useEffect(() => {
        // Guard: only run if we have a valid logged in user handle
        if (!user || !user.handle) {
            setSocket(null);
            setChannel(null);
            //setJuryAlert(null);
            return;
        }

        const userId = user.handle.replace('@', '');
        const userJwt = localStorage.getItem("user_token") || "mock-jwt-token";

        let phoenixSocket = null;
        let userChannel = null;

        try {
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/socket';

            phoenixSocket = new Socket(wsUrl, {
                params: { token: userJwt },
                reconnectAfterMs: () => 15000 // Slow down reconnection retries in mock environment
            });

            phoenixSocket.connect();
            setSocket(phoenixSocket);

            userChannel = phoenixSocket.channel(`user:${userId}`, {});
            userChannel.join()
                .receive('ok', () => console.log(`Connected mock socket channel: user:${userId}`))
                .receive('error', resp => console.warn('Phoenix channel join warning (expected in mock environment)', resp));

            //userChannel.on('new_notification', (payload) => {
            //    if (payload.type === 'JURY_DUTY_ASSIGNED') {
            //        setJuryAlert(payload);
            //    }
            //});

            setChannel(userChannel);
        } catch (e) {
            console.warn("Phoenix socket initialization bypassed:", e);
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

        return () => {
            //clearTimeout(timer);
            if (userChannel) {
                try { userChannel.leave(); } catch (err) { }
            }
            if (phoenixSocket) {
                try { phoenixSocket.disconnect(); } catch (err) { }
            }
        };
    }, [user]);

    return (
        <PhoenixSocketContext.Provider value={{ socket, channel, /*juryAlert, setJuryAlert */ }}>
            {children}
        </PhoenixSocketContext.Provider>
    );
};

export const useSocket = () => useContext(PhoenixSocketContext);
