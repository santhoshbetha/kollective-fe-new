// src/features/moderation/components/InfrastructureCenter.jsx
import React, { useState } from 'react';
import { NodeTopologyPanel } from './NodeTopologyPanel';
import { ObanTelemetryDashboard } from './ObanTelemetryDashboard';
import { SovereignAuditLogPanel } from './SovereignAuditLogPanel';
import { ModeratorPresencePanel } from './ModeratorPresencePanel';
import { Layers, ActivitySquare, Terminal } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function InfrastructureCenter() {
    const [activeTab, setActiveTab] = useState("topology"); // "topology" | "workers"

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 pb-12 p-4 text-left font-sans antialiased text-neutral-200">

            {/* Main Unified Core Layout Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1 select-none border-b border-white/5">
                <div>
                    <div className="flex items-center gap-2 text-primary-container mb-1">
                        <Terminal className="w-4 h-4 text-primary-container stroke-[2.5px]" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/20">
                            Sovereign Infrastructure Center
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Mesh Console Operations</h1>
                </div>

                {/* 🎛️ Tab Control Ribbon Strip Selector */}
                <div className="flex bg-[#111111]/60 border border-white/5 p-1 rounded-xl font-mono text-[10px] font-black uppercase tracking-wider select-none shrink-0 w-fit">
                    <button
                        type="button"
                        onClick={() => setActiveTab("topology")}
                        className={cn(
                            "px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border-none outline-none",
                            activeTab === "topology"
                                ? "bg-primary-container text-white shadow-md font-bold"
                                : "text-neutral-400 hover:text-white bg-transparent"
                        )}
                    >
                        <ActivitySquare className="w-3.5 h-3.5 stroke-[2px]" />
                        <span>Node Topology</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("workers")}
                        className={cn(
                            "px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border-none outline-none",
                            activeTab === "workers"
                                ? "bg-primary-container text-white shadow-md font-bold"
                                : "text-neutral-400 hover:text-white bg-transparent"
                        )}
                    >
                        <Layers className="w-3.5 h-3.5 stroke-[2px]" />
                        <span>Queue Telemetry</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("audit")}
                        className={cn(
                            "px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border-none outline-none",
                            activeTab === "audit"
                                ? "bg-primary-container text-white shadow-md font-bold"
                                : "text-neutral-400 hover:text-white bg-transparent"
                        )}
                    >
                        <SovereignAuditLogPanel className="w-3.5 h-3.5 stroke-[2px]" />
                        <span>Sovereign Ledger</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("presence")}
                        className={cn(
                            "px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border-none outline-none",
                            activeTab === "presence"
                                ? "bg-primary-container text-white shadow-md font-bold"
                                : "text-neutral-400 hover:text-white bg-transparent"
                        )}
                    >
                        <ModeratorPresencePanel className="w-3.5 h-3.5 stroke-[2px]" />
                        <span>Moderator Presence</span>
                    </button>
                </div>
            </header>

            {/* 🛡️ Dynamic Viewport Dashboard Mounting Pipeline Frame */}
            <div className="animate-in fade-in zoom-in-95 duration-200">
                {activeTab === "topology" ? (
                    /* Embedded Node Topology Panel View */
                    <NodeTopologyPanel />
                ) : activeTab === "workers" ? (
                    /* Embedded Oban Background Queue Telemetry Dashboard View */
                    <ObanTelemetryDashboard />
                ) : activeTab === "audit" ? (
                    /* Embedded Sovereign Audit Log Panel View */
                    <SovereignAuditLogPanel />
                ) : activeTab === "presence" ? (
                    /* Embedded Moderator Presence Panel View */
                    <ModeratorPresencePanel />
                ) : (
                    /* Default Fallback Panel */
                    <NodeTopologyPanel />
                )}
            </div>
        </div>
    );
}

export default InfrastructureCenter;
