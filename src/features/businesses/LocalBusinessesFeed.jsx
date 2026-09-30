// src/features/businesses/LocalBusinessesFeed.jsx
import React, { useMemo } from 'react';
import { useBusinessesQuery } from './useBusinessesFeature';
import { BusinessCard } from './BusinessCard';
import { Virtuoso } from 'react-virtuoso';

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
    selectedDistance = ''
}) {
    // Pull clean database values straight from TanStack list cache
    const { businesses = [], businessesLoading } = useBusinessesQuery();

    // PERFORMANCE FIX: Memoize filtering metrics calculation to shield against layout drop-frames
    const filteredBusinesses = useMemo(() => {
        if (!businesses) return [];
        const queryLower = searchQuery.toLowerCase().trim();

        return businesses.filter(biz => {
            const matchesCategory = activeCategory === 'All' || biz.category === activeCategory;

            const matchesSearch = !queryLower ||
                (biz.name || '').toLowerCase().includes(queryLower) ||
                (biz.description || '').toLowerCase().includes(queryLower);

            let matchesDistance = true;
            if (selectedDistance) {
                const maxMiles = parseFloat(selectedDistance);
                if (!isNaN(maxMiles) && typeof biz.distanceMiles === 'number') {
                    matchesDistance = biz.distanceMiles <= maxMiles;
                }
            }

            return matchesCategory && matchesSearch && matchesDistance;
        });
    }, [businesses, searchQuery, activeCategory, selectedDistance]);

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
            <div className="glass-card rounded-[24px] p-12 text-center border border-white/5 bg-[#141414] font-mono text-md text-text-secondary/80 select-none">
                <span className="material-symbols-outlined text-4xl text-text-secondary/80 mb-1 mr-1 block">
                    storefront
                </span>
                NO_LOCAL_BUSINESSES_REGISTERED_ON_THIS_NODE
            </div>
        );
    }

    return (
        <div className="w-full pb-20 relative">
            {/* PERFORMANCE MATRIX: Virtuoso viewport configuration tailored into standard columns */}
            <Virtuoso
                useWindowScroll
                data={filteredBusinesses}
                computeItemKey={(index, biz) => biz?.id || index}
                initialItemCount={Math.min(filteredBusinesses.length, 6)}
                increaseViewportBy={400}
                overscan={200}
                components={{
                    List: React.forwardRef(({ children, style, ...props }, ref) => (
                        <div
                            {...props}
                            ref={ref}
                            style={{ ...style }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full"
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
                            directory_index_stream_compiled_cleanly
                        </div>
                    )
                }}
                itemContent={(index, biz) => (
                    <div className="h-full animate-in fade-in duration-150">
                        <BusinessCard biz={biz} />
                    </div>
                )}
            />
        </div>
    );
}
