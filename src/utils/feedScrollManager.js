// src/utils/feedScrollManager.js

const FEED_SCROLL_TARGET_KEY = 'kollective_feed_scroll_target';

/**
 * Saves the target post metadata, viewport position, and scroll position when entering post details.
 */
export function saveFeedScrollTarget({
    postId,
    displayPostId,
    feedPath = typeof window !== 'undefined' ? window.location.pathname : '/home',
    cardElement = null,
    cardTop = null,
    scrollY = typeof window !== 'undefined' ? window.scrollY : 0,
}) {
    if (typeof window === 'undefined') return;
    try {
        let finalCardTop = cardTop;
        if (finalCardTop == null) {
            let el = cardElement;
            if (!el && (postId || displayPostId)) {
                el =
                    (postId && document.getElementById(`post-${postId}`)) ||
                    (displayPostId && document.getElementById(`post-${displayPostId}`)) ||
                    (postId && document.querySelector(`[data-post-id="${postId}"]`)) ||
                    (displayPostId && document.querySelector(`[data-display-post-id="${displayPostId}"]`));
            }
            if (el && typeof el.getBoundingClientRect === 'function') {
                finalCardTop = Math.round(el.getBoundingClientRect().top);
            }
        }

        const payload = {
            postId: postId ? String(postId) : null,
            displayPostId: displayPostId ? String(displayPostId) : null,
            scrollY: Math.round(scrollY || (typeof window !== 'undefined' ? window.scrollY : 0)),
            cardTop: typeof finalCardTop === 'number' && !Number.isNaN(finalCardTop) ? finalCardTop : null,
            feedPath: feedPath || '/home',
            timestamp: Date.now(),
        };
        sessionStorage.setItem(FEED_SCROLL_TARGET_KEY, JSON.stringify(payload));
    } catch (err) {
        console.warn('Failed to save feed scroll target:', err);
    }
}

/**
 * Retrieves the pending feed scroll target if returning to the matching feed path.
 */
export function getFeedScrollTarget(currentPath = typeof window !== 'undefined' ? window.location.pathname : '/home') {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(FEED_SCROLL_TARGET_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // Expire after 15 minutes to avoid stale jumps
        if (Date.now() - parsed.timestamp > 15 * 60 * 1000) {
            sessionStorage.removeItem(FEED_SCROLL_TARGET_KEY);
            return null;
        }
        // If a path is provided, verify it matches or is root/home
        if (currentPath && parsed.feedPath) {
            const normalizedCurrent = currentPath === '/' ? '/home' : currentPath;
            const normalizedSaved = parsed.feedPath === '/' ? '/home' : parsed.feedPath;
            if (normalizedCurrent !== normalizedSaved) {
                return null;
            }
        }
        return parsed;
    } catch {
        return null;
    }
}

/**
 * Clears the stored scroll target after successful restoration.
 */
export function clearFeedScrollTarget() {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.removeItem(FEED_SCROLL_TARGET_KEY);
    } catch {
        // ignore
    }
}

