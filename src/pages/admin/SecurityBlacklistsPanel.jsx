// src/pages/admin/SecurityBlacklistsPanel.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { ShieldAlert, ShieldCheck, Ban, Trash2, Plus, Flame, RefreshCw, Loader2, EyeOff, Globe } from 'lucide-react';
import { cn } from "@/lib/utils";

export const SecurityBlacklistsPanel = ({ onCommandStart, onCommandComplete }) => {
    const queryClient = useQueryClient();
    const [ipInput, setIpInput] = useState('');
    const [shadowInput, setShadowInput] = useState('');

    // 1️⃣ Fetch security matrix data (Blacklisted IPs, Shadow-banned users, Lockdown state)
    const { data: securityData = {}, isLoading } = useQuery({
        queryKey: ['admin', 'security', 'blacklist'],
        queryFn: async () => {
            const res = await apiFetch('/api/v1/admin/security/blacklist');
            return res?.data || res || {};
        },
        refetchInterval: 30000,
        staleTime: 15000,
        refetchOnWindowFocus: false
    });

    const blacklistedIps = securityData.blacklisted_ips || [];
    const shadowbannedUsers = securityData.shadowbanned_users || [];
    const isLockdownActive = !!securityData.lockdown_active;

    const invalidateSecurityData = () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'security', 'blacklist'] });
    };

    // 2️⃣ Mutations for firewall actions
    const addIpMutation = useMutation({
        mutationFn: async (ip) => {
            onCommandStart?.(`Adding IP / CIDR '${ip}' to memory firewall...`);
            return await apiFetch('/api/v1/admin/security/blacklist', {
                method: 'POST',
                body: JSON.stringify({ ip })
            });
        },
        onSuccess: (data, ip) => {
            invalidateSecurityData();
            setIpInput('');
            onCommandComplete?.({
                type: 'success',
                title: 'IP Firewall Blacklisted',
                message: data?.message || `IP / CIDR block '${ip}' added to RAM firewall.`,
                target: ip
            });
        },
        onError: (err, ip) => {
            onCommandComplete?.({
                type: 'error',
                title: 'Firewall Addition Failed',
                message: err?.message || `Failed to blacklist IP '${ip}'.`,
                target: ip
            });
        }
    });

    const pardonIpMutation = useMutation({
        mutationFn: async (ip) => {
            onCommandStart?.(`Pardoning IP '${ip}' from memory firewall...`);
            return await apiFetch(`/api/v1/admin/security/blacklist/${encodeURIComponent(ip)}`, {
                method: 'DELETE'
            });
        },
        onSuccess: (data, ip) => {
            invalidateSecurityData();
            onCommandComplete?.({
                type: 'success',
                title: 'IP Pardoned',
                message: data?.message || `IP address '${ip}' pardoned from firewall.`,
                target: ip
            });
        },
        onError: (err, ip) => {
            onCommandComplete?.({
                type: 'error',
                title: 'Pardon Failed',
                message: err?.message || `Failed to pardon IP '${ip}'.`,
                target: ip
            });
        }
    });

    const addShadowbanMutation = useMutation({
        mutationFn: async (identifier) => {
            onCommandStart?.(`Enforcing shadow-ban filter on '@${identifier}'...`);
            return await apiFetch('/api/v1/admin/security/shadowban', {
                method: 'POST',
                body: JSON.stringify({ identifier })
            });
        },
        onSuccess: (data, identifier) => {
            invalidateSecurityData();
            setShadowInput('');
            onCommandComplete?.({
                type: 'success',
                title: 'User Shadow-Banned',
                message: data?.message || `Shadow-ban filter applied to '@${identifier}'.`,
                target: `@${identifier}`
            });
        },
        onError: (err, identifier) => {
            onCommandComplete?.({
                type: 'error',
                title: 'Shadow-Ban Failed',
                message: err?.message || `Failed to apply shadow-ban to '@${identifier}'.`,
                target: `@${identifier}`
            });
        }
    });

    const removeShadowbanMutation = useMutation({
        mutationFn: async (identifier) => {
            onCommandStart?.(`Removing shadow-ban filter for '@${identifier}'...`);
            return await apiFetch(`/api/v1/admin/security/shadowban/${encodeURIComponent(identifier)}`, {
                method: 'DELETE'
            });
        },
        onSuccess: (data, identifier) => {
            invalidateSecurityData();
            onCommandComplete?.({
                type: 'success',
                title: 'Shadow-Ban Removed',
                message: data?.message || `Shadow-ban filter lifted for '@${identifier}'.`,
                target: `@${identifier}`
            });
        },
        onError: (err, identifier) => {
            onCommandComplete?.({
                type: 'error',
                title: 'Removal Failed',
                message: err?.message || `Failed to lift shadow-ban for '@${identifier}'.`,
                target: `@${identifier}`
            });
        }
    });

    const toggleLockdownMutation = useMutation({
        mutationFn: async (enable) => {
            const actionText = enable ? 'Enabling Emergency Lockdown' : 'Lifting Emergency Lockdown';
            onCommandStart?.(`${actionText}...`);
            const endpoint = enable ? '/api/v1/admin/security/lockdown/enable' : '/api/v1/admin/security/lockdown/disable';
            return await apiFetch(endpoint, { method: 'POST' });
        },
        onSuccess: (data, enable) => {
            invalidateSecurityData();
            onCommandComplete?.({
                type: 'success',
                title: enable ? 'Emergency Lockdown Active' : 'Lockdown Lifted',
                message: data?.message || `Platform shield status updated.`,
                target: 'PLATFORM_SHIELD'
            });
        },
        onError: (err) => {
            onCommandComplete?.({
                type: 'error',
                title: 'Lockdown Switch Failed',
                message: err?.message || `Failed to modify lockdown state.`
            });
        }
    });

    const flushCooldownsMutation = useMutation({
        mutationFn: async () => {
            onCommandStart?.('Flushing all RAM cooldowns and strike counters...');
            return await apiFetch('/api/v1/admin/security/lift-cooldowns', { method: 'POST' });
        },
        onSuccess: (data) => {
            invalidateSecurityData();
            onCommandComplete?.({
                type: 'success',
                title: 'Cooldowns Flushed',
                message: data?.message || `All RAM cooldown markers reset.`
            });
        },
        onError: (err) => {
            onCommandComplete?.({
                type: 'error',
                title: 'Flush Failed',
                message: err?.message || `Failed to flush cooldowns.`
            });
        }
    });

    if (isLoading) {
        return (
            <div className="py-16 text-center text-sm font-mono font-bold text-neutral-500 dark:text-neutral-400 opacity-70 select-none">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-container" />
                Syncing RAM security firewall...
            </div>
        );
    }

    return (
        <div className="space-y-8 text-left font-sans animate-in fade-in duration-200">

            {/* 🛡️ 1. EMERGENCY LOCKDOWN & RAM SHIELD BAR */}
            <div className={cn(
                "p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors",
                isLockdownActive
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-100"
                    : "bg-white dark:bg-[#141414] border-black/10 dark:border-white/10"
            )}>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                        isLockdownActive
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-500 animate-pulse"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}>
                        {isLockdownActive ? <ShieldAlert className="w-6 h-6 stroke-[2.5px]" /> : <ShieldCheck className="w-6 h-6 stroke-[2.5px]" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg text-text-primary dark:text-white tracking-tight">
                                Platform Security Shield
                            </h3>
                            <span className={cn(
                                "px-2.5 py-0.5 rounded text-[14px] font-mono font-black uppercase tracking-wider border",
                                isLockdownActive
                                    ? "bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400"
                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            )}>
                                {isLockdownActive ? "LOCKDOWN_ACTIVE" : "SHIELD_OPERATIONAL"}
                            </span>
                        </div>
                        <p className="text-md text-text-secondary mt-1 font-medium leading-relaxed">
                            {isLockdownActive
                                ? "Emergency Lockdown active! All new platform submissions are routed to PENDING review."
                                : "Sub-millisecond RAM firewall monitoring active botnets, IP strikes, and bad-actor filters."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    <button
                        type="button"
                        disabled={toggleLockdownMutation.isPending}
                        onClick={() => toggleLockdownMutation.mutate(!isLockdownActive)}
                        className={cn(
                            "flex-1 md:flex-none px-5 py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer border shadow-sm flex items-center justify-center gap-2 outline-none active:scale-95 disabled:opacity-50",
                            isLockdownActive
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-emerald-600/20"
                                : "bg-rose-600 hover:bg-rose-500 text-white border-rose-600 shadow-rose-600/20"
                        )}
                    >
                        {toggleLockdownMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                        <span>{isLockdownActive ? "Lift Lockdown" : "Trigger Emergency Lockdown"}</span>
                    </button>

                    <button
                        type="button"
                        disabled={flushCooldownsMutation.isPending}
                        onClick={() => flushCooldownsMutation.mutate()}
                        title="Flush all 1-hour RAM cooldowns and strike counts"
                        className="px-4 py-3 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] border border-black/10 dark:border-white/10 text-text-primary dark:text-white rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center gap-2 outline-none active:scale-95 disabled:opacity-50 shrink-0"
                    >
                        {flushCooldownsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        <span className="hidden sm:inline">Flush RAM Cooldowns</span>
                    </button>
                </div>
            </div>

            {/* 🌐 2. IP & CIDR BLACKLIST MATRIX GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Card: IP / CIDR Blacklist */}
                <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-base sm:text-lg font-black font-mono text-text-primary dark:text-white tracking-tight uppercase flex items-center gap-2">
                                <Globe className="w-5 h-5 text-rose-500 stroke-[2.5px]" />
                                <span>IP / CIDR Network Blacklist</span>
                            </h4>
                            <span className="px-2.5 py-0.5 rounded text-[14px] font-mono font-black bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                                {blacklistedIps.length} BLOCKED
                            </span>
                        </div>
                        <p className="text-md text-text-secondary leading-relaxed font-medium mb-5">
                            Block malicious IP addresses or entire CIDR subnets (e.g. <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">192.168.1.100</code> or <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">10.0.0.0/16</code>) directly in sub-millisecond RAM firewall cache.
                        </p>

                        {/* Add IP Form */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (ipInput.trim()) addIpMutation.mutate(ipInput.trim());
                            }}
                            className="flex items-center gap-2 mb-6"
                        >
                            <input
                                type="text"
                                placeholder="Enter IP or CIDR (e.g. 192.168.1.100)"
                                value={ipInput}
                                onChange={(e) => setIpInput(e.target.value)}
                                className="flex-1 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-text-primary dark:text-white placeholder:text-text-secondary/50 outline-none focus:border-primary-container transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={addIpMutation.isPending || !ipInput.trim()}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none outline-none active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                            >
                                {addIpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[2.5px]" />}
                                <span>Ban IP</span>
                            </button>
                        </form>

                        {/* IP List */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {blacklistedIps.length > 0 ? (
                                blacklistedIps.map((ip) => (
                                    <div key={ip} className="flex items-center justify-between p-3.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl text-sm font-mono font-bold">
                                        <div className="flex items-center gap-2 text-text-primary dark:text-white">
                                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                                            <span>{ip}</span>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={pardonIpMutation.isPending && pardonIpMutation.variables === ip}
                                            onClick={() => pardonIpMutation.mutate(ip)}
                                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-black rounded-lg transition-all cursor-pointer outline-none flex items-center gap-1"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span>Pardon</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-md font-mono text-text-secondary opacity-60 select-none border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                                    No active IP address or CIDR blocks registered in RAM firewall.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Card: Shadow-Ban Filters */}
                <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-base sm:text-lg font-black font-mono text-text-primary dark:text-white tracking-tight uppercase flex items-center gap-2">
                                <EyeOff className="w-5 h-5 text-amber-500 stroke-[2.5px]" />
                                <span>Shadow-Ban Filters</span>
                            </h4>
                            <span className="px-2.5 py-0.5 rounded text-[14px] font-mono font-black bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                {shadowbannedUsers.length} SHADOWED
                            </span>
                        </div>
                        <p className="text-md text-text-secondary leading-relaxed font-medium mb-5">
                            Apply stealth censorship rules to bad-actor handles or user IDs. Shadow-banned accounts remain unaware while their output is suppressed from public feeds.
                        </p>

                        {/* Add Shadowban Form */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (shadowInput.trim()) addShadowbanMutation.mutate(shadowInput.trim());
                            }}
                            className="flex items-center gap-2 mb-6"
                        >
                            <input
                                type="text"
                                placeholder="Enter username handle (e.g. bad_actor)"
                                value={shadowInput}
                                onChange={(e) => setShadowInput(e.target.value)}
                                className="flex-1 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-text-primary dark:text-white placeholder:text-text-secondary/50 outline-none focus:border-primary-container transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={addShadowbanMutation.isPending || !shadowInput.trim()}
                                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none outline-none active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                            >
                                {addShadowbanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4 stroke-[2.5px]" />}
                                <span>Shadow-Ban</span>
                            </button>
                        </form>

                        {/* Shadowban List */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {shadowbannedUsers.length > 0 ? (
                                shadowbannedUsers.map((handle) => (
                                    <div key={handle} className="flex items-center justify-between p-3.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl text-sm font-mono font-bold">
                                        <div className="flex items-center gap-2 text-text-primary dark:text-white">
                                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                                            <span>@{handle}</span>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={removeShadowbanMutation.isPending && removeShadowbanMutation.variables === handle}
                                            onClick={() => removeShadowbanMutation.mutate(handle)}
                                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-mono text-xs font-black rounded-lg transition-all cursor-pointer outline-none flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-md font-mono text-text-secondary opacity-60 select-none border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                                    No active shadow-ban filters currently registered.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
