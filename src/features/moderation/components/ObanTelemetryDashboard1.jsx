// src/features/moderation/components/ObanTelemetryDashboard.jsx
import React from 'react';
import { useObanTelemetry } from '../hooks/useObanTelemetry';
import { Layers, Activity, CheckCircle, RefreshCcw, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function ObanTelemetryDashboard1() {
    const { telemetry, isLoading, error, refetch } = useObanTelemetry();

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 p-6 bg-[#141414] border border-white/5 rounded-[28px] shadow-2xl font-sans text-left text-neutral-200 select-none animate-in fade-in duration-200">

            {/* Header Control Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary-container/10 border border-primary-container/20 rounded-xl text-primary-container shrink-0">
                        <Layers className="w-4 h-4 stroke-[2.5px]" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight">Queue Engine Metrics</h3>
                        <p className="text-[11px] font-medium text-neutral-400 mt-0.5 leading-none">
                            Real-time tracking of asynchronous distributed background workers.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={refetch}
                    className="p-2.5 bg-[#181818] border border-white/10 text-neutral-400 hover:text-white rounded-xl cursor-pointer outline-none"
                >
                    <RefreshCcw className={cn("w-4 h-4 stroke-[2.5px]", isLoading && "animate-spin text-primary-container")} />
                </button>
            </div>

            {/* Metric Blocks Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { key: "executing", label: "Active Jobs", count: telemetry.summary.executing, color: "text-primary-container bg-primary-container/5 border-primary-container/10", icon: Activity },
                    { key: "completed", label: "Succeeded", count: telemetry.summary.completed, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10", icon: CheckCircle },
                    { key: "retryable", label: "Retrying", count: telemetry.summary.retryable, color: "text-amber-400 bg-amber-500/5 border-amber-500/10", icon: RefreshCcw },
                    { key: "discarded", label: "Exhausted", count: telemetry.summary.discarded, color: "text-rose-400 bg-rose-500/5 border-rose-500/10", icon: ShieldAlert }
                ].map((block) => {
                    const IconComp = block.icon;
                    return (
                        <div key={block.key} className={cn("p-4 border rounded-2xl flex items-center gap-3.5", block.color)}>
                            <IconComp className="w-5 h-5 shrink-0 stroke-[2px]" />
                            <div>
                                <span className="block font-mono text-[9px] font-black uppercase text-neutral-500 tracking-wider leading-none">{block.label}</span>
                                <span className="text-xl font-mono font-black text-white block mt-1 leading-none">{block.count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Asymmetric Error Incident Trace Viewer */}
            <div className="space-y-2">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-500 ml-1">
                    System Exception Tracking Stream Logs
                </label>

                {error && (
                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl flex items-center gap-3 text-xs font-medium">
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#111111]/40 flex flex-col h-[280px]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {isLoading && telemetry.recent_failures.length === 0 ? (
                            <div className="py-16 text-center font-mono text-xs text-neutral-500 flex flex-col items-center justify-center gap-2 opacity-60 h-full">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                                <span>COMPILING FAILING TASK REGISTERS...</span>
                            </div>
                        ) : telemetry.recent_failures.length > 0 ? (
                            telemetry.recent_failures.map((job) => (
                                <div key={job.id} className="p-3 bg-[#181818] border border-white/5 rounded-xl flex flex-col gap-1.5 select-text font-mono text-[11px]">
                                    <div className="flex justify-between items-baseline font-bold text-neutral-500">
                                        <span className="text-neutral-300 font-sans font-black truncate max-w-[200px]">{job.worker.split('.').pop()}</span>
                                        <span className={cn("text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border",
                                            job.state === "discarded" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>{job.state}</span>
                                    </div>
                                    <p className="text-neutral-400 font-sans font-medium text-xs break-words leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5 max-h-20 overflow-y-auto custom-scrollbar">
                                        {job.errors?.[0]?.["message"] || "Network handshake partition failure."}
                                    </p>
                                    <div className="text-[9px] font-bold text-neutral-600 flex justify-between select-none">
                                        <span>QUEUE: {job.queue.toUpperCase()}</span>
                                        <span className="font-sans">{new Date(job.attempted_at).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center font-mono text-xs text-neutral-600 select-none opacity-40 flex items-center justify-center h-full">
                                // NO_FAILING_WORKER_TASKS_STREAM_CLEAN...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
