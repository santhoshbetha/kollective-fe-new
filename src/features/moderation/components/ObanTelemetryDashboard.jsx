import { useState } from 'react';
import { useObanTelemetry } from '../hooks/useObanTelemetry';
import { Layers, Activity, CheckCircle, RefreshCw, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { TelemetryFailureModal } from './TelemetryFailureModal';

export function ObanTelemetryDashboard() {
    const { telemetry, isLoading, error, refetch } = useObanTelemetry();
    const [selectedFailure, setSelectedFailure] = useState(null);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 p-6 sm:p-8 bg-[#141414] border border-white/5 rounded-[32px] shadow-2xl font-sans text-left text-neutral-200 select-none animate-in fade-in duration-200">

            {/* 🎛️ Header Control Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3.5 bg-primary-container/10 border border-primary-container/20 rounded-2xl text-primary-container shrink-0 shadow-sm">
                        <Layers className="w-6 h-6 stroke-[2.5px]" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Queue Engine Metrics</h3>
                        <p className="text-sm sm:text-base font-medium text-neutral-400 mt-1 leading-relaxed">
                            Real-time tracking of asynchronous distributed background workers.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={refetch}
                    className="p-3.5 bg-[#181818] border border-white/10 text-neutral-400 hover:text-white rounded-2xl transition-all cursor-pointer outline-none flex items-center justify-center self-end sm:self-auto hover:border-white/20"
                    title="Refresh Queue Metrics"
                >
                    <RefreshCw className={cn("w-5 h-5 stroke-[2.5px]", isLoading && "animate-spin text-primary-container")} />
                </button>
            </div>

            {/* 📊 Metrics Overview Cards Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { key: "executing", label: "Active Jobs", count: telemetry.summary?.executing || 0, color: "text-primary-container bg-primary-container/5 border-primary-container/10", icon: Activity },
                    { key: "completed", label: "Succeeded", count: telemetry.summary?.completed || 0, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10", icon: CheckCircle },
                    { key: "retryable", label: "Retrying", count: telemetry.summary?.retryable || 0, color: "text-amber-400 bg-amber-500/5 border-amber-500/10", icon: RefreshCw },
                    { key: "discarded", label: "Exhausted", count: telemetry.summary?.discarded || 0, color: "text-rose-400 bg-rose-500/5 border-rose-500/10", icon: ShieldAlert }
                ].map((block) => {
                    const IconComp = block.icon;
                    return (
                        <div key={block.key} className={cn("p-6 sm:p-7 border rounded-3xl flex items-center gap-5 shadow-sm", block.color)}>
                            <IconComp className="w-8 h-8 shrink-0 stroke-[2px]" />
                            <div>
                                <span className="block font-mono text-xs sm:text-sm font-black uppercase text-neutral-400 tracking-wider">{block.label}</span>
                                <span className="text-2xl sm:text-3xl font-mono font-black text-white block mt-1.5">{block.count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 🔍 System Exception Tracking Stream Logs */}
            <div className="space-y-4 pt-2">
                <label className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-neutral-400 ml-1">
                    System Exception Tracking Stream Logs
                </label>

                {error && (
                    <div className="p-5 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-2xl flex items-center gap-3.5 text-sm font-medium animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="border border-white/5 rounded-3xl overflow-hidden bg-[#111111]/40 flex flex-col h-[420px]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3">
                        {isLoading && (!telemetry.recent_failures || telemetry.recent_failures.length === 0) ? (
                            <div className="py-24 text-center font-mono text-sm text-neutral-500 flex flex-col items-center justify-center gap-3 opacity-60 h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                                <span>COMPILING FAILING TASK REGISTERS...</span>
                            </div>
                        ) : telemetry.recent_failures?.length > 0 ? (
                            telemetry.recent_failures.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => setSelectedFailure(job)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedFailure(job);
                                        }
                                    }}
                                    className="p-5 sm:p-6 bg-[#181818] border border-white/5 hover:border-primary-container/40 hover:bg-[#1a1a1a] rounded-2xl flex flex-col gap-3 font-mono text-xs sm:text-sm text-left shadow-sm transition-all cursor-pointer group outline-none focus:ring-1 focus:ring-primary-container/40"
                                >
                                    <div className="flex justify-between items-baseline font-bold text-neutral-400">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-base sm:text-lg text-white font-sans font-black truncate max-w-[240px] sm:max-w-md group-hover:text-primary-container transition-colors">
                                                {job.worker ? job.worker.split('.').pop() : "UnknownWorker"}
                                            </span>
                                            <span className="text-[10px] text-neutral-500 font-mono">#{job.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={cn("text-xs font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-sm",
                                                job.state === "discarded" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            )}>{job.state}</span>
                                            <span className="text-xs text-primary-container font-mono font-bold hidden sm:inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                                Inspect &rarr;
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-neutral-300 font-sans font-medium text-xs sm:text-sm break-words leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/5 max-h-24 overflow-y-auto custom-scrollbar group-hover:border-white/10 transition-colors">
                                        {job.errors && Array.isArray(job.errors) && job.errors[0]
                                            ? job.errors[0]["message"] || job.errors[0]["error"] || JSON.stringify(job.errors[0])
                                            : "Network handshake partition failure / Media sync lockout."}
                                    </p>
                                    <div className="text-xs font-bold text-neutral-400 flex justify-between select-none pt-1">
                                        <span>QUEUE: {(job.queue || "default").toUpperCase()}</span>
                                        <div className="flex items-center gap-2">
                                            {job.attempt && (
                                                <span className="text-neutral-500 font-mono">Attempt {job.attempt}/{job.max_attempts || 20}</span>
                                            )}
                                            <span className="font-sans text-neutral-400">{job.attempted_at ? new Date(job.attempted_at).toLocaleTimeString() : ""}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center font-mono text-sm text-neutral-500 select-none opacity-40 flex items-center justify-center h-full">
                                // NO_FAILING_WORKER_TASKS_STREAM_CLEAN...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔍 Pop-up Modal for Deep Failure Diagnostics */}
            <TelemetryFailureModal
                key={selectedFailure?.id || 'none'}
                isOpen={!!selectedFailure}
                job={selectedFailure}
                onClose={() => setSelectedFailure(null)}
            />
        </div>
    );
}
