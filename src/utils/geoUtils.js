// src/utils/geoUtils.js
import countryStatesData from '../data/countryStates.json';

/**
 * Normalizes country identifier (code or name) to target country entry.
 * @param {string} countryIdentifier ISO code or full country name
 * @returns {object|null}
 */
const findCountryEntry = (countryIdentifier) => {
    if (!countryIdentifier) return countryStatesData['US'];

    const normalized = countryIdentifier.trim();
    
    // Direct code lookup (e.g., 'US', 'CA', 'IN')
    if (countryStatesData[normalized.toUpperCase()]) {
        return countryStatesData[normalized.toUpperCase()];
    }

    // Match by full country name (e.g. 'United States', 'Canada', 'India')
    const match = Object.values(countryStatesData).find(
        (entry) => entry.name.toLowerCase() === normalized.toLowerCase()
    );

    return match || countryStatesData['US'];
};

/**
 * Get states/provinces array for a given country code or name.
 * @param {string} countryIdentifier (e.g., 'US' or 'United States')
 * @returns {string[]}
 */
export const getStatesByCountry = (countryIdentifier) => {
    const country = findCountryEntry(countryIdentifier);
    return country?.states || [];
};

/**
 * Get available supported countries list with ISO codes and names.
 * @returns {{ code: string, name: string }[]}
 */
export const getSupportedCountries = () => {
    return Object.entries(countryStatesData).map(([code, data]) => ({
        code,
        name: data.name
    }));
};

/**
 * Calculates Great-Circle distance in statute miles between two coordinate pairs using Haversine formula.
 */
export function calculateDistanceMiles(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const nLat1 = parseFloat(lat1);
    const nLon1 = parseFloat(lon1);
    const nLat2 = parseFloat(lat2);
    const nLon2 = parseFloat(lon2);
    if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

    const R = 3958.8; // Earth radius in statute miles
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(nLat2 - nLat1);
    const dLon = toRad(nLon2 - nLon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(nLat1)) * Math.cos(toRad(nLat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 10) / 10;
}

/**
 * Extracts a normalized 2-letter state code from a business or proposal object.
 */
export function getItemState(item) {
    if (!item || typeof item !== 'object') return null;

    // 1. Direct state properties
    const direct = item.state || item.origin_state || item.location_state || (typeof item.location === 'object' ? item.location?.state : null);
    if (direct && typeof direct === 'string') {
        const trimmed = direct.trim().toUpperCase();
        if (trimmed.length === 2) return trimmed;
    }

    // 2. Parse address or location string
    const locStr = (typeof item.address === 'string' ? item.address : '') ||
        (typeof item.location === 'string' ? item.location : '') ||
        (item.city ? `${item.city}, ${item.state || ''}` : '');

    if (locStr) {
        // Regex for , XX or space XX
        const match = locStr.match(/(?:,\s*|\s+)([A-Z]{2})(?:\s+|$|,)/i);
        if (match && match[1]) {
            return match[1].toUpperCase();
        }
        // City fallbacks
        const lower = locStr.toLowerCase();
        if (lower.includes('san francisco') || lower.includes('oakland') || lower.includes('san jose') || lower.includes('los angeles') || lower.includes('san diego') || lower.includes('sacramento')) {
            return 'CA';
        }
        if (lower.includes('austin') || lower.includes('houston') || lower.includes('dallas')) {
            return 'TX';
        }
        if (lower.includes('brooklyn') || lower.includes('manhattan') || lower.includes('new york')) {
            return 'NY';
        }
    }

    return null;
}

/**
 * Checks whether an item belongs to the specified target state.
 */
export function isItemInState(item, targetState) {
    if (!targetState) return true;
    const target = String(targetState).trim().toUpperCase();
    const itemState = getItemState(item);

    if (itemState) {
        return itemState === target || (target.length > 2 && itemState === target.slice(0, 2));
    }

    const fullStr = `${item?.address || ''} ${item?.location || ''} ${item?.city || ''}`.toUpperCase();
    const stateRegex = new RegExp(`\\b${target}\\b`, 'i');
    return stateRegex.test(fullStr);
}

/**
 * Evaluates whether an item matches the active scope (either '100_miles' or 'state').
 */
export function isItemInScope(item, scopeMode = '100_miles', userState = '', maxMiles = 100, userCoords = null) {
    if (!item) return false;

    if (scopeMode === '100_miles') {
        if (typeof item.distanceMiles === 'number') {
            return item.distanceMiles <= maxMiles;
        }
        if (item.latitude && item.longitude && userCoords?.latitude && userCoords?.longitude) {
            const dist = calculateDistanceMiles(userCoords.latitude, userCoords.longitude, item.latitude, item.longitude);
            if (dist != null) return dist <= maxMiles;
        }
        // Fallback when distance isn't explicitly known: check if it belongs to user's state
        if (userState) {
            return isItemInState(item, userState);
        }
        return true;
    }

    if (scopeMode === 'state') {
        if (!userState) return true;
        return isItemInState(item, userState);
    }

    return true;
}

export default {
    getStatesByCountry,
    getSupportedCountries,
    calculateDistanceMiles,
    getItemState,
    isItemInState,
    isItemInScope
};

