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
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

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
        <div className="w-full bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl flex flex-col justify-between font-sans text-left transition-colors animate-in fade-in duration-200">
            <div>
                {/* Upper Status Header Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4 mb-5 select-none">
                    <div className="text-left">
                        <span className="text-[10px] font-black font-mono bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 tracking-widest uppercase rounded">
                            INCIDENT AUDIT: #{incident_id}
                        </span>
                        <h2 className="text-lg font-black text-neutral-900 tracking-tight mt-1.5 uppercase flex items-center gap-1.5">
                            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 stroke-[2.5px]" />
                            <span>@{target_user.username}</span>
                        </h2>
                    </div>
                    <div className="text-left sm:text-right font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        SYSTEM LAYER: CRON_SYNC
                    </div>
                </div>
                {/* Disruption Metrics Panel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    {/* Security Detector Metric Box */}
                    <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-col justify-between">
                        <div>
                            <div className="text-[9px] text-neutral-400 font-black tracking-widest uppercase font-mono mb-1 flex items-center gap-1">
                                <Fingerprint className="w-3.5 h-3.5 text-rose-500" />
                                <span>SECURITY DETECTOR MARK:</span>
                            </div>
                            <div className="text-rose-600 font-black font-mono text-sm tracking-wide uppercase">
                                {security_flag.type}
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium leading-relaxed mt-3">
                            {security_flag.description}
                        </p>
                    </div>

                    {/* Registry Delta Data Box */}
                    <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-col justify-between">
                        <div>
                            <div className="text-[9px] text-neutral-400 font-black tracking-widest uppercase font-mono mb-2 flex items-center gap-1">
                                <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span>REGISTRY DELTA DATA:</span>
                            </div>
                            <div className="text-xs space-y-1.5 font-mono font-bold text-neutral-500">
                                <div className="flex justify-between border-b border-neutral-200/60 pb-0.5">
                                    <span>ORCID TARGET ID:</span>
                                    <span className="text-neutral-800 font-black underline">{audit_payload.orcid_id || "N/A"}</span>
                                </div>
                                <div className="flex justify-between border-b border-neutral-200/60 pb-0.5">
                                    <span>HISTORICAL PAPERS:</span>
                                    <span className="text-emerald-600 font-black">{audit_payload.historical_publication_count ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>CURRENT SYNC COUNT:</span>
                                    <span className="text-rose-600 font-black">{audit_payload.scraped_publication_count ?? 0}</span>
                                </div>
                            </div>
                        </div>
                        {audit_payload.last_successful_sync && (
                            <div className="text-[9px] font-mono text-neutral-400 font-bold border-t border-neutral-200/60 pt-2 mt-3 select-none">
                                LAST COMPLIANT SYNC: {new Date(audit_payload.last_successful_sync).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Automated Actions Logging Container */}
                <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl mb-5 text-xs text-neutral-500 select-none">
                    <div className="font-black text-neutral-400 text-[9px] tracking-widest mb-2 uppercase font-mono flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-blue-500" />
                        <span>AUTOMATED SAFETY ACTIONS EXECUTED:</span>
                    </div>
                    <ul className="space-y-1.5 font-medium list-none pl-0 text-left">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-neutral-400 rounded-full shrink-0" />
                            <span>Flipped badge allocation framework to <span className="text-blue-600 font-bold font-mono">ClassicBlue</span> (Shield frozen).</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-neutral-400 rounded-full shrink-0" />
                            <span>Set database modifier flag <span className="text-amber-600 font-bold font-mono">under_investigation: true</span>.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-neutral-400 rounded-full shrink-0" />
                            <span>Dispatched compliance notification sequence to registration email inbox.</span>
                        </li>
                    </ul>
                </div>
                {errorMessage && (
                    <div className="text-xs text-rose-600 font-mono font-bold border border-rose-200 bg-rose-50 p-3 rounded-xl text-center mb-5 animate-in zoom-in-95 select-none">
                        ⚠️ PIPELINE CRITICAL ERROR: {errorMessage}
                    </div>
                )}
            </div>

            {/* Manual Adjudication Controls Row */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-neutral-100 font-mono text-xs uppercase font-bold tracking-wider select-none">
                <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleResolutionAction(resolution_options?.approve_restoration_endpoint, 'RESTORE')}
                    className="flex-1 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 font-black tracking-wide text-white rounded-xl transition-all cursor-pointer outline-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none shadow-sm"
                >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 stroke-[2px]" />}
                    <span>Dismiss Flag &amp; Restore</span>
                </button>

                <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleResolutionAction(resolution_options?.permanent_ban_endpoint, 'BAN')}
                    className="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 font-black tracking-wide text-white rounded-xl transition-all cursor-pointer outline-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none shadow-sm"
                >
                    <Ban className="w-4 h-4 stroke-[2px]" />
                    <span>Permanent Ban Profile</span>
                </button>
            </div>
        </div>
    );
};

export default AdminIncidentPanel;
