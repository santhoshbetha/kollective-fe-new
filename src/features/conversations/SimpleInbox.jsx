// src/features/conversations/CivicInbox.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useSocket } from '../../context/PhoenixSocketContext';
import { useConversationChannel } from './hooks/useConversationChannel';
import {
    MessageSquare,
    Users,
    MapPin,
    Inbox,
    Search,
    Plus,
    Lock,
    Send,
    Loader2,
    ShieldX,
    CircleDot,
    Check,
    X,
    Info,
    Sparkles,
    UserCheck,
    ArrowLeft
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { apiFetch } from '../../api/apiClient';

export function SimpleInbox() {
    const navigate = useNavigate();
    const { conversationId: routeConvId } = useParams();
    const currentUser = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("direct"); // "direct" | "causes" | "district" | "requests"
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedConvId, setSelectedConvId] = useState(routeConvId || null);
    const [typedMessage, setTypedMessage] = useState("");
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [recipientQuery, setRecipientQuery] = useState("");

    // Sync selected conversation when URL param shifts
    useEffect(() => {
        if (routeConvId) {
            setSelectedConvId(routeConvId);
        }
    }, [routeConvId]);

    // 📡 1. FETCH CONVERSATIONS LIST
    const { data: conversations = [], isLoading: isConversationsLoading } = useQuery({
        queryKey: ['conversations', 'inbox'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/conversations');
                return Array.isArray(res) ? res : (res?.data || []);
            } catch (err) {
                console.warn('apiFetch failed for conversations inbox:', err);
                return [];
            }
        },
        staleTime: 15000,
        refetchOnWindowFocus: true
    });

    // Automatically pick the first conversation if none selected and viewport is desktop
    useEffect(() => {
        if (!selectedConvId && conversations.length > 0) {
            setSelectedConvId(conversations[0].id);
        }
    }, [conversations, selectedConvId]);

    // 📡 2. BIND REAL-TIME CHANNEL FOR SELECTED CONVERSATION
    const { messages, isJoining, joinError, sendMessage } = useConversationChannel(selectedConvId);

    // Filter conversations by tab and search query
    const filteredConversations = useMemo(() => {
        return conversations.filter((conv) => {
            const partner = conv.other_user || {};
            const matchesSearch = !searchQuery.trim() ||
                (partner.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (conv.last_message?.text || "").toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeTab === "requests") {
                return conv.is_request === true || conv.status === "pending";
            }
            if (activeTab === "causes") {
                return conv.is_group === true || conv.type === "cause";
            }
            if (activeTab === "district") {
                return conv.type === "district";
            }
            // "direct" tab
            return !conv.is_request && !conv.is_group && conv.status !== "pending";
        });
    }, [conversations, activeTab, searchQuery]);

    // Count pending message requests for badge indicator
    const pendingRequestsCount = useMemo(() => {
        return conversations.filter(c => c.is_request === true || c.status === "pending").length;
    }, [conversations]);

    // Selected conversation active details
    const activeConv = useMemo(() => {
        return conversations.find(c => String(c.id) === String(selectedConvId)) || null;
    }, [conversations, selectedConvId]);

    // Active partner profile
    const activePartner = activeConv?.other_user || {};

    // 🚀 MUTATION: Accept Message Request from Neighbor
    const acceptRequestMutation = useMutation({
        mutationFn: async (convId) => {
            return await apiFetch(`/conversations/${convId}/accept`, { method: 'POST' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations', 'inbox'] });
        }
    });

    // 🚀 MUTATION: Decline Message Request
    const declineRequestMutation = useMutation({
        mutationFn: async (convId) => {
            return await apiFetch(`/conversations/${convId}/decline`, { method: 'POST' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations', 'inbox'] });
            setSelectedConvId(null);
        }
    });

    // 🚀 MUTATION: Start New Conversation
    const startChatMutation = useMutation({
        mutationFn: async (username) => {
            const res = await apiFetch('/conversations', {
                method: 'POST',
                body: JSON.stringify({ username })
            });
            return res?.data || res;
        },
        onSuccess: (data) => {
            setIsNewChatModalOpen(false);
            setRecipientQuery("");
            queryClient.invalidateQueries({ queryKey: ['conversations', 'inbox'] });
            if (data?.id) {
                setSelectedConvId(data.id);
            }
        }
    });

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!typedMessage.trim() || !selectedConvId) return;

        const textToSend = typedMessage.trim();
        setTypedMessage("");

        try {
            await sendMessage(textToSend);
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-4 pb-12 px-4 font-sans text-left animate-in fade-in duration-200">
            {/* Inbox Layout Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 select-none border-b border-black/5 dark:border-white/5">
                <div>
                    <div className="flex items-center gap-2 text-primary-container mb-1">
                        <MessageSquare className="w-5 h-5 stroke-[2.5px]" />
                        <span className="text-[11px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2.5 py-0.5 rounded border border-primary-container/20">
                            Unified Civic Messaging
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                        Civic Inbox
                    </h1>
                </div>

                <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl hover:brightness-105 transition-all shadow-md active:scale-95 outline-none cursor-pointer"
                >
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    <span>New Civic Chat</span>
                </button>
            </header>

            {/* Main 2-Column Split Viewport */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl h-[700px]">

                {/* 👈 LEFT SIDEBAR: Conversations Directory */}
                <div className={cn(
                    "lg:col-span-4 flex flex-col border-r border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-[#111111]/50 h-full",
                    selectedConvId ? "hidden lg:flex" : "flex"
                )}>

                    {/* Search Filter Bar */}
                    <div className="p-3 border-b border-black/5 dark:border-white/5">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search by name, district, cause..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-[#181818] border border-black/10 dark:border-white/10 py-2 pl-9 pr-3 text-xs text-neutral-900 dark:text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-400 font-medium"
                            />
                        </div>
                    </div>

                    {/* Conversation Items List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-black/5 dark:divide-white/5 custom-scrollbar">
                        {isConversationsLoading ? (
                            <div className="py-20 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                                <span>Loading messages...</span>
                            </div>
                        ) : filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => {
                                const isSelected = String(conv.id) === String(selectedConvId);
                                const partner = conv.other_user || {};
                                const lastMsgText = conv.last_message?.text || conv.last_message?.content || "No messages yet";

                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConvId(conv.id)}
                                        className={cn(
                                            "p-3.5 flex items-start gap-3 cursor-pointer transition-all duration-150 text-left select-none",
                                            isSelected
                                                ? "bg-primary-container/10 border-l-4 border-primary-container"
                                                : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                                        )}
                                    >
                                        <div className="relative shrink-0">
                                            <img
                                                src={partner.avatar || "/default-avatar.jpg"}
                                                className="w-10 h-10 rounded-full object-cover border border-black/10 dark:border-white/10"
                                                alt="Avatar"
                                            />
                                            {conv.unread_count > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-container text-white text-[9px] font-black rounded-full flex items-center justify-center font-mono">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <h4 className="text-xs font-black text-neutral-900 dark:text-white truncate">
                                                    {partner.name || `@${partner.username || "user"}`}
                                                </h4>
                                                {conv.updated_at && (
                                                    <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                                                        {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Shared Civic Context Tag */}
                                            {partner.district && (
                                                <div className="flex items-center gap-1 text-[9px] font-mono text-primary-container font-bold mb-1">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    <span>{partner.district}</span>
                                                </div>
                                            )}

                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate leading-tight font-medium">
                                                {lastMsgText}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-24 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-2 p-4 select-none opacity-70">
                                <MessageSquare className="w-6 h-6 stroke-[1.5px]" />
                                <span>No conversations match this tab.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 👉 RIGHT MAIN CHAT VIEWPORT */}
                <div className={cn(
                    "lg:col-span-8 flex-col h-full bg-white dark:bg-[#141414]",
                    selectedConvId ? "flex" : "hidden lg:flex"
                )}>
                    {selectedConvId && activeConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3.5 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-neutral-50/50 dark:bg-[#111111]/50 select-none">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedConvId(null)}
                                        className="lg:hidden p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    <img
                                        src={activePartner.avatar || "/default-avatar.jpg"}
                                        className="w-9 h-9 rounded-full object-cover border border-black/10 dark:border-white/10 shrink-0"
                                        alt="Avatar"
                                    />

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                                                {activePartner.name || `@${activePartner.username || "User"}`}
                                            </h3>
                                            <Lock className="w-3 h-3 text-emerald-500 stroke-[2.5px]" title="E2E Encrypted" />
                                        </div>

                                        {/* Shared Civic Connection Badge Banner */}
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                                            {activePartner.district ? (
                                                <span className="flex items-center gap-1 text-primary-container font-bold">
                                                    <MapPin className="w-3 h-3" />
                                                    {activePartner.district}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                                    <UserCheck className="w-3 h-3" />
                                                    Mutual Follower
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded hidden sm:inline-block">
                                        E2E ENCRYPTED
                                    </span>
                                </div>
                            </div>

                            {/* Pending Message Request Banner (Tier 3 Neighbors) */}
                            {(activeConv.is_request || activeConv.status === "pending") && (
                                <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left animate-in fade-in">
                                    <div className="space-y-0.5">
                                        <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 font-mono uppercase tracking-wider">
                                            Neighborhood Message Request
                                        </h4>
                                        <p className="text-xs text-amber-600 dark:text-amber-300 font-medium">
                                            This citizen is in your district. Accept request to reply directly.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 font-mono text-xs font-bold">
                                        <button
                                            onClick={() => acceptRequestMutation.mutate(activeConv.id)}
                                            disabled={acceptRequestMutation.isPending}
                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:brightness-105 transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Accept</span>
                                        </button>
                                        <button
                                            onClick={() => declineRequestMutation.mutate(activeConv.id)}
                                            disabled={declineRequestMutation.isPending}
                                            className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            <span>Decline</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Messages Viewport */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white dark:bg-[#141414]">
                                {isJoining ? (
                                    <div className="py-24 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                                        <span>Decrypting channel payload...</span>
                                    </div>
                                ) : joinError ? (
                                    <div className="py-24 text-center text-rose-500 font-mono text-xs space-y-1">
                                        <ShieldX className="w-8 h-8 mx-auto stroke-[1.5px]" />
                                        <p>{joinError}</p>
                                    </div>
                                ) : messages.length > 0 ? (
                                    messages.map((msg, index) => {
                                        const isMe = msg.author?.id === currentUser?.id || msg.sender_id === currentUser?.id;
                                        const timestamp = msg.inserted_at
                                            ? new Date(msg.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : "";

                                        return (
                                            <div
                                                key={msg.id || `msg-${index}`}
                                                className={cn(
                                                    "flex w-full mb-3 items-end gap-2 text-left",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                {!isMe && (
                                                    <img
                                                        src={activePartner.avatar || "/default-avatar.jpg"}
                                                        className="w-7 h-7 rounded-full object-cover border border-black/10 shrink-0 mb-1"
                                                        alt="Avatar"
                                                    />
                                                )}
                                                <div className="flex flex-col max-w-md gap-0.5">
                                                    <div className={cn(
                                                        "p-3 rounded-2xl text-xs font-medium border leading-relaxed break-words shadow-sm",
                                                        isMe
                                                            ? "bg-primary-container text-white border-primary-container rounded-br-none"
                                                            : "bg-neutral-100 dark:bg-[#1f1f1f] border-black/5 dark:border-white/5 text-neutral-900 dark:text-white rounded-bl-none"
                                                    )}>
                                                        {msg.text || msg.content || ""}
                                                    </div>
                                                    {timestamp && (
                                                        <span className="text-[9px] font-mono text-neutral-400 px-1 select-none">
                                                            {timestamp}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-32 text-center text-neutral-300 dark:text-neutral-600 font-mono text-xs select-none">
                                        Begin civic discussion thread...
                                    </div>
                                )}
                            </div>

                            {/* Message Composer Form */}
                            <form onSubmit={handleFormSubmit} className="p-3 border-t border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-[#111111]/50 flex gap-2 items-center select-none">
                                <input
                                    type="text"
                                    placeholder="Type an encrypted message..."
                                    value={typedMessage}
                                    onChange={(e) => setTypedMessage(e.target.value)}
                                    className="flex-1 bg-white dark:bg-[#181818] border border-black/10 dark:border-white/10 py-2.5 px-4 text-xs text-neutral-900 dark:text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-400 font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!typedMessage.trim()}
                                    className="p-2.5 bg-primary-container text-white rounded-xl hover:brightness-105 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center shadow-sm cursor-pointer"
                                >
                                    <Send className="w-4 h-4 stroke-[2.5px]" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400 select-none font-mono text-xs gap-3">
                            <Sparkles className="w-10 h-10 text-primary-container stroke-[1.5px]" />
                            <div className="space-y-1">
                                <h3 className="font-black text-sm text-neutral-800 dark:text-white">Select a Conversation</h3>
                                <p className="text-neutral-400 max-w-xs leading-relaxed">
                                    Connect with mutual followers, cause co-organizers, or district neighbors.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ➕ NEW CHAT MODAL */}
            {isNewChatModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none">
                    <div className="bg-white dark:bg-[#181818] border border-black/10 dark:border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
                        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary-container" />
                                <h3 className="text-base font-black text-neutral-900 dark:text-white">Start Civic Chat</h3>
                            </div>
                            <button onClick={() => setIsNewChatModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block">Username or Handle</label>
                            <input
                                type="text"
                                placeholder="e.g. sarah_district4"
                                value={recipientQuery}
                                onChange={(e) => setRecipientQuery(e.target.value.replace(/^@/, ''))}
                                className="w-full bg-neutral-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 py-2.5 px-3 text-xs text-neutral-900 dark:text-white rounded-xl focus:border-primary-container focus:outline-none font-mono"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 font-mono text-xs font-bold">
                            <button
                                onClick={() => setIsNewChatModalOpen(false)}
                                className="px-4 py-2 bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => startChatMutation.mutate(recipientQuery.trim())}
                                disabled={!recipientQuery.trim() || startChatMutation.isPending}
                                className="px-4 py-2 bg-primary-container text-white rounded-xl disabled:opacity-40 flex items-center gap-1.5"
                            >
                                {startChatMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>Start Discussion</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
