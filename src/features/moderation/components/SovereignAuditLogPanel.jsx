import { useAdminAuditLogs } from '../hooks/useAdminAuditLogs';
import { Terminal, Shield, RefreshCw, ClipboardList, Filter, Loader2, AlertTriangle, KeyRound } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function SovereignAuditLogPanel() {
    const { logs, currentNode, selectedAction, setSelectedAction, isLoading, error, refreshLogs } = useAdminAuditLogs();

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 p-6 sm:p-8 bg-[#141414] border border-white/5 rounded-[32px] shadow-2xl font-sans text-left text-neutral-200 select-none animate-in fade-in duration-200">

            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
                <div className="flex items-center gap-3.5">
                    <div className="p-3.5 bg-primary-container/10 border border-primary-container/20 rounded-2xl text-primary-container shrink-0 shadow-sm">
                        <ClipboardList className="w-6 h-6 stroke-[2.5px]" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Sovereign Audit Ledger</h3>
                        <p className="text-sm sm:text-base font-medium text-neutral-400 mt-1 leading-relaxed">
                            Immutable, local node operational record trail for administrative transparency.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs sm:text-sm font-black text-neutral-300 bg-[#181818] px-4 py-2 border border-white/10 rounded-2xl shadow-sm self-start sm:self-auto">
                    <Terminal className="w-4 h-4 text-primary-container shrink-0" />
                    <span>HOST: {currentNode}</span>
                </div>
            </div>

            {/* Filter Selection Input Toolbar Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-5 bg-[#111111]/60 border border-white/5 rounded-3xl select-none">
                <div className="flex items-center gap-2.5 text-sm sm:text-base text-neutral-300 font-sans font-medium px-1">
                    <Filter className="w-4 h-4 text-neutral-400 stroke-[2.5px]" />
                    <span>Filter Actions Matrix:</span>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="bg-[#181818] border border-white/10 py-2.5 px-4 rounded-xl font-mono text-xs sm:text-sm font-black uppercase text-white outline-none focus:border-primary-container appearance-none cursor-pointer text-center min-w-[200px] shadow-sm"
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
                        className="p-3 bg-[#181818] border border-white/10 text-neutral-400 hover:text-white rounded-xl cursor-pointer outline-none transition-all flex items-center justify-center disabled:opacity-40 hover:border-white/20"
                        title="Refresh Audit Logs"
                    >
                        <RefreshCw className={cn("w-4 h-4 stroke-[2.5px]", isLoading && "animate-spin text-primary-container")} />
                    </button>
                </div>
            </div>

            {/* Timeline Stream Log Feed Display Grid */}
            <div className="space-y-4">
                {error && (
                    <div className="p-5 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-2xl flex items-center gap-3.5 text-sm font-medium animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="border border-white/5 rounded-3xl overflow-hidden bg-[#111111]/40 flex flex-col h-[460px]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3">
                        {isLoading && logs.length === 0 ? (
                            <div className="py-24 text-center font-mono text-sm text-neutral-500 flex flex-col items-center justify-center gap-3 opacity-60 h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                                <span>UNPACKING SYSTEM AUDIT LEDGERS...</span>
                            </div>
                        ) : logs.length > 0 ? (
                            logs.map((log) => {
                                const isSecurityAction = log.action === "grant_clearance" || log.action === "hard_ban";
                                return (
                                    <div key={log.id} className="p-5 sm:p-6 bg-[#181818] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left font-mono text-xs sm:text-sm animate-in fade-in duration-100 shadow-sm">
                                        <div className="min-w-0 flex items-start sm:items-center gap-3.5">
                                            <div className={cn(
                                                "p-2.5 rounded-xl border shrink-0 mt-0.5 sm:mt-0",
                                                isSecurityAction
                                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                    : "bg-white/5 text-neutral-400 border-white/5"
                                            )}>
                                                {isSecurityAction ? <KeyRound className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                            </div>

                                            <div className="min-w-0 font-sans text-sm sm:text-base">
                                                <p className="text-white font-medium leading-relaxed">
                                                    <span className="font-mono text-sm sm:text-base font-black text-primary-container mr-1.5">@{log.actor_username}</span>
                                                    <span>executed </span>
                                                    <span className="font-mono text-xs sm:text-sm font-black uppercase bg-black/40 border border-white/10 px-2.5 py-0.5 rounded-md text-neutral-200 mx-1.5 shadow-xs">{log.action}</span>
                                                    {log.target_identifier && (
                                                        <>
                                                            <span>on target </span>
                                                            <span className="font-mono text-xs sm:text-sm font-bold text-neutral-300">({log.target_identifier})</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col items-end justify-between font-mono text-xs font-bold text-neutral-400 shrink-0 border-t border-white/5 sm:border-none pt-2 sm:pt-0 gap-1">
                                            <span className="bg-black/30 px-2.5 py-1 rounded-lg border border-white/5 tracking-wide text-neutral-300 select-none">NODE: {log.node_name.split('@').shift()}</span>
                                            <span className="font-sans font-medium text-neutral-400 select-none">{new Date(log.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-24 text-center font-mono text-sm text-neutral-500 select-none opacity-40 flex items-center justify-center h-full">
                                // NO_SOVEREIGN_OPERATIONAL_LOGS_RECORDED...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
