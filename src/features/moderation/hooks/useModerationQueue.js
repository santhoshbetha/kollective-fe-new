// src/features/moderation/hooks/useModerationQueue.js
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../api/apiClient';

export function useModerationQueue() {
    const [leasedIncidents, setLeasedIncidents] = useState([]);
    const [activeIncident, setActiveIncident] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionPending, setActionPending] = useState(false);
    const [queueError, setQueueError] = useState(null);

    // 📡 1. THE WORK-STEALING ATOMIC LEASE TRIGGER
    const fetchAndLeaseNextTicket = useCallback(async () => {
        setIsLoading(true);
        setQueueError(null);
        try {
            // Hits your MnesiaQueueEngine / QueueEngine backend allocation router directly
            const response = await apiFetch('/api/v1/admin/incidents/lease_next', {
                method: 'POST'
            });

            const freshTicket = response?.data || response;

            if (freshTicket && freshTicket.id) {
                setLeasedIncidents(prev => {
                    if (prev.some(t => t.id === freshTicket.id)) return prev;
                    return [...prev, freshTicket];
                });
                setActiveIncident(freshTicket);
            } else {
                setQueueError("empty_queue_all_clear");
            }
        } catch (err) {
            console.error("Failed to execute atomic workspace lease transaction:", err);
            setQueueError(err?.message || "Failed to steal next available queue ticket.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 🚀 2. PROCESS ADJUDICATION TRANSACTION OVERRIDES
    const resolveLeasedIncident = useCallback(async (incidentId, actionType) => {
        if (!incidentId) return;
        setActionPending(true);
        try {
            await apiFetch(`/api/v1/admin/incidents/${incidentId}/resolve`, {
                method: 'POST',
                body: JSON.stringify({ action: actionType })
            });

            // Evict ticket from local view variables loop state upon successful resolution
            setLeasedIncidents(prev => prev.filter(t => t.id !== incidentId));
            setActiveIncident(null);

            // Automatically queue up and steal the next item to keep operational speeds high
            fetchAndLeaseNextTicket();
        } catch (err) {
            console.error("Adjudication command failed:", err);
        } finally {
            setActionPending(false);
        }
    }, [fetchAndLeaseNextTicket]);

    return {
        leasedIncidents,
        activeIncident,
        setActiveIncident,
        isLoading,
        actionPending,
        queueError,
        fetchAndLeaseNextTicket,
        resolveLeasedIncident
    };
}
