import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../api/apiClient';
import { ActiveIncidentWorkspace } from './ActiveIncidentWorkspace';
import {
    ShieldAlert, Trash2, CheckCircle2, Ban,
    Globe, Terminal, User, Loader2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export function IncidentDetailCard({ incident, actionPending: parentActionPending, onResolve }) {
    const queryClient = useQueryClient();
    const [localAction, setLocalAction] = useState(null); // Tracks specifically which button was pressed
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [isLeaseExpired, setIsLeaseExpired] = useState(false);
    const [prevIncidentId, setPrevIncidentId] = useState(incident?.id);

    // Reset workspace state whenever a new incident is loaded into the desk
    if (incident?.id !== prevIncidentId) {
        setPrevIncidentId(incident?.id);
        setResolutionNotes("");
        setIsLeaseExpired(false);
    }

    // 🚀 REAL BACKEND MUTATE CALL FOR INCIDENT ADJUDICATION
    const adjudicationMutation = useMutation({
        mutationFn: async (actionType) => {
            const incidentId = incident?.id || incident?.incident_id;
            if (!incidentId) throw new Error("Missing incident ID for adjudication");

            const finalNotes = resolutionNotes?.trim()
                ? resolutionNotes.trim()
                : `Adjudicated as ${actionType} via Adjudication Target File.`;

            // Direct call to Phoenix Backend: POST /api/v1/admin/incidents/:id/resolve
            const response = await apiFetch(`/api/v1/admin/incidents/${incidentId}/resolve`, {
                method: 'POST',
                body: JSON.stringify({
                    action: actionType,
                    target_account: incident.target_username || incident.target_account,
                    notes: finalNotes
                })
            });

            return response?.data || response;
        },
        onSuccess: (data, actionType) => {
            // Invalidate React Query caches for real-time consistency
            queryClient.invalidateQueries({ queryKey: ['admin', 'operations'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'incidents'] });

            // Notify parent context (e.g., evict from queue and advance)
            if (onResolve) {
                onResolve(actionType, data);
            }
        },
        onError: (err) => {
            console.error("Adjudication mutation failed:", err);
            alert(`Adjudication failed: ${err?.message || "Internal cluster transaction failure"}`);
        },
        onSettled: () => {
            setLocalAction(null);
        }
    });

    if (!incident) return null;

    const formattedDate = incident.inserted_at
        ? new Date(incident.inserted_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
        : "Pending live sync...";

    const isInteractionDisabled = parentActionPending || adjudicationMutation.isPending || localAction !== null || isLeaseExpired;

    // Trigger local animation parameters and execute backend mutation
    const executeAdjudication = (actionType) => {
        if (isInteractionDisabled) return;
        setLocalAction(actionType);
        adjudicationMutation.mutate(actionType);
    };

    return (
        <div className="flex flex-col h-full max-h-full min-h-0 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm font-sans text-neutral-800 dark:text-neutral-100 animate-in fade-in duration-200">

            {/* 🏷️ Card Header Status Strip */}
            <div className="p-5 border-b border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/60 flex items-center justify-between select-none shrink-0">
                <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-500 stroke-[2.5px]" />
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-wider font-mono text-neutral-600 dark:text-neutral-300">
                        Adjudication Target File
                    </h3>
                </div>
                <div className="font-mono text-xs sm:text-sm font-black bg-neutral-200 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-200 px-3 py-1 border border-neutral-300 dark:border-zinc-700 rounded-xl shadow-xs">
                    ID: {incident.id}
                </div>
            </div>

            {/* 📜 Content Details Canvas Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 custom-scrollbar bg-white dark:bg-zinc-950">

                {/* Section A: Attributed Account Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono select-none">
                    <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4 shadow-xs">
                        <User className="w-5 h-5 text-primary-container shrink-0" />
                        <div className="min-w-0 flex-1">
                            <span className="block text-xs font-black uppercase tracking-wider text-neutral-400">Target Profile</span>
                            <span className="text-neutral-900 dark:text-white font-sans font-black text-base sm:text-lg truncate block mt-0.5">
                                @{incident.target_username || "UnknownCitizen"}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4 shadow-xs">
                        <Globe className="w-5 h-5 text-primary-container shrink-0" />
                        <div className="min-w-0 flex-1">
                            <span className="block text-xs font-black uppercase tracking-wider text-neutral-400">Geographic Source</span>
                            <span className="text-neutral-900 dark:text-white text-base sm:text-lg font-black truncate block mt-0.5">
                                Zone: {incident.country_code || "Global"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section B: Infraction Context Narrative Box */}
                <div className="space-y-2 text-left">
                    <label className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-neutral-400 ml-1 select-none">
                        Reported Incident Narrative
                    </label>
                    <div className="p-5 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-2xl text-base sm:text-lg font-medium text-neutral-800 dark:text-neutral-100 leading-relaxed break-words shadow-inner">
                        {incident.description || "No localized behavioral metadata attached."}
                    </div>
                </div>

                {/* Section C: Distributed Hybrid Layer Telemetry Matrix */}
                <div className="p-5 border border-neutral-200 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900/30 rounded-2xl flex flex-col gap-2.5 font-mono text-sm font-bold text-neutral-400 select-none shadow-xs">
                    <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-zinc-800 pb-2">
                        <Terminal className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
                        <span className="uppercase text-neutral-700 dark:text-neutral-200 tracking-wider font-black text-xs sm:text-sm">Mesh-Hybrid Telemetry State</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-neutral-400">Origin Node:</span>
                        <span className="text-neutral-800 dark:text-neutral-100 font-black tracking-wide">{incident.origin_node_atom || "node_primary@127.0.0.1"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Network Timestamp:</span>
                        <span className="text-neutral-800 dark:text-neutral-100 font-sans font-medium">{formattedDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Database Storage:</span>
                        <span className="text-primary-container bg-primary-container/10 px-2.5 py-1 border border-primary-container/20 rounded-lg text-xs font-black uppercase tracking-wider">
                            Mnesia + Ecto SQL Dual-Write
                        </span>
                    </div>
                </div>

                {/* Section D: Active Incident Workspace (Resolution Console & Heartbeat Engine) */}
                <ActiveIncidentWorkspace
                    incidentId={incident.id}
                    notes={resolutionNotes}
                    onNotesChange={setResolutionNotes}
                    onLeaseLost={() => setIsLeaseExpired(true)}
                />

                {/* Processing Overlay State Banner */}
                {localAction && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-3 font-mono text-sm font-bold uppercase select-none animate-pulse text-amber-600 dark:text-amber-400">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500 shrink-0" />
                        <span>Replicating {localAction} parameter mutations across mesh...</span>
                    </div>
                )}

                {/* Lease Expired Warning */}
                {isLeaseExpired && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 font-mono text-sm font-bold text-amber-600 dark:text-amber-400 select-none">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500" />
                        <span>Operator lease has expired due to inactivity. Record has been released back to the cluster pool.</span>
                    </div>
                )}

                {/* Transaction Error Alert */}
                {adjudicationMutation.isError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 font-mono text-sm font-bold text-rose-600 dark:text-rose-400 select-none">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
                        <span>Transaction Error: {adjudicationMutation.error?.message || "Internal cluster failure"}</span>
                    </div>
                )}
            </div>

            {/* 🛠️ Adjudication Actions Control Toolbar Panel Footer */}
            <div className="p-5 border-t border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/60 flex flex-col sm:flex-row gap-3.5 sm:gap-4 font-mono text-sm sm:text-base font-black uppercase tracking-wider select-none shrink-0">
                <button
                    type="button"
                    disabled={isInteractionDisabled}
                    onClick={() => executeAdjudication("dismiss")}
                    className={cn(
                        "flex-1 py-3.5 sm:py-4 px-5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-all rounded-2xl cursor-pointer flex items-center justify-center gap-2.5 ctrl-btn outline-none shadow-xs active:scale-[0.99]",
                        isInteractionDisabled && "opacity-40 cursor-not-allowed",
                        localAction === "dismiss" && "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    )}
                >
                    {localAction === "dismiss" ? (
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 stroke-[2.5px]" />
                    )}
                    <span>Dismiss Flag</span>
                </button>

                <button
                    type="button"
                    disabled={isInteractionDisabled}
                    onClick={() => executeAdjudication("soft_delete")}
                    className={cn(
                        "flex-1 py-3.5 sm:py-4 px-5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-all rounded-2xl cursor-pointer flex items-center justify-center gap-2.5 ctrl-btn outline-none shadow-xs active:scale-[0.99]",
                        isInteractionDisabled && "opacity-40 cursor-not-allowed",
                        localAction === "soft_delete" && "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    )}
                >
                    {localAction === "soft_delete" ? (
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    ) : (
                        <Trash2 className="w-5 h-5 text-amber-500 stroke-[2.5px]" />
                    )}
                    <span>Soft Delete</span>
                </button>

                <button
                    type="button"
                    disabled={isInteractionDisabled}
                    onClick={() => executeAdjudication("hard_ban")}
                    className={cn(
                        "flex-1 py-3.5 sm:py-4 px-5 bg-rose-600 text-white hover:brightness-105 border-none transition-all rounded-2xl cursor-pointer flex items-center justify-center gap-2.5 ctrl-btn outline-none shadow-md active:scale-[0.99]",
                        isInteractionDisabled && "opacity-40 cursor-not-allowed",
                        localAction === "hard_ban" && "bg-rose-800 animate-pulse"
                    )}
                >
                    {localAction === "hard_ban" ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                        <Ban className="w-5 h-5 stroke-[2.5px]" />
                    )}
                    <span>Sovereign Ban</span>
                </button>
            </div>
        </div>
    );
}

export default IncidentDetailCard;
