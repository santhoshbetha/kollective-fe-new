import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export const SystemConfigurationPanel = ({ onCommandStart, onCommandComplete }) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("user_token") || "";

    // 1️⃣ Fetch Active Flags Matrix from the new API route
    const { data: flags = [], isLoading } = useQuery({
        queryKey: ['admin', 'config', 'flags'],
        queryFn: async () => {
            const res = await apiFetch('/api/v1/admin/config/feature_flags');
            return res?.data || res || [];
        }
    });

    // 2️⃣ Mutation to dynamically toggle values over the network
    const toggleMutation = useMutation({
        mutationFn: async ({ key, enabled }) => {
            onCommandStart?.(`Toggling feature flag '${key.replace(/_/g, ' ')}' to ${enabled ? 'ACTIVE' : 'DISABLED'}...`);
            const res = await apiFetch('/api/v1/admin/config/feature_flags/toggle', {
                method: 'POST',
                body: JSON.stringify({ key, enabled })
            });
            return res;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'config', 'flags'] });
            const actionText = variables.enabled ? 'activated' : 'disabled';
            onCommandComplete?.({
                type: 'success',
                title: 'Command Executed Successfully',
                message: data?.message || `Feature flag '${variables.key.replace(/_/g, ' ')}' was successfully ${actionText}.`,
                target: variables.key
            });
        },
        onError: (err, variables) => {
            onCommandComplete?.({
                type: 'error',
                title: 'Command Execution Failed',
                message: err?.message || `Failed to toggle feature flag '${variables.key}'.`,
                target: variables.key
            });
        }
    });

    if (isLoading) return (
        <div className="py-16 text-center text-sm font-mono font-bold text-neutral-500 dark:text-neutral-400 opacity-70 select-none">
            Syncing config cache...
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200 text-left">
            {flags.map((flag) => (
                <div
                    key={flag.key}
                    className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl transition-all hover:border-primary-container/30"
                >
                    <div>
                        <h4 className="text-base sm:text-lg font-black font-mono text-neutral-900 dark:text-white tracking-tight mb-2 uppercase flex items-center gap-2">
                            <span>⚙️</span>
                            <span className="truncate">{flag.key.replace(/_/g, ' ')}</span>
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium mb-5">
                            {flag.description}
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-black/5 dark:border-white/10 pt-4 mt-2 select-none gap-3">
                        <span className={`text-[11px] font-black font-mono px-3 py-1 border rounded-lg uppercase tracking-wider ${flag.enabled
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400'
                            }`}>
                            {flag.enabled ? 'ACTIVE_OPERATIONAL' : 'SYSTEM_DISABLED'}
                        </span>
                        <button
                            type="button"
                            disabled={toggleMutation.isPending && toggleMutation.variables?.key === flag.key}
                            onClick={() => toggleMutation.mutate({ key: flag.key, enabled: !flag.enabled })}
                            className={`px-4 py-2 text-xs font-mono font-black border rounded-xl transition-all outline-none cursor-pointer active:scale-95 disabled:opacity-40 shrink-0 ${flag.enabled
                                ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20'
                                : 'bg-primary-container text-white border-primary-container hover:brightness-105 shadow-sm'
                                }`}
                        >
                            {flag.enabled ? 'Disable Flag' : 'Enable Flag'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
