// src/store/useDirectMessageStore.js
import { create } from 'zustand';

export const useDirectMessageStore = create((set, get) => ({
    // Backward-compatible tracking pointers for fallback single-chat architectures
    isOpen: false,
    recipient: null,
    conversationId: null,

    // High-performance dock array: [{ conversationId, recipient, isMinimized }]
    activeChats: [],

    /**
     * 🚀 UNIFIED OPEN DM ACTION (LinkedIn/Twitter Style):
     * Handles manual profile button clicks and automatic real-time incoming WebSocket triggers.
     * Brings selected window to front, expands minimized states, and restricts stack growth to 3 drawers [1.4].
     */
    openDM: (recipient, conversationId = null) => {
        const currentChats = get().activeChats || [];

        // 1️⃣ Normalize recipient metadata variations safely
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

        // 2️⃣ Strict multi-parameter matching check to prevent duplicate drawer fracturing
        const existingIndex = currentChats.findIndex(c => {
            if (targetConvId && c.conversationId && String(c.conversationId) === targetConvId) return true;
            if (cleanRecipient.id && c.recipient?.id && String(c.recipient.id) === cleanRecipient.id) return true;
            if (cleanRecipient.username && c.recipient?.username && c.recipient.username.toLowerCase() === cleanRecipient.username.toLowerCase()) return true;
            return false;
        });

        let updated = [];
        if (existingIndex !== -1) {
            // Un-minimize and reorder directly to the front of the viewport rack
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
            // Add a new chat window box and minimize background screens to preserve layout widths
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

    /**
     * Updates conversationId for a chat in activeChats once backend transaction handshakes complete
     */
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

    /**
     * ⚡ REAL-TIME WEBSOCKET INTERCEPTOR ENTRYPOINT:
     * Triggered directly inside PhoenixSocketContext.jsx when a `dm_badge_update` message drops [1.4].
     */
    receiveIncomingDM: (sender, conversationId) => {
        console.log("CHECKING RECEIVE INCOMING DM", sender, conversationId)
        if (!conversationId && !sender) return;

        // If backend returns loose parameters, restructure into a clean profile object shape
        const senderPayload = typeof sender === 'object' && sender !== null
            ? sender
            : { id: String(sender), username: `user_${sender}`, name: `Citizen #${sender}` };

        // Handoff to openDM logic to automatically display or maximize the drawer window [1.4]
        console.log("DM INCOMING", senderPayload, conversationId)
        get().openDM(senderPayload, conversationId);
    },

    /**
     * Closes an active conversation window and updates tracking focus states safely
     */
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

    /**
     * Minimizes or expands active quick-chat tab headers
     */
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

    /**
     * Immediate mass eviction of all open chat windows
     */
    closeAll: () => set({ activeChats: [], isOpen: false, recipient: null, conversationId: null })
}));
