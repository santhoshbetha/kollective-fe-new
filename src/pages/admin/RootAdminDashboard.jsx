import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, ArrowUpCircle, History, Settings, Ban, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Virtuoso } from 'react-virtuoso';
import { useSocket } from '../../context/PhoenixSocketContext';
import { SystemConfigurationPanel } from './SystemConfigurationPanel';
import { SecurityBlacklistsPanel } from './SecurityBlacklistsPanel';
import { apiFetch } from '../../api/apiClient';
import { toast } from 'sonner';

// Mock API client fetchers; substitute with your exact axios/apiFetch instance routing lines
const fetchAuditLogs = async () => {
    const res = await apiFetch('/api/v1/admin/root/audit_logs');
    return res?.data || res || [];
};

const executePromotion = async ({ username, roleType }) => {
    const endpoint = roleType === "admin"
        ? "/api/v1/admin/root/users/promote_admin"
        : "/api/v1/admin/root/users/promote_moderator";

    const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ username })
    });
    return res;
};

export const RootAdminDashboard = () => {
    const queryClient = useQueryClient();
    const [targetUsername, setTargetUsername] = useState("");
    const [activeTab, setActiveTab] = useState("Staff & Permissions");
    const [message, setMessage] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [popupStatus, setPopupStatus] = useState(null);
    const { latestGlobalLog } = useSocket();

    // 📡 TANSTACK QUERY HYDRATION: Manages automated background caching and state syncing
    const { data: auditLogs = [], isLoading: isLogsLoading } = useQuery({
        queryKey: ['admin', 'root', 'audit-logs'],
        queryFn: fetchAuditLogs,
        staleTime: 30000,
        refetchOnWindowFocus: false
    });

    const handleCommandStart = (msg) => {
        setLoadingMessage(msg || "Transmitting command to backend...");
    };

    const handleCommandComplete = (status) => {
        setLoadingMessage("");
        setPopupStatus({
            isOpen: true,
            ...status
        });
        if (status.type === 'success') {
            toast.success(status.message);
        } else {
            toast.error(status.message);
        }
    };

    // 🚀 ATOMIC MUTATION INTERCEPTOR: Drives clean, non-blocking asynchronous user promotions
    const promotionMutation = useMutation({
        mutationFn: executePromotion,
        onSuccess: (data, variables) => {
            setLoadingMessage("");
            const roleLabel = variables.roleType === "admin" ? "Root Admin" : "Moderator";
            const successMsg = data?.message || `Privilege vector (${roleLabel}) assigned successfully to @${variables.username}.`;

            setMessage({ type: "success", text: successMsg });
            setPopupStatus({
                isOpen: true,
                type: "success",
                title: "Command Executed Successfully",
                message: successMsg,
                target: `@${variables.username}`,
                role: roleLabel
            });
            setTargetUsername("");
            queryClient.invalidateQueries({ queryKey: ['admin', 'root', 'audit-logs'] });
            toast.success(successMsg);
        },
        onError: (err, variables) => {
            setLoadingMessage("");
            const roleLabel = variables.roleType === "admin" ? "Root Admin" : "Moderator";
            const errorMsg = err?.message || "Operation failed inside context.";

            setMessage({ type: "error", text: errorMsg });
            setPopupStatus({
                isOpen: true,
                type: "error",
                title: "Command Execution Failed",
                message: errorMsg,
                target: `@${variables.username}`,
                role: roleLabel
            });
            toast.error(errorMsg);
        }
    });

    const handleStaffPromotion = (roleType) => {
        if (!targetUsername.trim()) return;
        setMessage(null);
        const roleLabel = roleType === "admin" ? "Root Admin" : "Moderator";
        handleCommandStart(`Granting ${roleLabel} privileges to @${targetUsername.trim()}... Transmitting command to backend.`);
        promotionMutation.mutate({ username: targetUsername.trim(), roleType });
    };

    useEffect(() => {
        if (latestGlobalLog && latestGlobalLog.id) {
            // Append incoming logs straight into TanStack Query Cache layers instantly
            queryClient.setQueryData(['admin', 'root', 'audit-logs'], (oldLogs) => {
                if (!Array.isArray(oldLogs)) return [latestGlobalLog];
                if (oldLogs.some(log => log.id === latestGlobalLog.id)) return oldLogs;
                return [latestGlobalLog, ...oldLogs];
            });
        }
    }, [latestGlobalLog, queryClient]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 font-sans text-left animate-in fade-in duration-200">
            {/* Master Root Layout Header */}
            <header className="mb-8 select-none">
                <div className="flex items-center gap-2 text-primary-container mb-2">
                    <ShieldAlert className="w-8 h-8 stroke-[2.5px]" />
                    <span className="text-[14px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 border border-primary-container/20 rounded">
                        Root Operator Layer
                    </span>
                </div>
                <h1 className="text-3xl font-black text-text-primary dark:text-white tracking-tight mb-1">Root Admin Desk</h1>
                <p className="text-lg text-text-secondary font-medium leading-relaxed">
                    Elevate profile privileges and view immutable platform audit trails within the centralized network matrix.
                </p>
            </header>

            {/* Sub-navigation tabs selection strip */}
            <div className="flex flex-col lg:flex-row gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-black/10 dark:border-white/5 mb-8 font-mono select-none">
                {["Staff & Permissions", "System Configuration", "Security Blacklists"].map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setMessage(null); }}
                            className={cn(
                                "px-5 py-2 transition-all duration-150 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-wider border cursor-pointer outline-none active:scale-95",
                                isActive
                                    ? 'bg-primary-container text-white border-primary-container shadow-md'
                                    : 'bg-black/[0.02] dark:bg-white/[0.02] text-text-secondary border-black/10 dark:border-white/5 hover:border-black/20 dark:hover:border-white/10 hover:text-text-primary dark:hover:text-white'
                            )}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>
            {activeTab === "Staff & Permissions" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Action Form Block - Left Column Side */}
                    <div className="lg:col-span-8 space-y-6">
                        <section className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 p-6 sm:p-8 rounded-[24px] space-y-6 shadow-xl transition-colors">
                            <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4 select-none">
                                <ArrowUpCircle className="w-5 h-5 text-primary-container stroke-[2.5px]" />
                                <h2 className="text-xl font-black text-text-primary dark:text-white tracking-tight">Elevate Profile Privileges</h2>
                            </div>

                            <p className="text-lg text-text-secondary font-medium leading-relaxed">
                                Assign administrator or moderator clearance tags to active accounts. Promotions are logged instantly to the secure system ledger.
                            </p>

                            {message && (
                                <div className={cn(
                                    "p-4 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border flex items-center gap-2.5 animate-in zoom-in-95 select-none",
                                    message.type === "success"
                                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                        : "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
                                )}>
                                    {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-lg font-black text-text-secondary uppercase tracking-widest block ml-1 select-none">
                                        Account Username
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-black font-mono select-none">@</span>
                                        <input
                                            type="text"
                                            placeholder="enter exact handle (e.g. alice_w)"
                                            value={targetUsername}
                                            disabled={promotionMutation.isPending}
                                            onChange={e => setTargetUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                                            className="w-full bg-black/[0.01] dark:bg-[#111111] border border-black/10 dark:border-white/5 py-3.5 pl-9 pr-4 text-text-primary dark:text-white rounded-xl focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-all placeholder:text-text-secondary/30 font-mono font-bold text-base disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-2 font-mono text-xs uppercase font-bold tracking-wider select-none">
                                    <button
                                        type="button"
                                        onClick={() => handleStaffPromotion("moderator")}
                                        disabled={promotionMutation.isPending || !targetUsername.trim()}
                                        className="flex-1 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/5 hover:bg-black/[0.05] dark:hover:bg-white/10 text-text-primary dark:text-white px-6 py-3.5 rounded-xl font-black transition-all cursor-pointer outline-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {promotionMutation.isPending && promotionMutation.variables?.roleType === 'moderator' && (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-container" />
                                        )}
                                        <span>Grant Moderator</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStaffPromotion("admin")}
                                        disabled={promotionMutation.isPending || !targetUsername.trim()}
                                        className="flex-1 bg-primary-container text-white px-6 py-3.5 rounded-xl font-black hover:brightness-105 transition-all outline-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {promotionMutation.isPending && promotionMutation.variables?.roleType === 'admin' && (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                        )}
                                        <span>Grant Root Admin</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                    {/* System Audit Log Block - Right Column Sidebar Panel */}
                    <div className="lg:col-span-4" hidden>
                        <section className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 p-5 rounded-[24px] flex flex-col h-[520px] shadow-xl transition-colors">
                            <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4 mb-4 select-none">
                                <History className="w-5 h-5 text-primary-container stroke-[2.5px]" />
                                <h2 className="text-base font-black text-text-primary dark:text-white tracking-tight">
                                    System Ledger
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                {isLogsLoading ? (
                                    <div className="py-24 text-center text-text-secondary select-none font-mono text-[14px] font-black uppercase tracking-widest flex flex-col items-center gap-3 opacity-60">
                                        <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                                        <span>Compiling ledger parameters...</span>
                                    </div>
                                ) : auditLogs.length > 0 ? (
                                    auditLogs.map((log, index) => {
                                        const formattedTime = log.inserted_at
                                            ? new Date(log.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                            : "00:00:00";

                                        // Extract username and role from target_id safely
                                        const targetStr = String(log?.target_id ?? "");
                                        const targetMatch = targetStr.match(/@(.+)/);
                                        const targetUser = targetMatch ? targetMatch[1] : targetStr;
                                        const targetRole = log?.role || "user";

                                        return (
                                            <div key={log.id || `audit-row-${index}`} className="border-b border-black/5 dark:border-white/5 last:border-none pb-3 text-md leading-relaxed font-mono text-text-secondary font-semibold text-left animate-in fade-in duration-150">
                                                <div className="flex justify-between text-[14px] text-text-secondary/50 font-bold mb-1 select-none">
                                                    <span className="text-primary-container font-black">[{formattedTime}]</span>
                                                    <span>Log #{log.id || index + 1}</span>
                                                </div>
                                                <div className="text-text-primary dark:text-white/90 break-all">
                                                    Operator <span className="font-black text-primary-container">#ROOT</span> executed{" "}
                                                    <span className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider text-[11px]">{log.action || "ACCESS"}</span> on{" "}
                                                    <span className={`font-black font-mono ${targetRole === "admin" ? "text-red-500 dark:text-red-400" :
                                                        targetRole === "moderator"
                                                            ? "text-primary-container"
                                                            : "text-text-primary"
                                                        }`}>
                                                        @{targetUser || "node"}
                                                    </span>
                                                    {targetRole && targetRole !== "user" && (
                                                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono border ${targetRole === "admin"
                                                            ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                                                            : "bg-primary-container/10 border-primary-container/20 text-primary-container"
                                                            }`}>
                                                            {targetRole}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-text-secondary text-center py-24 flex flex-col items-center gap-2 select-none">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-40 stroke-[1.5px]" />
                                        <p className="text-[10px] font-black uppercase tracking-widest font-mono opacity-40">Zero entries logged</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* System Audit Log Sidebar Container Block */}
                    <div className="lg:col-span-4">
                        <section className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 p-5 rounded-[24px] flex flex-col h-[520px] shadow-xl transition-colors">
                            {/* Sticky Dashboard Section Header Widget */}
                            <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4 mb-2 select-none shrink-0">
                                <History className="w-5 h-5 text-primary-container stroke-[2.5px]" />
                                <h2 className="text-base font-black text-text-primary dark:text-white tracking-tight">
                                    System Ledger
                                </h2>
                            </div>

                            {/* 🚀 REAL-TIME SYSTEM LEDGER STREAM CONTAINER */}
                            <div className="flex-1 min-h-0 relative">
                                {isLogsLoading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-text-secondary select-none font-mono text-[14px] font-black uppercase tracking-widest opacity-60">
                                        <Loader2 className="w-5 h-5 animate-spin text-primary-container mb-3" />
                                        <span>Compiling ledger parameters...</span>
                                    </div>
                                ) : auditLogs.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary text-center select-none gap-2">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-40 stroke-[1.5px]" />
                                        <p className="text-[10px] font-black uppercase tracking-widest font-mono opacity-40">Zero entries logged</p>
                                    </div>
                                ) : (
                                    /* 🏆 VIRTUALIZED PERFORMANCE SCROLL VIEW ENGINE */
                                    <Virtuoso
                                        style={{ height: '100%' }}
                                        data={auditLogs}
                                        computeItemKey={(index, log) => log?.id || `ledger-row-${index}`}
                                        increaseViewportBy={200}
                                        overscan={100}
                                        className="custom-scrollbar"
                                        itemContent={(index, log) => {
                                            const formattedTime = log?.inserted_at
                                                ? new Date(log.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : "00:00:00";

                                            // Extract username and role from target_id safely matching your design constraints
                                            const targetStr = String(log?.target_id ?? "");
                                            const targetMatch = targetStr.match(/@(.+)/);
                                            const targetUser = targetMatch ? targetMatch[1] : targetStr;

                                            // Handle fallback check matrices if payload parses target metadata fields dynamically
                                            const targetRole = log?.role || log?.metadata?.role || "user";
                                            const operatorHandle = log?.operator_name || "ROOT";

                                            return (
                                                <div className="border-b border-black/5 dark:border-white/5 last:border-none py-3.5 pr-2 text-md leading-relaxed font-mono text-text-secondary font-semibold text-left animate-in fade-in duration-150">
                                                    <div className="flex justify-between text-[14px] text-text-secondary/50 font-bold mb-1 select-none">
                                                        <span className="text-primary-container font-black">[{formattedTime}]</span>
                                                        <span>Log #{log?.id || index + 1}</span>
                                                    </div>
                                                    <div className="text-text-primary dark:text-white/90 break-all">
                                                        Operator <span className="font-black text-primary-container">#{operatorHandle}</span> executed{" "}
                                                        <span className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider text-[11px]">{log?.action || "ACCESS"}</span> on{" "}
                                                        <span className={cn(
                                                            "font-black font-mono",
                                                            targetRole === "admin" ? "text-red-500 dark:text-red-400" :
                                                                targetRole === "moderator" ? "text-primary-container" : "text-text-primary dark:text-white"
                                                        )}>
                                                            @{targetUser || "node"}
                                                        </span>
                                                        {targetRole && targetRole !== "user" && (
                                                            <span className={cn(
                                                                "ml-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono border select-none",
                                                                targetRole === "admin"
                                                                    ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                                                                    : "bg-primary-container/10 border-primary-container/20 text-primary-container"
                                                            )}>
                                                                {targetRole}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                )}
                            </div>
                        </section>
                    </div>

                </div>
            )}

            {activeTab === "System Configuration" && (
                <section className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 p-12 text-center rounded-[24px] shadow-xl select-none animate-in zoom-in-95 duration-150 transition-colors">
                    <Settings className="w-12 h-12 text-text-secondary/40 mx-auto mb-4 stroke-[1.25px]" />
                    <h3 className="font-black text-text-primary dark:text-white text-lg mb-1 tracking-tight">
                        System Configurator
                    </h3>
                    <p className="text-text-secondary text-sm font-medium max-w-sm mx-auto leading-relaxed mb-6">
                        Global feature flags, mesh network routing tables, and rate-limiting throttling caps are currently undergoing synchronization.
                    </p>
                    <SystemConfigurationPanel
                        onCommandStart={handleCommandStart}
                        onCommandComplete={handleCommandComplete}
                    />
                </section>

            )}

            {activeTab === "Security Blacklists" && (
                <SecurityBlacklistsPanel
                    onCommandStart={handleCommandStart}
                    onCommandComplete={handleCommandComplete}
                />
            )}

            {/* ⏳ COMMAND STATUS LOADER OVERLAY */}
            {(promotionMutation.isPending || !!loadingMessage) && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none">
                    <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-4 font-sans">
                        <div className="w-16 h-16 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mx-auto text-primary-container">
                            <Loader2 className="w-8 h-8 animate-spin stroke-[2.5px]" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-xl font-black text-text-primary dark:text-white tracking-tight">
                                Executing Command...
                            </h3>
                            <p className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                                Transmitting Payload to Backend
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-sm font-medium leading-relaxed font-mono text-text-secondary dark:text-neutral-300">
                            {loadingMessage || "Processing operational command request..."}
                        </div>
                        <div className="pt-1">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container font-mono text-xs font-bold uppercase rounded-full animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-primary-container" />
                                Awaiting Backend Response
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 📣 POPUP STATUS MESSAGE MODAL AFTER BACKEND COMMAND COMPLETION */}
            {popupStatus?.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200 select-none">
                    <div className={cn(
                        "bg-white dark:bg-[#141414] border p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-5 font-sans",
                        popupStatus.type === "success" ? "border-emerald-500/30" : "border-rose-500/30"
                    )}>
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg",
                                popupStatus.type === "success"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                            )}>
                                {popupStatus.type === "success" ? (
                                    <CheckCircle2 className="w-10 h-10 stroke-[2.5px]" />
                                ) : (
                                    <AlertCircle className="w-10 h-10 stroke-[2.5px]" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-text-primary dark:text-white tracking-tight">
                                    {popupStatus.title || "Backend Command Status"}
                                </h3>
                                <span className={cn(
                                    "inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-widest border",
                                    popupStatus.type === "success"
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                                )}>
                                    {popupStatus.type === "success" ? "STATUS: SUCCESS_200" : "STATUS: REJECTED_ERROR"}
                                </span>
                            </div>
                        </div>

                        <div className={cn(
                            "p-4 rounded-2xl border text-sm font-medium leading-relaxed font-mono text-left",
                            popupStatus.type === "success"
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-300"
                        )}>
                            <p>{popupStatus.message}</p>
                            {popupStatus.target && (
                                <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 text-xs flex justify-between items-center">
                                    <span className="text-text-secondary font-bold">Target Vector:</span>
                                    <span className="font-bold text-text-primary dark:text-white">{popupStatus.target}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setPopupStatus(null)}
                            className={cn(
                                "w-full py-3.5 px-6 font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer outline-none active:scale-95 text-white border-none shadow-lg",
                                popupStatus.type === "success"
                                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                                    : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                            )}
                        >
                            Acknowledge &amp; Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RootAdminDashboard;
