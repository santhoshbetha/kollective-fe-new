// src/store/usePostsStore.js
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useAccountsStore } from './useAccountsStore';

export const usePostsStore = create(
    immer((set) => ({
        // 🗄️ Centralized key-value lookup table for normalized post entities: { [postId]: postObject }
        entities: {},

        // 🚀 UNIFIED POST IMPORTER PIPELINE
        // Normalizes posts, extracts embedded author accounts, and recursively handles reblogs/replies
        importFetchedPosts: (rawPostsArray) => {
            if (!Array.isArray(rawPostsArray) || rawPostsArray.length === 0) return;

            const collectedAccounts = [];

            set((state) => {
                const processPost = (post) => {
                    if (!post || !post.id) return;

                    // 1. Extract embedded author for accounts store normalization
                    if (post.author) {
                        collectedAccounts.push(post.author);
                    }

                    // 2. Recursively import nested reblogs / boosted statuses
                    if (post.reblog) {
                        processPost(post.reblog);
                    }

                    // 3. Merge post into normalized entities dictionary
                    state.entities[post.id] = {
                        ...state.entities[post.id],
                        ...post,
                    };
                };

                rawPostsArray.forEach(processPost);
            });

            // 4. Batch import all extracted accounts into useAccountsStore
            if (collectedAccounts.length > 0) {
                useAccountsStore.getState().importFetchedAccounts(collectedAccounts);
            }
        },

        // ⚡ OPTIMISTIC MUTATION HELPERS
        updatePostEntity: (postId, updater) =>
            set((state) => {
                if (state.entities[postId]) {
                    const current = state.entities[postId];
                    state.entities[postId] = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
                }
            }),

        // 🗑️ ENTITY REMOVAL
        removePostEntity: (postId) =>
            set((state) => {
                delete state.entities[postId];
            }),
    }))
);
