// src/features/conversations/components/ChatKeyRecoveryDialog.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recoverPrivateKeyFromServer } from '../../../utils/cryptoBackup';
import { apiFetch } from '../../../api/apiClient';
import { useAuthStore } from '../../../store/auth/useAuthStore';
import { KeyRound, Loader2, AlertCircle, ShieldAlert, ShieldX } from 'lucide-react';

export function ChatKeyRecoveryDialog({ userUuid, onRestored }) {
    // Connect store layout pointers to handle forced session logouts on intrusion
    const logoutSession = useAuthStore((state) => state.logout || state.clearAuth);

    const [pin, setPin] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isDecrypting, setIsProcessing] = useState(false);

    // 🛡️ 3-STRIKE BRUTE-FORCE RATE LIMITER COUNTERS MATRIX
    const [failedStrikes, setFailedStrikes] = useState(0);
    const [isPermanentlyLocked, setIsPermanentlyLocked] = useState(false);

    // 📡 FETCH ENCRYPTED BACKUP SCHEMA FIELDS FROM SERVER
    const { data: backupPayload, isLoading, isError } = useQuery({
        queryKey: ['auth', 'crypto', 'backup-package'],
        queryFn: () => apiFetch('/api/v1/auth/recover_key'),
        retry: false,
        staleTime: Infinity
    });

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
            console.warn(`Key restitution attempt failed. Strike generated.`);
            const nextStrikes = failedStrikes + 1;
            setFailedStrikes(nextStrikes);

            // 🚨 CRITICAL BRUTE FORCE INTERCEPT GUARD TIER [1.4]
            if (nextStrikes >= 3) {
                setIsPermanentlyLocked(true);
                setErrorMsg("CRITICAL LOCKOUT: 3 failed recovery attempts generated. Access terminal blocked.");

                // Clear session tokens and force eviction to protect data integrity [1.4]
                setTimeout(() => {
                    localStorage.clear();
                    if (logoutSession) logoutSession();
                    window.location.href = "/login";
                }, 5000);
            } else {
                setErrorMsg(`Invalid recovery PIN. Verification failed. (${3 - nextStrikes} attempts remaining)`);
            }
        } finally {
            setIsProcessing(false);
        }
    };
    if (isLoading) {
        return (
            <div className="p-8 text-center text-neutral-500 font-mono text-xs flex flex-col items-center justify-center gap-2 select-none h-48">
                <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                <span>RETRIEVING CRYPTOGRAPHIC STORAGE COORDINATES...</span>
            </div>
        );
    }

    if (isError || !backupPayload?.data) {
        return (
            <div className="p-5 border border-rose-500/10 bg-rose-500/5 rounded-2xl text-center max-w-sm mx-auto select-none font-sans animate-in zoom-in-95">
                <ShieldAlert className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                <h4 className="text-md font-black text-rose-400 font-mono uppercase tracking-wider mb-0.5">Sync Interrupted</h4>
                <p className="text-[16px] text-neutral-400 font-medium leading-normal">
                    No encrypted identity backups exist for this account. Real-time private chat functionality is restricted on this browser node.
                </p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="bg-[#141414] border border-white/10 rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-left transform animate-in zoom-in-95 duration-200">

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
                            : "Enter your Chat Sync PIN to locally decrypt your private key and unlock your messaging history [1.4]."
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

                        <button
                            type="submit"
                            disabled={isDecrypting || pin.length < 4}
                            className="w-full py-3 bg-primary-container text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:brightness-105 border-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 outline-none transition-all active:scale-[0.98]"
                        >
                            {isDecrypting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Verify PIN &amp; Unlock</span>
                        </button>
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
