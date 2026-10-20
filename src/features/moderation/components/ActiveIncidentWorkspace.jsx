import { useState, useCallback } from 'react';
import { apiFetch } from '../../../api/apiClient';
import { Terminal, Zap, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * ⚡ ActiveIncidentWorkspace
 * Resolution console and operator activity heartbeat engine.
 * Automatically keeps the Mnesia cluster ticket lease alive while the operator documents findings.
 */
export function ActiveIncidentWorkspace({
    incidentId,
    notes: parentNotes,
    onNotesChange,
    onLeaseLost,
    className
}) {
    const [localNotes, setLocalNotes] = useState("");
    const [lastExtendedAt, setLastExtendedAt] = useState(0);
    const [isExtending, setIsExtending] = useState(false);
    const [isLeaseLost, setIsLeaseLost] = useState(false);
    const [lastSyncMessage, setLastSyncMessage] = useState(null);

    const currentNotes = parentNotes !== undefined ? parentNotes : localNotes;

    // 📡 Heartbeat extension dispatcher: Throttle renewal pings to at most once every 30 seconds
    const extendLeaseHeartbeat = useCallback(async (forced = false) => {
        if (!incidentId || isLeaseLost) return;
        const now = Date.now();

        if (forced || (now - lastExtendedAt > 30000)) {
            setLastExtendedAt(now);
            setIsExtending(true);
            try {
                const res = await apiFetch(`/api/v1/admin/incidents/${incidentId}/extend`, {
                    method: 'POST'
                });

                if (res?.status === "success" || res?.message) {
                    setLastSyncMessage("Lease extended (+5m)");
                    setTimeout(() => setLastSyncMessage(null), 4000);
                }
            } catch (err) {
                if (err?.status === 412 || err?.message?.includes("412") || err?.message?.includes("expired")) {
                    setIsLeaseLost(true);
                    if (onLeaseLost) {
                        onLeaseLost();
                    } else {
                        alert("⚠️ Alert: You have been inactive for too long and lost this ticket!");
                    }
                } else {
                    console.warn("Lease extension ping returned non-fatal error:", err?.message);
                }
            } finally {
                setIsExtending(false);
            }
        }
    }, [incidentId, lastExtendedAt, isLeaseLost, onLeaseLost]);

    const handleTextareaChange = (e) => {
        const val = e.target.value;
        if (onNotesChange) {
            onNotesChange(val);
        } else {
            setLocalNotes(val);
        }

        // 🎯 Fire activity check on typing keystrokes
        extendLeaseHeartbeat(false);
    };

    return (
        <div className={cn(
            "p-4 bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200 dark:border-zinc-800 rounded-2xl text-left space-y-3 transition-colors",
            className
        )}>
            {/* Console Header & Live Telemetry Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none border-b border-neutral-200/60 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary-container shrink-0" />
                    <h3 className="text-[14px] font-mono font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
                        Resolution Console
                    </h3>
                </div>

                <div className="flex items-center gap-2 font-mono text-md">
                    {isExtending ? (
                        <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Renewing lease...</span>
                        </span>
                    ) : lastSyncMessage ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
                            <Zap className="w-3.5 h-3.5" />
                            <span>{lastSyncMessage}</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
                            <Zap className="w-4.5 h-4.5 text-emerald-500" />
                            <span>Heartbeat auto-renew</span>
                        </span>
                    )}

                    <button
                        type="button"
                        disabled={isExtending || isLeaseLost}
                        onClick={() => extendLeaseHeartbeat(true)}
                        className="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded text-[14px] font-bold cursor-pointer transition-colors disabled:opacity-40 flex items-center gap-1"
                        title="Extend lease manually by 5 minutes"
                    >
                        <Clock className="w-3 h-3" />
                        <span>+5m</span>
                    </button>
                </div>
            </div>

            {/* Inactivity Expiration Warning Alert */}
            {isLeaseLost && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 select-none animate-bounce">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>⚠️ Ticket lease expired due to inactivity. Record returned to cluster pool.</span>
                </div>
            )}

            {/* Instruction Subtitle */}
            <label className="block text-[14px] font-mono text-neutral-400 select-none">
                Document infraction rationale or notes. Keystrokes keep your distributed lease alive:
            </label>

            {/* Investigation Notes Input Field */}
            <textarea
                value={currentNotes}
                disabled={isLeaseLost}
                onChange={handleTextareaChange}
                rows={4}
                className="w-full p-3 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all resize-y custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Document infraction notes, behavioral patterns, or mitigation logic here..."
            />
        </div>
    );
}

export default ActiveIncidentWorkspace;
