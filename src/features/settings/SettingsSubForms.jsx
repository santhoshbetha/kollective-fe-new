import React, { useState } from 'react';
import { useUpdateEmailMutation, useUpdatePasswordMutation, useDeleteAccountMutation } from './useSettingsFeature';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from "@/lib/utils";

// 📧 Sub-Form A: Managing user contact address linkages
export function EmailSettingsForm() {
    const mutation = useUpdateEmailMutation();
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const currentUser = useAuthStore((state) => state.user);
    const updateActiveProfile = useAuthStore((state) => state.updateActiveProfile);

    const [email, setEmail] = useState(activeAccount?.email || currentUser?.email || '');
    const [password, setPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: null, text: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        setStatusMessage({ type: null, text: '' });

        mutation.mutate({ email: email.trim(), password: password.trim() }, {
            onSuccess: (data) => {
                const updatedEmail = data?.data?.user?.email || email.trim();
                setStatusMessage({
                    type: 'success',
                    text: data?.message || "Email address updated successfully."
                });
                if (updateActiveProfile) {
                    updateActiveProfile({ email: updatedEmail });
                }
                setPassword('');
            },
            onError: (err) => {
                setStatusMessage({
                    type: 'error',
                    text: err.data?.error || err.message || "Failed to update email address."
                });
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
            <div className="border-b border-white/5 pb-4 select-none">
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Email Configuration</h2>
                <p className="text-md text-text-secondary mt-0.5 font-medium">Modify your primary network routing contact coordinates</p>
            </div>

            {statusMessage.type && (
                <div className={cn(
                    "p-4 rounded-xl border flex items-start gap-3 text-sm font-medium animate-in slide-in-from-top-2 duration-150 max-w-md font-sans",
                    statusMessage.type === 'success'
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                    {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{statusMessage.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 flex flex-col w-full max-w-md font-sans">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">New Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none focus:border-primary-container font-mono font-bold"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">Current Authorization Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none focus:border-primary-container"
                    />
                </div>

                <button
                    type="submit"
                    disabled={mutation.isPending || !email.trim() || !password.trim()}
                    className="w-fit px-5 py-2.5 bg-primary-container text-white font-black text-sm rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer border-none uppercase tracking-wider disabled:opacity-40 select-none outline-none"
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
    const [statusMessage, setStatusMessage] = useState({ type: null, text: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatusMessage({
                type: 'error',
                text: "Key signature matrices mismatch. Confirm target passwords match."
            });
            return;
        }

        setStatusMessage({ type: null, text: '' });

        mutation.mutate({ current_password: currentPassword, new_password: newPassword }, {
            onSuccess: () => {
                setStatusMessage({
                    type: 'success',
                    text: "Cryptographic signature key refreshed cleanly across all device nodes."
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            },
            onError: () => {
                setStatusMessage({
                    type: 'error',
                    text: "Failed to alter key signature configuration. Verify old parameters."
                });
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
            <div className="border-b border-white/5 pb-4 select-none">
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Security & Keys</h2>
                <p className="text-md text-text-secondary mt-0.5 font-medium">Alter encryption passwords and localized node access credentials</p>
            </div>

            {statusMessage.type && (
                <div className={cn(
                    "p-4 rounded-xl border flex items-start gap-3 text-sm font-medium animate-in slide-in-from-top-2 duration-150 max-w-md font-sans",
                    statusMessage.type === 'success'
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                    {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{statusMessage.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 flex flex-col w-full max-w-md font-sans">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">Old Password Key</label>
                    <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none focus:border-primary-container"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">New Password Key</label>
                    <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none focus:border-primary-container"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">Confirm New Password Key</label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none focus:border-primary-container"
                    />
                </div>

                <button
                    type="submit"
                    disabled={mutation.isPending || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                    className="w-fit px-5 py-2.5 bg-primary-container text-white font-black text-sm rounded-xl hover:brightness-110 cursor-pointer border-none uppercase tracking-wider disabled:opacity-40 select-none outline-none transition-all active:scale-95"
                >
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
    const [requiresFinalVerify, setRequiresFinalVerify] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: null, text: '' });

    const handlePreSubmitCheck = (e) => {
        e.preventDefault();
        if (!password.trim() || !confirmedDanger) return;
        setStatusMessage({ type: null, text: '' });

        // 🚀 THE INTERCEPTOR FIX: Reveals the tactical verification banner instead of thread-blocking window confirms
        setRequiresFinalVerify(true);
    };

    const handleExecutePurge = () => {
        if (!password.trim() || !confirmedDanger) return;
        setStatusMessage({ type: null, text: '' });

        mutation.mutate({ password: password.trim() }, {
            onError: (err) => {
                setRequiresFinalVerify(false);
                setStatusMessage({
                    type: 'error',
                    text: err.data?.error || err.message || "Failed to delete account. Please verify your password."
                });
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
            <div className="border-b border-rose-500/20 pb-4 select-none">
                <h2 className="text-2xl font-black text-rose-500 tracking-tight">Danger Zone</h2>
                <p className="text-md text-text-secondary mt-0.5 font-medium">Permanent account destruction and decentralized data asset purging</p>
            </div>

            {statusMessage.type && (
                <div className={cn(
                    "p-4 rounded-xl border flex items-start gap-3 text-sm font-medium animate-in slide-in-from-top-2 duration-150 max-w-md font-sans",
                    statusMessage.type === 'success'
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{statusMessage.text}</span>
                </div>
            )}

            <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 text-base leading-relaxed text-rose-400 select-none max-w-xl font-semibold font-sans">
                ⚠️ Warning: Committing this operation executes a destructive database purge chain. All authored pulses, historical media vaults, followed hashtags metadata, and connection channels will be wiped immediately from this node network map.
            </div>

            {/* 🚀 TWO-STAGE VERIFICATION ALERT BOX */}
            {requiresFinalVerify && (
                <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 rounded-xl max-w-md font-sans text-sm space-y-4 animate-in slide-in-from-top-3 duration-200 select-none">
                    <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-extrabold text-base text-white tracking-tight">CRITICAL: Are you absolutely certain?</h4>
                            <p className="text-xs text-red-300/80 mt-1 font-medium leading-relaxed">
                                Permanent account destruction cannot be reversed across the mesh registry. This will immediately log you out and delete your profile permanently.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 font-mono text-[10px] select-none pt-1">
                        <button
                            type="button"
                            onClick={handleExecutePurge}
                            disabled={mutation.isPending}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg border-none cursor-pointer uppercase transition-all"
                        >
                            {mutation.isPending ? 'Purging Registry...' : 'Yes, Purge Node'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setRequiresFinalVerify(false)}
                            className="px-4 py-2 bg-[#222] hover:bg-white/5 border border-white/5 text-text-secondary hover:text-white font-bold rounded-lg cursor-pointer uppercase transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handlePreSubmitCheck} className="space-y-5 flex flex-col w-full max-w-md font-sans">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">
                        Confirm password to execute delete operation
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={requiresFinalVerify || mutation.isPending}
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-md text-text-primary focus:outline-none focus:border-rose-500 disabled:opacity-40"
                    />
                </div>

                <div className="flex items-start gap-3 select-none">
                    <input
                        type="checkbox"
                        id="dangerCheck"
                        checked={confirmedDanger}
                        onChange={(e) => setConfirmedDanger(e.target.checked)}
                        disabled={requiresFinalVerify || mutation.isPending}
                        className="rounded border-white/10 text-rose-500 focus:ring-0 w-4 h-4 bg-white dark:bg-[#111111] cursor-pointer mt-0.5 shrink-0"
                    />
                    <label htmlFor="dangerCheck" className="text-md font-bold text-text-secondary cursor-pointer select-none leading-tight font-sans font-semibold">
                        I verify the risks and explicitly authorize profile data deletion
                    </label>
                </div>

                {!requiresFinalVerify && (
                    <button
                        type="submit"
                        disabled={mutation.isPending || !password.trim() || !confirmedDanger}
                        className="w-fit px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-xl shadow-md cursor-pointer border-none uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none select-none outline-none transition-all active:scale-95"
                    >
                        Terminate Account
                    </button>
                )}
            </form>
        </div>
    );
}


