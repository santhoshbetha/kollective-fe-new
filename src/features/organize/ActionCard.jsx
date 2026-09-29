// src/features/organize/ActionCard.jsx
import React from "react";
import { useRsvpToAction } from "./useOrganizeFeature";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils"; // Adjust to your local helper path

export const ActionCard = ({ action, setToastMessage }) => {
    const rsvpMutation = useRsvpToAction();
    const navigate = useNavigate();

    // 🚀 REFACTOR LOCK: Read fields directly from source data instead of stale local state overrides
    const currentRsvp = String(action?.user_rsvp_status || action?.userStatus || action?.rsvp || '').toLowerCase();
    const isAttending = currentRsvp === 'attending' || currentRsvp === 'going';
    const isInterested = currentRsvp === 'interested';

    const triggerToast = (msg) => {
        if (setToastMessage) {
            setToastMessage(msg);
            setTimeout(() => {
                setToastMessage('');
            }, 2000);
        }
    };

    // Color Badges Taxonomy Maps
    const typeBadgeStyles = action?.type === 'Protest'
        ? 'bg-red-500/10 text-red-400 border-red-500/20'
        : action?.type === 'Town Hall'
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            : 'bg-primary-container/10 text-primary-container border-primary-container/20';

    return (
        <article
            className="rounded-xl p-4 sm:p-5 relative overflow-hidden group border border-white/5 transition-all duration-300 bg-[#141414] hover:bg-[#1c1b1b] shadow-md flex flex-col justify-between gap-3 text-left min-h-[220px]"
        >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary-container/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-container/10 transition-colors pointer-events-none"></div>

            <div>
                {/* Header Badge Row */}
                <div className="flex justify-between items-center mb-3 select-none font-mono">
                    <span className={cn("px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded", typeBadgeStyles)}>
                        {action?.type || 'Action'}
                    </span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/organize/${action?.id}`);
                            triggerToast('Link copied to clipboard!');
                        }}
                        className="text-text-secondary/60 hover:text-white cursor-pointer transition-colors p-1 bg-transparent border-none outline-none flex items-center"
                        title="Share Action Node"
                    >
                        <span className="material-symbols-outlined text-base">share</span>
                    </button>
                </div>

                {/* Proposal Title Endpoint Link */}
                <h3
                    onClick={() => navigate(`/organize/${action?.id}`)}
                    className="text-lg font-black text-white hover:text-primary-container transition-colors line-clamp-1 cursor-pointer tracking-tight mb-2 outline-none"
                >
                    {action?.title}
                </h3>

                {/* Metadata List Block */}
                <div className="space-y-1.5 text-xs text-text-secondary font-medium">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-base shrink-0 select-none">calendar_today</span>
                        <span className="truncate">{action?.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-base shrink-0 select-none">location_on</span>
                        <span className="truncate">{action?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-base shrink-0 select-none">person</span>
                        <span className="truncate">
                            Organized by <span className="text-primary-container hover:underline cursor-pointer font-bold font-mono">{action?.organizer}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* RSVP Interacting Selection Buttons Row */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-white/5 mt-1 font-mono text-[10px] select-none">
                <button
                    type="button"
                    onClick={() => {
                        const targetStatus = isAttending ? 'None' : 'Attending';
                        rsvpMutation.mutate({ actionId: action?.id, status: targetStatus });
                        triggerToast(targetStatus === 'Attending' ? 'Marked as Attending!' : 'RSVP Cancelled');
                    }}
                    className={cn(
                        "flex-1 py-2 rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer border-none flex items-center justify-center gap-1.5 active:scale-95 outline-none",
                        isAttending
                            ? "bg-primary-container text-white shadow-sm font-extrabold crimson-glow"
                            : "bg-[#0d1117] border border-white/5 text-text-secondary hover:text-white hover:border-white/10"
                    )}
                >
                    <span className="material-symbols-outlined text-sm">
                        {isAttending ? 'check_circle' : 'event_available'}
                    </span>
                    <span>{isAttending ? 'Attending ✓' : 'Attend'}</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        const targetStatus = isInterested ? 'None' : 'Interested';
                        rsvpMutation.mutate({ actionId: action?.id, status: targetStatus });
                        triggerToast(targetStatus === 'Interested' ? 'Marked as Interested!' : 'RSVP Cancelled');
                    }}
                    className={cn(
                        "flex-1 py-2 rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 outline-none border",
                        isInterested
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-extrabold"
                            : "bg-[#0d1117] border-white/5 text-text-secondary hover:text-white hover:border-white/10"
                    )}
                >
                    <span className="material-symbols-outlined text-sm">
                        {isInterested ? 'star' : 'star_outline'}
                    </span>
                    <span>{isInterested ? 'Interested ✓' : 'Interested'}</span>
                </button>
            </div>
        </article>
    );
};
