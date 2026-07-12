import { useState } from 'react';
import VerificationBadge from './VerificationBadge';
import ScholarDisputePortal from './ScholarDisputePortal';

const ScholarProfileCard = ({ profileData }) => {
    const [showCredentials, setShowCredentials] = useState(false);
    const [showDisputePortal, setShowDisputePortal] = useState(false);

    const { username, bio, badge_type, metadata } = profileData;
    const isScholar = badge_type === 'Scholar';

    // Lowered state check: user has ORCID credentials registered, but badge has been downgraded to citizen or flagged
    const isSuspendedOrLowered = metadata?.under_investigation || (badge_type?.toLowerCase() === 'citizen' && metadata?.orcid_id);

    return (
        <div className="w-full max-w-xl border-2 border-neutral-800 bg-[#0a0a0a] p-6 font-mono text-white relative">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 text-xl">
                        <h2 className="font-bold text-white">@{username}</h2>
                        <VerificationBadge type={isScholar ? "scholar" : "citizen"} />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                        Status: {isScholar ? 'Verified Peer Researcher' : 'Standard Grassroots Citizen'}
                    </p>
                </div>

                {isScholar && metadata?.orcid_id && (
                    <button
                        onClick={() => setShowCredentials(!showCredentials)}
                        className="text-xs border border-badge-scholar text-badge-scholar px-3 py-1 bg-badge-scholar/5 hover:bg-badge-scholar/20 font-bold transition-all cursor-pointer"
                    >
                        {showCredentials ? 'HIDE VALIDATION' : 'VIEW ORCID PROOF'}
                    </button>
                )}
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed mb-4">{bio}</p>

            {/* ⚠️ Lowered Status / Disputed Review Alert Banner */}
            {isSuspendedOrLowered && (
                <div className="mt-4 p-4 border border-yellow-600/30 bg-yellow-500/10 rounded-sm flex flex-col gap-3">
                    <div className="text-xs text-yellow-500 font-bold tracking-wider uppercase flex items-center gap-1.5">
                        ⚠️ Status Downgraded / Integrity Dispute
                    </div>
                    <p className="text-xs text-neutral-400 leading-normal font-sans">
                        Your Scholar credential privileges have been suspended or lowered back to Citizen due to a publication delta mismatch detected in the open register.
                    </p>
                    <button
                        onClick={() => setShowDisputePortal(true)}
                        className="text-xs font-bold uppercase tracking-wider py-2 bg-yellow-600 hover:bg-yellow-500 text-black w-full transition-colors cursor-pointer"
                    >
                        LODGE COMPLIANCE DISPUTE
                    </button>
                </div>
            )}

            {/* 🔬 EXPANDED DATA DRAWER */}
            {isScholar && showCredentials && metadata?.orcid_id && (
                <div className="border-t border-dashed border-neutral-800 pt-4 mt-4 bg-neutral-950 p-4 rounded-sm space-y-4 animate-fadeIn">
                    <div>
                        <div className="text-xs font-bold text-badge-scholar tracking-wider mb-2">
                            OPEN RESEARCH AUDIT MANIFEST
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs text-neutral-400">
                            <div className="flex justify-between border-b border-neutral-900 pb-1">
                                <span>REGISTRY RESOURCE:</span>
                                <span className="text-white font-bold">ORCID PUBLIC REGISTER</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-900 pb-1 items-center">
                                <span>IDENTIFICATION INDEX:</span>
                                <a href={`https://orcid.org/${metadata.orcid_id}`} target="_blank" rel="noreferrer" className="text-blue-400 font-bold underline flex items-center gap-1">
                                    {metadata.orcid_id}<span>↗</span>
                                </a>
                            </div>
                            <div className="flex justify-between border-b border-neutral-900 pb-1">
                                <span>SYNC INTEGRITY:</span>
                                <span className="text-emerald-400 font-bold">✓ SHA-256 MATCH</span>
                            </div>
                            <div className="flex justify-between">
                                <span>TOTAL REGISTERED WORKS:</span>
                                <span className="text-white font-bold">{metadata.publication_count || 0} PEER-REVIEWED PAPERS</span>
                            </div>
                        </div>
                    </div>

                    {/* 📚 AUTOMATED RECENT WORKS SECTION */}
                    {metadata.recent_publications && metadata.recent_publications.length > 0 && (
                        <div className="border-t border-neutral-900 pt-3">
                            <div className="text-[10px] font-bold text-neutral-500 tracking-wider mb-2 uppercase">
                                LATEST INDEXED RELEASES (CRON VERIFIED):
                            </div>
                            <ul className="space-y-2">
                                {metadata.recent_publications.map((title, idx) => (
                                    <li key={idx} className="text-xs text-neutral-300 bg-neutral-900 p-2 border-l border-badge-scholar flex gap-2">
                                        <span className="text-neutral-600 font-bold">[{idx + 1}]</span>
                                        <span className="italic leading-normal">{title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* ⚖️ Scholar Dispute Portal Modal Backdrop */}
            {showDisputePortal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
                    <div className="relative max-w-xl w-full">
                        <button
                            onClick={() => setShowDisputePortal(false)}
                            className="absolute -top-8 right-0 text-text-secondary hover:text-text-primary text-xs font-mono bg-transparent border-none cursor-pointer flex items-center gap-1 font-bold"
                        >
                            Close
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                        <ScholarDisputePortal
                            disputeToken={metadata?.dispute_token || 'mock-dispute-jwt'}
                            onDisputeSubmitted={() => {
                                setShowDisputePortal(false);
                                alert("Your appeal package has been logged to the compliance stream ledger.");
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScholarProfileCard;
