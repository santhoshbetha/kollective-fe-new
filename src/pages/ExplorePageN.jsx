// src/pages/ExplorePage.jsx
import React from 'react';
import { ExploreFeed } from '../features/explore/ExploreFeed';

export function ExplorePage() {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">Explore</h2>
                <p className="text-text-secondary text-body-sm">Audit decentralized broadcast streams, aggregate metrics, and coordinate parameters.</p>
            </div>

            {/* Dynamic input hooks calculations map out safely inside feature layout container */}
            <ExploreFeed />
        </div>
    );
}
