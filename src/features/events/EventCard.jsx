import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggleEventInterest } from '../../features/events/useEventsFeature';
import { EventDateBadge, AttendeeStack } from './EventComponents';
import { getDisplayLocation } from '../../utils/eventUtils';
import { CategoryGraphic } from '../../components/CategoryGraphic';

const EVENT_CATEGORY_GRAPHICS = {
    'Music': {
        url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        icon: 'music_note',
        color: 'from-purple-950/80 via-black/40 to-black/80',
    },
    'Business & professional': {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
        icon: 'business_center',
        color: 'from-slate-950/80 via-black/40 to-black/80',
    },
    'Community & culture': {
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80',
        icon: 'groups',
        color: 'from-amber-950/80 via-black/40 to-black/80',
    },
    'Performing & visual arts': {
        url: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=600&q=80',
        icon: 'theater_comedy',
        color: 'from-rose-950/80 via-black/40 to-black/80',
    },
    'Film, media, & entertainment': {
        url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
        icon: 'movie',
        color: 'from-indigo-950/80 via-black/40 to-black/80',
    },
    'Fitness & Wellness': {
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        icon: 'fitness_center',
        color: 'from-emerald-950/80 via-black/40 to-black/80',
    },
    'Technology': {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
        icon: 'terminal',
        color: 'from-blue-950/80 via-black/40 to-black/80',
    },
    'Travel & outdoor': {
        url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80',
        icon: 'explore',
        color: 'from-teal-950/80 via-black/40 to-black/80',
    },
    'Charity & causes': {
        url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80',
        icon: 'volunteer_activism',
        color: 'from-red-950/80 via-black/40 to-black/80',
    },
    'Religion & spirituality': {
        url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=600&q=80',
        icon: 'self_improvement',
        color: 'from-amber-950/80 via-black/40 to-black/80',
    },
    'Family & education': {
        url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
        icon: 'school',
        color: 'from-cyan-950/80 via-black/40 to-black/80',
    },
    'Seasonal & holiday': {
        url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80',
        icon: 'celebration',
        color: 'from-pink-950/80 via-black/40 to-black/80',
    },
};

const DEFAULT_EVENT_GRAPHIC = {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9ksWN3ffoNOR2pmCU_J77IFwl9hhLOut8yg3EmzQpTlaR5Hf8lFAohQKRwGxjmEQU1EKOa2K3LriDOS9oQyNxNVoc9fBlxrHJmS23dwNWndRQdmB6jLXkCmKGDmuLsDbriLsLAeKPungn6DgAECaGiUWeOIz8mWO3TUXt5UuNnBt5w-2cE_lc8WMx7-4pgWo4xVvMSn333iHXJItCRu5mD0sd1nXkN3S91vFY5dHZqL0pLaArDYKZSqzoXh6-1wbf6PDmZ5om9FY',
    icon: 'event',
    color: 'from-crimson-950/80 via-black/40 to-black/80',
};

export const EventCard = ({ event, onInterestToggle, isPending }) => {
    const defaultToggleInterest = useToggleEventInterest();
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    const handleInterestClick = (e) => {
        e.stopPropagation();
        if (onInterestToggle) {
            onInterestToggle(event?.id);
        } else if (defaultToggleInterest) {
            defaultToggleInterest(event?.id);
        }
    };

    const isLive = event?.format?.toLowerCase() === 'online' || event?.format?.toLowerCase() === 'live' || event?.isLive;
    const displayLocation = getDisplayLocation(event?.location, event);

    const eventImageUrl = event?.image || event?.cover_image_url || event?.banner_url;
    const categoryGraphic = EVENT_CATEGORY_GRAPHICS[event?.category] || DEFAULT_EVENT_GRAPHIC;
    const hasValidImage = eventImageUrl && !imgError;

    return (
        <article
            onClick={() => navigate(`/events/${event?.id}`)}
            className="group bg-surface-container-low/90 hover:bg-surface-container-low rounded-xl overflow-hidden border border-white/10 hover:border-primary-container/30 transition-all shadow-md hover:shadow-xl cursor-pointer flex flex-col justify-between h-full"
        >
            <div>
                {/* Compact Image Header */}
                <div className="relative h-36 overflow-hidden flex-shrink-0 bg-surface-container-high">
                    {hasValidImage ? (
                        <img
                            alt={event?.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={eventImageUrl}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <CategoryGraphic category={event?.category} title={event?.title} />
                    )}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
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
                            <span className="bg-black/60 text-text-secondary text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-md border border-white/10">
                                {event.category}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-2">
                    <h2 className="text-xl font-bold text-text-primary group-hover:text-primary-container transition-colors line-clamp-1 tracking-tight">
                        {event?.title}
                    </h2>

                    {/* Metadata */}
                    <div className="space-y-1 text-[16px] text-text-secondary/80">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">calendar_today</span>
                            <span className="line-clamp-1 font-medium">{event?.displayDate || event?.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">location_on</span>
                            <span className="line-clamp-1 font-medium">{displayLocation}</span>
                        </div>
                    </div>

                    {event?.description && (
                        <p className="text-[18px] text-text-secondary line-clamp-2 leading-relaxed pt-1">
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
                    className={`text-xs font-extrabold px-4 py-1.5 rounded-lg transition-all uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5 active:scale-95 ${event?.isInterested
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



