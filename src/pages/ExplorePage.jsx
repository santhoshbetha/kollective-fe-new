import React, { useState } from 'react';
import { ExploreFeed } from '../features/explore/ExploreFeed';

export const ExplorePage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-0 flex flex-col gap-6 w-full">
            {/* Page Header Layout Toolbar Panel */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
                <div>
                    <h1 className="font-display-lg text-4xl font-extrabold text-text-primary mb-1 tracking-tight">Explore</h1>
                    <p className="text-text-secondary text-body-sm">Find your community and discover trending rebellions.</p>
                </div>

                {/* Search Input Controls */}
                <div className="relative w-full md:w-96 group">
                    <button
                        onClick={() => document.getElementById('explore-search-input')?.focus()}
                        className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer p-0 z-10 flex items-center justify-center"
                    >
                        search
                    </button>
                    <input
                        id="explore-search-input"
                        className="w-full pl-12 pr-10 py-3.5 bg-surface-container-low border border-white/10 rounded-xl focus:outline-none focus:border-primary-container transition-all font-body-sm placeholder:text-text-text-secondary/40 text-text-primary text-sm"
                        placeholder="Search topics, tags, or groups..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer p-0 z-10 flex items-center justify-center"
                        >
                            close
                        </button>
                    )}
                </div>
            </div>

            {/* ⚡ LOAD THE SEPARATED BENTO CONTENT FRAME GRID CONTAINER */}
            <ExploreFeed searchQuery={searchQuery} />
        </div>
    );
};