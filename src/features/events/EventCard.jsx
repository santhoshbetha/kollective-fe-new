import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggleEventInterest } from '../../features/events/useEventsFeature';
import { EventDateBadge, AttendeeStack } from './EventComponents';

export const EventCard = ({ event }) => {
    const toggleEventInterest = useToggleEventInterest();
    const navigate = useNavigate();

    const isLive = event?.format?.toLowerCase() === 'online' || event?.format?.toLowerCase() === 'live' || event?.isLive;

    return (
        <article
            onClick={() => navigate(`/events/${event?.id}`)}
            className="group bg-[#141414] rounded-[8px] overflow-hidden border border-[#262626] hover:border-[#a10836]/50 transition-all shadow-lg hover:shadow-[#a10836]/5 cursor-pointer flex flex-col h-full"
        >
            <div className="relative h-56 overflow-hidden flex-shrink-0">
                <img
                    alt={event?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={event?.image}
                />
                <div className="absolute top-4 left-4">
                    {isLive ? (
                        <span className="bg-[#a10836] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter animate-pulse">Live Now</span>
                    ) : (
                        <span className="bg-green-600/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter backdrop-blur-sm">In-Person</span>
                    )}
                </div>
            </div>
            <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#a10836] transition-colors line-clamp-1">
                        {event?.title}
                    </h3>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="material-symbols-outlined text-[#a10836] text-sm">calendar_today</span>
                            <span className="line-clamp-1">{event?.displayDate || event?.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="material-symbols-outlined text-[#a10836] text-sm">location_on</span>
                            <span className="line-clamp-1">{event?.location}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                        {event?.description}
                    </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#262626]/50">
                    <span className="text-xs font-bold text-green-500">Free</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleEventInterest(event?.id);
                        }}
                        className={`hover:bg-red-700 text-white text-xs font-bold px-6 py-2.5 rounded-[8px] transition-colors uppercase tracking-widest border-none cursor-pointer ${event?.isInterested ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-[#a10836]'
                            }`}
                    >
                        {event?.isInterested ? 'Interested' : 'Interest'}
                    </button>
                </div>
            </div>
        </article>
    );
};



