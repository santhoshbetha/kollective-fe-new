// src/pages/HomePage.jsx
import React from 'react';
import { useStore } from '../store/useStore';
import { TimelineFeed } from '../features/timeline/TimelineFeed';
import { TrendingWidget } from '../components/TrendingWidget';

export const HomePage = () => {
    // 🎛️ Pull active feed configuration chips parameters directly from your unified useStore
    const activeTab = useStore((state) => state.homeFeedTab);
    const setActiveTab = useStore((state) => state.setHomeFeedTab);

    const tabs = ['All Activity', 'Voices', 'Popular', 'Following'];

    return (
        <div className="max-w-7xl mx-auto flex gap-16">

            {/* 📋 Central Feed Processing Column Layout */}
            <div className="flex-1 flex flex-col gap-6 max-w-3xl">

                {/* 🧭 Feed Filter Chips Navigation */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full font-bold text-label-md transition-all duration-200 whitespace-nowrap border ${isActive
                                        ? 'bg-primary-container text-white border-primary-container crimson-glow'
                                        : 'bg-surface-container-high text-text-secondary hover:text-text-primary border-white/5 hover:border-white/10'
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* ⚡ VIRTUALIZED TIMELINE FEED CONTAINER INJECTION */}
                {/* All pagination loaders, mock queries, unread banner flushes, 
            and skeleton parameters are encapsulated cleanly right here! */}
                <TimelineFeed />

            </div>

            {/* 📈 Right Sidebar Trending Metadata Widgets */}
            <TrendingWidget />
        </div>
    );
};
