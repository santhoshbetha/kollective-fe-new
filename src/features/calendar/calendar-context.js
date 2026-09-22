// src/features/calendar/calendar-context.js
import { createContext, useContext } from 'react';

export const CalendarContext = createContext({
    date: new Date(),
    setDate: () => {},
    mode: 'month', // 'month' | 'week' | 'day'
    setMode: () => {},
    events: [],
    filterTab: 'all', // 'all' | 'attending' | 'my_events'
    setFilterTab: () => {},
    selectedEvent: null,
    setSelectedEvent: () => {},
    onInterestToggle: () => {},
    onAttendanceToggle: () => {}
});

export function useCalendarContext() {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error('useCalendarContext must be used within a CalendarProvider');
    }
    return context;
}
