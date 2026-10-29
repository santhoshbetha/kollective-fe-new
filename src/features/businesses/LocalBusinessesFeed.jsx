// src/features/businesses/LocalBusinessesFeed.jsx
import React, { useMemo } from 'react';
import { useBusinessesQuery } from './useBusinessesFeature';
import { BusinessCard } from './BusinessCard';
import { VirtuosoGrid } from 'react-virtuoso';

import { isItemInScope, calculateDistanceMiles } from '../../utils/geoUtils';

const BusinessGridFooter = () => (
    <div className="py-8 text-center border-t border-white/5 font-mono text-[10px] text-text-secondary/30 select-none uppercase tracking-wider">
        directory_index_stream_compiled_cleanly
    </div>
);
const businessGridComponents = { Footer: BusinessGridFooter };

// Custom Pulse Skeleton Loader Panel Component
const BusinessSkeleton = () => (
    <div className="glass-card rounded-[24px] overflow-hidden flex flex-col lg:flex-row border border-white/5 animate-pulse bg-[#141414]">
        <div className="lg:w-[320px] h-[200px] lg:h-auto bg-white/[0.03]"></div>
        <div className="flex-1 p-6 space-y-4 text-left">
            <div className="h-5 bg-white/[0.04] rounded w-1/3"></div>
            <div className="h-3 bg-white/[0.02] rounded w-full"></div>
            <div className="h-3 bg-white/[0.02] rounded w-5/6"></div>
        </div>
    </div>
);

export function LocalBusinessesFeed({
    searchQuery = '',
    activeCategory = 'All',
    selectedDistance = '',
    scopeMode = '100_miles',
    effectiveUserState = '',
    userCoords = null
}) {
    // Pull clean database values straight from TanStack list cache
    const { businesses = [], businessesLoading } = useBusinessesQuery();

    // PERFORMANCE FIX: Memoize filtering metrics calculation to shield against layout drop-frames
    const filteredBusinesses = useMemo(() => {
        if (!businesses) return [];
        const queryLower = searchQuery.toLowerCase().trim();
        const maxDist = selectedDistance ? parseFloat(selectedDistance) : 100;

        const normalizeCat = (cat) => (cat || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const normActive = normalizeCat(activeCategory);

        const list = businesses.filter(biz => {
            // 📍 Geographic Scope Enforcement (100 Miles vs Statewide)
            if (!isItemInScope(biz, scopeMode, effectiveUserState, maxDist, userCoords)) {
                return false;
            }

            const normBiz = normalizeCat(biz.category);
            const matchesCategory = activeCategory === 'All' ||
                normBiz === normActive ||
                normBiz.includes(normActive) ||
                normActive.includes(normBiz);

            const matchesSearch = !queryLower ||
                (biz.name || '').toLowerCase().includes(queryLower) ||
                (biz.description || '').toLowerCase().includes(queryLower) ||
                (biz.address || '').toLowerCase().includes(queryLower) ||
                (biz.city || '').toLowerCase().includes(queryLower) ||
                (biz.category || '').toLowerCase().includes(queryLower) ||
                (Array.isArray(biz.services) && biz.services.some(s => String(s).toLowerCase().includes(queryLower)));

            return matchesCategory && matchesSearch;
        });

        if (userCoords?.latitude && userCoords?.longitude) {
            return list.sort((a, b) => {
                const distA = calculateDistanceMiles(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude) ?? 999999;
                const distB = calculateDistanceMiles(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude) ?? 999999;
                return distA - distB;
            });
        }

        return list;
    }, [businesses, searchQuery, activeCategory, selectedDistance, scopeMode, effectiveUserState, userCoords]);

    if (businessesLoading) {
        return (
            <div className="space-y-6 pb-20 select-none">
                <BusinessSkeleton />
                <BusinessSkeleton />
            </div>
        );
    }

    if (filteredBusinesses.length === 0) {
        return (
            <div className="glass-card rounded-[24px] p-12 text-center border border-white/5 bg-[#141414] font-mono text-md text-text-secondary/80 select-none space-y-3">
                <span className="material-symbols-outlined text-4xl text-text-secondary/60 mb-1 mr-1 block">
                    storefront
                </span>
                <p className="font-bold text-text-primary text-base">
                    No businesses found {scopeMode === '100_miles' ? 'within 100 miles' : `in ${effectiveUserState || 'your state'}`}
                    {searchQuery ? ` matching "${searchQuery}"` : ''}
                </p>
                <p className="text-xs text-text-secondary/60 max-w-md mx-auto">
                    {scopeMode === '100_miles'
                        ? 'Try expanding your scope to "Entire State" or adjusting your search filters to discover more regional enterprises.'
                        : 'No enterprises are currently registered matching this criteria in your state.'}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full pb-20 relative">
            {/* PERFORMANCE MATRIX: Virtuoso viewport configuration tailored into standard columns */}
            <VirtuosoGrid
                useWindowScroll
                overscan={8000}
                data={filteredBusinesses}
                computeItemKey={(_index, biz) => biz?.id || biz?.name}
                listClassName="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full"
                itemClassName="h-full flex flex-col"
                components={businessGridComponents}
                itemContent={(index, biz) => (
                    <div className="h-full animate-in fade-in duration-150">
                        <BusinessCard biz={biz} />
                    </div>
                )}
            />
        </div>
    );
}
