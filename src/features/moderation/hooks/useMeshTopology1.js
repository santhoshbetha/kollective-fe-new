// src/features/moderation/hooks/useMeshTopology.js
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../api/apiClient';

export function useMeshTopology() {
    const [meshData, setMeshData] = useState({ cluster_size: 0, network_protocol: "N/A", nodes: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [networkError, setNetworkError] = useState(null);

    const fetchLiveClusterMetrics = useCallback(async (isSilentRefresh = false) => {
        if (!isSilentRefresh) setIsLoading(true);
        setNetworkError(null);
        try {
            const response = await apiFetch('/api/v1/admin/mesh/topology');
            if (response && response.data) {
                setMeshData(response.data);
            } else if (response && response.nodes) {
                setMeshData(response);
            }
        } catch (err) {
            console.error("Failed to fetch Erlang distribution topology metrics:", err);
            setNetworkError(err?.message || "Failed to resolve live mesh topology vectors.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Run initial data compilation pass on mount
        fetchLiveClusterMetrics(false);

        // 🔄 AUTOMATED REAL-TIME RESYNC RECOVERY LOOP
        // Polls the server cluster nodes every 10 seconds to detect network changes instantly
        const telemetryInterval = setInterval(() => {
            fetchLiveClusterMetrics(true);
        }, 10000);

        return () => clearInterval(telemetryInterval);
    }, [fetchLiveClusterMetrics]);

    return {
        meshData,
        isLoading,
        networkError,
        refreshTopology: () => fetchLiveClusterMetrics(false)
    };
}
