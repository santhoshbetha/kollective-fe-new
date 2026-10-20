import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShieldAlert,
    ArrowUpCircle,
    History,
    Settings,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Shield,
    Cpu,
    Ban,
    Server,
    UserCheck,
    Gavel
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Virtuoso } from 'react-virtuoso';
import { useSocket } from '../../context/PhoenixSocketContext';
import { SystemConfigurationPanel } from './SystemConfigurationPanel';
import { SecurityBlacklistsPanel } from './SecurityBlacklistsPanel';
import { SovereignOperatorsPanel } from './SovereignOperatorsPanel';
import { InfrastructureCenter } from '../../features/moderation/components/InfrastructureCenter';
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

const ROOT_ADMIN_TABS = [
    { label: "Staff & Permissions", value: "Staff & Permissions", icon: UserCheck },
    { label: "Sovereign Mesh Operators", value: "Sovereign Mesh Operators", icon: Cpu },
    { label: "System Configuration", value: "System Configuration", icon: Settings },
    { label: "Security Blacklists", value: "Security Blacklists", icon: Ban },
    { label: "Mesh Infrastructure", value: "Mesh Infrastructure", icon: Server },
];

export const RootAdminDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryTab = searchParams.get('tab');
    const queryClient = useQueryClient();
    const [targetUsername, setTargetUsername] = useState("");
    const [activeTab, setActiveTab] = useState(queryTab || "Staff & Permissions");
    const [message, setMessage] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [popupStatus, setPopupStatus] = useState(null);
    const { latestGlobalLog } = useSocket();

    // Sync tab when searchParam changes
    useEffect(() => {
        if (queryTab && queryTab !== activeTab) {
            setActiveTab(queryTab);
        }
    }, [queryTab]);

    const handleTabChange = (tabValue) => {
        setActiveTab(tabValue);
        setSearchParams({ tab: tabValue });
        setMessage(null);
    };

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
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 p-4 sm:p-6 font-sans text-left bg-transparent text-neutral-800 dark:text-neutral-100 transition-colors antialiased">
            {/* Master Root Layout Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-2 select-none border-b border-neutral-200 dark:border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-primary-container mb-2">
                        <ShieldAlert className="w-5 h-5 text-primary-container stroke-[2.5px]" />
                        <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2.5 py-1 rounded-lg border border-primary-container/20">
                            Root Operator Clearance &amp; System Ledger
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                        Root Admin Desk
                    </h1>
                    <p className="text-base sm:text-lg font-medium text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed max-w-3xl">
                        Elevate profile privileges, enforce operational controls, and inspect real-time platform ledger telemetry within the centralized network matrix.
                    </p>
                </div>

                {/* Operations Desk Quick-Link Ribbon */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/moderation')}
                        className="flex items-center gap-2 px-5 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 text-sm font-mono font-bold uppercase tracking-wider rounded-2xl transition-all border border-neutral-200 dark:border-zinc-700 cursor-pointer outline-none active:scale-95 shadow-sm"
                        title="Open Operations &amp; Moderation Desk"
                    >
                        <Gavel className="w-4 h-4 text-primary-container" />
                        <span>Operations Desk</span>
                    </button>
                </div>
            </header>

            {/* Sub-navigation tabs selection pill strip */}
            <div className="flex flex-wrap bg-neutral-100 dark:bg-[#111111]/80 border border-neutral-200 dark:border-white/10 p-1.5 rounded-2xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider select-none shrink-0 gap-1.5 shadow-sm mb-8">
                {ROOT_ADMIN_TABS.map((tab) => {
                    const isActive = activeTab === tab.value;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => handleTabChange(tab.value)}
                            className={cn(
                                "px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer border-none outline-none text-xs sm:text-sm font-black uppercase tracking-wider active:scale-95",
                                isActive
                                    ? "bg-primary-container text-white shadow-md font-bold"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent"
                            )}
                        >
                            <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-neutral-400 dark:text-neutral-500")} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab 1: Staff & Permissions */}
            {activeTab === "Staff & Permissions" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Action Form Block - Left Column Side */}
                    <div className="lg:col-span-8 space-y-6">
                        <section className="bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 rounded-[32px] space-y-6 shadow-xl transition-colors">
                            <div className="flex items-center gap-3 border-b border-neutral-200/60 dark:border-white/5 pb-4 select-none">
                                <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                                    <ArrowUpCircle className="w-5 h-5 stroke-[2.5px]" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Elevate Profile Privileges</h2>
                                    <p className="text-xs sm:text-sm font-mono text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">Access Clearance Promotion</p>
                                </div>
                            </div>

                            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
                                Assign administrator or moderator clearance tags to active accounts. Promotions are logged instantly to the secure system ledger.
                            </p>

                            {message && (
                                <div className={cn(
                                    "p-4 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider rounded-2xl border flex items-center gap-3 animate-in zoom-in-95 select-none",
                                    message.type === "success"
                                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                                        : "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400"
                                )}>
                                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs sm:text-sm font-black font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block ml-1 select-none">
                                        Account Username
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 font-black font-mono text-lg select-none">@</span>
                                        <input
                                            type="text"
                                            placeholder="enter exact handle (e.g. alice_w)"
                                            value={targetUsername}
                                            disabled={promotionMutation.isPending}
                                            onChange={e => setTargetUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                                            className="w-full bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-white/10 py-4 pl-10 pr-4 text-neutral-900 dark:text-white rounded-2xl focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-mono font-bold text-base sm:text-lg disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-2 font-mono text-xs sm:text-sm uppercase font-black tracking-wider select-none">
                                    <button
                                        type="button"
                                        onClick={() => handleStaffPromotion("moderator")}
                                        disabled={promotionMutation.isPending || !targetUsername.trim()}
                                        className="flex-1 bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-900 dark:text-white px-6 py-4 rounded-2xl font-black transition-all cursor-pointer outline-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm"
                                    >
                                        {promotionMutation.isPending && promotionMutation.variables?.roleType === 'moderator' ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                                        ) : (
                                            <Shield className="w-4 h-4 text-primary-container" />
                                        )}
                                        <span>Grant Moderator</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStaffPromotion("admin")}
                                        disabled={promotionMutation.isPending || !targetUsername.trim()}
                                        className="flex-1 bg-primary-container text-white px-6 py-4 rounded-2xl font-black hover:brightness-105 transition-all outline-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-md border-none cursor-pointer"
                                    >
                                        {promotionMutation.isPending && promotionMutation.variables?.roleType === 'admin' ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        ) : (
                                            <ShieldAlert className="w-4 h-4 text-white" />
                                        )}
                                        <span>Grant Root Admin</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* System Audit Log Sidebar Container Block */}
                    <div className="lg:col-span-4">
                        <section className="bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-white/10 p-6 rounded-[32px] flex flex-col h-[600px] shadow-xl transition-colors">
                            {/* Sticky Dashboard Section Header Widget */}
                            <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-white/5 pb-4 mb-3 select-none shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                                        <History className="w-5 h-5 stroke-[2.5px]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                                            System Ledger
                                        </h2>
                                        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                                            Live Immutable Stream
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </span>
                            </div>

                            {/* 🚀 REAL-TIME SYSTEM LEDGER STREAM CONTAINER */}
                            <div className="flex-1 min-h-0 relative">
                                {isLogsLoading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-neutral-500 select-none font-mono text-sm font-black uppercase tracking-widest opacity-60">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary-container mb-3" />
                                        <span>Compiling ledger parameters...</span>
                                    </div>
                                ) : auditLogs.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 text-center select-none gap-2">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500 opacity-40 stroke-[1.5px]" />
                                        <p className="text-xs font-black uppercase tracking-widest font-mono opacity-60">Zero entries logged</p>
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

                                            const targetStr = String(log?.target_id ?? "");
                                            const targetMatch = targetStr.match(/@(.+)/);
                                            const targetUser = targetMatch ? targetMatch[1] : targetStr;

                                            const targetRole = log?.role || log?.metadata?.role || "user";
                                            const operatorHandle = log?.operator_name || "ROOT";

                                            return (
                                                <div className="border-b border-neutral-200/50 dark:border-white/5 last:border-none py-3.5 pr-2 text-sm leading-relaxed font-mono text-neutral-600 dark:text-neutral-300 font-semibold text-left animate-in fade-in duration-150">
                                                    <div className="flex justify-between items-center text-xs text-neutral-400 dark:text-neutral-500 font-bold mb-1.5 select-none">
                                                        <span className="text-primary-container font-black bg-primary-container/10 px-2 py-0.5 rounded">[{formattedTime}]</span>
                                                        <span className="bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded">Log #{log?.id || index + 1}</span>
                                                    </div>
                                                    <div className="text-neutral-900 dark:text-white/95 break-all text-xs sm:text-sm">
                                                        Operator <span className="font-black text-primary-container">#{operatorHandle}</span> executed{" "}
                                                        <span className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider text-[11px] px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">{log?.action || "ACCESS"}</span> on{" "}
                                                        <span className={cn(
                                                            "font-black font-mono",
                                                            targetRole === "admin" ? "text-red-500 dark:text-red-400" :
                                                                targetRole === "moderator" ? "text-primary-container" : "text-neutral-900 dark:text-white"
                                                        )}>
                                                            @{targetUser || "node"}
                                                        </span>
                                                        {targetRole && targetRole !== "user" && (
                                                            <span className={cn(
                                                                "ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono border select-none",
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

            {/* Tab 2: Sovereign Mesh Operators */}
            {activeTab === "Sovereign Mesh Operators" && (
                <SovereignOperatorsPanel />
            )}

            {/* Tab 3: System Configuration */}
            {activeTab === "System Configuration" && (
                <div className="bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 rounded-[32px] shadow-xl animate-in zoom-in-95 duration-150 transition-colors space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/60 dark:border-white/5 pb-5 select-none">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                                <Settings className="w-5 h-5 stroke-[2.5px]" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                                    System Configurator
                                </h2>
                                <p className="text-sm sm:text-base font-medium text-neutral-500 dark:text-neutral-400">
                                    Global feature flags, mesh network routing tables, and rate-limiting throttling caps.
                                </p>
                            </div>
                        </div>
                    </div>
                    <SystemConfigurationPanel
                        onCommandStart={handleCommandStart}
                        onCommandComplete={handleCommandComplete}
                    />
                </div>
            )}

            {/* Tab 4: Security Blacklists */}
            {activeTab === "Security Blacklists" && (
                <SecurityBlacklistsPanel
                    onCommandStart={handleCommandStart}
                    onCommandComplete={handleCommandComplete}
                />
            )}

            {/* Tab 5: Mesh Infrastructure */}
            {activeTab === "Mesh Infrastructure" && (
                <div className="bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-white/10 p-4 sm:p-6 rounded-[32px] shadow-xl">
                    <InfrastructureCenter />
                </div>
            )}

            {/* ⏳ COMMAND STATUS LOADER OVERLAY */}
            {(promotionMutation.isPending || !!loadingMessage) && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none">
                    <div className="bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-white/10 p-8 rounded-[32px] shadow-2xl max-w-md w-full text-center space-y-5 font-sans">
                        <div className="w-16 h-16 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mx-auto text-primary-container shadow-md">
                            <Loader2 className="w-8 h-8 animate-spin stroke-[2.5px]" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                                Executing Command...
                            </h3>
                            <p className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                Transmitting Payload to Backend
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/60 dark:border-white/5 text-sm font-medium leading-relaxed font-mono text-neutral-600 dark:text-neutral-300">
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
                        "bg-white dark:bg-[#141414] border p-6 sm:p-8 rounded-[32px] shadow-2xl max-w-md w-full text-center space-y-6 font-sans",
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
                                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                                    {popupStatus.title || "Backend Command Status"}
                                </h3>
                                <span className={cn(
                                    "inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-black uppercase tracking-widest border",
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
                                    <span className="text-neutral-500 dark:text-neutral-400 font-bold">Target Vector:</span>
                                    <span className="font-bold text-neutral-900 dark:text-white">{popupStatus.target}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setPopupStatus(null)}
                            className={cn(
                                "w-full py-4 px-6 font-mono text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer outline-none active:scale-95 text-white border-none shadow-lg",
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

