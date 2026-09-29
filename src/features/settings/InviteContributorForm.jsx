// src/features/settings/InviteContributorForm.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import { UserPlus, AlertCircle, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to your layout utility directory helper path

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
        <div className="bg-surface-container-high/40 border dark:border-white/10 border-black/5 rounded-2xl p-6 mb-6 shadow-xl text-left font-sans animate-in fade-in duration-150">
            {/* Header Block Section */}
            <div className="flex items-center gap-3 mb-1 select-none">
                <UserPlus className="w-5 h-5 text-primary-container shrink-0" />
                <h3 className="text-lg font-black text-text-primary tracking-tight">Invite New Team Member</h3>
            </div>
            <p className="text-sm font-medium text-text-secondary mb-5 select-none">The recipient must have an active Kollective account or email address.</p>

            {/* Error Feedback Display Banners */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-150">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success Feedback Display Banners */}
            {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-xl flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-150">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Redesigned Form Fields Layer */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
                <div className="w-full flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="writer@domain.com"
                        required
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 dark:border-white/5 rounded-xl px-4 py-3 text-base text-text-primary font-bold placeholder:text-text-secondary/30 focus:outline-none focus:border-primary-container transition-colors"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end justify-between mt-1">
                    <div className="w-full sm:w-64 flex flex-col gap-2">
                        <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">
                            Assign Role Slot
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-white dark:bg-[#111111] border border-white/10 dark:border-white/5 rounded-xl px-4 py-3 text-base font-bold text-text-primary focus:outline-none focus:border-primary-container cursor-pointer transition-colors"
                        >
                            <option value="contributor" className="bg-white dark:bg-[#111111]">Contributor (Write)</option>
                            <option value="admin" className="bg-white dark:bg-[#111111]">Admin (Manage Roster)</option>
                            <option value="editor" className="bg-white dark:bg-[#111111]">Editor (Review)</option>
                        </select>
                    </div>

                    {/* Form Controls Action Row */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto bg-primary-container text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-40 select-none outline-none active:scale-95 h-[48px] flex items-center justify-center gap-2 shrink-0 border-none whitespace-nowrap crimson-glow"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-3.5 h-3.5 stroke-[2.5px] shrink-0" />
                                <span>Send Invite</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
