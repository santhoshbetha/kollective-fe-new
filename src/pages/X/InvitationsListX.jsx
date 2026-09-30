// src/pages/InvitationsList.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/auth/useAuthStore';

export default function InvitationsList() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = useAuthStore((state) => state.user);
    const setSession = useAuthStore((state) => state.setSession);
    const token = useAuthStore((state) => state.token);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/invitations');
            setInvitations(res.data?.data || []);
        } catch (err) {
            console.error('Failed to load invitations:', err);
            setError(err.response?.data?.error || 'Failed to load invitations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    // Utility helper to check if a specific invitation timestamp crosses the 7-day limit
    const isExpired = (insertedAtString) => {
        if (!insertedAtString) return false;
        const createdDate = new Date(insertedAtString);
        const currentDate = new Date();
        const differenceInDays = (currentDate - createdDate) / (1000 * 60 * 60 * 24);
        return differenceInDays >= 7;
    };

    const handleAction = async (id, action) => {
        try {
            const response = await api.post(`/invitations/${id}/${action}`);
            const acceptedOrg = response.data?.organization || response.data?.data?.organization;

            // If accepted, synchronize the new organization into user's memberships immediately
            if (action === 'accept' && acceptedOrg && user) {
                const updatedMemberships = [...(user.memberships || [])];
                const alreadyMember = updatedMemberships.some(m => m.organization?.id === acceptedOrg.id);
                if (!alreadyMember) {
                    updatedMemberships.push({
                        organization: acceptedOrg,
                        role: response.data?.role || 'contributor',
                        status: 'active'
                    });
                    const updatedUser = { ...user, memberships: updatedMemberships };
                    setSession(token, updatedUser);
                }
            }

            setInvitations(prev => prev.filter(invite => invite.id !== id));
            alert(`Invitation successfully ${action === 'accept' ? 'accepted' : 'declined'}.`);
        } catch (err) {
            alert(err.response?.data?.error || `Error processing ${action} request.`);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-text-secondary">
                <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold">Loading organization invitations...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-container rounded-2xl border border-white/10 shadow-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div>
                    <h2 className="text-xl font-black text-text-primary tracking-tight">Pending Organization Invites</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Review and accept invitations to collaborate with organizations</p>
                </div>
                <span className="material-symbols-outlined text-primary-container text-[24px]">
                    mail
                </span>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}

            {invitations.length === 0 ? (
                <div className="text-center py-10 rounded-xl bg-surface-container-low/50 border border-white/5">
                    <span className="material-symbols-outlined text-text-secondary/40 text-[40px] mb-2">
                        mark_email_read
                    </span>
                    <p className="text-sm font-semibold text-text-secondary">No pending invitations</p>
                    <p className="text-xs text-text-secondary/60 mt-1">When an organization invites you to join their roster, it will appear here.</p>
                </div>
            ) : (
                <ul className="divide-y divide-white/5">
                    {invitations.map((invite) => {
                        const expired = isExpired(invite.inserted_at);
                        const org = invite.organization || {};

                        return (
                            <li key={invite.id} className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${expired ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={org.avatar || '/default-org.jpg'}
                                        alt={org.name || 'Organization'}
                                        className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className={`font-bold text-sm text-text-primary ${expired ? 'line-through text-text-secondary' : ''}`}>
                                                {org.name || 'Organization'}
                                            </p>
                                            {org.handle && (
                                                <span className="text-xs text-text-secondary">
                                                    {org.handle}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5">
                                            <span>Role offered:</span>
                                            <span className="capitalize font-bold text-amber-300 bg-amber-400/15 px-1.5 py-0.2 rounded text-[11px]">
                                                {invite.role || 'contributor'}
                                            </span>
                                            {expired && <span className="text-red-400 font-bold ml-1">(Expired)</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    {expired ? (
                                        <button
                                            onClick={() => handleAction(invite.id, 'decline')}
                                            className="bg-surface-container-high hover:bg-surface-container-highest text-text-secondary hover:text-text-primary font-bold text-xs px-3.5 py-1.5 rounded-xl transition border border-white/5 cursor-pointer"
                                        >
                                            Dismiss
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAction(invite.id, 'accept')}
                                                className="bg-primary-container hover:brightness-110 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">check</span>
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleAction(invite.id, 'decline')}
                                                className="bg-surface-container-high hover:bg-surface-container-highest text-text-secondary hover:text-text-primary font-bold text-xs px-3.5 py-1.5 rounded-xl border border-white/5 transition cursor-pointer"
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

