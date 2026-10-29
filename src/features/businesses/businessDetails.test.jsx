import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BusinessDetailsPage } from '../../pages/businesses/BusinessDetailsPage';

// Mock the business details query hook
vi.mock('../../features/businesses/useBusinessesFeature', () => ({
    useBusinessDetailsQuery: vi.fn(() => ({
        business: {
            id: 'biz-123',
            user_id: 'usr-owner-456',
            name: 'Austin Artisan Bakery Co-op',
            description: 'Fresh organic sourdough baked daily.',
            category: 'Food & Beverage',
            sub_category: 'bakery',
            legal_structure: 'Worker-Owned Co-op',
            address: '789 East 6th St',
            city: 'Austin',
            state: 'TX',
            zip: '78702',
            phone: '512-555-1234',
            email: 'hello@artisanbakery.coop',
            website: 'https://artisanbakery.coop',
            hours: '8:00 AM - 4:00 PM',
            established: '2021',
            employees: '6-20',
            images: [
                'https://cdn.example.com/bakery_1.jpg',
                'https://cdn.example.com/bakery_2.jpg'
            ],
            services: ['Fresh Bread', 'Pastries', 'Catering'],
            owner_name: 'alice',
            verified: true
        },
        businessLoading: false,
        businessError: null
    }))
}));

// Mock the auth store
vi.mock('../../store/auth/useAuthStore', () => ({
    useAuthStore: vi.fn((selector) => {
        const state = {
            user: { id: 'usr-visitor-789', username: 'bob' },
            isAuthenticated: true
        };
        return selector ? selector(state) : state;
    })
}));

// Mock the direct message store
vi.mock('../../store/useDirectMessageStore', () => ({
    useDirectMessageStore: {
        getState: () => ({
            openDM: vi.fn()
        })
    }
}));

describe('BusinessDetailsPage Component', () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    });

    const renderPage = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/businesses/biz-123']}>
                    <Routes>
                        <Route path="/businesses/:id" element={<BusinessDetailsPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );
    };

    it('renders business information, gallery photos, and quick actions', () => {
        renderPage();

        expect(screen.getByRole('heading', { name: 'Austin Artisan Bakery Co-op' })).toBeInTheDocument();
        expect(screen.getByText('Worker-Owned Co-op')).toBeInTheDocument();
        expect(screen.getByTestId('contact-business-btn')).toBeInTheDocument();
        expect(screen.getByTestId('send-message-btn')).toBeInTheDocument();
    });

    it('does NOT render reviews tab or customer feedback (Requirement 2)', () => {
        renderPage();

        // Reviews tab should be gone
        expect(screen.queryByRole('button', { name: /reviews/i })).not.toBeInTheDocument();
        expect(screen.queryByText(/customer feedback/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/total reviews/i)).not.toBeInTheDocument();
    });

    it('renders gallery images accurately', () => {
        renderPage();

        const galleryImg1 = screen.getByAltText('Austin Artisan Bakery Co-op gallery 1');
        const galleryImg2 = screen.getByAltText('Austin Artisan Bakery Co-op gallery 2');

        expect(galleryImg1).toBeInTheDocument();
        expect(galleryImg2).toBeInTheDocument();
        expect(galleryImg1).toHaveAttribute('src', 'https://cdn.example.com/bakery_1.jpg');
    });
});
