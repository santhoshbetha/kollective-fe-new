// src/features/businesses/LocalBusinessesFeed.jsx
import React from 'react';
import { useBusinessesQuery } from './useBusinessesFeature';

export function LocalBusinessesFeedX() {
    const { businesses, businessesLoading, businessesError } = useBusinessesQuery();

    if (businessesLoading) {
        return <div className="text-center py-12 text-text-secondary font-medium">Syncing directory registries...</div>;
    }

    if (businessesError) {
        return <div className="text-center py-12 text-rose-500 font-medium">Failed to retrieve business registry.</div>;
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {businesses.length === 0 ? (
                <div className="py-16 text-center text-text-secondary/60 bg-surface-container-low border border-white/5 rounded-2xl p-8">
                    <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">storefront</span>
                    <p className="font-medium">No businesses registered in this area yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businesses.map((biz) => (
                        <article
                            key={biz.id}
                            className="group bg-surface-container-low border border-white/5 p-6 rounded-2xl shadow-sm transition-all duration-200 hover:bg-surface-container-high/40 hover:border-white/10 flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 text-primary-container flex items-center justify-center font-bold">
                                    <span className="material-symbols-outlined text-[20px]">storefront</span>
                                </div>
                                <div>
                                    <h3 className="font-title-md text-text-primary group-hover:text-primary-container transition-colors font-extrabold">
                                        {biz.name}
                                    </h3>
                                    <span className="inline-block bg-white/5 border border-white/5 text-text-secondary text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-0.5 uppercase tracking-wider">
                                        {biz.category || 'Local Partner'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-text-secondary text-body-md leading-relaxed line-clamp-2 mt-1">
                                {biz.description}
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
