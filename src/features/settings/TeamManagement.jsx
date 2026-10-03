// src/features/settings/TeamManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InviteContributorForm from './InviteContributorForm';
import { Users, ShieldAlert, RefreshCw, UserCheck, Shield, Trash2, CheckCircle2, MailOpen } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to match your local utility helper directory path

export default function TeamManagement({ activeOrgId, userRole }) {
    const [activeMembers, setActiveMembers] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionStatus, setActionStatus] = useState({ type: null, text: '', id: null });
    const [removeConfirmId, setRemoveConfirmId] = useState(null);

    // Normalize and track workspace profile authorization rankings
    const roleNorm = (userRole || '').toLowerCase();
    const canManageTeam = ['owner', 'admin', 'lead organizer', 'manager'].includes(roleNorm);
    const fetchTeamData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch active workspace members
            const membersRes = await api.get('/org-settings/members');
            setActiveMembers(membersRes.data?.data || membersRes.data || []);

            // 2. Fetch pending invites if user holds management permissions
            if (canManageTeam) {
                const invitesRes = await api.get('/org-settings/pending-invites');
                setPendingInvites(invitesRes.data?.data || invitesRes.data || []);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to load team data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeOrgId) {
            fetchTeamData();
        }
    }, [activeOrgId, userRole, canManageTeam]);

    const handleInviteSuccess = (newPendingMembership) => {
        if (newPendingMembership) {
            setPendingInvites((prev) => [newPendingMembership, ...prev]);
        }
    };

    const handleRemoveMemberExecute = async (userId) => {
        try {
            setActionStatus({ type: null, text: '', id: null });
            await api.delete(`/org-settings/members/${userId}`);

            setActionStatus({ type: 'success', text: 'Access revoked successfully.', id: userId });
            setActiveMembers((prev) => prev.filter((m) => m.user?.id !== userId));
            setRemoveConfirmId(null);
            setTimeout(() => setActionStatus({ type: null, text: '', id: null }), 4000);
        } catch (err) {
            setActionStatus({
                type: 'error',
                text: err.response?.data?.error || err.message || 'Failed to remove member.',
                id: userId
            });
        }
    };
    if (loading) {
        return (
            <div className="p-12 text-center text-text-secondary max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 font-sans">
                <RefreshCw className="w-7 h-7 text-primary-container animate-spin" />
                <p className="text-sm font-bold uppercase tracking-wider animate-pulse">Syncing workspace roster...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl flex items-center gap-2.5 max-w-4xl mx-auto animate-in slide-in-from-top-2 duration-150 font-sans">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Error: {error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 text-left font-sans animate-in fade-in duration-200 w-full">
            {/* Expanded Header Layout */}
            <div className="border-b dark:border-white/5 border-black/5 pb-4 select-none">
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Team Management</h2>
                <p className="text-lg text-text-secondary mt-0.5 font-medium">Manage writing, publication, and moderation permissions within this organization.</p>
            </div>

            {canManageTeam && (
                <InviteContributorForm onInviteSuccess={handleInviteSuccess} />
            )}
            {/* Active Members Grid Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between select-none">
                    <h3 className="text-md font-black text-text-secondary uppercase tracking-widest font-mono">
                        Active Roster ({activeMembers.length})
                    </h3>
                </div>

                <div className="bg-surface-container-low border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <ul className="divide-y dark:divide-white/5 divide-black/5">
                        {activeMembers.length === 0 ? (
                            <li className="p-12 text-center text-sm font-medium text-text-secondary/50 italic flex flex-col items-center justify-center gap-2 select-none">
                                <Users className="w-8 h-8 opacity-40 mb-1" />
                                <span>No active members found on the workspace hub.</span>
                            </li>
                        ) : (
                            activeMembers.map((member) => {
                                const isUserOwner = member.role?.toLowerCase() === 'owner';
                                const isSelf = member.role?.toLowerCase() === roleNorm;
                                const isConfirming = removeConfirmId === member.user?.id;
                                const cellHasStatus = actionStatus.id === member.user?.id;

                                return (
                                    <li key={member.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.005] transition-all duration-150">
                                        <div className="flex items-center gap-4 min-w-0">
                                            {/* Upscaled Initials Profile Avatars */}
                                            <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container font-black flex items-center justify-center text-base uppercase border border-primary-container/20 shrink-0 select-none shadow-inner">
                                                {member.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="min-w-0 space-y-0.5">
                                                <p className="font-black text-base text-text-primary tracking-tight truncate">{member.user?.name}</p>
                                                <p className="text-sm font-medium font-mono text-text-secondary truncate opacity-60">@{member.user?.username || 'member'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 select-none font-mono text-[10px] uppercase font-bold tracking-wider">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md border flex items-center gap-1 text-[10px]",
                                                isUserOwner
                                                    ? 'bg-amber-400/10 border-amber-400/20 text-amber-400'
                                                    : member.role === 'admin'
                                                        ? 'bg-primary-container/10 border-primary-container/20 text-primary-container'
                                                        : 'bg-surface-container border-white/5 text-text-secondary'
                                            )}>
                                                {isUserOwner ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                                <span>{member.role}</span>
                                            </span>

                                            {/* Inline Deletion/Revocation Logic Interceptors */}
                                            {cellHasStatus && actionStatus.type === 'success' ? (
                                                <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md animate-in fade-in duration-150">Cleared</span>
                                            ) : isConfirming ? (
                                                <div className="flex items-center gap-1.5 animate-in slide-in-from-right-2 duration-150">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMemberExecute(member.user?.id)}
                                                        className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg border-none cursor-pointer"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRemoveConfirmId(null)}
                                                        className="px-2.5 py-1.5 bg-[#222] border border-white/5 text-text-secondary hover:text-white rounded-lg cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                canManageTeam && !isUserOwner && !isSelf && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRemoveConfirmId(member.user?.id)}
                                                        className="text-xs text-rose-400 hover:text-rose-300 font-bold bg-transparent border-0 cursor-pointer px-2 py-1 outline-none font-sans font-extrabold uppercase tracking-wide text-[10px]"
                                                    >
                                                        Revoke Access
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            </div>            {/* Sent Invitations Section Layout Block */}
            {canManageTeam && (
                <div className="space-y-3 pt-4">
                    <h3 className="text-md font-black text-text-secondary uppercase tracking-widest font-mono select-none">
                        Sent Invitations ({pendingInvites.length})
                    </h3>

                    <div className="bg-surface-container-low border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        {pendingInvites.length === 0 ? (
                            <div className="p-12 text-center text-sm font-medium text-text-secondary/50 italic flex flex-col items-center justify-center gap-2 select-none animate-in fade-in duration-150">
                                <MailOpen className="w-8 h-8 opacity-40 mb-1" />
                                <span>No outstanding invitations right now.</span>
                            </div>
                        ) : (
                            <ul className="divide-y dark:divide-white/5 divide-black/5">
                                {pendingInvites.map((invite) => (
                                    <li key={invite.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.005] transition-all duration-150 animate-in fade-in duration-100">
                                        <div className="text-left min-w-0 space-y-0.5">
                                            <p className="font-black text-lg text-text-primary tracking-tight truncate">
                                                {invite.user?.name || invite.email || "Pending User"}
                                            </p>
                                            <p className="text-lg font-medium font-mono text-text-secondary truncate opacity-60">
                                                {invite.email ? `Sent to: ${invite.email}` : `Mapping identifier (ID: ${invite.user?.id})`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 select-none font-mono text-[14px] uppercase font-bold tracking-wider">
                                            <span className="px-2.5 py-1 rounded-md border bg-amber-400/10 border-amber-400/20 text-amber-400 capitalize">
                                                {invite.role} (Pending)
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

