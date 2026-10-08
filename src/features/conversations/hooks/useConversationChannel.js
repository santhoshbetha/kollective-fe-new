// src/features/conversations/hooks/useConversationChannel.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '../../../context/PhoenixSocketContext';
import { apiFetch } from '../../../api/apiClient';

export function useConversationChannel(conversationId) {
    const { socket } = useSocket();

    const [channel, setChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isJoining, setIsJoining] = useState(true);
    const [joinError, setJoinError] = useState(null);

    // Keep state reference to avoid stale closure traps during WebSocket callbacks
    const messagesRef = useRef([]);
    messagesRef.current = messages;

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            setIsJoining(false);
            setJoinError(null);
            return;
        }

        setIsJoining(true);
        setJoinError(null);

        let isSubscribed = true;

        // 1. Fetch initial message history via REST API
        async function fetchHistory() {
            try {
                const res = await apiFetch(`/conversations/${conversationId}/messages`);
                const history = Array.isArray(res) ? res : (res?.data || []);
                if (isSubscribed) {
                    setMessages(history);
                    setIsJoining(false);
                }
            } catch (err) {
                console.warn(`REST history fetch fallback for conversation ${conversationId}:`, err);
                if (isSubscribed) {
                    setIsJoining(false);
                }
            }
        }

        fetchHistory();

        // 2. Connect to Phoenix channel gateway for real-time WebSocket updates
        if (!socket) {
            return () => { isSubscribed = false; };
        }

        const topic = `conversation:${conversationId}`;
        const chatChannel = socket.channel(topic, {});

        chatChannel.join()
            .receive('ok', (payload) => {
                console.log(`🔒 Connected to Secure DM Pipe: ${topic}`);
                const history = payload?.messages || payload?.history;
                if (history && Array.isArray(history) && history.length > 0) {
                    setMessages(history);
                }
                if (isSubscribed) setIsJoining(false);

                // Send read receipt notification on initial join
                chatChannel.push('read_receipt', {});
            })
            .receive('error', (resp) => {
                console.error(`❌ Connection to DM Pipe ${topic} rejected:`, resp);
                if (isSubscribed) {
                    setJoinError(resp?.reason || 'Unauthorized access to private conversation.');
                    setIsJoining(false);
                }
            });

        // ⚡ RECEIVE LIVE INCOMING MESSAGES FROM WEBSOCKET STREAM
        chatChannel.on('new_message', (payload) => {
            console.log('✉️ Direct Message Received via WS:', payload);

            setMessages((prev) => {
                // De-duplication check: If message arrived optimistically via local nonce, replace temporary record
                if (payload.nonce && prev.some(m => m.nonce === payload.nonce)) {
                    return prev.map(m => m.nonce === payload.nonce ? payload : m);
                }
                if (prev.some(m => String(m.id) === String(payload.id))) return prev;
                return [...prev, payload];
            });

            // Mark conversation as read on active incoming message
            chatChannel.push('read_receipt', {});
        });

        // Listen for message read status updates from conversation partner
        chatChannel.on('message_read', (payload) => {
            console.log('👁️ Read receipt update:', payload);
        });

        setChannel(chatChannel);

        return () => {
            isSubscribed = false;
            console.log(`🔌 Securing DM channel node: ${topic}`);
            chatChannel.leave();
        };
    }, [socket, conversationId]);

    // 🚀 WRAPPED ASYNCHRONOUS MESSAGE SENDER (DUAL WS + REST TRANSPORT)
    const sendMessage = useCallback(async (textPayload) => {
        if (!conversationId) return Promise.reject('No conversation selected.');

        console.log("sendMessage q", conversationId, textPayload);
        const clientNonce = `nonce-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Structure a safe temporary optimistic entry to render instantly
        const optimisticMessage = {
            id: clientNonce,
            nonce: clientNonce,
            text: textPayload,
            content: textPayload,
            inserted_at: new Date().toISOString(),
            is_sending: true,
            author: {
                id: 'me',
                username: 'me'
            }
        };

        console.log("sendMessage 2", optimisticMessage);

        // Append to local state instantly for zero-latency UI response
        setMessages((prev) => [...prev, optimisticMessage]);

        // Attempt primary send over active WebSocket channel
        if (channel && channel.state === 'joined') {
            console.log("sendMessage 3")
            return new Promise((resolve, reject) => {
                channel.push('send_direct_message', { text: textPayload, nonce: clientNonce })
                    .receive('ok', (reply) => {
                        console.log("sendMessage 4", reply);
                        resolve(reply)
                    })
                    .receive('error', (err) => {
                        console.warn('WS send failed, attempting REST fallback...', err);
                        // Fallback to REST API if socket push fails
                        apiFetch(`/conversations/${conversationId}/messages`, {
                            method: 'POST',
                            body: JSON.stringify({ message: { text: textPayload, encrypted_content: textPayload }, nonce: clientNonce })
                        }).then(resolve).catch((apiErr) => {
                            setMessages((prev) => prev.filter(m => m.id !== clientNonce));
                            reject(apiErr);
                        });
                    });
            });
        }

        console.log("sendMessage 5")

        // Direct REST API fallback if WebSocket channel is not joined
        try {
            const reply = await apiFetch(`/conversations/${conversationId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ message: { text: textPayload, encrypted_content: textPayload }, nonce: clientNonce })
            });
            console.log("sendMessage reply", reply);
            return reply;
        } catch (err) {
            setMessages((prev) => prev.filter(m => m.id !== clientNonce));
            throw err;
        }
    }, [channel, conversationId]);

    return {
        messages,
        isJoining,
        joinError,
        sendMessage
    };
}

