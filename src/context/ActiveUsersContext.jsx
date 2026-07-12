import React, { useEffect, useState } from "react";
import { Presence } from "phoenix"; // 🟢 Import Phoenix's built-in presence manager
import { useSocket } from "./PhoenixSocketContext";

export const ActiveUsersProvider = ({ children }) => {
    const socket = useSocket();
    const [onlineUsers, setOnlineUsers] = useState({}); // Stores { "42": { metas: [...] } }

    useEffect(() => {
        if (!socket || socket.state !== "open") return;

        const channel = socket.channel("user:public");

        // 1. Initialize Phoenix Presence tracking on the client
        let presence = new Presence(channel);

        // 2. Handle sync changes (runs automatically on join, leave, or connection drops)
        presence.onSync(() => {
            // presence.list() formats the raw state into a clean object or array
            setOnlineUsers({ ...presence.state });
        });

        channel.join();

        return () => channel.leave();
    }, [socket]);

    // Helper function to check if a user is online
    const isUserOnline = (userId) => !!onlineUsers[String(userId)];

    return (
        <ActiveUsersContext.Provider value={{ isUserOnline }}>
            {children}
        </ActiveUsersContext.Provider>
    );
};
