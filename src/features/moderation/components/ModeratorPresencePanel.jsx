import { useState, useEffect } from 'react';
import { usePhoenixSocket } from '../../../context/PhoenixSocketContext'; // Adjust hook import target path
import { Users, Shield, Globe, Terminal, Loader2, Wifi } from 'lucide-react';

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
        <div className="w-full max-w-7xl mx-auto space-y-8 p-6 sm:p-8 bg-[#141414] border border-white/5 rounded-[32px] shadow-2xl font-sans text-left text-neutral-200 select-none animate-in fade-in duration-200">

            {/* Header Content Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3.5 bg-primary-container/10 border border-primary-container/20 rounded-2xl text-primary-container shrink-0 shadow-sm">
                        <Users className="w-6 h-6 stroke-[2.5px]" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            Active Governance Presence
                        </h3>
                        <p className="text-sm sm:text-base font-medium text-neutral-400 mt-1 leading-relaxed">
                            Real-time tracking of staff and moderators online across distributed multi-node server blocks.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-black uppercase text-emerald-400 bg-emerald-500/5 px-4 py-2 border border-emerald-500/10 rounded-2xl tracking-wider shadow-sm select-none shrink-0 self-start sm:self-auto">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    <span>{onlineMods.length} Operators Live</span>
                </div>
            </div>

            {/* Dynamic Real-Time Presence Racks Viewport */}
            <div className="border border-white/5 rounded-3xl overflow-hidden bg-[#111111]/40 flex flex-col h-[440px]">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3">
                    {isConnecting ? (
                        <div className="py-24 text-center font-mono text-sm text-neutral-500 flex flex-col items-center justify-center gap-3 opacity-60 h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                            <span>SYNCHRONIZING REPLICATED PRESENCE ENGINE DATA...</span>
                        </div>
                    ) : onlineMods.length > 0 ? (
                        onlineMods.map((mod) => (
                            <div key={mod.id} className="p-5 sm:p-6 bg-[#181818] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left font-mono text-xs sm:text-sm animate-in fade-in duration-100 shadow-sm">

                                <div className="min-w-0 flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-white/5 text-primary-container border border-white/5 shrink-0 flex items-center justify-center">
                                        <Shield className="w-6 h-6 stroke-[2px]" />
                                    </div>
                                    <div className="min-w-0 font-sans">
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-mono text-base sm:text-lg font-black text-white">@{mod.username || "operator"}</span>
                                            <span className="text-xs font-mono font-black uppercase bg-primary-container/10 border border-primary-container/20 px-2.5 py-1 rounded-lg text-primary-container tracking-wider shadow-sm">
                                                {mod.badge_type || "staff"}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm font-mono text-neutral-400 font-bold mt-1.5 uppercase tracking-wider flex items-center gap-1.5 select-none">
                                            <Globe className="w-4 h-4 text-neutral-500" />
                                            <span>Zone Clearance: <span className="text-neutral-200 font-black">{mod.country_code}</span></span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-end justify-between font-mono text-xs font-bold text-neutral-400 shrink-0 border-t border-white/5 sm:border-none pt-2 sm:pt-0 gap-1.5">
                                    <span className="bg-black/30 px-3 py-1 rounded-xl border border-white/5 tracking-wide text-neutral-300 select-none flex items-center gap-1.5">
                                        <Terminal className="w-4 h-4 text-neutral-400" />
                                        <span>NODE: {mod.node_host?.split('@').shift() || "node_primary"}</span>
                                    </span>
                                    <span className="font-sans font-medium text-neutral-400 select-none flex items-center gap-1.5">
                                        <Wifi className="w-4 h-4 text-emerald-500 stroke-[2.5px]" />
                                        <span>ACTIVE_CHANNEL</span>
                                    </span>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center font-mono text-sm text-neutral-500 select-none opacity-40 flex items-center justify-center h-full">
                            // NO_GOVERNANCE_OPERATORS_ONLINE_IN_MESH...
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
