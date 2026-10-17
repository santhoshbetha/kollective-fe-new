// src/features/conversations/components/ChatPinSetupDialog.jsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { backupPrivateKeyToServer } from '../../../utils/cryptoBackup';
import { ShieldCheck, KeyRound, Loader2, AlertCircle } from 'lucide-react';

export function ChatPinSetupDialog({ userUuid, onComplete }) {
    const navigate = useNavigate();
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [statusText, setStatusText] = useState("");

    // 🚀 BACKUP EXECUTION MUTATION
    const backupMutation = useMutation({
        mutationFn: async (pinString) => {
            // Retrieve the active raw key material cached during the previous registration step
            const rawSk = localStorage.getItem("active_session_private_key");
            if (!rawSk) {
                throw new Error("Local private key matrix not resolved inside browser isolation memory.");
            }
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
            console.error("Zero-Knowledge secure backup transaction aborted:", err);
            setErrorMsg(err?.message || "Failed to commit backup payload to server registers.");
            setStatusText("");
        }
    });

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (pin.length < 4) {
            setErrorMsg("Security PIN must be at least 4 digits long.");
            return;
        }
        if (pin !== confirmPin) {
            setErrorMsg("PIN entries do not match. Please verify parameters.");
            return;
        }

        setStatusText("Deriving PBKDF2 encryption key matrix...");
        backupMutation.mutate(pin);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="bg-[#141414] border border-white/10 rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-left transform animate-in zoom-in-95 duration-200">

                {/* Header Section */}
                <div className="text-center pb-2 border-b border-white/5">
                    <div className="flex h-12 w-12 bg-primary-container/10 border border-primary-container/20 rounded-2xl items-center justify-center mx-auto mb-3 text-primary-container">
                        <ShieldCheck className="w-6 h-6 stroke-[2.5px]" />
                    </div>
                    <h3 className="text-base font-black text-white tracking-tight">Secure Chat History</h3>
                    <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-[260px] mx-auto mt-1">
                        Create a Chat Sync PIN to encrypt and backup your private key. You will need this to access chats on other devices [1.4].
                    </p>
                </div>

                {/* Form Wrapper */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 ml-1">Create Chat PIN</label>
                        <input
                            type="password"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="6"
                            placeholder="••••"
                            disabled={backupMutation.isPending}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-center bg-[#181818] border border-white/10 py-3 text-lg tracking-widest text-white rounded-xl focus:border-primary-container focus:outline-none font-mono font-bold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 ml-1">Confirm Chat PIN</label>
                        <input
                            type="password"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="6"
                            placeholder="••••"
                            disabled={backupMutation.isPending}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-center bg-[#181818] border border-white/10 py-3 text-lg tracking-widest text-white rounded-xl focus:border-primary-container focus:outline-none font-mono font-bold"
                        />
                    </div>

                    {/* Feedback states templates handlers */}
                    {errorMsg && (
                        <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl flex items-center gap-2 text-xs font-medium leading-tight">
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

                    {/* Submit Handler Button */}
                    <button
                        type="submit"
                        disabled={backupMutation.isPending || pin.length < 4 || pin !== confirmPin}
                        className="w-full py-3 bg-primary-container text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:brightness-105 transition-all shadow-md active:scale-95 border-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                        {backupMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Encrypt &amp; Backup Key</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
