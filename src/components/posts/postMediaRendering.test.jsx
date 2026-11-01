import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostMediaGrid, getObjectPosition } from './PostMediaGrid';
import { PostMedia } from './PostMedia';
import { PostCard } from './PostCard';
import { CascadedPostRow } from './CascadedPostRow';

vi.mock('../../store/auth/useAuthStore', () => ({
    useAuthStore: vi.fn((selector) => {
        const state = {
            user: { id: 'usr-1', username: 'alice', name: 'Alice' },
            activeAccount: { id: 'usr-1', username: 'alice', name: 'Alice' },
            isAuthenticated: true,
        };
        return selector ? selector(state) : state;
    }),
}));

vi.mock('../../features/timeline/usePostActions', () => ({
    usePostActions: vi.fn(() => ({
        toggleLike: vi.fn(),
        toggleReblog: vi.fn(),
        toggleBookmark: vi.fn(),
        isActionPending: false,
    })),
    useRsvpToAction: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
}));

describe('PostMediaGrid Component Suite', () => {
    it('calculates objectPosition correctly from focal points', () => {
        expect(getObjectPosition(0, 0)).toBe('50% 50%');
        expect(getObjectPosition(-1, 1)).toBe('0% 0%');
        expect(getObjectPosition(1, -1)).toBe('100% 100%');
    });

    it('renders single image correctly when passed an object with focal coordinates', () => {
        const mediaAttachments = [
            { id: '1', url: 'https://example.com/img1.jpg', focal_x: 0.5, focal_y: -0.5, alt: 'Test image' }
        ];
        render(<PostMediaGrid mediaAttachments={mediaAttachments} />);
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('https://example.com/img1.jpg');
        expect(img.getAttribute('alt')).toBe('Test image');
        expect(img.style.objectPosition).toBe('75% 75%');
    });

    it('renders single image correctly when passed a plain string URL', () => {
        const mediaAttachments = ['https://example.com/plain-string.jpg'];
        render(<PostMediaGrid mediaAttachments={mediaAttachments} />);
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('https://example.com/plain-string.jpg');
        expect(img.style.objectPosition).toBe('50% 50%');
    });

    it('renders multi-image grid when passed plain strings', () => {
        const mediaAttachments = [
            'https://example.com/pic1.jpg',
            'https://example.com/pic2.jpg'
        ];
        render(<PostMediaGrid mediaAttachments={mediaAttachments} />);
        const imgs = screen.getAllByRole('img');
        expect(imgs.length).toBe(2);
        expect(imgs[0].getAttribute('src')).toBe('https://example.com/pic1.jpg');
        expect(imgs[1].getAttribute('src')).toBe('https://example.com/pic2.jpg');
    });
});

describe('PostMedia Resolution Suite', () => {
    it('displays media when post has media_attachments and images is empty []', () => {
        const post = {
            id: 'post-1',
            images: [],
            media_attachments: [
                { id: 'att-1', url: 'https://example.com/media-att.jpg', description: 'Scenic View', focal_x: 0, focal_y: 0 }
            ]
        };
        render(<PostMedia post={post} />);
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('https://example.com/media-att.jpg');
        expect(img.getAttribute('alt')).toBe('Scenic View');
    });

    it('displays media when post has images array of strings and media_attachments is empty []', () => {
        const post = {
            id: 'post-2',
            media_attachments: [],
            images: ['https://example.com/photo.png']
        };
        render(<PostMedia post={post} />);
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('https://example.com/photo.png');
    });

    it('displays media when post has single image string or object fallback', () => {
        const postWithStringImage = {
            id: 'post-3',
            media_attachments: [],
            images: [],
            image: 'https://example.com/single.jpg'
        };
        const { unmount } = render(<PostMedia post={postWithStringImage} />);
        let img = screen.getByRole('img');
        expect(img.getAttribute('src')).toBe('https://example.com/single.jpg');
        unmount();

        const postWithObjImage = {
            id: 'post-4',
            media_attachments: [],
            images: [],
            image: { url: 'https://example.com/obj.jpg', description: 'Alt text' }
        };
        render(<PostMedia post={postWithObjImage} />);
        img = screen.getByRole('img');
        expect(img.getAttribute('src')).toBe('https://example.com/obj.jpg');
        expect(img.getAttribute('alt')).toBe('Alt text');
    });
});

describe('PostCard & CascadedPostRow Front-End Media Rendering', () => {
    let queryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
    });

    it('PostCard renders image when API returns media_attachments with images: []', () => {
        const post = {
            id: 'post-card-1',
            text: 'Post with Mastodon-style media_attachments',
            author: { id: 'usr-2', name: 'Bob', username: 'bob', handle: '@bob' },
            images: [],
            media_attachments: [
                { id: 'att-1', url: 'https://example.com/attached.jpg', description: 'Sunset', focal_x: 0, focal_y: 0 }
            ]
        };

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PostCard post={post} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const img = screen.getByAltText('Sunset');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('https://example.com/attached.jpg');
    });

    it('PostCard renders image when post is in voice category', () => {
        const post = {
            id: 'voice-post-1',
            text: 'Voice post editorial update',
            category: 'voice',
            author: { id: 'usr-2', name: 'Bob', username: 'bob', handle: '@bob' },
            images: [],
            media_attachments: [
                { id: 'att-voice', url: 'https://example.com/voice-graphic.jpg', description: 'Voice graphic' }
            ]
        };

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PostCard post={post} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const img = screen.getByAltText('Voice graphic');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('https://example.com/voice-graphic.jpg');
    });

    it('CascadedPostRow renders image when post has media_attachments and images: []', () => {
        const post = {
            id: 'cascaded-post-1',
            text: 'Reply or cascaded item with attachment',
            author: { id: 'usr-2', name: 'Bob', username: 'bob', handle: '@bob' },
            images: [],
            media_attachments: [
                { id: 'att-cascaded', url: 'https://example.com/cascaded.png', description: 'Cascaded diagram' }
            ]
        };

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CascadedPostRow post={post} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const img = screen.getByAltText('Cascaded diagram');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('https://example.com/cascaded.png');
    });
});

