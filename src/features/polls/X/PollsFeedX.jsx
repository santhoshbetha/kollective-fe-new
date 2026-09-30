// src/features/polls/PollsFeed.jsx
import React from 'react';
import { usePollsQuery } from './usePollsQuery';
import { useVoteInPoll } from './useVoteInPoll';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

export function PollsFeed() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = usePollsQuery();
    const voteMutation = useVoteInPoll();

    const sentinelRef = useIntersectionObserver({
        onIntersect: fetchNextPage,
        enabled: hasNextPage && !isFetchingNextPage,
    });

    if (status === 'pending') return <div className="py-12 text-center text-text-secondary font-medium">Synchronizing consensus polls...</div>;
    if (status === 'error') return <div className="py-12 text-center text-rose-500 font-medium">Failed to retrieve polls stream.</div>;

    const polls = data?.pages.flatMap((page) => page.polls || []) || [];

    return (
        <div className="polls-feed w-full flex flex-col gap-6">
            {polls?.length === 0 ? (
                <div className="py-16 text-center text-text-secondary/60 bg-surface-container-low border border-white/5 rounded-2xl p-8">
                    <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">poll</span>
                    <p className="font-medium">No active polls inside your collective.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {polls?.map((poll) => (
                        <article key={poll?.id} className="bg-surface-container-low border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                            <div>
                                <h3 className="text-xl font-extrabold text-text-primary tracking-tight">{poll?.question}</h3>
                                <p className="text-xs text-text-secondary mt-1">{poll?.totalVotes} collective votes cast</p>
                            </div>

                            {/* Poll Options Interactive List */}
                            <div className="flex flex-col gap-2">
                                {poll?.options.map((option) => {
                                    // Calculate dynamic mathematical percentages safely
                                    const pct = poll?.totalVotes > 0 ? Math.round((option.votesCount / poll?.totalVotes) * 100) : 0;
                                    const isSelected = poll?.userSelectedOptionId === option.id;

                                    return (
                                        <div key={option.id} className="relative w-full">
                                            {poll?.voted ? (
                                                /* 📊 Display Results Mode */
                                                <div className="relative overflow-hidden w-full bg-surface-container-lowest border border-white/5 p-4 rounded-xl flex justify-between items-center z-10">
                                                    {/* Progress Bar Background fill overlay */}
                                                    <div
                                                        className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out z-0 ${isSelected ? 'bg-primary-container/20 border-r-2 border-primary-container' : 'bg-white/5'
                                                            }`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                    <span className={`text-body-md relative z-10 font-medium ${isSelected ? 'text-primary-container font-bold' : 'text-text-primary'}`}>
                                                        {option.text} {isSelected && '✓'}
                                                    </span>
                                                    <span className="text-label-md font-bold text-text-secondary relative z-10">{pct}%</span>
                                                </div>
                                            ) : (
                                                /* 🗳️ Display Active Voting Interactive Mode */
                                                <button
                                                    onClick={() => voteMutation.mutate({ pollId: poll?.id, optionId: option.id })}
                                                    disabled={voteMutation.isPending}
                                                    className="w-full text-left bg-surface-container-lowest hover:bg-surface-container-high/60 border border-white/10 hover:border-primary-container/40 p-4 rounded-xl text-body-md text-text-primary transition-all font-semibold active:scale-[0.99] cursor-pointer disabled:pointer-events-none"
                                                >
                                                    {option.text}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* 🛑 INFINITE SCROLL TARGET SENTINEL ELEMENT */}
            <div ref={sentinelRef} className="infinite-scroll-sentinel py-8 flex items-center justify-center w-full">
                {isFetchingNextPage && (
                    <p className="loading-more-text text-text-secondary text-sm font-medium flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full"></span>
                        Syncing additional voting archives...
                    </p>
                )}
                {!hasNextPage && polls?.length > 0 && (
                    <p className="end-of-feed-text text-text-secondary/50 text-sm font-medium">
                        You have reviewed all collective polls.
                    </p>
                )}
            </div>
        </div>
    );
}
