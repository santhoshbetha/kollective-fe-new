import { useEffect, useState, useCallback } from 'react';
import {
    AlertTriangle,
    Server,
    RefreshCw,
    Loader2,
    X,
    ShieldAlert,
    Network
} from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * ConfirmRecoveryModal
 * Emergency confirmation modal for triggering Erlang distribution
 * force partition healing and Mnesia schema re-synchronization on a cluster node.
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {string} targetNode - Node address (e.g. "kollective@127.0.0.1")
 * @param {function} onConfirm - Callback to trigger recovery
 * @param {function} onCancel - Callback to dismiss modal
 * @param {boolean} isSubmitting - Whether recovery network call is pending
 */
export function ConfirmRecoveryModal({
    isOpen,
    targetNode,
    onConfirm,
    onCancel,
    isSubmitting = false
}) {
    const [acknowledged, setAcknowledged] = useState(false);

    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            setAcknowledged(false);
            onCancel?.();
        }
    }, [isSubmitting, onCancel]);

    // Handle Escape key navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSubmitting) {
                    handleClose();
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-recovery-title"
        >
            <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-white/10 rounded-[32px] p-7 sm:p-9 max-w-xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200 font-sans text-neutral-800 dark:text-neutral-100">
                {/* Close Button in Header Corner */}
                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer outline-none disabled:opacity-40"
                    aria-label="Close recovery dialog"
                >
                    <X className="w-5 h-5 stroke-[2.5px]" />
                </button>

                {/* Header Icon + Title */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                        <AlertTriangle className="w-7 h-7 stroke-[2.2px]" />
                    </div>
                    <div className="min-w-0 pr-8">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Cluster Consensus Action
                            </span>
                        </div>
                        <h3 id="confirm-recovery-title" className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                            Force Partition Recovery
                        </h3>
                        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium mt-1 leading-relaxed">
                            Execute an emergency Mnesia table synchronization and Erlang mesh network healing sequence.
                        </p>
                    </div>
                </div>

                {/* Target Node Display Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 space-y-3 mb-6 font-mono">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-primary-container" />
                            <span>Target Node Vector</span>
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                            RPC DIRECT
                        </span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-[#101010] border border-neutral-200 dark:border-white/10 rounded-xl">
                        <div className="flex items-center gap-2.5 text-base sm:text-lg font-black text-neutral-900 dark:text-amber-400 break-all select-all">
                            <Network className="w-5 h-5 text-amber-500 shrink-0" />
                            <span>{targetNode || "Unknown Node"}</span>
                        </div>
                    </div>

                    <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 space-y-1.5 pt-2 border-t border-neutral-200 dark:border-white/5">
                        <div className="flex justify-between">
                            <span>Protocol Sequence:</span>
                            <span className="text-neutral-700 dark:text-neutral-300 font-bold">:mnesia:stop → sync → :mnesia:start</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Background Worker:</span>
                            <span className="text-neutral-700 dark:text-neutral-300 font-bold">MnesiaRehydrationEngine</span>
                        </div>
                    </div>
                </div>

                {/* Warning Advisory Callout */}
                <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/[0.04] border border-amber-500/20 text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed mb-6 flex items-start gap-3 font-sans">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="font-medium text-xs sm:text-sm leading-relaxed">
                        <strong className="font-bold text-neutral-900 dark:text-white">Cluster Impact:</strong> Forcing partition recovery instructs the remote node to flush split-brain table registers and fetch authoritative state from healthy cluster members. Inter-node transactions on this node will momentarily pause during sync.
                    </p>
                </div>

                {/* Safety Acknowledgment Checkbox */}
                <label className="flex items-start gap-3 mb-7 cursor-pointer select-none group">
                    <input
                        type="checkbox"
                        checked={acknowledged}
                        onChange={(e) => setAcknowledged(e.target.checked)}
                        disabled={isSubmitting}
                        className="mt-0.5 w-5 h-5 rounded border-neutral-300 dark:border-zinc-700 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-500"
                    />
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors leading-snug">
                        I confirm this node is isolated or partitioned and acknowledge the database re-synchronization.
                    </span>
                </label>

                {/* Action Buttons Footer */}
                <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-neutral-200 dark:border-white/5 font-mono">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleClose}
                        className="px-5 py-3 rounded-xl border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-900 hover:text-neutral-900 dark:hover:text-white text-xs sm:text-sm font-bold transition-all cursor-pointer outline-none disabled:opacity-40"
                    >
                        Abort / Cancel
                    </button>

                    <button
                        type="button"
                        disabled={isSubmitting || !acknowledged}
                        onClick={onConfirm}
                        className={cn(
                            "px-6 py-3 rounded-xl text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer outline-none border-none shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
                            isSubmitting
                                ? "bg-amber-600 cursor-wait"
                                : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20 hover:brightness-105"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Healing Mesh...</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 stroke-[2.5px]" />
                                <span>Execute Recovery</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmRecoveryModal;
