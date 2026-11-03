import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BusinessProposalDetailsPage } from '../../pages/businesses/BusinessProposalDetailsPage';

// ─── Fixtures ────────────────────────────────────────────────────────────────
const texasProposal = {
    id: 'prop-tx-77',
    title: 'Austin Tool Share Hub',
    description: 'A member-owned lending library for tools.',
    category: 'Infrastructure',
    state: 'TX',
    city: 'Austin',
    location: 'Austin, TX',
    fundingGoal: 30000,
    owner_name: 'proposer_bob',
    user: { username: 'proposer_bob', handle: '@proposer_bob' },
};

const txComment = {
    id: 'c-1',
    content: 'Great proposal initiative!',
    inserted_at: '2026-11-01T10:00:00Z',
    author: { username: 'alice', name: 'Alice', avatar_url: 'https://cdn.example.com/alice.jpg' },
    replies: [],
};

const authState = vi.hoisted(() => ({ user: null }));

vi.mock('../../store/auth/useAuthStore', () => ({
    useAuthStore: (selector) => selector({ user: authState.user }),
}));

vi.mock('../../components/accounts/UserHoverCard', () => ({
    UserHoverCard: ({ children }) => <div>{children}</div>,
}));

const commentsState = vi.hoisted(() => ({ comments: [], enabled: true }));

vi.mock('../../features/businesses/useProposalsFeature', () => ({
    useProposalDetailsQuery: () => ({
        proposal: texasProposal,
        proposalLoading: false,
        proposalError: null,
    }),
    useProposalCommentsQuery: (id, options) => {
        commentsState.enabled = options?.enabled !== false;
        return {
            comments: commentsState.enabled ? commentsState.comments : [],
            commentsLoading: false,
            commentsError: null,
        };
    },
    useAddProposalComment: () => ({ mutate: vi.fn(), isPending: false }),
    uploadProposalCommentImage: vi.fn(async (src) => src),
}));

const LocationProbe = () => {
    const location = useLocation();
    return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
};

const renderPage = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/proposals/prop-tx-77']}>
                <Routes>
                    <Route path="/proposals/:id" element={<BusinessProposalDetailsPage />} />
                    <Route path="*" element={<LocationProbe />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe('Business Proposal Discussion Geofence', () => {
    beforeEach(() => {
        commentsState.comments = [txComment];
        commentsState.enabled = true;
        authState.user = { id: 'u-tx', username: 'alice', name: 'Alice', state: 'TX' };
    });

    it('renders the threaded discussion stream for an in-state resident', () => {
        renderPage();

        expect(screen.getByTestId('proposal-discussion')).toBeInTheDocument();
        expect(screen.getByTestId('proposal-comment-form')).toBeInTheDocument();
        expect(screen.getByTestId('proposal-comment-input')).toBeInTheDocument();
        expect(screen.getByText('Great proposal initiative!')).toBeInTheDocument();
        expect(screen.queryByTestId('discussion-locked-banner')).not.toBeInTheDocument();
        expect(commentsState.enabled).toBe(true);
    });

    it('unmounts the composer and thread for an out-of-state resident', () => {
        authState.user = { id: 'u-ny', username: 'newyorker', name: 'New Yorker', state: 'NY' };

        renderPage();

        expect(screen.getByTestId('discussion-locked-banner')).toBeInTheDocument();
        expect(screen.getByText(/Discussion locked\. This workspace conversation channel is restricted to verified residents of this state\./i)).toBeInTheDocument();

        // The discussion UI is fully unmounted, and the network query is never issued.
        expect(screen.queryByTestId('proposal-comment-input')).not.toBeInTheDocument();
        expect(screen.queryByTestId('proposal-comment-thread')).not.toBeInTheDocument();
        expect(screen.queryByText('Great proposal initiative!')).not.toBeInTheDocument();
        expect(commentsState.enabled).toBe(false);
    });

    it('treats an unverified state as out-of-state', () => {
        authState.user = { id: 'u-unknown', username: 'a_user', name: 'A User' };

        renderPage();

        expect(screen.getByTestId('discussion-locked-banner')).toBeInTheDocument();
        expect(screen.queryByTestId('proposal-comment-input')).not.toBeInTheDocument();
    });

    it('routes the Contact Proposer action into the private message module', () => {
        renderPage();

        fireEvent.click(screen.getByTestId('contact-proposer-btn'));

        expect(screen.getByTestId('location-probe')).toHaveTextContent('/messages?user=proposer_bob');
    });
});
