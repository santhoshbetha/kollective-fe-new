// src/features/admin/useAdminFeature.js
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

// 📡 Infinite Query: Streams open registrations requiring moderator verification clearance
export function useAdminApprovalQuery() {
    return useInfiniteQuery({
        queryKey: ['admin', 'approvals'],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `?max_id=${pageParam}` : '';
            return apiFetch(`/api/v1/admin/accounts/approvals${maxIdParam}`);
        },
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
    });
}

// 📡 Infinite Query: Streams citizen-reported abuse tickets and payload profiles
export function useAdminReportsQuery() {
    return useInfiniteQuery({
        queryKey: ['admin', 'reports'],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `?max_id=${pageParam}` : '';
            return apiFetch(`/api/v1/admin/reports${maxIdParam}`);
        },
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
    });
}

// 📡 Infinite Query: Streams the continuous append-only immutable audit trail record logs
export function useAdminLogQuery() {
    return useInfiniteQuery({
        queryKey: ['admin', 'logs'],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `?max_id=${pageParam}` : '';
            return apiFetch(`/api/v1/admin/action_logs${maxIdParam}`);
        },
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
    });
}

// 📡 Infinite Query: Streams the master list of registered node identities
export function useAdminUsersQuery(searchQuery = '') {
    return useInfiniteQuery({
        queryKey: ['admin', 'users', searchQuery],
        queryFn: async ({ pageParam = null }) => {
            const maxIdParam = pageParam ? `&max_id=${pageParam}` : '';
            const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
            return apiFetch(`/api/v1/admin/accounts?limit=20${queryParam}${maxIdParam}`);
        },
        getNextPageParam: (lastPage) => lastPage.nextPageId ?? null,
        initialPageParam: null,
    });
}

// 📡 Infinite Query: Streams the editable collective bylaws and server guidelines list
export function useAdminRulesQuery() {
    return useInfiniteQuery({
        queryKey: ['admin', 'rules'],
        queryFn: async () => {
            return apiFetch('/api/v1/admin/rules');
        },
        initialPageParam: null,
    });
}

// 🎛️ Unified Action Mutation Matrix Switchboard
export function useAdminActionMutation(scopeKey) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, action, payload }) => {
            const method = action === 'delete' ? 'DELETE' : 'POST';
            const endpoint = matchAdminEndpoint(id, action);
            return apiFetch(endpoint, { method, body: payload ? JSON.stringify(payload) : undefined });
        },
        onSuccess: () => {
            // Flush matching query pools concurrently to force immediate interface synchronization
            queryClient.invalidateQueries({ queryKey: ['admin', scopeKey] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] }); // Keep log history fresh
        }
    });
}

function matchAdminEndpoint(id, action) {
    switch (action) {
        case 'approve': return `/api/v1/admin/accounts/${id}/approve`;
        case 'reject': return `/api/v1/admin/accounts/${id}/reject`;
        case 'resolve_report': return `/api/v1/admin/reports/${id}/resolve`;
        case 'create_rule': return `/api/v1/admin/rules`;
        case 'delete_rule': return `/api/v1/admin/rules/${id}`;
        case 'suspend_user': return `/api/v1/admin/accounts/${id}/suspend`;
        default: return `/api/v1/admin/accounts/${id}/unsuspend`;
    }
}
