// src/features/calendar/CalendarHeader.jsx
import React from 'react';
import { useCalendarContext } from './calendar-context';
import { useNavigate } from 'react-router-dom';
import { 
    format, 
    addMonths, subMonths, 
    addWeeks, subWeeks, 
    addDays, subDays, 
    startOfWeek, endOfWeek 
} from 'date-fns';
import { 
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
    CalendarDays, CalendarRange, Clock, Plus, Filter 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function CalendarHeader() {
    const { date, setDate, mode, setMode, filterTab, setFilterTab, events } = useCalendarContext();
    const navigate = useNavigate();

    const handlePrev = () => {
        if (mode === 'month') setDate(subMonths(date, 1));
        else if (mode === 'week') setDate(subWeeks(date, 1));
        else setDate(subDays(date, 1));
    };

    const handleNext = () => {
        if (mode === 'month') setDate(addMonths(date, 1));
        else if (mode === 'week') setDate(addWeeks(date, 1));
        else setDate(addDays(date, 1));
    };

    const handleToday = () => {
        setDate(new Date());
    };

    const getDateTitle = () => {
        if (mode === 'month') {
            return format(date, 'MMMM yyyy');
        } else if (mode === 'week') {
            const start = startOfWeek(date, { weekStartsOn: 1 });
            const end = endOfWeek(date, { weekStartsOn: 1 });
            return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
        } else {
            return format(date, 'EEEE, MMMM d, yyyy');
        }
    };

    return (
        <div className="flex flex-col gap-6 mb-8">
            {/* Top Navigation Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container border border-outline-variant/60 p-4 md:p-6 rounded-card shadow-2xl">
                
                {/* Date Controls & Title */}
                <div className="flex items-center gap-4 flex-wrap">
                    <button
                        onClick={handleToday}
                        className="px-4 py-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 rounded-xl text-xs font-bold text-text-primary transition-colors cursor-pointer"
                    >
                        Today
                    </button>

                    <div className="flex items-center gap-1 bg-surface-container-low border border-outline-variant/60 rounded-xl p-1">
                        <button
                            onClick={handlePrev}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/5 transition-colors cursor-pointer border-none"
                            aria-label="Previous period"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/5 transition-colors cursor-pointer border-none"
                            aria-label="Next period"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <h2 className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight font-headline-lg ml-1">
                        {getDateTitle()}
                    </h2>
                </div>

                {/* Right Side Actions: Mode Switcher & Create Event */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* View Modes */}
                    <div className="bg-surface-container-low p-1 rounded-xl flex border border-outline-variant/60">
                        <button
                            onClick={() => setMode('month')}
                            className={cn(
                                "px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border-none",
                                mode === 'month' ? "bg-primary-container text-white crimson-glow" : "text-text-secondary hover:text-white bg-transparent"
                            )}
                        >
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>Month</span>
                        </button>

                        <button
                            onClick={() => setMode('week')}
                            className={cn(
                                "px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border-none",
                                mode === 'week' ? "bg-primary-container text-white crimson-glow" : "text-text-secondary hover:text-white bg-transparent"
                            )}
                        >
                            <CalendarRange className="w-3.5 h-3.5" />
                            <span>Week</span>
                        </button>

                        <button
                            onClick={() => setMode('day')}
                            className={cn(
                                "px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border-none",
                                mode === 'day' ? "bg-primary-container text-white crimson-glow" : "text-text-secondary hover:text-white bg-transparent"
                            )}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Day</span>
                        </button>
                    </div>

                    {/* Create Event CTA */}
                    <button
                        onClick={() => navigate('/events/create')}
                        className="px-5 py-2.5 bg-primary-container hover:brightness-110 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-none crimson-glow shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Event</span>
                    </button>
                </div>
            </div>

            {/* Event Filter Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setFilterTab('all')}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0",
                        filterTab === 'all'
                            ? "bg-surface-container-high text-text-primary border-white/10 shadow-sm"
                            : "bg-transparent text-text-secondary border-transparent hover:text-white"
                    )}
                >
                    All Events ({events.length})
                </button>

                <button
                    onClick={() => setFilterTab('attending')}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0",
                        filterTab === 'attending'
                            ? "bg-surface-container-high text-text-primary border-white/10 shadow-sm"
                            : "bg-transparent text-text-secondary border-transparent hover:text-white"
                    )}
                >
                    Attending / Starred ({events.filter(e => e.isAttending || e.isInterested).length})
                </button>

                <button
                    onClick={() => setFilterTab('my_events')}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0",
                        filterTab === 'my_events'
                            ? "bg-surface-container-high text-text-primary border-white/10 shadow-sm"
                            : "bg-transparent text-text-secondary border-transparent hover:text-white"
                    )}
                >
                    My Events
                </button>
            </div>
        </div>
    );
}
