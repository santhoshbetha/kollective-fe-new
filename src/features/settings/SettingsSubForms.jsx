// src/features/settings/SettingsSubForms.jsx
import React, { useState } from 'react';
import { useUpdateEmailMutation, useUpdatePasswordMutation, useDeleteAccountMutation } from './useSettingsFeature';

// 📧 Sub-Form A: Managing user contact address linkages
export function EmailSettingsForm() {
    const mutation = useUpdateEmailMutation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        mutation.mutate({ email: email.trim(), password: password.trim() }, {
            onSuccess: () => {
                alert("Verification link dispatched to your fresh target email address node.");
                setEmail('');
                setPassword('');
            },
            onError: () => alert("Credentials verification failure. Transaction terminated.")
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4 select-none">
                <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Email Configuration</h2>
                <p className="text-md text-text-secondary mt-0.5">Modify your primary network routing contact coordinates</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 flex flex-col w-full max-w-md">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider select-none">New Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none focus:border-primary-container font-mono font-bold"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider select-none">Current Authorization Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none focus:border-primary-container"
                    />
                </div>

                <button
                    type="submit"
                    disabled={mutation.isPending || !email.trim() || !password.trim()}
                    className="w-fit px-5 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer border-none uppercase tracking-wider disabled:opacity-40"
                >
                    {mutation.isPending ? 'Processing...' : 'Commit Email Change'}
                </button>
            </form>
        </div>
    );
}

// 🔒 Sub-Form B: Modifying cryptographic password keys
export function PasswordSettingsForm() {
    const mutation = useUpdatePasswordMutation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Key signature matrices mismatch. Confirm target passwords match.");
            return;
        }

        mutation.mutate({ current_password: currentPassword, new_password: newPassword }, {
            onSuccess: () => {
                alert("Cryptographic signature key refreshed cleanly across all device nodes.");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            },
            onError: () => alert("Failed to alter key signature configuration. Verify old parameters.")
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4 select-none">
                <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Security & Keys</h2>
                <p className="text-md text-text-secondary mt-0.5">Alter encryption passwords and localized node access credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 flex flex-col w-full max-w-md">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider select-none">Old Password Key</label>
                    <input
                        type="password"
                        required value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider select-none">New Password Key</label>
                    <input
                        type="password"
                        required value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider select-none">Confirm New Password Key</label>
                    <input
                        type="password"
                        required value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={mutation.isPending || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                    className="w-fit px-5 py-2.5 bg-primary-container text-white font-bold text-sm rounded-xl hover:brightness-110 cursor-pointer border-none uppercase tracking-wider disabled:opacity-40">
                    Commit Key Refresh
                </button>
            </form>
        </div>
    );
}

// ⚠️ Sub-Form C: High-impact profile permanent destruction
export function DangerZoneSettingsForm() {
    const mutation = useDeleteAccountMutation();
    const [password, setPassword] = useState('');
    const [confirmedDanger, setConfirmedDanger] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password.trim() || !confirmedDanger) return;

        const finalize = confirm("CRITICAL: Permanent account destruction cannot be reversed across the mesh registry. Proceed?");
        if (!finalize) return;

        mutation.mutate({ password: password.trim() });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-rose-500/10 pb-4 select-none">
                <h2 className="text-2xl font-extrabold text-rose-500 tracking-tight">Danger Zone</h2>
                <p className="text-md text-text-secondary mt-0.5">Permanent account destruction and decentralized data asset purging</p>
            </div>

            <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 text-md leading-relaxed text-rose-400 select-none max-w-xl font-medium">
                ⚠️ Warning: Committing this operation executes a destructive database purge chain. All authored pulses, historical media vaults, followed hashtags metadata, and connection channels will be wiped immediately from this node network map.
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 flex flex-col w-full max-w-md">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-text-secondary uppercase tracking-wider select-none">Confirm password to execute delete operation</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-rose-500" />
                </div>

                <div className="flex items-center gap-2 select-none">
                    <input type="checkbox" id="dangerCheck" checked={confirmedDanger} onChange={(e) => setConfirmedDanger(e.target.checked)} className="rounded border-white/10 text-rose-500 focus:ring-0 w-3.5 h-3.5 bg-[#111111] cursor-pointer" />
                    <label htmlFor="dangerCheck" className="text-sm font-bold text-text-secondary cursor-pointer select-none">I verify the risks and explicitly authorize profile data deletion</label>
                </div>

                <button type="submit" disabled={mutation.isPending || !password.trim() || !confirmedDanger} className="w-fit px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer border-none uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none">
                    {mutation.isPending ? 'Purging Node data...' : 'Terminate Account'}
                </button>
            </form>
        </div>
    );
}
