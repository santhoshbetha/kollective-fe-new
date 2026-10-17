// src/features/moderation/hooks/useObanTelemetry.js
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../api/apiClient';

export function useObanTelemetry() {
    const [telemetry, setTelemetry] = useState({
        summary: { executing: 0, completed: 0, retryable: 0, discarded: 0 },
        recent_failures: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchObanMetrics = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        setError(null);
        try {
            const response = await apiFetch('/api/v1/admin/telemetry/oban');
            if (response && response.data) {
                setTelemetry(response.data);
            }
        } catch (err) {
            console.error("Failed to gather Oban engine telemetry loops:", err);
            setError(err?.message || "Failed to resolve background worker metrics.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchObanMetrics(false);

        const pollingLoop = setInterval(() => {
            fetchObanMetrics(true);
        }, 5000);

        return () => clearInterval(pollingLoop);
    }, [fetchObanMetrics]);

    return { telemetry, isLoading, error, refetch: () => fetchObanMetrics(false) };
}
