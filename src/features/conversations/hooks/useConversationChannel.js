// src/features/conversations/hooks/useConversationChannel.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from '../../../context/PhoenixSocketContext';
import { usePostsStore } from '../../../store/usePostsStore';

export function useConversationChannel(conversationId) {
    const { socket } = useSocket();
    const importFetchedPosts = usePostsStore((state) => state.importFetchedPosts);

    const [channel, setChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isJoining, setIsJoining] = useState(true);
    const [joinError, setJoinError] = useState(null);

    // Keep state reference to avoid stale closure traps during WebSocket callbacks
    const messagesRef = useRef([]);
    messagesRef.current = messages;

    useEffect(() => {
        if (!socket || !conversationId) {
            setIsJoining(false);
            return;
        }

        setIsJoining(true);
        setJoinError(null);

        const topic = `conversation:${conversationId}`;
        const chatChannel = socket.channel(topic, {});

        // Connect to your Elixir conversation channel gateway
        chatChannel.join()
            .receive('ok', (payload) => {
                console.log(`🔒 Connected to Secure DM Pipe: ${topic}`);
                // Unpack chronological message history if supplied in the join token
                const history = payload?.messages || payload?.history || [];
                setMessages(history);
                setIsJoining(false);
            })
            .receive('error', (resp) => {
                console.error(`❌ Connection to DM Pipe ${topic} rejected:`, resp);
                setJoinError(resp?.reason || 'Unauthorized access to private conversation.');
                setIsJoining(false);
            });

        // ⚡ RECEIVE LIVE INCOMING MESSAGES
        chatChannel.on('new_message', (payload) => {
            console.log('✉️ Direct Message Received:', payload);

            setMessages((prev) => {
                // 🚀 DE-DUPLICATION CHECK: If the message arrived optimistically via local nonce, 
                // swap out the temporary entry with the final verified server payload record.
                if (payload.nonce && prev.some(m => m.nonce === payload.nonce)) {
                    return prev.map(m => m.nonce === payload.nonce ? payload : m);
                }
                if (prev.some(m => m.id === payload.id)) return prev;
                return [...prev, payload];
            });
        });

        setChannel(chatChannel);

        // Cleanup handler to safely disconnect when the conversation window unmounts
        return () => {
            console.log(`🔌 Securing DM channel node: ${topic}`);
            chatChannel.leave();
        };
    }, [socket, conversationId]);

    // 🚀 WRAPPED ASYNCHRONOUS MESSAGE SENDER
    const sendMessage = useCallback((textPayload) => {
        if (!channel) return Promise.reject('DM channel is unmounted.');

        const clientNonce = `nonce-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Structure a safe temporary optimistic entry to render instantly
        const optimisticMessage = {
            id: clientNonce,
            nonce: clientNonce,
            text: textPayload,
            inserted_at: new Date().toISOString(),
            is_sending: true,
            author: {
                id: 'me',
                username: 'me'
            }
        };

        // Append to the list frame instantly to keep the UI snappy
        setMessages((prev) => [...prev, optimisticMessage]);

        return new Promise((resolve, reject) => {
            channel.push('send_direct_message', { text: textPayload, nonce: clientNonce })
                .receive('ok', (reply) => resolve(reply))
                .receive('error', (err) => {
                    // Evict the optimistic card if the transaction fails over the network
                    setMessages((prev) => prev.filter(m => m.id !== clientNonce));
                    reject(err);
                });
        });
    }, [channel]);

    return {
        messages,
        isJoining,
        joinError,
        sendMessage
    };
}
