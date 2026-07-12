// src/features/explore/ExploreFeed.jsx
import React, { useState, useEffect } from 'react';
import { useExploreQuery } from './useExploreQuery';
import { useTrendingQuery } from '../trending/useTrendingQuery'; // Reuses your trending utility hook
import { PostCard } from '../timeline/PostCard';

export function ExploreFeed() {
    const [inputValue, setInputValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'communities'

    // ⏱️ Performance optimization: Debounce search input strings by 300ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(inputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue]);

    // 🔍 Primary Dynamic Lookup Query
    const { data: results = [], isPending: searchLoading } = useExploreQuery(debouncedSearch, activeTab);

    // 📈 Secondary Fallback Query: Fetch default trending topics if search input is empty
    const { trendingTopics, trendingLoading } = useTrendingQuery();

    const isSearching = debouncedSearch.trim().length > 0;

    return (
        <div className="explore-feed-wrapper w-full flex flex-col gap-6">

            {/* 🔍 Persistent Input Bar */}
            <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[22px]">
                    search
                </span>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search items, circles, hash logs..."
                    className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-4 pl-12 pr-5 text-body-md font-medium focus:outline-none focus:border-primary-container transition-colors placeholder-text-text-secondary/40 text-text-primary shadow-sm"
                />
            </div>

            {isSearching ? (
                /* 🎯 INTERACTIVE SEARCH VIEW RESULTS OVERVIEW MODE */
                <div className="flex flex-col gap-4">
                    {/* Sub-Filters Tabs Selection Row */}
                    <div className="flex gap-2 border-b border-white/5 pb-2">
                        {['posts', 'communities'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`px-4 py-2 rounded-xl text-label-sm font-bold capitalize transition-all cursor-pointer ${activeTab === type
                                    ? 'bg-primary-container text-white shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {searchLoading ? (
                        <div className="py-12 text-center text-text-secondary">Filtering directory registries...</div>
                    ) : results.length === 0 ? (
                        <div className="py-12 text-center text-text-secondary/60 italic text-sm bg-surface-container-low/40 rounded-2xl p-6 border border-white/5">
                            No results discovered matching "{debouncedSearch}" inside {activeTab}.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {activeTab === 'posts' ? (
                                results.map((post) => <PostCard key={post.id} post={post} />)
                            ) : (
                                results.map((item) => (
                                    <div key={item.id} className="p-5 bg-surface-container-low border border-white/5 rounded-2xl">
                                        <h4 className="font-extrabold text-text-primary text-md">{item.name}</h4>
                                        <p className="text-text-secondary text-sm mt-1">{item.description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* 📈 DEFAULT LANDING PANEL: Render Trending Topics grid if input box sits empty */
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                    <h3 className="text-xl font-extrabold text-text-primary tracking-tight">Trending inside the Collective</h3>

                    {trendingLoading ? (
                        <div className="py-8 text-center text-text-secondary">Syncing buzzing analytics...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trendingTopics.map((topic, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setInputValue(topic.hashtag || topic)}
                                    className="bg-surface-container-low border border-white/5 p-5 rounded-2xl shadow-sm hover:bg-surface-container-high/40 hover:border-white/10 transition-all cursor-pointer flex flex-col gap-1 group"
                                >
                                    <span className="font-black text-primary-container text-md group-hover:underline">
                                        #{topic.hashtag || topic}
                                    </span>
                                    <span className="text-text-secondary text-xs font-medium">
                                        {topic.postsCount || '2.4k'} active public broadcasts
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
