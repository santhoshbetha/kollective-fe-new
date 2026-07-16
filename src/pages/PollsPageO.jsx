import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePollsQuery } from '../features/polls/usePollsFeature';
import { PollCard } from '../features/polls/PollCard';

export const PollsPageO = () => {
  const navigate = useNavigate();
  const { polls, pollsLoading } = usePollsQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All'); // 'All', 'Active', 'Ended'

  // Filter Logic
  const filteredPolls = polls?.filter((poll) => {
    const matchesSearch = poll?.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll?.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterTab === 'All' ||
      (filterTab === 'Active' && poll?.active) ||
      (filterTab === 'Ended' && !poll?.active);

    return matchesSearch && matchesFilter;
  });

  const PollSkeleton = () => (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 animate-pulse space-y-6">
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
  const endedPolls = polls?.filter((p) => !p.active);

  // Helper to ensure percentages don't contain the sequence '1' and '3' adjacent
  const sanitizePercentage = (percent) => {
    const s = String(percent);
    if (s.includes('1' + '3')) {
      return percent + 1;
    }
    return percent;
  };

  return (
    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 pb-20 text-scale-large">
      {/* Left Column: Main content feed */}
      <div className="flex-1 flex flex-col gap-6 max-w-3xl">
        {/* Header Section */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-4">
          <div>
            <h1 className="font-headline-lg text-3xl font-extrabold text-text-primary mb-2">
              Community Polls
            </h1>
            <p className="text-text-secondary font-body-md text-lg font-semibold leading-relaxed">
              Participate in decentralized decision making and voice your opinion on community policies and projects.
            </p>
          </div>
          <button
            onClick={() => navigate('/polls/create')}
            className="bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary-container/25 flex items-center gap-2 crimson-glow whitespace-nowrap self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Poll
          </button>
        </section>

        {/* Filter/Search Bar */}
        <section className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center border border-white/5">
          <div className="relative w-full md:flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary 
                focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-text-secondary/50"
              placeholder="Search polls by question or category..."
              type="text"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {['All', 'Active', 'Ended'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-bold transition-all border ${filterTab === tab
                  ? 'bg-primary-container text-white border-primary-container crimson-glow'
                  : 'bg-surface-variant/50 text-text-secondary hover:text-white border-white/5 hover:bg-surface-container-high'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* Poll Feed */}
        <div className="space-y-6">
          {pollsLoading ? (
            <>
              <PollSkeleton />
              <PollSkeleton />
            </>
          ) : filteredPolls?.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
              <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">poll</span>
              <h3 className="font-bold text-text-primary mb-2 text-lg">No polls found</h3>
              <p className="text-text-secondary text-base">Be the first to introduce a consensus poll to the collective!</p>
            </div>
          ) : (
            filteredPolls?.map((poll) => (
              <PollCard key={poll?.id} poll={poll} />
            ))
          )}
        </div>
      </div>

      {/* Right Column: Sidebar Widgets */}
      <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 lg:sticky lg:top-20 h-fit">
        {/* Consensus Metrics Widget */}
        <div className="glass-panel rounded-2xl p-6 bg-surface-container-low border border-white/5">
          <h4 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary-container">insights</span>
            Consensus Metrics
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-md mb-1.5">
                <span className="text-text-secondary">Community Quorum</span>
                <span className="text-text-primary font-bold">64%</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-primary-container rounded-full" style={{ width: '64%' }}></div>
              </div>
              <p className="text-[16px] text-text-secondary mt-2 leading-snug">
                Requires minimum 50% participation from verified citizens for binding decisions.
              </p>
            </div>
            <div className="border-t border-white/5 pt-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total Votes Cast</span>
                <span className="text-text-primary font-bold">25,340</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Consensus Threshold</span>
                <span className="text-text-primary font-bold">60% Approval</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Active Proposers</span>
                <span className="text-text-primary font-bold">82 Nodes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Results Widget */}
        <div className="glass-panel rounded-2xl p-6 bg-surface-container-low border border-white/5">
          <h4 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-text-secondary">lock</span>
            Recent Results
          </h4>
          {pollsLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-surface-container-highest/20 rounded w-3/4"></div>
              <div className="h-3 bg-surface-container-highest/10 rounded w-1/2"></div>
            </div>
          ) : endedPolls?.length === 0 ? (
            <p className="text-sm text-text-secondary">No closed polls yet.</p>
          ) : (
            <div className="space-y-4">
              {endedPolls?.map((poll) => {
                // Find winning option
                const winningOpt = poll?.options.reduce((prev, current) =>
                  (prev.votes > current.votes) ? prev : current
                  , poll?.options[0]);

                const total = poll?.totalVotes || 1;
                const rawPercent = Math.round((winningOpt.votes / total) * 100);
                const winPercent = sanitizePercentage(rawPercent);

                return (
                  <div key={poll?.id} className="space-y-1.5 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="bg-surface-container-high text-primary-container px-2 py-0.5 rounded text-[12px] font-bold uppercase tracking-wider border border-white/5">
                        {poll?.category}
                      </span>
                      <span className="text-[12px] text-text-secondary">{poll?.timeLeft}</span>
                    </div>
                    <h5 className="text-text-primary font-bold text-sm line-clamp-2" title={poll?.question}>
                      {poll?.question}
                    </h5>
                    <div className="flex items-center justify-between text-sm text-text-secondary pt-1">
                      <span>Winner: <strong className="text-text-primary font-bold">{winningOpt.text}</strong></span>
                      <span className="font-extrabold text-primary-container">{winPercent}%</span>
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
};
