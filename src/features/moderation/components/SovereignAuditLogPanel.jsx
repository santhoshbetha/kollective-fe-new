// src/features/moderation/components/SovereignAuditLogPanel.jsx
import React from 'react';
import { useAdminAuditLogs } from '../hooks/useAdminAuditLogs';
import { Terminal, Shield, RefreshCw, ClipboardList, Filter, Loader2, AlertTriangle, KeyRound } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function SovereignAuditLogPanel() {
    const { logs, currentNode, selectedAction, setSelectedAction, isLoading, error, refreshLogs } = useAdminAuditLogs();

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 p-6 bg-[#141414] border border-white/5 rounded-[28px] shadow-2xl font-sans text-left text-neutral-200 select-none animate-in fade-in duration-200">

            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary-container/10 border border-primary-container/20 rounded-xl text-primary-container shrink-0">
                        <ClipboardList className="w-4 h-4 stroke-[2.5px]" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight">Sovereign Audit Ledger</h3>
                        <p className="text-[11px] font-medium text-neutral-400 mt-0.5 leading-none">
                            Immutable, local node operational record trail for administrative transparency [INDEX].
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] font-black text-neutral-400 bg-[#181818] px-3 py-1.5 border border-white/10 rounded-xl">
                    <Terminal className="w-3.5 h-3.5 text-primary-container shrink-0" />
                    <span>HOST: {currentNode}</span>
                </div>
            </div>

            {/* Filter Selection Input Toolbar Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#111111]/40 border border-white/5 rounded-2xl select-none">
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-sans font-medium px-1">
                    <Filter className="w-3.5 h-3.5 text-neutral-500 stroke-[2.5px]" />
                    <span>Filter Actions Matrix:</span>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="bg-[#181818] border border-white/10 py-1.5 px-3 rounded-xl font-mono text-[10px] font-black uppercase text-white outline-none focus:border-primary-container appearance-none cursor-pointer text-center min-w-[160px]"
                    >
                        <option value="">ALL OPERATIONS</option>
                        <option value="dismiss">DISMISS_FLAG</option>
                        <option value="soft_delete">SOFT_DELETE</option>
                        <option value="hard_ban">SOVEREIGN_BAN</option>
                        <option value="grant_clearance">GRANT_CLEARANCE</option>
                        <option value="force_recovery">PARTITION_HEAL</option>
                    </select>

                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={refreshLogs}
                        className="p-2 bg-[#181818] border border-white/10 text-neutral-400 hover:text-white rounded-xl cursor-pointer outline-none transition-all flex items-center justify-center disabled:opacity-40"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5 stroke-[2.5px]", isLoading && "animate-spin text-primary-container")} />
                    </button>
                </div>
            </div>

            {/* Timeline Stream Log Feed Display Grid */}
            <div className="space-y-2">
                {error && (
                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl flex items-center gap-3 text-xs font-medium animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#111111]/40 flex flex-col h-[350px]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                        {isLoading && logs.length === 0 ? (
                            <div className="py-24 text-center font-mono text-xs text-neutral-500 flex flex-col items-center justify-center gap-2 opacity-60 h-full">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                                <span>UNPACKING SYSTEM AUDIT LEDGERS...</span>
                            </div>
                        ) : logs.length > 0 ? (
                            logs.map((log) => {
                                const isSecurityAction = log.action === "grant_clearance" || log.action === "hard_ban";
                                return (
                                    <div key={log.id} className="p-3 bg-[#181818] border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left font-mono text-[11px] animate-in fade-in duration-100">
                                        <div className="min-w-0 flex items-start sm:items-center gap-2.5">
                                            <div className={cn(
                                                "p-1.5 rounded-lg border shrink-0 mt-0.5 sm:mt-0",
                                                isSecurityAction
                                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                    : "bg-white/5 text-neutral-400 border-white/5"
                                            )}>
                                                {isSecurityAction ? <KeyRound className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                            </div>

                                            <div className="min-w-0 font-sans text-xs">
                                                <p className="text-white font-medium">
                                                    <span className="font-mono text-[11px] font-black text-primary-container mr-1">@{log.actor_username}</span>
                                                    <span>executed </span>
                                                    <span className="font-mono text-[10px] font-black uppercase bg-black/30 border border-white/5 px-1.5 py-0.2 rounded text-neutral-300 mx-1">{log.action}</span>
                                                    {log.target_identifier && (
                                                        <>
                                                            <span>on target </span>
                                                            <span className="font-mono text-[11px] font-bold text-neutral-400">({log.target_identifier})</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col items-end justify-between font-mono text-[9px] font-bold text-neutral-500 shrink-0 border-t border-white/5 sm:border-none pt-1.5 sm:pt-0">
                                            <span className="bg-black/20 px-1.5 py-0.5 rounded border border-white/5 tracking-wide text-neutral-400 select-none">NODE: {log.node_name.split('@').shift()}</span>
                                            <span className="font-sans font-medium text-neutral-600 mt-1 select-none">{new Date(log.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-24 text-center font-mono text-xs text-neutral-600 select-none opacity-40 flex items-center justify-center h-full">
                                // NO_SOVEREIGN_OPERATIONAL_LOGS_RECORDED...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
