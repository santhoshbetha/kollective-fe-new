// src/features/moderation/hooks/useMeshTopology.js
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../api/apiClient';

export function useMeshTopology() {
    const [meshData, setMeshData] = useState({ cluster_size: 0, network_protocol: "N/A", nodes: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isRecovering, setIsRecovering] = useState(false);
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

    // 🚀 THE FORCE PARTITION RECOVERY ACTION HANDLER
    const triggerForcePartitionRecovery = useCallback(async (targetNodeName) => {
        if (!targetNodeName || isRecovering) return;

        setIsRecovering(true);
        setNetworkError(null);
        try {
            await apiFetch('/api/v1/admin/mesh/force_recovery', {
                method: 'POST',
                body: JSON.stringify({ node_name: targetNodeName })
            });

            // Re-fetch the live topology map once the backend cluster healing protocol completes
            await fetchLiveClusterMetrics(false);
        } catch (err) {
            console.error("Critical infrastructure partition recovery rejected:", err);
            setNetworkError(err?.message || "Failed to force network partition recovery.");
        } finally {
            setIsRecovering(false);
        }
    }, [isRecovering, fetchLiveClusterMetrics]);

    useEffect(() => {
        fetchLiveClusterMetrics(false);

        const telemetryInterval = setInterval(() => {
            fetchLiveClusterMetrics(true);
        }, 10000);

        return () => clearInterval(telemetryInterval);
    }, [fetchLiveClusterMetrics]);

    return {
        meshData,
        isLoading,
        isRecovering,
        networkError,
        refreshTopology: () => fetchLiveClusterMetrics(false),
        triggerForcePartitionRecovery
    };
}
