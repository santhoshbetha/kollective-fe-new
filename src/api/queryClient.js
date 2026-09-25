import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Centered TanStack Query configuration instance with global toast error handling.
 * Exposing this globally allows non-React files (like Zustand stores or fetch interceptors)
 * to interact with, invalidate, or completely flush the network cache natively.
 */
const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error, query) => {
            // Opt-out mechanism: only show global toast if not explicitly disabled in query meta
            if (query.meta?.silent) return;

            toast.error(`Query Failed: ${error.message || 'Something went wrong'}`);
        },
    }),
    mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
            // Opt-out mechanism for mutations
            if (mutation.meta?.silent) return;

            toast.error(`Action Failed: ${error.message || 'Failed to update'}`);
        },
    }),
    defaultOptions: {
        queries: {
            // Disable automatic background fetching when shifting browser windows/tabs
            refetchOnWindowFocus: false,

            // Retry failed requests exactly once before throwing an actionable error
            retry: 1,

            // Considers data fresh for 5 minutes: instant navigation without redundant backend network calls
            staleTime: 1000 * 60 * 5, // 5 minutes

            // Keeps deleted or unused query indexes in memory for 10 minutes before garbage disposal
            gcTime: 1000 * 60 * 10, // 10 minutes
        },
    },
});

export { queryClient };
export default queryClient;

