// src/features/events/hooks/useEventChannel.js
import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../../../context/PhoenixSocketContext';
import { usePostsStore } from '../../../store/usePostsStore';

export function useEventChannel(eventId) {
    const { socket, isAuthenticated } = useSocket();
    const queryClient = useQueryClient();
    const importFetchedPosts = usePostsStore((state) => state.importFetchedPosts);

    const [channel, setChannel] = useState(null);
    const [comments, setComments] = useState([]);
    const [joinError, setJoinError] = useState(null);
    const [isJoining, setIsProcessing] = useState(true);

    const queryKey = useMemo(() => ['event', eventId, 'comments'], [eventId]);

    useEffect(() => {
        if (!socket || !eventId) {
            setIsProcessing(false);
            return;
        }

        setIsProcessing(true);
        setJoinError(null);

        // 1️⃣ Connect straight to your Elixir FeedChannel gateway room mapping
        const eventTopic = `event:${eventId}`;
        const eventRoomChannel = socket.channel(eventTopic, {});

        eventRoomChannel.join()
            .receive('ok', (initialPayload) => {
                console.log(`📡 Successfully connected to Event Room: ${eventTopic}`);

                // Unpack the preloaded comments array passed in the join handshake token [INDEX]
                const initialComments = initialPayload?.comments || [];
                setComments(initialComments);

                // Push comments to your normalized Zustand store dictionary as well
                if (initialComments.length > 0) {
                    importFetchedPosts(initialComments);
                }

                setIsProcessing(false);
            })
            .receive('error', (resp) => {
                console.error(`❌ Connection to Event Room ${eventTopic} rejected:`, resp);
                setJoinError(resp?.reason || 'Access denied to this event stream.');
                setIsProcessing(false);
            });

        // 2️⃣ LISTEN FOR REAL-TIME NEW COMMENTS
        // Captures clean comments or shadow-ban variations seamlessly [INDEX]
        eventRoomChannel.on('new_comment', (commentPayload) => {
            console.log('💬 Real-time Comment Received inside Event Room:', commentPayload);

            // Append incoming message to our localized stream timeline view
            setComments((prev) => {
                if (prev.some(c => c.id === commentPayload.id)) return prev;
                return [...prev, commentPayload];
            });

            // Synchronize global entity store indices instantly
            importFetchedPosts([commentPayload]);
        });

        // 3️⃣ LISTEN FOR DYNAMIC ORGANIZER REVALIDATIONS
        eventRoomChannel.on('event_details_updated', (updatedEventPayload) => {
            console.log('🔄 Organizer synchronized fresh event specs:', updatedEventPayload);

            // Invalidate TanStack cache keys to force non-blocking layout header updates
            queryClient.invalidateQueries({ queryKey: ['event', eventId, 'details'] });
        });

        setChannel(eventRoomChannel);

        // 4️⃣ CLEANUP CYCLE: Gracefully disconnect when the user leaves the page to prevent memory leaks
        return () => {
            console.log(`🔌 Leaving Event Room topic: ${eventTopic}`);
            eventRoomChannel.leave();
        };
    }, [socket, eventId, queryClient, importFetchedPosts]);

    // Asynchronous sender trigger wrapper targeting push events
    const submitComment = useCallback((textPayload) => {
        if (!channel) return Promise.reject('Channel is unmounted.');

        return new Promise((resolve, reject) => {
            channel.push('new_comment_dispatched', { text: textPayload })
                .receive('ok', (reply) => resolve(reply))
                .receive('error', (err) => reject(err));
        });
    }, [channel]);

    return {
        channel,
        comments,
        joinError,
        isJoining,
        submitComment
    };
}
