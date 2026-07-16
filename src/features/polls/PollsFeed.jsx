// src/features/polls/PollsFeed.jsx
import React from 'react';
import { usePollsQuery } from './usePollsFeature'; // Hook A pulling data
import { PollCard } from './PollCard';

export function PollsFeed({ searchQuery, filterTab, endedPollsCallback }) {
    const { polls, pollsLoading } = usePollsQuery();

    // Filter Logic Matrix
    const filteredPolls = polls?.filter((poll) => {
        const matchesSearch =
            poll?.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            poll?.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            filterTab === 'All' ||
            (filterTab === 'Active' && poll?.active) ||
            (filterTab === 'Ended' && !poll?.active);

        return matchesSearch && matchesFilter;
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
            ) : filteredPolls?.length === 0 ? (
                /* 🌌 Empty State Panel Container */
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-[#141414]">
                    <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">poll</span>
                    <h3 className="font-bold text-text-primary mb-2 text-lg">No polls found</h3>
                    <p className="text-text-secondary text-base">Be the first to introduce a consensus poll to the collective!</p>
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
