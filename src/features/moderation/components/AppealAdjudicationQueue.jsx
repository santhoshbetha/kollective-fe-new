// src/features/moderation/components/AppealAdjudicationQueue.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../api/apiClient';
import { Scale, CheckCircle2, XCircle, Loader2, Gavel, ShieldCheck, MapPin } from 'lucide-react';
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
        <div className="w-full max-w-7xl mx-auto space-y-6 text-left font-sans antialiased text-neutral-200 select-none animate-in fade-in duration-200">
            <header className="pb-4 border-b border-white/5 select-none flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary-container mb-1">
                    <Scale className="w-5 h-5 stroke-[2.5px]" />
                    <span className="text-xs font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2.5 py-1 border border-primary-container/20 rounded-lg">
                        Sovereign High Court Panel
                    </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Governance Appeals Desk</h1>
                <p className="text-base sm:text-lg font-medium text-neutral-400 leading-relaxed">
                    Review and adjudicate member disputes regarding platform moderation actions and soft-deletes.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl h-[680px] max-h-[680px] bg-[#141414]">

                {/* 👈 LEFT PANEL: Pending Disputes Stream Directory */}
                <div className="lg:col-span-5 flex flex-col border-r border-white/5 bg-[#111111]/50 h-full max-h-full min-h-0 overflow-hidden">
                    <div className="p-5 border-b border-white/5 font-mono text-sm sm:text-base font-black uppercase tracking-widest text-neutral-400 bg-[#141414] select-none flex justify-between items-center">
                        <span>Pending Content Disputes ({appeals.length})</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2.5">
                        {isLoading ? (
                            <div className="py-24 text-center font-mono text-sm text-neutral-500 flex flex-col items-center justify-center gap-3 h-full opacity-60">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                                <span>Scanning distributed Mnesia logs...</span>
                            </div>
                        ) : appeals.length > 0 ? (
                            appeals.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedAppeal(item)}
                                    className={cn(
                                        "p-5 rounded-2xl cursor-pointer border text-left flex flex-col gap-2.5 transition-all select-none shadow-xs",
                                        selectedAppeal?.id === item.id
                                            ? "bg-primary-container/15 border-primary-container/60 shadow-lg ring-1 ring-primary-container/30"
                                            : "bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-baseline font-mono text-xs sm:text-sm text-neutral-400 font-bold">
                                        <span className="text-white font-sans font-black text-sm sm:text-base">Citizen Case File</span>
                                        <span>#{String(item.id || '').substring(0, 8)}</span>
                                    </div>
                                    <p className="text-sm sm:text-base text-neutral-300 font-medium truncate pr-4 leading-relaxed">
                                        {item.reason}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs font-mono text-primary-container font-black bg-primary-container/10 px-2.5 py-1 w-fit rounded-lg border border-primary-container/20">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Zone: {item.country_code || 'GLOBAL'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-28 text-center font-mono text-sm text-neutral-500 opacity-60 flex flex-col items-center justify-center gap-2.5 h-full">
                                <Gavel className="w-8 h-8 text-neutral-600 stroke-[1.5px]" />
                                <span className="font-bold">All appeal metrics clear.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 👉 RIGHT PANEL: Detailed File Adjudication Workspace Canvas */}
                <div className="lg:col-span-7 flex flex-col h-full max-h-full min-h-0 overflow-hidden bg-[#141414]">
                    {selectedAppeal ? (
                        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">

                            <div className="flex justify-between items-center pb-4 border-b border-white/5 select-none font-mono text-xs sm:text-sm font-bold text-neutral-400">
                                <span className="uppercase tracking-wider">Dispute Assessment Matrix</span>
                                <span>Incident ID Target: {String(selectedAppeal.incident_id || selectedAppeal.id || '').substring(0, 12)}...</span>
                            </div>

                            <div className="space-y-2 text-left flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <label className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-neutral-400 ml-1 select-none">
                                    Citizen Justification Argument Text
                                </label>
                                <div className="p-6 bg-[#181818] border border-white/5 rounded-2xl text-base sm:text-lg font-sans font-medium text-neutral-200 leading-relaxed break-words shadow-inner">
                                    "{selectedAppeal.reason}"
                                </div>
                            </div>

                            {actionMessage && (
                                <div className="p-4 bg-primary-container/10 border border-primary-container/20 rounded-2xl flex items-center gap-3 font-mono text-xs sm:text-sm font-bold text-neutral-200 uppercase select-none">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 stroke-[2.5px]" />
                                    <span>{actionMessage}</span>
                                </div>
                            )}

                            {/* Adjudication Action Confirmation Controls Row */}
                            <div className="flex flex-col sm:flex-row gap-4 font-mono text-sm sm:text-base font-black uppercase tracking-wider select-none shrink-0 pt-3">
                                <button
                                    type="button"
                                    disabled={adjudicateMutation.isPending}
                                    onClick={() => adjudicateMutation.mutate({ appealId: selectedAppeal.id, resolutionType: "reject" })}
                                    className="flex-1 py-4 px-6 bg-transparent border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all rounded-2xl cursor-pointer flex items-center justify-center gap-2.5 outline-none disabled:opacity-40 shadow-xs active:scale-[0.99]"
                                >
                                    <XCircle className="w-5 h-5 stroke-[2.5px]" />
                                    <span>Uphold Soft-Delete</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={adjudicateMutation.isPending}
                                    onClick={() => adjudicateMutation.mutate({ appealId: selectedAppeal.id, resolutionType: "approve" })}
                                    className="flex-1 py-4 px-6 bg-primary-container text-white hover:brightness-105 border-none transition-all rounded-2xl cursor-pointer flex items-center justify-center gap-2.5 outline-none shadow-md disabled:opacity-40 active:scale-[0.99]"
                                >
                                    {adjudicateMutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5 stroke-[2.5px]" />
                                    )}
                                    <span>Approve & Restore</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400 font-mono text-sm opacity-60 gap-3">
                            <Scale className="w-12 h-12 text-neutral-600 stroke-[1.5px]" />
                            <span className="max-w-xs leading-relaxed">
                                Select an active dispute case file from the directory to review justification credentials.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AppealAdjudicationQueue;