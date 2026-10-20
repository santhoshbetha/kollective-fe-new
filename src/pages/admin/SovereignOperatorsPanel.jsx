import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Server,
    Shield,
    Terminal,
    Copy,
    Check,
    RefreshCw,
    Trash2,
    Key,
    Globe,
    Cpu,
    UserPlus,
    Loader2,
    AlertCircle,
    CheckCircle2,
    X,
    ExternalLink
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const fetchTopology = async () => {
    const res = await apiFetch('/api/v1/admin/mesh/topology');
    return res?.data || res || { cluster_size: 1, nodes: [] };
};

const fetchOperators = async () => {
    const res = await apiFetch('/api/v1/admin/sovereign_operators');
    return res?.data || res || [];
};

const authorizeOperator = async ({ username, role }) => {
    const res = await apiFetch('/api/v1/admin/sovereign_operators', {
        method: 'POST',
        body: JSON.stringify({
            operator: { username, role }
        })
    });
    return res;
};

const revokeOperator = async (username) => {
    const res = await apiFetch(`/api/v1/admin/sovereign_operators/${username}`, {
        method: 'DELETE'
    });
    return res;
};

const fetchProvisionConfig = async (username) => {
    const res = await apiFetch(`/api/v1/admin/sovereign_operators/${username}/provision_config`);
    return res?.data || res;
};

const triggerNodeRecovery = async (nodeName) => {
    const res = await apiFetch('/api/v1/admin/mesh/force_recovery', {
        method: 'POST',
        body: JSON.stringify({ node_name: nodeName })
    });
    return res;
};

export const SovereignOperatorsPanel = () => {
    const queryClient = useQueryClient();
    const [targetUsername, setTargetUsername] = useState('');
    const [targetRole, setTargetRole] = useState('moderator');
    const [provisionModal, setProvisionModal] = useState({ isOpen: false, data: null, isLoading: false });
    const [copiedKey, setCopiedKey] = useState(null);

    // 1️⃣ Live Mesh Topology Query
    const {
        data: topologyData,
        isLoading: isTopologyLoading,
        refetch: refetchTopology,
        isFetching: isTopologyFetching
    } = useQuery({
        queryKey: ['admin', 'mesh', 'topology'],
        queryFn: fetchTopology,
        refetchInterval: 15000,
        staleTime: 10000
    });

    // 2️⃣ Authorized Sovereign Operators Query
    const {
        data: operators = [],
        isLoading: isOperatorsLoading,
        refetch: refetchOperators
    } = useQuery({
        queryKey: ['admin', 'sovereign-operators'],
        queryFn: fetchOperators,
        staleTime: 30000
    });

    // 3️⃣ Authorize Operator Mutation
    const authorizeMutation = useMutation({
        mutationFn: authorizeOperator,
        onSuccess: async (_, variables) => {
            const cleanUser = variables.username.trim().toLowerCase();
            toast.success(`Operator @${cleanUser} successfully authorized in sovereign matrix!`);
            setTargetUsername('');
            queryClient.invalidateQueries({ queryKey: ['admin', 'sovereign-operators'] });

            // Automatically open server provisioning modal with credentials
            handleOpenProvision(cleanUser);
        },
        onError: (err) => {
            toast.error(err?.message || 'Failed to authorize operator');
        }
    });

    // 4️⃣ Revoke Operator Mutation
    const revokeMutation = useMutation({
        mutationFn: revokeOperator,
        onSuccess: (_, username) => {
            toast.success(`Clearance for @${username} purged from Mnesia and SQL.`);
            queryClient.invalidateQueries({ queryKey: ['admin', 'sovereign-operators'] });
        },
        onError: (err) => {
            toast.error(err?.message || 'Failed to revoke operator');
        }
    });

    // 5️⃣ Node Recovery Mutation
    const recoveryMutation = useMutation({
        mutationFn: triggerNodeRecovery,
        onSuccess: () => {
            toast.success('Partition recovery pulse broadcast across cluster.');
            queryClient.invalidateQueries({ queryKey: ['admin', 'mesh', 'topology'] });
        },
        onError: (err) => {
            toast.error(err?.message || 'Node refused recovery handshake');
        }
    });

    const handleAuthorize = (e) => {
        e.preventDefault();
        if (!targetUsername.trim()) return;
        authorizeMutation.mutate({ username: targetUsername.trim(), role: targetRole });
    };

    const handleOpenProvision = async (username) => {
        setProvisionModal({ isOpen: true, data: null, isLoading: true });
        try {
            const data = await fetchProvisionConfig(username);
            setProvisionModal({ isOpen: true, data, isLoading: false });
        } catch (err) {
            toast.error(err?.message || 'Could not fetch provisioning profile');
            setProvisionModal({ isOpen: false, data: null, isLoading: false });
        }
    };

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success('Copied configuration to clipboard!');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const nodesList = topologyData?.nodes || [];
    const clusterSize = topologyData?.cluster_size || nodesList.length || 1;

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* 🌐 SECTION 1: Active Decentralized Mesh Cluster Topology */}
            <section className="bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 rounded-[32px] shadow-xl transition-colors space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/60 dark:border-white/5 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                            <Cpu className="w-5 h-5 stroke-[2.5px]" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
                                Decentralized Server Mesh
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                                    {clusterSize} {clusterSize === 1 ? 'Node' : 'Nodes'} Online
                                </span>
                            </h2>
                            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium">
                                Real-time distributed Erlang node telemetry and Mnesia replication matrix.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => refetchTopology()}
                        disabled={isTopologyFetching}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-mono font-black uppercase tracking-wider bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-900 dark:text-white transition-all outline-none cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm"
                    >
                        <RefreshCw className={cn("w-4 h-4", isTopologyFetching && "animate-spin text-primary-container")} />
                        <span>Rescan Topology</span>
                    </button>
                </div>

                {/* Nodes Grid */}
                {isTopologyLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-sm font-bold uppercase tracking-widest opacity-60">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                        <span>Discovering mesh nodes...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {nodesList.map((node, index) => {
                            const isLocal = node.is_local;
                            return (
                                <div
                                    key={node.node_name || index}
                                    className={cn(
                                        "p-5 rounded-2xl border transition-all relative overflow-hidden",
                                        isLocal
                                            ? "bg-primary-container/5 border-primary-container/30 dark:border-primary-container/20 shadow-sm"
                                            : "bg-neutral-50 dark:bg-white/[0.02] border-neutral-200/70 dark:border-white/10 hover:border-primary-container/30"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Server className={cn("w-4 h-4", isLocal ? "text-primary-container" : "text-neutral-500")} />
                                            <span className="font-mono text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                                                {isLocal ? "Local Master" : "Mesh Peer"}
                                            </span>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10">
                                            Zone: {node.zone || "GLOBAL"}
                                        </span>
                                    </div>

                                    <p className="font-mono text-sm sm:text-base text-neutral-900 dark:text-white/95 break-all font-semibold mb-3.5">
                                        {node.node_name}
                                    </p>

                                    <div className="flex items-center justify-between pt-2.5 border-t border-neutral-200/60 dark:border-white/5 text-xs sm:text-sm font-mono">
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Connected
                                        </span>

                                        {!isLocal && (
                                            <button
                                                type="button"
                                                onClick={() => recoveryMutation.mutate(node.node_name)}
                                                disabled={recoveryMutation.isPending}
                                                className="text-primary-container hover:underline font-bold cursor-pointer disabled:opacity-50"
                                            >
                                                Force Re-sync
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 🛡️ SECTION 2: Authorize Operator & Provision Server */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Authorize New Operator Form */}
                <div className="lg:col-span-5 space-y-6">
                    <section className="bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 rounded-[32px] shadow-xl transition-colors space-y-6">
                        <div className="flex items-center gap-3 border-b border-neutral-200/60 dark:border-white/5 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                                <UserPlus className="w-5 h-5 stroke-[2.5px]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                                    Authorize Server Operator
                                </h3>
                                <p className="text-xs sm:text-sm font-mono text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                                    Hardware Node Spin-Up Clearance
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleAuthorize} className="space-y-5">
                            <div>
                                <label className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                                    Target Profile Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-neutral-400 select-none">
                                        @
                                    </span>
                                    <input
                                        type="text"
                                        value={targetUsername}
                                        onChange={(e) => setTargetUsername(e.target.value)}
                                        placeholder="operator_username"
                                        required
                                        className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-4 text-base font-mono font-bold text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                                    Operator Clearance Role
                                </label>
                                <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                                    {['moderator', 'admin'].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setTargetRole(role)}
                                            className={cn(
                                                "py-3.5 rounded-2xl border text-center font-black uppercase tracking-wider cursor-pointer transition-all outline-none",
                                                targetRole === role
                                                    ? "bg-primary-container text-white border-primary-container shadow-md"
                                                    : "bg-neutral-100 dark:bg-white/[0.04] border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                            )}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed bg-neutral-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-neutral-200/60 dark:border-white/5">
                                💡 Authorizing an operator records their credentials in the decentralized Mnesia operator registry. Upon authorization, a tailored server provisioning bundle (<code className="font-mono text-primary-container font-bold">.env</code>) is generated.
                            </p>

                            <button
                                type="submit"
                                disabled={authorizeMutation.isPending || !targetUsername.trim()}
                                className="w-full bg-primary-container text-white py-4 px-6 rounded-2xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-md outline-none border-none"
                            >
                                {authorizeMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Signing Matrix Key...</span>
                                    </>
                                ) : (
                                    <>
                                        <Key className="w-4 h-4 stroke-[2.5px]" />
                                        <span>Authorize &amp; Generate Profile</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </section>
                </div>

                {/* Authorized Operators Registry Table */}
                <div className="lg:col-span-7 space-y-6">
                    <section className="bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 rounded-[32px] shadow-xl transition-colors space-y-5 flex flex-col h-[580px]">
                        <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-white/5 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                                    <Shield className="w-5 h-5 stroke-[2.5px]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                                        Authorized Operators
                                    </h3>
                                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                                        Operators cleared to run hardware servers in this cluster.
                                    </p>
                                </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10">
                                {operators.length} Cleared
                            </span>
                        </div>

                        {/* Operators List Container */}
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                            {isOperatorsLoading ? (
                                <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-500 font-mono text-sm font-bold uppercase tracking-widest opacity-60">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                                    <span>Reading operator registers...</span>
                                </div>
                            ) : operators.length === 0 ? (
                                <div className="py-24 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
                                    <AlertCircle className="w-8 h-8 text-amber-500/60" />
                                    <p className="text-sm font-mono font-bold uppercase tracking-wider">
                                        No external operators registered yet
                                    </p>
                                    <p className="text-xs sm:text-sm text-neutral-400 max-w-xs">
                                        Use the form on the left to authorize a new operator before spinning their node.
                                    </p>
                                </div>
                            ) : (
                                operators.map((op, idx) => (
                                    <div
                                        key={op.username || idx}
                                        className="p-4 rounded-2xl border border-neutral-200/60 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] flex items-center justify-between gap-4 transition-all hover:border-primary-container/30"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                                                    @{op.username}
                                                </span>
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider border",
                                                    op.role === 'admin'
                                                        ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                                                        : "bg-primary-container/10 border-primary-container/20 text-primary-container"
                                                )}>
                                                    {op.role}
                                                </span>
                                            </div>
                                            <p className="font-mono text-xs sm:text-sm text-neutral-500">
                                                Granted by: <span className="font-bold">@{op.granted_by || "system"}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenProvision(op.username)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold bg-primary-container/10 text-primary-container border border-primary-container/20 hover:bg-primary-container/20 transition-all cursor-pointer outline-none active:scale-95"
                                                title="View Server .env Configuration"
                                            >
                                                <Terminal className="w-4 h-4" />
                                                <span>Server .env</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`Revoke clearance for @${op.username}? Their server will be denied cluster operations.`)) {
                                                        revokeMutation.mutate(op.username);
                                                    }
                                                }}
                                                disabled={revokeMutation.isPending}
                                                className="p-2.5 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer outline-none disabled:opacity-40"
                                                title="Revoke Operator Clearance"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* 🚀 MODAL: Server Provisioning Profile & .env Template */}
            {provisionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-[#181818] border border-neutral-200/80 dark:border-white/10 rounded-[32px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
                                    <Terminal className="w-5 h-5 stroke-[2.5px]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-text-primary dark:text-white tracking-tight">
                                        Server Node Provisioning
                                    </h3>
                                    <p className="text-md font-mono text-text-secondary">
                                        Hardware bootstrap profile for @{provisionModal.data?.username}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setProvisionModal({ isOpen: false, data: null, isLoading: false })}
                                className="p-2 rounded-xl text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer outline-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {provisionModal.isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-secondary font-mono text-md font-bold uppercase tracking-widest opacity-60">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                                <span>Generating server credentials...</span>
                            </div>
                        ) : provisionModal.data ? (
                            <div className="space-y-5">
                                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                                    Provide this environment bundle to <strong className="text-text-primary dark:text-white">@{provisionModal.data.username}</strong>. They must set these environment variables on their physical server or container before starting the Kollective node.
                                </p>

                                {/* .env Code Box */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-md font-mono font-bold text-text-secondary">
                                        <span className="uppercase tracking-wider">File: .env (Server Configuration)</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(provisionModal.data.env_template, 'env')}
                                            className="inline-flex items-center gap-1.5 text-primary-container hover:underline cursor-pointer"
                                        >
                                            {copiedKey === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'env' ? 'Copied!' : 'Copy .env'}</span>
                                        </button>
                                    </div>
                                    <pre className="p-4 rounded-xl bg-black/95 text-emerald-400 font-mono text-md overflow-x-auto leading-relaxed border border-black/20 selection:bg-emerald-500/30 selection:text-white max-h-56 custom-scrollbar">
                                        {provisionModal.data.env_template}
                                    </pre>
                                </div>

                                {/* Terminal Launch Command */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-md font-mono font-bold text-text-secondary">
                                        <span className="uppercase tracking-wider">Terminal Launch Command</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(provisionModal.data.launch_command, 'cmd')}
                                            className="inline-flex items-center gap-1.5 text-primary-container hover:underline cursor-pointer"
                                        >
                                            {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'cmd' ? 'Copied!' : 'Copy Command'}</span>
                                        </button>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/90 text-white font-mono text-md flex items-center justify-between gap-2 overflow-x-auto border border-black/20">
                                        <code>{provisionModal.data.launch_command}</code>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setProvisionModal({ isOpen: false, data: null, isLoading: false })}
                                        className="bg-primary-container text-white px-6 py-2.5 rounded-xl font-mono text-md font-black uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer outline-none"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};
