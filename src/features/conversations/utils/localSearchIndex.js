/**
 * 🔒 ZERO-KNOWLEDGE LOCAL ENGINES INDEXER
 * Caches plaintext messages strictly in local browser memory isolation space.
 */
const localMemoryCache = new Map();

export function indexDecryptedMessage(conversationId, messageId, plaintextBody, authorHandle) {
    if (!conversationId || !messageId || !plaintextBody) return;

    // Normalize and clean text tokens for perfect matching parameters queries
    const cleanText = plaintextBody.toLowerCase().trim();
    if (cleanText.startsWith("🚫") || cleanText.startsWith("🔒")) return; // Skip system tags

    if (!localMemoryCache.has(conversationId)) {
        localMemoryCache.set(conversationId, []);
    }

    const chatPool = localMemoryCache.get(conversationId);
    if (!chatPool.some(m => m.id === messageId)) {
        chatPool.push({
            id: messageId,
            text: cleanText,
            author: authorHandle || "citizen",
            timestamp: Date.now()
        });
    }
}

/**
 * Executes a lightning-fast client-side regex token search matrix sweep
 */
export function queryLocalChatIndex(conversationId, searchString) {
    if (!conversationId || !searchString.trim()) return [];

    const chatPool = localMemoryCache.get(conversationId) || [];
    const queryToken = searchString.toLowerCase().trim();

    return chatPool.filter(msg => msg.text.includes(queryToken));
}

export function clearLocalChatIndex(conversationId) {
    if (conversationId) localMemoryCache.delete(conversationId);
    else localMemoryCache.clear();
}
