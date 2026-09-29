// src/features/organize/OrganizeFeed.jsx
import React, { useMemo } from 'react';
import { useOrganizeActionsQuery, useRsvpToAction } from './useOrganizeFeature';
import { Virtuoso } from 'react-virtuoso';
import { cn } from '../../utils/cn'; // Adjust utility path to match your project layout

export function OrganizeFeed() {
    // Pull active values directly from our optimized TanStack caching layer
    const { organizeActions = [], organizeActionsLoading, organizeActionsError } = useOrganizeActionsQuery();
    const rsvpMutation = useRsvpToAction();

    // 💀 Custom Composed Pulse Skeleton Action Loader Layout Component
    const ActionSkeleton = () => (
        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse select-none">
            <div className="space-y-3 flex-1 text-left">
                <div className="h-5 bg-white/[0.04] rounded w-1/4"></div>
                <div className="h-3.5 bg-white/[0.02] rounded w-3/4"></div>
            </div>
            <div className="w-28 h-10 bg-white/[0.03] rounded-xl shrink-0"></div>
        </div>
    );

    if (organizeActionsLoading) {
        return (
            <div className="w-full flex flex-col gap-4 pb-20 select-none">
                <ActionSkeleton />
                <ActionSkeleton />
                <ActionSkeleton />
            </div>
        );
    }

    if (organizeActionsError) {
        return (
            <div className="py-12 text-center text-rose-400 font-mono text-xs select-none uppercase tracking-wider">
                // ERROR_CRITICAL_FAILED_TO_SYNC_MOBILIZATION_DIRECTORIES
            </div>
        );
    }

    if (organizeActions.length === 0) {
        return (
            <div className="py-16 text-center text-text-secondary/40 bg-[#141414] border border-white/5 rounded-2xl p-8 font-mono text-xs select-none">
                <span className="material-symbols-outlined text-4xl opacity-30 mb-3 block text-primary-container">campaign</span>
                // NO_MOBILIZATION_ACTIONS_SCHEDULED_IN_YOUR_GRID_COORDINATE
            </div>
        );
    }
    return (
        <div className="w-full relative pb-20">
            {/* 🏆 PERFORMANCE MATRIX: Virtuoso viewport configuration for heavy timeline lists */}
            <Virtuoso
                useWindowScroll
                data={organizeActions}
                computeItemKey={(index, action) => action?.id || index}
                initialItemCount={Math.min(organizeActions.length, 6)}
                increaseViewportBy={300}
                overscan={150}

                components={{
                    List: React.forwardRef(({ children, style, ...props }, ref) => (
                        <div
                            {...props}
                            ref={ref}
                            style={{ ...style }}
                            className="flex flex-col gap-4 w-full"
                        >
                            {children}
                        </div>
                    )),
                    Item: React.forwardRef(({ children, ...props }, ref) => (
                        <div {...props} ref={ref} className="w-full">
                            {children}
                        </div>
                    )),
                    Footer: () => (
                        <div className="py-8 text-center border-t border-white/5 font-mono text-[10px] text-text-secondary/30 select-none uppercase tracking-wider">
                            // mobilization_action_index_sync_compiled_cleanly
                        </div>
                    )
                }}

                itemContent={(index, action) => {
                    const status = action?.user_rsvp_status || action?.userStatus || '';
                    const isAttending = status === 'attending' || status === 'going';

                    return (
                        <article
                            className={cn(
                                "bg-[#141414] border p-6 rounded-2xl shadow-xl flex flex-col justify-between md:flex-row md:items-center gap-4 transition-all duration-200 text-left animate-in fade-in",
                                isAttending ? "border-emerald-500/20 bg-emerald-500/[0.01]" : "border-white/5 hover:bg-white/[0.01]"
                            )}
                        >
                            <div className="flex flex-col gap-1.5 flex-1">
                                <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                                    {action?.title}
                                </h3>
                                <p className="text-text-secondary text-xs font-normal leading-relaxed max-w-2xl font-sans">
                                    {action?.description}
                                </p>
                            </div>

                            {/* RSVP Interactive Action Button Trigger */}
                            <div className="shrink-0 flex items-center gap-3 font-mono text-xs select-none">
                                <button
                                    type="button"
                                    onClick={() => rsvpMutation.mutate({
                                        actionId: action?.id,
                                        status: isAttending ? 'declined' : 'attending'
                                    })}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 border cursor-pointer outline-none",
                                        isAttending
                                            ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400 font-extrabold shadow-sm"
                                            : "bg-[#0d1117] border-white/10 text-text-secondary hover:text-white hover:border-white/20"
                                    )}
                                >
                                    <span className="material-symbols-outlined text-base">
                                        {isAttending ? 'task_alt' : 'hail'}
                                    </span>
                                    <span>{isAttending ? 'Joined' : 'Join Action'}</span>
                                </button>
                            </div>
                        </article>
                    );
                }}
            />
        </div>
    );
}
