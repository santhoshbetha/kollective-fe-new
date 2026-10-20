import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../api/apiClient';
import { UserPlus, X, ShieldCheck, Loader2, User, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function InviteGroupMemberModal({ isOpen, onClose, conversationId }) {
    const queryClient = useQueryClient();
    const [usernameInput, setUsernameInput] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isError, setIsError] = useState(false);

    // 🚀 MUTATION DISPATCH TRIGGER
    const inviteMutation = useMutation({
        mutationFn: async (targetUsername) => {
            return await apiFetch(`/api/v1/chat_groups/${conversationId}/invite`, {
                method: 'POST',
                body: JSON.stringify({ username: targetUsername })
            });
        },
        onSuccess: () => {
            setIsError(false);
            setFeedback("Citizen authorization written to group ledger successfully!");
            setUsernameInput("");
            if (conversationId) {
                queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'participants'] });
            }
            queryClient.invalidateQueries({ queryKey: ['conversations', 'inbox'] });
            setTimeout(() => {
                setFeedback("");
                onClose();
            }, 1200);
        },
        onError: (err) => {
            console.error("Group invitation transaction rejected:", err);
            setIsError(true);
            setFeedback(err?.message || "Failed to alter group roster matrix parameters.");
        }
    });

    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!usernameInput.trim() || !conversationId) return;
        setFeedback("");
        inviteMutation.mutate(usernameInput.trim());
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
            <div className="bg-[#141414] border border-white/10 rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-left transform animate-in zoom-in-95 duration-150">

                {/* Header Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-primary-container stroke-[2.5px]" />
                        <h3 className="text-sm font-black text-white tracking-tight uppercase font-mono">Provision Room Access</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={inviteMutation.isPending}
                        className="text-neutral-500 hover:text-white border-none bg-transparent outline-none cursor-pointer"
                    >
                        <X className="w-4 h-4 stroke-[2.5px]" />
                    </button>
                </div>

                {/* Form Forms Input */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block ml-1">
                            Citizen Handle to Add
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 stroke-[2px]" />
                            <input
                                type="text"
                                placeholder="e.g. sarah_district4"
                                required
                                disabled={inviteMutation.isPending}
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value.replace(/^@/, ''))}
                                className="w-full bg-[#181818] border border-white/10 py-2.5 pl-9 pr-4 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none font-mono font-bold"
                            />
                        </div>
                    </div>

                    {feedback && (
                        <div className={cn(
                            "p-3 rounded-xl flex items-center gap-2.5 font-mono text-[10px] font-bold uppercase select-none",
                            isError ? "bg-rose-500/5 border border-rose-500/10 text-rose-400" : "bg-primary-container/5 border border-primary-container/20 text-neutral-300"
                        )}>
                            {inviteMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-container shrink-0" />
                            ) : isError ? (
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 stroke-[2.5px]" />
                            ) : (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5px]" />
                            )}
                            <span className="truncate">{feedback}</span>
                        </div>
                    )}

                    {/* Form Controls Buttons Row */}
                    <div className="flex justify-end gap-2 font-mono text-xs font-bold uppercase tracking-wider pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={inviteMutation.isPending}
                            className="px-4 py-2 bg-zinc-800 text-neutral-400 rounded-xl hover:bg-zinc-700 border-none outline-none cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={inviteMutation.isPending || !usernameInput.trim()}
                            className="px-4 py-2 bg-primary-container text-white rounded-xl disabled:opacity-40 border-none outline-none shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                            {inviteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Add Member</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
