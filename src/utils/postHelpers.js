/**
 * Safely extracts the total reply/comment count from any post payload schema variant.
 * Checks replies_count, commentsCount, repliesCount, comments_count, and array lengths.
 *
 * @param {Object} post - The post entity payload object
 * @returns {number} Normalized integer count of replies
 */
export function getReplyCount(post) {
    if (!post) return 0;
    if (typeof post.replies_count === 'number' && !isNaN(post.replies_count)) return post.replies_count;
    if (typeof post.commentsCount === 'number' && !isNaN(post.commentsCount)) return post.commentsCount;
    if (typeof post.repliesCount === 'number' && !isNaN(post.repliesCount)) return post.repliesCount;
    if (typeof post.comments_count === 'number' && !isNaN(post.comments_count)) return post.comments_count;

    if (Array.isArray(post.replies)) return post.replies.length;
    if (Array.isArray(post.comments)) return post.comments.length;
    if (Array.isArray(post.descendants)) return post.descendants.length;

    return 0;
}

/**
 * Safely extracts total reblog/shares count from any post payload variant or reblog target.
 * Priority: checks numbers > 0 across reblog target and parent wrapper fields.
 *
 * @param {Object} post - The post entity payload object
 * @returns {number} Normalized integer count of reblogs/shares
 */
export function getReblogCount(post) {
    if (!post) return 0;
    const target = post.reblog && typeof post.reblog === 'object' ? post.reblog : post;
    const candidates = [
        target.reblogs_count,
        target.reblogsCount,
        target.shares,
        target.reblogs,
        post.reblogs_count,
        post.reblogsCount,
        post.shares,
        post.reblogs
    ];
    for (const val of candidates) {
        if (typeof val === 'number' && !isNaN(val) && val > 0) return val;
    }
    return 0;
}

/**
 * Safely extracts total likes count from any post payload variant or reblog target.
 *
 * @param {Object} post - The post entity payload object
 * @returns {number} Normalized integer count of likes
 */
export function getLikeCount(post) {
    if (!post) return 0;
    const target = post.reblog && typeof post.reblog === 'object' ? post.reblog : post;
    const candidates = [
        target.likes_count,
        target.likesCount,
        target.likes,
        post.likes_count,
        post.likesCount,
        post.likes
    ];
    for (const val of candidates) {
        if (typeof val === 'number' && !isNaN(val) && val > 0) {
            return val;
        }
    }
    return 0;
}

