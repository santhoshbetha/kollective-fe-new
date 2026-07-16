// src/hooks/useTimelineSocket.js (Part 1 of 2)
import { useEffect } from 'react';
import { Socket } from 'phoenix';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useStore } from '../store/useStore';
import { useTimelineBufferStore } from '../store/useTimelineBufferStore';
import { usePresenceStore } from '../store/usePresenceStore';
import { Presence } from 'phoenix';
import { useQueryClient } from '@tanstack/react-query';

export function useTimelineSocket() {
    const queryClient = useQueryClient();

    // 🔐 Read authentication parameters
    const token = useAuthStore((state) => state.token);

    // 🎛️ Read layout positions dynamically from your merged useStore
    const homeFeedTab = useStore((state) => state.homeFeedTab); // 'All Activity' | 'Voices' | 'Popular' | 'Following'
    const communitiesTab = useStore((state) => state.communitiesTab); // 'Local' | 'State' | 'Country' | 'World'

    // 📥 Get buffer mutation methods from your separate store
    const bufferPost = useTimelineBufferStore((state) => state.bufferPost);

    useEffect(() => {
        if (!token) return;

        const socket = new Socket('ws://localhost:4000/socket', { params: { token } });
        socket.connect();

        // Connect to a unified user notification stream channel
        const channel = socket.channel(`timeline:home`, {});

        const presenceChannel = socket.channel('user:public', {});
        const phoenixPresence = new Presence(presenceChannel);

        phoenixPresence.onSync(() => {
            usePresenceStore.getState().syncPresence(phoenixPresence);
        });

        presenceChannel.join();

        channel.join();

        // 📡 Handle new posts broadcasted by Elixir
        channel.on('new_post', (payload) => {
            const newPost = payload.post; // E.g., { id: 123, type: "voice", isFollowing: true, scope: "local" }

            // 🔄 DYNAMIC EVALUATION: Evaluate if the post belongs to the tab the user is actively viewing
            let matchesCurrentTab = false;

            if (homeFeedTab === 'All Activity') {
                matchesCurrentTab = true;
            } else if (homeFeedTab === 'Voices' && newPost.type === 'voice') {
                matchesCurrentTab = true;
            } else if (homeFeedTab === 'Following' && newPost.isFollowing === true) {
                matchesCurrentTab = true;
            } else if (homeFeedTab === 'Popular' && newPost.isPopular === true) {
                matchesCurrentTab = true;
            }

            // 📥 If it matches the user's active viewport context, update the tab-specific TanStack cache buffer
            if (matchesCurrentTab) {
                queryClient.setQueryData(['timeline', 'home', homeFeedTab, 'buffer'], (oldBuffer = []) => {
                    return [newPost, ...oldBuffer].slice(0, 50); // Safe unshift + defensive 50-item limit
                });
            }
        });

        // ⚡ Handle real-time blind review summons pushes
        channel.on('jury_assignment', (payload) => {
            useStore.getState().setJuryAlert(payload);
        });

        // 🚪 Handle account authentication drops from server
        channel.on('session_revoked', () => {
            useAuthStore.getState().executeGlobalLogout(queryClient);
        });

        // Inside your useTimelineSocket.js hook callback section
        channel.on('new_circle', (payload) => {
            const newCircle = payload.circle; // E.g., { id: 99, name: "Austin Mutual Aid", scope: "local" }

            // Normalize the scopes to match the UI Tab casing
            const activeTabScope = useStore.getState().communitiesTab.toLowerCase(); // "local" | "state" | etc.

            if (newCircle.scope === activeTabScope) {
                queryClient.setQueryData(['communities', 'feed', useStore.getState().communitiesTab, 'buffer'], (oldBuffer = []) => {
                    return [newCircle, ...oldBuffer].slice(0, 50);
                });
            }
        });

        // Inside your src/hooks/useTimelineSocket.js channel configuration blocks
        channel.on('new_notification', (payload) => {
            const newNotif = payload.notification; // E.g., { id: 88, type: "like", actorName: "Alex", ... }

            queryClient.setQueryData(['notifications', 'history'], (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page, index) =>
                        index === 0
                            ? { ...page, notifications: [newNotif, ...page.notifications].slice(0, 50) } // Prepend directly to page 0
                            : page
                    ),
                };
            });
        });

        channel.on('poll_tally_updated', (payload) => {
            // payload: { poll_id: 1, total_votes: 152, options: [{id: 10, votes_count: 52}, ...] }
            queryClient.setQueryData(['polls', 'stream'], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        polls: page?.polls?.map((poll) =>
                            poll.id === payload.poll_id
                                ? { ...poll, totalVotes: payload.total_votes, options: payload.options }
                                : poll
                        )
                    }))
                };
            });
        });


        // 🧼 Tear down connections safely when tabs swap, paths redirect, or user signs out
        return () => {
            channel.leave();
            presenceChannel.leave();
            socket.disconnect();
        };
    }, [token, homeFeedTab, communitiesTab, queryClient]);
}
