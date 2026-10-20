// src/features/conversations/components/GroupRosterSidebar.jsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../api/apiClient';
import { Users, Shield, KeyRound, Copy, Check, Loader2, X, UserPlus, Search } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function GroupRosterSidebar({
    conversationId,
    isOpen,
    onClose,
    conversation = null,
    onInviteMember = null
}) {
    const [copiedUsername, setCopiedUsername] = useState(null);
    const [memberSearch, setMemberSearch] = useState("");

    // 📡 FETCH LIVE ROSTER STREAM VIA TANSTACK QUERY
    const { data: apiMembers = [], isLoading } = useQuery({
        queryKey: ['conversations', conversationId, 'participants'],
        queryFn: async () => {
            if (!conversationId) return [];
            try {
                const res = await apiFetch(`/api/v1/chat_groups/${conversationId}/members`);
                return Array.isArray(res) ? res : (res?.data || []);
            } catch (err) {
                console.warn('apiFetch bypassed for chat group members:', err);
                return [];
            }
        },
        enabled: !!conversationId && isOpen
    });

    // Derive comprehensive member roster with fallback to conversation participants / partner
    const members = useMemo(() => {
        if (Array.isArray(apiMembers) && apiMembers.length > 0) {
            return apiMembers;
        }

        // Fallback A: Embedded participants list
        if (conversation?.participants && Array.isArray(conversation.participants) && conversation.participants.length > 0) {
            return conversation.participants.map((p, idx) => ({
                id: p.id || p.user_id || `part-${idx}`,
                username: p.username || p.user?.username || 'member',
                name: p.name || p.user?.name || p.user?.display_name || 'Active Node Participant',
                avatar: p.avatar || p.user?.avatar || p.avatar_url || '/default-avatar.jpg',
                public_key: p.public_key || p.user?.public_key || null
            }));
        }

        // Fallback B: Direct message partner
        if (conversation?.other_user) {
            const partner = conversation.other_user;
            return [
                {
                    id: partner.id || 'partner',
                    username: partner.username || 'partner',
                    name: partner.name || partner.display_name || 'Active Node Participant',
                    avatar: partner.avatar || partner.avatar_url || '/default-avatar.jpg',
                    public_key: partner.public_key || conversation.partner_public_key || null
                }
            ];
        }

        return [];
    }, [apiMembers, conversation]);

    // Filter members by local search string
    const filteredMembers = useMemo(() => {
        if (!memberSearch.trim()) return members;
        const q = memberSearch.toLowerCase();
        return members.filter(m =>
            (m.username || "").toLowerCase().includes(q) ||
            (m.name || "").toLowerCase().includes(q)
        );
    }, [members, memberSearch]);

    const handleCopyKey = (username, fullKey) => {
        if (!fullKey) return;
        navigator.clipboard.writeText(fullKey);
        setCopiedUsername(username);
        setTimeout(() => setCopiedUsername(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 h-full max-h-full border-l border-black/10 dark:border-white/5 bg-neutral-50/95 dark:bg-[#141414]/95 backdrop-blur-md flex flex-col shrink-0 overflow-hidden select-none z-20 animate-in slide-in-from-right duration-200">
            {/* Header Block */}
            <div className="p-4 border-b border-black/10 dark:border-white/5 flex items-center justify-between bg-neutral-100/80 dark:bg-[#111111]/80 select-none shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <Users className="w-4 h-4 text-primary-container stroke-[2.5px] shrink-0" />
                    <h3 className="text-xs font-black uppercase font-mono tracking-wider text-neutral-800 dark:text-neutral-300 truncate">
                        Room Signatures ({members.length})
                    </h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {onInviteMember && (
                        <button
                            type="button"
                            onClick={onInviteMember}
                            title="Provision Member Access"
                            className="p-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border-none cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4 text-primary-container" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        title="Close Roster Panel"
                        className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border-none outline-none cursor-pointer transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filter Search Input when more than 3 members */}
            {members.length > 3 && (
                <div className="p-2.5 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 shrink-0">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 stroke-[2.5px]" />
                        <input
                            type="text"
                            placeholder="Filter room members..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            className="w-full bg-neutral-100 dark:bg-[#181818] border border-black/5 dark:border-white/10 py-1.5 pl-8 pr-2.5 text-xs text-neutral-900 dark:text-white rounded-lg focus:border-primary-container focus:outline-none placeholder:text-neutral-500 font-medium font-sans"
                        />
                    </div>
                </div>
            )}

            {/* Scrollable Members Canvas */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                {isLoading && members.length === 0 ? (
                    <div className="py-20 text-center font-mono text-xs text-neutral-500 dark:text-neutral-400 flex flex-col items-center justify-center gap-2 opacity-70">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                        <span>DECRYPTING ROSTER SIGNATURES...</span>
                    </div>
                ) : filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            className="p-3 bg-white dark:bg-[#181818] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col gap-2 shadow-sm transition-all hover:border-primary-container/30"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                    src={member.avatar || "/default-avatar.jpg"}
                                    className="w-8 h-8 rounded-full object-cover border border-black/10 dark:border-white/10 shrink-0 select-none bg-neutral-200 dark:bg-neutral-800"
                                    alt=""
                                />
                                <div className="min-w-0 flex-1 text-left">
                                    <span className="block font-mono text-xs font-black text-neutral-900 dark:text-white truncate">
                                        @{member.username}
                                    </span>
                                    <span className="block text-[10px] font-sans font-medium text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                                        {member.name || "Active Node Participant"}
                                    </span>
                                </div>
                            </div>

                            {/* Cryptographic Signing Metadata Block */}
                            {member.public_key ? (
                                <button
                                    type="button"
                                    onClick={() => handleCopyKey(member.username, member.public_key)}
                                    title="Click to copy full asymmetric public key"
                                    className="w-full p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-black/40 dark:hover:bg-black/60 border border-black/5 dark:border-white/5 rounded-xl flex items-center justify-between gap-2 font-mono text-[9px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-left cursor-pointer transition-colors outline-none"
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <KeyRound className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0 stroke-[2px]" />
                                        <span className="truncate max-w-[160px] tracking-tight">
                                            {member.public_key.replace(/-----BEGIN PUBLIC KEY-----|\n/g, '').substring(0, 24)}...
                                        </span>
                                    </div>
                                    {copiedUsername === member.username ? (
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 shrink-0 font-sans font-bold text-[9px]">
                                            <Check className="w-3 h-3 stroke-[2.5px]" />
                                            <span>Copied</span>
                                        </span>
                                    ) : (
                                        <Copy className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" />
                                    )}
                                </button>
                            ) : (
                                <div className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-xl font-mono text-[9px] font-bold text-rose-500 dark:text-rose-400/80 text-left select-none flex items-center gap-1.5">
                                    <Shield className="w-3 h-3 shrink-0 stroke-[2px]" />
                                    <span>Signature parameters unlinked</span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center font-mono text-xs text-neutral-500 select-none opacity-50">
                        // DIRECTORY_EMPTY...
                    </div>
                )}
            </div>
        </div>
    );
}

export default GroupRosterSidebar;
