// src/features/calendar/EventDetailsModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { COLOR_CLASSES } from './calendar-utils';
import { X, Calendar as CalendarIcon, MapPin, User, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export function EventDetailsModal({ event, onClose, onInterestToggle, onAttendanceToggle }) {
    const navigate = useNavigate();
    if (!event) return null;

    const colorStyle = COLOR_CLASSES[event.color] || COLOR_CLASSES.crimson;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <div 
                className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
                
                {/* Header Banner / Image */}
                {event.image ? (
                    <div className="relative h-48 w-full overflow-hidden bg-surface-container-high">
                        <img 
                            src={event.image} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer border-none"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="p-6 pb-0 flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorStyle.badge}`}>
                            {event.category}
                        </span>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-surface-container-high text-text-secondary hover:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-6">
                    {event.image && (
                        <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-3 ${colorStyle.badge}`}>
                                {event.category}
                            </span>
                            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">{event.title}</h2>
                        </div>
                    )}

                    {!event.image && (
                        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">{event.title}</h2>
                    )}

                    {/* Metadata Grid */}
                    <div className="space-y-3 bg-surface-container-low/60 border border-white/5 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <CalendarIcon className="w-4 h-4 text-primary-container shrink-0" />
                            <span className="font-semibold text-text-primary">
                                {format(event.start, 'EEEE, MMM d, yyyy')} • {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <MapPin className="w-4 h-4 text-primary-container shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <User className="w-4 h-4 text-primary-container shrink-0" />
                            <span>Organized by <strong className="text-text-primary">{event.organizer}</strong></span>
                        </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                        <p className="text-text-secondary text-sm leading-relaxed line-clamp-4">
                            {event.description}
                        </p>
                    )}

                    {/* Actions Row */}
                    <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onAttendanceToggle?.(event.id)}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                                    event.isAttending
                                        ? 'bg-primary-container text-white border-primary-container'
                                        : 'bg-surface-container-high border-white/10 text-text-secondary hover:text-white'
                                }`}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{event.isAttending ? 'Attending ✓' : 'Attend'}</span>
                            </button>

                            <button
                                onClick={() => onInterestToggle?.(event.id)}
                                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                                    event.isInterested
                                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                        : 'bg-surface-container-high border-white/10 text-text-secondary hover:text-white'
                                }`}
                            >
                                <Heart className={`w-4 h-4 ${event.isInterested ? 'fill-amber-400' : ''}`} />
                                <span>{event.isInterested ? 'Interested' : 'Star'}</span>
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                onClose();
                                navigate(`/events/${event.id}`);
                            }}
                            className="px-5 py-2.5 bg-primary-container hover:brightness-110 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border-none shadow-md"
                        >
                            <span>Event Page</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
