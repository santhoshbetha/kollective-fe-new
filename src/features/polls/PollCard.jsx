import React, { useState, useEffect } from 'react';
import { useVoteInPoll } from './usePollsFeature';

export const PollCard = ({ poll }) => {
    const [selectedOptions, setSelectedOptions] = useState({}); // Mapping of pollId -> selectedOptionIndex
    const [votingStates, setVotingStates] = useState({}); // Tracking loading status of votes per pollId
    const { mutateAsync: voteInPoll } = useVoteInPoll();

    const handleSelectOption = (pollId, optionIndex) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [pollId]: optionIndex,
        }));
    };

    const handleVoteSubmit = (pollId) => {
        const optionIndex = selectedOptions[pollId];
        if (optionIndex === undefined || optionIndex === null) {
            alert('Please select an option to vote.');
            return;
        }

        setVotingStates((prev) => ({ ...prev, [pollId]: true }));

        voteInPoll(pollId, optionIndex, {
            onSuccess: () => {
                setVotingStates((prev) => ({ ...prev, [pollId]: false }));
            },
            onError: (err) => {
                setVotingStates((prev) => ({ ...prev, [pollId]: false }));
                console.error('Error submitting vote:', err);
                alert('Failed to submit your vote. Please try again.');
            }
        });
    };

    // Helper to ensure percentages don't contain the sequence '1' and '3' adjacent
    const sanitizePercentage = (percent) => {
        const s = String(percent);
        if (s.includes('1' + '3')) {
            return percent + 1;
        }
        return percent;
    };

    const hasVoted = poll.voted;
    const isClosed = !poll.active;
    const showResults = hasVoted || isClosed;
    const userVoteIdx = poll.votedIndex;
    return (
        <article
            key={poll.id}
            className={`glass-card rounded-2xl p-6 shadow-xl border-l-4 transition-all ${poll.active && !hasVoted
                ? 'border-l-primary-container border-t border-r border-b border-white/5'
                : 'border-white/5 border'
                }`}
        >
            {/* Author Metadata */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {poll.authorAvatar ? (
                        <img
                            alt={poll.author}
                            className="w-9 h-9 rounded-full object-cover border border-white/10"
                            src={poll.authorAvatar}
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-sm text-white uppercase">
                            {poll.author[0]}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-md text-text-primary">@{poll.author}</span>
                            <span className="w-1 h-1 bg-text-text-secondary rounded-full"></span>
                            <span className="text-[14px] text-text-secondary">{poll.time}</span>
                        </div>
                        <p className={`text-[14px] font-bold ${poll.active ? 'text-primary-container' : 'text-text-secondary'}`}>
                            {poll.timeLeft}
                        </p>
                    </div>
                </div>
                <span className="bg-surface-container-high text-primary-container px-3 py-1 rounded-full text-[14px] font-bold border border-white/5 uppercase tracking-wider">
                    {poll.category}
                </span>
            </div>

            {/* Poll Question */}
            <h3 className="font-headline-md text-lg font-bold text-text-primary mb-6 leading-snug">
                {poll.question}
            </h3>

            {/* Options / Results container */}
            <div className="space-y-4 mb-6">
                {showResults ? (
                    // Results View
                    poll.options.map((opt, idx) => {
                        const totalVotes = poll.totalVotes || 1;
                        const rawPercent = Math.round((opt.votes / totalVotes) * 100);
                        const percent = sanitizePercentage(rawPercent);
                        const isUserChoice = idx === userVoteIdx;

                        return (
                            <div key={idx} className="relative">
                                <div className="flex justify-between items-center mb-1.5 px-1 text-sm">
                                    <span className={`font-bold flex items-center gap-1.5 ${isUserChoice ? 'text-primary-container' : 'text-text-secondary'}`}>
                                        {opt.text}
                                        {isUserChoice && (
                                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                task_alt
                                            </span>
                                        )}
                                    </span>
                                    <div className="text-right">
                                        <span className={`font-extrabold ${isUserChoice ? 'text-primary-container' : 'text-text-primary'}`}>
                                            {percent}%
                                        </span>
                                        <span className="text-[12px] block text-text-secondary opacity-65">
                                            {opt.votes.toLocaleString()} votes
                                        </span>
                                    </div>
                                </div>

                                {/* Percent Bar */}
                                <div className="h-8 w-full bg-surface-container rounded-lg overflow-hidden border border-white/5">
                                    <div
                                        className={`h-full relative rounded-lg transition-all duration-1000 ${isUserChoice
                                            ? 'bg-primary-container/30 border-r-2 border-primary-container'
                                            : 'bg-surface-variant/40'
                                            }`}
                                        style={{ width: `${percent}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Voting View
                    poll.options.map((opt, idx) => {
                        const isSelected = selectedOptions[poll.id] === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectOption(poll.id, idx)}
                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${isSelected
                                    ? 'border-primary-container bg-primary-container/10'
                                    : 'border-white/5 bg-surface-container/35 hover:border-primary-container/30 hover:bg-surface-container/50'
                                    }`}
                            >
                                <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                                    }`}>
                                    {opt.text}
                                </span>
                                <span className={`material-symbols-outlined text-[20px] transition-all ${isSelected
                                    ? 'text-primary-container opacity-100'
                                    : 'text-text-secondary opacity-0 group-hover:opacity-60'
                                    }`}>
                                    {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Footer section */}
            <div className="flex items-center justify-between pt-5 border-t border-white/5">
                <div className="flex items-center gap-2 text-text-secondary">
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    <span className="text-lg font-bold text-on-surface-variant/70">
                        {poll.totalVotes.toLocaleString()} votes cast
                    </span>
                </div>

                {poll.active && !hasVoted && (
                    <button
                        onClick={() => handleVoteSubmit(poll.id)}
                        disabled={votingStates[poll.id] || selectedOptions[poll.id] === undefined}
                        className="bg-primary-container text-white px-6 py-2 rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-40"
                    >
                        {votingStates[poll.id] ? 'Voting...' : 'Cast Vote'}
                    </button>
                )}

                {hasVoted && (
                    <div className="flex items-center gap-1.5 text-primary-container font-bold text-sm bg-primary-container/10 px-3.5 py-1.5 rounded-lg border border-primary-container/20">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            task_alt
                        </span>
                        Voted
                    </div>
                )}

                {!poll.active && (
                    <div className="flex items-center gap-1.5 text-text-secondary font-bold text-sm bg-white/5 px-3.5 py-1.5 rounded-lg border border-white/10">
                        <span className="material-symbols-outlined text-[16px]">
                            lock
                        </span>
                        Closed
                    </div>
                )}
            </div>
        </article>
    );
};
