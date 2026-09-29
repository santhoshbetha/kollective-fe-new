// src/pages/OrganizePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScheduleWidget } from '../components/ScheduleWidget';
import { useOrganizeActionsQuery } from '../features/organize/useOrganizeFeature';
import { ActionCard } from '../features/organize/ActionCard';
import { useAuthStore } from '../store/auth/useAuthStore';
import { Virtuoso } from 'react-virtuoso';
import { cn } from "@/lib/utils"; // Adjust to match your project layout utilities

export const OrganizePage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Pull database data array from our TanStack caching hooks lane
    const { organizeActions = [], organizeActionsLoading } = useOrganizeActionsQuery();

    const [activeGeo, setActiveGeo] = useState(isAuthenticated ? 'Local' : 'Country');
    const [toastMessage, setToastMessage] = useState('');

    const geoFilters = isAuthenticated ? ['Local', 'State', 'Country'] : ['Country'];

    // Session guard-clause layer boundary checks
    useEffect(() => {
        if (!isAuthenticated && (activeGeo === 'Local' || activeGeo === 'State')) {
            setActiveGeo('Country');
        }
    }, [isAuthenticated, activeGeo]);

    // 🚀 PERFORMANCE FIX: Filter activities based on the active tab state
    const filteredActions = useMemo(() => {
        if (!organizeActions) return [];

        // If your backend doesn't filter by scope yet, this filters them on the client side safely
        return organizeActions.filter(action => {
            if (!action) return false;
            if (activeGeo === 'Country') return true;

            const scope = String(action.scope || action.geography || '').toLowerCase();
            return scope === activeGeo.toLowerCase();
        });
    }, [organizeActions, activeGeo]);
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 text-scale-large text-left">
            {/* Center Content: Action Feed Canvas */}
            <div className="flex-1">
                {/* Header & Tabs Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6 border-b border-white/5 pb-8 select-none">
                    <div className='flex flex-col'>
                        <div className='flex items-center gap-0'>
                            <img src="../KFISTS.png" alt="Organize Logo" className="w-16 h-16 object-contain pointer-events-none" />
                            <h1 className="font-headline-lg text-3xl font-extrabold text-text-primary mb-2 tracking-tight">
                                Organize Action
                            </h1>
                        </div>
                        <p className="text-text-secondary font-body-md text-base font-semibold leading-relaxed max-w-xl">
                            Join grassroots movements making a difference. From local protests to national coalitions, find your frontline.
                        </p>
                    </div>

                    {/* Geographic Navigation Tabs */}
                    <div className="flex bg-[#141414] rounded-full p-1 border border-white/10 w-fit font-mono text-xs">
                        {geoFilters.map((filter) => (
                            <button
                                type="button"
                                key={filter}
                                onClick={() => setActiveGeo(filter)}
                                className={cn(
                                    "px-6 py-2 rounded-full font-bold transition-all border-none cursor-pointer outline-none",
                                    activeGeo === filter
                                        ? "bg-primary-container text-white shadow-lg crimson-glow"
                                        : "text-text-secondary hover:text-white"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Feed Grid Wrapper */}
                <div className="w-full pb-20 relative">
                    {organizeActionsLoading ? (
                        /* ⏰ Sync Status Spinner Loader */
                        <div className="py-12 flex flex-col items-center gap-4 font-mono text-xs text-text-secondary/40 select-none">
                            <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                            <p className="uppercase tracking-widest animate-pulse">// SYNCING_FRONT_LINES...</p>
                        </div>
                    ) : filteredActions.length === 0 ? (
                        /* 🌌 Empty State Feed Result Panel */
                        <div className="py-16 text-center text-text-secondary/40 bg-[#141414] border border-white/5 rounded-2xl p-8 font-mono text-xs select-none">
                            <span className="material-symbols-outlined text-4xl opacity-30 mb-3 block text-primary-container">campaign</span>
              // NO_ACTIVE_MOBILIZATIONS_FOUND_IN_THIS_GEO_SCOPE
                        </div>
                    ) : (
                        /* 🎨 PERFORMANCE GRID LAYER: Virtuoso virtualization engine running responsive columns */
                        <Virtuoso
                            useWindowScroll
                            data={filteredActions}
                            computeItemKey={(index, action) => action?.id || index}
                            initialItemCount={Math.min(filteredActions.length, 4)}
                            increaseViewportBy={300}
                            overscan={150}

                            components={{
                                List: React.forwardRef(({ children, style, ...props }, ref) => (
                                    <div
                                        {...props}
                                        ref={ref}
                                        style={{ ...style }}
                                        // 🎯 Locks in 1 row on mobile, and spans into 2 columns on wide xl viewports
                                        className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full"
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
                                    <div className="py-8 text-center border-t border-white/5 font-mono text-[10px] text-text-secondary/20 select-none uppercase tracking-wider mt-6">
                    // action_directory_matrix_rendered_cleanly
                                    </div>
                                )
                            }}

                            itemContent={(index, action) => (
                                <div className="h-full animate-in fade-in duration-150">
                                    <ActionCard action={action} setToastMessage={setToastMessage} />
                                </div>
                            )}
                        />
                    )}
                </div>
            </div>

            {/* Right Sidebar sticky panel grid widget */}
            <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 lg:sticky lg:top-20 h-fit">
                <ScheduleWidget />

                {/* Mobilize Call To Action Widget Panel Container */}
                <section className="p-6 rounded-2xl border border-primary/20 bg-[#141414] relative overflow-hidden flex flex-col gap-3">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/[0.02] blur-xl rounded-full pointer-events-none"></div>
                    <h3 className="font-headline-md text-xl font-black text-white tracking-tight leading-tight select-none">
                        Mobilize Your Unit
                    </h3>
                    <p className="text-text-secondary text-xs leading-relaxed font-sans">
                        Start your own grassroots action and invite your community to join the frontline.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/organize/create')}
                        className="w-full py-3 bg-white text-black font-mono font-bold rounded-xl hover:bg-primary-container hover:text-white transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer border-none shadow-sm outline-none font-bold mt-2"
                    >
                        Create New Action
                    </button>
                </section>
            </aside>

            {/* Floating Notice Alert Overlay Toggles */}
            {toastMessage && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#141414] dark:text-[#F4F4F4] 
          border border-primary-container/30 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 
          animate-in fade-in slide-in-from-bottom-4 duration-200 font-mono text-xs select-none">
                    <span className="material-symbols-outlined text-primary-container text-sm">info</span>
                    <span className="font-bold uppercase tracking-wider">{toastMessage}</span>
                </div>
            )}
        </div>
    );
};
