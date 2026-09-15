import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggleEventInterest } from '../../features/events/useEventsFeature';
import { EventDateBadge, AttendeeStack } from './EventComponents';

export const EventCard = ({ event, onInterestToggle, isPending }) => {
    const defaultToggleInterest = useToggleEventInterest();
    const navigate = useNavigate();

    const handleInterestClick = (e) => {
        e.stopPropagation();
        if (onInterestToggle) {
            onInterestToggle(event?.id);
        } else if (defaultToggleInterest) {
            defaultToggleInterest(event?.id);
        }
    };

    const isLive = event?.format?.toLowerCase() === 'online' || event?.format?.toLowerCase() === 'live' || event?.isLive;

    return (
        <article
            onClick={() => navigate(`/events/${event?.id}`)}
            className="group bg-surface-container-low/90 hover:bg-surface-container-low rounded-xl overflow-hidden border border-white/10 hover:border-primary-container/30 transition-all shadow-md hover:shadow-xl cursor-pointer flex flex-col justify-between h-full"
        >
            <div>
                {/* Compact Image Header */}
                <div className="relative h-36 overflow-hidden flex-shrink-0 bg-surface-container-high">
                    {event?.image ? (
                        <img
                            alt={event?.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={event?.image}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary/40 bg-surface-container-high/60">
                            <span className="material-symbols-outlined text-4xl">event</span>
                        </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        {isLive ? (
                            <span className="bg-[#a10836] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse shadow">
                                Live Now
                            </span>
                        ) : (
                            <span className="bg-green-600/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-sm shadow">
                                In-Person
                            </span>
                        )}
                        {event?.category && (
                            <span className="bg-black/60 text-text-secondary text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-md">
                                {event.category}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-2">
                    <h3 className="text-base font-bold text-text-primary group-hover:text-primary-container transition-colors line-clamp-1 tracking-tight">
                        {event?.title}
                    </h3>

                    {/* Metadata */}
                    <div className="space-y-1 text-xs text-text-secondary/80">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">calendar_today</span>
                            <span className="line-clamp-1 font-medium">{event?.displayDate || event?.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">location_on</span>
                            <span className="line-clamp-1 font-medium">{event?.location}</span>
                        </div>
                    </div>

                    {event?.description && (
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed pt-1">
                            {event?.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Compact Action Footer */}
            <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-white/5 mt-auto">
                <span className="text-xs font-bold text-green-400 font-mono">
                    {event?.price || 'Free'}
                </span>
                <button
                    onClick={handleInterestClick}
                    disabled={isPending}
                    className={`text-xs font-extrabold px-4 py-1.5 rounded-lg transition-all uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        event?.isInterested 
                            ? 'bg-surface-container-high text-text-secondary hover:bg-surface-container-highest' 
                            : 'bg-primary-container text-white hover:bg-primary-container/80 shadow-md shadow-primary-container/20'
                    }`}
                >
                    <span className="material-symbols-outlined text-[14px]">
                        {event?.isInterested ? 'check' : 'star'}
                    </span>
                    {event?.isInterested ? 'Interested' : 'Interest'}
                </button>
            </div>
        </article>
    );
};



