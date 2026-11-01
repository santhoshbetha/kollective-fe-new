import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostCard } from './PostCard';
import { CascadedPostRow } from './CascadedPostRow';
import { ReportPostModal } from '../../features/moderation/components/ReportPostModal';
import { BlockedProfilesForm } from '../../features/settings/BlockedProfilesForm';
import { MutedProfilesForm } from '../../features/settings/MutedProfilesForm';
import { usePostsStore } from '../../store/usePostsStore';
import { apiFetch } from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
    apiFetch: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('../../features/timeline/usePostActions', () => ({
    usePostActions: vi.fn(() => ({
        toggleLike: vi.fn(),
        toggleReblog: vi.fn(),
        toggleBookmark: vi.fn(),
        isActionPending: false,
    })),
}));

vi.mock('../../features/organize/useOrganizeFeature', () => ({
    useRsvpToAction: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock('../../features/bookmarks/useToggleBookmark', () => ({
    useToggleBookmark: vi.fn(() => ({ mutate: vi.fn() })),
}));

describe('User Moderation Lifecycle (Mute & Block Boundaries)', () => {
    let queryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        usePostsStore.getState().purgeStoreDataMatrix();
    });

    it('immediately evicts a PostCard from the DOM when removePostEntity is invoked', () => {
        const malloryPost = {
            id: 'mallory-post-666',
            text: 'Offensive post text that Alice wants to mute.',
            author: { id: 'mallory-99', name: 'Mallory', handle: '@mallory' },
        };

        usePostsStore.getState().importFetchedPosts([malloryPost]);

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PostCard post={malloryPost} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(container.querySelector('#post-mallory-post-666')).toBeInTheDocument();

        act(() => {
            usePostsStore.getState().removePostEntity('mallory-post-666');
        });

        expect(container.querySelector('#post-mallory-post-666')).toBeNull();
    });

    it('hides blocked user content behind a collapsed warning banner with a Show anyway toggle in PostCard and CascadedPostRow', () => {
        const blockedUserPost = {
            id: 'blocked-post-777',
            text: 'Hidden message from a blocked user.',
            author: { id: 'blocked-user-2', name: 'Blocked User', handle: '@blocked', blocking: true },
        };

        const { container, getByText } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CascadedPostRow post={blockedUserPost} depth={1} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(container.textContent).toContain('This post is hidden because you have blocked this user.');
        expect(container.textContent).not.toContain('Hidden message from a blocked user.');

        const showAnywayBtn = getByText('Show anyway');
        fireEvent.click(showAnywayBtn);

        expect(container.textContent).toContain('Hidden message from a blocked user.');
    });

    it('persists client-side filter rules to localStorage and suppresses filtered posts', () => {
        window.localStorage.removeItem('kollective_filtered_stream_rules');
        const spamPost = {
            id: 'unwanted-post-777',
            text: 'Unwanted promotional noise #ad',
            tags: ['ad'],
            author: { id: 'spammer-11', name: 'Spam Bot', username: 'spambot', handle: '@spambot' },
        };

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PostCard post={spamPost} />
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(container.querySelector('#post-unwanted-post-777')).toBeInTheDocument();

        act(() => {
            usePostsStore.getState().addClientFilter({ handle: '@spambot', tags: ['ad'] });
            usePostsStore.getState().removePostEntity('unwanted-post-777');
        });

        expect(container.querySelector('#post-unwanted-post-777')).toBeNull();
        const saved = JSON.parse(window.localStorage.getItem('kollective_filtered_stream_rules') || '{}');
        expect(saved.handles).toContain('@spambot');
        expect(saved.tags).toContain('ad');
    });

    it('submits multi-stage categorized reports via ReportPostModal and evicts the post entity', async () => {
        const toxicPost = {
            id: 'toxic-post-888',
            text: 'Violating community guidelines with targeted harassment.',
            user_id: 'abuser-12',
            author: { id: 'abuser-12', name: 'Abusive Actor', username: 'abuser', handle: '@abuser' },
        };
        usePostsStore.getState().importFetchedPosts([toxicPost]);
        const onCloseMock = vi.fn();

        const { getByText, getByPlaceholderText } = render(
            <ReportPostModal
                isOpen={true}
                onClose={onCloseMock}
                post={toxicPost}
                authorHandle="@abuser"
                authorId="abuser-12"
            />
        );

        fireEvent.click(getByText('Harassment & Bullying'));
        const textarea = getByPlaceholderText('Details or context describing the policy breach...');
        fireEvent.change(textarea, { target: { value: 'Repeated personal attacks across multiple threads.' } });

        await act(async () => {
            fireEvent.click(getByText('Submit Report'));
        });

        expect(apiFetch).toHaveBeenCalledWith(
            '/api/v1/reports',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    account_id: 'abuser-12',
                    status_ids: ['toxic-post-888'],
                    category: 'Harassment & Bullying',
                    comment: 'Repeated personal attacks across multiple threads.',
                }),
            })
        );
        expect(usePostsStore.getState().removedPostIds['toxic-post-888']).toBe(true);
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('hydrates BlockedProfilesForm and MutedProfilesForm and evicts rows upon Unblock / Unmute', async () => {
        apiFetch.mockImplementation((url, opts) => {
            if (url === '/api/v1/privacy/blocks' && opts?.method === 'GET') {
                return Promise.resolve({
                    blocked_users: [{ id: 'troll-node-77', name: 'Attention Troll', handle: '@troll' }],
                });
            }
            if (url === '/api/v1/privacy/mutes' && opts?.method === 'GET') {
                return Promise.resolve({
                    muted_users: [{ id: 'noisy-node-88', name: 'Noisy Broadcaster', handle: '@noisy' }],
                });
            }
            return Promise.resolve({ success: true });
        });

        const { findByText, queryByText } = render(
            <div>
                <BlockedProfilesForm />
                <MutedProfilesForm />
            </div>
        );

        expect(await findByText('Attention Troll')).toBeInTheDocument();
        expect(await findByText('Noisy Broadcaster')).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(await findByText('Unblock'));
            fireEvent.click(await findByText('Unmute'));
        });

        expect(queryByText('Attention Troll')).toBeNull();
        expect(queryByText('Noisy Broadcaster')).toBeNull();
    });

    it('updates PostCard in-place with [Edited] indicator and cascades removePostEntity to reblogs and replies', () => {
        const rootPost = {
            id: 'self-post-99',
            text: 'Original Draft Text.',
            author: { id: 'user-1', name: 'Editor', handle: '@editor' },
        };
        const reblogWrapper = {
            id: 'reblog-wrapper-100',
            reblog_of_id: 'self-post-99',
            reblog: rootPost,
            author: { id: 'user-2', name: 'Reader', handle: '@reader' },
        };

        usePostsStore.getState().importFetchedPosts([rootPost, reblogWrapper]);

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <div>
                        <PostCard post={rootPost} />
                        <PostCard post={reblogWrapper} />
                        <CascadedPostRow post={{ id: 'deleted-parent-1', is_author_deleted: true }} isAncestor hasNextReply />
                    </div>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(container.textContent).toContain('Original Draft Text.');
        expect(container.textContent).toContain('This post has been deleted by the author.');

        act(() => {
            usePostsStore.getState().updatePostEntity('self-post-99', {
                text: 'Refactored Text Verified In-Place!',
                content: 'Refactored Text Verified In-Place!',
                isEdited: true,
            });
        });

        expect(container.textContent).toContain('Refactored Text Verified In-Place!');
        expect(container.querySelector('.edited-indicator-icon')?.textContent).toContain('[Edited]');

        act(() => {
            usePostsStore.getState().removePostEntity('self-post-99');
        });

        expect(container.querySelector('#post-self-post-99')).toBeNull();
        expect(container.querySelector('#post-reblog-wrapper-100')).toBeNull();
    });

    it('restricts Edit Post and Delete Post visibility to self-posts on the profile surface', () => {
        const selfPost = {
            id: 'self-post-visibility-1',
            text: 'Testing surface rules',
            author: { id: 'user-1', name: 'Editor', handle: '@editor' },
        };
        usePostsStore.getState().importFetchedPosts([selfPost]);

        // Home surface: should hide Edit/Delete
        const homeRender = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/home']}>
                    <PostCard post={selfPost} />
                </MemoryRouter>
            </QueryClientProvider>
        );
        fireEvent.click(homeRender.getByTitle('More actions'));
        expect(homeRender.queryByText('Edit Post')).toBeNull();
        expect(homeRender.queryByText('Delete Post')).toBeNull();
        homeRender.unmount();

        // Profile surface: should render Edit/Delete
        const profileRender = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/profile']}>
                    <PostCard post={selfPost} inProfileFeed={true} />
                </MemoryRouter>
            </QueryClientProvider>
        );
        fireEvent.click(profileRender.getByTitle('More actions'));
        expect(profileRender.getByText('Edit Post')).toBeInTheDocument();
        expect(profileRender.getByText('Delete Post')).toBeInTheDocument();
        profileRender.unmount();
    });
});

