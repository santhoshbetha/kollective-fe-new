import { create } from 'zustand';

export const useAudioSettingsStore = create((set) => ({
    // Default to true for social feeds to comply with browser autoplay protections
    isGlobalMuted: true,

    setGlobalMuted: (isMuted) => set({ isGlobalMuted: isMuted }),

    toggleGlobalMute: () => set((state) => ({ isGlobalMuted: !state.isGlobalMuted }))
}));
