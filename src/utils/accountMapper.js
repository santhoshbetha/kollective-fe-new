/**
 * Resolves raw backend database account entries into standard frontend persona types.
 * Maps Elixir database record columns directly to 'journalist', 'activist', 'scholar', 'organization', or 'citizen'.
 * 
 * @param {Object} author - The author object returned from the API fetch layers
 * @returns {string} One of the normalized core frontend user type strings
 */
export function resolveUserPersona(author) {
    if (!author) return 'citizen';

    // 1. Force lowercase handling to safely capture varied API payload schemas
    const type = author.type?.toLowerCase() || '';
    const role = author.role?.toLowerCase() || '';
    const badgeType = author.badge_type?.toLowerCase() || '';

    // 2. High Priority Rule: Check Explicit Group Types
    if (type === 'organization' || type === 'brand' || type === 'hub') {
        return 'organization';
    }

    // 3. Secondary Rule: Map Activist taxonomy metrics
    if (type === 'activist' || role === 'activist' || role === 'campaigner' || badgeType === 'grassroots') {
        return 'activist';
    }

    // 4. Third Rule: Map Scholar taxonomy metrics
    if (type === 'scholar' || type === 'academic' || role === 'professor' || role === 'researcher') {
        return 'scholar';
    }

    // 5. Fourth Rule: Map Journalist taxonomy metrics
    if (type === 'journalist' || type === 'voice' || role === 'reporter' || role === 'editor' || author.category === 'voice') {
        return 'journalist';
    }

    // 6. Check Moderation flags explicitly
    if (author.is_warned || author.status === 'restricted') {
        return 'warned';
    }

    // Default Fallback
    return 'citizen';
}
