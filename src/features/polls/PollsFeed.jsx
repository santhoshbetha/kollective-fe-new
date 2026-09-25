// src/features/polls/PollsFeed.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePollsQuery } from './usePollsFeature'; // Hook A pulling data
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

    const { polls, pollsLoading } = usePollsQuery(scope, filterTab, country);

    // Filter Logic Matrix
    const filteredPolls = polls?.filter((poll) => {
        const queryLower = (searchQuery || '').toLowerCase();
        const matchesSearch =
            !searchQuery ||
            (poll?.question || '').toLowerCase().includes(queryLower) ||
            (poll?.category || '').toLowerCase().includes(queryLower) ||
            (poll?.author || '').toLowerCase().includes(queryLower);

        const matchesFilter =
            filterTab === 'All' ||
            (filterTab === 'Active' && poll?.active !== false) ||
            (filterTab === 'Ended' && poll?.active === false) ||
            (filterTab === 'My Votes' && (poll?.voted || poll?.user_voted || poll?.votedIndex !== undefined && poll?.votedIndex !== null));

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

    // Pull out closed entries cleanly to share up with the sidebar widgets layout
    const endedPolls = polls?.filter((p) => !p.active) || [];

    // Safe lifecycle sync callback to pipeline variables out without causing loop re-renders
    React.useEffect(() => {
        if (endedPollsCallback && !pollsLoading) {
            endedPollsCallback(endedPolls, pollsLoading);
        }
    }, [polls, pollsLoading]);

    // 💀 Your Custom Pulse Skeleton Loader
    const PollSkeleton = () => (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 animate-pulse space-y-6 bg-surface-container-low">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-container-highest/20 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-surface-container-highest/20 rounded w-24"></div>
                        <div className="h-3 bg-surface-container-highest/10 rounded w-16"></div>
                    </div>
                </div>
                <div className="h-6 bg-surface-container-highest/20 rounded w-16"></div>
            </div>
            <div className="h-6 bg-surface-container-highest/20 rounded w-5/6"></div>
            <div className="space-y-3 pt-4">
                <div className="h-12 bg-surface-container-highest/10 rounded-xl w-full"></div>
                <div className="h-12 bg-surface-container-highest/10 rounded-xl w-full"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 w-full">
            {pollsLoading ? (
                <>
                    <PollSkeleton />
                    <PollSkeleton />
                </>
            ) : activeTab === 'State' && !userState ? (
                /* 🗺️ Prompt to set state */
                <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-4 my-2">
                    <span className="material-symbols-outlined text-5xl text-amber-500 mb-1">map</span>
                    <h3 className="font-bold text-text-primary text-xl">State Location Not Set</h3>
                    <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                        Please set your state location in settings to view state-level community polls.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/settings')}
                        className="mt-2 px-6 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md"
                    >
                        Set State in Settings
                    </button>
                </div>
            ) : activeTab === 'Local' && !userStreetAddress ? (
                /* 📍 Prompt to set street address */
                <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414] flex flex-col items-center gap-4 my-2">
                    <span className="material-symbols-outlined text-5xl text-amber-500 mb-1">location_off</span>
                    <h3 className="font-bold text-text-primary text-xl">Street Address Not Set</h3>
                    <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                        Please set your street address in settings to view local neighborhood polls.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/settings')}
                        className="mt-2 px-6 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md"
                    >
                        Set Street Address in Settings
                    </button>
                </div>
            ) : filteredPolls?.length === 0 ? (
                /* 🌌 Empty State Panel Container */
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-[#141414]">
                    <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">poll</span>
                    <h3 className="font-bold text-text-primary mb-2 text-lg">No polls found in {activeTab}</h3>
                    <p className="text-text-secondary text-base">
                        Be the first to introduce a consensus poll in this community!
                    </p>
                </div>
            ) : (
                /* 🗳️ Poll Loop Mapping Block */
                filteredPolls?.map((poll) => (
                    <PollCard key={poll?.id} poll={poll} />
                ))
            )}
        </div>
    );
}
