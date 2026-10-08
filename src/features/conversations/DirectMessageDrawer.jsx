// src/features/conversations/DirectMessageDrawer.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Send, MessageSquare, Loader2, Lock, Minimize2, Maximize2 } from 'lucide-react';
import { Paperclip, FileImage } from 'lucide-react';
import { encryptAndUploadAttachment } from './utils/mediaCrypto';
import { useDirectMessageStore } from '../../store/useDirectMessageStore';
import { useConversationChannel } from './hooks/useConversationChannel';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { apiFetch } from '../../api/apiClient';
import { cn } from '../../lib/utils';

// Dummy substitute if you have a custom UserAvatar component; replace path if needed
const LocalUserAvatar = ({ user, className }) => (
    <img
        src={user?.avatar || user?.avatar_url || "/default-avatar.jpg"}
        className={cn("object-cover rounded-full", className)}
        alt="Profile"
    />
);

// Individual single chat window dock component unit
function SingleChatWindow({ chat, index }) {
    const { conversationId: initialConvId, recipient, isMinimized: initialMinimized } = chat;
    const closeDM = useDirectMessageStore((state) => state.closeDM);
    const toggleMinimize = useDirectMessageStore((state) => state.toggleMinimize);
    const setConvIdInStore = useDirectMessageStore((state) => state.setConversationIdForRecipient);
    const currentUser = useAuthStore((state) => state.user);

    const [activeConvId, setActiveConvId] = useState(initialConvId || null);
    const [isResolvingConv, setIsResolvingConv] = useState(false);
    const [typedText, setTypedText] = useState("");
    const [resolveError, setResolveError] = useState(null);

    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const fileInputRef = useRef(null);

    const messagesEndRef = useRef(null);
    const isResolvingRef = useRef(false);

    const chatKey = recipient?.id || recipient?.username || recipient?.handle || initialConvId;

    useEffect(() => {
        if (initialConvId) {
            setActiveConvId(String(initialConvId));
        }
    }, [initialConvId]);

    // Resolve or retrieve 1-on-1 conversation ID from server when missing
    const resolveConversation = useCallback(async () => {
        if (activeConvId) return activeConvId;
        if (isResolvingRef.current) return null;

        const username = (recipient?.username || recipient?.handle || recipient?.name || '').replace(/^@/, '');
        const userId = recipient?.id;

        if (!username && !userId) {
            setResolveError("User parameters un-extracted.");
            return null;
        }

        isResolvingRef.current = true;
        setIsResolvingConv(true);
        setResolveError(null);

        try {
            const res = await apiFetch('/conversations', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    recipient_id: userId
                })
            });

            const convData = res?.data || res;
            const convId = convData?.id || convData?.conversation_id || (typeof convData === 'string' ? convData : null);

            if (convId) {
                const strId = String(convId);
                setActiveConvId(strId);
                setConvIdInStore(chatKey, strId);
                return strId;
            } else {
                setResolveError("Could not resolve communication pipe.");
            }
        } catch (err) {
            console.warn('Could not resolve conversation thread ID:', err);
            setResolveError(err?.message || "Failed to establish chat pipe.");
        } finally {
            setIsResolvingConv(false);
            isResolvingRef.current = false;
        }
        return null;
    }, [activeConvId, recipient, chatKey, setConvIdInStore]);

    useEffect(() => {
        if (!activeConvId) {
            resolveConversation();
        }
    }, [activeConvId, resolveConversation]);

    // Bind Phoenix Socket real-time channel hook for active conversation
    const { messages, isJoining, joinError, sendMessage } = useConversationChannel(activeConvId);

    // Auto-scroll to bottom as new messages arrive
    useEffect(() => {
        if (!initialMinimized && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, initialMinimized]);

    const recipientName = recipient?.name || recipient?.display_name || `@${recipient?.username || recipient?.handle || 'User'}`;
    const recipientHandle = recipient?.handle || `@${recipient?.username || 'user'}`;

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!typedText.trim()) return;

        const textToSend = typedText.trim();
        setTypedText("");

        try {
            let targetConvId = activeConvId;
            if (!targetConvId) {
                targetConvId = await resolveConversation();
            }
            if (targetConvId) {
                await sendMessage(textToSend);
            }
        } catch (err) {
            console.error('Failed to send direct message:', err);
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

    const handleMediaPreview = async (msg) => {
        if (msg.type === "media" && msg.attachment_payload) {
            // Extract file hash and IV from the backend-delivered payload
            const fileHash = msg.attachment_payload.file_hash;
            const fileIV = msg.attachment_payload.file_iv;

            if (!fileHash || !fileIV) return null;

            // Retrieve the local Symmetric Key from your encrypted storage map
            const mediaKeyMap = useConversationChannel.getState().mediaDecryptionKeys;
            const mediaKey = mediaKeyMap[fileHash];

            if (!mediaKey) return null;

            // Convert stored base64 values back to raw buffers for crypto operations
            const ivBuffer = Uint8Array.from(atob(fileIV), c => c.charCodeAt(0));

            // Decrypt the filename locally in RAM for the user's UI display [1.4]
            let finalFileName = "unnamed_file.dat";
            if (msg.attachment_payload.encrypted_file_name) {
                try {
                    const encNameBuf = Uint8Array.from(atob(msg.attachment_payload.encrypted_file_name), c => c.charCodeAt(0));
                    const decryptedNameBuf = await window.crypto.subtle.decrypt(
                        { name: "AES-GCM", iv: ivBuffer },
                        mediaKey,
                        encNameBuf
                    );
                    finalFileName = new TextDecoder().decode(decryptedNameBuf);
                } catch (err) {
                    console.warn("Media filename decryption failed, using fallback:", err);
                }
            }

            // Return a standard anchor link pointing to the secure CDN URL (S3/R2) [1.4]
            return (
                <a
                    href={msg.attachment_payload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-neutral-900 px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors font-medium text-xs shadow-sm"
                >
                    {isImage(finalFileName) ? (
                        <FileImage className="w-4 h-4 text-neutral-600" />
                    ) : (
                        <FileIcon className="w-4 h-4 text-neutral-600" />
                    )}
                    <span>{finalFileName}</span>
                </a>
            );
        }
        return null;
    };

    const isImage = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    };

    return (
        <div
            className={cn(
                "pointer-events-auto w-72 sm:w-80 md:w-96 bg-white border border-neutral-200 rounded-t-2xl shadow-2xl transition-all duration-300 flex flex-col font-sans text-left shrink-0 select-none overflow-hidden",
                initialMinimized ? "h-14" : "h-[460px] sm:h-[500px]"
            )}
        >
            {/* 🎀 Premium Control Bar Ribbon Header (LinkedIn/Twitter Styled) */}
            <div className="px-3.5 py-3 bg-neutral-900 text-white rounded-t-2xl flex items-center justify-between shadow-md shrink-0">
                <div
                    onClick={() => toggleMinimize(chatKey)}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                >
                    <LocalUserAvatar
                        user={recipient}
                        className="w-8 h-8 rounded-full border border-white/10 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black truncate text-white">
                                {recipientName}
                            </h4>
                            <Lock className="w-3 h-3 text-emerald-400 shrink-0 stroke-[2.5px]" title="E2EE Protected Shield" />
                        </div>
                        <p className="text-[10px] font-mono text-neutral-400 truncate tracking-wide">
                            {recipientHandle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <button
                        type="button"
                        onClick={() => toggleMinimize(chatKey)}
                        className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10 outline-none"
                        title={initialMinimized ? "Expand chat" : "Minimize chat"}
                    >
                        {initialMinimized ? <Maximize2 className="w-3.5 h-3.5 stroke-[2.5px]" /> : <Minimize2 className="w-3.5 h-3.5 stroke-[2.5px]" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => closeDM(chatKey)}
                        className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10 outline-none"
                        title="Close chat"
                    >
                        <X className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </button>
                </div>
            </div>


            {/* Main Chat Body Window Canvas (Hidden when minimized) */}
            {!initialMinimized && (
                <>
                    {/* Continuous Scrolling History Viewport */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-neutral-50/50">
                        {isResolvingConv ? (
                            <div className="py-24 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-2 opacity-70">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                                <span>Opening conversation thread...</span>
                            </div>
                        ) : resolveError ? (
                            <div className="py-16 text-center text-rose-600 font-mono text-xs space-y-1 p-4 bg-rose-50/20 rounded-2xl border border-rose-100">
                                <p className="font-black uppercase tracking-wider">Chat Setup Error</p>
                                <p className="text-neutral-500 font-sans font-medium text-[11px] leading-normal">{resolveError}</p>
                            </div>
                        ) : isJoining ? (
                            <div className="py-24 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-2 opacity-70">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                                <span>Connecting live socket pipe...</span>
                            </div>
                        ) : joinError ? (
                            <div className="py-16 text-center text-rose-600 font-mono text-xs space-y-1 p-4 bg-rose-50/20 rounded-2xl border border-rose-100">
                                <p className="font-black uppercase tracking-wider">Chat Restricted</p>
                                <p className="text-neutral-500 font-sans font-medium text-[11px] leading-normal">{joinError}</p>
                            </div>
                        ) : messages.length > 0 ? (
                            messages.map((msg, idx) => {
                                const isMe = msg.author?.id === currentUser?.id || msg.sender_id === currentUser?.id || msg.author?.username === 'me';
                                const timestamp = msg.inserted_at
                                    ? new Date(msg.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : "";

                                return (
                                    <div
                                        key={msg.id || `msg-${idx}`}
                                        className={cn(
                                            "flex w-full mb-1.5 items-end gap-2 text-left animate-in fade-in duration-150",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {!isMe && (
                                            <LocalUserAvatar
                                                user={recipient}
                                                className="w-6 h-6 rounded-full border border-neutral-200 shrink-0 mb-0.5"
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
                                        <div className="flex flex-col max-w-[78%] gap-0.5">
                                            <div className={cn(
                                                "p-3 rounded-2xl text-xs font-medium border leading-relaxed break-words shadow-sm",
                                                isMe
                                                    ? "bg-primary-container text-white border-primary-container rounded-br-none"
                                                    : "bg-white border-neutral-200 text-neutral-800 rounded-bl-none"
                                            )}>
                                                {msg.text || msg.content || ""}
                                            </div>
                                            {timestamp && (
                                                <div className="flex justify-end font-mono text-[9px] text-neutral-400 px-1 select-none font-bold">
                                                    <span>{timestamp}</span>
                                                    {msg.is_sending && <span className="text-primary-container ml-1 animate-pulse">(sending...)</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-24 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-1 select-none opacity-60">
                                <MessageSquare className="w-5 h-5 stroke-[1.5px] text-neutral-300 mb-1" />
                                <span>Start a secure connection with</span>
                                <span className="font-black text-neutral-800">{recipientName}</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Ingress Text Input Row */}
                    <form onSubmit={handleFormSubmit} className="p-2.5 border-t border-neutral-200 bg-white flex gap-2 items-center select-none shrink-0">
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
                            placeholder={isUploadingMedia ? "Locking file container via AES-256..." : "Type an encrypted message..."}
                            value={typedText}
                            disabled={isUploadingMedia}
                            onChange={(e) => setTypedText(e.target.value)}
                            className="flex-1 bg-[#181818] border border-white/10 py-2 px-3 text-xs text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-500 font-medium font-sans disabled:opacity-40"
                        />

                        <button
                            type="submit"
                            disabled={!typedText.trim() || isUploadingMedia}
                            className="p-2.5 bg-primary-container text-white rounded-xl hover:brightness-105 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center cursor-pointer border-none"
                        >
                            <Send className="w-3.5 h-3.5 stroke-[2.5px]" />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

// 🚀 MULTI-DOCK FLOATING LAYER DOCKER CONTAINER
export function DirectMessageDrawer() {
    const activeChats = useDirectMessageStore((state) => state.activeChats) || [];

    if (activeChats.length === 0) return null;

    return (
        <div className="fixed bottom-0 right-3 sm:right-6 z-[9999] flex items-end gap-3 pointer-events-none max-w-full overflow-hidden p-1 select-none">
            {activeChats.map((chat, idx) => {
                const key = chat.conversationId || chat.recipient?.id || chat.recipient?.username || `chat-${idx}`;
                return (
                    <SingleChatWindow
                        key={key}
                        chat={chat}
                        index={idx}
                    />
                );
            })}
        </div>
    );
}