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
        <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 p-4 text-left font-sans antialiased bg-transparent text-neutral-200">
            {/* Component Header Block */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-white/5 select-none">
                <div>
                    <div className="flex items-center gap-2 text-primary-container mb-1">
                        <Server className="w-4 h-4 text-primary-container stroke-[2.5px]" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 border border-primary-container/20 rounded">
                            Sovereign Hardware Admin Center
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Node Identity Sovereignty</h1>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 📝 LEFT COLUMN: Grant Clearance Form Input Card */}
                <form onSubmit={handleGrantSubmit} className="lg:col-span-4 bg-[#141414] border border-white/5 p-5 rounded-3xl space-y-4 shadow-xl select-none">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <UserPlus className="w-4 h-4 text-primary-container stroke-[2.5px]" />
                        <h3 className="text-sm font-black uppercase font-mono tracking-wider text-neutral-400">
                            Provision Access Key
                        </h3>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 ml-1">Citizen Username</label>
                        <input
                            type="text"
                            placeholder="e.g. administrator_alpha"
                            required
                            disabled={grantClearanceMutation.isPending}
                            value={targetUsername}
                            onChange={(e) => setTargetUsername(e.target.value.replace(/^@/, ''))}
                            className="w-full bg-[#181818] border border-white/10 py-2.5 px-4 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-600 font-mono font-bold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 ml-1">Assigned Operational Role</label>
                        <select
                            disabled={grantClearanceMutation.isPending}
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full bg-[#181818] border border-white/10 py-2.5 px-3 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none font-mono font-bold appearance-none cursor-pointer"
                        >
                            <option value="moderator">MODERATOR (Regional Clearance)</option>
                            <option value="admin">ADMINISTRATOR (Full Node Keys)</option>
                        </select>
                    </div>

                    {feedbackMessage && (
                        <div className="p-3 bg-primary-container/5 border border-primary-container/20 rounded-xl flex items-start gap-2.5 text-[10px] font-mono font-bold leading-normal uppercase">
                            <ShieldAlert className="w-3.5 h-3.5 text-primary-container shrink-0 mt-0.5" />
                            <span>{feedbackMessage}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={grantClearanceMutation.isPending || !targetUsername.trim()}
                        className="w-full py-3 bg-primary-container text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:brightness-105 transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer flex items-center justify-center gap-2 outline-none"
                    >
                        {grantClearanceMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5px]" />
                        )}
                        <span>Sign &amp; Inject Clearance</span>
                    </button>
                </form>

                {/* 📋 RIGHT COLUMN: Sovereign Node Operators Directory Table */}
                <div className="lg:col-span-8 bg-[#141414] border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[400px]">
                    <div className="p-4 border-b border-white/5 font-mono text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-[#111111]/40 select-none">
                        Active Local Operators Registry Table ({operators.length})
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5 bg-transparent p-2 space-y-1">
                        {isLoading ? (
                            <div className="py-24 text-center text-neutral-500 font-mono text-xs flex flex-col items-center justify-center gap-2 select-none h-full opacity-60">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                                <span>Reading hardware Mnesia parameters...</span>
                            </div>
                        ) : operators.length > 0 ? (
                            operators.map((op, idx) => (
                                <div
                                    key={op.username || `op-${idx}`}
                                    className="p-3.5 rounded-2xl border border-transparent bg-transparent hover:bg-white/[0.01] flex items-center justify-between gap-4 select-none animate-in fade-in"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-black text-white">@{op.username}</span>
                                            <span className={cn(
                                                "text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 border rounded shadow-sm",
                                                op.role === "admin"
                                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                    : "bg-primary-container/10 text-primary-container border-primary-container/20"
                                            )}>
                                                {op.role}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-mono text-neutral-500 font-bold mt-1">
                                            Granted: {op.inserted_at ? new Date(op.inserted_at).toLocaleDateString() : "Sovereign Inception"}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={revokeClearanceMutation.isPending}
                                        onClick={() => revokeClearanceMutation.mutate(op.username)}
                                        className="p-2.5 text-neutral-500 hover:text-rose-400 rounded-xl border-none outline-none bg-transparent hover:bg-rose-500/5 transition-all cursor-pointer"
                                        title="Revoke operator rights"
                                    >
                                        <Trash2 className="w-4 h-4 stroke-[2.5px]" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center font-mono text-xs text-neutral-500 opacity-50 select-none flex flex-col items-center justify-center gap-1.5 h-full">
                                <Terminal className="w-5 h-5 text-neutral-600 stroke-[1.5px]" />
                                <span>Sovereign operator configuration empty.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
