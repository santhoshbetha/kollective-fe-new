import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    isHydrated: false, // 👈 Tracks if token recovery has finished

    setSession: (token, user) => set({
        token,
        user,
        isAuthenticated: true,
        isHydrated: true
    }),

    clearSession: () => set({
        token: null,
        user: null,
        isAuthenticated: false,
        isHydrated: true
    }),

    // Action to mark hydration complete if no token was found
    setHydrated: () => set({ isHydrated: true })
}));
