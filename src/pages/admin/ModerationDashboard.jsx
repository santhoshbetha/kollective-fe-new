// src/pages/admin/ModerationDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminIncidentPanel from './AdminIncidentPanel';
import { SecurityBlacklistsPanel } from './SecurityBlacklistsPanel';
import { IncidentRowItem } from '../../features/moderation/components/IncidentRowItem';
import { IncidentDetailCard } from '../../features/moderation/components/IncidentDetailCard';
import { AppealAdjudicationQueue } from '../../features/moderation/components/AppealAdjudicationQueue';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useModerationQueue } from '../../features/moderation/hooks/useModerationQueue';
import { apiFetch } from '../../api/apiClient';
import {
    Gavel,
    CheckCircle2,
    Activity,
    FileText,
    Trash2,
    UserX,
    ShieldX,
    FolderKanban,
    Loader2,
    Info,
    Shield,
    Sparkles,
    Terminal,
    Server,
    Scale
} from 'lucide-react';
import { cn } from "@/lib/utils";

// 📡 CORE NETWORKING SERVICES MAPPING
const fetchReportsData = async (filterStatus) => {
    if (filterStatus === "queue" || filterStatus === "firewall" || filterStatus === "appeals") return [];
    const path = filterStatus === "scholars"
        ? '/api/v1/admin/incidents'
        : `/api/v1/admin/reports?status=${filterStatus}`;

    const res = await apiFetch(path);
    return res?.data || res || [];
};

const resolveReportTicket = async ({ ticketId, actionType, targetAccount }) => {
    const res = await apiFetch(`/api/v1/admin/reports/${ticketId}/resolve`, {
        method: "POST",
        body: JSON.stringify({
            action: actionType,
            target_account: targetAccount,
            notes: "Processed via Operations Desk UI Dashboard."
        })
    });
    return res;
};

export const ModerationDashboard = ({ initialTab = "queue" } = {}) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryTab = searchParams.get('tab');
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((state) => state.user);
    const [filter, setFilter] = useState(queryTab || initialTab); // "queue", "open", "appeals", "resolved", "scholars", "firewall"

    // Sync tab when searchParam changes
    useEffect(() => {
        if (queryTab && queryTab !== filter) {
            setFilter(queryTab);
        }
    }, [queryTab]);

    // Core structural detail selection state references for report / scholar views
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [selectedScholarIncidentId, setSelectedScholarIncidentId] = useState(null);

    // ⚡ Live work-stealing queue integration (from useModerationQueue)
    const {
        leasedIncidents,
        activeIncident: leasedActiveIncident,
        setActiveIncident: setLeasedActiveIncident,
        isLoading: isLeaseLoading,
        actionPending: isLeaseActionPending,
        queueError,
        fetchAndLeaseNextTicket,
        resolveLeasedIncident,
        evictLeasedIncident
    } = useModerationQueue();

    const initialLeaseAttempted = useRef(false);

    // Auto-fetch initial item when entering queue tab if empty
    useEffect(() => {
        if (filter === "queue" && leasedIncidents.length === 0 && !initialLeaseAttempted.current) {
            initialLeaseAttempted.current = true;
            fetchAndLeaseNextTicket();
        }
    }, [filter, leasedIncidents.length, fetchAndLeaseNextTicket]);

    // ⚖️ PENDING APPEALS DISPUTE QUERY FOR TAB BADGE
    const { data: pendingAppeals = [] } = useQuery({
        queryKey: ['admin', 'moderation-appeals'],
        queryFn: async () => {
            const res = await apiFetch('/api/v1/admin/moderation_appeals/pending');
            return Array.isArray(res) ? res : (res?.data || []);
        },
        staleTime: 30000,
        refetchOnWindowFocus: false
    });

    // 📡 DYNAMIC COMPOSABLE TIMELINE QUERY LANES
    const { data: queueItems = [], isLoading: isQueueLoading } = useQuery({
        queryKey: ['admin', 'operations', 'queue', filter],
        queryFn: () => fetchReportsData(filter),
        enabled: filter !== "firewall" && filter !== "queue" && filter !== "appeals",
        staleTime: 30000,
        refetchOnWindowFocus: false
    });

    // 🚀 ATOMIC OPERATIONS MITIGATION MUTATION (Reports)
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

    // Derived active selections with automatic first-item fallbacks (no setState in useEffect)
    const activeLeasedTicket = filter === "queue"
        ? (leasedActiveIncident || (leasedIncidents.length > 0 ? leasedIncidents[0] : null))
        : null;

    const activeTicket = (filter === "open" || filter === "resolved")
        ? (queueItems.find(t => String(t.id) === String(selectedTicketId)) || (queueItems.length > 0 ? queueItems[0] : null))
        : null;

    const activeScholarIncident = (filter === "scholars")
        ? (queueItems.find(si => String(si.incident_id || si.id) === String(selectedScholarIncidentId)) || (queueItems.length > 0 ? queueItems[0] : null))
        : null;

    const handleAction = (actionType) => {
        if (!activeTicket) return;
        mitigationMutation.mutate({
            ticketId: activeTicket.id,
            actionType,
            targetAccount: activeTicket?.target_account
        });
    };

    const handleScholarActionComplete = (incidentId) => {
        queryClient.setQueryData(['admin', 'operations', 'queue', 'scholars'], (oldData) => {
            if (!Array.isArray(oldData)) return [];
            return oldData.filter(item => (item.incident_id || item.id) !== incidentId);
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'operations', 'queue', 'scholars'] });
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 p-4 sm:p-6 font-sans text-left bg-transparent text-neutral-800 dark:text-neutral-100 transition-colors antialiased">
            {/* Component Header Block */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-2 select-none border-b border-neutral-200 dark:border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-primary-container mb-2">
                        <Gavel className="w-5 h-5 text-primary-container stroke-[2.5px]" />
                        <span className="text-sm font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2.5 py-1 rounded-lg border border-primary-container/20">
                            Operations Clearance & Sovereignty Mesh
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                        Operations & Moderation Desk
                    </h1>
                    <p className="text-base sm:text-lg font-medium text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed max-w-3xl">
                        Monitor compliance alerts, lease distributed cluster incidents, investigate system reports, and execute structural mitigation policies.
                    </p>
                </div>

                {/* Header Action Button for Live Queue & Mesh Infrastructure */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/infrastructure')}
                        className="flex items-center gap-2 px-5 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 text-sm font-mono font-bold uppercase tracking-wider rounded-2xl transition-all border border-neutral-200 dark:border-zinc-700 cursor-pointer outline-none active:scale-95 shadow-sm"
                        title="View Cluster Node Topology, Oban Queues, and Sovereign Ledger"
                    >
                        <Server className="w-4 h-4 text-primary-container" />
                        <span>Mesh Console</span>
                    </button>

                    {filter === "queue" && (
                        <button
                            type="button"
                            disabled={isLeaseLoading || isLeaseActionPending}
                            onClick={fetchAndLeaseNextTicket}
                            className="flex items-center gap-2.5 px-5 py-3 bg-primary-container text-white text-sm font-mono font-black uppercase tracking-wider rounded-2xl hover:brightness-105 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer outline-none active:scale-95"
                        >
                            {isLeaseLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Terminal className="w-4 h-4 stroke-[2.5px]" />
                            )}
                            <span>Lease Next Incident</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Sub-navigation layout tab selection array */}
            <div className="flex flex-wrap bg-neutral-100 dark:bg-[#111111]/80 border border-neutral-200 dark:border-white/10 p-1.5 rounded-2xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider select-none shrink-0 gap-1.5 shadow-sm mb-8">
                {[
                    { label: "⚡ Live Queue", value: "queue", badge: leasedIncidents.length },
                    { label: "🚨 Active Reports", value: "open", badge: filter === "open" && queueItems.length > 0 ? queueItems.length : undefined },
                    { label: "⚖️ Appeals Desk", value: "appeals", badge: pendingAppeals.length > 0 ? pendingAppeals.length : undefined },
                    { label: "✅ Audit Trail History", value: "resolved" },
                    { label: "🔬 Scholar Audits", value: "scholars", badge: filter === "scholars" && queueItems.length > 0 ? queueItems.length : undefined },
                    { label: "🔥 In-Memory Firewall", value: "firewall" }
                ].map((tab) => {
                    const isActive = filter === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => {
                                setFilter(tab.value);
                                setSearchParams({ tab: tab.value });
                            }}
                            className={cn(
                                "px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer border-none outline-none text-xs sm:text-sm font-black uppercase tracking-wider",
                                isActive
                                    ? "bg-primary-container text-white shadow-md font-bold"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent"
                            )}
                        >
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span className={cn(
                                    "text-xs font-mono font-bold px-2 py-0.5 rounded-full",
                                    isActive ? "bg-white text-primary-container" : "bg-primary-container/15 text-primary-container"
                                )}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ⚡ 1. LIVE WORK-STEALING QUEUE LAYOUT */}
            {filter === "queue" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-neutral-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-lg min-h-[720px] bg-white dark:bg-zinc-950">
                    {/* Left Column: Active Leased Incidents Directory */}
                    <div className="lg:col-span-4 flex flex-col border-r border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/40 h-full max-h-[820px] min-h-[580px] overflow-hidden">
                        <div className="p-5 border-b border-neutral-200 dark:border-zinc-800 font-mono text-sm sm:text-base font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-zinc-900/60 select-none flex justify-between items-center shrink-0">
                            <span>Active Leases Held ({leasedIncidents.length})</span>
                            <button
                                type="button"
                                disabled={isLeaseLoading || isLeaseActionPending}
                                onClick={fetchAndLeaseNextTicket}
                                className="text-xs sm:text-sm text-primary-container hover:underline font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                            >
                                {isLeaseLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Terminal className="w-3.5 h-3.5" />
                                )}
                                <span>+ Lease</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {isLeaseLoading && leasedIncidents.length === 0 ? (
                                <div className="py-24 text-center font-mono text-sm text-neutral-400 select-none flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                                    <span>Querying Mnesia cluster queue...</span>
                                </div>
                            ) : leasedIncidents.length > 0 ? (
                                leasedIncidents.map((ticket) => {
                                    const isSelected = activeLeasedTicket && ticket.id === activeLeasedTicket.id;
                                    return (
                                        <IncidentRowItem
                                            key={`leased-${ticket.id}`}
                                            incident={ticket}
                                            variant="compact"
                                            isSelected={isSelected}
                                            currentUserId={currentUser?.id}
                                            onSelect={() => setLeasedActiveIncident(ticket)}
                                            onRelease={() => {
                                                resolveLeasedIncident(ticket.id, "release");
                                            }}
                                            onResolve={(actionType) => {
                                                resolveLeasedIncident(ticket.id, actionType || "resolve");
                                            }}
                                        />
                                    );
                                })
                            ) : (
                                <div className="py-24 text-center font-mono text-sm text-neutral-400 select-none flex flex-col items-center justify-center gap-3 h-full">
                                    <Terminal className="w-8 h-8 text-neutral-300 dark:text-neutral-700 stroke-[1.5px]" />
                                    <span className="font-bold">No leased tickets active.</span>
                                    <button
                                        type="button"
                                        disabled={isLeaseLoading || isLeaseActionPending}
                                        onClick={fetchAndLeaseNextTicket}
                                        className="mt-2 text-sm font-sans font-bold text-primary-container underline cursor-pointer"
                                    >
                                        Click to lease next incident
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Active Adjudication Viewport Panel */}
                    <div className="lg:col-span-8 flex flex-col h-full max-h-[820px] min-h-[580px] overflow-hidden bg-white dark:bg-zinc-950">
                        {activeLeasedTicket ? (
                            <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden animate-in fade-in duration-150">
                                <IncidentDetailCard
                                    incident={activeLeasedTicket}
                                    actionPending={isLeaseActionPending}
                                    onResolve={() => {
                                        evictLeasedIncident(activeLeasedTicket.id);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400 select-none font-mono text-sm gap-4">
                                {queueError === "empty_queue_all_clear" ? (
                                    <>
                                        <Sparkles className="w-14 h-14 text-emerald-500 stroke-[1.5px] animate-pulse" />
                                        <div className="space-y-1.5 font-sans">
                                            <h3 className="font-black text-lg sm:text-xl text-neutral-900 dark:text-white">Zone Clear</h3>
                                            <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-md leading-relaxed text-sm sm:text-base">
                                                All structural compliance audits have been resolved. The multi-node mesh is clean.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-14 h-14 text-primary-container stroke-[1.5px]" />
                                        <div className="space-y-1.5 font-sans">
                                            <h3 className="font-black text-lg sm:text-xl text-neutral-900 dark:text-white">Awaiting Assignment</h3>
                                            <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-md leading-relaxed text-sm sm:text-base">
                                                Select a leased incident from the directory, or click <strong className="text-primary-container font-black">Lease Next Incident</strong> to request a new item from the cluster.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={isLeaseLoading || isLeaseActionPending}
                                            onClick={fetchAndLeaseNextTicket}
                                            className="mt-3 px-6 py-3 bg-primary-container text-white text-sm font-mono font-black uppercase tracking-wider rounded-2xl hover:brightness-105 cursor-pointer shadow-md transition-all"
                                        >
                                            Lease Next Incident
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 🚨 2. COMPLIANCE INCIDENTS QUEUE LAYOUT (Open / Resolved Reports) */}
            {(filter === "open" || filter === "resolved") && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Tickets List */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-zinc-800 pb-3 mb-4 select-none">
                            <h3 className="font-mono text-lg font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <FolderKanban className="w-5 h-5 text-primary-container" />
                                <span>Ticket Queue ({queueItems.length} {filter === "resolved" ? "Archived" : "Pending"})</span>
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {isQueueLoading ? (
                                <div className="py-24 text-center text-neutral-400 select-none font-mono text-sm font-bold uppercase tracking-widest flex flex-col items-center gap-3 opacity-60">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                                    <span>Syncing active database records...</span>
                                </div>
                            ) : queueItems.length > 0 ? (
                                queueItems.map(ticket => {
                                    const isSelected = activeTicket && String(ticket.id) === String(activeTicket.id);
                                    return (
                                        <IncidentRowItem
                                            key={`ticket-card-${ticket.id}`}
                                            incident={ticket}
                                            isSelected={isSelected}
                                            currentUserId={currentUser?.id}
                                            onSelect={() => setSelectedTicketId(ticket.id)}
                                            onClaim={() => {
                                                queryClient.invalidateQueries({ queryKey: ['admin', 'operations', 'queue', filter] });
                                            }}
                                            onRelease={() => {
                                                queryClient.invalidateQueries({ queryKey: ['admin', 'operations', 'queue', filter] });
                                            }}
                                            onResolve={() => {
                                                setSelectedTicketId(ticket.id);
                                            }}
                                        />
                                    );
                                })
                            ) : (
                                <div className="bg-neutral-50 dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800 p-14 rounded-3xl text-center select-none font-mono shadow-sm">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 stroke-[1.5px]" />
                                    <h4 className="font-sans font-black text-xl text-neutral-800 dark:text-white mb-1">Queue Clear</h4>
                                    <p className="text-base text-neutral-400 font-sans font-medium">No tickets matched this filter status. Operations optimal.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Administrative Mitigation Actions Panel */}
                    <div className="lg:col-span-4">
                        <section className="bg-neutral-50/70 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 p-6 sm:p-7 rounded-[28px] flex flex-col justify-between min-h-[520px] shadow-sm text-left">
                            {activeTicket ? (
                                <div className="space-y-6 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="border-b border-neutral-200 dark:border-zinc-800 pb-3 flex justify-between items-center select-none">
                                            <h3 className="font-mono text-lg font-black text-neutral-600 dark:text-neutral-300 uppercase tracking-widest flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-primary-container" />
                                                <span>Incident Details</span>
                                            </h3>
                                            <span className="text-xs sm:text-sm font-mono font-bold bg-primary-container/10 text-primary-container px-3 py-1 border border-primary-container/20 rounded-xl">
                                                {activeTicket.id}
                                            </span>
                                        </div>

                                        <div className="p-5 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-2xl text-base sm:text-lg leading-relaxed text-neutral-800 dark:text-neutral-100 font-medium shadow-inner">
                                            "{activeTicket.preview_text}"
                                        </div>

                                        <div className="text-sm sm:text-base font-mono font-bold text-neutral-500 dark:text-neutral-400 space-y-2.5 bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-neutral-200 dark:border-zinc-800 select-none shadow-xs">
                                            <div>Reporter: <span className="text-neutral-800 dark:text-neutral-200 font-mono">@{activeTicket.reporter}</span></div>
                                            <div>Target Account: <span className="text-primary-container font-mono">@{activeTicket.target_account}</span></div>
                                            <div>Category: <span className="text-neutral-800 dark:text-neutral-200 font-sans font-semibold">{activeTicket.category}</span></div>
                                        </div>
                                    </div>

                                    {filter === "open" ? (
                                        <div className="space-y-3 pt-5 border-t border-neutral-200 dark:border-zinc-800 font-mono text-xs uppercase font-bold tracking-wider select-none">
                                            <h4 className="text-xs sm:text-sm font-black text-neutral-400 tracking-widest uppercase mb-3">
                                                Mitigation Protocol
                                            </h4>
                                            <button
                                                type="button"
                                                disabled={mitigationMutation.isPending}
                                                onClick={() => handleAction("soft_delete")}
                                                className="w-full py-3.5 px-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-700 dark:text-neutral-200 font-black text-sm sm:text-base tracking-wide rounded-2xl transition-all cursor-pointer text-center flex items-center justify-center gap-2.5 outline-none disabled:opacity-40 shadow-xs active:scale-[0.99]"
                                            >
                                                <Trash2 className="w-5 h-5 text-neutral-400 shrink-0" />
                                                <span>Hide Content</span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={mitigationMutation.isPending}
                                                onClick={() => handleAction("shadow_ban")}
                                                className="w-full py-3.5 px-4 bg-white dark:bg-zinc-900 border border-amber-500/20 hover:border-amber-500/40 text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base tracking-wide rounded-2xl transition-all cursor-pointer text-center flex items-center justify-center gap-2.5 outline-none disabled:opacity-40 shadow-xs active:scale-[0.99]"
                                            >
                                                <UserX className="w-5 h-5 text-amber-500 shrink-0" />
                                                <span>Quarantine Actor</span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={mitigationMutation.isPending}
                                                onClick={() => handleAction("hard_ban")}
                                                className="w-full py-4 px-4 bg-primary-container text-white font-black text-sm sm:text-base tracking-wide hover:brightness-105 rounded-2xl transition-all crimson-glow cursor-pointer text-center flex items-center justify-center gap-2.5 border-none outline-none disabled:opacity-40 shadow-md active:scale-[0.99]"
                                            >
                                                <ShieldX className="w-5 h-5 shrink-0" />
                                                <span>Terminate Account</span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={mitigationMutation.isPending}
                                                onClick={() => handleAction("dismiss")}
                                                className="w-full py-3 px-4 bg-transparent hover:bg-neutral-200/50 dark:hover:bg-zinc-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-bold text-xs sm:text-sm tracking-wider text-center border border-transparent rounded-xl transition-colors mt-2 cursor-pointer"
                                            >
                                                Dismiss False Flag
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center font-mono text-sm text-emerald-600 dark:text-emerald-400 font-bold select-none">
                                            Status: {activeTicket.status || "Resolved"}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-neutral-400 gap-3 select-none font-mono">
                                    <Info className="w-10 h-10 text-neutral-300 dark:text-neutral-700 opacity-60" />
                                    <div>
                                        <p className="text-sm sm:text-base font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300">No incident selected</p>
                                        <p className="text-sm font-sans font-medium text-neutral-400 mt-1 max-w-[240px] leading-relaxed">
                                            Select an active ticket from the queue list to trigger mitigations.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}

            {/* 🔬 3. SCHOLAR INTEGRITY AUDITS QUEUE LAYOUT */}
            {filter === "scholars" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column: Scholar Queue */}
                    <div className="md:col-span-12 xl:col-span-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-zinc-800 pb-3 mb-4 select-none">
                            <h3 className="font-mono text-lg font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                <span>Scholar Integrity Queue ({queueItems.length} Pending)</span>
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {isQueueLoading ? (
                                <div className="py-24 text-center text-neutral-400 select-none font-mono text-sm font-bold uppercase tracking-widest flex flex-col items-center gap-3 opacity-60">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                    <span>Syncing scholar matrices...</span>
                                </div>
                            ) : queueItems.length > 0 ? (
                                queueItems.map(incident => {
                                    const incidentId = incident.incident_id || incident.id;
                                    const isSelected = activeScholarIncident && String(incidentId) === String(activeScholarIncident.incident_id || activeScholarIncident.id);
                                    return (
                                        <IncidentRowItem
                                            key={`scholar-card-${incidentId}`}
                                            incident={incident}
                                            isSelected={isSelected}
                                            currentUserId={currentUser?.id}
                                            onSelect={() => setSelectedScholarIncidentId(incidentId)}
                                            onClaim={() => {
                                                queryClient.invalidateQueries({ queryKey: ['admin', 'operations', 'queue', 'scholars'] });
                                            }}
                                            onRelease={() => {
                                                queryClient.invalidateQueries({ queryKey: ['admin', 'operations', 'queue', 'scholars'] });
                                            }}
                                            onResolve={() => {
                                                setSelectedScholarIncidentId(incidentId);
                                            }}
                                        />
                                    );
                                })
                            ) : (
                                <div className="bg-neutral-50 dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800 p-14 rounded-3xl text-center select-none font-mono shadow-sm">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 stroke-[1.5px]" />
                                    <h4 className="font-sans font-black text-xl text-neutral-800 dark:text-white mb-1">Queue Clear</h4>
                                    <p className="text-base text-neutral-400 font-sans font-medium">No scholar integrity audits flagged. Operations optimal.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Dynamic AdminIncidentPanel Container */}
                    <div className="md:col-span-12 xl:col-span-6">
                        {activeScholarIncident ? (
                            <AdminIncidentPanel
                                incidentPayload={activeScholarIncident}
                                onActionComplete={handleScholarActionComplete}
                            />
                        ) : (
                            <div className="bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center min-h-[500px] text-neutral-400 gap-3 select-none font-mono">
                                <Info className="w-10 h-10 text-neutral-300 dark:text-neutral-700 opacity-60" />
                                <div>
                                    <p className="text-sm sm:text-base font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300">No incident selected</p>
                                    <p className="text-sm font-sans font-medium text-neutral-400 mt-1 max-w-[260px] leading-normal">Select an active scholar incident to review the integrity data manifest.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 🔥 4. IN-MEMORY FIREWALL PANEL */}
            {filter === "firewall" && (
                <SecurityBlacklistsPanel />
            )}

            {/* ⚖️ 5. GOVERNANCE APPEALS ADJUDICATION DESK */}
            {filter === "appeals" && (
                <div className="border border-neutral-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 bg-white dark:bg-[#141414] shadow-xl animate-in fade-in duration-150">
                    <AppealAdjudicationQueue />
                </div>
            )}
        </div>
    );
};

export default ModerationDashboard;
