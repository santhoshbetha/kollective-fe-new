import { useState, useEffect } from "react";

export function useCountry() {
    const [countryData, setCountryData] = useState({
        countryCode: null, // e.g., "US"
        countryName: null, // e.g., "United States"
        loading: true,
        error: null,
    });

    useEffect(() => {
        let isMounted = true; // Prevents state updates on unmounted components

        async function fetchCountry() {
            try {
                // Using ipapi.co (Free tier, no API key required for low volume)
                const response = await fetch("https://ipapi.co");
                if (!response.ok) {
                    throw new Error("Failed to fetch location data");
                }

                const data = await response.json();

                if (isMounted) {
                    setCountryData({
                        countryCode: data.country,      // e.g., "US"
                        countryName: data.country_name, // e.g., "United States"
                        loading: false,
                        error: null,
                    });
                }
            } catch (err) {
                if (isMounted) {
                    setCountryData({
                        countryCode: null,
                        countryName: null,
                        loading: false,
                        error: err.message,
                    });
                }
            }
        }

        fetchCountry();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);

    return countryData;
}
