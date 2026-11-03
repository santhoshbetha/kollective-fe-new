import React from "react";
import { useRsvpToAction } from "./useOrganizeFeature";
import { useNavigate } from "react-router-dom";
import { getOrganizerName } from "../../utils/eventUtils";
import { useAuthStore } from "../../store/auth/useAuthStore";
import { UserHoverCard } from "../../components/accounts/UserHoverCard";
import { cn } from "@/lib/utils";

export const ActionCard = ({ action, setToastMessage }) => {
    const rsvpMutation = useRsvpToAction();
    const navigate = useNavigate();
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const isOrg = activeAccount?.type === 'organization';
    const isOrgAdmin = isOrg && ['admin', 'owner'].includes(activeAccount?.role?.toLowerCase());
    const isOrgNonAdmin = isOrg && !isOrgAdmin;
    const orgNonAdminTooltip = "Only administrators can perform social actions on behalf of this organization";

    // Read fields directly from source data instead of stale local state overrides
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
        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
        : action?.type === 'Town Hall'
            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
            : 'bg-primary-container/10 text-primary-container border-primary-container/20';

    const handleNavigateToDetails = () => {
        if (action?.id) {
            navigate(`/organize/${action.id}`);
        }
    };

    return (
        <article
            data-testid="action-card"
            onClick={handleNavigateToDetails}
            className="rounded-xl p-4 sm:p-5 relative overflow-hidden group border border-black/10 dark:border-white/5 transition-all duration-300 bg-white dark:bg-[#141414] hover:bg-neutral-50/80 dark:hover:bg-[#1c1b1b] shadow-sm hover:shadow-md dark:shadow-md flex flex-col justify-between gap-3 text-left min-h-[220px] cursor-pointer"
        >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary-container/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-container/10 transition-colors pointer-events-none"></div>

            <div
                data-testid="action-card-body"
                onClick={handleNavigateToDetails}
            >
                {/* Header Badge Row */}
                <div className="flex justify-between items-center mb-3 select-none font-mono">
                    <span data-testid="action-type-badge" className={cn("px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded", typeBadgeStyles)}>
                        {action?.type || 'Action'}
                    </span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/organize/${action?.id}`);
                            triggerToast('Link copied to clipboard!');
                        }}
                        className="text-text-secondary/70 hover:text-text-primary dark:hover:text-white cursor-pointer transition-colors p-1 bg-transparent border-none outline-none flex items-center"
                        title="Share Action Node"
                    >
                        <span className="material-symbols-outlined text-base">share</span>
                    </button>
                </div>

                {/* Proposal Title Endpoint Link */}
                <h3
                    data-testid="action-title"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToDetails();
                    }}
                    className="text-lg font-black text-text-primary dark:text-white hover:text-primary-container transition-colors line-clamp-1 cursor-pointer tracking-tight mb-2 outline-none"
                >
                    {action?.title}
                </h3>

                {/* Metadata List Block */}
                <div className="space-y-1.5 text-xs text-text-secondary font-medium">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-base shrink-0 select-none">calendar_today</span>
                        <span data-testid="action-time" className="truncate">{action?.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-base shrink-0 select-none">location_on</span>
                        <span data-testid="action-location" className="truncate">{action?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-base shrink-0 select-none">person</span>
                        <span className="truncate">
                            Organized by{" "}
                            <UserHoverCard author={action?.author || (typeof action?.organizer === 'object' ? action?.organizer : { name: getOrganizerName(action?.author || action?.organizer), username: getOrganizerName(action?.author || action?.organizer) })}>
                                <span className="text-primary-container hover:underline font-bold font-mono">
                                    {getOrganizerName(action?.author || action?.organizer)}
                                </span>
                            </UserHoverCard>
                        </span>
                    </div>
                </div>
            </div>

            {/* RSVP Interacting Selection Buttons Row */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-black/10 dark:border-white/5 mt-1 font-mono text-[10px] select-none">
                <button
                    type="button"
                    data-testid="attend-btn"
                    disabled={isOrgNonAdmin || rsvpMutation.isPending}
                    title={isOrgNonAdmin ? orgNonAdminTooltip : undefined}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isOrgNonAdmin) return;
                        const targetStatus = isAttending ? 'None' : 'Attending';
                        rsvpMutation.mutate({ actionId: action?.id, status: targetStatus });
                        triggerToast(targetStatus === 'Attending' ? 'Marked as Attending!' : 'RSVP Cancelled');
                    }}
                    className={cn(
                        "flex-1 py-2 rounded-lg font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 outline-none border",
                        isOrgNonAdmin
                            ? "opacity-40 cursor-not-allowed bg-black/5 dark:bg-[#0d1117] border-black/10 dark:border-white/5 text-text-secondary"
                            : isAttending
                                ? "bg-primary-container text-white border-primary-container shadow-sm font-extrabold crimson-glow cursor-pointer active:scale-95"
                                : "bg-black/5 hover:bg-black/10 dark:bg-[#0d1117] dark:hover:bg-[#1a222d] border-black/10 dark:border-white/5 text-text-secondary hover:text-text-primary dark:hover:text-white hover:border-black/20 dark:hover:border-white/10 cursor-pointer active:scale-95"
                    )}
                >
                    <span className="material-symbols-outlined text-sm">
                        {isOrgNonAdmin ? 'lock' : isAttending ? 'check_circle' : 'event_available'}
                    </span>
                    <span>{isOrgNonAdmin ? 'Admin Only' : isAttending ? 'Attending ✓' : isOrgAdmin ? 'Attend (as Org)' : 'Attend'}</span>
                </button>

                <button
                    type="button"
                    data-testid="interested-btn"
                    disabled={isOrgNonAdmin || rsvpMutation.isPending}
                    title={isOrgNonAdmin ? orgNonAdminTooltip : undefined}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isOrgNonAdmin) return;
                        const targetStatus = isInterested ? 'None' : 'Interested';
                        rsvpMutation.mutate({ actionId: action?.id, status: targetStatus });
                        triggerToast(targetStatus === 'Interested' ? 'Marked as Interested!' : 'RSVP Cancelled');
                    }}
                    className={cn(
                        "flex-1 py-2 rounded-lg font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 outline-none border",
                        isOrgNonAdmin
                            ? "opacity-40 cursor-not-allowed bg-black/5 dark:bg-[#0d1117] border-black/10 dark:border-white/5 text-text-secondary"
                            : isInterested
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-extrabold cursor-pointer active:scale-95 shadow-xs"
                                : "bg-black/5 hover:bg-black/10 dark:bg-[#0d1117] dark:hover:bg-[#1a222d] border-black/10 dark:border-white/5 text-text-secondary hover:text-text-primary dark:hover:text-white hover:border-black/20 dark:hover:border-white/10 cursor-pointer active:scale-95"
                    )}
                >
                    <span className="material-symbols-outlined text-sm">
                        {isOrgNonAdmin ? 'lock' : isInterested ? 'star' : 'star_outline'}
                    </span>
                    <span>{isOrgNonAdmin ? 'Admin Only' : isInterested ? 'Interested ✓' : isOrgAdmin ? 'Interested (as Org)' : 'Interested'}</span>
                </button>
            </div>
        </article>
    );
};
