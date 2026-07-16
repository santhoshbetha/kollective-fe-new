import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggleEventInterest } from '../../features/events/useEventsFeature';

export const BusinessProposalCard = ({ prop }) => {
    const navigate = useNavigate();

    const statusColors = prop.status === 'Hot'
        ? 'bg-primary-container/20 text-primary border-primary-container/30'
        : prop.status === 'Active'
            ? 'bg-green-900/20 text-green-400 border-green-500/20'
            : 'bg-surface-container-high text-on-surface-variant border-white/5';
    return (
        <div
            key={prop.id}
            onClick={() => navigate(`/proposals/${prop.id}`)}
            className="glass-card border border-white/5 p-6 rounded-2xl group cursor-pointer transition-all hover:scale-[1.01] hover:border-primary-container/20 crimson-glow relative overflow-hidden flex flex-col justify-between min-h-[360px]"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>

            <div>
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-surface-container-highest/30 rounded-xl flex items-center justify-center text-primary border border-white/5">
                        <span className="material-symbols-outlined">
                            {prop.category === 'Infrastructure' ? 'deck' : prop.category === 'Agriculture' ? 'agriculture' : 'electric_bolt'}
                        </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[14px] font-bold border uppercase tracking-wider ${statusColors}`}>
                        {prop.status}
                    </span>
                </div>

                <h3 className="font-headline-md text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {prop.title}
                </h3>

                <p className="font-body-md text-lg text-on-surface-variant mb-6 line-clamp-3">
                    {prop.description}
                </p>
            </div>

            <div>
                {/* Progress Bar */}
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[14px] font-bold">
                        <span className="text-on-surface-variant">Funding Goal</span>
                        <span className="text-text-primary">${prop.fundingGoal.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-primary-container" style={{ width: `${prop.percent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[14px] font-bold">
                        <span className="text-primary">{prop.percent}% funded</span>
                        <span className="text-on-surface-variant">{prop.daysLeft} days left</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div>
                        <p className="text-on-surface-variant text-[14px] uppercase font-bold tracking-wider opacity-60">Investment</p>
                        <p className="text-text-primary font-bold text-sm">${prop.minInvest} - ${prop.maxInvest >= 1000 ? `${prop.maxInvest / 1000}k` : prop.maxInvest}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-on-surface-variant text-[14px] uppercase font-bold tracking-wider opacity-60">Participants</p>
                        <p className="text-text-primary font-bold text-sm">{prop.participants}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};



