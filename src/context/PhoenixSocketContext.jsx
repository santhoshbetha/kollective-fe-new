// src/context/PhoenixSocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket, Presence } from 'phoenix';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useFeatureFlagsStore } from '../store/useFeatureFlags';

const PhoenixSocketContext = createContext(null);

export const PhoenixSocketProvider = ({ children }) => {
    // Listen to authentication states to react dynamically to logins/logouts
    const user = useAuthStore((state) => state.user);
    const storeToken = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const updateSingleFlag = useFeatureFlagsStore((state) => state.updateSingleFlag);

    const [socket, setSocket] = useState(null);
    const [channel, setChannel] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotification, setLatestNotification] = useState(null);
    const [liveOnlineCount, setLiveOnlineCount] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState({});

    // 📢 NEW: Global voice alert state layer variables
    const [latestVoiceAlert, setLatestVoiceAlert] = useState(null);

    // 🛡️ NEW: Global App Administration Audit Ledger Stream state
    const [latestGlobalLog, setLatestGlobalLog] = useState(null);
    //const [juryAlert, setJuryAlert] = useState(null);

    useEffect(() => {
        let phoenixSocket = null;
        let notificationChannel = null;
        let publicChannel = null;
        let voiceChannel = null; // 🚀 Global streaming audio room pointer
        let adminChannel = null; // 🚀 Secure app-wide administrative channel room pointer

        if (!isAuthenticated || !user?.id) {
            setSocket(null);
            setChannel(null);
            setUnreadCount(0);
            setLiveOnlineCount(0);
            setOnlineUsers({});
            setLatestVoiceAlert(null);
            setLatestGlobalLog(null);
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

            // ⚡ REAL-TIME DISTRIBUTED PRESENCE TRACKER:
            publicChannel = phoenixSocket.channel("user:public", {});
            const presenceTracker = new Presence(publicChannel);

            // Triggers automatically whenever any active user joins or leaves the site across the network cluster
            presenceTracker.onSync(() => {
                const list = presenceTracker.list();
                const activeCount = Object.keys(list).length;
                console.log(`⚡ Real-time User Count Synchronization Complete: ${activeCount} active user nodes.`);
                setLiveOnlineCount(activeCount);
                setOnlineUsers(list);
            });

            publicChannel.join()
                .receive('ok', () => console.log('Connected public presence channel: user:public'))
                .receive('error', resp => console.error('Public presence channel connection rejected:', resp));

            // 3️⃣ 📣 GLOBAL VOICE ALERT INTERCEPTOR CHANNEL
            // Subscribes to the exact public "voice_alert" topic mapped on your Elixir FeedChannel
            voiceChannel = phoenixSocket.channel("voice_alert", {});

            // Catch the exact real-time audio toast event string pushed by the VoiceBroadcastWorker
            voiceChannel.on('incoming_voice_toast', (payload) => {
                console.log("🔥 URGENT DISTRICT VOICE BROADCAST RECEIVED:", payload);
                setLatestVoiceAlert(payload);
            });

            voiceChannel.join()
                .receive('ok', () => console.log('Connected global audio interceptor channel: voice_alert'))
                .receive('error', resp => console.error('Global audio channel connection rejected:', resp));

            // 4️⃣ 🛡️ HIGH-SECURITY APPAREL ADMINISTRATIVE AUDIT LEDGER CHANNEL
            // Only registers connection handshakes if user badge type confirms staff/admin clearance parameters
            const isStaff = ["admin", "root", "moderator", "staff"].includes(user.badge_type?.toLowerCase());

            if (isStaff) {
                adminChannel = phoenixSocket.channel("admin_notifications:global", {});

                // Intercept the exact event string broadcasted from Elixir audit log transactions
                adminChannel.on('new_global_log', (payload) => {
                    console.log("🔒 [GOVERNANCE AUDIT LEDGER STREAM]:", payload);
                    setLatestGlobalLog(payload);
                });

                adminChannel.join()
                    .receive('ok', () => console.log('Connected high-security platform audit channel: admin_notifications:global'))
                    .receive('error', resp => console.warn('Administrative channel connection rejected (Privilege check failed):', resp));
            }

            if (adminChannel) {
                // ✅ CATCH REAL-TIME NETWORK EVENT: 
                // Triggers instantly whenever an admin changes a toggle button on the configuration dashboard!
                adminChannel.on('feature_flag_toggled', (payload) => {
                    if (payload && payload.key) {
                        // Instantly syncs the local state dictionary matrix
                        updateSingleFlag(payload.key, payload.enabled);
                    }
                });
            }

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
            if (adminChannel) {
                try { adminChannel.leave(); } catch (err) { console.error(err); }
            }
            if (publicChannel) {
                try { publicChannel.leave(); } catch (err) { console.error(err); }
            }
            if (notificationChannel) {
                try { notificationChannel.leave(); } catch (err) { console.error(err); }
            }
            if (voiceChannel) {
                try { voiceChannel.leave(); } catch (err) { console.error(err); }
            }
            if (phoenixSocket) {
                try { phoenixSocket.disconnect(); } catch (err) { console.error(err); }
            }
        };
    }, [user?.id, storeToken, isAuthenticated, updateSingleFlag]); // Re-fire safely when user keys shift

    return (
        <PhoenixSocketContext.Provider value={{
            socket,
            channel,
            unreadCount,
            setUnreadCount,
            latestNotification,
            setLatestNotification,
            liveOnlineCount,
            onlineUsers,
            latestVoiceAlert,
            setLatestVoiceAlert,
            latestGlobalLog,
            setLatestGlobalLog
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
    setUnreadCount: () => { },
    latestNotification: null,
    setLatestNotification: () => { },
    liveOnlineCount: 0,
    onlineUsers: {},
    latestVoiceAlert: null,
    setLatestVoiceAlert: () => { },
    latestGlobalLog: null,
    setLatestGlobalLog: () => { }
};

export const useSocket = () => useContext(PhoenixSocketContext) || defaultSocketContext;


