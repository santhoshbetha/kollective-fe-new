import { useState, useEffect } from "react";

export function useCountry() {
    const [countryData, setCountryData] = useState({
        countryCode: 'US',
        countryName: 'Country',
        loading: true,
        error: null,
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchCountry() {
            try {
                const response = await fetch("https://ipapi.co/json/");
                if (!response.ok) {
                    throw new Error("Failed to fetch location data");
                }

                const data = await response.json();
                const resolved = {
                    countryCode: data.country_code || data.country || 'US',
                    countryName: data.country_name || 'Country',
                };

                if (isMounted) {
                    setCountryData({
                        countryCode: resolved.countryCode,
                        countryName: resolved.countryName,
                        loading: false,
                        error: null,
                    });
                }
            } catch (err) {
                const fallback = { countryCode: 'US', countryName: 'Country' };
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
