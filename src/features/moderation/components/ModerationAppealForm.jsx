// src/features/moderation/components/ModerationAppealForm.jsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../../api/apiClient';
import { Scale, X, ShieldCheck, Loader2, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function ModerationAppealForm({ isOpen, onClose, incidentId, onSubmitted }) {
    const [reason, setReason] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // 🚀 TANSTACK DISPUTE INGRESS MUTATION
    const appealMutation = useMutation({
        mutationFn: async (appealPayload) => {
            return await apiFetch('/api/v1/moderation/appeals', {
                method: 'POST',
                body: JSON.stringify({ appeal: appealPayload })
            });
        },
        onSuccess: () => {
            setIsError(false);
            setStatusMessage("Appeal logged and sealed on the network ledger!");
            setTimeout(() => {
                if (onSubmitted) onSubmitted();
                setReason("");
                setStatusMessage("");
                onClose();
            }, 1500);
        },
        onError: (err) => {
            console.error("Governance appeal transmission aborted:", err);
            setIsError(true);
            setStatusMessage(err?.message || "Failed to route dispute signature over mesh nodes.");
        }
    });

    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim() || !incidentId) return;

        setStatusMessage("Signing transaction parameters across regions...");
        appealMutation.mutate({
            incident_id: incidentId,
            reason: reason.trim()
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="bg-[#141414] border border-white/10 rounded-[28px] max-w-md w-full p-6 space-y-4 shadow-2xl text-left transform animate-in zoom-in-95 duration-200">

                {/* Modal Top Header Ribbon */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-primary-container stroke-[2.5px]" />
                        <h3 className="text-base font-black text-white tracking-tight">Dispute Governance Action</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={appealMutation.isPending}
                        className="text-neutral-500 hover:text-white border-none bg-transparent outline-none cursor-pointer transition-colors"
                    >
                        <X className="w-5 h-5 stroke-[2.5px]" />
                    </button>
                </div>

                {/* Info Advisory Panel */}
                <div className="p-3 bg-[#181818] border border-white/5 rounded-xl text-neutral-400 font-sans text-[11px] leading-relaxed select-none">
                    Your appeal signature will route straight to the regional moderator process pool assigned to your country zone. If no regional operators are online, it updates directly into the global queue.
                </div>

                {/* Form Input Control Group */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block ml-1">
                            Dispute Justification &amp; Context
                        </label>
                        <textarea
                            placeholder="Provide specific academic, legal, or contextual reasoning to request content restoration..."
                            rows="5"
                            required
                            disabled={appealMutation.isPending}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-[#181818] border border-white/10 py-3 px-4 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-600 font-sans font-medium resize-none custom-scrollbar leading-relaxed"
                        />
                    </div>

                    {statusMessage && (
                        <div className={cn(
                            "p-3 rounded-xl flex items-center gap-2.5 font-mono text-[10px] font-bold uppercase select-none text-neutral-300",
                            isError ? "bg-rose-500/5 border border-rose-500/10 text-rose-400" : "bg-primary-container/5 border border-primary-container/20"
                        )}>
                            {appealMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary-container shrink-0" />
                            ) : isError ? (
                                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 stroke-[2.5px]" />
                            ) : (
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5px]" />
                            )}
                            <span className="truncate">{statusMessage}</span>
                        </div>
                    )}

                    {/* Action Trigger Buttons Strip Footer */}
                    <div className="flex justify-end gap-2 pt-1 font-mono text-xs font-bold uppercase tracking-wider">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={appealMutation.isPending}
                            className="px-4 py-2.5 bg-zinc-800 text-neutral-300 rounded-xl hover:bg-zinc-700 transition-colors border-none outline-none cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={appealMutation.isPending || !reason.trim()}
                            className="px-4 py-2.5 bg-primary-container text-white rounded-xl disabled:opacity-40 border-none outline-none shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                            {appealMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <FileText className="w-3.5 h-3.5 stroke-[2.5px]" />
                            )}
                            <span>Submit Appeal</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
