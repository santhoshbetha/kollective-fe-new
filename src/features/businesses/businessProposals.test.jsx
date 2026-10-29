import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BusinessProposalCard } from './BusinessProposalCard';
import { BusinessProposalDetailsPage } from '../../pages/businesses/BusinessProposalDetailsPage';
import { EditBusinessProposalPage } from '../../pages/businesses/EditBusinessProposalPage';

const mockProposal = {
    id: 'prop-123',
    user_id: 'usr-owner-alice',
    title: 'Austin Solar Microgrid Cooperative',
    name: 'Austin Solar Microgrid Cooperative',
    description: 'A neighborhood solar energy storage network.',
    category: 'Technology',
    location: 'East Austin, TX',
    fundingGoal: 75000,
    money_required: 75000,
    minInvest: 100,
    maxInvest: 5000,
    percent: 45,
    daysLeft: 30,
    participants: '42 Members',
    status: 'Active',
    image: 'https://cdn.example.com/solar_banner.jpg',
    profile_image_url: 'https://cdn.example.com/solar_banner.jpg',
    owner_name: 'alice',
    ownerAvatar: 'https://cdn.example.com/alice_avatar.jpg',
    tags: ['Solar Co-op', 'Clean Energy', 'Battery Storage'],
    metadata: {
        funding_data: {
            fundingGoal: 75000,
            minInvest: 100,
            maxInvest: 5000,
            daysLeft: 30,
            status: 'Active'
        }
    }
};

const mockAuthState = {
    user: { id: 'usr-owner-alice', username: 'alice', avatar_url: 'https://cdn.example.com/alice_avatar.jpg' },
    isAuthenticated: true
};

// Mock the proposal details query hook
vi.mock('../../features/businesses/useProposalsFeature', () => ({
    useProposalDetailsQuery: vi.fn(() => ({
        proposal: mockProposal,
        proposalLoading: false,
        proposalError: null
    })),
    useUpdateProposal: vi.fn(() => ({
        mutate: vi.fn((data, options) => {
            if (options?.onSuccess) options.onSuccess(data);
        }),
        isPending: false
    }))
}));

// Mock auth store where user is the proposal owner
vi.mock('../../store/auth/useAuthStore', () => ({
    useAuthStore: vi.fn((selector) => {
        return selector ? selector(mockAuthState) : mockAuthState;
    })
}));

describe('Business Proposals Features', () => {
    let queryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false, gcTime: 0 }
            }
        });
    });

    describe('BusinessProposalCard Component', () => {
        const sampleProp = {
            id: 'prop-abc',
            title: 'Community Hydroponics Hub',
            description: 'Year-round sustainable indoor vertical farming for central districts.',
            category: 'Agriculture',
            fundingGoal: 60000,
            percent: 50,
            daysLeft: 20,
            participants: '35 Members',
            minInvest: 50,
            maxInvest: 2500,
            status: 'Hot',
            image: 'https://cdn.example.com/hydro_farm.jpg',
            owner_name: 'farmer_dan',
            ownerAvatar: 'https://cdn.example.com/dan_avatar.jpg'
        };

        it('renders user avatar, handle, proposal image banner, and title', () => {
            render(
                <MemoryRouter>
                    <BusinessProposalCard prop={sampleProp} />
                </MemoryRouter>
            );

            // Verify title and description
            expect(screen.getByText('Community Hydroponics Hub')).toBeInTheDocument();
            expect(screen.getByText(/sustainable indoor vertical farming/i)).toBeInTheDocument();

            // Verify user avatar (Requirement 3)
            const avatarImg = screen.getByTestId('proposal-creator-avatar');
            expect(avatarImg).toBeInTheDocument();
            expect(avatarImg).toHaveAttribute('src', 'https://cdn.example.com/dan_avatar.jpg');
            expect(screen.getByText('@farmer_dan')).toBeInTheDocument();

            // Verify proposal image
            const bannerImg = screen.getByAltText('Community Hydroponics Hub');
            expect(bannerImg).toBeInTheDocument();
            expect(bannerImg).toHaveAttribute('src', 'https://cdn.example.com/hydro_farm.jpg');
        });

        it('renders fallback initial when ownerAvatar is absent', () => {
            const propWithoutAvatar = {
                ...sampleProp,
                ownerAvatar: null,
                owner_name: 'zoe'
            };

            render(
                <MemoryRouter>
                    <BusinessProposalCard prop={propWithoutAvatar} />
                </MemoryRouter>
            );

            const fallbackAvatar = screen.getByTestId('proposal-creator-avatar');
            expect(fallbackAvatar).toBeInTheDocument();
            expect(fallbackAvatar.textContent).toBe('Z');
            expect(screen.getByText('@zoe')).toBeInTheDocument();
        });
    });

    describe('BusinessProposalDetailsPage Component', () => {
        it('renders proposal details, creator avatar, and Edit Proposal button for the owner', () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={['/proposals/prop-123']}>
                        <Routes>
                            <Route path="/proposals/:id" element={<BusinessProposalDetailsPage />} />
                        </Routes>
                    </MemoryRouter>
                </QueryClientProvider>
            );

            expect(screen.getByRole('heading', { name: 'Austin Solar Microgrid Cooperative' })).toBeInTheDocument();
            expect(screen.getByText(/neighborhood solar energy storage/i)).toBeInTheDocument();

            // Verify Edit Proposal button is visible to owner
            const editBtns = screen.getAllByTestId(/edit-proposal/i);
            expect(editBtns.length).toBeGreaterThan(0);
        });
    });

    describe('EditBusinessProposalPage Component', () => {
        it('pre-populates form fields with existing proposal values', () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={['/proposals/prop-123/edit']}>
                        <Routes>
                            <Route path="/proposals/:id/edit" element={<EditBusinessProposalPage />} />
                        </Routes>
                    </MemoryRouter>
                </QueryClientProvider>
            );

            expect(screen.getByRole('heading', { name: 'Edit Business Proposal' })).toBeInTheDocument();

            const titleInput = screen.getByPlaceholderText(/e.g. Austin Clean Energy Cooperative/i);
            expect(titleInput).toHaveValue('Austin Solar Microgrid Cooperative');

            const descInput = screen.getByPlaceholderText(/Describe your vision/i);
            expect(descInput).toHaveValue('A neighborhood solar energy storage network.');

            expect(screen.getByTestId('submit-proposal-btn')).toBeInTheDocument();
        });
    });
});
