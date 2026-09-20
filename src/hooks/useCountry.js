import { useState, useEffect } from "react";

// Module-level in-memory cache to survive component unmount/remount across page navigations
let memoryCountryCache = null;

try {
    const saved = sessionStorage.getItem('kollective_detected_country');
    if (saved) {
        memoryCountryCache = JSON.parse(saved);
    }
} catch (e) {
    // Ignore storage errors
}

export function useCountry() {
    const [countryData, setCountryData] = useState(() => {
        if (memoryCountryCache) {
            return {
                countryCode: memoryCountryCache.countryCode,
                countryName: memoryCountryCache.countryName,
                loading: false,
                error: null,
            };
        }
        return {
            countryCode: 'US',
            countryName: 'United States',
            loading: true,
            error: null,
        };
    });

    useEffect(() => {
        let isMounted = true;

        if (memoryCountryCache) {
            return;
        }

        async function fetchCountry() {
            try {
                const response = await fetch("https://ipapi.co/json/");
                if (!response.ok) {
                    throw new Error("Failed to fetch location data");
                }

                const data = await response.json();
                const resolved = {
                    countryCode: data.country_code || data.country || 'US',
                    countryName: data.country_name || 'United States',
                };

                memoryCountryCache = resolved;
                try {
                    sessionStorage.setItem('kollective_detected_country', JSON.stringify(resolved));
                } catch (e) {}

                if (isMounted) {
                    setCountryData({
                        countryCode: resolved.countryCode,
                        countryName: resolved.countryName,
                        loading: false,
                        error: null,
                    });
                }
            } catch (err) {
                const fallback = { countryCode: 'US', countryName: 'United States' };
                memoryCountryCache = fallback;
                if (isMounted) {
                    setCountryData({
                        countryCode: fallback.countryCode,
                        countryName: fallback.countryName,
                        loading: false,
                        error: err.message,
                    });
                }
            }
        }

        fetchCountry();

        return () => {
            isMounted = false;
        };
    }, []);

    return countryData;
}

