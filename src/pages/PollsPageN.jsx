// src/pages/PollsPage.jsx
import React from 'react';
import { PollsFeed } from '../features/polls/PollsFeed';

export function PollsPage() {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">Polls</h2>
                <p className="text-text-secondary text-body-sm">Measure group alignment, build local consensus, and coordinate democratic policy.</p>
            </div>

            {/* Heavy computational logic maps and endless scroll anchors execute securely inside feature */}
            <PollsFeed />
        </div>
    );
}
