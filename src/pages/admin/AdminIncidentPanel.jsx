// src/components/AdminIncidentPanel.jsx
import React, { useState } from 'react';
import { ShieldAlert, Fingerprint, FileCheck, Cpu, Ban, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export const AdminIncidentPanel = ({ incidentPayload, authToken: propAuthToken, onActionComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Safe defensive extraction metrics assignment blocks to protect against nulls
    const incident_id = incidentPayload?.incident_id || "0";
    const target_user = incidentPayload?.target_user || { username: "unknown" };
    const security_flag = incidentPayload?.security_flag || { type: "FLAG_UNSET", description: "No descriptor available." };
    const audit_payload = incidentPayload?.audit_payload || {};
    const resolution_options = incidentPayload?.resolution_options || {};

    const authToken = propAuthToken || localStorage.getItem("user_token") || 'mock-user-jwt';
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api/v1';

    const handleResolutionAction = async (endpoint, actionType) => {
        if (!endpoint) {
            setErrorMessage(`Action endpoint for ${actionType} is not registered.`);
            return;
        }
        setIsProcessing(true);
        setErrorMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) throw new Error(`Server rejected ${actionType} workflow execution payload.`);

            if (typeof onActionComplete === 'function') {
                onActionComplete(incident_id, actionType);
            }
        } catch (err) {
            setErrorMessage(err.message || "An unexpected network pipeline error occurred.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full bg-white dark:bg-[#141414] border border-neutral-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl flex flex-col justify-between font-sans text-left transition-colors animate-in fade-in duration-200 text-neutral-900 dark:text-white">
            <div>
                {/* Upper Status Header Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-neutral-100 dark:border-white/10 pb-4 mb-5 select-none">
                    <div className="text-left">
                        <span className="text-[10px] font-black font-mono bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-2.5 py-1 tracking-widest uppercase rounded-md inline-block">
                            INCIDENT AUDIT: #{incident_id}
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight mt-2 uppercase flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 stroke-[2.5px]" />
                            <span className="truncate">@{target_user.username}</span>
                        </h2>
                    </div>
                    <div className="text-left sm:text-right font-mono text-[11px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider shrink-0">
                        SYSTEM LAYER: CRON_SYNC
                    </div>
                </div>

                {/* Disruption Metrics Panel Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                    {/* Security Detector Metric Box */}
                    <div className="bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                        <div>
                            <div className="text-[10px] text-neutral-400 dark:text-neutral-400 font-black tracking-widest uppercase font-mono mb-1.5 flex items-center gap-1.5">
                                <Fingerprint className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>SECURITY DETECTOR MARK:</span>
                            </div>
                            <div className="text-rose-600 dark:text-rose-400 font-black font-mono text-sm sm:text-base tracking-wide uppercase break-all">
                                {security_flag.type}
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed mt-3">
                            {security_flag.description}
                        </p>
                    </div>

                    {/* Registry Delta Data Box */}
                    <div className="bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                        <div>
                            <div className="text-[10px] text-neutral-400 dark:text-neutral-400 font-black tracking-widest uppercase font-mono mb-2.5 flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>REGISTRY DELTA DATA:</span>
                            </div>
                            <div className="text-xs sm:text-sm space-y-2 font-mono font-bold text-neutral-600 dark:text-neutral-300">
                                <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-white/10 pb-1.5 gap-2">
                                    <span className="text-neutral-400 dark:text-neutral-400">ORCID TARGET ID:</span>
                                    <span className="text-neutral-800 dark:text-white font-black underline truncate max-w-[180px]">{audit_payload.orcid_id || "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-white/10 pb-1.5 gap-2">
                                    <span className="text-neutral-400 dark:text-neutral-400">HISTORICAL PAPERS:</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black">{audit_payload.historical_publication_count ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-neutral-400 dark:text-neutral-400">CURRENT SYNC COUNT:</span>
                                    <span className="text-rose-600 dark:text-rose-400 font-black">{audit_payload.scraped_publication_count ?? 0}</span>
                                </div>
                            </div>
                        </div>
                        {audit_payload.last_successful_sync && (
                            <div className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 font-bold border-t border-neutral-200/60 dark:border-white/10 pt-2.5 mt-3 select-none">
                                LAST COMPLIANT SYNC: {new Date(audit_payload.last_successful_sync).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Automated Actions Logging Container */}
                <div className="bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl mb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 select-none">
                    <div className="font-black text-neutral-400 dark:text-neutral-400 text-[10px] tracking-widest mb-2.5 uppercase font-mono flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>AUTOMATED SAFETY ACTIONS EXECUTED:</span>
                    </div>
                    <ul className="space-y-2 font-medium list-none pl-0 text-left">
                        <li className="flex items-start gap-2.5">
                            <span className="h-1.5 w-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full shrink-0 mt-1.5" />
                            <span>Flipped badge allocation framework to <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">ClassicBlue</span> (Shield frozen).</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="h-1.5 w-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full shrink-0 mt-1.5" />
                            <span>Set database modifier flag <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">under_investigation: true</span>.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="h-1.5 w-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full shrink-0 mt-1.5" />
                            <span>Dispatched compliance notification sequence to registration email inbox.</span>
                        </li>
                    </ul>
                </div>

                {errorMessage && (
                    <div className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-mono font-bold border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3.5 rounded-xl text-center mb-5 animate-in zoom-in-95 select-none">
                        ⚠️ PIPELINE CRITICAL ERROR: {errorMessage}
                    </div>
                )}
            </div>

            {/* Manual Adjudication Controls Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-neutral-100 dark:border-white/10 font-mono text-xs uppercase font-bold tracking-wider select-none">
                <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleResolutionAction(resolution_options?.approve_restoration_endpoint, 'RESTORE')}
                    className="flex-1 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 font-black tracking-wide text-white rounded-xl transition-all cursor-pointer outline-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none shadow-sm min-h-[44px]"
                >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 stroke-[2.5px]" />}
                    <span>Dismiss Flag &amp; Restore</span>
                </button>

                <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleResolutionAction(resolution_options?.permanent_ban_endpoint, 'BAN')}
                    className="flex-1 sm:flex-none px-5 py-3.5 bg-rose-600 hover:bg-rose-500 font-black tracking-wide text-white rounded-xl transition-all cursor-pointer outline-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none shadow-sm min-h-[44px]"
                >
                    <Ban className="w-4 h-4 stroke-[2.5px]" />
                    <span>Permanent Ban Profile</span>
                </button>
            </div>
        </div>
    );
};

export default AdminIncidentPanel;
