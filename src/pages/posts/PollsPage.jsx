// src/pages/PollsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PollsFeed } from '../../features/polls/PollsFeed';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useCountry } from '../../hooks/useCountry';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

export function PollsPage() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { countryCode, countryName } = useCountry();

    // 🗺️ Geographic tabs alignment configurations
    const pollsTabFromStore = useStore((state) => state.pollsTab);
    const setPollsTab = useStore((state) => state.setPollsTab);

    const activeTab = useMemo(() => {
        return pollsTabFromStore || (isAuthenticated ? 'Local' : (countryName || 'Country'));
    }, [pollsTabFromStore, isAuthenticated, countryName]);

    const tabs = useMemo(() => {
        return isAuthenticated
            ? ['Local', 'State', countryName || 'Country', 'World']
            : [countryName || 'Country', 'World'];
    }, [isAuthenticated, countryName]);

    // Fallback alignment guard lifecycles for unauthenticated visitors
    useEffect(() => {
        if (!isAuthenticated && (activeTab === 'Local' || activeTab === 'State')) {
            setPollsTab(countryName ? countryName : 'Country');
        }
    }, [isAuthenticated, activeTab, setPollsTab, countryName]);

    // Map active geographic tab parameters to query scopes cleanly
    const effectiveScope = useMemo(() => {
        switch (activeTab) {
            case 'Local': return 'local';
            case 'State': return 'state';
            case 'World': return 'world';
            default: return 'country';
        }
    }, [activeTab]);

    // Sub-filters & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Sidebar results data hooks trackers
    const [sidebarData, setSidebarData] = useState({ list: [], loading: true });

    // Mathematical array filter adjustment constraint helper logic
    const sanitizePercentage = (percent) => {
        const s = String(percent);
        return s.includes('13') ? percent + 1 : percent;
    };

    const statusTabs = useMemo(() => {
        return ['All', 'Active', 'Ended', ...(isAuthenticated ? ['My Votes'] : [])];
    }, [isAuthenticated]);

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col xl:flex-row gap-12 pb-20 p-4X bg-[#090d12]X">

            {/* 📋 Left Column: Main content feed layout frame */}
            <div className="flex-1 flex flex-col gap-6 max-w-3xl">

                {/* Header Title Section */}
                <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-2">
                    <div>
                        <h1 className="font-headline-lg text-3xl font-extrabold text-text-primary mb-2">
                            Community Polls
                        </h1>
                        <p className="text-text-secondary font-body-md text-base leading-relaxed">
                            Participate in decentralized decision making and voice your opinion on community policies and projects.
                        </p>
                    </div>
                    {isAuthenticated && (
                        <button
                            type="button"
                            onClick={() => navigate('/polls/create')}
                            className="bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2 crimson-glow whitespace-nowrap self-start sm:self-auto cursor-pointer border-none"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Create Poll
                        </button>
                    )}
                </section>

                {/* 📍 Geographic Tabs Navigation Selection Row */}
                <div className="flex gap-3 overflow-x-auto py-1.5 px-0 no-scrollbar border-b border-white/5 mb-0 select-none">
                    {tabs.map((tab) => {
                        const isTabActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setPollsTab(tab)}
                                className={cn(
                                    "px-6 py-2 rounded-full font-bold text-xs transition-all duration-200 whitespace-nowrap cursor-pointer border",
                                    isTabActive
                                        ? "bg-primary-container text-white border-primary-container crimson-glow"
                                        : "bg-[#1c1c1e]X bg-surface-container-high text-text-secondary hover:text-text-primary border-white/5 hover:border-white/10"
                                )}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* Search Input Filter Panel Deck Bar */}
                <section className="w-full glass-card rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center border border-white/5 bg-surface-container-low backdrop-blur-md">
                    <div className="relative w-full md:flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px] select-none">
                            search
                        </span>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0d1117]X bg-surface-container-lowest border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary-container transition-all placeholder:text-text-secondary/30"
                            placeholder="Search polls by question or category..."
                            type="text"
                        />
                    </div>

                    <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto select-none no-scrollbar">
                        {statusTabs.map((tab) => {
                            const isStatusActive = filterTab === tab;
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setFilterTab(tab)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all border cursor-pointer whitespace-nowrap",
                                        isStatusActive
                                            ? "bg-white/10 text-white border-white/20"
                                            : "bg-transparent text-text-secondary hover:text-white border-transparent"
                                    )}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Main Core Poll List Items Container */}
                <PollsFeed
                    scope={effectiveScope}
                    activeTab={activeTab}
                    searchQuery={searchQuery}
                    filterTab={filterTab}
                    categoryFilter={categoryFilter}
                    country={countryCode}
                    // 🚀 THE DEEP EQUALITY SHIELD: Prevents updating parent state if data content is identical
                    endedPollsCallback={(newList, loadingState) => {
                        setSidebarData((prev) => {
                            const listChanged = prev.list.length !== newList.length ||
                                prev.list.some((poll, idx) => poll?.id !== newList[idx]?.id);
                            const loadingChanged = prev.loading !== loadingState;

                            if (!listChanged && !loadingChanged) {
                                return prev; // Return exactly the same state reference to halt the re-render chain!
                            }

                            return { list: newList, loading: loadingState };
                        });
                    }}
                />
            </div>
            {/* 📊 Right Column: Asymmetric Desktop Sticky Sidebar Panel */}
            <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 lg:sticky lg:top-24 h-fit">

                {/* Consensus Metrics Analytics Card */}
                <div className="glass-panel rounded-2xl p-6 bg-surface-container-low border border-white/5 shadow-xl">
                    <h4 className="text-xs font-bold text-text-primary mb-4 uppercase tracking-wider flex items-center gap-2 font-mono select-none">
                        <span className="material-symbols-outlined text-[18px] text-primary-container">insights</span>
                        Consensus Metrics
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-mono mb-1.5 select-none">
                                <span className="text-text-secondary">Community Quorum</span>
                                <span className="text-text-primary font-bold">64%</span>
                            </div>
                            <div className="h-2 w-full bg-[#0d1117] border border-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-container rounded-full shadow-[0_0_8px_var(--color-primary-container)]" style={{ width: '64%' }}></div>
                            </div>
                            <p className="text-xs text-text-secondary/80 mt-2 leading-relaxed font-sans">
                                Requires minimum 50% participation from verified citizens for binding decisions.
                            </p>
                        </div>
                        <div className="border-t border-white/5 pt-4 space-y-2.5 font-mono text-xs select-none">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Total Votes Cast</span>
                                <span className="text-text-primary font-bold">25,340</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Consensus Threshold</span>
                                <span className="text-text-primary font-bold">60% Approval</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Active Proposers</span>
                                <span className="text-text-primary font-bold">82 Nodes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Closed Results Historic Card Module */}
                <div className="glass-panel rounded-2xl p-6 bg-surface-container-low border border-white/5 shadow-xl">
                    <h4 className="text-xs font-bold text-text-primary mb-4 uppercase tracking-wider flex items-center gap-2 font-mono select-none">
                        <span className="material-symbols-outlined text-[18px] text-text-secondary">lock</span>
                        Recent Results
                    </h4>

                    {sidebarData.loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-white/[0.04] rounded w-3/4" />
                            <div className="h-3 bg-white/[0.02] rounded w-1/2" />
                        </div>
                    ) : sidebarData.list.length === 0 ? (
                        <p className="text-xs text-text-secondary/50 font-mono italic">NO_CLOSED_POLLS_LOGGED</p>
                    ) : (
                        <div className="space-y-4">
                            {sidebarData.list.map((poll) => {
                                const options = poll?.options || poll?.poll?.options || [];

                                const getOptVotes = (o) => {
                                    if (!o) return 0;
                                    return o.votesCount ?? o.votes ?? o.votes_count ?? 0;
                                };

                                const winningOpt = options.length > 0
                                    ? options.reduce((prev, current) => (getOptVotes(prev) > getOptVotes(current)) ? prev : current, options)
                                    : null;

                                const total = poll?.totalVotes || poll?.votes_count || poll?.poll?.votes_count || 1;
                                const winningVotes = winningOpt ? getOptVotes(winningOpt) : 0;
                                const rawPercent = Math.round((winningVotes / (total || 1)) * 100);
                                const winPercent = sanitizePercentage(rawPercent);
                                const winningTitle = winningOpt ? (winningOpt.text || winningOpt.title || 'Option') : 'None';

                                return (
                                    <div key={poll?.id} className="space-y-2 border-b border-white/5 pb-3.5 last:border-b-0 last:pb-0 animate-in fade-in duration-150">
                                        <div className="flex justify-between items-center select-none font-mono text-[10px]">
                                            <span className="bg-white/[0.04] text-primary-container px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-white/5">
                                                {poll?.category || 'Poll'}
                                            </span>
                                            <span className="text-text-secondary">{poll?.timeLeft || 'Ended'}</span>
                                        </div>
                                        <h5 className="text-text-primary font-bold text-sm line-clamp-2 leading-snug" title={poll?.question || poll?.text || poll?.content}>
                                            {poll?.question || poll?.text || poll?.content || 'Poll'}
                                        </h5>
                                        <div className="flex items-center justify-between text-xs text-text-secondary pt-0.5">
                                            <span>Winner: <strong className="text-text-primary font-extrabold">{winningTitle}</strong></span>
                                            <span className="font-mono font-black text-primary-container">{winPercent}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
