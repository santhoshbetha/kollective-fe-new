import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const BusinessProposalCard = ({ prop }) => {
    const navigate = useNavigate();
    const [imgFailed, setImgFailed] = useState(false);

    const statusColors = prop.status === 'Hot'
        ? 'bg-primary-container/20 text-primary-container border-primary-container/30'
        : prop.status === 'Active'
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-surface-container-high text-text-secondary border-white/5';

    const ownerHandle = typeof prop.owner === 'string'
        ? prop.owner
        : (prop.owner_name || prop.owner?.username || "creator");

    const ownerAvatarUrl = prop.ownerAvatar || prop.owner_avatar ||
        (typeof prop.owner === 'object' ? prop.owner?.avatar_url : null) ||
        prop.author?.avatar_url || prop.user?.avatar || prop.user?.avatar_url;

    const proposalImage = prop.image || prop.profile_image_url;

    return (
        <article
            key={prop.id}
            data-testid="proposal-card"
            onClick={() => navigate(`/proposals/${prop.id}`)}
            className="glass-card border border-white/10 p-4 sm:p-5 rounded-2xl group cursor-pointer transition-all hover:border-primary-container/30 bg-surface-container-low/90 hover:bg-surface-container-low shadow-md hover:shadow-xl relative overflow-hidden flex flex-col justify-between gap-3"
        >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary-container/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary-container/10 transition-colors pointer-events-none"></div>

            <div>
                {/* Header Row */}
                <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-container/10 rounded-lg flex items-center justify-center text-primary-container border border-primary-container/20 shrink-0">
                            <span className="material-symbols-outlined text-[16px]">
                                {prop.category === 'Infrastructure' ? 'deck' : prop.category === 'Agriculture' ? 'agriculture' : 'electric_bolt'}
                            </span>
                        </div>
                        <span className="text-[14px] font-extrabold uppercase tracking-wider text-text-secondary/70">
                            {prop.category}
                        </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[13px] font-extrabold border uppercase tracking-wider ${statusColors}`}>
                        {prop.status || 'Active'}
                    </span>
                </div>

                {/* Optional Proposal Image Banner */}
                {proposalImage && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-black/40 border border-white/5 relative">
                        <img
                            src={proposalImage}
                            alt={prop.title || prop.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Title */}
                <h2 className="font-headline-lg text-lg font-bold text-text-primary tracking-tight group-hover:text-primary-container transition-colors line-clamp-1">
                    {prop.title || prop.name}
                </h2>

                {/* Description */}
                <p className="text-[14px] text-text-secondary leading-snug line-clamp-2 mt-1">
                    {prop.description}
                </p>

                {/* Creator Avatar & Handle Node */}
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 select-none min-w-0">
                    {ownerAvatarUrl && !imgFailed ? (
                        <img
                            alt={ownerHandle}
                            src={ownerAvatarUrl}
                            data-testid="proposal-creator-avatar"
                            className="w-6 h-6 rounded-full object-cover border border-primary/20 shrink-0"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <div
                            data-testid="proposal-creator-avatar"
                            className="w-6 h-6 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-[10px] font-bold text-primary-container shrink-0 font-mono"
                        >
                            {ownerHandle ? ownerHandle[0].toUpperCase() : 'P'}
                        </div>
                    )}
                    <span className="text-xs font-bold text-text-secondary truncate font-mono">@{ownerHandle}</span>
                </div>
            </div>

            <div className="space-y-3 pt-2">
                {/* Progress Bar */}
                <div className="space-y-1.5 bg-surface-container-lowest/40 p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-text-secondary">Goal: <span className="text-text-primary">${prop.fundingGoal ? prop.fundingGoal.toLocaleString() : '0'}</span></span>
                        <span className="text-primary-container font-extrabold">{prop.percent || 0}% funded</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-primary-container" style={{ width: `${Math.min(prop.percent || 0, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-text-secondary/80 font-mono">
                        <span>{prop.daysLeft || 0} days left</span>
                        <span>{prop.participants || '0 Members'}</span>
                    </div>
                </div>

                {/* Investment Info */}
                <div className="flex items-center justify-between text-sm pt-1 border-t border-white/5">
                    <span className="text-text-secondary/90 text-xs">Min Investment:</span>
                    <span className="text-text-primary font-bold text-xs">${prop.minInvest || 0} - ${prop.maxInvest >= 1000 ? `${prop.maxInvest / 1000}k` : (prop.maxInvest || 0)}</span>
                </div>
            </div>
        </article>
    );
};




