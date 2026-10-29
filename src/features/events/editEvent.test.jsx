import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventDetailsPage } from '../../pages/events/EventDetailsPage';
import { EditEventPage } from '../../pages/events/EditEventPage';

let mockAuthUser = { id: 'usr-alice-1', username: 'alice' };
let mockEventData = {
    id: 'event-101',
    created_by: 'usr-alice-1',
    user_id: 'usr-alice-1',
    title: 'Decentralized Web Summit',
    description: 'A deep dive into distributed systems and local governance.',
    category: 'Technology',
    format: 'In-Person',
    participation_format: 'in_person',
    start_time: '2026-11-20T18:00:00Z',
    end_time: '2026-11-20T21:00:00Z',
    date: 'Nov 20, 2026',
    time: '18:00 - 21:00',
    location_name: 'Austin Public Library',
    street: '710 W Cesar Chavez St',
    capacity: 100,
    attendeesCount: 42,
    interestedCount: 15,
    organizer: { id: 'usr-alice-1', username: 'alice' },
    organizerName: 'alice'
};

vi.mock('../../features/events/useEventsFeature', () => ({
    useEventsQuery: vi.fn(() => ({
        events: [mockEventData],
        eventsLoading: false,
    })),
    useEventDetailsQuery: vi.fn(() => ({
        event: mockEventData,
        eventLoading: false,
        eventError: null,
    })),
    useUpdateEvent: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
    useToggleEventInterest: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
    useToggleEventAttendance: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
    useAddEventComment: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
    useEventCommentsQuery: vi.fn(() => ({
        data: [],
    })),
    useLikeEventComment: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
}));

vi.mock('../../store/auth/useAuthStore', () => ({
    useAuthStore: vi.fn((selector) => {
        const state = {
            user: mockAuthUser,
            activeAccount: mockAuthUser,
            isAuthenticated: true,
        };
        return selector ? selector(state) : state;
    }),
}));

describe('Event Editing Feature Test Suite', () => {
    let queryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        mockAuthUser = { id: 'usr-alice-1', username: 'alice' };
    });

    it('renders Edit Event button on EventDetailsPage for the organizer', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/events/event-101']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByTestId('edit-event-btn')).toBeInTheDocument();
        expect(screen.getByTestId('edit-event-action-btn')).toBeInTheDocument();
    });

    it('does NOT render Edit Event buttons on EventDetailsPage for other users', () => {
        mockAuthUser = { id: 'usr-bob-2', username: 'bob' };

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/events/event-101']}>
                    <Routes>
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.queryByTestId('edit-event-btn')).not.toBeInTheDocument();
        expect(screen.queryByTestId('edit-event-action-btn')).not.toBeInTheDocument();
    });

    it('pre-populates event fields on EditEventPage for the organizer', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/events/event-101/edit']}>
                    <Routes>
                        <Route path="/events/:id/edit" element={<EditEventPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByTestId('event-title-input')).toHaveValue('Decentralized Web Summit');
        expect(screen.getByTestId('event-description-input')).toHaveValue(
            'A deep dive into distributed systems and local governance.'
        );
        expect(screen.getByTestId('event-location-input')).toHaveValue('Austin Public Library');
        expect(screen.getByTestId('event-capacity-input')).toHaveValue(100);
        expect(screen.getByTestId('event-submit-btn')).toBeInTheDocument();
    });

    it('displays Authorization Restricted notice on EditEventPage for non-organizers', () => {
        mockAuthUser = { id: 'usr-bob-2', username: 'bob' };

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/events/event-101/edit']}>
                    <Routes>
                        <Route path="/events/:id/edit" element={<EditEventPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(screen.getByText('Authorization Restricted')).toBeInTheDocument();
        expect(screen.getByText(/Only the event organizer or a platform moderator can modify this event/i)).toBeInTheDocument();
        expect(screen.queryByTestId('event-submit-btn')).not.toBeInTheDocument();
    });
});
