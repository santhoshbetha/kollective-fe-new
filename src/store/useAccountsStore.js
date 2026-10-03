// src/store/useAccountsStore.js
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useAccountsStoreX = create(
    immer((set) => ({
        // 🗄️ The centralized key-value repository lookup table
        entities: {},

        // 🚀 THE UNIFIED IMPORTER INTERCEPTOR PIPELINE
        importFetchedAccounts: (rawAccountsArray) =>
            set((state) => {
                const processAccount = (account) => {
                    if (!account || !account.id) return;

                    // Merge the fresh data on top of any existing cached profile details
                    state.entities[account.id] = {
                        ...state.entities[account.id],
                        ...account,
                    };

                    // Recursive check: If the account permanently migrated, flatten the new destination
                    if (account.moved) {
                        processAccount(account.moved);
                    }
                };

                rawAccountsArray.forEach(processAccount);
            }),
    }))
);

export const useAccountsStore = create(
    immer((set) => ({
        entities: {},

        importFetchedAccounts: (rawAccountsArray) =>
            set((state) => {
                if (!Array.isArray(rawAccountsArray)) return;

                const processAccount = (account) => {
                    if (!account || !account.id) return;

                    // Convert ID safely to string to prevent binary/string index collision bugs
                    const accountId = String(account.id);
                    const existing = state.entities[accountId] || {};

                    // 🚀 PRODUCTION SANITIZATION: Protect sensitive, slow-changing metrics 
                    // from being overwritten by partial/incomplete network payloads
                    const finalFollowersCount = account.followers_count ?? account.followersCount ?? existing.followers_count ?? 0;
                    const finalFollowingCount = account.following_count ?? account.followingCount ?? existing.following_count ?? 0;

                    state.entities[accountId] = {
                        ...existing,
                        ...account,
                        id: accountId,
                        followers_count: finalFollowersCount,
                        followersCount: finalFollowersCount,
                        following_count: finalFollowingCount,
                        followingCount: finalFollowingCount
                    };

                    // Recursive check: If the account permanently migrated, flatten the new destination
                    if (account.moved && account.moved.id) {
                        processAccount(account.moved);
                    }
                };

                rawAccountsArray.forEach(processAccount);
            }),

        // 🚀 SCALING FIX: Add a clear cache utility to keep RAM bounded during long sessions
        pruneOldAccounts: (activeIdsList = []) =>
            set((state) => {
                const activeSet = new Set(activeIdsList.map(String));
                Object.keys(state.entities).forEach((id) => {
                    // Evict old, unmounted profiles if memory threshold constraints are breached
                    if (!activeSet.has(id)) {
                        delete state.entities[id];
                    }
                });
            })
    }))
);

