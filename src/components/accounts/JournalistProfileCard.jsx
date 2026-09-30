import { useState } from 'react';
import VerificationBadge from './VerificationBadge';

const JournalistProfileCard = ({ profileData }) => {
    const [showPressPass, setShowPressPass] = useState(false);
    const { username, bio, badge_type, metadata } = profileData;
    const isJournalist = badge_type === 'ProfessionalTeal' || badge_type === 'journalist';

    return (
        <div className="w-full max-w-xl border border-white/10 bg-surface-container p-6 font-mono text-text-primary glass-card">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 text-xl">
                        <h2 className="font-bold text-text-primary">@{username}</h2>
                        {/* Renders the Google verified_user shield in vibrant Professional Teal text */}
                        <VerificationBadge type="journalist" />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                        Affiliation: {metadata?.primary_outlet || "Independent Correspondent"}
                    </p>
                </div>

                {isJournalist && metadata?.portfolio_url && (
                    <button
                        onClick={() => setShowPressPass(!showPressPass)}
                        className="text-xs border border-teal-600/40 text-teal-500 hover:bg-teal-500/10 px-3 py-1 bg-transparent font-bold transition-all cursor-pointer"
                    >
                        {showPressPass ? 'HIDE BYLINES' : 'VIEW PRESS PASS'}
                    </button>
                )}
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-4">{bio}</p>

            {/* 📰 REUSED COLLAPSIBLE CREDENTIAL DATA DRAWER */}
            {isJournalist && showPressPass && metadata?.portfolio_url && (
                <div className="border-t border-dashed border-white/10 pt-4 mt-4 bg-surface-container-low p-4 rounded-none space-y-4">
                    <div>
                        <div className="text-xs font-bold text-teal-500 dark:text-teal-400 tracking-wider mb-2">
                            VERIFIED MEDIA AUDIT TRAILS
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span>CREDENTIAL SYSTEM:</span>
                                <span className="text-text-primary font-bold">DIGITAL PORTFOLIO INDEX</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1 items-center">
                                <span>VERIFIED BYLINE LINK:</span>
                                <a href={metadata.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline flex items-center gap-1 hover:text-blue-400">
                                    Open Press Portfolio<span>↗</span>
                                </a>
                            </div>
                            <div className="flex justify-between">
                                <span>INTEGRITY CLEARANCE:</span>
                                <span className="text-teal-500 dark:text-teal-400 font-bold">✓ SYNCED MEDIA PRESS PROFILE</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalistProfileCard;
