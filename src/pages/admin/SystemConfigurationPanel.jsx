import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export const SystemConfigurationPanel = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("user_token") || "";

    // 1️⃣ Fetch Active Flags Matrix from the new API route
    const { data: flags = [], isLoading } = useQuery({
        queryKey: ['admin', 'config', 'flags'],
        queryFn: async () => {
            const res = await apiFetch('/api/v1/admin/config/feature_flags', {
                method: 'POST',
            });
            //  const res = await fetch('/api/v1/admin/config/feature_flags', {
            //      headers: { "Authorization": `Bearer ${token}` }
            //  });
            const json = await res.json();
            return json.data || [];
        }
    });

    // 2️⃣ Mutation to dynamically toggle values over the network
    const toggleMutation = useMutation({
        mutationFn: async ({ key, enabled }) => {
            const res = await apiFetch('/api/v1/admin/config/feature_flags/toggle', {
                method: 'POST',
                body: JSON.stringify({ key, enabled })
            });
            //   const res = await fetch('/api/v1/admin/config/feature_flags/toggle', {
            //      method: 'POST',
            //      headers: {
            //          'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //    },
            //      body: JSON.stringify({ key, enabled })
            //  });
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'config', 'flags'] });
        }
    });

    if (isLoading) return <div className="p-12 text-center text-xs font-mono opacity-50">Syncing config cache...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {flags.map((flag) => (
                <div key={flag.key} className="bg-white border border-neutral-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                    <div>
                        <h4 className="text-sm font-black font-mono text-neutral-900 tracking-tight mb-1 uppercase">
                            ⚙️ {flag.key.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-xs text-neutral-500 leading-relaxed font-medium mb-4">
                            {flag.description}
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-2 select-none">
                        <span className={`text-[10px] font-black font-mono px-2 py-0.5 border rounded uppercase ${flag.enabled
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                            }`}>
                            {flag.enabled ? 'ACTIVE_OPERATIONAL' : 'SYSTEM_DISABLED'}
                        </span>
                        <button
                            type="button"
                            onClick={() => toggleMutation.mutate({ key: flag.key, enabled: !flag.enabled })}
                            className={`px-4 py-1.5 text-xs font-mono font-black border rounded-xl transition-all outline-none cursor-pointer ${flag.enabled
                                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                                : 'bg-primary-container text-white border-primary-container hover:brightness-105'
                                }`}
                        >
                            {flag.enabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
