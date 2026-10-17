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
import { ChatKeyRecoveryDialog } from '../../features/conversations/components/ChatKeyRecoveryDialog';
import { CreateGroupChatModal } from '../../features/conversations/components/CreateGroupChatModal';
import InviteGroupMemberModal from '../../features/conversations/components/InviteGroupMemberModal';
import { apiFetch } from '../../api/apiClient';
import { cn } from '../../lib/utils';
import {
    MessageCircle, Send, Smile, Paperclip, Search, Phone, Video,
    Info, ImageIcon, Users, UserPlus, ArrowLeft, Loader2, Lock, ShieldX,
    PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { SecureImagePreview } from '../../features/conversations/components/SecureImagePreview';
import { SecureFileAttachment } from '../../features/conversations/components/SecureFileAttachment';
import { useDeliveryReceipts } from '../../features/conversations/hooks/useDeliveryReceipts';

export default function MessagesPage() {
    const navigate = useNavigate();
    const { conversationId: routeConvId } = useParams();
    const currentUser = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // Holds numeric integer 0 to 100
    const [isUploadingChunks, setIsUploadingChunks] = useState(false);


    const [activeTypers, setActiveTypers] = useState({});
    const typingTimeoutRef = useRef(null);

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
    const messagesContainerRef = useRef(null);

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

    // 📡 Real-Time Socket Event Receivers Binding Layout:
    useEffect(() => {
        if (!channel) return;

        channel.on("typing_receipt_broadcast", (payload) => {
            setActiveTypers(prev => {
                const updated = { ...prev };
                if (payload.is_typing) {
                    updated[payload.user_id] = payload.username;
                } else {
                    delete updated[payload.user_id];
                }
                return updated;
            });
        });

    }, [channel]);

    // ⌨️ KEYSTROKE INTERCEPT HEARTBEAT DISPATCHER:
    const handleComposerInputChange = (textValue) => {
        setMessageText(textValue);
        if (!channel) return;

        // Dispatch typing start signal immediately
        channel.push("typing_heartbeat", { is_typing: true });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Stop typing indicator automatically after 1.5 seconds of keyboard silence
        typingTimeoutRef.current = setTimeout(() => {
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
                    />
                </div>
            </div>
        );
    }

    const handleSecureFileAttachmentUpload = async (targetFile) => {
        if (!targetFile || !selectedConversation) return;

        setIsUploadingChunks(true);
        setUploadProgress(0);

        try {
            const recipientPublicKey = currentConversation.partner_public_key;

            // Execute asynchronous client-side 1MB slicing and direct regional streaming loops
            const trackingManifest = await fragmentAndUploadFile(
                targetFile,
                recipientPublicKey,
                (progressPercent) => setUploadProgress(progressPercent) // Trigger reactive hooks
            );

            // Submit the finalized cryptographic structural manifest block down your open WebSocket channel frame
            channel.push("new_group_comment", {
                text: "[Attachment: Media Secured]",
                media_payload: trackingManifest
            });

        } catch (err) {
            console.error("Fragmentation pipe interrupted:", err);
        } finally {
            setIsUploadingChunks(false);
            setUploadProgress(0);
        }
    };

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
                                        type="button"
                                        onClick={toggleSidebar}
                                        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                        className="hidden lg:flex h-9 w-9 p-0 items-center justify-center border border-black/10 dark:border-white/10 
                                        hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 
                                        hover:text-neutral-900 dark:hover:text-white shrink-0 rounded-md"
                                    >
                                        {isSidebarCollapsed ?
                                            <PanelLeftOpen className="h-5 w-5" /> :
                                            <PanelLeftClose className="h-5 w-5" />}
                                    </button>

                                    {/* Create Group Button */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsGroupModalOpen(true)}
                                        title="Create Group"
                                        className={cn(
                                            "flex items-center gap-2 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-mono font-bold tracking-wide uppercase text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white",
                                            isSidebarCollapsed ? "md:p-2 md:h-9 md:w-9" : ""
                                        )}
                                    >
                                        <Users className="h-3.5 w-3.5 stroke-[2.5px] shrink-0" />
                                        <span className={isSidebarCollapsed ? "md:hidden" : ""}>New Group</span>
                                    </Button>
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
                                                    handleSelectConversation(conversation.id);
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
                                        socketMessages.map((msg, index) => (
                                            <MessageRow
                                                key={msg.id || `msg-${index}`}
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

                                    {isUploadingChunks && (
                                        <div className="w-full space-y-1.5 select-none animate-in slide-in-from-bottom-2 duration-150 text-left font-mono">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-neutral-500 tracking-wider">
                                                <span className="flex items-center gap-1.5 text-primary-container">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Streaming Fragmented Cipher Matrix...
                                                </span>
                                                <span>{uploadProgress}%</span>
                                            </div>

                                            {/* 📊 Outside Gauge Progress Rail Track Container */}
                                            <div className="w-full h-1.5 bg-[#181818] border border-white/5 rounded-full overflow-hidden relative">
                                                <div
                                                    className="h-full bg-primary-container rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

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
                                                onChange={(e) => handleComposerInputChange(e.target.value)}
                                                className="h-11 bg-white dark:bg-background border-black/10 dark:border-white/10 focus:border-primary-container text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-xl"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                                                        e.preventDefault();
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
        if (!msg.expires_at || isExpired) return;

        const deadlineMs = (msg.expires_at * 1000) - Date.now();
        if (deadlineMs <= 0) return;

        const selfDestructTimer = setTimeout(() => {
            setIsExpired(true);
        }, deadlineMs);

        return () => clearTimeout(selfDestructTimer);
    }, [msg.expires_at, isExpired]);

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
            onReadVisible={() => channel?.push("read_receipt", { message_id: msg.id })}
        >
            <ObservedMessageRow
                messageId={msg.id}
                isOwn={isOwn}
                onVisible={enqueueMessageForDelivery}
            >
                <div className={cn(
                    "flex w-full mb-1 items-end gap-2 text-left animate-in fade-in duration-150 relative group",
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
                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 bg-[#1f1f1f] border border-white/5 hover:text-rose-400 p-1.5 rounded-lg text-neutral-500 font-mono text-[9px] font-black uppercase tracking-wider cursor-pointer outline-none z-10 mx-2"
                            style={{ [isOwn ? 'left' : 'right']: '-45px' }}
                        >
                            Delete
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
