// src/features/timeline/usePriorityFiltration.js
import { useMemo, useEffect } from 'react';
import { usePostsStore } from '../../store/usePostsStore';

/**
 * 🧮 TIME-DECAY RANKING VECTOR ENGINE (Reblog Resolution Architecture)
 */
export function calculatePostPriorityScore(post, constraints = {}) {
    if (!post) return 0;

    // 🚀 TARGET TARGET RESOLUTION FALLTHROUGH: 
    // If the post is a reblog, score the inner target content node, not the outer envelope shell.
    const isReblog = Boolean(post.reblog && post.reblog.id);
    const target = isReblog ? post.reblog : post;

    // 1. Urgency Multipliers (Handles voice alerts and priority broadcasts)
    const isUrgent = Boolean(target.category === 'voice' || target.voice_url || target.is_urgent || post.category === 'voice');
    const urgencyWeight = (isUrgent && constraints.mode !== 'popular') ? 500 : 0;

    // 2. Proximity Affinity
    let locationScore = 0;
    if (constraints.userLocation && target.location && constraints.mode !== 'popular') {
        locationScore = constraints.userLocation === target.location ? 150 : 0;
    }

    // 3. Engagement Velocity Weightings (Likes + Boosts + Comments)
    const likes = target.likes_count || target.likes || 0;
    const reblogs = target.reblogs_count || target.reblogs || target.shares || 0;
    const replies = target.replies_count || target.replies || target.commentsCount || 0;

    // Scale weights based on active tab metrics
    const totalEngagement = constraints.mode === 'popular'
        ? (likes * 2.0) + (reblogs * 3.5) + (replies * 2.5) // Heavy weights on velocity
        : (likes * 1.0) + (reblogs * 2.0) + (replies * 1.5); // Standard weights for All Activity

    // 4. Exponential Gravity Time Decay Loop
    const createdTime = target.created_at ? new Date(target.created_at).getTime() : Date.now();
    const hoursElapsed = Math.max(0.5, (Date.now() - createdTime) / (1000 * 60 * 60));

    const velocityScore = totalEngagement / Math.pow(hoursElapsed + 2, 1.2);

    return urgencyWeight + locationScore + velocityScore;
}

/**
 * 🚀 PRODUCTION PIPELINE FILTRATION HOOK
 */
export function usePriorityFiltration(rawTimelineData = [], filterMode = 'priority', userLocation = null) {
    const store = usePostsStore();

    // Convert human-readable modes into your matching Zustand feed store keys
    const feedKey = useMemo(() => {
        if (filterMode === 'latest') return 'voices'; // or 'following' depending on parent caller
        if (filterMode === 'popular') return 'popular';
        return 'all_activity';
    }, [filterMode]);

    // 🧠 SYNC EFFECT ROUTINE: Ingest, normalize, and commit records directly into Zustand store
    useEffect(() => {
        if (Array.isArray(rawTimelineData) && rawTimelineData.length > 0) {
            store.importFetchedPosts(rawTimelineData);

            // Map the sequential IDs into your active feed storage partitions
            const orderedIds = rawTimelineData.map(p => p?.id).filter(Boolean);
            store.setFeedIds(feedKey, orderedIds);
        }
    }, [rawTimelineData, feedKey]);

    // 🥞 CALCULATE RENDER MATRIX: Hydrate and prioritize elements directly out of normalized memory
    return useMemo(() => {
        // Pull active collection IDs from your active feed key lane
        const targetFeedIds = store.feeds[feedKey] || [];

        // If Zustand feed lane is empty, fall back directly to processing the raw data entries safely
        const activeIdsSource = targetFeedIds.length > 0
            ? targetFeedIds
            : rawTimelineData.map(p => p?.id).filter(Boolean);

        // Hydrate data models directly out of your single-source-of-truth entities dictionary table
        const unifiedPosts = activeIdsSource.map(id => {
            const wrapper = store.entities[id];
            if (!wrapper) return null;

            // Deep nested reblog hydration mapping fix
            if (wrapper.reblog && wrapper.reblog.id) {
                const liveInnerTarget = store.entities[wrapper.reblog.id];
                if (liveInnerTarget) {
                    return { ...wrapper, reblog: { ...wrapper.reblog, ...liveInnerTarget } };
                }
            }
            return wrapper;
        }).filter(Boolean);

        // A. Chronological order bypass for Voices / Following feeds
        if (filterMode === 'latest') {
            return [...unifiedPosts].sort((a, b) => {
                const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return timeB - timeA;
            });
        }

        // B. Run Weighted Priority Vector re-sorting model
        return [...unifiedPosts]
            .map(post => ({
                post,
                score: calculatePostPriorityScore(post, { userLocation, mode: filterMode })
            }))
            .sort((a, b) => b.score - a.score) // Dynamic sorting: highest priority floats up
            .map(item => item.post);

    }, [store.entities, store.feeds, feedKey, filterMode, rawTimelineData, userLocation]);
}
