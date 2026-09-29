// src/features/polls/PollsFeed.jsx
import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import { usePollsQuery } from './usePollsFeature';
import { PollCard } from './PollCard';
import { useAuthStore } from '../../store/auth/useAuthStore';

export function PollsFeed({
    scope = 'all',
    activeTab = 'Local',
    searchQuery = '',
    filterTab = 'All',
    categoryFilter = 'All',
    country = null,
    endedPollsCallback
}) {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    const userState = currentUser?.state || currentUser?.political_location?.state || activeAccount?.state;
    const userStreetAddress =
        currentUser?.street_address ||
        currentUser?.street ||
        currentUser?.address ||
        currentUser?.district_l1 ||
        currentUser?.district_l1_id ||
        currentUser?.city_id ||
        currentUser?.county ||
        currentUser?.political_location?.street ||
        currentUser?.political_location?.address ||
        currentUser?.location ||
        activeAccount?.street_address ||
        activeAccount?.district_l1 ||
        activeAccount?.district_l1_id;

    // Fetch live feed data matrix 
    const { polls, pollsLoading } = usePollsQuery(scope, filterTab, country);

    // 🚀 PERFORMANCE FIX: Wrap filtering logic inside useMemo to avoid re-running on scroll events
    const filteredPolls = useMemo(() => {
        if (!polls) return [];
        const queryLower = (searchQuery || '').toLowerCase().trim();

        return polls.filter((poll) => {
            const matchesSearch =
                !queryLower ||
                (poll?.question || '').toLowerCase().includes(queryLower) ||
                (poll?.category || '').toLowerCase().includes(queryLower) ||
                (poll?.author || '').toLowerCase().includes(queryLower);

            const matchesFilter =
                filterTab === 'All' ||
                (filterTab === 'Active' && poll?.active !== false) ||
                (filterTab === 'Ended' && poll?.active === false) ||
                (filterTab === 'My Votes' && (poll?.voted || poll?.user_voted || (poll?.votedIndex !== undefined && poll?.votedIndex !== null)));

            const matchesCategory =
                categoryFilter === 'All' || poll?.category === categoryFilter;

            const matchesScope =
                !scope ||
                scope === 'all' ||
                scope === 'world' ||
                !poll?.scope ||
                poll?.scope === scope;

            return matchesSearch && matchesFilter && matchesCategory && matchesScope;
        });
    }, [polls, searchQuery, filterTab, categoryFilter, scope]);

    // 🚀 PERFORMANCE FIX: Memoize ended polls to pass up to parent sidebar cleanly
    const endedPolls = useMemo(() => {
        if (!polls) return [];
        return polls.filter((p) => !p.active);
    }, [polls]);

    // 🚀 THE STABILITY FIX: Create a stable dependency primitive by serializing the IDs string list
    const endedPollsSignature = useMemo(() => {
        return endedPolls.map(p => p?.id).join(',');
    }, [endedPolls]);

    // Safe lifecycle sync to pipeline the closed list up to the sidebar
    useEffect(() => {
        if (endedPollsCallback && !pollsLoading) {
            endedPollsCallback(endedPolls, pollsLoading);
        }
        // 🎯 Binds to the string signature so reference updates on re-renders are completely ignored
    }, [endedPollsSignature, pollsLoading, endedPollsCallback]);

    // 💀 Custom Pulse Skeleton Loader Panel
    const PollSkeleton = () => (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 animate-pulse space-y-6 bg-surface-container-low bg-[#141414]">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/[0.04] rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-white/[0.04] rounded w-24"></div>
                        <div className="h-3 bg-white/[0.02] rounded w-16"></div>
                    </div>
                </div>
                <div className="h-6 bg-white/[0.04] rounded w-16"></div>
            </div>
            <div className="h-6 bg-white/[0.04] rounded w-5/6"></div>
            <div className="space-y-3 pt-4">
                <div className="h-12 bg-white/[0.02] rounded-xl w-full"></div>
                <div className="h-12 bg-white/[0.02] rounded-xl w-full"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 w-full relative">
            {pollsLoading ? (
                <div className="flex flex-col gap-6">
                    <PollSkeleton />
                    <PollSkeleton />
                </div>
            ) : activeTab === 'State' && !userState ? (
                /* 🗺️ Prompt to set state profile metrics */
                <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-4 my-2">
                    <span className="material-symbols-outlined text-5xl text-amber-500 mb-1 select-none">map</span>
                    <h3 className="font-bold text-text-primary text-xl">State Location Not Set</h3>
                    <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                        Please set your state location in settings to view state-level community polls.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/settings')}
                        className="mt-2 px-6 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md border-none"
                    >
                        Set State in Settings
                    </button>
                </div>
            ) : activeTab === 'Local' && !userStreetAddress ? (
                /* 📍 Prompt to set neighborhood street address */
                <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-4 my-2">
                    <span className="material-symbols-outlined text-5xl text-amber-500 mb-1 select-none">location_off</span>
                    <h3 className="font-bold text-text-primary text-xl">Street Address Not Set</h3>
                    <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                        Please set your street address in settings to view local neighborhood polls.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/settings')}
                        className="mt-2 px-6 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md border-none"
                    >
                        Set Street Address in Settings
                    </button>
                </div>
            ) : filteredPolls?.length === 0 ? (
                /* 🌌 Empty State Panel Container */
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-[#141414] font-mono text-xs text-text-secondary/40">
                    // NO_ACTIVE_POLLS_FOUND: Be the first to introduce a consensus poll in {activeTab}!
                </div>
            ) : (
                /* 🏆 PERFORMANCE FIX: Heavy map loop replaced with Virtuoso layout scroller */
                <div className="flex flex-col border border-[#262626] bg-transparent overflow-hidden shadow-2xl relative">
                    <Virtuoso
                        useWindowScroll
                        data={filteredPolls}
                        computeItemKey={(index, poll) => poll?.id || index}
                        initialItemCount={filteredPolls.length > 0 ? Math.min(filteredPolls.length, 4) : 0}
                        increaseViewportBy={400}
                        overscan={200}
                        itemContent={(index, poll) => (
                            <PollCard key={poll?.id || index} poll={poll} />
                        )}
                        components={{
                            Footer: () => (
                                <div className="py-6 text-center bg-[#141414] border-t border-white/5">
                                    <p className="text-[10px] text-text-secondary font-mono uppercase tracking-wider italic opacity-40">
                                        // POLL_INDEX_STREAM_COMPLETE
                                    </p>
                                </div>
                            )
                        }}
                    />
                </div>
            )}
        </div>
    );
}
