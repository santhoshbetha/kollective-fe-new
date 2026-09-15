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

export default {
    getStatesByCountry,
    getSupportedCountries
};
