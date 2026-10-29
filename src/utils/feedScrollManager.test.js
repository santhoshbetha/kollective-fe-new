import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    saveFeedScrollTarget,
    getFeedScrollTarget,
    clearFeedScrollTarget
} from './feedScrollManager';

describe('feedScrollManager', () => {
    beforeEach(() => {
        sessionStorage.clear();
        window.scrollY = 0;
    });

    it('saves and retrieves scroll target with cardTop and scrollY', () => {
        window.scrollY = 1250;
        saveFeedScrollTarget({
            postId: 'post-123',
            displayPostId: 'post-123',
            feedPath: '/home',
            cardTop: 340,
        });

        const target = getFeedScrollTarget('/home');
        expect(target).not.toBeNull();
        expect(target.postId).toBe('post-123');
        expect(target.displayPostId).toBe('post-123');
        expect(target.scrollY).toBe(1250);
        expect(target.cardTop).toBe(340);
        expect(target.feedPath).toBe('/home');
    });

    it('extracts cardTop from cardElement getBoundingClientRect', () => {
        const mockElement = {
            getBoundingClientRect: () => ({ top: 480.6, height: 200, bottom: 680.6 })
        };
        saveFeedScrollTarget({
            postId: 'post-card-elem',
            cardElement: mockElement,
            scrollY: 900
        });

        const target = getFeedScrollTarget('/home');
        expect(target).not.toBeNull();
        expect(target.cardTop).toBe(481);
        expect(target.scrollY).toBe(900);
    });

    it('returns null if paths do not match', () => {
        saveFeedScrollTarget({
            postId: 'post-456',
            feedPath: '/home'
        });

        const target = getFeedScrollTarget('/explore');
        expect(target).toBeNull();
    });

    it('normalizes root path / to /home', () => {
        saveFeedScrollTarget({
            postId: 'post-789',
            feedPath: '/'
        });

        const target = getFeedScrollTarget('/home');
        expect(target).not.toBeNull();
        expect(target.postId).toBe('post-789');
    });

    it('clears stored target', () => {
        saveFeedScrollTarget({
            postId: 'post-999',
            feedPath: '/home'
        });

        expect(getFeedScrollTarget('/home')).not.toBeNull();
        clearFeedScrollTarget();
        expect(getFeedScrollTarget('/home')).toBeNull();
    });

    it('expires stale targets older than 15 minutes', () => {
        const twentyMinutesAgo = Date.now() - 20 * 60 * 1000;
        sessionStorage.setItem('kollective_feed_scroll_target', JSON.stringify({
            postId: 'post-old',
            timestamp: twentyMinutesAgo,
            feedPath: '/home'
        }));

        const target = getFeedScrollTarget('/home');
        expect(target).toBeNull();
        expect(sessionStorage.getItem('kollective_feed_scroll_target')).toBeNull();
    });
});

