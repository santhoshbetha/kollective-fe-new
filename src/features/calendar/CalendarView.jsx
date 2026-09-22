// src/features/calendar/CalendarView.jsx
import React, { useState, useMemo } from 'react';
import { useEventsQuery, useToggleEventInterest, useToggleEventAttendance } from '../events/useEventsFeature';
import { transformToCalendarEvents } from './calendar-utils';
import { CalendarContext } from './calendar-context';
import { CalendarHeader } from './CalendarHeader';
import { CalendarBodyMonth } from './CalendarBodyMonth';
import { CalendarBodyWeek } from './CalendarBodyWeek';
import { CalendarBodyDay } from './CalendarBodyDay';
import { EventDetailsModal } from './EventDetailsModal';
import { useAuthStore } from '../../store/auth/useAuthStore';

export function CalendarView() {
    const { events = [], eventsLoading } = useEventsQuery();
    const interestMutation = useToggleEventInterest();
    const attendanceMutation = useToggleEventAttendance();
    const currentUser = useAuthStore((state) => state.user);

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('month'); // 'month' | 'week' | 'day'
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'attending' | 'my_events'
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Transform raw events to standardized CalendarEvent objects
    const calendarEvents = useMemo(() => {
        return transformToCalendarEvents(events);
    }, [events]);

    // Apply Filter Tab
    const filteredCalendarEvents = useMemo(() => {
        if (filterTab === 'attending') {
            return calendarEvents.filter((evt) => evt.isAttending || evt.isInterested);
        }
        if (filterTab === 'my_events') {
            const currentName = currentUser?.name || currentUser?.username;
            return calendarEvents.filter((evt) => {
                if (!currentName) return false;
                const org = typeof evt.organizer === 'string' ? evt.organizer : evt.organizer?.name;
                return org && org.toLowerCase().includes(currentName.toLowerCase());
            });
        }
        return calendarEvents;
    }, [calendarEvents, filterTab, currentUser]);

    const contextValue = {
        date,
        setDate,
        mode,
        setMode,
        events: filteredCalendarEvents,
        filterTab,
        setFilterTab,
        selectedEvent,
        setSelectedEvent,
        onInterestToggle: (id) => interestMutation.mutate(id),
        onAttendanceToggle: (id) => attendanceMutation.mutate(id)
    };

    if (eventsLoading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center gap-4 bg-surface-container border border-outline-variant/60 rounded-card p-12">
                <div className="w-12 h-12 rounded-full border-4 border-primary-container border-t-transparent animate-spin" />
                <p className="text-text-secondary font-bold text-sm">Loading your community calendar...</p>
            </div>
        );
    }

    return (
        <CalendarContext.Provider value={contextValue}>
            <div className="w-full flex flex-col font-sans">
                <CalendarHeader />

                {/* View Modes */}
                {mode === 'month' && <CalendarBodyMonth />}
                {mode === 'week' && <CalendarBodyWeek />}
                {mode === 'day' && <CalendarBodyDay />}

                {/* Event Details Modal */}
                {selectedEvent && (
                    <EventDetailsModal
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                        onInterestToggle={(id) => {
                            interestMutation.mutate(id);
                            setSelectedEvent((prev) => prev ? { ...prev, isInterested: !prev.isInterested } : null);
                        }}
                        onAttendanceToggle={(id) => {
                            attendanceMutation.mutate(id);
                            setSelectedEvent((prev) => prev ? { ...prev, isAttending: !prev.isAttending } : null);
                        }}
                    />
                )}
            </div>
        </CalendarContext.Provider>
    );
}
