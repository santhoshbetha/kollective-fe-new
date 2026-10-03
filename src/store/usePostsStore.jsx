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
        importFetchedPostsX: (rawPostsArray) => {
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

                    // 🚀 FIX 1: Prioritize local optimistic REBLOG states over stale incoming network payloads
                    const incomingReblogged = post.reblogged ?? post.has_reblogged;
                    const isReblogged = incomingReblogged !== undefined
                        ? incomingReblogged
                        : (existing.reblogged ?? existing.has_reblogged ?? false);


                    // 🚀 FIX 1: Prioritize local optimistic LIKE states over stale incoming network payloads
                    const incomingLiked = post.liked ?? post.has_liked;
                    const isLiked = incomingLiked !== undefined
                        ? incomingLiked
                        : (existing.liked ?? existing.has_liked ?? false);


                    // 🔥 CRITICAL FIX: Prioritize local optimistic state over stale incoming network payloads
                    // If the post exists locally, retain its state unless explicitly overridden by the server
                    const incomingBookmarked = post.bookmarked ?? post.isBookmarked;
                    const isBookmarked = incomingBookmarked !== undefined
                        ? incomingBookmarked
                        : (existing.bookmarked ?? existing.isBookmarked ?? false);


                    // 🚀 FIX 2: Ensure counter integrity checks rely on the guarded `isLiked` state logic
                    const incomingLikes = post.likes_count ?? post.likes ?? post.likesCount;

                    //    let finalLikesCount = incomingLikes;
                    const existingLikes = existing.likes_count ?? existing.likes ?? existing.likesCount ?? 0;

                    // 🚀 PRODUCTION SYNCHRONIZATION MIRROR:
                    // If this item is a reblog wrapper card, force its interaction metrics 
                    // to mirror the inner source content post exactly. This prevents counter-compounding bugs.
                    const finalLikesCount = post.reblog && nextEntities[post.reblog.id]
                        ? nextEntities[post.reblog.id].likes_count
                        : incomingLikes !== undefined ? incomingLikes : existingLikes;


                    // 🚀 FIX 2: Ensure counter integrity checks rely on the guarded `isReblogged` state logic
                    const incomingReblogs = post.reblogs_count ?? post.reblogs ?? post.shares_count ?? post.shares ?? post.reblogsCount;
                    let finalReblogsCount = incomingReblogs;

                    const existingReblogs = existing.reblogs_count ?? existing.reblogs ?? existing.shares_count ?? existing.shares ?? existing.reblogsCount ?? 0;

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

                    // 🚀 STATE GUARD: Prioritize local optimistic REBLOG states over stale incoming network payloads
                    const incomingReblogged = post.reblogged ?? post.has_reblogged;
                    const isReblogged = incomingReblogged !== undefined
                        ? incomingReblogged
                        : (existing.reblogged ?? existing.has_reblogged ?? false);

                    // 🚀 STATE GUARD: Prioritize local optimistic LIKE states over stale incoming network payloads
                    const incomingLiked = post.liked ?? post.has_liked;
                    const isLiked = incomingLiked !== undefined
                        ? incomingLiked
                        : (existing.liked ?? existing.has_liked ?? false);

                    // 🚀 STATE GUARD: Prioritize local optimistic BOOKMARK states over stale incoming network payloads
                    const incomingBookmarked = post.bookmarked ?? post.isBookmarked;
                    const isBookmarked = incomingBookmarked !== undefined
                        ? incomingBookmarked
                        : (existing.bookmarked ?? existing.isBookmarked ?? false);

                    // Gather raw network metric data variations
                    const incomingLikes = post.likes_count ?? post.likes ?? post.likesCount;
                    const existingLikes = existing.likes_count ?? existing.likes ?? existing.likesCount ?? 0;

                    const incomingReblogs = post.reblogs_count ?? post.reblogs ?? post.shares_count ?? post.shares ?? post.reblogsCount;
                    const existingReblogs = existing.reblogs_count ?? existing.reblogs ?? existing.shares_count ?? existing.shares ?? existing.reblogsCount ?? 0;

                    // 🚀 PRODUCTION SYNCHRONIZATION MIRROR:
                    // If this item is a reblog wrapper card, force its interaction metrics 
                    // to mirror the inner source content post exactly. This prevents counter-compounding bugs.
                    const finalLikesCount = post.reblog && nextEntities[post.reblog.id]
                        ? nextEntities[post.reblog.id].likes_count
                        : (incomingLikes !== undefined ? incomingLikes : existingLikes);

                    // Ensure that if a post is liked locally but the arriving network payload says otherwise,
                    // the store enforces the higher metric boundary cleanly to prevent counter drop-downs.
                    /*let finalLikesCount = incomingLikes;
                    if (incomingLikes !== undefined && existing.liked !== undefined) {
                        if (existing.liked && !incomingLiked) {
                            finalLikesCount = Math.max(incomingLikes, existingLikes || 1);
                        }
                    } else if (incomingLikes === undefined) {
                        finalLikesCount = existingLikes;
                    }*/

                    const finalReblogsCount = post.reblog && nextEntities[post.reblog.id]
                        ? nextEntities[post.reblog.id].reblogs_count
                        : (incomingReblogs !== undefined ? incomingReblogs : existingReblogs);

                    // Ensure that if a post is reblogged locally but the arriving network payload says otherwise,
                    // the store enforces the higher metric boundary cleanly to prevent counter drop-downs.
                    /*let finalReblogsCount = incomingReblogs;
                    if (incomingReblogs !== undefined && existing.reblogged !== undefined) {
                        if (existing.reblogged && !incomingReblogs) {
                            finalReblogsCount = Math.max(incomingReblogs, existingReblogs || 1);
                        }
                    } else if (incomingReblogs === undefined) {
                        finalReblogsCount = existingReblogs;
                    }*/

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