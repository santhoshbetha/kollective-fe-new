// src/pages/EventsPage.jsx
import React from 'react';
import { EventsFeed } from '../features/events/EventsFeed';

export function EventsPage() {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">Events</h2>
                <p className="text-text-secondary text-body-sm">Coordinate, gather, and participate across collective actions.</p>
            </div>

            {/* Heavy list processing and pagination state is isolated here */}
            <EventsFeed />
        </div>
    );
}
