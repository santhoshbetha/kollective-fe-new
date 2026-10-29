import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfilePage } from '../../pages/profile/UserProfilePage';

let mockCurrentUser = { id: 'usr-alice-1', username: 'alice', handle: '@alice', name: 'Alice Walker' };

const mockEventsList = [
    {
        id: 'evt-1',
        title: 'Alice Austin Community Meet',
        category: 'Community & culture',
        format: 'In-Person',
        date: 'Nov 15, 2026',
        time: '14:00 - 16:00',
        location_name: 'Zilker Park, Austin, TX',
        created_by: 'usr-alice-1',
        user_id: 'usr-alice-1',
        organizer: { id: 'usr-alice-1', username: 'alice' },
        organizerName: 'alice',
        attendeesCount: 25,
        interestedCount: 10
    },
    {
        id: 'evt-2',
        title: 'Bob Tech Hackathon',
        category: 'Technology',
        format: 'In-Person',
        date: 'Dec 1, 2026',
        time: '09:00 - 18:00',
        location_name: 'Downtown Austin Library',
        created_by: 'usr-bob-2',
        user_id: 'usr-bob-2',
        organizer: { id: 'usr-bob-2', username: 'bob' },
        organizerName: 'bob',
        attendeesCount: 50,
        interestedCount: 30
    }
];

const mockBusinessesList = [
    {
        id: 'biz-1',
        name: 'Alice Organic Bakery Co-op',
        category: 'Food & Beverage',
        legal_structure: 'Worker-Owned Co-op',
        address: '123 South Congress, Austin, TX',
        description: 'Locally grown grains and sourdough breads.',
        user_id: 'usr-alice-1',
        owner_name: 'alice'
    },
    {
        id: 'biz-2',
        name: 'Bob Hardware & Repair',
        category: 'Professional Services',
        legal_structure: 'LLC',
        address: '456 North Lamar, Austin, TX',
        description: 'Community repair workshop and tools.',
        user_id: 'usr-bob-2',
        owner_name: 'bob'
    }
];

vi.mock('../../features/events/useEventsFeature', () => ({
    useEventsQuery: vi.fn(() => ({
        events: mockEventsList,
        eventsLoading: false,
    }))
}));

vi.mock('../../features/businesses/useBusinessesFeature', () => ({
    useBusinessesQuery: vi.fn(() => ({
        businesses: mockBusinessesList,
        businessesLoading: false,
    }))
}));

vi.mock('../../features/profile/useProfileFeature', () => ({
    useProfileQuery: vi.fn((username) => ({
        data: {
            id: username === 'alice' ? 'usr-alice-1' : 'usr-bob-2',
            username: username,
            name: username === 'alice' ? 'Alice Walker' : 'Bob Builder',
            handle: `@${username}`,
            bio: `${username}'s profile bio on the decentralized network.`,
            posts_count: 5,
            following_count: 12,
            followers_count: 34,
            type: 'user',
            badge_type: 'citizen'
        },
        isLoading: false
    })),
    useProfileTimelineQuery: vi.fn(() => ({
        data: { pages: [{ posts: [] }] },
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false
    })),
    useToggleFollowMutation: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isPending: false
    })),
    useProfileConnectionsQuery: vi.fn(() => ({
        data: { pages: [] },
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false
    }))
}));

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

vi.mock('../../store/useDirectMessageStore', () => ({
    useDirectMessageStore: vi.fn((selector) => {
        const state = { openDM: vi.fn() };
        return selector ? selector(state) : state;
    }),
}));

vi.mock('../../store/useStore', () => ({
    useStore: vi.fn((selector) => {
        const state = { showPersonalHandleOnOrg: false };
        return selector ? selector(state) : state;
    }),
}));

describe('UserProfilePage Events and Businesses Visibility Suite', () => {
    let queryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        mockCurrentUser = { id: 'usr-alice-1', username: 'alice', handle: '@alice', name: 'Alice Walker' };
    });

    it('displays My Events and My Businesses tabs when viewing OWN profile', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/profile/alice']}>
                    <Routes>
                        <Route path="/profile/:username" element={<UserProfilePage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByTestId('tab-my-events')).toBeInTheDocument();
        expect(screen.getByTestId('tab-my-businesses')).toBeInTheDocument();
    });

    it('does NOT display My Events and My Businesses tabs when viewing ANOTHER USER profile (hidden from others)', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/profile/bob']}>
                    <Routes>
                        <Route path="/profile/:username" element={<UserProfilePage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Crucial requirement: "only visible to user. not to others."
        expect(screen.queryByTestId('tab-my-events')).not.toBeInTheDocument();
        expect(screen.queryByTestId('tab-my-businesses')).not.toBeInTheDocument();
        expect(screen.queryByTestId('my-events-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('my-businesses-section')).not.toBeInTheDocument();
    });

    it('renders user hosted events and Edit button when My Events tab is selected', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/profile/alice']}>
                    <Routes>
                        <Route path="/profile/:username" element={<UserProfilePage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        const myEventsTab = screen.getByTestId('tab-my-events');
        fireEvent.click(myEventsTab);

        expect(screen.getByTestId('my-events-section')).toBeInTheDocument();
        // Alice's event should be visible
        expect(screen.getByText('Alice Austin Community Meet')).toBeInTheDocument();
        expect(screen.getByTestId('edit-my-event-btn-evt-1')).toBeInTheDocument();

        // Bob's event should NOT be in Alice's My Events tab
        expect(screen.queryByText('Bob Tech Hackathon')).not.toBeInTheDocument();
    });

    it('renders user registered businesses and Edit button when My Businesses tab is selected', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/profile/alice']}>
                    <Routes>
                        <Route path="/profile/:username" element={<UserProfilePage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        const myBizTab = screen.getByTestId('tab-my-businesses');
        fireEvent.click(myBizTab);

        expect(screen.getByTestId('my-businesses-section')).toBeInTheDocument();
        // Alice's business should be visible
        expect(screen.getByText('Alice Organic Bakery Co-op')).toBeInTheDocument();
        expect(screen.getByTestId('edit-my-business-btn-biz-1')).toBeInTheDocument();

        // Bob's business should NOT be in Alice's My Businesses tab
        expect(screen.queryByText('Bob Hardware & Repair')).not.toBeInTheDocument();
    });
});
