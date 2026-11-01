import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationRow } from './NotificationRow';
import { useAccountsStore } from '../../store/useAccountsStore';

vi.mock('./useNotificationsFeature', () => ({
    useToggleFollowUser: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
}));

describe('NotificationRow Remediation Suite', () => {
    let queryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        useAccountsStore.setState({
            entities: {},
            following_ids: ['followed-user-777'],
            followingIds: ['followed-user-777'],
        });
    });

    it('renders 2-letter uppercase initials fallback when avatar_url is null and hides Follow Back for already followed users', () => {
        const followNotif = {
            id: 'notif-101',
            type: 'follow',
            actor_id: 'followed-user-777',
            actor: { name: 'John Doe', avatar_url: null, initials: 'JD' },
            body: 'John Doe started following your channel matrix.',
        };

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <NotificationRow item={followNotif} />
            </QueryClientProvider>
        );

        expect(screen.getByText('JD')).toBeInTheDocument();
        expect(container.querySelector('button')?.textContent).not.toBe('Follow Back');
        expect(screen.queryByRole('button', { name: /follow back/i })).not.toBeInTheDocument();
    });

    it('displays Follow Back button when user is not yet followed and computes initials from name if initials prop is omitted', () => {
        const unfollowedNotif = {
            id: 'notif-103',
            type: 'follow',
            actor_id: 'unfollowed-user-999',
            actor: { name: 'Elena Vance', avatar_url: '' },
            body: 'Elena Vance started following you.',
        };

        render(
            <QueryClientProvider client={queryClient}>
                <NotificationRow item={unfollowedNotif} />
            </QueryClientProvider>
        );

        expect(screen.getByText('EV')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /follow back/i })).toBeInTheDocument();
    });

    it('renders full multi-line mention body without truncation and displays valid avatar image', () => {
        const mentionNotif = {
            id: 'notif-102',
            type: 'mention',
            actor_id: 'external-user-888',
            actor: { name: 'Sarah Smith', avatar_url: 'https://placehold.co' },
            body: 'This is an extremely long notification message alert that would normally be completely compressed or hard cut off in a broken CSS layout constraint view. It must render completely and break text naturally over multiple text lines in the viewport canvas layout without dropping critical string fragments.',
        };

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <NotificationRow item={mentionNotif} />
            </QueryClientProvider>
        );

        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toBe('https://placehold.co');
        expect(container.textContent).toContain('without dropping critical string fragments.');
    });
});

