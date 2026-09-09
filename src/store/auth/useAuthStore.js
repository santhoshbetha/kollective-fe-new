// src/store/auth/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useAuthStore = create(
    persist(
        immer((set, get) => ({
            // =========================================================================
            // 💾 1. PERSISTENT MATRIX ENTITIES (Serialized safely to browser disk)
            // =========================================================================
            token: null,          // JWT gate key string: "ey..."
            user: null,           // Authenticated user schema details object
            isAuthenticated: false,

            // =========================================================================
            // 🛑 2. VOLATILE MATRIX ENTITIES (Bypassed entirely from browser disk)
            // =========================================================================
            isHydrated: false,     // Tracks if Zustand finished loading localStorage keys
            authError: null,

            // =========================================================================
            // 🚀 3. IMMER ACTION MUTATORS (Character-Safe Session Lifecycle Controls)
            // =========================================================================

            // Action A: Commits credentials dynamically on successful login or session recovery
            setSession: (token, user) =>
                set((state) => {
                    state.token = token;
                    state.user = user;
                    state.isAuthenticated = true;
                    state.authError = null;
                }),

            // Action B: Sets error indicators if network validation fails
            setAuthError: (errorMessage) =>
                set((state) => {
                    state.authError = errorMessage;
                }),

            // Action C: 🚪 THE UNIFIED SECURE LOGOUT LIFECYCLE FLUSH
            // Wipes memory states, purges disk collections, and resets other sibling stores
            executeLogout: (queryClient, clearBufferActions) => {
                // Wipe local store parameters instantly
                set((state) => {
                    state.token = null;
                    state.user = null;
                    state.isAuthenticated = false;
                    state.authError = null;
                });

                // 🧼 Clear external sibling caches securely if hooks pass them down
                if (clearBufferActions) clearBufferActions();
                if (queryClient) {
                    // Destroys all sensitive user data rows cached inside TanStack Query
                    queryClient.clear();
                }
            },
        })),
        {
            name: 'kollective-auth-secure-matrix', // Unique key identity inside browser storage log maps
            storage: createJSONStorage(() => localStorage), // Pointing natively to browser disk arrays

            // 🎯 THE SELECTOR MATRIX PARTIALIZE FILTER:
            // Restricts disk mutations strictly to session validation entities.
            // Notice how we completely exclude volatile loading states and temporary errors!
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),

            // 🔄 HYDRATION WATCHDOG TRIGGER:
            // Automatically fires once the store finished reading historical keys from disk
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isHydrated = true;
                }
            },
        }
    )
);
