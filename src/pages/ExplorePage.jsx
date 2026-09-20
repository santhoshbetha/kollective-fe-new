import React, { useState } from 'react';
import { useAuthStore } from '../store/auth/useAuthStore';
import { ExploreFeed } from '../features/explore/ExploreFeed';

// ⚙️ Feature Flag: Set to true when opening Civic Assembly & Civic Poll features
const ENABLE_CIVIC_FEATURES = false;

export const ExplorePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const user = useAuthStore((state) => state.user);

    const allCategories = [
        { id: 'all', label: 'All Highlights', icon: 'auto_awesome' },
        { id: 'organizing', label: 'Organizing & Hubs', icon: 'groups' },
        { id: 'polls', label: 'Civic Polls', icon: 'how_to_vote', isCivic: true },
        { id: 'businesses', label: 'Ethical Business', icon: 'storefront' },
        { id: 'events', label: 'Events & Meetings', icon: 'event' }
    ];

    // Filter out civic-only tabs during initial launch phase
    const categories = allCategories.filter((cat) => ENABLE_CIVIC_FEATURES || !cat.isCivic);

    const activeState = user?.state || 'Local Region';

    return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-0 flex flex-col gap-6 w-full">
            {/* Context Header & Scope Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="font-display-lg text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">Explore Kollective</h1>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-container/10 border border-primary-container/20 text-primary-container">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {activeState}
                        </span>
                    </div>
                    <p className="text-text-secondary text-[18px]">
                        {ENABLE_CIVIC_FEATURES
                            ? 'Discover neighborhood hubs, grassroots campaigns, civic assemblies, and ethical co-ops in your area.'
                            : 'Discover neighborhood hubs, community projects, local businesses, and upcoming events in your area.'}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <button
                        onClick={() => document.getElementById('explore-search-input')?.focus()}
                        className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer p-0 z-10 flex items-center justify-center"
                    >
                        search
                    </button>
                    <input
                        id="explore-search-input"
                        className="w-full pl-12 pr-10 py-3 bg-surface-container-low border border-white/10 rounded-xl focus:outline-none focus:border-primary-container transition-all text-text-primary text-sm placeholder:text-text-secondary/40"
                        placeholder={ENABLE_CIVIC_FEATURES ? "Search civic topics, hubs, polls, or events..." : "Search topics, hubs, businesses, or events..."}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer p-0 z-10 flex items-center justify-center text-sm"
                        >
                            close
                        </button>
                    )}
                </div>
            </div>

            {/* Category Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => {
                    const isActive = activeTab === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer border ${isActive
                                ? 'bg-primary-container text-white border-primary-container shadow-lg shadow-primary-container/20'
                                : 'bg-surface-container-low text-text-secondary border-white/5 hover:bg-surface-container-high hover:text-text-primary'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Explore Bento Feed Grid */}
            <ExploreFeed searchQuery={searchQuery} activeTab={activeTab} enableCivic={ENABLE_CIVIC_FEATURES} />
        </div>
    );
};

