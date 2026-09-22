// src/features/calendar/calendar-utils.js
import { parseISO, addHours } from 'date-fns';

export const CATEGORY_COLORS = {
    'Politics': 'crimson',
    'Business & professional': 'indigo',
    'Technology': 'cyan',
    'Environment': 'emerald',
    'Community & culture': 'amber',
    'Music': 'purple',
    'Food & drink': 'rose',
    'Fitness & Wellness': 'emerald',
    'Default': 'crimson'
};

export const COLOR_CLASSES = {
    crimson: {
        bg: 'bg-[#a10836]/20',
        border: 'border-[#a10836]/40',
        text: 'text-red-400',
        badge: 'bg-[#a10836] text-white',
        dot: 'bg-[#a10836]'
    },
    indigo: {
        bg: 'bg-indigo-500/20',
        border: 'border-indigo-500/40',
        text: 'text-indigo-300',
        badge: 'bg-indigo-600 text-white',
        dot: 'bg-indigo-500'
    },
    cyan: {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/40',
        text: 'text-cyan-300',
        badge: 'bg-cyan-600 text-white',
        dot: 'bg-cyan-400'
    },
    emerald: {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/40',
        text: 'text-emerald-300',
        badge: 'bg-emerald-600 text-white',
        dot: 'bg-emerald-400'
    },
    amber: {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/40',
        text: 'text-amber-300',
        badge: 'bg-amber-600 text-white',
        dot: 'bg-amber-400'
    },
    purple: {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/40',
        text: 'text-purple-300',
        badge: 'bg-purple-600 text-white',
        dot: 'bg-purple-400'
    },
    rose: {
        bg: 'bg-rose-500/20',
        border: 'border-rose-500/40',
        text: 'text-rose-300',
        badge: 'bg-rose-600 text-white',
        dot: 'bg-rose-400'
    }
};

/**
 * Normalizes raw event objects from useEventsQuery into CalendarEvent objects
 */
export function transformToCalendarEvents(rawEvents = []) {
    if (!Array.isArray(rawEvents)) return [];

    return rawEvents.map((event) => {
        let startDate = new Date();
        if (event.date) {
            const parsed = new Date(event.date);
            if (!isNaN(parsed.getTime())) {
                startDate = parsed;
            }
        } else if (event.start_time) {
            const parsed = parseISO(event.start_time);
            if (!isNaN(parsed.getTime())) {
                startDate = parsed;
            }
        }

        let endDate = addHours(startDate, 2);
        if (event.end_time) {
            const parsed = parseISO(event.end_time);
            if (!isNaN(parsed.getTime())) {
                endDate = parsed;
            }
        }

        const colorKey = CATEGORY_COLORS[event.category] || CATEGORY_COLORS['Default'];

        return {
            id: event.id,
            title: event.title || 'Untitled Event',
            description: event.description || '',
            start: startDate,
            end: endDate,
            location: event.location || 'TBD',
            organizer: event.organizer || 'Community Member',
            organizerAvatar: event.organizerAvatar,
            category: event.category || 'General',
            color: colorKey,
            isInterested: Boolean(event.isInterested),
            isAttending: Boolean(event.isAttending),
            attendeesCount: event.attendeesCount || 0,
            interestedCount: event.interestedCount || 0,
            image: event.image || event.cover_image_url,
            rawEvent: event
        };
    });
}
