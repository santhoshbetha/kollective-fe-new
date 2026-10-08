// src/pages/BookmarksPage.jsx
import React, { useState } from 'react';
import { BookmarksFeed } from '../../features/bookmarks/BookmarksFeed';
import { cn } from "@/lib/utils"; // Adjust to match your utility project layout

export const BookmarksPage = () => {
    const [activeFilter, setActiveFilter] = useState('All Categories');

    const filters = ['All Categories', 'Manifestos', 'Strategy'];

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 w-full text-left">

            {/* 🧭 Header & Category Toolbar Row Layout Panel */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 border-b border-white/5 pb-6 select-none font-sans">
                <div className="space-y-1">
                    <h1 className="font-headline-lg text-3xl font-black text-white tracking-tight">
                        Saved Posts
                    </h1>
                    <p className="text-xs font-medium text-text-secondary">
                        Archive of your most inspiring revolutionary insights.
                    </p>
                </div>

                {/* Filter Selection Tabs Chips */}
                <div className="flex gap-2 self-start md:self-auto overflow-x-auto pb-1 no-scrollbar font-mono text-xs w-full sm:w-auto">
                    {filters.map((filter) => {
                        const isActive = activeFilter === filter;
                        return (
                            <button
                                type="button"
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full font-bold transition-all border whitespace-nowrap cursor-pointer outline-none",
                                    isActive
                                        ? "bg-primary-container text-white border-primary-container crimson-glow font-extrabold shadow-sm"
                                        : "bg-surface-container-high border-white/5 hover:bg-white/[0.02] text-text-secondary hover:text-white"
                                )}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ⚡ LOAD THE SEPARATED LOGIC VIRTUALIZED SCROLL FEED ENGINE */}
            <div className="w-full relative">
                <BookmarksFeed activeFilter={activeFilter} />
            </div>
        </div>
    );
};
