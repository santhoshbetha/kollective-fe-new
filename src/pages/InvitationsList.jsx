// src/pages/InvitationsList.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/auth/useAuthStore';
import { Mail, Check, X, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to your local helper utils directory path

export default function InvitationsList() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionStatus, setActionStatus] = useState({ type: null, text: '' });

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
            setError(err.response?.data?.error || 'Failed to sync pending organization records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    // Utility helper checking if a specific invitation timestamp crosses the 7-day threshold limit
    const isExpired = (insertedAtString) => {
        if (!insertedAtString) return false;
        const createdDate = new Date(insertedAtString);
        const currentDate = new Date();
        const differenceInDays = (currentDate - createdDate) / (1000 * 60 * 60 * 24);
        return differenceInDays >= 7;
    };

    const handleAction = async (id, action) => {
        try {
            setActionStatus({ type: null, text: '' });
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

            // 🚀 UPGRADE: Inline feedback messaging notification block instead of thread-freezing engine alert()
            setActionStatus({
                type: 'success',
                text: `Invitation successfully ${action === 'accept' ? 'accepted and added to your active user workspace profiles' : 'declined and cleared'}.`
            });
            setTimeout(() => setActionStatus({ type: null, text: '' }), 5000);
        } catch (err) {
            setActionStatus({
                type: 'error',
                text: err.response?.data?.error || `Error processing the requested ${action} operation execution.`
            });
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-text-secondary max-w-2xl mx-auto flex flex-col items-center justify-center gap-3 font-sans">
                <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold uppercase tracking-wider animate-pulse">Syncing team invites registries...</p>
            </div>
        );
    }
    return (
        <div className="bg-surface-container rounded-2xl border dark:border-white/10 border-black/5 shadow-2xl p-6 sm:p-8 max-w-2xl mx-auto text-left font-sans animate-in fade-in duration-200">
            {/* Header Block Section */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b dark:border-white/5 border-black/5 select-none">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">Organization Invitations</h2>
                    <p className="text-lg text-text-secondary font-medium">
                        Review and accept invitations to collaborate with sovereign organizations
                    </p>
                </div>
                <Mail className="w-6 h-6 text-primary-container shrink-0 hidden sm:block" />
            </div>

            {/* Error Feedback Display Banners */}
            {error && (
                <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-150">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Dynamic Operations Action Status Banners */}
            {actionStatus.type && (
                <div className={cn(
                    "mb-5 p-4 rounded-xl border flex items-start gap-3 text-sm font-bold animate-in slide-in-from-top-2 duration-150",
                    actionStatus.type === 'success'
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                    {actionStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{actionStatus.text}</span>
                </div>
            )}

            {invitations.length === 0 ? (
                /* Empty Inbox States Card */
                <div className="text-center py-14 rounded-2xl bg-surface-container-low/50 border dark:border-white/5 border-black/5 select-none animate-in fade-in duration-200 flex flex-col items-center justify-center">
                    <Inbox className="w-12 h-12 text-text-secondary/30 mb-3" />
                    <p className="text-lg font-black text-text-primary tracking-tight">Clear Roster Registry</p>
                    <p className="text-sm font-medium text-text-secondary/60 max-w-sm mt-1 px-4 leading-relaxed">
                        No pending team invitations found. When an organization grants you workspace credentials, it will populate here instantly.
                    </p>
                </div>
            ) : (
                /* Lists Nodes Map */
                <ul className="divide-y dark:divide-white/5 divide-black/5">
                    {invitations.map((invite) => {
                        const expired = isExpired(invite.inserted_at);
                        const org = invite.organization || {};

                        return (
                            <li
                                key={invite.id}
                                className={cn(
                                    "py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200",
                                    expired ? "opacity-40" : "hover:bg-white/[0.005] px-1 rounded-xl"
                                )}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Upscaled Corporate / Organizers Icon Avatars */}
                                    <img
                                        src={org.avatar || '/default-org.jpg'}
                                        alt={org.name || 'Organization'}
                                        className="w-14 h-14 rounded-xl object-cover border dark:border-white/10 border-black/5 flex-shrink-0 bg-surface-container-high shadow-inner"
                                    />
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                            <p className={cn(
                                                "font-black text-lg text-text-primary tracking-tight",
                                                expired && "line-through text-text-secondary"
                                            )}>
                                                {org.name || 'Anonymous Org'}
                                            </p>
                                            {org.handle && (
                                                <span className="text-lg text-text-secondary font-medium font-mono">
                                                    {org.handle}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center flex-wrap gap-2 text-md font-medium text-text-secondary pt-0.5 select-none">
                                            <span>Offered Role Slot:</span>
                                            <span className="capitalize font-bold text-amber-400 dark:text-amber-300 bg-amber-400/10 dark:bg-amber-400/15 border border-amber-400/20 px-2.5 py-0.5 rounded-md text-[14px] uppercase font-mono tracking-wider">
                                                {invite.role || 'contributor'}
                                            </span>
                                            {expired && (
                                                <span className="text-rose-400 font-extrabold uppercase tracking-wide font-mono text-[14px] bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <X className="w-3 h-3" /> Expired
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Responsive Operations Control Row Blocks */}
                                <div className="flex items-center gap-2 self-end sm:self-center select-none font-mono text-[14px] uppercase font-bold tracking-wider">
                                    {expired ? (
                                        <button
                                            type="button"
                                            onClick={() => handleAction(invite.id, 'decline')}
                                            className="bg-surface-container-high hover:bg-surface-container-highest text-text-secondary hover:text-white font-bold px-4 py-2 rounded-xl transition border dark:border-white/5 border-black/5 cursor-pointer outline-none active:scale-95"
                                        >
                                            Dismiss
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleAction(invite.id, 'accept')}
                                                className="bg-primary-container text-white font-extrabold px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 border-none outline-none transition-all hover:brightness-105 active:scale-95 crimson-glow"
                                            >
                                                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                                <span>Accept</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAction(invite.id, 'decline')}
                                                className="bg-surface-container-high hover:bg-surface-container-highest text-text-secondary hover:text-white font-bold px-4 py-2 rounded-xl border dark:border-white/5 border-black/5 transition cursor-pointer outline-none active:scale-95"
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

