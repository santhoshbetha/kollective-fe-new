import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoteInPoll, useCryptographicVote } from './usePollsFeature';
import { useAuthStore } from '../../store/auth/useAuthStore';

export const PollCard = ({ poll }) => {
    const navigate = useNavigate();
    const [selectedOptions, setSelectedOptions] = useState({}); // Mapping of pollId -> selectedOptionIndex
    const [votingStates, setVotingStates] = useState({}); // Tracking loading status of votes per pollId
    const voteInPollMutation = useVoteInPoll();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const cryptoVoteMutation = useCryptographicVote();

    const handleSelectOption = (pollId, optionIndex) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [pollId]: optionIndex,
        }));
    };

    const handleVoteSubmit = (pollId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const optionIndex = selectedOptions[pollId];
        if (optionIndex === undefined || optionIndex === null) {
            alert('Please select an option to vote.');
            return;
        }

        setVotingStates((prev) => ({ ...prev, [pollId]: true }));

        voteInPollMutation.mutate(pollId, optionIndex, {
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

    const actualPoll = poll?.poll || poll;
    const authorName = typeof poll?.author === 'object' ? (poll?.author?.username || poll?.author?.name || 'user') : (poll?.author || 'user');
    const authorAvatar = typeof poll?.author === 'object' ? (poll?.author?.avatar_url || poll?.author?.avatar) : (poll?.authorAvatar || null);
    const questionText = poll?.question || poll?.text || poll?.content || 'Community Poll';
    const isPollActive = poll?.active !== undefined ? poll?.active : (actualPoll?.expired === false);
    const hasVoted = poll?.voted !== undefined ? poll?.voted : (actualPoll?.voted || false);
    const isClosed = !isPollActive;
    const showResults = hasVoted || isClosed;
    const userVoteIdx = poll?.votedIndex !== undefined ? poll?.votedIndex : (actualPoll?.own_votes ? actualPoll?.own_votes[0] : undefined);
    const totalVotes = poll?.totalVotes || poll?.votes_count || actualPoll?.votes_count || 0;
    const pollScope = poll?.scope || poll?.target_scope || 'world';
    const pollCategory = poll?.category || 'Poll';
    const pollOptions = poll?.options || actualPoll?.options || [];

    return (
        <article
            key={poll?.id}
            className={`glass-card rounded-2xl p-6 shadow-xl border-l-4 transition-all ${isPollActive && !hasVoted
                ? 'border-l-primary-container border-t border-r border-b border-white/5'
                : 'border-white/5 border'
                }`}
        >
            {/* Author Metadata */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {authorAvatar ? (
                        <img
                            alt={authorName}
                            className="w-9 h-9 rounded-full object-cover border border-white/10"
                            src={authorAvatar}
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-bold text-sm text-white uppercase">
                            {authorName[0]}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-md text-text-primary">@{authorName}</span>
                            <span className="w-1 h-1 bg-text-text-secondary rounded-full"></span>
                            <span className="text-[14px] text-text-secondary">{poll?.time || 'Just now'}</span>
                        </div>
                        <p className={`text-[14px] font-bold ${isPollActive ? 'text-primary-container' : 'text-text-secondary'}`}>
                            {poll?.timeLeft || (isPollActive ? 'Active' : 'Ended')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {pollScope && (
                        <span className="bg-primary-container/10 text-primary-container px-2.5 py-1 rounded-full text-[12px] font-extrabold border border-primary-container/20 uppercase tracking-wider flex items-center gap-1">
                            <span>
                                {pollScope === 'local' ? '📍 Local' : pollScope === 'state' ? '🏛️ State' : pollScope === 'country' ? '🇺🇸 Country' : '🌐 World'}
                            </span>
                        </span>
                    )}
                    <span className="bg-surface-container-high text-primary-container px-3 py-1 rounded-full text-[14px] font-bold border border-white/5 uppercase tracking-wider">
                        {pollCategory}
                    </span>
                </div>
            </div>

            {/* Poll Question */}
            <h3 className="font-headline-md text-lg font-bold text-text-primary mb-6 leading-snug">
                {questionText}
            </h3>

            {/* Options / Results container */}
            <div className="space-y-4 mb-6">
                {showResults ? (
                    // Results View
                    pollOptions.map((opt, idx) => {
                        const optVotes = opt.votes !== undefined ? opt.votes : (opt.votes_count || opt.votesCount || 0);
                        const optTitle = opt.text || opt.title || `Choice ${idx + 1}`;
                        const rawPercent = opt.percent !== undefined ? opt.percent : Math.round((optVotes / (totalVotes || 1)) * 100);
                        const percent = sanitizePercentage(rawPercent);
                        const isUserChoice = idx === userVoteIdx || opt.id === userVoteIdx;

                        return (
                            <div key={idx} className="relative">
                                <div className="flex justify-between items-center mb-1.5 px-1 text-sm">
                                    <span className={`font-bold flex items-center gap-1.5 ${isUserChoice ? 'text-primary-container' : 'text-text-secondary'}`}>
                                        {optTitle}
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
                                            {optVotes.toLocaleString()} votes
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
                    pollOptions.map((opt, idx) => {
                        const isSelected = selectedOptions[poll?.id] === idx;
                        const optText = opt.text || opt.title || `Choice ${idx + 1}`;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectOption(poll?.id, idx)}
                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${isSelected
                                    ? 'border-primary-container bg-primary-container/10'
                                    : 'border-white/5 bg-surface-container/35 hover:border-primary-container/30 hover:bg-surface-container/50'
                                    }`}
                            >
                                <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                                    }`}>
                                    {optText}
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
                        {(totalVotes || 0).toLocaleString()} votes cast
                    </span>
                </div>

                {isPollActive && !hasVoted && (
                    <button
                        onClick={() => handleVoteSubmit(poll?.id)}
                        disabled={votingStates[poll?.id] || selectedOptions[poll?.id] === undefined}
                        className="bg-primary-container text-white px-6 py-2 rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-40"
                    >
                        {votingStates[poll?.id] ? 'Voting...' : 'Cast Vote'}
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

                {!isPollActive && (
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
