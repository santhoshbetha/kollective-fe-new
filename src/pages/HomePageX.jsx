// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/auth/useAuthStore';
import { TimelineFeed } from '../features/timeline/TimelineFeed';
import { TrendingWidget } from '../components/TrendingWidget';

export const HomePageX = () => {
    // 🎛️ Pull active feed configuration chips parameters directly from your unified useStore
    const activeTab = useStore((state) => state.homeFeedTab);
    const setActiveTab = useStore((state) => state.setHomeFeedTab);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const baseTabs = ['All Activity', 'Voices', 'Popular'];
    const tabs = isAuthenticated ? [...baseTabs, 'Following'] : baseTabs;

    useEffect(() => {
        if (!isAuthenticated && activeTab === 'Following') {
            setActiveTab('All Activity');
        }
    }, [isAuthenticated, activeTab, setActiveTab]);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-0 md:gap-16">

            <div className="w-full flex-1 flex flex-col gap-2 md:max-w-3xl">

                {/* 🧭 Feed Filter Chips Navigation */}
                {/* Added px-4 on mobile so chips don't hug the screen edge perfectly, matches layout */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 px-4 md:px-0 pb-0 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-label-md transition-all duration-200 border cursor-pointer ${isActive
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
                <div className="-mx-4 md:mx-0 w-[calc(100%+2rem)] md:w-full">
                    <TimelineFeed />
                </div>

            </div>

            {/* 📈 Right Sidebar Trending Metadata Widgets */}
            {/* Hidden on mobile (hidden), visible from medium screens up (md:block) */}
            <div className="hidden md:block">
                <TrendingWidget />
            </div>
        </div>
    );
};
