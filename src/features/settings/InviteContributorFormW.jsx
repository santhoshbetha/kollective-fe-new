// src/features/settings/InviteContributorForm.jsx
import React, { useState } from 'react';
import api from '../../services/api';

export default function InviteContributorForm({ onInviteSuccess }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('contributor');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Hits the scope guarded by your :require_org_admin pipeline
            const response = await api.post('/org-admin/invite', { email, role });
            const newInvite = response.data?.data || response.data;

            setSuccessMessage(`Invitation dispatched to ${email}!`);
            setEmail('');
            setRole('contributor');

            if (onInviteSuccess) {
                onInviteSuccess(newInvite);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to dispatch invitation.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-surface-container-high/40 border border-white/10 rounded-2xl p-5 mb-6 shadow-md">
            <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary-container text-[20px]">person_add</span>
                <h3 className="text-sm font-bold text-text-primary">Invite New Team Member</h3>
            </div>
            <p className="text-xs text-text-secondary mb-4">The recipient must have an active Kollective account or email address.</p>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div className="w-full">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="writer@domain.com"
                        required
                        className="w-full bg-surface-container-lowest/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary-container transition"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end justify-between">
                    <div className="w-full sm:w-60">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                            Assign Role Slot
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-surface-container-lowest/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary-container cursor-pointer transition"
                        >
                            <option value="contributor">Contributor (Write)</option>
                            <option value="admin">Admin (Manage Roster)</option>
                            <option value="editor">Editor (Review)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto bg-primary-container hover:brightness-110 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 h-[42px] shadow-md flex items-center justify-center gap-1.5 shrink-0"
                    >
                        {submitting ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">send</span>
                                <span>Send Invite</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

