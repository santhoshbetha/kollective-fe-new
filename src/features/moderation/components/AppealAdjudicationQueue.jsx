// src/features/moderation/components/AppealAdjudicationQueue.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../api/apiClient';
import { Scale, CheckCircle2, XCircle, Loader2, Gavel, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function AppealAdjudicationQueue() {
    const queryClient = useQueryClient();
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [actionMessage, setActionMessage] = useState("");

    // 📡 1. PULL PENDING DISPUTES OUT OF MULTI-NODE DISTRIBUTED MEMORY
    const { data: appeals = [], isLoading } = useQuery({
        queryKey: ['admin', 'moderation-appeals'],
        queryFn: async () => {
            const res = await apiFetch('/api/v1/admin/moderation_appeals/pending');
            return Array.isArray(res) ? res : (res?.data || []);
        }
    });

    // 🚀 2. MUTATION: Adjudicate Dispute (Approve Restoration or Confirm Ban)
    const adjudicateMutation = useMutation({
        mutationFn: async ({ appealId, resolutionType }) => {
            return await apiFetch(`/api/v1/admin/moderation_appeals/${appealId}/adjudicate`, {
                method: 'POST',
                body: JSON.stringify({ resolution: resolutionType })
            });
        },
        onSuccess: () => {
            setActionMessage("Adjudication committed. State synchronized over mesh rings.");
            setSelectedAppeal(null);
            queryClient.invalidateQueries({ queryKey: ['admin', 'moderation-appeals'] });
            setTimeout(() => setActionMessage(""), 3000);
        }
    });

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 p-4 text-left font-sans antialiased text-neutral-200">
            <header className="py-2 border-b border-white/5 select-none">
                <div className="flex items-center gap-2 text-primary-container mb-1">
                    <Scale className="w-4 h-4 stroke-[2.5px]" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 border border-primary-container/20 rounded">
                        Sovereign High Court Panel
                    </span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Governance Appeals Desk</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/5 rounded-3xl overflow-hidden shadow-2xl h-[520px] max-h-[520px] bg-[#141414]">

                {/* 👈 LEFT PANEL: Pending Disputes Stream Directory */}
                <div className="lg:col-span-5 flex flex-col border-r border-white/5 bg-[#111111]/50 h-full max-h-full min-h-0 overflow-hidden">
                    <div className="p-4 border-b border-white/5 font-mono text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-[#141414] select-none">
                        Pending Content Disputes ({appeals.length})
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {isLoading ? (
                            <div className="py-20 text-center font-mono text-xs text-neutral-500 flex flex-col items-center justify-center gap-2 h-full opacity-60">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                                <span>Scanning distributed Mnesia logs...</span>
                            </div>
                        ) : appeals.length > 0 ? (
                            appeals.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedAppeal(item)}
                                    className={cn(
                                        "p-4 rounded-2xl cursor-pointer border text-left flex flex-col gap-1.5 transition-all select-none",
                                        selectedAppeal?.id === item.id
                                            ? "bg-primary-container/10 border-primary-container/40"
                                            : "bg-transparent border-transparent hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex justify-between items-baseline font-mono text-[10px] text-neutral-400 font-bold">
                                        <span className="text-white font-sans font-black">Citizen Case File</span>
                                        <span>#{item.id.substring(0, 8)}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400 font-medium truncate pr-4 leading-normal">
                                        {item.reason}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-primary-container font-black bg-primary-container/5 px-2 py-0.5 w-fit rounded border border-primary-container/10">
                                        <MapPin className="w-2.5 h-2.5" />
                                        <span>Zone: {item.country_code}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center font-mono text-xs text-neutral-500 opacity-60 flex flex-col items-center justify-center gap-1.5 h-full">
                                <Gavel className="w-5 h-5 text-neutral-600 stroke-[1.5px]" />
                                <span>All appeal metrics clear.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 👉 RIGHT PANEL: Detailed File Adjudication Workspace Canvas */}
                <div className="lg:col-span-7 flex flex-col h-full max-h-full min-h-0 overflow-hidden bg-[#141414]">
                    {selectedAppeal ? (
                        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden p-6 space-y-5 animate-in fade-in duration-150">

                            <div className="flex justify-between items-center pb-3 border-b border-white/5 select-none font-mono text-[10px] font-bold text-neutral-500">
                                <span className="uppercase tracking-wider">Dispute Assessment Matrix</span>
                                <span>Incident ID Target: {selectedAppeal.incident_id.substring(0, 12)}...</span>
                            </div>

                            <div className="space-y-1.5 text-left flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-500 ml-1 select-none">
                                    Citizen Justification Argument Text
                                </label>
                                <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl text-xs font-sans font-medium text-neutral-300 leading-relaxed break-words shadow-inner">
                                    "{selectedAppeal.reason}"
                                </div>
                            </div>

                            {actionMessage && (
                                <div className="p-3 bg-primary-container/5 border border-primary-container/20 rounded-xl flex items-center gap-2 font-mono text-[10px] font-bold text-neutral-300 uppercase select-none">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5px]" />
                                    <span>{actionMessage}</span>
                                </div>
                            )}

                            {/* Adjudication Action Confirmation Controls Row */}
                            <div className="flex gap-3 font-mono text-xs font-bold uppercase tracking-wider select-none shrink-0 pt-2">
                                <button
                                    type="button"
                                    disabled={adjudicateMutation.isPending}
                                    onClick={() => adjudicateMutation.mutate({ appealId: selectedAppeal.id, resolutionType: "reject" })}
                                    className="flex-1 py-3 bg-transparent border border-white/10 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 outline-none disabled:opacity-40"
                                >
                                    <XCircle className="w-4 h-4 stroke-[2.5px]" />
                                    <span>Uphold Soft-Delete</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={adjudicateMutation.isPending}
                                    onClick={() => adjudicateMutation.mutate({ appealId: selectedAppeal.id, resolutionType: "approve" })}
                                    className="flex-1 py-3 bg-primary-container text-white hover:brightness-105 border-none transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 outline-none shadow-md disabled:opacity-40"
                                >
                                    {adjudicateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 stroke-[2.5px]" />
                                    )}
                                    Approve & Restore
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-neutral-500 font-mono text-xs opacity-50">
                            Select an active dispute case file signature from the directory to review credentials.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};