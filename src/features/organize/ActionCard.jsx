import React, { useState } from "react";
import { useRsvpToAction } from "./useOrganizeFeature";
import { useNavigate } from "react-router-dom";

export const ActionCard = ({ action, setToastMessage }) => {
    const rsvpMutation = useRsvpToAction();
    const navigate = useNavigate();
    const [isAttending, setIsAttending] = useState(action?.rsvp === 'Attending');
    const [isInterested, setIsInterested] = useState(action?.rsvp === 'Interested');

    const triggerToast = (msg) => {
        if (setToastMessage) {
            setToastMessage(msg);
            setTimeout(() => {
                setToastMessage('');
            }, 2000);
        }
    };

    const typeBadgeStyles = action?.type === 'Protest'
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : action?.type === 'Town Hall'
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            : 'bg-primary-container/20 text-primary-container border-primary-container/30';

    return (
        <article
            key={action?.id}
            className="glass-card rounded-xl p-4 sm:p-5 relative overflow-hidden group border border-white/10 hover:border-primary-container/30 transition-all duration-300 bg-surface-container-low/90 hover:bg-surface-container-low shadow-md hover:shadow-xl flex flex-col justify-between gap-3"
        >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary-container/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-container/10 transition-colors pointer-events-none"></div>

            <div>
                {/* Header Row */}
                <div className="flex justify-between items-center mb-2.5">
                    <span className={`px-2.5 py-0.5 border text-[10px] font-extrabold uppercase tracking-wider rounded-md ${typeBadgeStyles}`}>
                        {action?.type || 'Action'}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            triggerToast('Link copied to clipboard!');
                        }}
                        className="text-text-secondary/70 hover:text-primary-container cursor-pointer transition-colors p-1"
                        title="Share Action"
                    >
                        <span className="material-symbols-outlined text-[18px]">share</span>
                    </button>
                </div>

                {/* Title */}
                <h3
                    onClick={() => navigate(`/organize/${action?.id}`)}
                    className="text-base sm:text-lg font-bold text-text-primary hover:text-primary-container transition-colors line-clamp-1 cursor-pointer tracking-tight mb-2"
                >
                    {action?.title}
                </h3>

                {/* Metadata List */}
                <div className="space-y-1.5 text-xs text-text-secondary/80">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">calendar_today</span>
                        <span className="line-clamp-1 font-medium">{action?.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">location_on</span>
                        <span className="line-clamp-1 font-medium">{action?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">person</span>
                        <span className="line-clamp-1">
                            Organized by <span className="text-primary-container hover:underline cursor-pointer font-bold">{action?.organizer}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-white/5 mt-1">
                <button
                    onClick={() => {
                        const newStatus = isAttending ? 'None' : 'Attending';
                        setIsAttending(!isAttending);
                        if (!isAttending) setIsInterested(false);
                        rsvpMutation.mutate({ actionId: action?.id, status: newStatus });
                        triggerToast(newStatus === 'Attending' ? 'Marked as Attending!' : 'RSVP Cancelled');
                    }}
                    className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all uppercase tracking-wider cursor-pointer border-none flex items-center justify-center gap-1.5 active:scale-95 ${
                        isAttending
                            ? 'bg-primary-container text-white shadow-md shadow-primary-container/20'
                            : 'bg-surface-container-high text-text-secondary hover:bg-surface-container-highest hover:text-text-primary'
                    }`}
                >
                    <span className="material-symbols-outlined text-[14px]">
                        {isAttending ? 'check_circle' : 'event_available'}
                    </span>
                    {isAttending ? 'Attending ✓' : 'Attend'}
                </button>

                <button
                    onClick={() => {
                        const newStatus = isInterested ? 'None' : 'Interested';
                        setIsInterested(!isInterested);
                        if (!isInterested) setIsAttending(false);
                        rsvpMutation.mutate({ actionId: action?.id, status: newStatus });
                        triggerToast(newStatus === 'Interested' ? 'Marked as Interested!' : 'RSVP Cancelled');
                    }}
                    className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        isInterested
                            ? 'bg-secondary text-on-secondary shadow-md'
                            : 'bg-surface-container-high/60 text-text-secondary hover:bg-surface-container-high hover:text-text-primary border border-white/5'
                    }`}
                >
                    <span className="material-symbols-outlined text-[14px]">
                        {isInterested ? 'star' : 'star_outline'}
                    </span>
                    {isInterested ? 'Interested ✓' : 'Interested'}
                </button>
            </div>
        </article>
    );
};
