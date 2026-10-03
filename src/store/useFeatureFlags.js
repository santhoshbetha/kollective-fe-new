// src/store/useFeatureFlags.js
import { create } from 'zustand';

export const useFeatureFlagsStore = create((set, get) => ({
    // 🗄️ Unified key-value feature dictionary repository state
    flags: {
        registration_open: true,
        voice_broadcast_active: true,
        media_transcoding: true,
        public_feeds_enabled: true
    },

    /**
     * Bulk-hydrates the complete flag mapping array collected on app mount
     */
    setAllFlags: (flagsArray) => {
        if (!Array.isArray(flagsArray)) return;
        const nextFlags = {};
        flagsArray.forEach(f => {
            if (f?.key) nextFlags[f.key] = Boolean(f.enabled);
        });
        set({ flags: { ...get().flags, ...nextFlags } });
    },

    /**
     * 🚀 ATOMIC STREAM SYNCHRONIZER:
     * Directly intercepts individual network update messages passed via WebSockets
     */
    updateSingleFlag: (key, enabled) => {
        if (!key) return;
        console.log(`🔌 [FEATURE FLAG SHIELD ACTIVATED]: ${key} -> ${enabled}`);
        set((state) => ({
            flags: {
                ...state.flags,
                [key]: Boolean(enabled)
            }
        }));
    },

    /**
     * Evaluates whether a target key is active
     */
    isFeatureEnabled: (key) => {
        const state = get();
        return state.flags[key] ?? false;
    }
}));
