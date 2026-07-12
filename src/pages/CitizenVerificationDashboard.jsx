import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestVouchToken } from '../components/RequestVouchToken';
import { VerifyPeerScanner } from '../components/VerifyPeerScanner';
import VerificationBadge from '../components/VerificationBadge';
import { useAuthStore } from '../store/auth/useAuthStore';

/**
 * Main Citizen P2P Verification Hub Layout
 * Handles switching between presenting a single-use QR and spawning the camera thread.
 */
const CitizenVerificationDashboard = ({ userToken: propUserToken, accountProfile: propAccountProfile }) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const accountProfile = propAccountProfile || user || { username: 'anonymous', vouch_count: 1, account_tier: 0 };
    const userToken = propUserToken || 'mock-user-jwt';

    // Navigation active panel view context: 'GENERATE' or 'SCAN'
    const [activeTab, setActiveTab] = useState('GENERATE');

    // Track local vouch tally increments live in screen components memory
    const [liveVouchCount, setLiveVouchCount] = useState(accountProfile.vouch_count || 0);
    const [currentTier, setCurrentTier] = useState(accountProfile.account_tier || 0);

    const isVerifiedConstituent = currentTier >= 1 || liveVouchCount >= 3;

    const handleVouchSuccess = (data) => {
        if (data.current_vouches) {
            setLiveVouchCount(data.current_vouches);
            localStorage.setItem("mock_vouch_count", data.current_vouches.toString());
        }
        // If the backend transaction automatically elevates the user, update state properties
        if (data.current_vouches >= 3 && currentTier === 0) {
            setCurrentTier(1);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-3">
            <div className="flex justify-start">
                <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Settings
                </button>
            </div>

            <div className="w-full bg-surface-container text-text-primary font-mono p-4 min-h-[80vh] flex flex-col justify-between border border-white/10 glass-card">
                {/* 📊 Upper Local Network Profile Status Panel Grid */}
                <div className="bg-surface-container-low p-4 border border-white/5 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[14px] text-text-secondary font-bold tracking-wider uppercase">LOCAL NETWORK NODE ID:</div>
                            <div className="text-md font-bold text-text-primary flex items-center gap-1.5 mt-0.5">
                                @{accountProfile.username}
                                <VerificationBadge type={isVerifiedConstituent ? "citizen" : "citizen"} className={!isVerifiedConstituent ? "opacity-30 grayscale" : ""} />
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[14px] text-text-secondary font-bold tracking-wider uppercase">VOUCH TALLY:</div>
                            <div className="text-md font-bold text-blue-500 mt-0.5">
                                {liveVouchCount} / 3 <span className="text-text-secondary text-md font-normal">VOUCHES</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/5 mt-3 pt-2 text-[15px] flex justify-between text-text-secondary">
                        <span>Tether District:</span>
                        <span className="text-text-primary uppercase font-bold">{accountProfile.constituency_id?.replace(/_/g, ' ') || 'ZONE 4-A'}</span>
                    </div>
                </div>

                {/* 🧭 Rebellious Industrial Switching Navigation Tabs */}
                <div className="flex border border-white/10 mb-6 bg-surface-container-low">
                    <button
                        onClick={() => setActiveTab('GENERATE')}
                        className={`flex-1 p-3 text-xs font-bold uppercase tracking-wider transition-all border-r border-white/10 cursor-pointer bg-transparent ${activeTab === 'GENERATE'
                            ? 'bg-surface-container-high text-blue-500 font-black'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        🎴 Get Vouch QR
                    </button>

                    <button
                        onClick={() => {
                            // Anti-Fraud Guard: Unverified users cannot scan others to prevent chain-link spoofing
                            if (!isVerifiedConstituent) return;
                            setActiveTab('SCAN');
                        }}
                        disabled={!isVerifiedConstituent}
                        className={`flex-1 p-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-transparent ${!isVerifiedConstituent
                            ? 'opacity-25 cursor-not-allowed text-text-secondary/50'
                            : activeTab === 'SCAN'
                                ? 'bg-surface-container-high text-rose-500 font-black'
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                        title={!isVerifiedConstituent ? "You must be verified by 3 local peers before you can audit others." : ""}
                    >
                        📷 Scan Peer Code
                    </button>
                </div>

                {/* 🔄 Dynamic Context Injection Component Rendering Layout */}
                <div className="flex-1 flex items-center justify-center bg-surface-container-lowest/20 p-2 border border-white/5">
                    {activeTab === 'GENERATE' ? (
                        <RequestVouchToken userToken={userToken} />
                    ) : (
                        <VerifyPeerScanner userToken={userToken} onVouchSuccess={handleVouchSuccess} />
                    )}
                </div>

                {/* ℹ️ Sub-Footer Context Guide Alerts */}
                <div className="text-[14px] text-text-secondary/90 text-center mt-6 leading-relaxed uppercase border-t border-white/5 pt-3">
                    {!isVerifiedConstituent
                        ? "⚠️ Notice: You must meet with 3 verified local workers in person to secure your district voting status configuration."
                        : "✓ Authorization Clear: Use your camera axis exclusively to verify citizens inside your exact legislative boundary lines."
                    }
                </div>
            </div>
        </div>
    );
};

export default CitizenVerificationDashboard;
