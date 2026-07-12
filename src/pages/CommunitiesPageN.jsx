// src/pages/CommunitiesPage.jsx
import React from 'react';
import { CommunitiesFeed } from '../features/communities/CommunitiesFeed';

export function CommunitiesPage() {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            {/* Keep the page shell lightweight and focused on presentation */}
            <CommunitiesFeed />
        </div>
    );
}
