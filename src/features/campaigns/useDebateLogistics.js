// src/features/campaigns/useDebateLogistics.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

/**
 * 📡 1. QUERY: Streams upcoming debate events and connected volunteer shift registries
 * Targets: GET /api/v1/campaigns/debates?level=congress&code=TX-10
 */
export function useDebateEventsQuery(officeLevel, districtCode) {
    return useQuery({
        queryKey: ['campaigns', 'debates', officeLevel, districtCode],
        queryFn: async () => {
            const endpoint = `/api/v1/campaigns/debates?level=${officeLevel}&code=${encodeURIComponent(districtCode)}`;
            return apiFetch(endpoint); // Returns an array list of debate events with populated shift matrices
        },
        enabled: !!officeLevel && !!districtCode,
    });
}

/**
 * 🎛️ 2. MUTATION: Claims a structural logistics task slot
 * Optimistically appends the active user name to the localized screen view loop
 */
export function useClaimShiftMutation(officeLevel, districtCode, currentUser) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (shiftId) => {
            return apiFetch(`/api/v1/campaigns/debates/shifts/${shiftId}/claim`, {
                method: 'POST',
            });
        },
        onMutate: async (shiftId) => {
            const cacheKey = ['campaigns', 'debates', officeLevel, districtCode];

            // Cancel outbound requests to shield our temporary local cache mapping
            await queryClient.cancelQueries({ queryKey: cacheKey });
            const previousSnapshot = queryClient.getQueryData(cacheKey);

            // Pre-render the volunteer shift inclusion instantly at 60fps
            queryClient.setQueryData(cacheKey, (oldEvents) => {
                if (!oldEvents) return [];
                return oldEvents.map((event) => ({
                    ...event,
                    shifts: event.shifts.map((shift) => {
                        if (shift.id === shiftId) {
                            const alreadyClaimed = shift.volunteers.some(v => v.id === currentUser?.id);
                            if (alreadyClaimed || shift.volunteers.length >= shift.max_volunteers) return shift;

                            return {
                                ...shift,
                                volunteers: [...shift.volunteers, { id: currentUser?.id, username: currentUser?.username || 'You' }]
                            };
                        }
                        return shift;
                    })
                }));
            });

            return { previousSnapshot, cacheKey };
        },
        onError: (err, variables, context) => {
            // Revert cache loop to server snapshot states on pipeline failures
            if (context?.previousSnapshot) {
                queryClient.setQueryData(context.cacheKey, context.previousSnapshot);
            }
        },
        onSettled: (data, err, variables, context) => {
            queryClient.invalidateQueries({ queryKey: context.cacheKey });
        },
    });
}
