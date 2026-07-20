// src/features/campaigns/civicLookup.js
import { apiFetch } from '../../api/apiClient';

/**
 * 🗺️ Translates a user's address into structured Open Civic Data identifiers.
 * Targets the free public Google Civic Endpoint.
 */
export async function fetchLocalBallotScope(userAddressString) {
    const API_KEY = "YOUR_FREE_GOOGLE_CIVIC_API_KEY";
    const url = `https://googleapis.com{encodeURIComponent(userAddressString)}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return { error: "Civic lookup timeout" };
        const data = await response.json();

        // 🔬 THE SANITIZATION MATRIX:
        // Extract the raw OCD (Open Civic Data) division keys into clean array signatures
        const divisions = Object.keys(data.divisions || {});

        return {
            // e.g., returns "ocd-division/country:us/state:tx/place:austin"
            cityDivisionCode: divisions.find(d => d.includes('/place:')) || null,
            // e.g., returns "ocd-division/country:us/state:tx/county:travis"
            countyDivisionCode: divisions.find(d => d.includes('/county:')) || null,
            rawDivisions: divisions
        };
    } catch (error) {
        console.error("Civic API infrastructure exception:", error);
        return { error };
    }
}
