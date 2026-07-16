// src/features/proposals/ProposalsFeed.jsx
import React from 'react';
import { useProposalsQuery } from './useProposalsFeature';
import { BusinessProposalCard } from './BusinessProposalCard';

export function ProposalsFeed({ searchQuery, activeCategory, renderPagination, itemsPerPage, currentPage, onPageChange }) {
    const { proposals = [], proposalsLoading } = useProposalsQuery();

    const filteredProposals = proposals.filter(prop => {
        const matchesCategory = activeCategory === 'All' ||
            prop.category.toLowerCase().includes(activeCategory.split(' ')[0].toLowerCase());
        const matchesSearch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prop.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
    const paginatedProposals = filteredProposals.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const ProposalSkeleton = () => (
        <div className="glass-card p-6 rounded-2xl border border-white/5 animate-pulse space-y-6">
            <div className="flex justify-between items-center">
                <div className="w-12 h-12 bg-surface-container-highest/20 rounded-xl"></div>
                <div className="h-6 bg-surface-container-highest/20 rounded w-16"></div>
            </div>
            <div className="h-6 bg-surface-container-highest/20 rounded w-2/3"></div>
            <div className="h-4 bg-surface-container-highest/10 rounded w-full"></div>
        </div>
    );

    if (proposalsLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <ProposalSkeleton />
                <ProposalSkeleton />
            </div>
        );
    }

    if (filteredProposals.length === 0) {
        return (
            <div className="glass-card rounded-[24px] p-12 text-center border border-white/5 bg-[#141414]">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">deck</span>
                <h3 className="font-bold text-text-primary mb-2 text-lg">No proposals found</h3>
                <p className="text-text-secondary text-base">Be the first to draft a collective proposal in this category!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedProposals.map((prop) => (
                    <BusinessProposalCard key={prop.id} prop={prop} />
                ))}
            </div>
            {renderPagination(currentPage, totalPages, onPageChange)}
        </div>
    );
}
