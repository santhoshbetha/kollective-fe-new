// src/store/usePresenceStore.js
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Presence } from 'phoenix';

export const usePresenceStore = create(
    immer((set, get) => ({
        // Store raw presence keys flatly: { "userId_42": true }
        activeList: {},

        // Atomic selector method for components to consume cleanly
        isUserOnline: (userId) => !!get().activeList[String(userId)],

        // 📡 Synchronize the state object using Phoenix Presence list utils
        syncPresence: (presenceInstance) =>
            set((state) => {
                const freshList = {};

                // presenceInstance.list turns raw tracking metas into clean loops
                presenceInstance.list((userId, _metas) => {
                    freshList[String(userId)] = true;
                });

                state.activeList = freshList; // Safe, instant overwrite mutation
            }),
    }))
);
