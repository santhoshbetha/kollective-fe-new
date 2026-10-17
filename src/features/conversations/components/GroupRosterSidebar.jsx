// src/features/conversations/components/GroupRosterSidebar.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../api/apiClient';
import { Users, Shield, KeyRound, Copy, Check, Loader2, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function GroupRosterSidebar({ conversationId, isOpen, onClose }) {
    const [copiedUsername, setCopiedUsername] = useState(null);

    // 📡 FETCH LIVE ROSTER STREAM VIA TANSTACK QUERY
    const { data: members = [], isLoading } = useQuery({
        queryKey: ['conversations', conversationId, 'participants'],
        queryFn: async () => {
            if (!conversationId) return [];
            const res = await apiFetch(`/api/v1/chat_groups/${conversationId}/members`);
            return Array.isArray(res) ? res : (res?.data || []);
        },
        enabled: !!conversationId && isOpen
    });

    const handleCopyKey = (username, fullKey) => {
        if (!fullKey) return;
        navigator.clipboard.writeText(fullKey);
        setCopiedUsername(username);
        setTimeout(() => setCopiedUsername(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 h-full max-h-full border-l border-white/5 bg-[#111111]/40 flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header Block */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#141414] select-none">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-container stroke-[2.5px]" />
                    <h3 className="text-xs font-black uppercase font-mono tracking-wider text-neutral-400">
                        Room Signature Matrix ({members.length})
                    </h3>
                </div>
                <button type="button" onClick={onClose} className="text-neutral-500 hover:text-white bg-transparent border-none outline-none cursor-pointer">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Scrollable Members Canvas */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {isLoading ? (
                    <div className="py-20 text-center font-mono text-xs text-neutral-500 flex flex-col items-center justify-center gap-2 opacity-60">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                        <span>DECRYPTING ROSTER SIGNATURES...</span>
                    </div>
                ) : members.length > 0 ? (
                    members.map((member) => (
                        <div key={member.id} className="p-3 bg-[#181818] border border-white/5 rounded-2xl flex flex-col gap-2 transition-all">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <img src={member.avatar || "/default-avatar.jpg"} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0 select-none" alt="" />
                                <div className="min-w-0 flex-1 text-left">
                                    <span className="block font-mono text-xs font-black text-white truncate">@{member.username}</span>
                                    <span className="block text-[9px] font-sans font-medium text-neutral-500 truncate mt-0.5">{member.name || "Active Node Participant"}</span>
                                </div>
                            </div>

                            {/* Cryptographic Signing Metadata Block */}
                            {member.public_key ? (
                                <button
                                    type="button"
                                    onClick={() => handleCopyKey(member.username, member.public_key)}
                                    className="w-full p-2 bg-black/30 hover:bg-black/50 border border-white/5 rounded-xl flex items-center justify-between gap-2 font-mono text-[9px] font-bold text-neutral-400 hover:text-white text-left cursor-pointer transition-colors outline-none"
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <KeyRound className="w-3 h-3 text-emerald-400 shrink-0 stroke-[2px]" />
                                        <span className="truncate max-w-[160px] tracking-tight">{member.public_key.replace(/-----BEGIN PUBLIC KEY-----|\n/g, '').substring(0, 24)}...</span>
                                    </div>
                                    {copiedUsername === member.username ? (
                                        <Check className="w-3 h-3 text-emerald-400 shrink-0 stroke-[2.5px]" />
                                    ) : (
                                        <Copy className="w-3 h-3 text-neutral-500 shrink-0" />
                                    )}
                                </button>
                            ) : (
                                <div className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-xl font-mono text-[9px] font-bold text-rose-400/80 text-left select-none">
                                    ❌ Asymmetric signature parameters unlinked
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center font-mono text-xs text-neutral-600 select-none opacity-40">// DIRECTORY_EMPTY...</div>
                )}
            </div>
        </div>
    );
}
