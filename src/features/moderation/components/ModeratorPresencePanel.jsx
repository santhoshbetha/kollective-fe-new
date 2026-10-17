// src/features/moderation/components/ModeratorPresencePanel.jsx
import React, { useState, useEffect } from 'react';
import { usePhoenixSocket } from '../../../context/PhoenixSocketContext'; // Adjust hook import target path
import { Users, Shield, Globe, Terminal, Loader2, Wifi } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function ModeratorPresencePanel() {
    const { socket } = usePhoenixSocket();
    const [onlineMods, setOnlineMods] = useState([]);
    const [isConnecting, setIsConnecting] = useState(true);

    useEffect(() => {
        if (!socket) return;

        // Open connection pipeline parameters targeting your global administration topic
        const adminChannel = socket.channel("admin_notifications:global", {});
        let localPresenceState = {};

        // Native phoenix tracking array restructuring helper
        const syncPresenceView = (state) => {
            const list = Object.keys(state).map(key => {
                const meta = state[key].metas?.[0] || {};
                return {
                    id: key,
                    ...meta
                };
            });
            setOnlineMods(list);
        };

        adminChannel.join()
            .receive("ok", () => setIsConnecting(false))
            .receive("error", () => setIsConnecting(false));

        // 📡 CRDT STATE INITIAL DE-SERIALIZER
        adminChannel.on("presence_state", (state) => {
            localPresenceState = { ...localPresenceState, ...state };
            syncPresenceView(localPresenceState);
        });

        // ⚡ REAL-TIME NETWORKING DELTA UPDATER
        adminChannel.on("presence_diff", (diff) => {
            // Remove disconnected node sessions
            Object.keys(diff.leaves).forEach(key => {
                delete localPresenceState[key];
            });
            // Inject newly connected operator sessions
            Object.keys(diff.joins).forEach(key => {
                localPresenceState[key] = diff.joins[key];
            });
            syncPresenceView(localPresenceState);
        });

        return () => {
            adminChannel.leave();
        };
    }, [socket]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 p-6 bg-[#141414] border border-white/5 rounded-[28px] shadow-2xl font-sans text-left text-neutral-200 select-none animate-in fade-in duration-200">

            {/* Header Content Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary-container/10 border border-primary-container/20 rounded-xl text-primary-container shrink-0">
                        <Users className="w-4 h-4 stroke-[2.5px]" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight">Active Governance Presence</h3>
                        <p className="text-[11px] font-medium text-neutral-400 mt-0.5 leading-none">
                            Real-time tracking of staff and moderators online across distributed multi-node server blocks.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-xl tracking-wider shadow-sm select-none shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span>{onlineMods.length} Operators Live</span>
                </div>
            </div>

            {/* Dynamic Real-Time Presence Racks Viewport */}
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#111111]/40 flex flex-col h-[280px]">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                    {isConnecting ? (
                        <div className="py-16 text-center font-mono text-xs text-neutral-500 flex flex-col items-center justify-center gap-2 opacity-60 h-full">
                            <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                            <span>SYNCHRONIZING REPLICATED PRESENCE ENGINE DATA...</span>
                        </div>
                    ) : onlineMods.length > 0 ? (
                        onlineMods.map((mod) => (
                            <div key={mod.id} className="p-3 bg-[#181818] border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left font-mono text-[11px] animate-in fade-in duration-100">

                                <div className="min-w-0 flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-white/5 text-primary-container border border-white/5 shrink-0 flex items-center justify-center">
                                        <Shield className="w-4 h-4 stroke-[2px]" />
                                    </div>
                                    <div className="min-w-0 font-sans">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-black text-white">@{mod.username || "operator"}</span>
                                            <span className="text-[8px] font-mono font-black uppercase bg-primary-container/10 border border-primary-container/20 px-1.5 py-0.2 rounded text-primary-container tracking-wider shadow-sm">
                                                {mod.badge_type || "staff"}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-mono text-neutral-500 font-bold mt-1 uppercase tracking-wider flex items-center gap-1 select-none">
                                            <Globe className="w-3 h-3 text-neutral-600" />
                                            <span>Zone Clearance: <span className="text-neutral-400 font-black">{mod.country_code}</span></span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-end justify-between font-mono text-[9px] font-bold text-neutral-500 shrink-0 border-t border-white/5 sm:border-none pt-1.5 sm:pt-0">
                                    <span className="bg-black/20 px-1.5 py-0.5 rounded border border-white/5 tracking-wide text-neutral-400 select-none flex items-center gap-1">
                                        <Terminal className="w-3 h-3 text-neutral-500" />
                                        <span>NODE: {mod.node_host?.split('@').shift() || "node_primary"}</span>
                                    </span>
                                    <span className="font-sans font-medium text-neutral-600 mt-1 select-none flex items-center gap-1">
                                        <Wifi className="w-3 h-3 text-emerald-500 stroke-[2.5px]" />
                                        <span>ACTIVE_CHANNEL</span>
                                    </span>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center font-mono text-xs text-neutral-600 select-none opacity-40 flex items-center justify-center h-full">
                            // NO_GOVERNANCE_OPERATORS_ONLINE_IN_MESH...
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
