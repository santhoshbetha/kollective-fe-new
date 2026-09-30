import { useState } from 'react';
import VerificationBadge from './VerificationBadge';

const OrganizationProfileCard = ({ profileData }) => {
    const [showLog, setShowLog] = useState(false);
    const { username, bio, badge_type, metadata } = profileData;

    const isWarned = badge_type === 'WarnedYellow' || badge_type === 'warned';
    const correctionLog = metadata?.correction_log || [];

    return (
        <div className={`w-full max-w-xl border bg-surface-container p-6 font-mono text-text-primary transition-colors duration-300 glass-card ${
            isWarned ? 'border-yellow-500 shadow-[0_0_15px_rgba(244,208,0,0.05)]' : 'border-white/10'
        }`}>

            {/* Upper Status Block */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 text-xl">
                        <h2 className="font-bold text-text-primary">@{username}</h2>
                        {/* Swaps automatically between Gold Shield and Yellow Warning Shield based on DB status */}
                        <VerificationBadge type={isWarned ? "warned" : "organization"} />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                        Classification: Institutional Publisher
                    </p>
                </div>

                <button
                    onClick={() => setShowLog(!showLog)}
                    className="text-xs border border-white/5 hover:border-white/10 px-3 py-1 bg-surface-container-high font-bold transition-all text-text-secondary hover:text-text-primary cursor-pointer"
                >
                    {showLog ? 'HIDE AUDIT' : `CORRECTION LOG (${correctionLog.length})`}
                </button>
            </div>

            {/* ⚠️ CRITICAL WARNING BANNER IF PENALIZED */}
            {isWarned && (
                <div className="border border-yellow-500/30 bg-yellow-500/10 p-4 mb-4 text-xs text-yellow-600 dark:text-yellow-400 leading-relaxed">
                    <div className="font-bold uppercase mb-1">⚠️ SYSTEM TRANSPARENCY WARNING FLAG:</div>
                    This institutional media publisher is serving a 30-day probation penalty for violating platform truth standards.
                    <div className="mt-2 text-text-secondary italic">Reason: "{metadata?.strike_reason}"</div>
                </div>
            )}

            <p className="text-sm text-text-secondary leading-relaxed mb-4">{bio}</p>

            {/* 📜 CHRONOLOGICAL ACCOUNTABILITY LOG DRAWER */}
            {showLog && (
                <div className="border-t border-dashed border-white/10 pt-4 mt-4 bg-surface-container-low p-4 rounded-none space-y-4">
                    <div className="text-xs font-bold text-text-secondary tracking-wider uppercase">
                        PUBLIC TRUST & RETRACTION MANIFEST
                    </div>

                    {correctionLog.length === 0 ? (
                        <p className="text-xs text-text-secondary/50 italic">No retractions or forced corrections logged inside active database cycle.</p>
                    ) : (
                        <div className="space-y-3">
                            {correctionLog.map((log, idx) => (
                                <div key={idx} className="text-xs border border-white/5 bg-surface-container-lowest/40 p-3 rounded-none space-y-2">
                                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold">
                                        <span>INDEX LOG: #00{idx + 1}</span>
                                        <span>FILED: {new Date(log.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-text-primary font-bold text-xs">
                                        ORIGINAL CLAIM: <span className="text-text-secondary line-through font-normal">{log.original_claim}</span>
                                    </div>
                                    <div className="text-emerald-500 dark:text-emerald-400 bg-emerald-950/20 p-2 border-l border-emerald-500 font-sans leading-normal">
                                        <span className="font-mono font-bold text-[10px] block text-emerald-500 mb-0.5">VERIFIED CORRECTION:</span>
                                        {log.correction_fact}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrganizationProfileCard;
