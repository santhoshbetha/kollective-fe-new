import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CascadedPostRow } from './CascadedPostRow';

let mockCurrentUser = { id: 'user-alice-1', username: 'alice', name: 'Alice' };

vi.mock('../../store/auth/useAuthStore', () => ({
    useAuthStore: vi.fn((selector) => {
        const state = {
            user: mockCurrentUser,
            activeAccount: mockCurrentUser,
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
}));

describe('CascadedPostRow & ThreadLine Suite', () => {
    let queryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        mockCurrentUser = { id: 'user-alice-1', username: 'alice', name: 'Alice' };
    });

    it('disables the reply button with tooltip when user views their own post', () => {
        const selfPost = {
            id: 'alice-post-123',
            user_id: 'user-alice-1',
            author: { id: 'user-alice-1', name: 'Alice', username: 'alice', handle: '@alice' },
            text: 'My own post content',
        };

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CascadedPostRow post={selfPost} isFocus />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const replyBtn = container.querySelector('.reply-btn');
        expect(replyBtn).toBeInTheDocument();
        expect(replyBtn).toBeDisabled();
        expect(replyBtn.getAttribute('title')).toMatch(/cannot reply to your own/i);
    });

    it('enables reply button for other users and renders thread lines on cascaded replies', () => {
        mockCurrentUser = { id: 'user-bob-2', username: 'bob', name: 'Bob' };
        const onReplyClick = vi.fn();

        const aliceReply = {
            id: 'reply-node-1',
            user_id: 'user-alice-1',
            user: { id: 'user-alice-1', name: 'Alice', username: 'alice', handle: '@alice' },
            body: 'First level cascaded reply',
        };

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CascadedPostRow
                        post={aliceReply}
                        depth={1}
                        hasNextReply={true}
                        onReplyClick={onReplyClick}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const row = container.querySelector('.cascaded-post-row');
        expect(row).toBeInTheDocument();
        expect(row.textContent).toContain('First level cascaded reply');

        const threadLines = container.querySelectorAll('.thread-line, .border-l-2');
        expect(threadLines.length).toBeGreaterThan(0);

        const replyBtn = container.querySelector('.reply-btn');
        expect(replyBtn).not.toBeDisabled();
        fireEvent.click(replyBtn);
        expect(onReplyClick).toHaveBeenCalledWith('Alice', 'reply-node-1');
    });
});

