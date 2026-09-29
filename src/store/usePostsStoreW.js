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
                //   const nextEntities = { ...state.entities };

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

                    // 3. Merge post into normalized entities dictionary while preserving optimistic engagement flags
                    const existing = state.entities[post.id] || {};
                    const isReblogged = post.reblogged ?? post.has_reblogged ?? existing.reblogged ?? existing.has_reblogged ?? false;
                    const isLiked = post.liked ?? post.has_liked ?? existing.liked ?? existing.has_liked ?? false;
                    const isBookmarked = post.bookmarked ?? existing.bookmarked ?? false;

                    // 🚀 THE COUNTS SYNC FIX: Determine the absolute highest valid count in memory.
                    // This prevents an incoming stagnant background query from rolling back an active optimistic user click.
                    const incomingLikesCount = post.likes_count ?? post.likes ?? post.likesCount ?? 0;
                    const existingLikesCount = existing.likes_count ?? existing.likes ?? existing.likesCount ?? 0;
                    const finalLikesCount = Math.max(incomingLikesCount, existingLikesCount);

                    console.log("usePostsStore: incomingLikesCount", incomingLikesCount);
                    console.log("usePostsStore: existingLikesCount", existingLikesCount);
                    console.log("usePostsStore: finalLikesCount", finalLikesCount);
                    console.log("usePostsStore: -------------------------------------")

                    // Reblogs / Shares Counts Sync Safeguard
                    const incomingReblogsCount = post.reblogs_count ?? post.reblogs ?? post.shares_count ?? post.shares ?? 0;
                    const existingReblogsCount = existing.reblogs_count ?? existing.reblogs ?? existing.shares_count ?? existing.shares ?? 0;
                    const finalReblogsCount = Math.max(incomingReblogsCount, existingReblogsCount);

                    state.entities[post.id] = {
                        ...existing,
                        ...post,
                        reblogged: isReblogged || existing.reblogged || existing.has_reblogged || false,
                        has_reblogged: isReblogged || existing.reblogged || existing.has_reblogged || false,
                        liked: isLiked || existing.liked || existing.has_liked || false,
                        has_liked: isLiked || existing.liked || existing.has_liked || false,
                        bookmarked: isBookmarked || existing.bookmarked || false,

                        // 🚀 FORCE COHESIVE PROPERTY SYNCHRONIZATION ACROSS ALL NAMING VARIATIONS:
                        likes: finalLikesCount,
                        likes_count: finalLikesCount,
                        likesCount: finalLikesCount,

                        reblogs: finalReblogsCount,
                        reblogs_count: finalReblogsCount,
                        shares: finalReblogsCount,
                        shares_count: finalReblogsCount
                    };
                };

                rawPostsArray.forEach(processPost);

                // Return unified store entities state
                // return { entities: nextEntities };
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
