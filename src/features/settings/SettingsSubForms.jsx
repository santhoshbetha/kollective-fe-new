import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUpdateEmailMutation, useUpdatePasswordMutation, useDeleteAccountMutation } from './useSettingsFeature';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { AlertCircle, CheckCircle2, ShieldAlert, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { generateUserKeyPair } from '../../utils/cryptoEngine';
import { apiFetch } from '../../api/apiClient';
import { ChatPinSetupDialog } from '../conversations/components/ChatPinSetupDialog';
import { ChatKeyRecoveryDialog } from '../conversations/components/ChatKeyRecoveryDialog';

// 📧 Sub-Form A: Managing user contact address linkages
export function EmailSettingsForm() {
    const mutation = useUpdateEmailMutation();
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const currentUser = useAuthStore((state) => state.user);
    const updateActiveProfile = useAuthStore((state) => state.updateActiveProfile);

    const [email, setEmail] = useState(activeAccount?.email || currentUser?.email || '');
    const [password, setPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: null, text: '' });

    useEffect(() => {
        setEmail(activeAccount?.email || currentUser?.email || '');
    }, [activeAccount?.email, currentUser?.email]);

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
                    text: err?.data?.error || err?.message || "Failed to update email address."
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

            {/* 🔒 End-to-End Chat Encryption Keys & PIN Section */}
            <ChatKeySettingsSection />
        </div>
    );
}

// 🔒 Sub-Form B2: End-to-End Chat Encryption Keys & PIN Setup Section
export function ChatKeySettingsSection() {
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((state) => state.user);
    const [showPinSetupModal, setShowPinSetupModal] = useState(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPublicKey, setGeneratedPublicKey] = useState(null);
    const [statusNotice, setStatusNotice] = useState(null);

    const userUuid = currentUser?.id || currentUser?.uuid;

    // Check server for registered backup
    const { data: backupResponse, isLoading } = useQuery({
        queryKey: ['auth', 'crypto', 'backup-package'],
        queryFn: async () => {
            try {
                return await apiFetch('/api/v1/auth/recover_key');
            } catch (err) {
                // Gracefully treat 404 as no backup registered yet without triggering error toasts
                if (err?.status === 404 || err?.message?.includes("No secure encrypted identity backups")) {
                    return { data: { has_key: false, has_backup: false, encrypted_private_key_backup: null } };
                }
                throw err;
            }
        },
        meta: { silent: true },
        retry: false,
        staleTime: 30000
    });

    const hasLocalKey = !!localStorage.getItem("active_session_private_key");
    const hasServerBackup = !!backupResponse?.data?.encrypted_private_key_backup;

    const handleInitiateSetup = async () => {
        try {
            setIsGenerating(true);
            setStatusNotice(null);
            const { publicKeyPem, privateKeyB64 } = await generateUserKeyPair();
            localStorage.setItem("active_session_private_key", privateKeyB64);
            setGeneratedPublicKey(publicKeyPem);
            setShowPinSetupModal(true);
        } catch (err) {
            setStatusNotice({ type: 'error', text: "Failed to generate cryptographic keypair locally." });
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePinSetupComplete = (result) => {
        setShowPinSetupModal(false);
        queryClient.invalidateQueries({ queryKey: ['auth', 'crypto', 'backup-package'] });
        if (result?.skipped) {
            setStatusNotice({
                type: 'error',
                text: "Cloud backup skipped. Your encryption keys are stored locally on this device only."
            });
        } else {
            setStatusNotice({
                type: 'success',
                text: "End-to-End Encrypted Chat Keys and Sync PIN successfully configured and backed up!"
            });
        }
    };

    const handlePinSetupSkip = () => {
        setShowPinSetupModal(false);
        queryClient.invalidateQueries({ queryKey: ['auth', 'crypto', 'backup-package'] });
        setStatusNotice({
            type: 'error',
            text: "Chat PIN backup skipped. Your keys exist locally on this browser only and are not backed up to the cloud."
        });
    };

    const handleRecoveryComplete = () => {
        setShowRecoveryModal(false);
        queryClient.invalidateQueries({ queryKey: ['auth', 'crypto', 'backup-package'] });
        setStatusNotice({
            type: 'success',
            text: "Private keys successfully restored to this browser from secure cloud backup!"
        });
    };

    return (
        <div className="pt-8 border-t border-white/10 space-y-4 max-w-xl">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h3 className="text-lg font-black text-text-primary tracking-tight flex items-center gap-2">
                        <span>End-to-End Encrypted Chat Keys</span>
                        <span className="px-2 py-0.5 text-[14px] font-mono font-bold uppercase rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Optional • Feature Coming Soon
                        </span>
                    </h3>
                    <p className="text-sm text-text-secondary mt-0.5 font-medium leading-relaxed">
                        Direct messaging and group chats will be unlocked in an upcoming platform release.
                        You can set up your Zero-Knowledge encryption keys and Chat Sync PIN now so you are ready when messaging goes live.
                    </p>
                </div>
            </div>

            {statusNotice && (
                <div className={cn(
                    "p-4 rounded-xl border flex items-start gap-3 text-sm font-medium animate-in slide-in-from-top-2 duration-150",
                    statusNotice.type === 'success'
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                    {statusNotice.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{statusNotice.text}</span>
                </div>
            )}

            {/* Status Card */}
            <div className="p-5 rounded-2xl bg-surface-container border border-black/10 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-mono font-bold uppercase tracking-wider text-text-secondary">Current Key Status</span>
                    {isLoading ? (
                        <span className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking...
                        </span>
                    ) : hasLocalKey && hasServerBackup ? (
                        <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Active &amp; Synced
                        </span>
                    ) : hasServerBackup && !hasLocalKey ? (
                        <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" /> Backup Found (Not on Device)
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 text-sm font-mono font-bold uppercase rounded-full bg-surface-container-high text-text-secondary border border-black/5 dark:border-white/5">
                            Not Configured
                        </span>
                    )}
                </div>

                <div className="text-sm text-text-secondary leading-relaxed font-sans">
                    {hasLocalKey && hasServerBackup ? (
                        <p>Your RSA encryption keypair is active in this browser and safely protected in the cloud with your PIN. When chat launches, your conversations will be end-to-end encrypted.</p>
                    ) : hasServerBackup && !hasLocalKey ? (
                        <p>An encrypted identity backup is stored in the cloud for this account. Restore your private key on this browser using your 4-to-6 digit PIN.</p>
                    ) : (
                        <p>No encryption keys are configured yet for this account. Setting up now will generate your device keys and prompt you to create a Chat Sync PIN.</p>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-1 flex-wrap">
                    {hasServerBackup && !hasLocalKey ? (
                        <button
                            type="button"
                            onClick={() => setShowRecoveryModal(true)}
                            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <KeyRound className="w-4 h-4" />
                            <span>Restore Keys with PIN</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={isGenerating}
                            onClick={handleInitiateSetup}
                            className="px-4 py-2.5 bg-primary-container hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                            <span>
                                {isGenerating
                                    ? "Generating Keys..."
                                    : hasLocalKey
                                        ? "Re-encrypt / Change Chat PIN"
                                        : "Set Up Chat Keys & Sync PIN"}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* PIN Setup Dialog Interceptor */}
            {showPinSetupModal && userUuid && (
                <ChatPinSetupDialog
                    userUuid={userUuid}
                    publicKey={generatedPublicKey}
                    redirectOnComplete={null}
                    onComplete={handlePinSetupComplete}
                    onSkip={handlePinSetupSkip}
                    onCancel={() => setShowPinSetupModal(false)}
                />
            )}

            {/* Key Recovery Dialog Interceptor */}
            {showRecoveryModal && userUuid && (
                <ChatKeyRecoveryDialog
                    userUuid={userUuid}
                    onRestored={handleRecoveryComplete}
                    onClose={() => setShowRecoveryModal(false)}
                />
            )}
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
                    text: err?.data?.error || err?.message || "Failed to delete account. Please verify your password."
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


