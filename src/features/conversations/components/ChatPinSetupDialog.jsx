// src/features/conversations/components/ChatPinSetupDialog.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { backupPrivateKeyToServer } from '../../../utils/cryptoBackup';
import { ShieldCheck, KeyRound, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';

export function ChatPinSetupDialog({ userUuid, onComplete, onSkip = null, redirectOnComplete = '/feed', publicKey = null, onCancel = null }) {
    const navigate = useNavigate();
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [statusText, setStatusText] = useState("");

    // ⚠️ SKIP BACKUP CONFIRMATION INTERCEPT STATE
    const [showSkipWarning, setShowSkipWarning] = useState(false);
    const completeTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
        };
    }, []);

    const backupMutation = useMutation({
        mutationFn: async (pinString) => {
            const rawSk = localStorage.getItem("active_session_private_key");
            if (!rawSk) throw new Error("Local private key matrix not resolved in browser memory.");
            return await backupPrivateKeyToServer(userUuid, rawSk, pinString, publicKey);
        },
        onSuccess: () => {
            setStatusText("Backup finalized successfully!");
            completeTimerRef.current = setTimeout(() => {
                if (onComplete) onComplete({ skipped: false });
                if (redirectOnComplete) {
                    navigate(redirectOnComplete);
                }
            }, 1200);
        },
        onError: (err) => {
            setErrorMsg(err?.message || "Failed to commit backup payload.");
            setStatusText("");
        }
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setErrorMsg("");
        if (pin.length < 4) {
            setErrorMsg("Security PIN must be at least 4 digits long.");
            return;
        }
        if (pin !== confirmPin) {
            setErrorMsg("PIN entries do not match.");
            return;
        }
        setStatusText("Deriving PBKDF2 encryption key matrix...");
        backupMutation.mutate(pin);
    };

    const handleAbsoluteSkipConfirm = () => {
        if (onSkip) {
            onSkip();
        } else if (onComplete) {
            onComplete({ skipped: true });
        }
        if (redirectOnComplete) {
            navigate(redirectOnComplete);
        }
    };
    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="bg-surface dark:bg-[#141414] border border-black/10 dark:border-white/10 rounded-3xl max-w-md w-full p-7 sm:p-8 space-y-6 shadow-2xl text-left transform animate-in zoom-in-95 duration-200 relative">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
                        title="Cancel"
                    >
                        ✕
                    </button>
                )}

                {/* 🚨 SCREEN A: THE "SKIP BACKUP" CRITICAL WARNING NOTICE BOX */}
                {showSkipWarning ? (
                    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        <div className="text-center pb-3 border-b border-black/5 dark:border-white/10">
                            <div className="flex h-14 w-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl items-center justify-center mx-auto mb-4 text-amber-500 shadow-sm">
                                <AlertTriangle className="w-7 h-7 stroke-[2.5px]" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Bypass Cloud Sync?</h3>
                            <p className="text-sm sm:text-base text-text-secondary font-medium leading-relaxed max-w-[340px] mx-auto mt-2">
                                If you skip this backup, your private keys will exist **only** on this current browser instance.
                            </p>
                        </div>

                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-text-primary dark:text-neutral-200 space-y-2 font-medium text-sm leading-relaxed">
                            <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                Permanent History Loss Risk:
                            </p>
                            <p className="text-text-secondary dark:text-neutral-300">Clearing browser cookies, updating your device, or logging in from a new smartphone will lock you out of your private chats forever. Past chats will become unreadable.</p>
                        </div>

                        <div className="flex flex-col gap-2.5 font-mono text-sm font-bold uppercase tracking-wider pt-1">
                            <button
                                type="button"
                                onClick={handleAbsoluteSkipConfirm}
                                className="w-full py-3 bg-surface-container-low hover:bg-surface-container-high text-rose-600 dark:text-rose-400 border border-black/5 dark:border-white/10 rounded-xl cursor-pointer outline-none transition-colors"
                            >
                                Skip &amp; Risk Data Loss
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSkipWarning(false)}
                                className="w-full py-3.5 bg-primary-container hover:bg-primary-container/90 text-white border-none rounded-xl cursor-pointer outline-none transition-all shadow-md shadow-primary-container/20"
                            >
                                Secure My Account
                            </button>
                        </div>
                    </div>
                ) : (
                    /* 🔒 SCREEN B: STANDARD PIN CONFIGURATION INPUT FORM */
                    <>
                        <div className="text-center pb-3 border-b border-black/5 dark:border-white/10">
                            <div className="flex h-14 w-14 bg-primary-container/10 border border-primary-container/20 rounded-2xl items-center justify-center mx-auto mb-4 text-primary-container shadow-sm">
                                <ShieldCheck className="w-7 h-7 stroke-[2.5px]" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Secure Chat History</h3>
                            <p className="text-sm sm:text-base text-text-secondary font-medium leading-relaxed max-w-[340px] mx-auto mt-2">
                                Create a Chat Sync PIN to encrypt and backup your private key securely.
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-text-secondary ml-1">Create Chat PIN</label>
                                <input
                                    type="password" pattern="[0-9]*" inputMode="numeric" maxLength="6" placeholder="••••"
                                    disabled={backupMutation.isPending} value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center bg-surface-container-low border border-black/10 dark:border-white/10 py-3.5 text-2xl tracking-[0.35em] text-text-primary placeholder:text-text-secondary/40 rounded-xl focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none font-mono font-bold transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-text-secondary ml-1">Confirm Chat PIN</label>
                                <input
                                    type="password" pattern="[0-9]*" inputMode="numeric" maxLength="6" placeholder="••••"
                                    disabled={backupMutation.isPending} value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center bg-surface-container-low border border-black/10 dark:border-white/10 py-3.5 text-2xl tracking-[0.35em] text-text-primary placeholder:text-text-secondary/40 rounded-xl focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:outline-none font-mono font-bold transition-all shadow-inner"
                                />
                            </div>

                            {errorMsg && (
                                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-2.5 text-sm font-semibold leading-snug">
                                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {statusText && (
                                <div className="p-3 bg-primary-container/10 border border-primary-container/20 text-text-primary dark:text-neutral-200 rounded-xl flex items-center gap-2.5 font-mono text-xs font-bold">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary-container shrink-0" />
                                    <span className="uppercase">{statusText}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-2.5 pt-2 font-mono text-sm font-bold uppercase tracking-wider">
                                <button
                                    type="submit"
                                    disabled={backupMutation.isPending || pin.length < 4 || pin !== confirmPin}
                                    className="w-full py-3.5 bg-primary-container hover:bg-primary-container/90 text-white rounded-xl hover:brightness-105 border-none cursor-pointer flex items-center justify-center gap-2 outline-none transition-all active:scale-[0.98] shadow-md shadow-primary-container/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {backupMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>Encrypt &amp; Backup Key</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={backupMutation.isPending}
                                    onClick={() => setShowSkipWarning(true)}
                                    className="w-full py-2.5 bg-transparent text-text-secondary hover:text-text-primary border-none cursor-pointer font-bold text-xs tracking-wider outline-none transition-colors"
                                >
                                    Skip Backup Setup
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
