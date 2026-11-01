import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { VolumeX, Loader2 } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { UserAvatar } from '../../components/accounts/UserAvatar';

export function MutedProfilesForm() {
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const [mutedUsers, setMutedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingIds, setPendingIds] = useState({});

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const fetchMutedProfiles = async () => {
            setIsLoading(true);
            try {
                const response = await apiFetch('/api/v1/privacy/mutes', {
                    method: 'GET',
                    signal: controller.signal
                });

                if (!isMounted) return;

                const list = Array.isArray(response)
                    ? response
                    : (response?.muted_users || response?.data || []);

                setMutedUsers(Array.isArray(list) ? list : []);
            } catch (err) {
                if (err?.name === 'AbortError' || controller.signal.aborted) return;
                if (isMounted) {
                    setMutedUsers([]);
                }
            } finally {
                if (isMounted && !controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchMutedProfiles();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [activeAccount?.id]);

    const handleUnmute = async (targetUser) => {
        if (!targetUser?.id) return;
        const userId = String(targetUser.id);
        const resolvedHandle = targetUser.handle || (targetUser.username ? `@${targetUser.username}` : targetUser.name || 'user');

        setPendingIds((prev) => ({ ...prev, [userId]: true }));

        try {
            await apiFetch(`/api/v1/privacy/mutes/${encodeURIComponent(userId)}`, {
                method: 'DELETE'
            });
            setMutedUsers((prev) => prev.filter((u) => String(u.id) !== userId));
            toast.success(`Unmuted ${resolvedHandle}.`);
        } catch (err) {
            toast.error(err?.message || `Failed to unmute ${resolvedHandle}.`);
        } finally {
            setPendingIds((prev) => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200 text-left font-sans">
            <div className="border-b border-white/5 pb-4 select-none">
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Muted Profiles</h2>
                <p className="text-md text-text-secondary mt-0.5 font-medium">
                    Manage muted feeds and hidden response cards across your timeline
                </p>
            </div>

            {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-text-secondary gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                    <span className="text-xs font-mono uppercase tracking-wider">Loading muted profiles...</span>
                </div>
            ) : mutedUsers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#181818] border border-white/5 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary">
                        <VolumeX className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-text-primary">No muted profiles</h3>
                        <p className="text-xs text-text-secondary mt-1 max-w-sm">
                            Accounts you mute will appear here. Their posts are hidden from your timelines without notifying them.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-white/5 bg-[#181818] border border-white/10 rounded-2xl overflow-hidden">
                    {mutedUsers.map((user) => {
                        const userId = String(user.id);
                        const displayName = user.name || user.display_name || user.username || 'Unknown User';
                        const handle = user.handle || (user.username ? `@${user.username}` : '@user');
                        const isPending = Boolean(pendingIds[userId]);

                        return (
                            <div
                                key={userId}
                                data-testid={`muted-user-${userId}`}
                                className="muted-user-row flex items-center justify-between gap-4 p-4 hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <UserAvatar
                                        user={user}
                                        className="w-11 h-11 rounded-full shrink-0"
                                        showStatus={false}
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-sm text-text-primary truncate">
                                            {displayName}
                                        </span>
                                        <span className="text-xs font-mono text-text-secondary truncate">
                                            {handle}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleUnmute(user)}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 disabled:opacity-50"
                                >
                                    {isPending ? 'Unmuting...' : 'Unmute'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MutedProfilesForm;

