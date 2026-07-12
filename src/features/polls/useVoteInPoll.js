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

                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        polls: page.polls.map((poll) => {
                            if (poll.id === pollId) {
                                return {
                                    ...poll,
                                    voted: true,
                                    userSelectedOptionId: optionId,
                                    totalVotes: poll.totalVotes + 1,
                                    options: poll.options.map((opt) =>
                                        opt.id === optionId
                                            ? { ...opt, votesCount: opt.votesCount + 1 }
                                            : opt
                                    ),
                                };
                            }
                            return poll;
                        }),
                    })),
                };
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
            queryClient.invalidateQueries({ queryKey: context.queryKey });
        },
    });
}
