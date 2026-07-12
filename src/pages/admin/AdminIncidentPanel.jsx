import { useState } from 'react';

const AdminIncidentPanel = ({ incidentPayload, authToken: propAuthToken, onActionComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { incident_id, target_user, security_flag, audit_payload, resolution_options } = incidentPayload;
    const authToken = propAuthToken || 'mock-user-jwt';
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

    const handleResolutionAction = async (endpoint, actionType) => {
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

            if (!response.ok) throw new Error(`Server rejected ${actionType} workflow execution.`);

            onActionComplete(incident_id, actionType);
        } catch (err) {
            setErrorMessage(err.message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-2xl border border-rose-900/50 bg-surface-container p-6 font-mono text-text-primary glass-card">
            {/* Upper Status Header Block */}
            <div className="flex items-center justify-between border-b border-rose-900/30 pb-4 mb-4">
                <div>
                    <span className="text-xs bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 font-bold tracking-widest">
                        INCIDENT AUDIT: #{incident_id}
                    </span>
                    <h2 className="text-lg font-black mt-2 text-text-primary uppercase">
                        FLAGGED ACCOUNT: @{target_user.username}
                    </h2>
                </div>
                <div className="text-right text-xs text-text-secondary">
                    SYSTEM LAYER: CRON_SYNC
                </div>
            </div>

            {/* Disruption Metrics Panel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-low p-4 border border-white/5">
                    <div className="text-[10px] text-text-secondary font-bold mb-1 uppercase">SECURITY DETECTOR MARK:</div>
                    <div className="text-rose-500 font-bold text-sm tracking-wide">{security_flag.type}</div>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed font-sans">{security_flag.description}</p>
                </div>

                <div className="bg-surface-container-low p-4 border border-white/5 flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] text-text-secondary font-bold mb-1 uppercase">REGISTRY DELTA DATA:</div>
                        <div className="text-xs space-y-1 text-text-secondary">
                            <div>ORCID TARGET ID: <span className="text-text-primary font-bold">{audit_payload.orcid_id}</span></div>
                            <div>HISTORICAL REGISTERED PAPERS: <span className="text-emerald-500 font-bold">{audit_payload.historical_publication_count}</span></div>
                            <div>CURRENT PUBLIC SYNC COUNT: <span className="text-rose-500 font-bold">{audit_payload.scraped_publication_count}</span></div>
                        </div>
                    </div>
                    <div className="text-[10px] text-text-secondary/70 mt-2">
                        LAST COMPLIANT SYNC: {new Date(audit_payload.last_successful_sync).toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* Automated Actions Logging Container */}
            <div className="bg-surface-container-low border border-white/5 p-4 mb-6 text-xs text-text-secondary font-sans">
                <div className="font-bold text-text-secondary/80 mb-2 uppercase font-mono">AUTOMATED SAFETY ACTIONS EXECUTED:</div>
                <ul className="space-y-1 list-disc list-inside">
                    <li>Flipped badge allocation framework to <span className="text-blue-500 font-bold font-mono">ClassicBlue</span> (Shield frozen).</li>
                    <li>Set database boolean modifier <span className="text-yellow-500 font-bold font-mono font-bold">under_investigation: true</span>.</li>
                    <li>Dispatched electronic compliance notification sequence to registration email inbox.</li>
                </ul>
            </div>

            {errorMessage && (
                <div className="text-xs text-rose-500 font-bold border border-rose-950 bg-rose-950/20 p-3 text-center mb-4">
                    ⚠️ PIPELINE CRITICAL ERROR: {errorMessage}
                </div>
            )}

            {/* Manual Adjudication Controls Row */}
            <div className="flex gap-4">
                <button
                    disabled={isProcessing}
                    onClick={() => handleResolutionAction(resolution_options.approve_restoration_endpoint, 'RESTORE')}
                    className="flex-1 p-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider transition-all text-white disabled:opacity-40 cursor-pointer"
                >
                    {isProcessing ? 'PROCESSING...' : '✓ Dismiss Flag & Restore Emerald Shield'}
                </button>

                <button
                    disabled={isProcessing}
                    onClick={() => handleResolutionAction(resolution_options.permanent_ban_endpoint, 'BAN')}
                    className="p-3 bg-rose-600 hover:bg-rose-500 font-bold text-xs uppercase tracking-wider transition-all text-white disabled:opacity-40 cursor-pointer"
                >
                    ☠️ Permanent Ban Profile
                </button>
            </div>
        </div>
    );
};

export default AdminIncidentPanel;
