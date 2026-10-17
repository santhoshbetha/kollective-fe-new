// src/features/conversations/components/ChatPinSetupDialog.jsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { backupPrivateKeyToServer } from '../../../utils/cryptoBackup';
import { ShieldCheck, KeyRound, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';

export function ChatPinSetupDialog({ userUuid, onComplete }) {
    const navigate = useNavigate();
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [statusText, setStatusText] = useState("");

    // ⚠️ SKIP BACKUP CONFIRMATION INTERCEPT STATE
    const [showSkipWarning, setShowSkipWarning] = useState(false);

    const backupMutation = useMutation({
        mutationFn: async (pinString) => {
            const rawSk = localStorage.getItem("active_session_private_key");
            if (!rawSk) throw new Error("Local private key matrix not resolved in browser memory.");
            return await backupPrivateKeyToServer(userUuid, rawSk, pinString);
        },
        onSuccess: () => {
            setStatusText("Backup finalized successfully!");
            setTimeout(() => {
                if (onComplete) onComplete();
                navigate('/feed');
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
        console.warn("User bypassed Zero-Knowledge server backup lanes.");
        if (onComplete) onComplete();
        navigate('/feed');
    };
    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="bg-[#141414] border border-white/10 rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-left transform animate-in zoom-in-95 duration-200">

                {/* 🚨 SCREEN A: THE "SKIP BACKUP" CRITICAL WARNING NOTICE BOX */}
                {showSkipWarning ? (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="text-center pb-2 border-b border-white/5">
                            <div className="flex h-12 w-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl items-center justify-center mx-auto mb-3 text-amber-500">
                                <AlertTriangle className="w-6 h-6 stroke-[2.5px]" />
                            </div>
                            <h3 className="text-base font-black text-white tracking-tight">Bypass Cloud Sync?</h3>
                            <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-[270px] mx-auto mt-1">
                                If you skip this backup, your private keys will exist **only** on this current browser instance [1.4].
                            </p>
                        </div>

                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-neutral-300 space-y-1.5 font-medium text-[11px] leading-relaxed">
                            <p className="font-bold text-amber-400 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Permanent History Loss Risk:
                            </p>
                            <p>Clearing browser cookies, updating your device, or logging in from a new smartphone will lock you out of your private chats forever. Past chats will become unreadable garbage blocks.</p>
                        </div>

                        <div className="flex flex-col gap-2 font-mono text-xs font-bold uppercase tracking-wider pt-1">
                            <button
                                type="button"
                                onClick={handleAbsoluteSkipConfirm}
                                className="w-full py-2.5 bg-zinc-800 text-rose-400 hover:bg-zinc-700 border-none rounded-xl cursor-pointer outline-none transition-colors"
                            >
                                Skip &amp; Risk Data Loss
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSkipWarning(false)}
                                className="w-full py-2.5 bg-primary-container text-white border-none rounded-xl cursor-pointer outline-none transition-all"
                            >
                                Secure My Account
                            </button>
                        </div>
                    </div>
                ) : (
                    /* 🔒 SCREEN B: STANDARD PIN CONFIGURATION INPUT FORM */
                    <>
                        <div className="text-center pb-2 border-b border-white/5">
                            <div className="flex h-12 w-12 bg-primary-container/10 border border-primary-container/20 rounded-2xl items-center justify-center mx-auto mb-3 text-primary-container">
                                <ShieldCheck className="w-6 h-6 stroke-[2.5px]" />
                            </div>
                            <h3 className="text-base font-black text-white tracking-tight">Secure Chat History</h3>
                            <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-[260px] mx-auto mt-1">
                                Create a Chat Sync PIN to encrypt and backup your private key [1.4].
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 ml-1">Create Chat PIN</label>
                                <input
                                    type="password" pattern="[0-9]*" inputMode="numeric" maxLength="6" placeholder="••••"
                                    disabled={backupMutation.isPending} value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center bg-[#181818] border border-white/10 py-3 text-lg tracking-widest text-white rounded-xl focus:border-primary-container focus:outline-none font-mono font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 ml-1">Confirm Chat PIN</label>
                                <input
                                    type="password" pattern="[0-9]*" inputMode="numeric" maxLength="6" placeholder="••••"
                                    disabled={backupMutation.isPending} value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center bg-[#181818] border border-white/10 py-3 text-lg tracking-widest text-white rounded-xl focus:border-primary-container focus:outline-none font-mono font-bold"
                                />
                            </div>

                            {errorMsg && (
                                <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl flex items-center gap-2 text-xs font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {statusText && (
                                <div className="p-3 bg-primary-container/5 border border-primary-container/20 text-neutral-300 rounded-xl flex items-center gap-2.5 font-mono text-[10px] font-bold">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-container shrink-0" />
                                    <span className="uppercase">{statusText}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-2 pt-1 font-mono text-xs font-bold uppercase tracking-wider">
                                <button
                                    type="submit"
                                    disabled={backupMutation.isPending || pin.length < 4 || pin !== confirmPin}
                                    className="w-full py-3 bg-primary-container text-white rounded-xl hover:brightness-105 border-none cursor-pointer flex items-center justify-center gap-2 outline-none transition-all active:scale-[0.98]"
                                >
                                    {backupMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Encrypt &amp; Backup Key</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={backupMutation.isPending}
                                    onClick={() => setShowSkipWarning(true)}
                                    className="w-full py-2 bg-transparent text-neutral-500 hover:text-neutral-400 border-none cursor-pointer font-black text-[10px] tracking-widest outline-none transition-colors"
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
