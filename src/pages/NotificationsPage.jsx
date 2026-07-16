// src/pages/NotificationsPage.jsx
import React from 'react';
import { NotificationsFeed } from '../features/notifications/NotificationsFeed';
import { useMarkNotificationsRead } from '../features/notifications/useNotificationsFeature';

export const NotificationsPage = () => {
    const markNotificationsAsRead = useMarkNotificationsRead();

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 text-scale-large w-full">
            {/* 🧭 Header and Global Actions Layout Row Panel */}
            <div className="flex justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 mb-4">
                <div>
                    <h1 className="font-display-lg text-3xl font-extrabold text-text-primary mb-1 tracking-tight">Notifications</h1>
                    <p className="text-body-sm text-text-secondary">Stay updated with the collective pulse.</p>
                </div>

                <button
                    onClick={() => markNotificationsAsRead.mutate()}
                    disabled={markNotificationsAsRead.isPending}
                    className="flex items-center gap-1 text-primary-container hover:underline transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none disabled:opacity-40"
                >
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    {markNotificationsAsRead.isPending ? 'Marking logs...' : 'Mark all as read'}
                </button>
            </div>

            {/* ⚡ LOAD THE SEPARATED DECOUPLED CONTENT SCROLL STREAM CONTAINER */}
            <NotificationsFeed />
        </div>
    );
};
