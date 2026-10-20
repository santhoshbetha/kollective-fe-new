// src/features/moderation/components/InfrastructureCenter.jsx
import { useState } from 'react';
import { NodeTopologyPanel } from './NodeTopologyPanel';
import { ObanTelemetryDashboard } from './ObanTelemetryDashboard';
import { SovereignAuditLogPanel } from './SovereignAuditLogPanel';
import { ModeratorPresencePanel } from './ModeratorPresencePanel';
import { Layers, ActivitySquare, Terminal, ScrollText, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function InfrastructureCenter() {
    const [activeTab, setActiveTab] = useState("topology"); // "topology" | "workers" | "audit" | "presence"

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 p-4 sm:p-6 text-left font-sans antialiased text-neutral-800 dark:text-neutral-200">

            {/* Main Unified Core Layout Header */}
            <header className="flex flex-col justify-between gap-6 py-2 select-none border-b border-neutral-200 dark:border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-primary-container mb-2">
                        <Terminal className="w-5 h-5 text-primary-container stroke-[2.5px]" />
                        <span className="text-xs font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2.5 py-1 rounded-lg border border-primary-container/20">
                            Sovereign Infrastructure Center
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                        Mesh Console Operations
                    </h1>
                    <p className="text-base sm:text-lg font-medium text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        Real-time cluster topology, worker telemetry, sovereign audit ledger, and active operator presence.
                    </p>
                </div>

                {/* 🎛️ Tab Control Ribbon Strip Selector */}
                <div className="flex flex-wrap bg-neutral-100 dark:bg-[#111111]/80 border border-neutral-200 dark:border-white/10 p-1.5 rounded-2xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider select-none shrink-0 w-fit gap-1.5 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setActiveTab("topology")}
                        className={cn(
                            "px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer border-none outline-none",
                            activeTab === "topology"
                                ? "bg-primary-container text-white shadow-md font-bold"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent"
                        )}
                    >
                        <ActivitySquare className="w-4 h-4 stroke-[2px]" />
                        <span>Node Topology</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("workers")}
                        className={cn(
                            "px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer border-none outline-none",
                            activeTab === "workers"
                                ? "bg-primary-container text-white shadow-md font-bold"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent"
                        )}
                    >
                        <Layers className="w-4 h-4 stroke-[2px]" />
                        <span>Queue Telemetry</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("audit")}
                        className={cn(
                            "px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer border-none outline-none",
                            activeTab === "audit"
                                ? "bg-primary-container text-white shadow-md font-bold"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent"
                        )}
                    >
                        <ScrollText className="w-4 h-4 stroke-[2px]" />
                        <span>Sovereign Ledger</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("presence")}
                        className={cn(
                            "px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer border-none outline-none",
                            activeTab === "presence"
                                ? "bg-primary-container text-white shadow-md font-bold"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent"
                        )}
                    >
                        <Users className="w-4 h-4 stroke-[2px]" />
                        <span>Moderator Presence</span>
                    </button>
                </div>
            </header>

            {/* 🛡️ Dynamic Viewport Dashboard Mounting Pipeline Frame */}
            <div className="animate-in fade-in zoom-in-95 duration-200">
                {activeTab === "topology" && <NodeTopologyPanel />}
                {activeTab === "workers" && <ObanTelemetryDashboard />}
                {activeTab === "audit" && <SovereignAuditLogPanel />}
                {activeTab === "presence" && <ModeratorPresencePanel />}
            </div>
        </div>
    );
}

export default InfrastructureCenter;
