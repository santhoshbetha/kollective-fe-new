// src/features/conversations/hooks/useDeliveryReceipts.js
import { useEffect, useRef, useCallback } from 'react';

/**
 * ⚡ REAL-TIME DELIVERY CONTROLLER HOOK
 * Tracks onscreen visibility metrics and emits atomic "mark_delivered" packet events.
 */
export function useDeliveryReceipts(channel, activeMessages, currentUserId) {
    // Maintain a unique local tracking set to prevent redundant delivery updates
    const processedMessageIdsRef = useRef(new Set());
    const deliveryQueueRef = useRef(new Set());
    const throttleTimerRef = useRef(null);

    // 📡 FLUSH ACCUMULATED PIPELINE DISPATCHES
    const flushDeliveryQueue = useCallback(() => {
        if (deliveryQueueRef.current.size === 0 || !channel) return;

        const messageIdsToSubmit = Array.from(deliveryQueueRef.current);
        
        // Clear queue arrays before the async network lane to block race conditions
        deliveryQueueRef.current.clear();

        try {
            // Push the single aggregated array block over your open WebSocket frame
            channel.push("mark_delivered", { message_ids: messageIdsToSubmit });
            
            // Mark as processed locally
            messageIdsToSubmit.forEach(id => processedMessageIdsRef.current.add(id));
        } catch (err) {
            console.error("Delivery receipt packet transmission rejected:", err);
            // Re-enqueue items on hardware networking drops
            messageIdsToSubmit.forEach(id => deliveryQueueRef.current.add(id));
        }
    }, [channel]);

    // Throttler helper to prevent UI lag spikes under rapid scroll conditions
    const enqueueMessageForDelivery = useCallback((messageId) => {
        if (processedMessageIdsRef.current.has(messageId)) return;
        
        deliveryQueueRef.current.add(messageId);

        if (!throttleTimerRef.current) {
            throttleTimerRef.current = setTimeout(() => {
                throttleTimerRef.current = null;
                flushDeliveryQueue();
            }, 400); // 400ms aggregation frame
        }
    }, [flushDeliveryQueue]);

    // Reset tracking cache targets whenever the active conversation container changes
    useEffect(() => {
        processedMessageIdsRef.current.clear();
        deliveryQueueRef.current.clear();
        if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
            throttleTimerRef.current = null;
        }
    }, [channel]);

    return { enqueueMessageForDelivery };
}
