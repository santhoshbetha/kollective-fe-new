// src/features/calendar/CalendarBodyDay.jsx
import React from 'react';
import { useCalendarContext } from './calendar-context';
import { format, isSameDay, isToday } from 'date-fns';
import { COLOR_CLASSES } from './calendar-utils';
import { MapPin, User, Clock, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function CalendarBodyDay() {
    const { date, events, setSelectedEvent, onInterestToggle, onAttendanceToggle } = useCalendarContext();
    const navigate = useNavigate();

    const dayEvents = events.filter((evt) => isSameDay(evt.start, date));
    const isCurrentDay = isToday(date);

    return (
        <div className="bg-surface-container border border-outline-variant/60 rounded-card shadow-2xl overflow-hidden flex flex-col">
            {/* Day Header Banner */}
            <div className="p-6 bg-surface-container-low border-b border-white/10 flex items-center justify-between">
                <div>
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">
                        {format(date, 'EEEE')}
                    </span>
                    <h3 className="text-2xl font-extrabold text-text-primary tracking-tight">
                        {format(date, 'MMMM d, yyyy')}
                    </h3>
                </div>
                <div className="text-right">
                    <span className="text-xs font-mono text-primary-container font-bold bg-primary-container/10 border border-primary-container/20 px-3 py-1.5 rounded-full">
                        {dayEvents.length} Event{dayEvents.length !== 1 ? 's' : ''} Scheduled
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-6">
                {dayEvents.length === 0 ? (
                    <div className="p-12 text-center bg-surface-container-low/40 rounded-card border border-dashed border-white/10 space-y-3">
                        <Clock className="w-10 h-10 text-text-secondary/40 mx-auto" />
                        <h4 className="text-lg font-bold text-text-primary">No events scheduled for this day</h4>
                        <p className="text-text-secondary text-sm max-w-sm mx-auto">
                            Switch dates or browse all community events to discover upcoming activities.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dayEvents.map((evt) => {
                            const style = COLOR_CLASSES[evt.color] || COLOR_CLASSES.crimson;
                            return (
                                <div 
                                    key={evt.id}
                                    onClick={() => setSelectedEvent(evt)}
                                    className="bg-surface-container-low border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all cursor-pointer group flex flex-col md:flex-row gap-5 justify-between items-start"
                                >
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={cn("px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider", style.badge)}>
                                                {evt.category}
                                            </span>
                                            <span className="text-xs font-mono text-text-secondary">
                                                {format(evt.start, 'h:mm a')} - {format(evt.end, 'h:mm a')}
                                            </span>
                                        </div>

                                        <h4 className="text-xl font-extrabold text-text-primary group-hover:text-primary-container transition-colors tracking-tight">
                                            {evt.title}
                                        </h4>

                                        {evt.description && (
                                            <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
                                                {evt.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-text-secondary pt-1 flex-wrap">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-primary-container" />
                                                <span className="truncate max-w-[200px]">{evt.location}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-primary-container" />
                                                <span>{evt.organizer}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col items-center md:items-end justify-between gap-3 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAttendanceToggle?.(evt.id);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                                                    evt.isAttending
                                                        ? 'bg-primary-container text-white border-primary-container'
                                                        : 'bg-surface-container-high border-white/10 text-text-secondary hover:text-white'
                                                }`}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>{evt.isAttending ? 'Attending' : 'Attend'}</span>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onInterestToggle?.(evt.id);
                                                }}
                                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                                    evt.isInterested
                                                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                                        : 'bg-surface-container-high border-white/10 text-text-secondary hover:text-white'
                                                }`}
                                            >
                                                <Heart className={`w-4 h-4 ${evt.isInterested ? 'fill-amber-400' : ''}`} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/events/${evt.id}`);
                                            }}
                                            className="text-xs font-bold text-text-secondary group-hover:text-primary-container flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none"
                                        >
                                            <span>Full Details</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
