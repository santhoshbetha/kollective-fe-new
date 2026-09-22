// src/features/calendar/CalendarBodyMonth.jsx
import React from 'react';
import { useCalendarContext } from './calendar-context';
import { 
    startOfMonth, endOfMonth, 
    startOfWeek, endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, isSameDay, isToday, 
    format 
} from 'date-fns';
import { COLOR_CLASSES } from './calendar-utils';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarBodyMonth() {
    const { date, setDate, setMode, events, setSelectedEvent } = useCalendarContext();

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
        <div className="bg-surface-container border border-outline-variant/60 rounded-card shadow-2xl overflow-hidden">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-surface-container-low text-center">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="py-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 border-collapse">
                {days.map((dayObj, index) => {
                    const isCurrentMonth = isSameMonth(dayObj, date);
                    const isCurrentDay = isToday(dayObj);

                    // Find events on this day
                    const dayEvents = events.filter((event) => isSameDay(event.start, dayObj));
                    const maxVisible = 3;
                    const visibleEvents = dayEvents.slice(0, maxVisible);
                    const extraCount = dayEvents.length - maxVisible;

                    return (
                        <div
                            key={dayObj.toISOString()}
                            onClick={() => {
                                setDate(dayObj);
                            }}
                            className={cn(
                                "min-h-[120px] p-2 border-b border-r border-white/5 transition-colors flex flex-col justify-between group",
                                !isCurrentMonth && "bg-surface-container-lowest/30 opacity-40",
                                isCurrentMonth && "bg-surface-container-low/40 hover:bg-surface-container-high/30",
                                index % 7 === 6 && "border-r-0"
                            )}
                        >
                            {/* Day Number Header */}
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className={cn(
                                        "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all",
                                        isCurrentDay
                                            ? "bg-primary-container text-white crimson-glow"
                                            : "text-text-secondary group-hover:text-white"
                                    )}
                                >
                                    {format(dayObj, 'd')}
                                </span>
                                {dayEvents.length > 0 && (
                                    <span className="text-[10px] font-mono text-text-secondary/60">
                                        {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {/* Event Badges List */}
                            <div className="flex flex-col gap-1.5 flex-1 overflow-hidden pt-1">
                                {visibleEvents.map((evt) => {
                                    const style = COLOR_CLASSES[evt.color] || COLOR_CLASSES.crimson;
                                    return (
                                        <button
                                            key={evt.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedEvent(evt);
                                            }}
                                            className={cn(
                                                "w-full text-left px-2 py-1 rounded-md text-[11px] font-semibold border truncate transition-all cursor-pointer flex items-center gap-1.5",
                                                style.bg, style.border, style.text,
                                                "hover:brightness-125"
                                            )}
                                            title={`${evt.title} (${format(evt.start, 'h:mm a')})`}
                                        >
                                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                                            <span className="truncate">{evt.title}</span>
                                        </button>
                                    );
                                })}

                                {extraCount > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDate(dayObj);
                                            setMode('day');
                                        }}
                                        className="text-[10px] font-bold text-primary-container hover:underline text-left px-1 mt-0.5 cursor-pointer bg-transparent border-none"
                                    >
                                        + {extraCount} more
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
