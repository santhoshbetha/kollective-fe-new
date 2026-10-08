// src/pages/MessagesPage.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { UserAvatar } from '../../components/accounts/UserAvatar';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useConversationChannel } from '../../features/conversations/hooks/useConversationChannel';
import { encryptAndUploadAttachment } from '../../features/conversations/utils/mediaCrypto';
import { apiFetch } from '../../api/apiClient';
import { cn } from '../../lib/utils';
import {
    MessageCircle, Send, Smile, Paperclip, Search, Phone, Video,
    Info, ImageIcon, File, Users, ArrowLeft, Loader2, Lock, ShieldX,
    PanelLeftClose, PanelLeftOpen
} from "lucide-react";

export default function MessagesPage() {
    const navigate = useNavigate();
    const { conversationId: routeConvId } = useParams();
    const currentUser = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    // 🎨 SOLID RECONCILED HOOK STATES
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedConversation, setSelectedConversation] = useState(routeConvId || null);
    const [messageText, setMessageText] = useState("");
    const [showConversationList, setShowConversationList] = useState(true);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem('messages_sidebar_collapsed') === 'true';
    });

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('messages_sidebar_collapsed', next.toString());
            return next;
        });
    };

    const fileInputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Sync selected conversation id parameter state when route location changes direction
    useEffect(() => {
        if (routeConvId) {
            setSelectedConversation(routeConvId);
        }
    }, [routeConvId]);

    // 📡 1. FETCH LIVE CONVERSATIONS INBOX STREAM VIA TANSTACK QUERY
    const { data: conversations = [], isLoading: isInboxLoading } = useQuery({
        queryKey: ['conversations', 'inbox'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/api/v1/conversations');
                return Array.isArray(res) ? res : (res?.data || []);
            } catch (err) {
                console.warn('apiFetch bypassed for conversations inbox:', err);
                return [];
            }
        },
        staleTime: 15000,
        refetchOnWindowFocus: true
    });

    // Automatically select initial thread index on larger desktop grids
    useEffect(() => {
        if (!selectedConversation && conversations.length > 0) {
            setSelectedConversation(conversations[0].id);
        }
    }, [conversations, selectedConversation]);

    // 📡 2. BIND REAL-TIME PHOENIX WEBSOCKET CHANNEL LAYER
    const { messages: socketMessages = [], isJoining, joinError, sendMessage } = useConversationChannel(selectedConversation);

    // Filter conversation list categories dynamically
    const filteredConversations = useMemo(() => {
        if (!Array.isArray(conversations)) return [];
        return conversations.filter((conv) => {
            if (!conv) return false;
            const partnerName = conv.other_user?.username || conv.other_user?.name || conv.title || "";
            return partnerName.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [conversations, searchQuery]);

    const currentConversation = useMemo(() => {
        return conversations.find((c) => String(c.id) === String(selectedConversation)) || null;
    }, [conversations, selectedConversation]);

    const activePartner = currentConversation?.other_user || {};

    // Auto-scroll message list trees smoothly as new payload markers mount
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [socketMessages]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation) return;
        const textToSend = messageText.trim();
        setMessageText("");

        try {
            await sendMessage(textToSend);
        } catch (err) {
            console.error("WebSocket text message transmission rejected:", err);
        }
    };

    const handleFileAttachmentChange = async (e) => {
        const targetFile = e.target.files?.[0];
        if (!targetFile || !selectedConversation) return;

        setIsUploadingMedia(true);
        try {
            // Fetch public keys assigned directly on participant records to sign E2EE payloads
            const recipientPublicKeyPem = activePartner?.public_key || localStorage.getItem(`pubkey:${activePartner?.id}`);
            if (!recipientPublicKeyPem) {
                throw new Error("Recipient public key not resolved. Cannot secure attachment container.");
            }

            // 1. Generate single-use symmetric keys and stream ciphertext binary straight to R2
            const cryptographicPayload = await encryptAndUploadAttachment(targetFile, recipientPublicKeyPem);

            // 2. Dispatch secure reference markers down the open WebSocket connection lane
            await sendMessage(JSON.stringify({
                type: targetFile.type.startsWith('image/') ? "image" : "file",
                text: `[Secure Attachment: ${targetFile.name}]`,
                ...cryptographicPayload
            }));

            queryClient.invalidateQueries({ queryKey: ['conversations', 'inbox'] });
        } catch (err) {
            console.error("Local file cryptographic pipeline failure:", err);
        } finally {
            setIsUploadingMedia(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 text-left font-sans bg-transparent text-text-primary antialiased">
            <div className="bg-white dark:bg-card border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl h-[calc(100vh-120px)] rounded-none">
                <div className="flex h-full min-h-0 relative">

                    {/* 📂 LEFT PANEL SIDEBAR: Conversations Directory List */}
                    <div className={cn(
                        "flex-col w-full border-r border-black/5 dark:border-white/10 h-full max-h-full min-h-0 overflow-hidden shrink-0 bg-neutral-50/50 dark:bg-slate-950/40 transition-all duration-300",
                        isSidebarCollapsed ? "md:w-20" : "md:w-96",
                        showConversationList ? "flex" : "hidden md:flex"
                    )}>
                        {/* Sidebar Header and Search inputs */}
                        <div className={cn(
                            "p-6 border-b border-black/5 dark:border-white/10 shrink-0 select-none bg-neutral-100/50 dark:bg-card/60 transition-all",
                            isSidebarCollapsed ? "md:p-3" : "p-6"
                        )}>
                            <div className={cn(
                                "flex items-center justify-between",
                                isSidebarCollapsed ? "md:flex-col md:gap-3 md:justify-center" : "mb-4"
                            )}>
                                <h2 className={cn(
                                    "text-lg font-black flex items-center gap-2 text-neutral-900 dark:text-white tracking-tight",
                                    isSidebarCollapsed ? "md:justify-center" : ""
                                )}
                                    title={isSidebarCollapsed ? "Conversations" : undefined}
                                >
                                    <MessageCircle className="h-5 w-5 text-primary-container stroke-[2.5px] shrink-0" />
                                    <span className={isSidebarCollapsed ? "md:hidden" : ""}>Conversations</span>
                                </h2>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        title="Groups"
                                        className={cn(
                                            "gap-2 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-mono font-bold tracking-wide uppercase text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white",
                                            isSidebarCollapsed ? "md:p-2 md:h-9 md:w-9" : ""
                                        )}
                                        onClick={() => navigate("/chats/groups")}
                                    >
                                        <Users className="h-3.5 w-3.5 stroke-[2.5px] shrink-0" />
                                        <span className={isSidebarCollapsed ? "md:hidden" : ""}>Groups</span>
                                    </Button>

                                    {/* Collapse / Expand Toggle Button for Desktop */}
                                    <button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleSidebar}
                                        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                        className="hidden lg:flex h-9 w-9 p-0 items-center justify-center border-black/10 dark:border-white/10 
                                        hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 
                                        hover:text-neutral-900 dark:hover:text-white shrink-0"
                                    >
                                        {isSidebarCollapsed ?
                                            <PanelLeftOpen className="h-5 w-5" /> :
                                            <PanelLeftClose className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className={cn("relative", isSidebarCollapsed ? "md:hidden" : "")}>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500 stroke-[2.5px]" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-11 bg-white dark:bg-background border-black/10 dark:border-white/10 focus:border-primary-container text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Scrolling List Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-black/5 dark:divide-white/[0.04]">
                            {isInboxLoading ? (
                                <div className="py-24 text-center text-neutral-500 dark:text-neutral-400 font-mono text-xs flex flex-col items-center gap-2 opacity-60 select-none">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary-container" />
                                    <span>Compiling inbox matrix...</span>
                                </div>
                            ) : filteredConversations.length > 0 ? (
                                filteredConversations.map((conversation) => {
                                    const isSelected = String(conversation.id) === String(selectedConversation);
                                    const partner = conversation.other_user || {};
                                    const lastMsgText = conversation.last_message?.text || conversation.last_message?.content || "No messages yet";
                                    const convTitle = conversation.name || partner.username || partner.name || "Conversation";

                                    return (
                                        <button
                                            key={conversation.id}
                                            type="button"
                                            title={isSidebarCollapsed ? convTitle : undefined}
                                            onClick={() => {
                                                if (conversation.isGroup || conversation.is_group) {
                                                    navigate(`/chats/group/${conversation.id}`);
                                                } else {
                                                    setSelectedConversation(conversation.id);
                                                    setShowConversationList(false);
                                                }
                                            }}
                                            className={cn(
                                                "w-full p-4 flex items-start gap-3 hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors border-none border-l-4 border-l-transparent text-left cursor-pointer relative group",
                                                isSidebarCollapsed ? "md:justify-center md:px-2 md:py-3.5" : "",
                                                isSelected ? "bg-primary-container/10 dark:bg-primary-container/[0.08] border-l-4 border-l-primary-container" : ""
                                            )}
                                        >
                                            <div className="relative shrink-0">
                                                <UserAvatar
                                                    user={{ ...partner, isOnline: conversation.isOnline }}
                                                    name={conversation.name || partner.username || partner.name}
                                                    avatar={partner.avatar}
                                                    className="w-11 h-11"
                                                    showStatus={true}
                                                    indicatorClassName="border-white dark:border-card"
                                                    roundedClassName="rounded-xl"
                                                />
                                                {isSidebarCollapsed && conversation.unread_count > 0 && (
                                                    <Badge variant="destructive" className="hidden md:flex absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] font-mono font-black items-center justify-center bg-primary-container text-white border border-white dark:border-card shadow-sm">
                                                        {conversation.unread_count}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className={cn("flex-1 min-w-0", isSidebarCollapsed ? "md:hidden" : "")}>
                                                <div className="flex items-center justify-between mb-0.5 select-none">
                                                    <h3 className="font-semibold text-md text-neutral-900 dark:text-white truncate tracking-tight">
                                                        {conversation.name || `@${partner.username || 'user'}`}
                                                    </h3>
                                                    <span className="text-[14px] text-neutral-500 dark:text-neutral-400 font-bold shrink-0 ml-2">
                                                        {conversation.timestamp || (conversation.updated_at && new Date(conversation.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' }))}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-md text-neutral-600 dark:text-neutral-400 font-medium truncate leading-tight pr-2">
                                                        {lastMsgText}
                                                    </p>
                                                    {conversation.unread_count > 0 && (
                                                        <Badge variant="destructive" className="ml-2 flex-shrink-0 h-4 min-w-4 px-1 text-[9px] font-mono font-black flex items-center justify-center bg-primary-container text-white">
                                                            {conversation.unread_count}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="py-24 text-center text-neutral-500 dark:text-neutral-400 font-mono text-xs flex flex-col items-center gap-1 select-none opacity-50">
                                    <MessageCircle className="h-5 w-5 mb-1" />
                                    <span>No conversations found.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🛡️ RIGHT PANEL AREA: Active Conversation Viewport */}
                    <div className={cn(
                        "flex-col flex-1 h-full max-h-full min-h-0 overflow-hidden bg-white dark:bg-card",
                        showConversationList ? "hidden md:flex" : "flex"
                    )}>
                        {currentConversation ? (
                            <>
                                {/* Active Header Block */}
                                <div className="border-b border-black/5 dark:border-white/10 p-4 flex items-center justify-between bg-neutral-100/50 dark:bg-slate-950/40 shrink-0 select-none">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="md:hidden h-9 w-9 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                            onClick={() => setShowConversationList(true)}
                                        >
                                            <ArrowLeft className="h-5 w-5 stroke-[2.5px]" />
                                        </Button>
                                        <UserAvatar
                                            user={{ ...activePartner, isOnline: currentConversation.isOnline }}
                                            name={currentConversation.name || activePartner.username || activePartner.name}
                                            avatar={activePartner.avatar}
                                            className="w-10 h-10"
                                            showStatus={true}
                                            indicatorClassName="border-white dark:border-card"
                                            roundedClassName="rounded-xl"
                                        />
                                        <div className="min-w-0">
                                            <h2 className="font-bold text-sm text-neutral-900 dark:text-white text-[18px] truncate tracking-tight flex items-center gap-1.5">
                                                <span>{currentConversation.name || `@${activePartner.username || 'User'}`}</span>
                                                <Lock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 stroke-[2.5px]" />
                                            </h2>
                                            <p className="text-[14px] font-medium text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                                                {currentConversation.isOnline ? "Active connection now" : "Secure offline line"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"><Phone className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"><Video className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"><Info className="h-4 w-4" /></Button>
                                    </div>
                                </div>

                                {/* Scrollable Message List Viewport */}
                                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-neutral-50/50 dark:bg-background/80">
                                    {isJoining ? (
                                        <div className="py-24 text-center text-neutral-500 dark:text-neutral-400 font-mono text-xs flex flex-col items-center gap-2 opacity-60 select-none">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                                            <span>DECRYPTING CIPHER MATRICES...</span>
                                        </div>
                                    ) : joinError ? (
                                        <div className="py-20 text-center text-rose-500 font-mono text-xs space-y-2">
                                            <ShieldX className="w-8 h-8 mx-auto stroke-[1.5px]" />
                                            <p className="font-black uppercase tracking-wider">Access Restrained</p>
                                            <p className="text-neutral-500 dark:text-neutral-400 font-sans font-medium">{joinError}</p>
                                        </div>
                                    ) : socketMessages.length > 0 ? (
                                        socketMessages.map((msg, index) => {
                                            const isOwn = msg.author?.id === currentUser?.id || msg.sender_id === currentUser?.id || msg.author?.username === 'me';
                                            const timestamp = msg.inserted_at ? new Date(msg.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "00:00";

                                            // Detect secure encrypted JSON attachment fields
                                            let mediaPayload = null;
                                            try {
                                                if (msg.content?.startsWith('{') || msg.text?.startsWith('{')) {
                                                    mediaPayload = JSON.parse(msg.content || msg.text);
                                                }
                                            } catch (e) { }

                                            const msgType = mediaPayload?.type || msg.type || "text";
                                            const textBody = mediaPayload ? mediaPayload.text : (msg.text || msg.content || "");

                                            return (
                                                <div key={msg.id || `msg-${index}`} className={cn("flex w-full mb-1 items-end gap-2 text-left animate-in fade-in duration-150", isOwn ? "justify-end" : "justify-start")}>
                                                    <div className="flex flex-col max-w-[72%] gap-0.5 font-sans">
                                                        <div className={cn("rounded-2xl px-4 py-3 shadow-sm border text-md font-medium leading-relaxed break-words",
                                                            isOwn
                                                                ? "bg-primary-container border-primary-container text-white rounded-br-none"
                                                                : "bg-neutral-100 dark:bg-slate-800/90 border-black/5 dark:border-white/10 text-neutral-900 dark:text-slate-100 rounded-bl-none"
                                                        )}>
                                                            {msgType === "text" && <p>{textBody}</p>}
                                                            {msgType === "image" && (
                                                                <div className="space-y-1">
                                                                    <div className="rounded-xl overflow-hidden border border-black/5 dark:border-white/10 bg-black/5 dark:bg-black/20">
                                                                        <img src={mediaPayload?.file_url || msg.fileUrl || "/placeholder.svg"} alt="Secure share" className="max-w-full h-auto max-h-48 object-cover" />
                                                                    </div>
                                                                    <p className="text-[14px] font-mono text-neutral-500 dark:text-neutral-400 mt-1">🔒 Local AES-256 cipher container payload</p>
                                                                </div>
                                                            )}
                                                            {msgType === "file" && (
                                                                <div className="flex items-center gap-3 font-mono text-[14px]">
                                                                    <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-primary-container"><File className="h-4 w-4 stroke-[2.5px]" /></div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-black text-neutral-900 dark:text-white truncate">🔒 Secure Asset Package</p>
                                                                        <a href={mediaPayload?.file_url || msg.fileUrl} target="_blank" rel="noreferrer" className="text-primary-container underline font-bold text-[10px] hover:text-neutral-900 dark:hover:text-white transition-colors">Download Encrypted Binary</a>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[12px] font-mono font-bold text-neutral-500 dark:text-neutral-400 px-1 select-none mt-0.5">{timestamp} {msg.is_sending && "(sending...)"}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-32 text-center font-mono text-xs text-neutral-500 dark:text-neutral-600 select-none opacity-50">SECURE_DISCUSSION_THREAD_OPENED...</div>
                                    )}
                                </div>

                                {/* Message Input Composer Footer Bar */}
                                <div className="border-t border-black/5 dark:border-white/10 p-4 bg-neutral-100/50 dark:bg-slate-950/40 shrink-0 select-none">
                                    <div className="flex items-center gap-2 relative">
                                        <input type="file" ref={fileInputRef} onChange={handleFileAttachmentChange} className="hidden" accept="image/*,application/pdf" />

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={isUploadingMedia || isJoining}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-10 w-10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl shrink-0"
                                        >
                                            {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin text-primary-container" /> : <Paperclip className="h-5 w-5" />}
                                        </Button>

                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl shrink-0">
                                            <ImageIcon className="h-5 w-5" />
                                        </Button>

                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl shrink-0">
                                            <Smile className="h-5 w-5" />
                                        </Button>

                                        <Input
                                            placeholder={isUploadingMedia ? "Encrypting asset package via AES-GCM..." : "Type a secure cipher message..."}
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            className="h-11 bg-white dark:bg-background border-black/10 dark:border-white/10 focus:border-primary-container text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-xl"
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter" && messageText.trim()) {
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            size="icon"
                                            onClick={handleSendMessage}
                                            disabled={isUploadingMedia || isJoining}
                                            className="h-10 w-10 bg-primary-container hover:brightness-105 rounded-xl shrink-0 border-none cursor-pointer"
                                        >
                                            <Send className="h-4 w-4 text-white" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Unselected Thread Fallback Window View */
                            <div className="flex-1 flex items-center justify-center text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-background/80 select-none font-mono text-xs">
                                <div className="text-center space-y-1">
                                    <MessageCircle className="h-12 w-16 mx-auto mb-3 text-neutral-400 dark:text-neutral-700 animate-pulse stroke-[1.25px]" />
                                    <p className="text-sm font-black text-neutral-900 dark:text-white font-sans">Select a Conversation</p>
                                    <p className="text-neutral-500 dark:text-neutral-400 font-sans font-medium max-w-xs px-4">Choose an active thread signature from the sidebar matrix to begin decrypting chatter.</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
