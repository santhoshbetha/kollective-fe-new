// src/features/businesses/LocalBusinessesFeed.jsx
import React from 'react';
import { useBusinessesQuery } from './useBusinessesFeature';
import { BusinessCard } from './BusinessCard';

export function LocalBusinessesFeed({ searchQuery, activeCategory, renderPagination, itemsPerPage, currentPage, onPageChange }) {
    const { businesses = [], businessesLoading } = useBusinessesQuery();

    const filteredBusinesses = businesses.filter(biz => {
        const matchesCategory = activeCategory === 'All' || biz.category === activeCategory;
        const matchesSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            biz.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
    const paginatedBusinesses = filteredBusinesses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const BusinessSkeleton = () => (
        <div className="glass-card rounded-[24px] overflow-hidden flex flex-col lg:flex-row border border-white/5 animate-pulse">
            <div className="lg:w-[420px] h-[300px] lg:h-auto bg-surface-container-highest/20"></div>
            <div className="flex-1 p-8 space-y-4">
                <div className="h-6 bg-surface-container-highest/20 rounded w-1/3"></div>
                <div className="h-4 bg-surface-container-highest/10 rounded w-full"></div>
                <div className="h-4 bg-surface-container-highest/10 rounded w-5/6"></div>
            </div>
        </div>
    );

    if (businessesLoading) {
        return (
            <div className="space-y-8 pb-20">
                <BusinessSkeleton />
                <BusinessSkeleton />
            </div>
        );
    }

    if (filteredBusinesses.length === 0) {
        return (
            <div className="glass-card rounded-[24px] p-12 text-center border border-white/5 bg-[#141414]">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">storefront</span>
                <h3 className="font-bold text-text-primary mb-2 text-lg">No businesses found</h3>
                <p className="text-text-secondary text-base">Be the first to list a local business in this category!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {paginatedBusinesses.map((biz) => (
                <BusinessCard key={biz.id} biz={biz} />
            ))}
            {renderPagination(currentPage, totalPages, onPageChange)}
        </div>
    );
}
