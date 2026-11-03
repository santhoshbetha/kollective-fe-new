import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BusinessCard } from './BusinessCard';
import { LocalBusinessesPage } from '../../pages/businesses/LocalBusinessesPage';

// ── Providers / data mocks ────────────────────────────────────────────────────
vi.mock('../../store/useStore', () => ({
    useStore: (selector) => selector({ userState: 'TX', setUserState: vi.fn() })
}));

vi.mock('../../store/auth/useAuthStore', () => ({
    useAuthStore: (selector) => selector({
        user: { id: 'usr-alice', username: 'alice', state: 'TX' },
        activeAccount: { type: 'personal' }
    })
}));

vi.mock('../../components/accounts/UserHoverCard', () => ({
    UserHoverCard: ({ children }) => <div>{children}</div>
}));

vi.mock('./LocalBusinessesFeed', () => ({
    LocalBusinessesFeed: () => <div data-testid="businesses-feed" />
}));

vi.mock('./ProposalsFeed', () => ({
    ProposalsFeed: () => <div data-testid="proposals-feed" />
}));

vi.mock('./useBusinessesFeature', () => ({
    useBusinessesQuery: () => ({ businesses: [] })
}));

vi.mock('./useProposalsFeature', () => ({
    useProposalsQuery: () => ({ proposals: [] })
}));

vi.mock('../../components/modals/PostAdModal', () => ({
    PostAdModal: () => null
}));

const LocationProbe = () => {
    const location = useLocation();
    return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
};

describe('Business & Proposal Navigation Regressions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('BusinessCard "Contact" action', () => {
        const business = {
            id: 'biz-1',
            name: 'Austin Coffee Co-op',
            description: 'Worker owned coffee roastery.',
            category: 'Food & Beverage',
            owner: { username: 'alice', handle: '@alice' },
            owner_name: 'alice'
        };

        it('routes to the private message module pre-configured with the operator handle', () => {
            render(
                <MemoryRouter initialEntries={['/businesses']}>
                    <Routes>
                        <Route path="/businesses" element={<BusinessCard biz={business} />} />
                        <Route path="*" element={<LocationProbe />} />
                    </Routes>
                </MemoryRouter>
            );

            fireEvent.click(screen.getByTestId('business-card-contact-btn'));

            expect(screen.getByTestId('location-probe')).toHaveTextContent('/messages?user=alice');
        });

        it('falls back to owner_name when no handle object is present', () => {
            const stringOwnerBusiness = {
                ...business,
                owner: 'coop_operator',
                owner_name: 'coop_operator'
            };

            render(
                <MemoryRouter initialEntries={['/businesses']}>
                    <Routes>
                        <Route path="/businesses" element={<BusinessCard biz={stringOwnerBusiness} />} />
                        <Route path="*" element={<LocationProbe />} />
                    </Routes>
                </MemoryRouter>
            );

            fireEvent.click(screen.getByTestId('business-card-contact-btn'));

            expect(screen.getByTestId('location-probe')).toHaveTextContent('/messages?user=coop_operator');
        });
    });

    describe('LocalBusinessesPage tab restoration', () => {
        const renderPage = (entry) => render(
            <MemoryRouter initialEntries={[entry]}>
                <Routes>
                    <Route path="/businesses" element={<LocalBusinessesPage />} />
                </Routes>
            </MemoryRouter>
        );

        it('pins the Business Proposals pane when router state requests it', () => {
            renderPage({ pathname: '/businesses', state: { returnTab: 'proposals' } });

            expect(screen.getByTestId('tab-proposals-btn')).toHaveAttribute('data-state', 'active');
            expect(screen.getByTestId('tab-businesses-btn')).toHaveAttribute('data-state', 'inactive');
            expect(screen.getByTestId('proposals-feed')).toBeInTheDocument();
        });

        it('defaults to the Businesses pane without return-tab state', () => {
            renderPage('/businesses');

            expect(screen.getByTestId('tab-businesses-btn')).toHaveAttribute('data-state', 'active');
            expect(screen.getByTestId('tab-proposals-btn')).toHaveAttribute('data-state', 'inactive');
            expect(screen.getByTestId('businesses-feed')).toBeInTheDocument();
        });
    });
});
