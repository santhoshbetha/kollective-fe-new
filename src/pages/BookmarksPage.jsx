// src/pages/BookmarksPage.jsx
import React, { useState } from 'react';
import { BookmarksFeed } from '../features/bookmarks/BookmarksFeed';

export const BookmarksPage = () => {
    const [activeFilter, setActiveFilter] = useState('All Categories');

    const filters = ['All Categories', 'Manifestos', 'Strategy'];

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 w-full">

            {/* 🧭 Header & Category Toolbar Row Layout Panel */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="font-display-lg text-3xl font-extrabold text-text-primary mb-1 tracking-tight">
                        Saved Posts
                    </h1>
                    <p className="text-body-sm text-text-secondary">
                        Archive of your most inspiring revolutionary insights.
                    </p>
                </div>

                {/* Filter Selection Chips */}
                <div className="flex gap-2 self-end md:self-auto overflow-x-auto pb-1 no-scrollbar">
                    {filters.map((filter) => {
                        const isActive = activeFilter === filter;
                        return (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap cursor-pointer ${isActive
                                        ? 'bg-primary-container text-white border-primary-container crimson-glow'
                                        : 'bg-surface-container-high border-white/5 hover:bg-surface-variant text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ⚡ LOAD THE SEPARATED LOGIC CONTENT SCROLL STREAM */}
            <BookmarksFeed activeFilter={activeFilter} />

        </div>
    );
};
