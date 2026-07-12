// src/pages/BookmarksPage.jsx
import React from 'react';
import { BookmarksFeed } from '../features/bookmarks/BookmarksFeed';

export function BookmarksPage() {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">Bookmarks</h2>
                <p className="text-text-secondary text-body-sm">Your private archive of saved and prioritized broadcasts.</p>
            </div>

            {/* Execute query pipelines and endless data maps within the feature element */}
            <BookmarksFeed />
        </div>
    );
}
