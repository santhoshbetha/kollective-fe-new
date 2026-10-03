// src/store/usePostsStore.js
import { create } from 'zustand';
import { useAccountsStore } from './useAccountsStore'; // Verify path fits your directory layout
import { immer } from 'zustand/middleware/immer';

export const usePostsStore = create(
    immer((set, get) => ({
        entities: {},
        feeds: {
            'all_activity': [],
            'voices': [],
            'popular': [],
            'following': []
        },

        /**
         * 🏆 UNIFIED PRODUCTION REFACTOR:
         * Combines your cross-store account extractors, recursive reblog deep mapping,
         * and optimistic flag protections with structural active feed key dividers.
         */
        importFetchedPosts: (rawPostsArray) => {
            if (!Array.isArray(rawPostsArray) || rawPostsArray.length === 0) return;

            const collectedAccounts = [];

            set((state) => {
                const nextEntities = { ...state.entities };

                const processPost = (post) => {
                    if (!post || !post.id) return;

                    // 1️⃣ Accounts normalization extraction channel
                    if (post.author) {
                        collectedAccounts.push(post.author);
                    }

                    // 2️⃣ Recursive descent: Treat the nested reblog target precisely like a root post
                    if (post.reblog) {
                        processPost(post.reblog);
                    }

                    // 3️⃣ Structural merge: Core entity preservation matrix guards
                    const existing = nextEntities[post.id] || {};

                    const isReblogged = post.reblogged ?? post.has_reblogged ?? existing.reblogged ?? existing.has_reblogged ?? false;
                    const isLiked = post.liked ?? post.has_liked ?? existing.liked ?? existing.has_liked ?? false;
                    const isBookmarked = post.bookmarked ?? post.isBookmarked ?? existing.bookmarked ?? existing.isBookmarked ?? false;

                    const incomingLikes = post.likes_count ?? post.likes ?? post.likesCount;
                    const existingLikes = existing.likes_count ?? existing.likes ?? existing.likesCount ?? 0;
                    const finalLikesCount = incomingLikes !== undefined ? incomingLikes : existingLikes;

                    console.log("usePostsStore: incomingLikes", incomingLikes);
                    console.log("usePostsStore: existingLikes", existingLikes);
                    console.log("usePostsStore: finalLikes", finalLikesCount);
                    console.log("usePostsStore: -------------------------------------");

                    const incomingReblogs = post.reblogs_count ?? post.reblogs ?? post.shares_count ?? post.shares ?? post.reblogsCount;
                    const existingReblogs = existing.reblogs_count ?? existing.reblogs ?? existing.shares_count ?? existing.shares ?? existing.reblogsCount ?? 0;
                    const finalReblogsCount = incomingReblogs !== undefined ? incomingReblogs : existingReblogs;

                    nextEntities[post.id] = {
                        ...existing,
                        ...post,
                        reblogged: isReblogged,
                        has_reblogged: isReblogged,
                        liked: isLiked,
                        has_liked: isLiked,
                        bookmarked: isBookmarked,
                        isBookmarked: isBookmarked,

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
                return { entities: nextEntities };
            });

            // 4️⃣ Batch commit extracted user profile identities over to accounts cache
            if (collectedAccounts.length > 0 && useAccountsStore?.getState()?.importFetchedAccounts) {
                useAccountsStore.getState().importFetchedAccounts(collectedAccounts);
            }
        },

        /**
         * Commits ordered sequential collection IDs into dedicated filter lanes
         */
        setFeedIds: (feedKey, idsArray = []) => {
            if (!feedKey) return;
            set((state) => ({
                feeds: {
                    ...state.feeds,
                    [feedKey]: idsArray
                }
            }));
        },

        /**
         * Updates an individual post entity in the store dictionary
         */
        updatePostEntity: (postId, updater) => {
            if (!postId) return;
            set((state) => {
                const current = state.entities[postId];
                if (!current) return state;
                const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
                return {
                    entities: {
                        ...state.entities,
                        [postId]: updated
                    }
                };
            });
        },

        /**
         * Removes a post entity from the store dictionary
         */
        removePostEntity: (postId) => {
            if (!postId) return;
            set((state) => {
                const nextEntities = { ...state.entities };
                delete nextEntities[postId];
                return { entities: nextEntities };
            });
        },

        purgeStoreDataMatrix: () => {
            set({
                entities: {},
                feeds: { 'all_activity': [], 'voices': [], 'popular': [], 'following': [] }
            });
        }
    }))
);