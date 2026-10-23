// src/features/conversations/components/CreateGroupChatModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../api/apiClient';
import { Users, X, ShieldCheck, Loader2, MessageSquare, Terminal } from 'lucide-react';

export function CreateGroupChatModal({ isOpen, onClose, onCreated }) {
    const queryClient = useQueryClient();
    const [groupTitle, setGroupTitle] = useState("");
    const [groupPurpose, setGroupPurpose] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const closeTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        };
    }, []);

    // 🚀 DISTRIBUTED GROUP PROVISION MUTATION
    const createGroupMutation = useMutation({
        mutationFn: async (groupPayload) => {
            return await apiFetch('/api/v1/admin/chat_groups', {
                method: 'POST',
                body: JSON.stringify({ group: groupPayload })
            });
        },
        onSuccess: (response) => {
            setStatusMessage("Group cluster room allocated!");
            queryClient.invalidateQueries({ queryKey: ['conversations', 'inbox'] });

            closeTimerRef.current = setTimeout(() => {
                const freshRoom = response?.data || response;
                if (onCreated && freshRoom?.id) onCreated(freshRoom.id);
                setGroupTitle("");
                setGroupPurpose("");
                setStatusMessage("");
                onClose();
            }, 1000);
        },
        onError: (err) => {
            setStatusMessage(err?.message || "Failed to inject group to distributed Mnesia matrix.");
        }
    });

    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!groupTitle.trim()) return;

        setStatusMessage("Broadcasting structural group parameters over cluster...");
        createGroupMutation.mutate({
            title: groupTitle.trim(),
            description: groupPurpose.trim(),
            type: "cause" // Maps cleanly to your existing civic context tab types
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="bg-[#141414] border border-white/10 rounded-[28px] max-w-md w-full p-6 space-y-4 shadow-2xl text-left transform animate-in zoom-in-95 duration-200">

                {/* Modal Top Header Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-container stroke-[2.5px]" />
                        <h3 className="text-base font-black text-white tracking-tight">
                            Establish Mesh Group Room
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white border-none bg-transparent outline-none cursor-pointer transition-colors"
                    >
                        <X className="w-5 h-5 stroke-[2.5px]" />
                    </button>
                </div>

                {/* Form Body Block */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block ml-1">
                            Group Room Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. District 4 Logistics Hub"
                            required
                            disabled={createGroupMutation.isPending}
                            value={groupTitle}
                            onChange={(e) => setGroupTitle(e.target.value)}
                            className="w-full bg-[#181818] border border-white/10 py-3 px-4 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-600 font-sans font-medium transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 block ml-1">
                            Operational Description / Purpose
                        </label>
                        <textarea
                            placeholder="Define task directives for this cluster room space..."
                            rows="3"
                            disabled={createGroupMutation.isPending}
                            value={groupPurpose}
                            onChange={(e) => setGroupPurpose(e.target.value)}
                            className="w-full bg-[#181818] border border-white/10 py-3 px-4 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-600 font-sans font-medium resize-none custom-scrollbar"
                        />
                    </div>

                    {statusMessage && (
                        <div className="p-3 bg-primary-container/5 border border-primary-container/20 rounded-xl flex items-center gap-2.5 font-mono text-[10px] font-bold uppercase select-none text-neutral-300">
                            {createGroupMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary-container shrink-0" />
                            ) : (
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5px]" />
                            )}
                            <span className="truncate">{statusMessage}</span>
                        </div>
                    )}

                    {/* Submit Row Action Panel */}
                    <div className="flex justify-end gap-2 pt-2 font-mono text-xs font-bold uppercase tracking-wider">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={createGroupMutation.isPending}
                            className="px-4 py-2.5 bg-zinc-800 text-neutral-300 rounded-xl hover:bg-zinc-700 transition-colors border-none outline-none cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createGroupMutation.isPending || !groupTitle.trim()}
                            className="px-4 py-2.5 bg-primary-container text-white rounded-xl disabled:opacity-40 border-none outline-none shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                            {createGroupMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Terminal className="w-3.5 h-3.5 stroke-[2.5px]" />
                            )}
                            <span>Initialize Room</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
