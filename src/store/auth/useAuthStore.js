// src/store/auth/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import queryClient from '../../api/queryClient';
import { useTimelineBufferStore } from '../useTimelineBufferStore';

export const buildPersonalAccount = (user) => {
    if (!user) return null;
    return {
        id: user.id ? String(user.id) : 'personal',
        type: 'personal',
        name: user.name || user.username || 'Personal Account',
        username: user.username || (user.handle ? user.handle.replace('@', '') : 'user'),
        handle: user.handle || (user.username ? `@${user.username}` : '@user'),
        avatar: user.avatar || '/default-avatar.jpg',
        role: user.role || 'citizen',
        badge_type: user.badge_type || 'citizen',
        state: user.state || user.political_location?.state || null,
        state_updated_at: user.state_updated_at || user.political_location?.state_updated_at || null,
    };
};

export const DEFAULT_MOCK_USER = {
    id: 'usr-1',
    name: 'Julian Thorne1',
    username: 'j_thorne',
    handle: '@j_thorne',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c',
    email: 'j_thorne@kollective.social',
    role: 'root_admin',
    badge_type: 'citizen',
    memberships: [
        {
            organization: {
                id: 'org-metro-union',
                name: 'Metro Tenant Union',
                username: 'metro_tenants',
                handle: '@metro_tenants',
                avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=120&q=80',
                badge_type: 'organization',
                bio: 'City-wide union coordinating grassroots housing action and tenant defense.'
            },
            role: 'Lead Organizer',
            status: 'active'
        },
        {
            organization: {
                id: 'org-kollective-press',
                name: 'Kollective Press Guild',
                username: 'kollective_press',
                handle: '@kollective_press',
                avatar: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=120&q=80',
                badge_type: 'organization',
                bio: 'Decentralized federation of independent civic journalists and researchers.'
            },
            role: 'Editor',
            status: 'active'
        }
    ]
};



export const useAuthStore = create(
    persist(
        immer((set, get) => ({
            // =========================================================================
            // 💾 1. PERSISTENT MATRIX ENTITIES (Serialized safely to browser disk)
            // =========================================================================
            token: null,          // JWT gate key string: "ey..."
            user: null,           // Authenticated user schema details object
            isAuthenticated: false,
            activeAccount: null,  // { id, type: 'personal' | 'organization', name, username, handle, avatar, role? }
            permissions: [],      // Assigned permissions for current active tenant/account context

            // =========================================================================
            // 🛑 2. VOLATILE MATRIX ENTITIES (Bypassed entirely from browser disk)
            // =========================================================================
            isHydrated: false,     // Tracks if Zustand finished loading localStorage keys
            isLoggingIn: false,    // Tracks active login transition state
            isLoggingOut: false,   // Tracks active logout transition state
            authError: null,

            // =========================================================================
            // 🚀 3. IMMER ACTION MUTATORS (Character-Safe Session Lifecycle Controls)
            // =========================================================================

            // Action A: Commits credentials dynamically on successful login or session recovery
            setSession: (token, user) =>
                set((state) => {
                    state.token = token;
                    state.user = user;
                    state.isAuthenticated = !!token;
                    state.authError = null;

                    // Automatically default activeAccount to personal if not yet set
                    if (!state.activeAccount || state.activeAccount.type === 'personal') {
                        state.activeAccount = buildPersonalAccount(user);
                    }

                    // 💡 Removed manual localStorage sets. The `persist` partialize layer 
                    // below handles everything automatically under 'kollective-auth-secure-matrix'
                }),

            // 📌 Utility: Sets the currently active tenant/account and its assigned permissions
            setAuthContext: (token, activeAccount, permissions) =>
                set((state) => {
                    if (token) state.token = token;
                    if (activeAccount) state.activeAccount = activeAccount;
                    if (permissions) state.permissions = permissions;
                }),

            // 🔄 Mutates profile information on the current active account
            updateActiveProfile: (profileData) =>
                set((state) => {
                    if (state.activeAccount) {
                        state.activeAccount = { ...state.activeAccount, ...profileData };
                    }
                    if (state.activeAccount?.type === 'personal' && state.user) {
                        state.user = { ...state.user, ...profileData };
                    }
                }),

            // Action B: Sets error indicators if network validation fails
            setAuthError: (errorMessage) =>
                set((state) => {
                    state.authError = errorMessage;
                }),

            setHydrated: () =>
                set((state) => {
                    state.isHydrated = true;
                }),

            setIsLoggingIn: (val) =>
                set((state) => {
                    state.isLoggingIn = val;
                }),

            setIsLoggingOut: (val) =>
                set((state) => {
                    state.isLoggingOut = val;
                }),

            // Action C: 🚪 THE UNIFIED SECURE LOGOUT LIFECYCLE FLUSH
            executeLogout: () => {
                // 1. Wipe in-memory states safely via Immer
                set((state) => {
                    state.token = null;
                    state.user = null;
                    state.isAuthenticated = false;
                    state.authError = null;
                    state.permissions = [];
                    state.activeAccount = null;
                    state.isLoggingOut = false;
                    state.isLoggingIn = false;
                });

                // 2. Clean out brother/sister timeline store buffers
                const clearBuffer = useTimelineBufferStore.getState().clearBuffer;
                if (typeof clearBuffer === 'function') clearBuffer();

                // 3. Clear TanStack Query Cache instantly (no hook arguments required!)
                queryClient.clear();

                // 4. Force state persistence layer to thoroughly purge browser disk arrays
                useAuthStore.persist.clearStorage();
            },

            // Universal alias for layouts, scripts, and network interception hooks
            executeGlobalLogout: () => {
                get().executeLogout();
            },

            clearSession: () => {
                get().executeLogout();
            },
        })),
        {
            name: 'kollective-auth-secure-matrix',
            storage: createJSONStorage(() => localStorage),

            // 🎯 Persists session validation entities and active account context across page reloads
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                activeAccount: state.activeAccount,
                permissions: state.permissions,
            }),

            // 🔄 HYDRATION WATCHDOG TRIGGER
            onRehydrateStorage: () => (state) => {
                setTimeout(() => {
                    const currentState = state || useAuthStore.getState() || {};
                    const updates = { isHydrated: true };
                    const isDev = import.meta.env.DEV;

                    if (isDev) {
                        // If app started fresh in dev/mock environment, seed default user
                        if (!currentState.user && !currentState.token) {
                            updates.user = { ...DEFAULT_MOCK_USER };
                            updates.token = 'mock-jwt-token-initial';
                            updates.isAuthenticated = true;
                        } else if (currentState.user && (!currentState.user.memberships || currentState.user.memberships.length === 0)) {
                            updates.user = {
                                ...currentState.user,
                                memberships: DEFAULT_MOCK_USER.memberships
                            };
                        }

                        // Base determination targeting sub-profile resolution layers
                        const targetUser = updates.user || currentState.user;
                        if (!currentState.activeAccount && targetUser) {
                            updates.activeAccount = buildPersonalAccount(targetUser);
                        }
                    } else {
                        // 🌐 PRODUCTION LIFECYCLE SANITIZATION
                        if (!currentState.isAuthenticated || !currentState.token) {
                            updates.token = null;
                            updates.user = null;
                            updates.isAuthenticated = false;
                            updates.activeAccount = null;
                            updates.permissions = [];
                        }
                    }

                    useAuthStore.setState(updates);
                }, 0);
            },
        }
    )
);

