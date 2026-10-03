// src/features/conversations/DirectMessageView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import { useConversationChannel } from './hooks/useConversationChannel';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { Lock, Send, Loader2, ShieldX, CircleDot } from 'lucide-react';
import { cn } from "@/lib/utils";

export function DirectMessageView() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    const [typedMessage, setTypedText] = useState("");
    const virtuosoRef = useRef(null);

    // Bind real-time background channel receiver loops
    const { messages, isJoining, joinError, sendMessage } = useConversationChannel(conversationId);

    // 🚀 VIEWPORT POSITION ANCHORING: Automatically pin scroll layout to the bottom 
    // whenever a message list transaction triggers or an optimistic payload appends.
    useEffect(() => {
        if (virtuosoRef.current && messages.length > 0) {
            virtuosoRef.current.scrollToIndex({
                index: messages.length - 1,
                behavior: 'smooth'
            });
        }
    }, [messages.length]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!typedMessage.trim()) return;

        const textToSend = typedMessage.trim();
        setTypedText(""); // Clear local buffer input string instantly

        try {
            await sendMessage(textToSend);
        } catch (err) {
            console.error("Critical error routing dynamic DM parameter tokens:", err);
        }
    };

    if (isJoining) {
        return (
            <div className="py-36 flex flex-col items-center justify-center gap-3 text-neutral-400 font-mono text-xs select-none">
                <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                <span>DECRYPTING SECURE DIRECT DISCUSSION PHASES...</span>
            </div>
        );
    }

    if (joinError) {
        return (
            <div className="max-w-md mx-auto my-24 p-6 border border-rose-200 bg-rose-50/50 rounded-2xl text-center select-none animate-in zoom-in-95">
                <ShieldX className="w-8 h-8 text-rose-500 mx-auto mb-2 stroke-[1.75px]" />
                <h4 className="text-xs font-black font-mono text-rose-800 uppercase tracking-wider mb-1">Access Restrained</h4>
                <p className="text-xs text-rose-600 font-medium leading-relaxed mb-4">{joinError}</p>
                <button
                    onClick={() => navigate('/feed')}
                    className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-mono font-bold tracking-wide transition-all shadow-sm outline-none"
                >
                    Return to Feed
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto border border-neutral-200 rounded-3xl bg-white shadow-xl flex flex-col h-[650px] overflow-hidden transition-colors">

            {/* High-Security Encryption Banner Shield */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between select-none bg-neutral-50/50">
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600 stroke-[2.5px]" />
                    <h2 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-800">
                        Secure Conversation Node
                    </h2>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded">
                    <CircleDot className="w-3 h-3 animate-pulse" />
                    <span>E2E_CONNECTED</span>
                </div>
            </div>

            {/* Virtualized Discussion Viewport Core */}
            <div className="flex-1 min-h-0 relative p-4 bg-white">
                {messages.length > 0 ? (
                    <Virtuoso
                        ref={virtuosoRef}
                        data={messages}
                        initialTopMostItemIndex={messages.length - 1}
                        computeItemKey={(index, msg) => msg.id || `dm-row-${index}`}
                        increaseViewportBy={300}
                        overscan={100}
                        className="custom-scrollbar"
                        itemContent={(index, msg) => {
                            // Check if current row context belongs to active profile session
                            const isMe = msg.author?.id === currentUser?.id || msg.author?.username === 'me';
                            const timestamp = msg.inserted_at
                                ? new Date(msg.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : "00:00";

                            return (
                                <div className={cn(
                                    "flex w-full mb-3.5 items-end gap-2 animate-in fade-in duration-150",
                                    isMe ? "justify-end text-right" : "justify-start text-left"
                                )}>
                                    {!isMe && (
                                        <img src={msg.author?.avatar_url || "/default-avatar.jpg"} className="w-7 h-7 rounded-full object-cover border border-neutral-100 shrink-0 mb-1" alt="Avatar" />
                                    )}
                                    <div className="flex flex-col max-w-md gap-0.5">
                                        <div className={cn(
                                            "p-3.5 rounded-2xl text-sm font-medium border leading-relaxed break-words shadow-sm",
                                            isMe
                                                ? "bg-primary-container text-white border-primary-container rounded-br-none"
                                                : "bg-neutral-50 border-neutral-100 text-neutral-800 rounded-bl-none"
                                        )}>
                                            {msg.text || msg.content || ""}
                                        </div>
                                        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-neutral-400 select-none px-1">
                                            <span>{timestamp}</span>
                                            {msg.is_sending && (
                                                <span className="text-primary-container animate-pulse tracking-wide">(sending...)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono text-xs text-neutral-300 opacity-60 select-none">
                        // PRIVATE_DISCUSSION_LINE_INITIALIZED...
                    </div>
                )}
            </div>

            {/* Direct Message Input Bar Form */}
            <form onSubmit={handleFormSubmit} className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex gap-3 items-center select-none">
                <input
                    type="text"
                    placeholder="Type an encrypted transmission down the pipeline..."
                    value={typedMessage}
                    onChange={(e) => setTypedText(e.target.value)}
                    className="flex-1 bg-white border border-neutral-200 py-3 px-4 text-sm text-neutral-800 rounded-xl focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-neutral-300 transition-all font-medium"
                />
                <button
                    type="submit"
                    disabled={!typedMessage.trim()}
                    className="p-3 bg-primary-container text-white rounded-xl hover:brightness-105 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center shadow-sm"
                >
                    <Send className="w-4 h-4 stroke-[2.5px]" />
                </button>
            </form>
        </div>
    );
}
