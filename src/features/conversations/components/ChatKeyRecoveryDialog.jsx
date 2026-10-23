// src/features/conversations/components/ChatKeyRecoveryDialog.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { recoverPrivateKeyFromServer } from '../../../utils/cryptoBackup';
import { apiFetch } from '../../../api/apiClient';
import { useAuthStore } from '../../../store/auth/useAuthStore';
import { KeyRound, Loader2, AlertCircle, ShieldAlert, ShieldX, Lock, X } from 'lucide-react';

export function ChatKeyRecoveryDialog({ userUuid, onRestored, onClose }) {
    const navigate = useNavigate();
    // Connect store layout pointers to handle forced session logouts on intrusion
    const logoutSession = useAuthStore((state) => state.logout || state.clearAuth);

    const [pin, setPin] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isDecrypting, setIsProcessing] = useState(false);

    // 🛡️ BRUTE-FORCE RATE LIMITER COUNTERS MATRIX
    const [failedStrikes, setFailedStrikes] = useState(0);
    const [isPermanentlyLocked, setIsPermanentlyLocked] = useState(false);
    const lockoutTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (lockoutTimerRef.current) clearTimeout(lockoutTimerRef.current);
        };
    }, []);

    // 📡 FETCH ENCRYPTED BACKUP SCHEMA FIELDS FROM SERVER
    const { data: backupPayload, isLoading, isError } = useQuery({
        queryKey: ['auth', 'crypto', 'backup-package'],
        queryFn: async () => {
            try {
                return await apiFetch('/api/v1/auth/recover_key');
            } catch (err) {
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

    const hasBackup = Boolean(
        backupPayload?.data?.has_backup && backupPayload?.data?.encrypted_private_key_backup
    );

    const handleRecoverySubmit = async (e) => {
        e.preventDefault();
        if (!pin || !backupPayload?.data || isPermanentlyLocked) return;

        setErrorMsg("");
        setIsProcessing(true);

        try {
            const blob = backupPayload.data.encrypted_private_key_backup;
            const salt = backupPayload.data.backup_salt;

            // Run in-browser local RAM re-derivation decrypt operations [1.4]
            const rawPrivateKeyB64 = await recoverPrivateKeyFromServer(blob, salt, pin);

            // Re-seed storage maps
            localStorage.setItem(`user_sk:${userUuid}`, rawPrivateKeyB64);
            localStorage.setItem("active_session_private_key", rawPrivateKeyB64);

            if (onRestored) onRestored(rawPrivateKeyB64);
        } catch (err) {
            const nextStrikes = failedStrikes + 1;
            setFailedStrikes(nextStrikes);

            // 🚨 Only logout if user has entered incorrect pin more than 3 times (i.e. on 4th failed attempt)
            if (nextStrikes > 3) {
                setIsPermanentlyLocked(true);
                setErrorMsg("CRITICAL LOCKOUT: Exceeded 3 failed recovery attempts. Logging out...");

                // Clear session tokens and force eviction to protect data integrity [1.4]
                lockoutTimerRef.current = setTimeout(() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_token');
                    localStorage.removeItem('socket_token');
                    localStorage.removeItem('active_session_private_key');
                    if (logoutSession) logoutSession();
                    window.location.href = "/login";
                }, 3000);
            } else {
                const remaining = 4 - nextStrikes;
                setErrorMsg(`Invalid recovery PIN. Verification failed. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
                <div className="relative bg-[#141414] border border-white/10 rounded-[28px] max-w-sm w-full p-8 text-center shadow-2xl flex flex-col items-center justify-center gap-3">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
                    <span className="text-xs font-mono font-medium text-neutral-400 uppercase tracking-wider">
                        Checking Cryptographic Security Status...
                    </span>
                </div>
            </div>
        );
    }

    // 🔒 USER NEVER SET UP ENCRYPTION KEYS: Prompt to visit Settings
    if (!hasBackup || isError) {
        return (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
                <div className="relative bg-[#141414] border border-white/10 rounded-[28px] max-w-sm w-full p-6 space-y-5 shadow-2xl text-left transform animate-in zoom-in-95 duration-200">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <div className="text-center pb-2 border-b border-white/5">
                        <div className="flex h-12 w-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl items-center justify-center mx-auto mb-3 text-amber-400">
                            <Lock className="w-5 h-5 stroke-[2.5px]" />
                        </div>
                        <h3 className="text-base font-black text-white tracking-tight">
                            Encryption Setup Required
                        </h3>
                        <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-[270px] mx-auto mt-1.5">
                            End-to-end encrypted messaging requires generating your cryptographic keypair and Chat Sync PIN. You haven't set up your keys yet.
                        </p>
                    </div>

                    <div className="space-y-2.5 pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                if (onClose) onClose();
                                navigate('/settings?tab=password');
                            }}
                            className="w-full py-3 bg-primary-container text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:brightness-105 border-none cursor-pointer flex items-center justify-center gap-2 outline-none transition-all active:scale-[0.98]"
                        >
                            <KeyRound className="w-4 h-4" />
                            <span>Set Up Keys in Settings</span>
                        </button>

                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-2.5 bg-white/5 text-neutral-400 hover:text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 border border-white/5 cursor-pointer flex items-center justify-center transition-all"
                            >
                                Back to Safety
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 🔑 USER ALREADY SET UP KEYS: Prompt to enter PIN to restore history
    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="relative bg-[#141414] border border-white/10 rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-left transform animate-in zoom-in-95 duration-200">
                {onClose && !isPermanentlyLocked && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="text-center pb-2 border-b border-white/5">
                    <div className="flex h-12 w-12 bg-primary-container/10 border border-primary-container/20 rounded-2xl items-center justify-center mx-auto mb-3 text-primary-container">
                        {isPermanentlyLocked ? (
                            <ShieldX className="w-5 h-5 text-rose-500 stroke-[2.5px]" />
                        ) : (
                            <KeyRound className="w-5 h-5 stroke-[2.5px]" />
                        )}
                    </div>
                    <h3 className="text-base font-black text-white tracking-tight">
                        {isPermanentlyLocked ? "Terminal Secured" : "Restore Encrypted History"}
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-[250px] mx-auto mt-1">
                        {isPermanentlyLocked
                            ? "This browser container has been locked down due to multiple mismatched security PIN entry handshakes. Evicting session parameters..."
                            : "Enter your Chat Sync PIN to locally decrypt your private key and unlock your messaging history."
                        }
                    </p>
                </div>

                {!isPermanentlyLocked && (
                    <form onSubmit={handleRecoverySubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 ml-1">Enter Sync PIN</label>
                            <input
                                type="password" pattern="[0-9]*" inputMode="numeric" maxLength="6" placeholder="••••"
                                disabled={isDecrypting} value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full text-center bg-[#181818] border border-white/10 py-3 text-lg tracking-widest text-white rounded-xl focus:border-primary-container focus:outline-none font-mono font-bold"
                            />
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl flex items-center gap-2 text-xs font-medium leading-tight">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <button
                                type="submit"
                                disabled={isDecrypting || pin.length < 4}
                                className="w-full py-3 bg-primary-container text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:brightness-105 border-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 outline-none transition-all active:scale-[0.98]"
                            >
                                {isDecrypting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>Verify PIN &amp; Unlock</span>
                            </button>

                            {onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-2 bg-transparent text-neutral-400 hover:text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 border border-transparent cursor-pointer flex items-center justify-center transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {isPermanentlyLocked && errorMsg && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-2.5 text-xs font-mono font-bold uppercase select-none animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-rose-500 shrink-0" />
                        <span>Terminating local auth access tokens...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
