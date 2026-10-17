import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'phoenix';

const IncidentClusterContext = createContext(null);

export const IncidentClusterProvider = ({ children, userToken }) => {
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        // 1️⃣ INITIALIZE THE ELIXIR BEAM SOCKET CONNECTION
        const socketUrl = process.env.REACT_APP_WS_URL || "ws://localhost:4000/socket";
        const socket = new Socket(socketUrl, { params: { token: userToken } });
        socket.connect();

        // 2️⃣ JOIN THE CORRECT ADMIN NOTIFICATION TOPOLOGY CHANNEL
        const channel = socket.channel("admin_notifications:global", {});

        channel.join()
            .receive("ok", resp => console.log("Joined admin notifications channel successfully!", resp))
            .receive("error", resp => console.warn("Unable to join admin cluster channel", resp));

        // 3️⃣ CATCH LIVE INCOMING MNESIA MESH UPDATE EVENTS

        // Event A: Someone successfully claimed a ticket (or the reaper auto-extended/released it)
        channel.on("incident_leased", (payload) => {
            setIncidents(prevIncidents =>
                prevIncidents.map(incident =>
                    incident.id === payload.incident_id
                        ? { ...incident, leased_by_id: payload.leased_by_id, leased_until: payload.leased_until }
                        : incident
                )
            );
        });

        // Event B: An operator voluntarily dropped a ticket or the Reaper engine reclaimed it
        channel.on("incident_lease_dropped", (payload) => {
            setIncidents(prevIncidents =>
                prevIncidents.map(incident =>
                    incident.id === payload.incident_id
                        ? { ...incident, leased_by_id: null, leased_until: null }
                        : incident
                )
            );
        });

        // Event C: An incident was permanently completed/deleted/banned
        channel.on("incident_resolved", (payload) => {
            // Remove it from the live UI work queue array completely
            setIncidents(prevIncidents =>
                prevIncidents.filter(incident => incident.id !== payload.incident_id)
            );
        });

        // Clean up connections on unmount
        return () => {
            channel.leave();
            socket.disconnect();
        };
    }, [userToken]);

    return (
        <IncidentClusterContext.Provider value={{ incidents, setIncidents }}>
            {children}
        </IncidentClusterContext.Provider>
    );
};

export const useIncidentCluster = () => useContext(IncidentClusterContext);
