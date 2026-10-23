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
        const name = organizer.display_name || organizer.name || organizer.username || organizer.handle;
        if (typeof name === 'string' && name.trim() !== '') return name;
    }
    return 'Organizer';
}

export const US_STATES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'DC': 'District of Columbia'
};

export const MAJOR_CITIES_STATE = {
    'san francisco': 'CA',
    'los angeles': 'CA',
    'san diego': 'CA',
    'san jose': 'CA',
    'sacramento': 'CA',
    'oakland': 'CA',
    'fresno': 'CA',
    'long beach': 'CA',
    'austin': 'TX',
    'houston': 'TX',
    'dallas': 'TX',
    'san antonio': 'TX',
    'fort worth': 'TX',
    'el paso': 'TX',
    'new york': 'NY',
    'brooklyn': 'NY',
    'manhattan': 'NY',
    'queens': 'NY',
    'bronx': 'NY',
    'buffalo': 'NY',
    'albany': 'NY',
    'chicago': 'IL',
    'seattle': 'WA',
    'denver': 'CO',
    'miami': 'FL',
    'orlando': 'FL',
    'tampa': 'FL',
    'atlanta': 'GA',
    'boston': 'MA',
    'portland': 'OR',
    'philadelphia': 'PA',
    'pittsburgh': 'PA',
    'phoenix': 'AZ',
    'las vegas': 'NV',
    'detroit': 'MI',
    'minneapolis': 'MN',
    'washington dc': 'DC',
    'washington, d.c.': 'DC',
};

/**
 * Normalizes any state string ('CA', 'California', 'ca') to { code, name }.
 */
export function normalizeState(stateInput) {
    if (!stateInput || typeof stateInput !== 'string') return null;
    const clean = stateInput.trim().toUpperCase();
    if (US_STATES[clean]) {
        return { code: clean, name: US_STATES[clean] };
    }
    const cleanLower = stateInput.trim().toLowerCase();
    for (const [code, name] of Object.entries(US_STATES)) {
        if (name.toLowerCase() === cleanLower) {
            return { code, name };
        }
    }
    return { code: clean, name: stateInput.trim() };
}

/**
 * Extracts a 2-letter state code from an event object or its location string.
 */
export function getEventState(event) {
    if (!event || typeof event !== 'object') return null;

    // 1. Direct state properties
    const directState = event.state || event.origin_state || event.location_state || event.locationObj?.state || (typeof event.location === 'object' ? event.location?.state : null);
    if (directState && typeof directState === 'string' && directState.trim()) {
        const norm = normalizeState(directState);
        if (norm) return norm.code;
    }

    // 2. Check location string
    const locStr = getDisplayLocation(event.location, event);
    if (locStr && typeof locStr === 'string') {
        for (const [code, name] of Object.entries(US_STATES)) {
            const codePattern = new RegExp(`(?:,\\s*|\\s+)${code}(?:\\s+|$|,)`, 'i');
            const namePattern = new RegExp(`\\b${name}\\b`, 'i');
            if (codePattern.test(locStr) || namePattern.test(locStr)) {
                return code;
            }
        }

        const locLower = locStr.toLowerCase();
        for (const [city, code] of Object.entries(MAJOR_CITIES_STATE)) {
            if (locLower.includes(city)) {
                return code;
            }
        }
    }

    return null;
}

/**
 * Validates whether an event belongs strictly to the target state.
 */
export function isEventInState(event, targetStateInput) {
    if (!targetStateInput) return true;
    const target = normalizeState(targetStateInput);
    if (!target) return true;

    const detectedCode = getEventState(event);
    if (detectedCode) {
        return detectedCode.toUpperCase() === target.code.toUpperCase();
    }

    const locStr = getDisplayLocation(event?.location, event) || '';
    const codeRegex = new RegExp(`\\b${target.code}\\b`, 'i');
    const nameRegex = new RegExp(`\\b${target.name}\\b`, 'i');
    if (codeRegex.test(locStr) || nameRegex.test(locStr)) {
        return true;
    }

    return false;
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
    const stateCode = getEventState(evt);

    return {
        ...evt,
        locationObj: typeof evt.location === 'object' ? evt.location : null,
        location: locationStr,
        state: evt.state || stateCode || null,
        origin_state: evt.origin_state || stateCode || null,
        organizerObj: typeof evt.organizer === 'object' ? evt.organizer : null,
        organizerName: organizerName,
        organizerAvatar: organizerAvatar,
    };
}
