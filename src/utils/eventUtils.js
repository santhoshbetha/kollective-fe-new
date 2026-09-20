// src/utils/eventUtils.js

/**
 * Safely extracts a displayable location string from an event or location entity.
 * Handles string locations, object locations ({name, city, address, state, etc.}), and event fallbacks.
 */
export function getDisplayLocation(location, event) {
    if (typeof location === 'string' && location.trim() !== '') {
        return location;
    }
    if (event?.location_string && typeof event.location_string === 'string') {
        return event.location_string;
    }
    if (event?.location_name && typeof event.location_name === 'string') {
        return event.location_name;
    }

    if (location && typeof location === 'object') {
        const parts = [
            location.name || location.address,
            location.city,
            location.state
        ].filter(Boolean);

        if (parts.length > 0) {
            return parts.join(', ');
        }
        if (location.country) {
            return location.country;
        }
    }

    return 'Location TBA';
}

/**
 * Safely extracts a displayable organizer name from an organizer entity (string or object).
 */
export function getOrganizerName(organizer) {
    if (!organizer) return 'Organizer';
    if (typeof organizer === 'string') return organizer;
    if (typeof organizer === 'object') {
        return organizer.username || organizer.name || organizer.display_name || 'Organizer';
    }
    return String(organizer);
}

/**
 * Normalizes an event record so event.location and event.organizer logic are safe for React rendering & searching.
 */
export function normalizeEvent(evt) {
    if (!evt || typeof evt !== 'object') return evt;

    const locationStr = getDisplayLocation(evt.location, evt);
    const organizerName = getOrganizerName(evt.organizer);
    const organizerAvatar = typeof evt.organizer === 'object'
        ? (evt.organizer?.avatar_url || evt.organizer?.avatar || evt.organizerAvatar)
        : evt.organizerAvatar;

    return {
        ...evt,
        locationObj: typeof evt.location === 'object' ? evt.location : null,
        location: locationStr,
        organizerObj: typeof evt.organizer === 'object' ? evt.organizer : null,
        organizerName: organizerName,
        organizerAvatar: organizerAvatar,
    };
}
