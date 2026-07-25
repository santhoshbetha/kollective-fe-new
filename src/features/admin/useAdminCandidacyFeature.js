// src/features/admin/useAdminCandidacyFeature.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

/**
 * 📡 QUERY: Streams a list of pending applications currently under jury/vanguard review
 * Targets: GET /api/v1/admin/candidacy_applications?status=under_jury_review
 */
export function usePendingApplicationsQuery(filterStatus = 'under_jury_review') {
    return useQuery({
        queryKey: ['admin', 'candidacy-applications', filterStatus],
        queryFn: async () => {
            return apiFetch(`/api/v1/admin/candidacy_applications?status=${filterStatus}`);
        }
    });
}

/**
 * 🎛️ MUTATION: Commits an administrative verdict (Approve or Reject)
 * Triggers atomic user schema parameter updates concurrently upon success [A]
 */
export function useProcessCandidacyMutation(filterStatus) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, action }) => {
            // action === 'approve' calls the endpoint built in previous controller sprints
            const endpoint = action === 'approve'
                ? `/api/v1/campaigns/apply/approve?id=${id}`
                : `/api/v1/campaigns/apply/reject?id=${id}`;

            return apiFetch(endpoint, { method: 'POST' });
        },
        onSuccess: () => {
            // Invalidate the admin query queues concurrently to sync the table feed at 60fps [A]
            queryClient.invalidateQueries({ queryKey: ['admin', 'candidacy-applications', filterStatus] });
            queryClient.invalidateQueries({ queryKey: ['campaigns', 'my-application'] });
        }
    });
}


