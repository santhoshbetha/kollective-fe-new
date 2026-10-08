// src/features/conversations/DirectMessageDrawer.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDirectMessageStore } from '../../store/useDirectMessageStore';
import { useConversationChannel } from './hooks/useConversationChannel';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { apiFetch } from '../../api/apiClient';
import UserAvatar from '../../components/accounts/UserAvatar';
import {
    X,
    Send,
    MessageSquare,
    Loader2,
    Lock,
    Minimize2,
    Maximize2
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Individual single chat window dock component
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

    const messagesEndRef = useRef(null);
    const isResolvingRef = useRef(false);

    const chatKey = recipient?.id || recipient?.username || recipient?.handle || initialConvId;

    // Synchronize prop updates to state if conversationId changes
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
            setResolveError("User details unavailable.");
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
                    handle: username,
                    user_id: userId,
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
                setResolveError("Could not start conversation.");
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
            } else {
                console.error('No conversation ID resolved for recipient.');
            }
        } catch (err) {
            console.error('Failed to send direct message:', err);
        }
    };

    return (
        <div
            className={cn(
                "pointer-events-auto w-72 sm:w-80 md:w-96 bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 rounded-t-2xl shadow-2xl transition-all duration-300 flex flex-col font-sans text-left shrink-0 select-none",
                initialMinimized ? "h-14 overflow-hidden" : "h-[480px] sm:h-[520px]"
            )}
        >
            {/* Header Drawer Control Bar */}
            <div className="px-3.5 py-2.5 bg-neutral-900 text-white rounded-t-2xl flex items-center justify-between shadow-md">
                <div
                    onClick={() => toggleMinimize(chatKey)}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                >
                    <UserAvatar
                        user={recipient}
                        name={recipientName}
                        avatar={recipient?.avatar}
                        className="w-8 h-8 rounded-full border border-white/20 shrink-0"
                        showStatus={true}
                    />

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black truncate text-white">
                                {recipientName}
                            </h4>
                            <Lock className="w-3 h-3 text-emerald-400 shrink-0" title="End-to-End Encrypted Pipe" />
                        </div>
                        <p className="text-[10px] font-mono text-neutral-400 truncate">
                            {recipientHandle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => toggleMinimize(chatKey)}
                        className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10"
                        title={initialMinimized ? "Expand chat" : "Minimize chat"}
                    >
                        {initialMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => closeDM(chatKey)}
                        className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10"
                        title="Close chat"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Main Chat Body (Hidden when minimized) */}
            {!initialMinimized && (
                <>
                    {/* Viewport for messages */}
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar bg-neutral-50/50 dark:bg-[#111111]/50">
                        {isResolvingConv ? (
                            <div className="py-20 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                                <span>Opening conversation thread...</span>
                            </div>
                        ) : resolveError ? (
                            <div className="py-16 text-center text-rose-500 font-mono text-xs space-y-1 p-4">
                                <p className="font-bold">Chat Setup Error</p>
                                <p className="text-neutral-400 text-[11px]">{resolveError}</p>
                            </div>
                        ) : isJoining ? (
                            <div className="py-20 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                                <span>Connecting live socket pipe...</span>
                            </div>
                        ) : joinError ? (
                            <div className="py-16 text-center text-rose-500 font-mono text-xs space-y-1 p-4">
                                <p className="font-bold">Chat Restricted</p>
                                <p className="text-neutral-400 text-[11px]">{joinError}</p>
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
                                            "flex w-full mb-1.5 items-end gap-2 text-left",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {!isMe && (
                                            <UserAvatar
                                                user={recipient}
                                                name={recipientName}
                                                avatar={recipient?.avatar}
                                                className="w-6 h-6 rounded-full border border-black/10 shrink-0 mb-0.5"
                                                showStatus={false}
                                            />
                                        )}
                                        <div className="flex flex-col max-w-[80%] gap-0.5">
                                            <div className={cn(
                                                "p-2.5 rounded-2xl text-xs font-medium border leading-relaxed break-words shadow-sm",
                                                isMe
                                                    ? "bg-primary-container text-white border-primary-container rounded-br-none"
                                                    : "bg-white dark:bg-[#1e1e1e] border-black/5 dark:border-white/5 text-neutral-900 dark:text-white rounded-bl-none"
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
                            <div className="py-20 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-1 select-none">
                                <MessageSquare className="w-6 h-6 stroke-[1.5px] text-neutral-300 dark:text-neutral-600 mb-1" />
                                <span>Start a direct conversation with</span>
                                <span className="font-bold text-neutral-800 dark:text-white">{recipientName}</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input Bar */}
                    <form onSubmit={handleFormSubmit} className="p-2.5 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#141414] flex gap-2 items-center select-none">
                        <input
                            type="text"
                            placeholder={`Message ${recipientName}...`}
                            value={typedText}
                            onChange={(e) => setTypedText(e.target.value)}
                            className="flex-1 bg-neutral-100 dark:bg-[#1c1c1c] border border-black/10 dark:border-white/10 py-2 px-3 text-xs text-neutral-900 dark:text-white rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-400 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!typedText.trim()}
                            className="p-2 bg-primary-container text-white rounded-xl hover:brightness-105 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center cursor-pointer"
                        >
                            <Send className="w-3.5 h-3.5 stroke-[2.5px]" />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

// Multi-dock container exported for Mainlayout
export function DirectMessageDrawer() {
    const activeChats = useDirectMessageStore((state) => state.activeChats);

    if (!activeChats || activeChats.length === 0) return null;

    return (
        <div className="fixed bottom-0 right-3 sm:right-6 z-[9999] flex items-end gap-3 pointer-events-none max-w-full overflow-hidden p-1">
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
