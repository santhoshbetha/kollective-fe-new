import { useState } from "react";
import { useRsvpToAction } from "./useOrganizeFeature";
import { useNavigate } from "react-router-dom";

export const ActionCard = ({ action, setToastMessage }) => {
    const rsvpMutation = useRsvpToAction();
    const navigate = useNavigate();
    const [isAttending, setIsAttending] = useState(action?.rsvp === 'Attending');
    const [isInterested, setIsInterested] = useState(action?.rsvp === 'Interested');

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage('');
        }, 2000);
    };

    return (
        <div
            key={action?.id}
            className="glass-card rounded-2xl p-6 relative overflow-hidden group border border-white/5 hover:border-primary-container/20 transition-all duration-300"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all"></div>

            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 border text-[14px] font-bold uppercase tracking-widest rounded-full ${action?.type === 'Protest'
                    ? 'bg-surface-crimson-low border-primary/20 text-primary-container'
                    : action?.type === 'Town Hall'
                        ? 'bg-secondary/10 border-secondary/20 text-text-secondary'
                        : 'bg-tertiary/10 border-tertiary/20 text-tertiary'
                    }`}>
                    {action?.type}
                </span>
                <button className="material-symbols-outlined text-on-surface-variant hover:text-primary-container cursor-pointer transition-colors text-[20px]">
                    share
                </button>
            </div>

            <h3
                onClick={() => navigate(`/organize/${action?.id}`)}
                className="font-headline-md text-2xl font-bold text-text-primary mb-4 cursor-pointer hover:text-primary-container transition-colors"
            >
                {action?.title}
            </h3>

            <div className="space-y-2 mb-6 text-lg text-on-surface-variant">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span className="font-label-sm text-lg">{action?.time}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="font-label-sm text-lg">{action?.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span className="font-label-sm text-lg">
                        Organized by <span className="text-primary-container hover:underline cursor-pointer font-bold">{action?.organizer}</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => {
                        const newStatus = isAttending ? 'None' : 'Attending';
                        rsvpMutation.mutateAsync(action?.id, newStatus);
                        triggerToast(newStatus === 'Attending' ? 'Marked as Attending!' : 'RSVP Cancelled');
                    }}
                    className={`flex-1 py-3 rounded-none font-bold text-sm transition-all uppercase tracking-wider cursor-pointer border-none ${isAttending
                        ? 'bg-primary-container text-white crimson-glow brightness-110'
                        : 'bg-surface-container-high border border-outline-variant text-text-primary hover:bg-surface-container-highest'
                        }`}
                >
                    {isAttending ? 'Attending ✓' : 'Attend'}
                </button>

                <button
                    onClick={() => {
                        const newStatus = isInterested ? 'None' : 'Interested';
                        rsvpMutation.mutateAsync(action?.id, newStatus);
                        triggerToast(newStatus === 'Interested' ? 'Marked as Interested!' : 'RSVP Cancelled');
                    }}
                    className={`flex-1 py-3 rounded-none font-bold text-sm transition-all uppercase tracking-wider 
                      cursor-pointer ${isInterested
                            ? 'bg-secondary dark:text-on-secondary font-bold brightness-110 border-none'
                            : 'border border-outline-variant hover:bg-surface-container-high/60 text-text-primary'
                        }`}
                >
                    {isInterested ? 'Interested ✓' : 'Interested'}
                </button>
            </div>
        </div>
    );
};
