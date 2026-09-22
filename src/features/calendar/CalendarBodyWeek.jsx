// src/features/calendar/CalendarBodyWeek.jsx
import React from 'react';
import { useCalendarContext } from './calendar-context';
import { startOfWeek, addDays, format, isSameDay, isToday } from 'date-fns';
import { COLOR_CLASSES } from './calendar-utils';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function CalendarBodyWeek() {
    const { date, setDate, events, setSelectedEvent } = useCalendarContext();

    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
        <div className="bg-surface-container border border-outline-variant/60 rounded-card shadow-2xl overflow-hidden flex flex-col">
            {/* Week Header */}
            <div className="grid grid-cols-8 border-b border-white/10 bg-surface-container-low text-center">
                {/* Empty corner for time column */}
                <div className="py-3 text-xs font-bold text-text-secondary border-r border-white/5">
                    Time
                </div>
                {weekDays.map((day) => {
                    const isCurrent = isToday(day);
                    return (
                        <div 
                            key={day.toISOString()} 
                            onClick={() => setDate(day)}
                            className="py-3 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high/30 transition-colors border-r border-white/5 last:border-r-0"
                        >
                            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                                {format(day, 'EEE')}
                            </span>
                            <span className={cn(
                                "w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center mt-1 transition-all",
                                isCurrent ? "bg-primary-container text-white crimson-glow" : "text-text-primary"
                            )}>
                                {format(day, 'd')}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Time Grid Scroll Container */}
            <div className="overflow-y-auto max-h-[600px] relative">
                <div className="grid grid-cols-8 relative min-h-[1152px]">
                    {/* Hour Labels Column */}
                    <div className="border-r border-white/5 bg-surface-container-low/30">
                        {HOURS.map((hour) => (
                            <div 
                                key={hour} 
                                className="h-12 border-b border-white/5 px-2 text-[10px] font-mono text-text-secondary/60 flex items-start justify-end pt-1"
                            >
                                {format(new Date(2026, 0, 1, hour), 'h a')}
                            </div>
                        ))}
                    </div>

                    {/* 7 Day Columns */}
                    {weekDays.map((day) => {
                        const dayEvents = events.filter((evt) => isSameDay(evt.start, day));

                        return (
                            <div 
                                key={day.toISOString()} 
                                className="relative border-r border-white/5 last:border-r-0"
                            >
                                {/* Grid Horizontal Hour Lines */}
                                {HOURS.map((hour) => (
                                    <div key={hour} className="h-12 border-b border-white/5" />
                                ))}

                                {/* Positioned Events */}
                                {dayEvents.map((evt) => {
                                    const startHour = evt.start.getHours() + evt.start.getMinutes() / 60;
                                    const endHour = evt.end.getHours() + evt.end.getMinutes() / 60;
                                    const durationHours = Math.max(0.5, endHour - startHour);

                                    const topPx = startHour * 48; // 48px per hour
                                    const heightPx = Math.max(36, durationHours * 48);

                                    const style = COLOR_CLASSES[evt.color] || COLOR_CLASSES.crimson;

                                    return (
                                        <button
                                            key={evt.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedEvent(evt);
                                            }}
                                            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                                            className={cn(
                                                "absolute inset-x-1 p-2 rounded-lg text-xs text-left border shadow-md overflow-hidden transition-all cursor-pointer z-10 flex flex-col justify-between",
                                                style.bg, style.border, style.text,
                                                "hover:brightness-125 hover:z-20"
                                            )}
                                        >
                                            <div className="font-bold truncate text-[11px] leading-snug">{evt.title}</div>
                                            <div className="text-[10px] font-mono opacity-80">
                                                {format(evt.start, 'h:mm a')}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
