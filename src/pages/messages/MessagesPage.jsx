import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { UserAvatar } from '../../components/accounts/UserAvatar';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useConversationChannel } from '../../features/conversations/hooks/useConversationChannel';
import { encryptAndUploadAttachment } from '../../features/conversations/utils/mediaCrypto';
import { ChatKeyRecoveryDialog } from '../../features/conversations/components/ChatKeyRecoveryDialog';
import { CreateGroupChatModal } from '../../features/conversations/components/CreateGroupChatModal';
import InviteGroupMemberModal from '../../features/conversations/components/InviteGroupMemberModal';
import { apiFetch } from '../../api/apiClient';
import { cn } from '../../lib/utils';
import {
    MessageCircle, Send, Smile, Paperclip, Search, Phone, Video,
    Info, ImageIcon, Users, UserPlus, ArrowLeft, Loader2, Lock, ShieldX,
    PanelLeftClose, PanelLeftOpen, Plus, X, Trash2
} from "lucide-react";
import { SecureImagePreview } from '../../features/conversations/components/SecureImagePreview';
import { SecureFileAttachment } from '../../features/conversations/components/SecureFileAttachment';
import { useDeliveryReceipts } from '../../features/conversations/hooks/useDeliveryReceipts';
import { GroupRosterSidebar } from '../../features/conversations/components/GroupRosterSidebar';
import { EmojiSelector } from '../../components/EmojiSelector';
import { toast } from 'sonner';

export default function MessagesPage() {
    const navigate = useNavigate();
    const { conversationId: routeConvId } = useParams();
    const currentUser = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isRosterOpen, setIsRosterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all"); // "all" | "direct" | "groups" | "requests"
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [pendingAttachment, setPendingAttachment] = useState(null);

    const [activeTypers, setActiveTypers] = useState({});
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    const [privateKey, setPrivateKey] = useState(localStorage.getItem("active_session_private_key") || null);

    // 🎨 SOLID RECONCILED HOOK STATES
    const [searchQuery, setSearchQuery] = useState("");
    const [localSelectedId, setLocalSelectedId] = useState(null);
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
    const imageInputRef = useRef(null);
    const messageInputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // 📡 1. FETCH LIVE CONVERSATIONS INBOX STREAM VIA TANSTACK QUERY
    const { data: conversations = [], isLoading: isInboxLoading } = useQuery({
        queryKey: ['conversations', 'inbox'],
        queryFn: async () => {
            try {
                const res = await apiFetch('/api/v1/conversations');
                return Array.isArray(res) ? res : (res?.data || []);
            } catch (err) {
                return [];
            }
        },
        staleTime: 15000,
        refetchOnWindowFocus: true
    });

    // Derive selected conversation reactively without cascading setState inside effects
    const selectedConversation = routeConvId || localSelectedId || (conversations.length > 0 ? conversations[0]?.id : null);

    const handleSelectConversation = (conversationId) => {
        setLocalSelectedId(conversationId);
        navigate(`/messages/${conversationId}`);
        setShowConversationList(false);
    };

    // 📡 2. BIND REAL-TIME PHOENIX WEBSOCKET CHANNEL LAYER
    const { messages: socketMessages = [], isJoining, joinError, sendMessage, channel } = useConversationChannel(selectedConversation);
    const { enqueueMessageForDelivery } = useDeliveryReceipts(channel, socketMessages, currentUser?.id);

    // Filter conversation list categories dynamically
    const filteredConversations = useMemo(() => {
        if (!Array.isArray(conversations)) return [];
        return conversations.filter((conv) => {
            if (!conv) return false;
            const partnerName = conv.other_user?.username || conv.other_user?.name || conv.title || conv.name || "";
            const matchesSearch = partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (conv.last_message?.text || conv.last_message?.content || "").toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeTab === "groups") {
                return conv.isGroup === true || conv.is_group === true || conv.type === "group" || conv.type === "cause";
            }
            if (activeTab === "direct") {
                return !conv.isGroup && !conv.is_group && conv.type !== "cause" && !conv.is_request && conv.status !== "pending";
            }
            if (activeTab === "requests") {
                return conv.is_request === true || conv.status === "pending";
            }
            return true;
        });
    }, [conversations, searchQuery, activeTab]);

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

        // Reset typing indicator immediately upon sending
        if (isTypingRef.current && channel) {
            isTypingRef.current = false;
            channel.push("typing_heartbeat", { is_typing: false });
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        try {
            await sendMessage(textToSend);
        } catch (err) {
            toast.error("Failed to deliver message. Check connection.");
        }
    };

    const handleFileAttachmentChange = async (e) => {
        const targetFile = e.target.files?.[0];
        if (!targetFile || !selectedConversation) return;

        // Instant visual feedback for selected attachment!
        setPendingAttachment({
            name: targetFile.name,
            size: targetFile.size,
            type: targetFile.type
        });
        setIsUploadingMedia(true);

        try {
            // Fetch public keys assigned directly on participant records to sign E2EE payloads
            const recipientPublicKeyPem = activePartner?.public_key || localStorage.getItem(`pubkey:${activePartner?.id}`);
            if (!recipientPublicKeyPem) {
                toast.error("Recipient public key not resolved. Cannot secure attachment container.");
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
            toast.error(err?.message || "Failed to encrypt and stream attachment.");
        } finally {
            setIsUploadingMedia(false);
            setPendingAttachment(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (imageInputRef.current) imageInputRef.current.value = "";
        }
    };

    // 📡 Real-Time Socket Event Receivers Binding Layout:
    useEffect(() => {
        setActiveTypers({});
        if (!channel) return;

        const handleTypingBroadcast = (payload) => {
            setActiveTypers(prev => {
                const updated = { ...prev };
                if (payload.is_typing) {
                    updated[payload.user_id] = payload.username;
                } else {
                    delete updated[payload.user_id];
                }
                return updated;
            });
        };

        const handleMemberChange = () => {
            if (selectedConversation) {
                queryClient.invalidateQueries({ queryKey: ['conversations', selectedConversation, 'participants'] });
            }
            queryClient.invalidateQueries({ queryKey: ['conversations', 'inbox'] });
        };

        const typingRef = channel.on("typing_receipt_broadcast", handleTypingBroadcast);
        const joinedRef = channel.on("member_joined", handleMemberChange);
        const leftRef = channel.on("member_left", handleMemberChange);

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            isTypingRef.current = false;
            if (typeof channel.off === 'function') {
                channel.off("typing_receipt_broadcast", typingRef);
                channel.off("member_joined", joinedRef);
                channel.off("member_left", leftRef);
            }
        };
    }, [channel, selectedConversation, queryClient]);

    // ⌨️ THROTTLED KEYSTROKE INTERCEPT HEARTBEAT:
    const handleComposerInputChange = (textValue) => {
        setMessageText(textValue);
        if (!channel) return;

        // Only send heartbeat once when typing starts, avoiding WebSocket spam on every keypress
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            channel.push("typing_heartbeat", { is_typing: true });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Stop typing indicator automatically after 1.5 seconds of keyboard silence
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            channel.push("typing_heartbeat", { is_typing: false });
        }, 1500);
    };

    // If logged in but the private key isn't active in localStorage, lock the UI with the recovery modal
    if (currentUser?.id && !privateKey) {
        return (
            <div>
                <div className="max-w-7xl mx-auto min-h-[500px] flex items-center justify-center">
                    <ChatKeyRecoveryDialog
                        userUuid={currentUser.id}
                        onRestored={(rawKey) => {
                            setPrivateKey(rawKey);
                            localStorage.setItem("active_session_private_key", rawKey);
                        }}
                        onClose={() => navigate('/home')}
                    />
                </div>
            </div>
        );
    }

    const typerList = Object.values(activeTypers);
    const someoneIsTyping = typerList.length > 0;

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
                            "border-b border-black/5 dark:border-white/10 shrink-0 bg-neutral-100/50 dark:bg-card/60 transition-all",
                            isSidebarCollapsed ? "p-3" : "p-4"
                        )}>
                            <div className={cn(
                                "flex items-center justify-between gap-2",
                                isSidebarCollapsed ? "flex-col gap-3 justify-center" : "mb-3"
                            )}>
                                <h2 className={cn(
                                    "text-lg font-black flex items-center gap-2 text-neutral-900 dark:text-white tracking-tight shrink-0",
                                    isSidebarCollapsed ? "justify-center" : ""
                                )}
                                    title={isSidebarCollapsed ? "Conversations" : undefined}
                                >
                                    <MessageCircle className="h-5 w-5 text-primary-container stroke-[2.5px] shrink-0" />
                                    <span className={isSidebarCollapsed ? "hidden" : "truncate"}>Conversations</span>
                                </h2>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Browse Groups Button */}
                                    <button
                                        type="button"
                                        title="Browse Groups"
                                        onClick={() => navigate("/chats/groups")}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                        <Users className="h-4 w-4 stroke-[2px]" />
                                    </button>

                                    {/* Create Group Button */}
                                    <button
                                        type="button"
                                        onClick={() => setIsGroupModalOpen(true)}
                                        title="Create Mesh Group"
                                        className={cn(
                                            "h-8 px-2.5 flex items-center gap-1.5 rounded-lg bg-primary-container text-white font-semibold text-xs hover:brightness-110 shadow-sm transition-all cursor-pointer",
                                            isSidebarCollapsed ? "hidden" : "flex"
                                        )}
                                    >
                                        <Plus className="h-3.5 w-3.5 stroke-[2.5px]" />
                                        <span className="hidden sm:inline">New Group</span>
                                    </button>

                                    {/* Collapse / Expand Toggle Button for Desktop */}
                                    <button
                                        type="button"
                                        onClick={toggleSidebar}
                                        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                        className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                        {isSidebarCollapsed ?
                                            <PanelLeftOpen className="h-4 w-4" /> :
                                            <PanelLeftClose className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Search Bar Input */}
                            <div className={cn("relative", isSidebarCollapsed ? "hidden" : "block")}>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500 pointer-events-none stroke-[2px] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-9 h-10 bg-white dark:bg-background border border-black/15 dark:border-white/15 rounded-xl text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-all outline-none focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/25 dark:focus:ring-primary-container/35 shadow-sm"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                        title="Clear search"
                                    >
                                        <X className="h-3.5 w-3.5 stroke-[2.5px]" />
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Tabs Strip */}
                            <div className={cn("flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar", isSidebarCollapsed ? "hidden" : "flex")}>
                                {[
                                    { id: "all", label: "All" },
                                    { id: "direct", label: "Direct" },
                                    { id: "groups", label: "Groups" },
                                    { id: "requests", label: "Requests" }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap",
                                            activeTab === tab.id
                                                ? "bg-primary-container text-white border-primary-container shadow-sm"
                                                : "bg-white/60 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
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
                                            onClick={() => handleSelectConversation(conversation.id)}
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
                                        {(currentConversation.isGroup || currentConversation.is_group) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Add Member"
                                                onClick={() => setIsInviteModalOpen(true)}
                                                className="h-9 w-9 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {/* 👥 Room Roster & Key Signature Matrix Toggle Button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title={isRosterOpen ? "Hide Room Roster" : "View Room Roster & Signatures"}
                                            onClick={() => setIsRosterOpen(prev => !prev)}
                                            className={cn(
                                                "h-9 w-9 transition-colors",
                                                isRosterOpen
                                                    ? "text-primary-container bg-primary-container/10 dark:bg-primary-container/20 border border-primary-container/20 font-bold"
                                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <Users className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"><Phone className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"><Video className="h-4 w-4" /></Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Room Details & Signatures"
                                            onClick={() => setIsRosterOpen(prev => !prev)}
                                            className={cn(
                                                "h-9 w-9 transition-colors",
                                                isRosterOpen
                                                    ? "text-primary-container bg-primary-container/10 dark:bg-primary-container/20"
                                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <Info className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Active Conversation Body + GroupRosterSidebar Framework */}
                                <div className="flex-1 flex min-h-0 overflow-hidden relative">
                                    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
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
                                                socketMessages.map((msg) => (
                                                    <MessageRow
                                                        key={msg.id || msg.client_id || `${msg.sender_id || 'msg'}-${msg.inserted_at || msg.text}`}
                                                        msg={msg}
                                                        currentUser={currentUser}
                                                        currentConversation={currentConversation}
                                                        channel={channel}
                                                        enqueueMessageForDelivery={enqueueMessageForDelivery}
                                                        privateKey={privateKey}
                                                    />
                                                ))
                                            ) : (
                                                <div className="py-32 text-center font-mono text-xs text-neutral-500 dark:text-neutral-600 select-none opacity-50">
                                                    SECURE_DISCUSSION_THREAD_OPENED...
                                                </div>
                                            )}
                                        </div>

                                        {/* 💬 THE REAL-TIME TYPING CHIP BANNER ACCELERATOR */}
                                        {someoneIsTyping && (
                                            <div className="px-6 py-2 bg-[#141414] border-t border-white/5 flex items-center gap-2 select-none animate-in slide-in-from-bottom-2 duration-150 shrink-0 text-left">
                                                <div className="flex gap-1 items-center bg-[#1f1f1f] px-2.5 py-1.5 rounded-full border border-white/5 rounded-bl-none shrink-0 shadow-sm">
                                                    <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce duration-300" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce duration-300" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce duration-300" style={{ animationDelay: '300ms' }} />
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                                                    {typerList.length === 1 ? `@${typerList[0]} is drafting...` : "Multiple citizens are drafting matrices..."}
                                                </span>
                                            </div>
                                        )}

                                        <div className="w-full bg-[#141414] border-t border-white/5 space-y-2 p-3">
                                            {/* Message Input Composer Footer Bar */}
                                            <div className="border-t border-black/5 dark:border-white/10 p-3 sm:p-4 bg-neutral-100/50 dark:bg-slate-950/40 shrink-0">
                                                {/* 📎 Instant visual feedback for pending/uploading attachment */}
                                                {pendingAttachment && (
                                                    <div className="flex items-center justify-between bg-primary-container/10 border border-primary-container/20 rounded-xl px-3 py-2 text-xs animate-in fade-in slide-in-from-bottom-1 duration-150 mb-2">
                                                        <div className="flex items-center gap-2 truncate">
                                                            {isUploadingMedia ? (
                                                                <Loader2 className="h-4 w-4 animate-spin text-primary-container shrink-0" />
                                                            ) : (
                                                                <Paperclip className="h-4 w-4 text-primary-container shrink-0" />
                                                            )}
                                                            <span className="font-mono font-medium truncate text-neutral-800 dark:text-neutral-200">
                                                                {pendingAttachment.name}
                                                            </span>
                                                            <span className="text-[10px] text-neutral-500 shrink-0">
                                                                ({(pendingAttachment.size / 1024).toFixed(1)} KB)
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-primary-container uppercase font-bold shrink-0 ml-2">
                                                            Encrypting & Uploading...
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1 sm:gap-2 relative">
                                                    {/* Hidden file input for documents & all files */}
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileAttachmentChange}
                                                        className="hidden"
                                                        accept="image/*,application/pdf,.doc,.docx,.txt"
                                                    />

                                                    {/* Hidden file input for photos & images */}
                                                    <input
                                                        type="file"
                                                        ref={imageInputRef}
                                                        onChange={handleFileAttachmentChange}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />

                                                    {/* File / Document Attachment Button */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={isUploadingMedia || isJoining}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        title="Attach Document or File"
                                                        className="h-8 w-8 sm:h-10 sm:w-10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg sm:rounded-xl shrink-0 cursor-pointer transition-colors p-0"
                                                    >
                                                        {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin text-primary-container" /> : <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />}
                                                    </Button>

                                                    {/* Image Attachment Button */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={isUploadingMedia || isJoining}
                                                        onClick={() => imageInputRef.current?.click()}
                                                        title="Attach Image"
                                                        className="h-8 w-8 sm:h-10 sm:w-10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg sm:rounded-xl shrink-0 cursor-pointer transition-colors p-0"
                                                    >
                                                        <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </Button>

                                                    {/* Emoji Picker Button & Popover */}
                                                    <div className="relative shrink-0">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setShowEmojiPicker(prev => !prev)}
                                                            title="Insert Emojis"
                                                            className={cn(
                                                                "h-8 w-8 sm:h-10 sm:w-10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg sm:rounded-xl shrink-0 cursor-pointer transition-colors p-0",
                                                                showEmojiPicker && "text-primary-container bg-primary-container/10"
                                                            )}
                                                        >
                                                            <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </Button>

                                                        {showEmojiPicker && (
                                                            <EmojiSelector
                                                                onSelect={(emoji) => {
                                                                    setMessageText(prev => prev + emoji);
                                                                    setShowEmojiPicker(false);
                                                                    messageInputRef.current?.focus();
                                                                }}
                                                                onClose={() => setShowEmojiPicker(false)}
                                                                className="bottom-12 sm:bottom-14 left-0 z-50"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Instant-focus Text Input */}
                                                    <input
                                                        ref={messageInputRef}
                                                        type="text"
                                                        disabled={isUploadingMedia || isJoining}
                                                        placeholder={isUploadingMedia ? "Encrypting asset package via AES-GCM..." : "Type a secure cipher message..."}
                                                        value={messageText}
                                                        onChange={(e) => handleComposerInputChange(e.target.value)}
                                                        className="flex-1 min-w-0 h-9 sm:h-11 px-2.5 sm:px-4 bg-white dark:bg-background border border-black/10 dark:border-white/10 rounded-lg sm:rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-all"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                                                                e.preventDefault();
                                                                handleSendMessage();
                                                            }
                                                        }}
                                                    />

                                                    {/* Send Button */}
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        onClick={handleSendMessage}
                                                        disabled={!messageText.trim() || isUploadingMedia || isJoining}
                                                        className="h-8 w-8 sm:h-10 sm:w-10 bg-primary-container hover:brightness-105 active:scale-95 rounded-lg sm:rounded-xl shrink-0 border-none cursor-pointer transition-all disabled:opacity-40 p-0"
                                                        title="Send Message"
                                                    >
                                                        <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 👥 Group Roster Sidebar Component */}
                                    <GroupRosterSidebar
                                        conversationId={selectedConversation}
                                        isOpen={isRosterOpen}
                                        onClose={() => setIsRosterOpen(false)}
                                        conversation={currentConversation}
                                        onInviteMember={() => setIsInviteModalOpen(true)}
                                    />
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

                {/* Modals mounted at root viewport level */}
                <CreateGroupChatModal
                    isOpen={isGroupModalOpen}
                    onClose={() => setIsGroupModalOpen(false)}
                    onCreated={(newGroupId) => {
                        handleSelectConversation(newGroupId);
                    }}
                />
                <InviteGroupMemberModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    conversationId={selectedConversation}
                />
            </div>
        </div>
    );
}

function MessageRow({
    msg,
    currentUser,
    currentConversation,
    channel,
    enqueueMessageForDelivery,
    privateKey
}) {
    const [isExpired, setIsExpired] = useState(() => {
        if (!msg.expires_at) return false;
        return (msg.expires_at * 1000) - Date.now() <= 0;
    });

    useEffect(() => {
        if (!msg.expires_at) {
            setIsExpired(false);
            return;
        }

        const deadlineMs = (msg.expires_at * 1000) - Date.now();
        if (deadlineMs <= 0) {
            setIsExpired(true);
            return;
        }

        setIsExpired(false);
        const selfDestructTimer = setTimeout(() => {
            setIsExpired(true);
        }, deadlineMs);

        return () => clearTimeout(selfDestructTimer);
    }, [msg.expires_at]);

    const handleReadVisible = useCallback(() => {
        channel?.push("read_receipt", { message_id: msg.id });
    }, [channel, msg.id]);

    if (isExpired) return null;

    const isOwn = msg.author?.id === currentUser?.id || msg.sender_id === currentUser?.id || msg.author?.username === 'me';
    const timestamp = msg.inserted_at ? new Date(msg.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "00:00";
    const isDeleted = msg.is_deleted || msg.content?.includes("🚫") || msg.text?.includes("🚫");

    // Detect secure encrypted JSON attachment fields
    let mediaPayload = null;
    try {
        if (msg.content?.startsWith('{') || msg.text?.startsWith('{')) {
            mediaPayload = JSON.parse(msg.content || msg.text);
        }
    } catch {
        // Plain text payload
    }

    const msgType = mediaPayload?.type || msg.type || "text";
    const textBody = mediaPayload ? mediaPayload.text : (msg.text || msg.content || "");
    const isReadByPartner = msg.is_read || msg.last_read_at || currentConversation?.last_read_at;

    return (
        <ObservedReadRow
            messageId={msg.id}
            isOwn={isOwn}
            isRead={isReadByPartner}
            onReadVisible={handleReadVisible}
        >
            <ObservedMessageRow
                messageId={msg.id}
                isOwn={isOwn}
                onVisible={enqueueMessageForDelivery}
            >
                <div className={cn(
                    "flex w-full mb-1 items-end gap-2 text-left animate-in fade-in duration-150 group",
                    msgType === "system_notice" ? "justify-center" : isOwn ? "justify-end" : "justify-start"
                )}>
                    {/* Hover actions: Only shown to the author and if the item isn't already deleted */}
                    {isOwn && !isDeleted && (
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to permanently erase this message?")) {
                                    channel?.push("delete_message", { message_id: msg.id });
                                }
                            }}
                            title="Delete message"
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all self-center p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 font-mono text-[9px] font-black uppercase tracking-wider cursor-pointer outline-none shrink-0 flex items-center gap-1 border border-transparent hover:border-rose-500/20"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    )}

                    <div className="flex flex-col max-w-[72%] gap-0.5 font-sans">
                        <div className={cn(
                            "rounded-2xl px-4 py-3 shadow-sm border text-md font-medium leading-relaxed break-words",
                            isDeleted
                                ? "bg-red-500/10 border-red-500/20 text-red-400 dark:bg-red-900/20 dark:border-red-800/50 italic"
                                : msgType === "system_notice"
                                    ? "bg-transparent border-transparent"
                                    : isOwn
                                        ? "bg-primary-container border-primary-container text-white rounded-br-none"
                                        : "bg-neutral-100 dark:bg-slate-800/90 border-black/5 dark:border-white/10 text-neutral-900 dark:text-slate-100 rounded-bl-none"
                        )}>
                            {isDeleted ? (
                                <p>🚫 Message deleted by sender 🚫</p>
                            ) : msgType === "system_notice" ? (
                                <div className="w-full py-2 flex items-center justify-center select-none font-mono text-[10px] tracking-wide text-neutral-500 uppercase animate-in fade-in duration-100">
                                    <span className="bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-lg px-3 py-1 font-bold text-center block text-neutral-600 dark:text-neutral-400">
                                        ⚡ {msg.text || textBody}
                                    </span>
                                </div>
                            ) : msgType === "image" ? (
                                <div className="space-y-1 w-64 sm:w-72 md:w-80">
                                    <SecureImagePreview
                                        mediaPayload={mediaPayload}
                                        base64PrivateKey={privateKey || localStorage.getItem("active_session_private_key")}
                                    />
                                    {textBody && textBody !== "[Attachment: Media Secured]" && (
                                        <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium px-1 mt-1.5 leading-normal">{textBody}</p>
                                    )}
                                </div>
                            ) : msgType === "file" ? (
                                <div className="space-y-1 w-64 sm:w-72 md:w-80">
                                    <SecureFileAttachment
                                        mediaPayload={mediaPayload}
                                        base64PrivateKey={privateKey || localStorage.getItem("active_session_private_key")}
                                        fallbackName={msg.fileName || "shared-document.pdf"}
                                    />
                                    {textBody && textBody !== "[Attachment: Media Secured]" && (
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium px-1 mt-1 leading-normal">{textBody}</p>
                                    )}
                                </div>
                            ) : (
                                <p>{textBody}</p>
                            )}
                        </div>

                        <span className="text-[12px] font-mono font-bold text-neutral-500 dark:text-neutral-400 px-1 select-none mt-0.5 flex items-center gap-1.5">
                            {msgType === "system_notice" ? "" : timestamp}
                            {msg.is_sending && "(sending...)"}
                            {isOwn && (
                                <span className="flex items-center text-[10px] shrink-0">
                                    {msg.is_sending ? (
                                        <span className="text-neutral-600 font-bold">...</span>
                                    ) : (msg.delivered_count > 0 || msg.last_delivered_at) ? (
                                        <span className="text-primary-container font-black tracking-tighter leading-none select-none">✓✓</span>
                                    ) : (
                                        <span className="text-neutral-500 font-black leading-none select-none">✓</span>
                                    )}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </ObservedMessageRow>
        </ObservedReadRow>
    );
}

function ObservedReadRow({ children, messageId, isOwn, isRead, onReadVisible }) {
    const readElementRef = useRef(null);

    useEffect(() => {
        // Only run read confirmation handshakes if it is a message written by someone else and it hasn't been read yet
        if (isOwn || isRead || !readElementRef.current || !onReadVisible) return;

        const readObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onReadVisible(messageId);
                    readObserver.disconnect();
                }
            },
            { threshold: 0.8 } // Forces 80% of the bubble text to be visible to count as genuinely read
        );

        readObserver.observe(readElementRef.current);
        return () => readObserver.disconnect();
    }, [messageId, isOwn, isRead, onReadVisible]);

    return (
        <div ref={readElementRef} className="w-full">
            {children}
        </div>
    );
}

function ObservedMessageRow({ children, messageId, isOwn, onVisible }) {
    const rowElementRef = useRef(null);

    useEffect(() => {
        // If it is our own message, or the tracker is already processed, skip inspection
        if (isOwn || !rowElementRef.current || !onVisible) return;

        const visibilityObserver = new IntersectionObserver(
            ([entry]) => {
                // Trigger delivery tracking only when the message bubble enters the viewport bounds
                if (entry.isIntersecting) {
                    onVisible(messageId);
                    visibilityObserver.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -5% 0px' } // Fires when 10% of bubble is on-screen
        );

        visibilityObserver.observe(rowElementRef.current);

        return () => visibilityObserver.disconnect();
    }, [messageId, isOwn, onVisible]);

    return (
        <div ref={rowElementRef} className="w-full">
            {children}
        </div>
    );
}
