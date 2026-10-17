// src/features/moderation/components/ModerationQueueDashboard.jsx
import React, { useEffect } from 'react';
import { useModerationQueue } from '../hooks/useModerationQueue';
import { IncidentDetailCard } from './IncidentDetailCard';
import { Shield, Sparkles, Loader2, MapPin, AlertCircle, Terminal } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function ModerationQueueDashboard() {
    const {
        leasedIncidents,
        activeIncident,
        setActiveIncident,
        isLoading,
        actionPending,
        queueError,
        fetchAndLeaseNextTicket,
        resolveLeasedIncident
    } = useModerationQueue();

    // Auto-fetch initial item to populate work viewport on load loop parameters
    useEffect(() => {
        if (leasedIncidents.length === 0) {
            fetchAndLeaseNextTicket();
        }
    }, [fetchAndLeaseNextTicket, leasedIncidents.length]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-4 pb-12 p-4 text-left font-sans antialiased text-neutral-200">
            {/* Structural Title Ribbon */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 select-none border-b border-white/5">
                <div>
                    <div className="flex items-center gap-2 text-primary-container mb-1">
                        <Shield className="w-4 h-4 text-primary-container stroke-[2.5px]" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/20">
                            Sovereign Node Governance Mesh
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Incident Adjudication Desk</h1>
                </div>

                <button
                    type="button"
                    disabled={isLoading || actionPending}
                    onClick={fetchAndLeaseNextTicket}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl hover:brightness-105 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer outline-none"
                >
                    {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 anonymity-spin animate-spin" />
                    ) : (
                        <Terminal className="w-3.5 h-3.5 stroke-[2.5px]" />
                    )}
                    <span>Lease Next Incident</span>
                </button>
            </header>

            {/* Locked 650px Split-Pane Framework Dashboard Core Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/5 rounded-3xl overflow-hidden shadow-2xl h-[620px] max-h-[620px] bg-[#141414] min-h-0">

                {/* 👈 LEFT COLUMN DIRECTORY: Active Leased Incidents Rack */}
                <div className="lg:col-span-4 flex flex-col border-r border-white/5 bg-[#111111]/50 h-full max-h-full min-h-0 overflow-hidden">
                    <div className="p-4 border-b border-white/5 font-mono text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-[#141414] select-none">
                        Active Leases Held ({leasedIncidents.length})
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar p-2 space-y-1">
                        {leasedIncidents.length > 0 ? (
                            leasedIncidents.map((ticket) => {
                                const isSelected = activeIncident && ticket.id === activeIncident.id;
                                return (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setActiveIncident(ticket)}
                                        className={cn(
                                            "p-4 rounded-2xl cursor-pointer transition-all border text-left flex flex-col gap-1.5 select-none",
                                            isSelected
                                                ? "bg-primary-container/10 border-primary-container/40 ring-1 ring-primary-container/5"
                                                : "bg-transparent border-transparent hover:bg-white/"
                                        )}
                                    >
                                        <div className="flex justify-between items-baseline font-mono text-[10px] text-neutral-400 font-bold">
                                            <span className="text-white font-sans font-black">@{ticket.target_username || "unknown"}</span>
                                            <span>#{ticket.id}</span>
                                        </div>
                                        <p className="text-xs text-neutral-400 font-medium truncate pr-4 leading-normal">
                                            {ticket.description || "Flagged content violation metrics."}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-primary-container font-black uppercase tracking-wider select-none bg-primary-container/5 px-2 py-0.5 w-fit rounded border border-primary-container/10">
                                            <MapPin className="w-2.5 h-2.5 stroke-[2.5px]" />
                                            <span>Zone: {ticket.country_code || "Global"}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-24 text-center font-mono text-xs text-neutral-500 opacity-60 select-none flex flex-col items-center justify-center gap-1.5 h-full">
                                <Terminal className="w-5 h-5 text-neutral-600 stroke-[1.5px]" />
                                <span>No leased tickets active.</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* 👉 RIGHT MAIN ADJUDICATION VIEWPORT PANEL */}
                <div className="lg:col-span-8 flex flex-col h-full max-h-full min-h-0 overflow-hidden bg-[#141414]">
                    {activeIncident ? (
                        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden animate-in fade-in duration-150">
                            {/* Detailed Card Ingress Component Controller Module */}
                            <IncidentDetailCard
                                incident={activeIncident}
                                actionPending={actionPending}
                                onResolve={(actionType) => resolveLeasedIncident(activeIncident.id, actionType)}
                            />
                        </div>
                    ) : (
                        /* Unselected Empty State Frame Viewport */
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 select-none font-mono text-xs gap-3">
                            {queueError === "empty_queue_all_clear" ? (
                                <>
                                    <Sparkles className="w-9 h-9 text-emerald-500 stroke-[1.5px] animate-pulse" />
                                    <div className="space-y-1 font-sans">
                                        <h3 className="font-black text-sm text-white">Zone Clear</h3>
                                        <p className="text-neutral-500 font-medium max-w-xs leading-normal">
                                            All structural compliance audits have been resolved. The multi-node mesh is clean.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-9 h-9 text-primary-container stroke-[1.5px]" />
                                    <div className="space-y-1 font-sans">
                                        <h3 className="font-black text-sm text-white">Awaiting Assignment</h3>
                                        <p className="text-neutral-500 font-medium max-w-xs leading-normal">
                                            Select a leased incident from the sidebar directory, or click **Lease Next Incident** to request a new item from the cluster.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
