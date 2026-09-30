// src/utils/broadcastNormalize.js
import { extractAndMergeHashtags } from './tagParser';

/**
 * 🏢 COMMITS DYNAMIC PROFILE/ORGANIZATION STRUCTURAL MAPPING
 */
export function resolveAuthorContext(postIdentity, activeAccount, user) {
    if (postIdentity !== 'organization') return undefined;

    const currentOrg = (activeAccount?.type === 'organization') ? activeAccount : user?.memberships?.[0]?.organization;
    return {
        name: currentOrg?.name || 'Organization Node',
        handle: currentOrg?.handle || (currentOrg?.username ? `@${currentOrg.username}` : '@org'),
        role: currentOrg?.role || activeAccount?.role || 'Organization',
        verified: true,
        avatar: currentOrg?.avatar || '/default-org.jpg',
        type: 'organization',
        organization_id: currentOrg?.id
    };
}

/**
 * 🗺️ RECONCILES SCOPE METRICS ACCROSS THE DISTRIBUTED EDGE REGISTRY
 */
export function resolveTargetScope(audience = 'World') {
    const audienceLower = audience.toLowerCase();
    if (audienceLower === 'local' || audienceLower === 'my_location') return 'local';
    if (audienceLower === 'state') return 'state';
    if (audienceLower === 'country' || audienceLower === 'national') return 'country';
    return 'world';
}

/**
 * 🚀 DYNAMIC UNIFIED HASHTAG & PAYLOAD ACCELERATOR
 * Standardizes request boundaries across main posts and inline comments alike.
 */
export function prepareBroadcastPayload({
    content = '',
    contentType = 'post', // 'post' | 'voice' | 'comment'
    audience = 'World',
    postIdentity = 'personal',
    activeAccount = null,
    user = null,
    showCw = false,
    cwText = ''
}) {
    const cleanContent = content.trim();

    // Resolve tags using our optimization background scanner engine
    const presetTags = contentType === 'voice' ? ['#SovereignVoice'] : ['#Kollective'];
    const tags = extractAndMergeHashtags(cleanContent, presetTags);

    const authorDetails = resolveAuthorContext(postIdentity, activeAccount, user);
    const targetScope = resolveTargetScope(audience);
    const visibility = audience === 'Followers Only' ? 'private' : 'public';

    return {
        text: cleanContent,
        content: cleanContent,
        tags,
        target_scope: targetScope,
        visibility,
        contentWarning: showCw && cwText.trim() ? cwText.trim() : undefined,
        ...(authorDetails ? {
            organization_id: authorDetails.organization_id,
            author: authorDetails,
            postedBy: { name: user?.name, handle: user?.handle, avatar: user?.avatar }
        } : {})
    };
}
