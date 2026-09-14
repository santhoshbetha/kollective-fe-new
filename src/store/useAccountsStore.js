// src/store/useAccountsStore.js
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useAccountsStore = create(
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
