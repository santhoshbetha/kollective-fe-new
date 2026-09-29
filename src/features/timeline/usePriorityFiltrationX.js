// src/features/timeline/usePriorityFiltration.js
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePostsStore } from '../../store/usePostsStore';

/**
 * 🧮 CORE VECTOR ALGORITHM: Compiles absolute priority weight metrics
 */
export function calculatePostPriorityScore(post, constraints = {}) {
    if (!post) return 0;

    // 1. Baseline Urgency Multiplier (Voice Posts / Crisis Alerts)
    const isUrgentType = Boolean(post.category === 'voice' || post.voice_url || post.is_urgent);
    const urgencyWeight = isUrgentType ? 500 : 0;

    // 2. Engagement Velocity Scalar (Likes + Shares + Comments over time)
    const likes = post.likes_count || post.likes || 0;
    const shares = post.shares_count || post.shares || 0;
    const replies = post.replies_count || post.replies || 0;

    const totalEngagement = (likes * 1.5) + (shares * 2.5) + (replies * 2.0);

    // Parse time intervals to prioritize fresher alerts
    const createdTime = post.created_at ? new Date(post.created_at).getTime() : Date.now();
    const hoursElapsed = Math.max(0.5, (Date.now() - createdTime) / (1000 * 60 * 60));

    // Gravity decay model prevents ancient posts from clogging the frontline feed
    const velocityScore = totalEngagement / Math.pow(hoursElapsed + 2, 1.2);

    // 3. Proximity Affinity (Surgically weights items inside local grid coordinates)
    let locationScore = 0;
    if (constraints.userLocation && post.location) {
        locationScore = constraints.userLocation === post.location ? 150 : 0;
    }

    // 4. Mutual Aid Affinity (Boosts specific categories like Co-ops or Mobilizations)
    const affinityWeight = post.category === 'proposal' || post.category === 'action' ? 75 : 0;

    // Summate absolute priority vector
    return urgencyWeight + velocityScore + locationScore + affinityWeight;
}

/**
 * 🚀 PRODUCTION REFACTOR HOOK: Pulls feed streams and ranks them dynamically
 */
export function usePriorityFiltration(rawTimelineData, filterMode = 'priority', userLocation = null) {
    const storeEntities = usePostsStore((state) => state.entities);

    return useMemo(() => {
        if (!Array.isArray(rawTimelineData)) return [];

        // 1. Single source-of-truth store merge layer
        const unifiedPosts = rawTimelineData.map((post) => {
            if (!post?.id) return null;
            return { ...post, ...(storeEntities[post.id] || {}) };
        }).filter(Boolean);

        // 2. Short-circuit directly to native chronological layout if mode is set to 'latest'
        if (filterMode === 'latest') {
            return [...unifiedPosts].sort((a, b) => {
                const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return timeB - timeA;
            });
        }

        // 3. Run Weighted Priority Vector sorting
        return [...unifiedPosts]
            .map(post => ({
                post,
                score: calculatePostPriorityScore(post, { userLocation })
            }))
            .sort((a, b) => b.score - a.score) // Highest vector weights float to top
            .map(item => item.post);

    }, [rawTimelineData, storeEntities, filterMode, userLocation]);
}
