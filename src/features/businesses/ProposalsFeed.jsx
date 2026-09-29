// src/features/proposals/ProposalsFeed.jsx
import React, { useMemo } from 'react';
import { useProposalsQuery } from './useProposalsFeature';
import { BusinessProposalCard } from './BusinessProposalCard';
import { Virtuoso } from 'react-virtuoso';
import { cn } from '../../lib/utils';

export function ProposalsFeed({
    searchQuery = '',
    activeCategory = 'All'
}) {
    // Pull real-time proposal stream list direct from TanStack cache bounds
    const { proposals = [], proposalsLoading } = useProposalsQuery();

    // 🚀 PERFORMANCE FIX: Memoize filtration process to dodge redundant render loops on layout scrolling
    const filteredProposals = useMemo(() => {
        if (!proposals) return [];
        const queryLower = searchQuery.toLowerCase().trim();
        const categoryTarget = activeCategory.split(' ')[0].toLowerCase();

        return proposals.filter(prop => {
            const matchesCategory = activeCategory === 'All' ||
                (prop.category || '').toLowerCase().includes(categoryTarget);

            const matchesSearch = !queryLower ||
                (prop.title || '').toLowerCase().includes(queryLower) ||
                (prop.description || '').toLowerCase().includes(queryLower);

            return matchesCategory && matchesSearch;
        });
    }, [proposals, searchQuery, activeCategory]);

    // 💀 Custom Pulse Skeleton Loader Panel Component
    const ProposalSkeleton = () => (
        <div className="glass-card p-6 rounded-2xl border border-white/5 animate-pulse space-y-6 bg-[#141414]">
            <div className="flex justify-between items-center">
                <div className="w-12 h-12 bg-white/[0.04] rounded-xl"></div>
                <div className="h-6 bg-white/[0.04] rounded w-16"></div>
            </div>
            <div className="h-6 bg-white/[0.04] rounded w-2/3"></div>
            <div className="h-4 bg-white/[0.02] rounded w-full"></div>
        </div>
    );

    if (proposalsLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 select-none">
                <ProposalSkeleton />
                <ProposalSkeleton />
            </div>
        );
    }

    if (filteredProposals.length === 0) {
        return (
            <div className="glass-card rounded-[24px] p-12 text-center border border-white/5 bg-[#141414] font-mono text-xs text-text-secondary/40 select-none">
                <span className="material-symbols-outlined text-4xl text-text-secondary/30 mb-4 block">deck</span>
                // NO_COMMUNITY_PROPOSALS_LOGGED_IN_THIS_SCOPE
            </div>
        );
    }
    return (
        <div className="space-y-8 pb-20 relative w-full">
            {/* Suggested Focus Areas & Anti-Monopoly Guidance Alert Module Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#141414] to-primary-container/10 border border-amber-500/20 shadow-lg space-y-4 text-left select-none animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                    <span className="material-symbols-outlined text-base">lightbulb</span>
                    <span>High-Priority Community Ideas & Anti-Monopoly Focus</span>
                </div>

                <h3 className="text-xl font-black text-white tracking-tight font-headline-md">
                    Build Local Alternatives to Corporate Monopolies
                </h3>

                <p className="text-text-secondary text-sm leading-relaxed max-w-3xl">
                    We urge community organizers and neighbors to draft proposals for essential, high-impact everyday services that challenge greedy corporate monopolies:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-primary-container font-bold text-base">
                            <span className="material-symbols-outlined text-[18px]">local_cafe</span>
                            <h4>Local Coffee & Eateries</h4>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Propose worker-owned cafes, local diners, and cooperative food halls to outshine and displace
                            existing corporate monopolies with fresh, ethical food networks.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                            <span className="material-symbols-outlined text-[18px]">medical_services</span>
                            <h4>Low-Cost Medical & Clinics</h4>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Launch people-pro, low-cost and low-margin neighborhood medical stores, pharmacies, and urgent clinics
                            to beat greedy corporate monopolies.
                        </p>
                    </div>
                </div>
            </div>

            {/* 🏆 THE VIRTUOSO GRID CORE ENGINE CHANNEL */}
            <div className="w-full relative">
                <Virtuoso
                    useWindowScroll
                    data={filteredProposals}
                    computeItemKey={(index, prop) => prop?.id || index}
                    initialItemCount={Math.min(filteredProposals.length, 4)}
                    increaseViewportBy={300}
                    overscan={150}

                    // 🚀 MULTI-COLUMN CONVERSION GRID: Overrides internal list node tags safely into Tailwind rows
                    components={{
                        List: React.forwardRef(({ children, style, ...props }, ref) => (
                            <div
                                {...props}
                                ref={ref}
                                style={{ ...style }}
                                // 🎯 Spans 1 full column on mobile layouts and 2 identical grid-cols on desktops/MDs
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full"
                            >
                                {children}
                            </div>
                        )),
                        Item: React.forwardRef(({ children, ...props }, ref) => (
                            <div {...props} ref={ref} className="h-full flex flex-col">
                                {children}
                            </div>
                        )),
                        Footer: () => (
                            <div className="py-8 text-center border-t border-white/5 font-mono text-[10px] text-text-secondary/30 select-none uppercase tracking-wider">
                                // proposal_stream_index_calculation_complete
                            </div>
                        )
                    }}

                    itemContent={(index, prop) => (
                        <div className="h-full animate-in fade-in duration-150">
                            <BusinessProposalCard prop={prop} />
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
