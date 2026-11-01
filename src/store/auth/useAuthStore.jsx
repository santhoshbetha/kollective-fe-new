// src/store/auth/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import queryClient from '../../api/queryClient';
import { useTimelineBufferStore } from '../useTimelineBufferStore';

/**
 * 🏭 ACCOUNT FACTORY MATRIX ABSTRACTION
 * Normalizes personal identity telemetry fields from active user payloads
 */
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

/**
 * 🧪 SEEDED DEVELOPMENT USER PARAMETERS BLUEPRINT
 */
export const DEFAULT_MOCK_USER = {
    id: 'usr-1',
    name: 'Julian Thorne1',
    username: 'j_thorne',
    handle: '@j_thorne',
    state: 'CA',
    street_address: '123 Market St',
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

const getInitialAuthState = () => {
    if (typeof localStorage === 'undefined') {
        return { token: null, user: null, isAuthenticated: false, activeAccount: null };
    }
    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_token');
    const userStr = localStorage.getItem('auth_user');
    let user = null;
    if (userStr) {
        try { user = JSON.parse(userStr); } catch (_) {}
    }
    return {
        token,
        user,
        isAuthenticated: !!(token && user),
        activeAccount: buildPersonalAccount(user)
    };
};
const initialAuth = getInitialAuthState();

export const useAuthStore = create(
    persist(
        immer((set, get) => ({
            // =========================================================================
            // 💾 1. PERSISTENT MATRIX ENTITIES (Serialized safely to browser disk)
            // =========================================================================
            token: initialAuth.token,
            user: initialAuth.user,
            isAuthenticated: initialAuth.isAuthenticated,
            activeAccount: initialAuth.activeAccount,
            permissions: [],

            // =========================================================================
            // 🛑 2. VOLATILE MATRIX ENTITIES (Bypassed entirely from browser disk)
            // =========================================================================
            isHydrated: false,
            isLoggingIn: false,
            isLoggingOut: false,
            authError: null,

            // =========================================================================
            // 🚀 3. IMMER ACTION MUTATORS (Character-Safe Session Lifecycle Controls)
            // =========================================================================

            setSession: (token, user) =>
                set((state) => {
                    state.token = token;
                    state.user = user;
                    state.isAuthenticated = !!token;
                    state.authError = null;

                    if (!state.activeAccount || state.activeAccount.type === 'personal') {
                        state.activeAccount = buildPersonalAccount(user);
                    }
                }),

            setAuthContext: (token, activeAccount, permissions) =>
                set((state) => {
                    if (token) state.token = token;
                    if (activeAccount) state.activeAccount = activeAccount;
                    if (permissions) state.permissions = permissions;
                }),

            setActiveAccount: (activeAccount) =>
                set((state) => {
                    state.activeAccount = activeAccount;
                }),

            rotateSession: (token, activeAccount, user) =>
                set((state) => {
                    if (token) state.token = token;
                    if (activeAccount) state.activeAccount = activeAccount;
                    if (user) state.user = user;
                }),

            updateActiveProfile: (profileData) =>
                set((state) => {
                    if (state.activeAccount) {
                        state.activeAccount = { ...state.activeAccount, ...profileData };
                    }
                    if (state.activeAccount?.type === 'personal' && state.user) {
                        state.user = { ...state.user, ...profileData };
                    }
                }),

            /**
             * 🎭 DYNAMIC WORKSPACE ACCOUNT FOCUS INTERCEPTOR (Immer Implementation)
             * Safely swaps contextual header focuses between corporate assets and individual identities
             */
            switchActiveAccountFocus: (targetOrgId) =>
                set((state) => {
                    if (!state.user) return;

                    if (!targetOrgId) {
                        // Re-establish native individual identity baseline credentials 
                        state.activeAccount = buildPersonalAccount(state.user);
                        return;
                    }

                    // Lookup valid matched organization memberships access credentials paths
                    const matchedMembership = state.user.memberships?.find(
                        m => m.organization?.id === targetOrgId
                    );

                    if (matchedMembership?.organization) {
                        const org = matchedMembership.organization;
                        state.activeAccount = {
                            id: org.id,
                            type: 'organization',
                            name: org.name,
                            username: org.username || org.handle,
                            avatar: org.avatar,
                            role: matchedMembership.role || 'contributor'
                        };
                    }
                }),
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
                const token = get().token;
                if (token && typeof window !== 'undefined') {
                    try {
                        const apiOrigin = import.meta.env?.VITE_API_ORIGIN || (import.meta.env?.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : '');
                        const API_HOST = apiOrigin || (import.meta.env?.VITE_API_URL || 'http://127.0.0.1:4000').replace(/\/api\/v1\/?$/, '');
                        fetch(`${API_HOST}/api/users/logout`, {
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).catch(() => {});
                    } catch (e) {
                        // Ignore network errors on logout
                    }
                }

                // 1. Wipe in-memory states safely via Immer mutability draft targets
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

                // 2. Clean out brother/sister timeline store buffers memory streams cleanly
                const clearBuffer = useTimelineBufferStore.getState().clearBuffer;
                if (typeof clearBuffer === 'function') clearBuffer();

                // 3. Clear TanStack Query Cache instantly to prevent stale user leaks
                queryClient.clear();

                // 4. Force state persistence layer to thoroughly purge browser disk arrays
                useAuthStore.persist.clearStorage();

                // 5. 🔐 Purge zero-knowledge active session cryptographic private key
                localStorage.removeItem('active_session_private_key');
            },

            // Universal aliases mapping across endpoints, layers, and network interception hooks
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

            // 🎯 Persists session validation entities and active account context safely across page reloads
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
                    const isAuthRoute = typeof window !== 'undefined' && ['/login', '/signup', '/register'].some(p => window.location.pathname.startsWith(p));
                    const isDev = import.meta.env.DEV && import.meta.env.VITE_DISABLE_MOCK_AUTH !== 'true' && !isAuthRoute;

                    if (isDev) {
                        // If app started fresh in dev/mock environment, seed default user metrics
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

                        if (isDev && currentState.user && !currentState.user.state) {
                            updates.user = {
                                ...(updates.user || currentState.user),
                                state: DEFAULT_MOCK_USER.state,
                                street_address: (updates.user || currentState.user).street_address || DEFAULT_MOCK_USER.street_address
                            };
                        }

                        // Base determination targeting sub-profile resolution layers
                        const targetUser = updates.user || currentState.user;
                        if (!currentState.activeAccount && targetUser) {
                            updates.activeAccount = buildPersonalAccount(targetUser);
                        }
                    } else {
                        // 🌐 PRODUCTION LIFECYCLE SANITIZATION SECURITY CHECKS
                        if (!currentState.isAuthenticated || !currentState.token) {
                            const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
                            const storedUserStr = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_user') : null;
                            if (storedToken && storedUserStr) {
                                try {
                                    const parsedUser = JSON.parse(storedUserStr);
                                    updates.token = storedToken;
                                    updates.user = parsedUser;
                                    updates.isAuthenticated = true;
                                    updates.activeAccount = currentState.activeAccount || buildPersonalAccount(parsedUser);
                                } catch (_) {
                                    updates.token = null;
                                    updates.user = null;
                                    updates.isAuthenticated = false;
                                    updates.activeAccount = null;
                                    updates.permissions = [];
                                }
                            } else {
                                updates.token = null;
                                updates.user = null;
                                updates.isAuthenticated = false;
                                updates.activeAccount = null;
                                updates.permissions = [];
                            }
                        } else if (!currentState.activeAccount && currentState.user) {
                            updates.activeAccount = buildPersonalAccount(currentState.user);
                        }
                    }

                    useAuthStore.setState(updates);
                }, 0);
            },
        }
    )
);
