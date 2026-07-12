// src/pages/NotificationsPage.jsx
import React from 'react';
import { NotificationsFeed } from '../features/notifications/NotificationsFeed';

export function NotificationsPage() {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">Notifications</h2>
                <p className="text-text-secondary text-body-sm">Track interactions, peer reviews, and platform activity.</p>
            </div>

            {/* Execute pipeline stream calculations securely here */}
            <NotificationsFeed />
        </div>
    );
}
