// src/pages/CommunitiesPage.jsx
import React from 'react';
import { useStore } from '../store/useStore';
import { CommunitiesFeed } from '../features/communities/CommunitiesFeed';

export const CommunitiesPage = () => {
    // 🎛️ Pull dynamic geographic state settings natively out of your unified useStore
    const activeTab = useStore((state) => state.communitiesTab);
    const setActiveTab = useStore((state) => state.setCommunitiesTab);

    const tabs = ['Local', 'State', 'Country', 'World'];

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12">

            {/* 📋 Left Column: Feed Presentation Framework */}
            <div className="flex-1 flex flex-col gap-6 max-w-3xl">
                {/* Header & Description */}
                <div className="mb-4">
                    <h1 className="font-headline-lg text-3xl font-extrabold text-text-primary mb-2">
                        Communities Feed
                    </h1>
                    <p className="text-text-secondary font-body-md text-lg font-semibold leading-relaxed">
                        Stay informed about concerning issues and voices in your geographic area. Select a scope to view posts.
                    </p>
                </div>

                {/* Geographic Tabs Navigation Selection Row */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar border-b border-white/5 pb-4">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full font-bold text-label-md transition-all duration-200 border ${isActive
                                    ? 'bg-primary-container text-white border-primary-container crimson-glow'
                                    : 'bg-surface-container-high text-text-secondary hover:text-text-primary border-white/5 hover:border-white/10'
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* ⚡ DECENTRALIZED VIRTUALIZED FEED INNER ARCHITECTURE CONTAINER */}
                <CommunitiesFeed />

            </div>

            {/* 🗺️ Right Sidebar Widgets & Geo-Overlays */}
            <aside className="w-full lg:w-80 flex flex-col gap-6">

                {/* Local Organizing Node Visual Map Container */}
                <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-80 bg-surface-container-low border border-white/5">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-container-lowest/50">
                        <h5 className="font-label-md text-text-primary font-bold text-lg">Organizing Nodes</h5>
                        <span className="text-on-surface-variant text-[15px]">District 9</span>
                    </div>
                    <div className="flex-grow relative">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80')" }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="w-16 h-16 bg-primary-container/10 rounded-full animate-pulse flex items-center justify-center">
                                    <div className="w-8 h-8 bg-primary-container/20 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-primary-container rounded-full shadow-[0_0_15px_rgba(204,0,0,0.8)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 glass-panel bg-background/80 backdrop-blur-md p-3 rounded-xl flex items-center justify-between border-white/10">
                            <div className="text-[14px] font-bold text-text-primary">12 Active Projects</div>
                            <button
                                onClick={() => alert('Opening interactive geographic nodes map...')}
                                className="bg-primary-container text-white px-3 py-1 rounded-lg text-[14px] font-bold shadow-lg shadow-primary-container/20"
                            >
                                Map
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trending Coalitions Metric Feed Panel */}
                <div className="glass-panel rounded-xl p-6 bg-surface-container-low border border-white/5">
                    <h4 className="text-lg font-bold text-text-primary mb-4 uppercase tracking-wider">Trending Coalitions</h4>
                    <div className="space-y-4">
                        <div className="space-y-1 cursor-pointer group" onClick={() => alert('Navigating to #PublicWaterRights feed...')}>
                            <p className="text-text-secondary text-[16px] font-bold uppercase tracking-widest">Environment · National</p>
                            <h5 className="text-text-primary font-bold group-hover:text-primary-container transition-colors text-sm">#PublicWaterRights</h5>
                            <p className="text-text-secondary text-[15px]">15.4k active organizers</p>
                        </div>
                        <div className="space-y-1 cursor-pointer group" onClick={() => alert('Navigating to Gig Worker Union node...')}>
                            <p className="text-text-secondary text-[16px] font-bold uppercase tracking-widest">Labor · Regional</p>
                            <h5 className="text-text-primary font-bold group-hover:text-primary-container transition-colors text-sm">Gig Worker Union</h5>
                            <p className="text-text-secondary text-[15px]">8.2k active nodes</p>
                        </div>
                    </div>
                </div>
            </aside>

        </div>
    );
};
