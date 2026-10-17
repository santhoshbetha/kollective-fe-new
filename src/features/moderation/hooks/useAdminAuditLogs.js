// src/features/moderation/hooks/useAdminAuditLogs.js
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../api/apiClient';

export function useAdminAuditLogs() {
    const [logs, setLogs] = useState([]);
    const [currentNode, setCurrentNode] = useState("Unknown Node");
    const [selectedAction, setSelectedAction] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAuditTrail = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const queryUrl = selectedAction
                ? `/api/v1/admin/audit_logs?action=${selectedAction}`
                : '/api/v1/admin/audit_logs';

            const response = await apiFetch(queryUrl);
            if (response && response.data) {
                setLogs(response.data.logs || []);
                setCurrentNode(response.data.node_name || "Unknown Node");
            }
        } catch (err) {
            console.error("Failed to fetch sovereign audit log trail:", err);
            setError(err?.message || "Failed to resolve administrative audit records.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedAction]);

    useEffect(() => {
        fetchAuditTrail();
    }, [fetchAuditTrail]);

    return {
        logs,
        currentNode,
        selectedAction,
        setSelectedAction,
        isLoading,
        error,
        refreshLogs: fetchAuditTrail
    };
}
