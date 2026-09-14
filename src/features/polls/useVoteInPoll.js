// src/features/polls/useVoteInPoll.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function useVoteInPoll() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ pollId, optionId }) => {
            return apiFetch(`/polls/${pollId}/vote`, {
                method: 'POST',
                body: JSON.stringify({ option_id: optionId }),
            });
        },

        // ⚡ THE OPTIMISTIC UI LAYER (No Immer Needed)
        onMutate: async ({ pollId, optionId }) => {
            const queryKey = ['polls', 'stream'];
            await queryClient.cancelQueries({ queryKey });

            const previousPolls = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) return oldData;

                const updatePollItem = (poll) => {
                    if (poll.id === pollId) {
                        return {
                            ...poll,
                            voted: true,
                            userSelectedOptionId: optionId,
                            totalVotes: (poll.totalVotes || 0) + 1,
                            options: (poll.options || []).map((opt) =>
                                opt.id === optionId
                                    ? { ...opt, votesCount: (opt.votesCount || 0) + 1 }
                                    : opt
                            ),
                        };
                    }
                    return poll;
                };

                if (oldData.pages) {
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => {
                            if (Array.isArray(page)) {
                                return page.map(updatePollItem);
                            }
                            return {
                                ...page,
                                polls: (page?.polls || []).map(updatePollItem),
                            };
                        }),
                    };
                }

                if (Array.isArray(oldData)) {
                    return oldData.map(updatePollItem);
                }

                return oldData;
            });

            return { previousPolls, queryKey };
        },

        onError: (err, variables, context) => {
            console.error('Vote failed, rolling back UI:', err);
            if (context?.previousPolls) {
                queryClient.setQueryData(context.queryKey, context.previousPolls);
            }
        },

        onSettled: (data, error, variables, context) => {
            if (context?.queryKey) {
                queryClient.invalidateQueries({ queryKey: context.queryKey });
            }
        },
    });
}
