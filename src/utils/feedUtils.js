/**
 * Utility for standard social media timeline feed post filtering and deduplication.
 * 
 * Enforces:
 * 1. Self-Content Exclusion Rule: In home/community timelines, suppresses self-authored posts
 *    and reblogs of the current user's own original posts so users only see content from others they follow.
 * 2. Reblog Deduplication Rule: Ensures the same canonical post (whether original post or reblog)
 *    is displayed at most ONCE in a feed stream.
 * 3. Keyword Masking Filters.
 */

export function processFeedPosts(posts, options = {}) {
    if (!Array.isArray(posts) || posts.length === 0) return [];

    const { currentUser, activeAccount, activeFilters, isProfilePage = false } = options;

    const currentUserId = currentUser?.id || activeAccount?.id;
    const currentUsername = (currentUser?.username || activeAccount?.username || '').toLowerCase();
    const currentEmail = (currentUser?.email || activeAccount?.email || '').toLowerCase();
    const currentName = (currentUser?.name || activeAccount?.name || '').toLowerCase();

    const isCurrentUserAuthor = (author) => {
        if (!author) return false;
        const aId = author.id;
        const aUsername = (author.username || (author.handle ? author.handle.replace('@', '') : '')).toLowerCase();
        const aEmail = (author.email || '').toLowerCase();
        const aName = (author.name || '').toLowerCase();

        if (currentUserId && aId && String(currentUserId) === String(aId)) return true;
        if (currentUsername && aUsername && currentUsername === aUsername) return true;
        if (currentEmail && aEmail && currentEmail === aEmail) return true;
        if (currentName && aName && currentName === aName) return true;
        return false;
    };

    const seenCanonicalIds = new Set();
    const result = [];

    for (const post of posts) {
        if (!post) continue;

        // 1. Keyword Filters
        if (activeFilters && Array.isArray(activeFilters) && activeFilters.length > 0 && post.text) {
            const match = activeFilters.find((f) => post.text.toLowerCase().includes(f.title.toLowerCase()));
            if (match && match.filter_action === 'hide') {
                continue;
            }
        }

        const isReblogItem = !!(post.reblog || post.reblog_of_id || post.reblogOf || post.isReblog);
        const itemAuthor = post.author || post.account || post.postedBy;
        const targetPost = (post.reblog && typeof post.reblog === 'object') ? post.reblog : post;
        const targetAuthor = targetPost.author || targetPost.account || targetPost.postedBy;

        // 2. Rule 1: Self-Content Exclusion Rule (Home & Community Feeds)
        // Hide self-authored posts and reblogs of own posts from Home/Community feeds
        if (!isProfilePage) {
            if (isCurrentUserAuthor(itemAuthor) || isCurrentUserAuthor(targetAuthor)) {
                continue;
            }
        }

        // 3. Rule 2: Reblog Deduplication Rule
        // Find canonical post ID for deduplication
        let canonicalId = targetPost.id || post.reblog_of_id || post.reblogOf;
        if (!canonicalId) {
            canonicalId = post.id;
        }

        if (canonicalId) {
            const key = String(canonicalId);
            if (seenCanonicalIds.has(key)) {
                // Already in feed! Skip duplicate item.
                continue;
            }
            seenCanonicalIds.add(key);
        }

        result.push(post);
    }

    return result;
}
