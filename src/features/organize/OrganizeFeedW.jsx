// src/features/organize/OrganizeFeed.jsx
import React from 'react';
import { useOrganizeActionsQuery, useRsvpToAction } from './useOrganizeFeature'; // 🚀 Import local hooks

export function OrganizeFeed() {
    const { organizeActions, organizeActionsLoading, organizeActionsError } = useOrganizeActionsQuery();
    const rsvpMutation = useRsvpToAction();

    if (organizeActionsLoading) {
        return <div className="text-center py-12 text-text-secondary font-medium">Syncing organizing directories...</div>;
    }

    if (organizeActionsError) {
        return <div className="text-center py-12 text-rose-500 font-medium">Failed to retrieve mobilization actions.</div>;
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {organizeActions.length === 0 ? (
                <div className="py-16 text-center text-text-secondary/60 bg-surface-container-low border border-white/5 rounded-2xl p-8">
                    <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">campaign</span>
                    <p className="font-medium">No actions currently scheduled in your grid coordinate.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {organizeActions.map((action) => {
                        const isAttending = action?.userStatus === 'attending';

                        return (
                            <article
                                key={action?.id}
                                className="bg-surface-container-low border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between md:flex-row md:items-center gap-4 transition-all hover:bg-surface-container-high/40"
                            >
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-extrabold text-text-primary tracking-tight">{action?.title}</h3>
                                    <p className="text-text-secondary text-body-md max-w-xl leading-relaxed">{action?.description}</p>
                                </div>

                                {/* RSVP Interactive Action Button Trigger */}
                                <div className="shrink-0 flex items-center gap-2">
                                    <button
                                        onClick={() => rsvpMutation.mutate({
                                            actionId: action?.id,
                                            status: isAttending ? 'declined' : 'attending'
                                        })}
                                        disabled={rsvpMutation.isPending}
                                        className={`px-5 py-2.5 rounded-xl text-label-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:pointer-events-none ${isAttending
                                            ? 'bg-emerald-600 text-white font-black shadow-md'
                                            : 'bg-surface-container-highest border border-white/10 text-text-secondary hover:text-text-primary'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {isAttending ? 'task_alt' : 'hail'}
                                        </span>
                                        {isAttending ? 'Joined' : 'Join Action'}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
