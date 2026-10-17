// src/features/moderation/components/SovereignPermissionsPanel.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../api/apiClient';
import { ShieldCheck, UserPlus, ShieldAlert, Trash2, Loader2, Terminal, Server } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function SovereignPermissionsPanel() {
    const queryClient = useQueryClient();
    const [targetUsername, setTargetUsername] = useState("");
    const [selectedRole, setSelectedRole] = useState("moderator"); // "moderator" | "admin"
    const [feedbackMessage, setFeedbackMessage] = useState("");

    // 📡 1. FETCH LOCAL NODE-LEVEL SOVEREIGN OPERATORS RACK
    const { data: operators = [], isLoading } = useQuery({
        queryKey: ['admin', 'sovereign-operators'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/api/v1/admin/sovereign_operators');
                return Array.isArray(res) ? res : (res?.data || []);
            } catch (err) {
                console.warn("Failed to read sovereign operator lists:", err);
                return [];
            }
        }
    });

    // 🚀 2. MUTATION: Grant Clearance to a New Citizen Node-Owner
    const grantClearanceMutation = useMutation({
        mutationFn: async (payload) => {
            return await apiFetch('/api/v1/admin/sovereign_operators', {
                method: 'POST',
                body: JSON.stringify({ operator: payload })
            });
        },
        onSuccess: () => {
            setTargetUsername("");
            setFeedbackMessage("Clearance keys stamped onto local node registry successfully.");
            queryClient.invalidateQueries({ queryKey: ['admin', 'sovereign-operators'] });
            setTimeout(() => setFeedbackMessage(""), 3000);
        },
        onError: (err) => {
            setFeedbackMessage(err?.message || "Failed to alter hardware permission mapping matrices.");
        }
    });

    // 🚀 3. MUTATION: Evict / Revoke Authorization from Node Registry
    const revokeClearanceMutation = useMutation({
        mutationFn: async (username) => {
            return await apiFetch(`/api/v1/admin/sovereign_operators/${username}`, {
                method: 'DELETE'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'sovereign-operators'] });
        }
    });

    const handleGrantSubmit = (e) => {
        e.preventDefault();
        if (!targetUsername.trim()) return;

        setFeedbackMessage("");
        grantClearanceMutation.mutate({
            username: targetUsername.trim().toLowerCase(),
            role: selectedRole
        });
    };
    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 p-4 text-left font-sans antialiased text-neutral-200">
            {/* Header Control Header Block */}
            <div className="border-b border-white/5 pb-4 select-none">
                <div className="flex items-center gap-2 text-primary-container mb-1">
                    <Server className="w-4 h-4 text-primary-container stroke-[2.5px]" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 border border-primary-container/20 rounded">
                        Hardware Node Sovereignty Engine
                    </span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Node Access Management</h1>
                <p className="text-xs font-medium text-neutral-400 mt-1 leading-relaxed max-w-2xl">
                    Grant administrative or moderation clearance keys locally on this node. Operators listed here maintain execution overrides on this physical server partition, independent of a centralized directory database.
                </p>
            </div>

            {/* Split Composition Layout Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ➕ COLUMN A: Authority Key Stamping Form */}
                <form onSubmit={handleGrantSubmit} className="lg:col-span-4 p-5 bg-[#141414] border border-white/5 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-white/5 pb-2">
                        <UserPlus className="w-3.5 h-3.5 text-primary-container stroke-[2.5px]" />
                        <span>Authorize Operator</span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block ml-1">Username Handle</label>
                        <input
                            type="text"
                            placeholder="e.g. operator_beta"
                            required
                            disabled={grantClearanceMutation.isPending}
                            value={targetUsername}
                            onChange={(e) => setTargetUsername(e.target.value.replace(/^@/, ''))}
                            className="w-full bg-[#181818] border border-white/10 py-2.5 px-3.5 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none font-mono font-bold transition-colors disabled:opacity-40"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block ml-1">Clearance Tier Level</label>
                        <select
                            disabled={grantClearanceMutation.isPending}
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full bg-[#181818] border border-white/10 py-2.5 px-3 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none font-sans font-bold cursor-pointer transition-colors disabled:opacity-40"
                        >
                            <option value="moderator">Regional Moderator (Lease Incidents)</option>
                            <option value="admin">Sovereign Admin (Full Node Management)</option>
                        </select>
                    </div>

                    {feedbackMessage && (
                        <div className="p-3 bg-primary-container/5 border border-primary-container/20 text-neutral-300 rounded-xl flex items-center gap-2 text-[10px] font-mono font-bold uppercase leading-tight select-none">
                            <Terminal className="w-3.5 h-3.5 text-primary-container shrink-0 animate-pulse" />
                            <span className="flex-1">{feedbackMessage}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={grantClearanceMutation.isPending || !targetUsername.trim()}
                        className="w-full py-2.5 bg-primary-container text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:brightness-105 transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer flex items-center justify-center gap-2 outline-none"
                    >
                        {grantClearanceMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Stamp Clearance Key</span>
                    </button>
                </form>

                {/* 📂 COLUMN B: Sovereign Operator Directory Index Table */}
                <div className="lg:col-span-8 bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[400px]">
                    <div className="p-4 border-b border-white/5 font-mono text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-[#111111]/40 select-none">
                        Active Local Registry Cleared Pools
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {isLoading ? (
                            <div className="py-24 text-center text-neutral-500 font-mono text-xs flex flex-col items-center justify-center gap-2 select-none h-full opacity-60">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                                <span>COMPILING LOCAL REPLICA MATRICES...</span>
                            </div>
                        ) : operators.length > 0 ? (
                            operators.map((op, idx) => (
                                <div
                                    key={op.username || `op-${idx}`}
                                    className="p-3.5 rounded-xl border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-between gap-4 transition-all"
                                >
                                    <div className="flex items-center gap-3 min-w-0 font-mono text-xs">
                                        <div className="h-8 w-8 rounded-xl bg-zinc-800 flex items-center justify-center text-neutral-400 border border-white/5 select-none font-bold">
                                            @{String(op.username || 'user').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block font-sans font-black text-white truncate">@{op.username}</span>
                                            <span className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wide mt-0.5">
                                                Granted by: {op.granted_by || "Node_Init"} • {op.inserted_at ? new Date(op.inserted_at).toLocaleDateString() : 'System'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 font-mono select-none">
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider",
                                            op.role === "admin"
                                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                : "bg-primary-container/10 text-primary-container border-primary-container/20"
                                        )}>
                                            {op.role || "moderator"}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={revokeClearanceMutation.isPending}
                                            onClick={() => {
                                                if (window.confirm(`Revoke all sovereign clearance parameter maps from @${op.username}?`)) {
                                                    revokeClearanceMutation.mutate(op.username);
                                                }
                                            }}
                                            className="p-2 bg-zinc-900 border border-white/5 text-neutral-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer outline-none hover:border-rose-500/20 active:scale-95"
                                            title="Revoke Node Authorization"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center font-mono text-xs text-neutral-500 opacity-50 select-none flex flex-col items-center justify-center gap-1.5 h-full">
                                <ShieldAlert className="w-5 h-5 text-neutral-600 stroke-[1.5px]" />
                                <span>No local overrides registered. Relying on global staff defaults.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SovereignPermissionsPanel;