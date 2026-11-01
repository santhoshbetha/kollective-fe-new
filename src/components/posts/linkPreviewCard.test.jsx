import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LinkPreviewCard } from './LinkPreviewCard';
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

describe('LinkPreviewCard Component Suite', () => {
    it('returns null if preview or preview.url is missing', () => {
        const { container: c1 } = render(<LinkPreviewCard preview={null} />);
        expect(c1.firstChild).toBeNull();

        const { container: c2 } = render(<LinkPreviewCard preview={{}} />);
        expect(c2.firstChild).toBeNull();
    });

    it('renders a full preview card matching specified classes and attributes', () => {
        const preview = {
            url: 'https://theguardian.com/world/news',
            title: 'The Guardian Independent News',
            description: 'Breaking global news, investigative journalism, and analysis.',
            image_url: 'https://guim.co.uk/pic.jpg',
        };

        const { container } = render(<LinkPreviewCard preview={preview} />);

        const anchor = container.querySelector('a[href*="theguardian.com"]');
        expect(anchor).toBeInTheDocument();
        expect(anchor).toHaveAttribute('target', '_blank');
        expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');

        const titleEl = container.querySelector('h4, .preview-title');
        expect(titleEl).toBeInTheDocument();
        expect(titleEl.textContent).toContain('The Guardian Independent News');

        const descEl = container.querySelector('.preview-desc');
        expect(descEl).toBeInTheDocument();
        expect(descEl.textContent).toContain('Breaking global news');

        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://guim.co.uk/pic.jpg');

        expect(container.textContent).toContain('theguardian.com');
    });

    it('calls stopPropagation when clicked to prevent parent card navigation', () => {
        const preview = {
            url: 'https://theguardian.com',
            title: 'Sample Title',
            description: 'Sample Description',
        };

        const onParentClick = vi.fn();
        const { container } = render(
            <div onClick={onParentClick}>
                <LinkPreviewCard preview={preview} />
            </div>
        );

        const anchor = container.querySelector('a');
        fireEvent.click(anchor);

        expect(onParentClick).not.toHaveBeenCalled();
    });
});

describe('PostCard & CascadedPostRow Link Preview Integration', () => {
    let queryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
    });

    it('PostCard renders LinkPreviewCard when link_preview is populated and omits it when null', () => {
        const postWithoutPreview = {
            id: 'post-1',
            text: 'Post without link preview',
            author: { id: 'usr-1', name: 'Alice' },
            link_preview: null,
        };

        const { container, rerender } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PostCard post={postWithoutPreview} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(container.querySelector('a[href*="theguardian.com"]')).toBeNull();

        const postWithPreview = {
            ...postWithoutPreview,
            link_preview: {
                url: 'https://theguardian.com',
                title: 'The Guardian Independent News',
                description: 'Breaking global news',
                image_url: 'https://guim.co.uk',
            },
        };

        rerender(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PostCard post={postWithPreview} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const card = container.querySelector('a[href*="theguardian.com"]');
        expect(card).toBeInTheDocument();
        expect(card.querySelector('.preview-title')).toHaveTextContent('The Guardian Independent News');
        expect(card.querySelector('.preview-desc')).toHaveTextContent('Breaking global news');
        expect(card.querySelector('img')).toHaveAttribute('src', 'https://guim.co.uk');
    });

    it('CascadedPostRow renders LinkPreviewCard when post has link_preview', () => {
        const post = {
            id: 'reply-1',
            text: 'Reply with link preview',
            author: { id: 'usr-2', name: 'Bob' },
            link_preview: {
                url: 'https://theguardian.com',
                title: 'The Guardian Independent News',
                description: 'Breaking global news',
                image_url: 'https://guim.co.uk',
            },
        };

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CascadedPostRow post={post} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const card = container.querySelector('a[href*="theguardian.com"]');
        expect(card).toBeInTheDocument();
        expect(card.querySelector('.preview-title')).toHaveTextContent('The Guardian Independent News');
    });
});

