// src/features/settings/TeamManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InviteContributorForm from './InviteContributorForm';

export default function TeamManagement({ activeOrgId, userRole }) {
    const [activeMembers, setActiveMembers] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if current user has permission to manage the team roster
    const roleNorm = (userRole || '').toLowerCase();
    const canManageTeam = ['owner', 'admin', 'lead organizer', 'manager'].includes(roleNorm);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch active members (Uses GET /api/org-settings/members)
                const membersRes = await api.get('/org-settings/members');
                setActiveMembers(membersRes.data?.data || membersRes.data || []);

                // 2. Fetch pending invites for this org if user is allowed to manage team
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

        if (activeOrgId) {
            fetchTeamData();
        }
    }, [activeOrgId, userRole, canManageTeam]);

    // Callback triggered when an invitation is successfully dispatched from the sub-form
    const handleInviteSuccess = (newPendingMembership) => {
        if (newPendingMembership) {
            setPendingInvites((prev) => [newPendingMembership, ...prev]);
        }
    };

    // Triggers removal of an active member
    const handleRemoveMember = async (userId, name) => {
        if (!window.confirm(`Are you sure you want to revoke organizational access for ${name}?`)) return;

        try {
            await api.delete(`/org-settings/members/${userId}`);
            alert("Access revoked successfully.");

            // Update local UI state
            setActiveMembers((prev) => prev.filter((m) => m.user?.id !== userId));
        } catch (err) {
            alert(err.response?.data?.error || err.message || 'Failed to remove member.');
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-text-secondary">
                <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold">Loading workspace roster...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-black text-text-primary tracking-tight">Team Management</h2>
                <p className="text-xs text-text-secondary mt-0.5">Manage writing, publication, and moderation permissions within this organization.</p>
            </div>

            {/* 1. Conditional Invite Sender Sub-form Component */}
            {canManageTeam && (
                <InviteContributorForm onInviteSuccess={handleInviteSuccess} />
            )}

            {/* 2. Active Team Members Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Active Roster ({activeMembers.length})
                    </h3>
                </div>

                <div className="bg-surface-container-low border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                    <ul className="divide-y divide-white/5">
                        {activeMembers.length === 0 ? (
                            <li className="p-6 text-center text-xs text-text-secondary/60">No active members found.</li>
                        ) : (
                            activeMembers.map((member) => (
                                <li key={member.id} className="p-4 flex items-center justify-between hover:bg-surface-container-high/30 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary-container/20 text-primary-container font-bold flex items-center justify-center text-sm uppercase border border-primary-container/30">
                                            {member.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-text-primary">{member.user?.name}</p>
                                            <p className="text-xs text-text-secondary">@{member.user?.username || 'member'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                                            member.role === 'owner'
                                                ? 'bg-amber-400/20 text-amber-300'
                                                : member.role === 'admin'
                                                ? 'bg-primary-container/20 text-primary-container'
                                                : 'bg-surface-container-highest text-text-secondary'
                                        }`}>
                                            {member.role}
                                        </span>

                                        {canManageTeam && member.role?.toLowerCase() !== 'owner' && member.role?.toLowerCase() !== roleNorm && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(member.user?.id, member.user?.name)}
                                                className="text-xs text-red-400 hover:text-red-300 font-bold hover:underline bg-transparent border-0 cursor-pointer px-2 py-1"
                                            >
                                                Revoke Access
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>

            {/* 3. Pending Invitations Section (Only visible to Admins/Owners) */}
            {canManageTeam && (
                <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                        Sent Invitations ({pendingInvites.length})
                    </h3>
                    <div className="bg-surface-container-low border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                        {pendingInvites.length === 0 ? (
                            <p className="p-6 text-xs text-text-secondary/60 text-center italic">No outstanding invitations right now.</p>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {pendingInvites.map((invite) => (
                                    <li key={invite.id} className="p-4 flex items-center justify-between hover:bg-surface-container-high/30 transition">
                                        <div>
                                            <p className="font-bold text-sm text-text-primary">{invite.user?.name || invite.email || "Pending User"}</p>
                                            <p className="text-xs text-text-secondary">
                                                {invite.email ? `Sent to: ${invite.email}` : `Mapping identifier (ID: ${invite.user?.id})`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 capitalize">
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

