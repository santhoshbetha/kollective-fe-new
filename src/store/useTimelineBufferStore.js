import { create } from 'zustand';

export const useTimelineBufferStore = create((set) => ({
    // Holds raw post objects pushed from Elixir
    bufferedPosts: [],

    // Track if banner should display
    hasNewItems: false,

    // Add an item to the staging area
    bufferPost: (post) => set((state) => {
        const updatedBuffer = [post, ...state.bufferedPosts];
        return {
            bufferedPosts: updatedBuffer,
            hasNewItems: updatedBuffer.length > 0,
        };
    }),

    // Clear everything out once flushed
    clearBuffer: () => set({
        bufferedPosts: [],
        hasNewItems: false
    }),
}));
