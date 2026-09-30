// src/features/proposals/ProposalsFeed.jsx
import React from 'react';
import { useProposalsQuery, useVoteOnProposal } from './useProposalsFeature';

export function ProposalsFeedX() {
    const { proposals, proposalsLoading, proposalsError } = useProposalsQuery();
    const voteMutation = useVoteOnProposal();

    if (proposalsLoading) {
        return <div className="text-center py-12 text-text-secondary font-medium">Loading community ballots...</div>;
    }

    if (proposalsError) {
        return <div className="text-center py-12 text-rose-500 font-medium">Failed to retrieve active proposals.</div>;
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {proposals.length === 0 ? (
                <div className="py-16 text-center text-text-secondary/60 bg-surface-container-low border border-white/5 rounded-2xl p-8">
                    <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">gavel</span>
                    <p className="font-medium">No community proposals currently open for review.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {proposals.map((prop) => (
                        <article
                            key={prop.id}
                            className="bg-surface-container-low border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h3 className="text-xl font-extrabold text-text-primary tracking-tight">{prop.title}</h3>
                                    <span className="inline-block bg-white/5 border border-white/5 text-text-secondary text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
                                        Status: {prop.status || 'Active Ballot'}
                                    </span>
                                </div>
                                {prop.budget && (
                                    <div className="text-right shrink-0">
                                        <span className="text-sm text-text-secondary font-medium block">Requested Funding</span>
                                        <span className="text-md font-mono font-black text-primary-container">{prop.budget}</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-text-secondary text-body-md leading-relaxed">{prop.description}</p>

                            {/* Voting Control Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-1">
                                <button
                                    onClick={() => voteMutation.mutate({ proposalId: prop.id, voteType: 'sponsor' })}
                                    disabled={voteMutation.isPending || prop.voted}
                                    className={`px-5 py-2.5 rounded-xl text-label-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${prop.userVote === 'sponsor'
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                                    Sponsor
                                </button>

                                <button
                                    onClick={() => voteMutation.mutate({ proposalId: prop.id, voteType: 'veto' })}
                                    disabled={voteMutation.isPending || prop.voted}
                                    className={`px-5 py-2.5 rounded-xl text-label-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${prop.userVote === 'veto'
                                        ? 'bg-rose-600 text-white shadow-md'
                                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                                    Veto Proposal
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
