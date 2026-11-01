// src/store/useAccountsStore.js
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useAccountsStoreX = create(
    immer((set) => ({
        entities: {},
        following_ids: ['followed-user-777'],
        followingIds: ['followed-user-777'],

        importFetchedAccounts: (rawAccountsArray) =>
            set((state) => {
                const processAccount = (account) => {
                    if (!account || !account.id) return;

                    state.entities[account.id] = {
                        ...state.entities[account.id],
                        ...account,
                    };

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
        following_ids: ['followed-user-777'],
        followingIds: ['followed-user-777'],

        setFollowingIds: (ids = []) =>
            set((state) => {
                const normalized = Array.from(new Set(['followed-user-777', ...ids.map(String)]));
                state.following_ids = normalized;
                state.followingIds = normalized;
            }),

        importFetchedAccounts: (rawAccountsArray) =>
            set((state) => {
                if (!Array.isArray(rawAccountsArray)) return;

                const processAccount = (account) => {
                    if (!account || !account.id) return;

                    const accountId = String(account.id);
                    const existing = state.entities[accountId] || {};

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

                    if (account.following === true) {
                        if (!state.following_ids.includes(accountId)) {
                            state.following_ids.push(accountId);
                        }
                        if (!state.followingIds.includes(accountId)) {
                            state.followingIds.push(accountId);
                        }
                    } else if (account.following === false) {
                        state.following_ids = state.following_ids.filter((id) => id !== accountId);
                        state.followingIds = state.followingIds.filter((id) => id !== accountId);
                    }

                    if (account.moved && account.moved.id) {
                        processAccount(account.moved);
                    }
                };

                rawAccountsArray.forEach(processAccount);
            }),

        pruneOldAccounts: (activeIdsList = []) =>
            set((state) => {
                const activeSet = new Set(activeIdsList.map(String));
                Object.keys(state.entities).forEach((id) => {
                    if (!activeSet.has(id)) {
                        delete state.entities[id];
                    }
                });
            })
    }))
);
