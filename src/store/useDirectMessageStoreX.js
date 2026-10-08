// src/store/useDirectMessageStore.js
import { create } from 'zustand';

export const useDirectMessageStore = create((set, get) => ({
    // Backward-compatible properties
    isOpen: false,
    recipient: null,
    conversationId: null,

    // Array of active chat windows: [{ conversationId, recipient, isMinimized }]
    activeChats: [],

    // Open a DM with a recipient. If already open, bring to front / restore.
    openDM: (recipient, conversationId = null) => {
        const currentChats = get().activeChats || [];

        // Normalize recipient input (handles string username or user object)
        const recipientObj = typeof recipient === 'string'
            ? { username: recipient.replace(/^@/, ''), handle: `@${recipient.replace(/^@/, '')}` }
            : (recipient || {});

        const rawUsername = (recipientObj.username || recipientObj.handle || recipientObj.name || 'User').replace(/^@/, '');
        const recipientName = recipientObj.name || recipientObj.display_name || rawUsername;
        const recipientHandle = recipientObj.handle || `@${rawUsername}`;

        const cleanRecipient = {
            id: recipientObj.id ? String(recipientObj.id) : null,
            name: recipientName,
            username: rawUsername,
            handle: recipientHandle,
            avatar: recipientObj.avatar || recipientObj.avatar_url || ''
        };

        const targetConvId = conversationId ? String(conversationId) : null;

        // Strict non-null matching check
        const existingIndex = currentChats.findIndex(c => {
            if (targetConvId && c.conversationId && String(c.conversationId) === targetConvId) return true;
            if (cleanRecipient.id && c.recipient?.id && String(c.recipient.id) === cleanRecipient.id) return true;
            if (cleanRecipient.username && c.recipient?.username && c.recipient.username.toLowerCase() === cleanRecipient.username.toLowerCase()) return true;
            return false;
        });

        let updated = [];
        if (existingIndex !== -1) {
            // Un-minimize and bring to front
            updated = [...currentChats];
            const existingChat = updated[existingIndex];
            updated.splice(existingIndex, 1);
            updated.unshift({
                ...existingChat,
                conversationId: targetConvId || existingChat.conversationId,
                recipient: { ...existingChat.recipient, ...cleanRecipient },
                isMinimized: false
            });
        } else {
            // Add new chat window drawer
            const newChat = {
                conversationId: targetConvId,
                recipient: cleanRecipient,
                isMinimized: false
            };
            updated = [newChat, ...currentChats.map(c => ({ ...c, isMinimized: true }))].slice(0, 3);
        }

        set({
            activeChats: updated,
            isOpen: updated.length > 0,
            recipient: updated[0]?.recipient || null,
            conversationId: updated[0]?.conversationId || null
        });
    },

    // Update conversationId for a chat in activeChats once resolved
    setConversationIdForRecipient: (recipientKey, convId) => set((state) => {
        const keyStr = String(recipientKey || '').toLowerCase();
        const convStr = String(convId);
        const updated = state.activeChats.map(c => {
            const matches =
                String(c.recipient?.id || '').toLowerCase() === keyStr ||
                String(c.recipient?.username || '').toLowerCase() === keyStr.replace(/^@/, '') ||
                String(c.recipient?.handle || '').toLowerCase() === keyStr;
            return matches ? { ...c, conversationId: convStr } : c;
        });
        return {
            activeChats: updated,
            conversationId: updated[0]?.conversationId || state.conversationId
        };
    }),

    // Auto-open or bring to front when an incoming DM arrives via Phoenix WebSocket
    receiveIncomingDM: (sender, conversationId) => {
        if (!conversationId && !sender) return;
        get().openDM(sender, conversationId);
    },

    closeDM: (key) => set((state) => {
        if (!key) {
            const updated = state.activeChats.slice(1);
            return {
                activeChats: updated,
                isOpen: updated.length > 0,
                recipient: updated[0]?.recipient || null,
                conversationId: updated[0]?.conversationId || null
            };
        }

        const keyStr = String(key).toLowerCase();
        const updated = state.activeChats.filter(c => {
            const matchConv = c.conversationId && String(c.conversationId).toLowerCase() === keyStr;
            const matchHandle = c.recipient?.handle && String(c.recipient.handle).toLowerCase() === keyStr;
            const matchUsername = c.recipient?.username && String(c.recipient.username).toLowerCase() === keyStr.replace(/^@/, '');
            const matchId = c.recipient?.id && String(c.recipient.id).toLowerCase() === keyStr;
            return !(matchConv || matchHandle || matchUsername || matchId);
        });
        return {
            activeChats: updated,
            isOpen: updated.length > 0,
            recipient: updated[0]?.recipient || null,
            conversationId: updated[0]?.conversationId || null
        };
    }),

    toggleMinimize: (key) => set((state) => {
        if (!key && state.activeChats.length > 0) {
            const updated = state.activeChats.map((c, i) => i === 0 ? { ...c, isMinimized: !c.isMinimized } : c);
            return { activeChats: updated };
        }

        const keyStr = String(key).toLowerCase();
        const updated = state.activeChats.map(c => {
            const matches =
                (c.conversationId && String(c.conversationId).toLowerCase() === keyStr) ||
                (c.recipient?.handle && String(c.recipient.handle).toLowerCase() === keyStr) ||
                (c.recipient?.username && String(c.recipient.username).toLowerCase() === keyStr.replace(/^@/, '')) ||
                (c.recipient?.id && String(c.recipient.id).toLowerCase() === keyStr);
            return matches ? { ...c, isMinimized: !c.isMinimized } : c;
        });
        return { activeChats: updated };
    }),

    closeAll: () => set({ activeChats: [], isOpen: false, recipient: null, conversationId: null })
}));

