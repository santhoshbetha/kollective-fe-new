// src/features/moderation/components/TelemetryFailureModal.jsx
import { useEffect, useState, useCallback } from 'react';
import {
    ShieldAlert,
    X,
    Terminal,
    Clock,
    Layers,
    Cpu,
    Copy,
    Check,
    AlertOctagon,
    RefreshCw,
    Code,
    FileText
} from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * TelemetryFailureModal
 * Detailed diagnostics modal for inspecting an Oban worker failure,
 * including error messages, stacktrace frames, and execution arguments.
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {object} job - The Oban failure job object
 * @param {function} onClose - Callback to close the modal
 */
export function TelemetryFailureModal({ isOpen, job, onClose }) {
    const [copiedPayload, setCopiedPayload] = useState(false);
    const [copiedDiagnostics, setCopiedDiagnostics] = useState(false);

    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    // Keyboard Escape listener
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

    if (!isOpen || !job) return null;

    const isDiscarded = job.state === 'discarded';

    // Normalize error data
    const errorsList = Array.isArray(job.errors)
        ? job.errors
        : job.errors
            ? [job.errors]
            : [];

    const latestError = errorsList.length > 0 ? errorsList[errorsList.length - 1] : null;
    const errorMessage = typeof latestError === 'string'
        ? latestError
        : latestError?.message || latestError?.error || latestError?.reason || (latestError ? JSON.stringify(latestError, null, 2) : "Unknown worker runtime exception.");

    const stackTrace = latestError?.backtrace || latestError?.stacktrace || latestError?.stack || null;

    const handleCopyPayload = () => {
        const text = JSON.stringify(job.args || {}, null, 2);
        navigator.clipboard.writeText(text);
        setCopiedPayload(true);
        setTimeout(() => setCopiedPayload(false), 2000);
    };

    const handleCopyAllDiagnostics = () => {
        const diagnosticReport = [
            `=========================================`,
            `OBAN WORKER FAILURE DIAGNOSTIC REPORT`,
            `=========================================`,
            `Job ID: #${job.id}`,
            `Worker: ${job.worker || 'Unknown'}`,
            `Queue: ${(job.queue || 'default').toUpperCase()}`,
            `State: ${(job.state || 'UNKNOWN').toUpperCase()}`,
            `Attempt: ${job.attempt || 1} / ${job.max_attempts || 20}`,
            `Attempted At: ${job.attempted_at ? new Date(job.attempted_at).toISOString() : 'N/A'}`,
            `Inserted At: ${job.inserted_at ? new Date(job.inserted_at).toISOString() : 'N/A'}`,
            `-----------------------------------------`,
            `ERROR SUMMARY:`,
            errorMessage,
            `-----------------------------------------`,
            `ARGUMENTS PAYLOAD:`,
            JSON.stringify(job.args || {}, null, 2),
            `-----------------------------------------`,
            stackTrace ? `STACKTRACE:\n${Array.isArray(stackTrace) ? stackTrace.join('\n') : stackTrace}` : '',
            `=========================================`
        ].filter(Boolean).join('\n');

        navigator.clipboard.writeText(diagnosticReport);
        setCopiedDiagnostics(true);
        setTimeout(() => setCopiedDiagnostics(false), 2000);
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="telemetry-modal-title"
        >
            <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200 font-sans text-neutral-800 dark:text-neutral-100 my-auto max-h-[90vh] flex flex-col">
                {/* Close Button in Header Corner */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer outline-none"
                    aria-label="Close telemetry diagnostics dialog"
                >
                    <X className="w-5 h-5 stroke-[2.5px]" />
                </button>

                {/* Header Icon + Title */}
                <div className="flex items-start gap-4 pb-5 border-b border-neutral-200 dark:border-white/5 pr-10">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
                        isDiscarded
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400"
                    )}>
                        {isDiscarded ? (
                            <AlertOctagon className="w-7 h-7 stroke-[2.2px]" />
                        ) : (
                            <ShieldAlert className="w-7 h-7 stroke-[2.2px]" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={cn(
                                "text-xs font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border",
                                isDiscarded
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            )}>
                                {isDiscarded ? "DISCARDED (EXHAUSTED)" : "RETRYABLE (FAILING)"}
                            </span>
                            <span className="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500">
                                Job #{job.id}
                            </span>
                        </div>
                        <h3 id="telemetry-modal-title" className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                            Worker Exception Diagnostics
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                            Real-time stacktrace analysis and parameters inspection for asynchronous task.
                        </p>
                    </div>
                </div>

                {/* Scrollable Diagnostics Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar py-6 space-y-6 select-text pr-1">

                    {/* Metadata Overview Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                        <div className="p-3.5 bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 rounded-2xl">
                            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <Cpu className="w-3.5 h-3.5" />
                                <span>Worker</span>
                            </div>
                            <span className="text-sm font-black text-neutral-900 dark:text-white truncate block" title={job.worker}>
                                {job.worker ? job.worker.split('.').pop() : "Unknown"}
                            </span>
                        </div>

                        <div className="p-3.5 bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 rounded-2xl">
                            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <Layers className="w-3.5 h-3.5" />
                                <span>Queue</span>
                            </div>
                            <span className="text-sm font-black text-neutral-900 dark:text-white uppercase block">
                                {job.queue || "default"}
                            </span>
                        </div>

                        <div className="p-3.5 bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 rounded-2xl">
                            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Attempts</span>
                            </div>
                            <span className="text-sm font-black text-neutral-900 dark:text-white block">
                                {job.attempt || 1} / {job.max_attempts || 20}
                            </span>
                        </div>

                        <div className="p-3.5 bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 rounded-2xl">
                            <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Timestamp</span>
                            </div>
                            <span className="text-sm font-black text-neutral-900 dark:text-white block truncate" title={job.attempted_at}>
                                {job.attempted_at ? new Date(job.attempted_at).toLocaleTimeString() : "N/A"}
                            </span>
                        </div>
                    </div>

                    {/* Full Worker Identifier */}
                    <div className="p-4 bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 rounded-2xl font-mono text-xs sm:text-sm">
                        <div className="flex items-center justify-between text-neutral-400 font-bold uppercase tracking-wider text-xs mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-primary-container" />
                                <span>Full Module Vector</span>
                            </span>
                            <span className="text-xs text-neutral-500">Elixir / Erlang Process</span>
                        </div>
                        <div className="font-black text-neutral-900 dark:text-amber-400 break-all select-all">
                            {job.worker || "UnknownWorker"}
                        </div>
                    </div>

                    {/* Primary Exception Box */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-rose-500 dark:text-rose-400">
                            <AlertOctagon className="w-4 h-4" />
                            <span>Exception Cause & Trace</span>
                        </div>

                        <div className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/[0.04] border border-rose-500/20 text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed font-mono overflow-x-auto">
                            <div className="font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center justify-between">
                                <span>Latest Error Message:</span>
                                {errorsList.length > 1 && (
                                    <span className="text-xs text-neutral-400 font-normal">
                                        ({errorsList.length} recorded retry attempts)
                                    </span>
                                )}
                            </div>
                            <pre className="whitespace-pre-wrap break-words text-xs sm:text-sm font-mono bg-black/40 p-4 rounded-xl border border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                                {errorMessage}
                            </pre>
                        </div>
                    </div>

                    {/* Stacktrace section if available */}
                    {stackTrace && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-neutral-400">
                                <Code className="w-4 h-4" />
                                <span>Stacktrace Frames</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#111111]/80 border border-white/5 font-mono text-xs text-neutral-300 max-h-44 overflow-y-auto custom-scrollbar select-text">
                                <pre className="whitespace-pre break-words leading-relaxed">
                                    {Array.isArray(stackTrace) ? stackTrace.join('\n') : String(stackTrace)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Job Arguments Payload Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-neutral-400">
                                <FileText className="w-4 h-4" />
                                <span>Job Arguments (args)</span>
                            </div>

                            <button
                                type="button"
                                onClick={handleCopyPayload}
                                className="px-3 py-1 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-lg text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer outline-none border border-neutral-200 dark:border-white/5"
                            >
                                {copiedPayload ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Copied JSON</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy Args</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#111111]/80 border border-neutral-200 dark:border-white/5 font-mono text-xs text-neutral-800 dark:text-emerald-400 max-h-48 overflow-y-auto custom-scrollbar">
                            <pre className="whitespace-pre-wrap break-words">
                                {job.args && Object.keys(job.args).length > 0
                                    ? JSON.stringify(job.args, null, 2)
                                    : '// No payload arguments recorded for this worker'}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-neutral-200 dark:border-white/5 font-mono select-none">
                    <button
                        type="button"
                        onClick={handleCopyAllDiagnostics}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-900 text-xs sm:text-sm font-bold transition-all cursor-pointer outline-none flex items-center justify-center gap-2"
                    >
                        {copiedDiagnostics ? (
                            <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>Diagnostic Report Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>Copy Full Diagnostic Report</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary-container hover:brightness-105 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer outline-none border-none shadow-md active:scale-95"
                    >
                        Close Diagnostics
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TelemetryFailureModal;
