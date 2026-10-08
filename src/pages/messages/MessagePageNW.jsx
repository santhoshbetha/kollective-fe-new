// src/pages/MessagesPage.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useConversationChannel } from '../../features/conversations/hooks/useConversationChannel';
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
import { Paperclip, FileImage } from 'lucide-react';

export function MessagesPage() {
    const navigate = useNavigate();
    const { conversationId: routeConvId } = useParams();
    const currentUser = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    // 🎨 SOLID DARK THEME TAB PANEL STATES
    const [activeTab, setActiveTab] = useState("direct"); // "direct" | "causes" | "district" | "requests"
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedConvId, setSelectedConvId] = useState(routeConvId || null);
    const [typedMessage, setTypedMessage] = useState("");
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [recipientQuery, setRecipientQuery] = useState("");

    const messagesEndRef = useRef(null);

    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const fileInputRef = useRef(null);

    // Sync selected conversation when URL param shifts directions
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

    // Automatically pick the first conversation if none selected on desktop viewports
    useEffect(() => {
        if (!selectedConvId && conversations.length > 0) {
            setSelectedConvId(conversations[0].id);
        }
    }, [conversations, selectedConvId]);

    // 📡 2. BIND REAL-TIME CHANNEL FOR SELECTED CONVERSATION VIA PHOENIX SOCKET
    const { messages = [], isJoining, joinError, sendMessage } = useConversationChannel(selectedConvId);

    // Viewport scroll layout auto-pin anchor to thread bottom
    useEffect(() => {
        if (messagesEndRef.current && messages.length > 0) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Filter conversations dynamically based on search strings and category tabs [1.4]
    const filteredConversations = useMemo(() => {
        return conversations.filter((conv) => {
            if (!conv) return false;
            const partner = conv.other_user || {};
            const matchesSearch = !searchQuery.trim() ||
                (partner.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (conv.last_message?.text || conv.last_message?.content || "").toLowerCase().includes(searchQuery.toLowerCase());

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
            return !conv.is_request && !conv.is_group && conv.status !== "pending";
        });
    }, [conversations, activeTab, searchQuery]);

    // Quantify request unread markers count for layout warning badges [1.4]
    const pendingRequestsCount = useMemo(() => {
        return conversations.filter(c => c && (c.is_request === true || c.status === "pending")).length;
    }, [conversations]);

    const activeConv = useMemo(() => {
        return conversations.find(c => c && String(c.id) === String(selectedConvId)) || null;
    }, [conversations, selectedConvId]);

    const activePartner = activeConv?.other_user || {};

    // 🚀 MUTATION A: Accept Message Request from District Neighbor
    const acceptRequestMutation = useMutation({
        mutationFn: async (convId) => {
            return await apiFetch(`/conversations/${convId}/accept`, { method: 'POST' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations', 'inbox'] });
        }
    });

    // 🚀 MUTATION B: Decline Message Request
    const declineRequestMutation = useMutation({
        mutationFn: async (convId) => {
            return await apiFetch(`/conversations/${convId}/decline`, { method: 'POST' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations', 'inbox'] });
            setSelectedConvId(null);
        }
    });

    // 🚀 MUTATION C: Start New Civic Conversation Thread
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
            console.error("Error sending message across websocket pipe:", err);
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile || !activeConvId) return;

        setIsUploadingMedia(true);
        try {
            // Fetch your partner's cryptographic key stored on the participant schema map [1.4]
            const partnerPublicKeyPem = chat?.recipient?.public_key || localStorage.getItem("my_cached_partner_key");

            if (!partnerPublicKeyPem) {
                throw new Error("Recipient public public-key index is unregistered. Cannot sign file payload.");
            }

            // 1. Process encryption keys and stream the encrypted ciphertext blob straight to R2/S3
            const securePayload = await encryptAndUploadAttachment(selectedFile, partnerPublicKeyPem);

            // 2. Deliver the cryptographic keys over the active WebSocket channel immediately [1.4]
            // This hits your ConversationChannel.handle_in("send_direct_message") backend function [1.4]
            await channel.push('send_direct_message', {
                text: "[Attachment: Media Secured]",
                encrypted_content: "[Attachment: Media Secured]",
                ...securePayload
            });

        } catch (err) {
            console.error("Media transmission rejected:", err);
        } finally {
            setIsUploadingMedia(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-4 pb-12 px-4 font-sans text-left bg-transparent text-neutral-200 animate-in fade-in duration-200">
            {/* Inbox Layout Header Block */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 select-none border-b border-white/5">
                <div>
                    <div className="flex items-center gap-2 text-primary-container mb-1">
                        <MessageSquare className="w-5 h-5 stroke-[2.5px]" />
                        <span className="text-[11px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2.5 py-0.5 rounded border border-primary-container/20">
                            Unified Civic Messaging
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Civic Inbox</h1>
                </div>

                <button
                    type="button"
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl hover:brightness-105 transition-all shadow-md outline-none cursor-pointer border-none"
                >
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    <span>New Civic Chat</span>
                </button>
            </header>

            {/* Navigation Filter Tabs Control Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/5 font-mono select-none">
                {[
                    { key: "direct", label: "💬 Citizens", icon: Inbox },
                    { key: "causes", label: "🔥 Causes", icon: Users },
                    { key: "district", label: "📍 District", icon: MapPin },
                    { key: "requests", label: "📥 Requests", icon: MessageSquare, count: pendingRequestsCount }
                ].map((tab) => {
                    const isActive = activeTab === tab.key;
                    const IconComp = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => { setActiveTab(tab.key); setSelectedConvId(null); }}
                            className={cn(
                                "px-4 py-2 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-wider border cursor-pointer outline-none transition-all flex items-center gap-2",
                                isActive
                                    ? "bg-primary-container text-white border-primary-container shadow-md"
                                    : "bg-[#111111]/50 text-neutral-400 border-white/5 hover:border-white/10 hover:text-white"
                            )}
                        >
                            <IconComp className="w-3.5 h-3.5 stroke-[2.5px]" />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-1 bg-rose-600 text-white font-mono text-[10px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center animate-pulse">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Main Split Viewport Framework Grid */}
            {/* 🏆 FIXED HEIGHT CONTAINER: Enforces locked 650px vertical block parameters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/5 rounded-3xl overflow-hidden shadow-2xl h-[650px] max-h-[650px] min-h-0 bg-[#141414] select-none">

                {/* 👈 LEFT SIDEBAR: Conversations Directory */}
                <div className={cn(
                    "lg:col-span-4 flex flex-col border-r border-white/5 bg-[#111111]/50 h-full max-h-full min-h-0 overflow-hidden",
                    selectedConvId ? "hidden lg:flex" : "flex"
                )}>
                    {/* Search Input Box */}
                    <div className="p-3 border-b border-white/5">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 stroke-[2.5px]" />
                            <input
                                type="text"
                                placeholder="Search by name, district, cause..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#181818] border border-white/10 py-2.5 pl-9 pr-3 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-500 font-medium font-sans"
                            />
                        </div>
                    </div>

                    {/* Directory Array Wrapper */}
                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                        {isConversationsLoading ? (
                            <div className="py-32 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-2 opacity-60">
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
                                            "p-4 flex items-start gap-3 cursor-pointer transition-all duration-150 text-left select-none border-l-4 border-transparent",
                                            isSelected
                                                ? "bg-primary-container/10 border-primary-container"
                                                : "hover:bg-white/[0.01]"
                                        )}
                                    >
                                        <div className="relative shrink-0">
                                            <img
                                                src={partner.avatar || "/default-avatar.jpg"}
                                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                                alt="Avatar"
                                            />
                                            {conv.unread_count > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-container text-white text-[9px] font-black rounded-full flex items-center justify-center font-mono shadow-md animate-scale-in">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 font-sans">
                                            <div className="flex items-center justify-between gap-1 mb-0.5 select-none font-mono">
                                                <h4 className="text-xs font-black text-white truncate">
                                                    {partner.name || `@${partner.username || "user"}`}
                                                </h4>
                                                {conv.updated_at && (
                                                    <span className="text-[10px] text-neutral-500 font-bold shrink-0">
                                                        {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>

                                            {partner.district && (
                                                <div className="flex items-center gap-1 text-[9px] font-mono text-primary-container font-black mb-1 select-none">
                                                    <MapPin className="w-2.5 h-2.5 stroke-[2.5px]" />
                                                    <span>{partner.district}</span>
                                                </div>
                                            )}

                                            <p className={cn(
                                                "text-xs truncate leading-tight font-medium",
                                                conv.unread_count > 0 ? "text-white font-bold" : "text-neutral-400 font-medium"
                                            )}>
                                                {lastMsgText}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-32 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2 p-4 select-none opacity-50">
                                <MessageSquare className="w-5 h-5 stroke-[1.5px]" />
                                <span>No conversations found.</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* 👉 RIGHT MAIN CHAT VIEWPORT */}
                <div className={cn(
                    "lg:col-span-8 flex flex-col h-full max-h-full min-h-0 overflow-hidden bg-[#141414]",
                    selectedConvId ? "flex" : "hidden lg:flex"
                )}>
                    {selectedConvId && activeConv ? (
                        <>
                            {/* Chat Header Widget */}
                            <div className="p-3.5 border-b border-white/5 flex items-center justify-between bg-[#111111]/50 select-none shrink-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedConvId(null)}
                                        className="lg:hidden p-1.5 text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent outline-none"
                                    >
                                        <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
                                    </button>

                                    <img
                                        src={activePartner.avatar || "/default-avatar.jpg"}
                                        className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                                        alt="Avatar"
                                    />

                                    <div className="font-sans">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black text-white leading-none">
                                                {activePartner.name || `@${activePartner.username || "User"}`}
                                            </h3>
                                            <Lock className="w-3 h-3 text-emerald-400 stroke-[2.5px]" title="E2EE Active" />
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mt-1">
                                            {activePartner.district ? (
                                                <span className="flex items-center gap-1 text-primary-container font-black">
                                                    <MapPin className="w-3 h-3 stroke-[2.5px]" />
                                                    {activePartner.district}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-emerald-500 font-black">
                                                    <UserCheck className="w-3 h-3 stroke-[2.5px]" />
                                                    Mutual Follower
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 rounded hidden sm:inline-block tracking-wider">
                                        E2E_ENCRYPTED
                                    </span>
                                </div>
                            </div>

                            {/* Message Approval Interceptor Request Banner Block */}
                            {(activeConv.is_request || activeConv.status === "pending") && (
                                <div className="p-4 bg-amber-500/5 border-b border-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left animate-in fade-in select-none">
                                    <div className="font-sans">
                                        <h4 className="text-xs font-black text-amber-500 font-mono uppercase tracking-wider mb-0.5">
                                            Neighborhood Message Request
                                        </h4>
                                        <p className="text-xs text-amber-500/70 font-medium">
                                            This citizen is in your local district boundaries. Accept the request parameters to reply directly.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 font-mono text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => acceptRequestMutation.mutate(activeConv.id)}
                                            disabled={acceptRequestMutation.isPending}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl border-none outline-none transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                            <span>Accept</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => declineRequestMutation.mutate(activeConv.id)}
                                            disabled={declineRequestMutation.isPending}
                                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-neutral-300 rounded-xl border-none outline-none transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5 stroke-[3px]" />
                                            <span>Decline</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Messages Viewport */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#141414]">
                                {isJoining ? (
                                    <div className="py-24 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-2 opacity-60 select-none">
                                        <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                                        <span>DECRYPTING CHANNEL PAYLOAD...</span>
                                    </div>
                                ) : joinError ? (
                                    <div className="py-20 text-center text-rose-500 font-mono text-xs space-y-2 select-none">
                                        <ShieldX className="w-8 h-8 mx-auto stroke-[1.5px]" />
                                        <p className="font-bold">Connection Refused</p>
                                        <p className="text-neutral-500 font-sans">{joinError}</p>
                                    </div>
                                ) : messages.length > 0 ? (
                                    messages.map((msg, index) => {
                                        const isMe = msg.author?.id === currentUser?.id || msg.sender_id === currentUser?.id || msg.author?.username === 'me';
                                        const timestamp = msg.inserted_at
                                            ? new Date(msg.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : "";

                                        return (
                                            <div
                                                key={msg.id || `msg-${index}`}
                                                className={cn(
                                                    "flex w-full mb-3 items-end gap-2 text-left animate-in fade-in duration-150",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                {!isMe && (
                                                    <img
                                                        src={activePartner.avatar || "/default-avatar.jpg"}
                                                        className="w-7 h-7 rounded-full object-cover border border-white/5 shrink-0 mb-0.5"
                                                        alt="Avatar"
                                                    />
                                                )}
                                                {msg.file_url && (
                                                    <div className="mt-2 p-2 bg-black/10 rounded-xl border border-white/5 flex items-center gap-2 select-none font-mono text-[10px] text-neutral-400">
                                                        <FileImage className="w-4 h-4 text-primary-container stroke-[2px]" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-white truncate font-bold">🔒 Encrypted Asset Attachment</p>
                                                            <a
                                                                href={msg.file_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-primary-container font-black hover:underline cursor-pointer"
                                                            >
                                                                Download Ciphertext Binary
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex flex-col max-w-md gap-0.5 font-sans">
                                                    <div className={cn(
                                                        "p-3 rounded-2xl text-xs font-medium border leading-relaxed break-words shadow-sm",
                                                        isMe
                                                            ? "bg-primary-container text-white border-primary-container rounded-br-none"
                                                            : "bg-[#1f1f1f] border-white/5 text-neutral-200 rounded-bl-none"
                                                    )}>
                                                        {msg.text || msg.content || ""}
                                                    </div>
                                                    {timestamp && (
                                                        <span className="text-[9px] font-mono text-neutral-500 px-1 select-none font-bold">
                                                            {timestamp}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-32 text-center text-neutral-600 font-mono text-xs select-none opacity-40">
                                        // BEGIN_CIVIC_DISCUSSION_THREAD_STREAM...
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Composer Footer Input Box Form Component */}
                            <form onSubmit={handleFormSubmit} className="p-3 border-t border-white/5 bg-[#111111]/50 flex gap-2 items-center select-none shrink-0">
                                {/* Hidden File Input Node */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*,application/pdf,video/*"
                                />

                                <button
                                    type="button"
                                    disabled={isUploadingMedia || isJoining}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none disabled:opacity-30"
                                    title="Attach secure file"
                                >
                                    {isUploadingMedia ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                                    ) : (
                                        <Paperclip className="w-4 h-4 stroke-[2.5px]" />
                                    )}
                                </button>

                                <input
                                    type="text"
                                    placeholder={activeConv.status === "pending" ? "Accept request parameter block to type..." : "Type an encrypted cipher message..."}
                                    value={typedMessage}
                                    disabled={activeConv.status === "pending" || acceptRequestMutation.isPending || isUploadingMedia}
                                    onChange={(e) => setTypedMessage(e.target.value)}
                                    className="flex-1 bg-[#181818] border border-white/10 py-3 px-4 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-600 font-medium font-sans disabled:opacity-30 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={!typedMessage.trim() || activeConv.status === "pending"}
                                    className="p-2.5 bg-primary-container text-white rounded-xl hover:brightness-105 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center shadow-sm cursor-pointer border-none"
                                >
                                    <Send className="w-4 h-4 stroke-[2.5px]" />
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Unselected Conversation Fallback Screen View */
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 select-none font-mono text-xs gap-3">
                            <Sparkles className="w-10 h-10 text-primary-container stroke-[1.5px] animate-pulse" />
                            <div className="space-y-1 font-sans">
                                <h3 className="font-black text-sm text-white">Select a Conversation</h3>
                                <p className="text-neutral-500 text-xs font-medium max-w-xs leading-normal">
                                    Connect with mutual followers, cause co-organizers, or geofenced district neighbors.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* ➕ START CHAT INTERACTION MODAL COMPONENT OVERLAY */}
            {isNewChatModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none">
                    <div className="bg-[#181818] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary-container" />
                                <h3 className="text-base font-black text-white">Start Civic Chat</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsNewChatModalOpen(false)}
                                className="text-neutral-500 hover:text-white border-none bg-transparent outline-none cursor-pointer"
                            >
                                <X className="w-5 h-5 stroke-[2.5px]" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block ml-1">Username or Handle</label>
                            <input
                                type="text"
                                placeholder="e.g. sarah_district4"
                                value={recipientQuery}
                                onChange={(e) => setRecipientQuery(e.target.value.replace(/^@/, ''))}
                                className="w-full bg-[#141414] border border-white/10 py-3 px-4 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none font-mono font-bold"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 font-mono text-xs font-bold uppercase tracking-wider">
                            <button
                                type="button"
                                onClick={() => setIsNewChatModalOpen(false)}
                                className="px-4 py-2.5 bg-zinc-800 text-neutral-300 rounded-xl hover:bg-zinc-700 transition-colors border-none outline-none cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => startChatMutation.mutate(recipientQuery.trim())}
                                disabled={!recipientQuery.trim() || startChatMutation.isPending}
                                className="px-4 py-2.5 bg-primary-container text-white rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 border-none outline-none shadow-md cursor-pointer transition-all active:scale-95"
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

export default MessagesPage;
