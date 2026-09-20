import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggleEventInterest } from '../../features/events/useEventsFeature';

export const BusinessProposalCard = ({ prop }) => {
    const navigate = useNavigate();

    const statusColors = prop.status === 'Hot'
        ? 'bg-primary-container/20 text-primary-container border-primary-container/30'
        : prop.status === 'Active'
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-surface-container-high text-text-secondary border-white/5';

    return (
        <article
            key={prop.id}
            onClick={() => navigate(`/proposals/${prop.id}`)}
            className="glass-card border border-white/10 p-4 sm:p-5 rounded-2xl group cursor-pointer transition-all hover:border-primary-container/30 bg-surface-container-low/90 hover:bg-surface-container-low shadow-md hover:shadow-xl relative overflow-hidden flex flex-col justify-between gap-3"
        >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary-container/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary-container/10 transition-colors pointer-events-none"></div>

            <div>
                {/* Header Row */}
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-container/10 rounded-lg flex items-center justify-center text-primary-container border border-primary-container/20 shrink-0">
                            <span className="material-symbols-outlined text-[16px]">
                                {prop.category === 'Infrastructure' ? 'deck' : prop.category === 'Agriculture' ? 'agriculture' : 'electric_bolt'}
                            </span>
                        </div>
                        <span className="text-[16px] font-extrabold uppercase tracking-wider text-text-secondary/70">
                            {prop.category}
                        </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[16px] font-extrabold border uppercase tracking-wider ${statusColors}`}>
                        {prop.status}
                    </span>
                </div>

                {/* Title */}
                <h2 className="font-headline-lg text-lg font-bold text-text-primary tracking-tight group-hover:text-primary-container transition-colors line-clamp-1">
                    {prop.title}
                </h2>

                {/* Description */}
                <p className="text-[16px] text-text-secondary leading-snug line-clamp-2 mt-1">
                    {prop.description}
                </p>
            </div>

            <div className="space-y-3 pt-2">
                {/* Progress Bar */}
                <div className="space-y-1.5 bg-surface-container-lowest/40 p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-md font-bold">
                        <span className="text-text-secondary">Goal: <span className="text-text-primary">${prop.fundingGoal ? prop.fundingGoal.toLocaleString() : '0'}</span></span>
                        <span className="text-primary-container font-extrabold">{prop.percent}% funded</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-primary-container" style={{ width: `${Math.min(prop.percent || 0, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-md text-text-secondary/80 font-mono">
                        <span>{prop.daysLeft || 0} days left</span>
                        <span>{prop.participants || 0} backers</span>
                    </div>
                </div>

                {/* Investment Info */}
                <div className="flex items-center justify-between text-lg pt-1 border-t border-white/5">
                    <span className="text-text-secondary/90">Min Investment:</span>
                    <span className="text-text-primary font-bold">${prop.minInvest} - ${prop.maxInvest >= 1000 ? `${prop.maxInvest / 1000}k` : prop.maxInvest}</span>
                </div>
            </div>
        </article>
    );
};



