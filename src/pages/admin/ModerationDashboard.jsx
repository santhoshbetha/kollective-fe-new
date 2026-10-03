// src/pages/ModerationDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminIncidentPanel from './AdminIncidentPanel';
import { Gavel, AlertTriangle, CheckCircle2, Activity, FileText, Trash2, UserX, ShieldX, FolderKanban, Loader2, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

// 📡 CORE NETWORKING SERVICES MAPPING
const fetchReportsData = async (filterStatus) => {
    const token = localStorage.getItem("user_token") || "";
    const path = filterStatus === "scholars"
        ? '/api/v1/admin/incidents'
        : `/api/v1/admin/reports?status=${filterStatus}`;

    const res = await fetch(path, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load operations queue items.");
    const json = await res.json();
    return json.data || [];
};

const resolveReportTicket = async ({ ticketId, actionType }) => {
    const token = localStorage.getItem("user_token") || "";
    const res = await fetch(`/api/v1/admin/reports/${ticketId}/resolve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: actionType, notes: "Processed via Operations Desk UI Dashboard." })
    });
    if (!res.ok) throw new Error("Failed to commit operations mitigation protocol.");
    return await res.json();
};

export const ModerationDashboard = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState("open"); // "open", "resolved", "scholars", "firewall"

    // Core structural detail selection state references
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [selectedScholarIncidentId, setSelectedScholarIncidentId] = useState(null);

    // 📡 DYNAMIC COMPOSABLE TIMELINE QUERY LANES
    const { data: queueItems = [], isLoading: isQueueLoading } = useQuery({
        queryKey: ['admin', 'operations', 'queue', filter],
        queryFn: () => fetchReportsData(filter),
        enabled: filter !== "firewall",
        staleTime: 15000
    });

    // Automatically sync initial index elements upon completion of background network queries
    useEffect(() => {
        if (queueItems.length > 0) {
            if (filter === "scholars") {
                setSelectedScholarIncidentId(queueItems[0]?.incident_id || null);
            } else {
                setSelectedTicketId(queueItems[0]?.id || null);
            }
        } else {
            setSelectedTicketId(null);
            setSelectedScholarIncidentId(null);
        }
    }, [queueItems, filter]);

    // 🚀 ATOMIC OPERATIONS MITIGATION MUTATION
    const mitigationMutation = useMutation({
        mutationFn: resolveReportTicket,
        onSuccess: (_, variables) => {
            // Evict processed item locally instantly by invalidating the specific queue category
            queryClient.setQueryData(['admin', 'operations', 'queue', filter], (oldData) => {
                if (!Array.isArray(oldData)) return [];
                return oldData.filter(item => item.id !== variables.ticketId);
            });
            queryClient.invalidateQueries({ queryKey: ['admin', 'operations', 'queue', filter] });
        }
    });

    const handleAction = (actionType) => {
        if (!selectedTicketId) return;
        mitigationMutation.mutate({ ticketId: selectedTicketId, actionType });
    };

    const handleScholarActionComplete = (incidentId) => {
        queryClient.setQueryData(['admin', 'operations', 'queue', 'scholars'], (oldData) => {
            if (!Array.isArray(oldData)) return [];
            return oldData.filter(item => item.incident_id !== incidentId);
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'operations', 'queue', 'scholars'] });
    };

    // Derived calculated object bindings
    const activeTicket = useMemo(() => {
        if (filter === "scholars" || filter === "firewall") return null;
        return queueItems.find(t => t.id === selectedTicketId) || null;
    }, [queueItems, selectedTicketId, filter]);

    const activeScholarIncident = useMemo(() => {
        if (filter !== "scholars") return null;
        return queueItems.find(si => si.incident_id === selectedScholarIncidentId) || null;
    }, [queueItems, selectedScholarIncidentId, filter]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 font-sans text-left bg-transparent text-neutral-800 dark:text-neutral-100 transition-colors">
            {/* Component Header Block */}
            <header className="mb-8 select-none">
                <div className="flex items-center gap-2 text-primary-container mb-2">
                    <Gavel className="w-5 h-5 stroke-[2.5px]" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 border border-primary-container/20 rounded">
                        Operations Clearance
                    </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white mb-1">Operations Desk</h1>
                <p className="text-lg font-medium text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
                    Monitor compliance alerts, investigate system reports, and execute structural mitigation policies.
                </p>
            </header>

            {/* Sub-navigation layout tab selection array */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-neutral-200 dark:border-zinc-800 mb-8 font-mono select-none">
                {[
                    { label: "🚨 Active Incidents", value: "open" },
                    { label: "✅ Audit Trail History", value: "resolved" },
                    { label: "🔬 Scholar Audits", value: "scholars" },
                    { label: "🔥 In-Memory Firewall", value: "firewall" }
                ].map((tab) => {
                    const isActive = filter === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setFilter(tab.value)}
                            className={cn(
                                "px-5 py-2.5 transition-all duration-150 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-wider border cursor-pointer outline-none active:scale-95",
                                isActive
                                    ? 'bg-primary-container text-white border-primary-container shadow-md'
                                    : 'bg-neutral-50 dark:bg-zinc-900 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-zinc-800 hover:border-neutral-300 dark:hover:border-zinc-700 hover:text-neutral-900 dark:hover:text-white'
                            )}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            {/* 🚨 COMPLIANCE INCIDENTS QUEUE LAYOUT */}
            {filter !== "firewall" && filter !== "scholars" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Tickets List */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-zinc-800 pb-2 mb-4 select-none">
                            <h3 className="font-mono text-md font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                                <FolderKanban className="w-4 h-4 text-primary-container" />
                                <span>Ticket Queue ({queueItems.length} Pending)</span>
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {isQueueLoading ? (
                                <div className="py-24 text-center text-neutral-400 select-none font-mono text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-3 opacity-60">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                                    <span>Syncing active database records...</span>
                                </div>
                            ) : queueItems.length > 0 ? (
                                queueItems.map(ticket => {
                                    const isSelected = selectedTicketId === ticket.id;
                                    return (
                                        <div
                                            key={`ticket-card-${ticket.id}`}
                                            onClick={() => setSelectedTicketId(ticket.id)}
                                            className={cn(
                                                "p-6 border rounded-2xl cursor-pointer transition-all text-left",
                                                isSelected
                                                    ? "border-primary-container/80 bg-primary-container/[0.02] shadow-md ring-1 ring-primary-container/20"
                                                    : "border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/40 hover:border-neutral-300 dark:hover:border-zinc-700"
                                            )}
                                        >
                                            <div className="flex justify-between items-center mb-3 select-none">
                                                <span className="text-[16px] font-black font-mono text-primary-container tracking-widest uppercase bg-primary-container/5 px-2 py-0.5 border border-primary-container/10 rounded">
                                                    ⚠️ {ticket.category || "REPORT"}
                                                </span>
                                                <span className="text-md text-neutral-400 font-mono font-bold">ID: {ticket.id}</span>
                                            </div>

                                            <p className="text-base font-semibold text-neutral-800 dark:text-neutral-100 leading-relaxed line-clamp-2 mb-4">
                                                "{ticket.preview_text}"
                                            </p>

                                            <div className="flex justify-between items-center text-lg border-t border-neutral-200 dark:border-zinc-800 pt-3 text-neutral-500 font-mono font-bold select-none">
                                                <div>
                                                    Reporter: <span className="text-neutral-800 dark:text-neutral-200">@{ticket.reporter}</span>
                                                </div>
                                                <div>
                                                    Target: <span className="text-primary-container">@{ticket.target_account}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-neutral-50 dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800 p-12 rounded-2xl text-center select-none font-mono">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3 stroke-[1.5px]" />
                                    <h4 className="font-sans font-black text-neutral-800 dark:text-white mb-1">Queue Clear</h4>
                                    <p className="text-xs text-neutral-400 font-sans font-medium">No tickets matched this filter status. Operations optimal.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right Column: Administrative Mitigation Actions Panel */}
                    <div className="lg:col-span-4">
                        <section className="bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col justify-between min-h-[420px] shadow-sm text-left">
                            {activeTicket ? (
                                <div className="space-y-6 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="border-b border-neutral-200 dark:border-zinc-800 pb-2 flex justify-between items-center select-none">
                                            <h3 className="font-mono text-md font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <FileText className="w-4 h-4 text-primary-container" />
                                                <span>Incident Details</span>
                                            </h3>
                                            <span className="text-[10px] font-mono font-bold bg-primary-container/5 text-primary-container px-2 py-0.5 border border-primary-container/10 rounded">
                                                {activeTicket.id}
                                            </span>
                                        </div>

                                        <div className="p-4 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-xl text-md leading-relaxed text-neutral-800 dark:text-neutral-200 font-medium">
                                            "{activeTicket.preview_text}"
                                        </div>

                                        <div className="text-md font-mono font-bold text-neutral-500 space-y-1 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-neutral-200 dark:border-zinc-800 select-none">
                                            <div>Reporter: <span className="text-neutral-800 dark:text-neutral-200 font-mono">@{activeTicket.reporter}</span></div>
                                            <div>Target Account: <span className="text-primary-container font-mono">@{activeTicket.target_account}</span></div>
                                            <div>Category: <span className="text-neutral-800 dark:text-neutral-200 font-sans font-semibold">{activeTicket.category}</span></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 pt-4 border-t border-neutral-200 dark:border-zinc-800 font-mono text-xs uppercase font-bold tracking-wider select-none">
                                        <h4 className="text-[14px] font-black text-neutral-400 tracking-widest uppercase mb-2">
                                            Mitigation Protocol
                                        </h4>
                                        <button
                                            type="button"
                                            disabled={mitigationMutation.isPending}
                                            onClick={() => handleAction("soft_delete")}
                                            className="w-full py-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-700 dark:text-neutral-200 font-black tracking-wide rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2 outline-none disabled:opacity-40"
                                        >
                                            <Trash2 className="w-4 h-4 text-neutral-400 shrink-0" />
                                            <span>Hide Content</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={mitigationMutation.isPending}
                                            onClick={() => handleAction("shadow_ban")}
                                            className="w-full py-3 bg-white dark:bg-zinc-900 border border-amber-500/20 hover:border-amber-500/40 text-amber-600 dark:text-amber-400 font-black tracking-wide rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2 outline-none disabled:opacity-40"
                                        >
                                            <UserX className="w-4 h-4 text-amber-500 shrink-0" />
                                            <span>Quarantine Actor</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={mitigationMutation.isPending}
                                            onClick={() => handleAction("hard_ban")}
                                            className="w-full py-3 bg-primary-container text-white font-black tracking-wide hover:brightness-105 rounded-xl transition-all crimson-glow cursor-pointer text-center flex items-center justify-center gap-2 border-none outline-none disabled:opacity-40"
                                        >
                                            <ShieldX className="w-4 h-4 shrink-0" />
                                            <span>Terminate Account</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={mitigationMutation.isPending}
                                            onClick={() => handleAction("dismiss")}
                                            className="w-full py-2.5 bg-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 font-black text-[10px] tracking-widest text-center border-none outline-none transition-colors mt-2 cursor-pointer"
                                        >
                                            Dismiss False Flag
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-neutral-400 gap-2 select-none font-mono">
                                    <Info className="w-7 h-7 text-neutral-300 opacity-60" />
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest">No incident selected</p>
                                        <p className="text-[11px] max-w-[200px] mt-1 font-sans font-medium text-neutral-400 leading-normal">Select an active ticket from the queue list to trigger mitigations.</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}
            {/* 🔬 SCHOLAR INTEGRITY AUDITS QUEUE LAYOUT */}
            {filter === "scholars" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Scholar Queue */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-zinc-800 pb-2 mb-4 select-none">
                            <h3 className="font-mono text-md font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-emerald-500" />
                                <span>Scholar Integrity Queue ({queueItems.length} Pending)</span>
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {isQueueLoading ? (
                                <div className="py-24 text-center text-neutral-400 select-none font-mono text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-3 opacity-60">
                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                    <span>Syncing scholar matrices...</span>
                                </div>
                            ) : queueItems.length > 0 ? (
                                queueItems.map(incident => {
                                    const isSelected = selectedScholarIncidentId === incident.incident_id;
                                    return (
                                        <div
                                            key={`scholar-card-${incident.incident_id}`}
                                            onClick={() => setSelectedScholarIncidentId(incident.incident_id)}
                                            className={cn(
                                                "p-6 border rounded-2xl cursor-pointer transition-all text-left",
                                                isSelected
                                                    ? "border-emerald-500/80 bg-emerald-500/[0.02] shadow-md ring-1 ring-emerald-500/20"
                                                    : "border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/40 hover:border-neutral-300 dark:hover:border-zinc-700"
                                            )}
                                        >
                                            <div className="flex justify-between items-center mb-3 select-none">
                                                <span className="text-[14px] font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-widest uppercase bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded">
                                                    🔬 {incident.security_flag?.type || "AUDIT"}
                                                </span>
                                                <span className="text-md text-neutral-400 font-mono font-bold">ID: {incident.incident_id}</span>
                                            </div>

                                            <p className="text-base font-semibold text-neutral-800 dark:text-neutral-100 leading-relaxed line-clamp-2 mb-4">
                                                "{incident.security_flag?.description || "Flagged parameter drop mismatch."}"
                                            </p>

                                            <div className="flex justify-between items-center text-lg border-t border-neutral-200 dark:border-zinc-800 pt-3 text-neutral-500 font-mono font-bold select-none">
                                                <div>
                                                    Account Profile: <span className="text-neutral-800 dark:text-neutral-200">@{incident.target_user?.username}</span>
                                                </div>
                                                <div>
                                                    ORCID Index: <span className="text-emerald-600 dark:text-emerald-400">{incident.audit_payload?.orcid_id || "Unregistered"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-neutral-50 dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800 p-12 rounded-2xl text-center select-none font-mono">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3 stroke-[1.5px]" />
                                    <h4 className="font-sans font-black text-neutral-800 dark:text-white mb-1">Queue Clear</h4>
                                    <p className="text-xs text-neutral-400 font-sans font-medium">No scholar integrity audits flagged. Operations optimal.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Dynamic AdminIncidentPanel Container */}
                    <div className="lg:col-span-4">
                        {activeScholarIncident ? (
                            <AdminIncidentPanel
                                incidentPayload={activeScholarIncident}
                                onActionComplete={handleScholarActionComplete}
                            />
                        ) : (
                            <div className="bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[420px] text-neutral-400 gap-2 select-none font-mono">
                                <Info className="w-7 h-7 text-neutral-300 opacity-60" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest">No incident selected</p>
                                    <p className="text-[11px] max-w-[200px] mt-1 font-sans font-medium text-neutral-400 leading-normal">Select an active scholar incident to review the integrity data manifest.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 🔥 IN-MEMORY FIREWALL MOCK LAYOUT PANEL */}
            {filter === "firewall" && (
                <section className="bg-white dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800 p-12 text-center rounded-[24px] shadow-md select-none animate-in zoom-in-95 duration-150">
                    <Activity className="w-12 h-12 text-neutral-400 mx-auto mb-4 stroke-[1.25px] animate-pulse" />
                    <h3 className="font-black text-neutral-800 dark:text-white text-lg mb-1 tracking-tight">In-Memory Firewall</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                        Real-time request packet analyzer, dynamic rate limiters, and malicious network traffic drop rules are running automatically behind the scene parameters.
                    </p>
                </section>
            )}
        </div>
    );
};

export default ModerationDashboard;
