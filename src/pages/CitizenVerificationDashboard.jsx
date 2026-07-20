import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestVouchToken } from '../components/RequestVouchToken';
import { VerifyPeerScanner } from '../components/VerifyPeerScanner';
import VerificationBadge from '../components/VerificationBadge';
import { useAuthStore } from '../store/auth/useAuthStore';
import {
    ArrowLeft,
    QrCode,
    Scan,
    ShieldAlert,
    ShieldCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Main Citizen P2P Verification Hub Layout
 * Handles switching between presenting a single-use QR and spawning the camera thread.
 */
const CitizenVerificationDashboard = ({ userToken: propUserToken, accountProfile: propAccountProfile }) => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const accountProfile = propAccountProfile || user || { username: 'anonymous', vouch_count: 1, account_tier: 0 };
    const userToken = propUserToken || 'mock-user-jwt';

    // Active panel view context: 'GENERATE' | 'SCAN'
    const [activeTab, setActiveTab] = useState('GENERATE');

    // Track local vouch tally increments
    const [liveVouchCount, setLiveVouchCount] = useState(accountProfile.vouch_count || 0);
    const [currentTier, setCurrentTier] = useState(accountProfile.account_tier || 0);

    const isVerifiedConstituent = currentTier >= 1 || liveVouchCount >= 3;

    const handleVouchSuccess = (data) => {
        if (data?.current_vouches !== undefined) {
            setLiveVouchCount(data.current_vouches);
            localStorage.setItem("mock_vouch_count", data.current_vouches.toString());
        }
        if (data?.current_vouches >= 3 && currentTier === 0) {
            setCurrentTier(1);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-4 font-sans">

            {/* Top Back Navigation Bar */}
            <div className="flex justify-start">
                <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none outline-none group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Settings</span>
                </button>
            </div>

            {/* Main Surface Card Window */}
            <div className="w-full bg-surface-container text-text-primary p-5 sm:p-6 rounded-card border border-outline-variant shadow-2xl flex flex-col justify-between">

                {/* 📊 Upper Local Network Profile Status Panel */}
                <div className="bg-surface-container-low p-4 rounded-card border border-outline-variant/60 mb-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                                Local Node ID
                            </div>
                            <div className="text-lg sm:text-base font-bold text-text-primary flex items-center gap-1.5 mt-0.5">
                                @{accountProfile.username}
                                <VerificationBadge
                                    type="citizen"
                                    size="md"
                                    className={cn(!isVerifiedConstituent && "opacity-30 grayscale")}
                                />
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
                                Vouch Progress
                            </div>
                            <div className="text-lg sm:text-base font-bold text-tertiary mt-0.5">
                                {liveVouchCount} / 3 <span className="text-text-secondary text-sm font-medium">VOUCHES</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator Dots */}
                    <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full transition-all",
                                    liveVouchCount >= step
                                        ? "bg-tertiary shadow-xs"
                                        : "bg-surface-container-highest/40"
                                )}
                            />
                        ))}
                    </div>

                    <div className="border-t border-outline-variant/40 pt-2 text-sm flex justify-between text-text-secondary font-medium">
                        <span>Tether District:</span>
                        <span className="text-text-primary font-bold uppercase">
                            {accountProfile.constituency_id?.replace(/_/g, ' ') || 'ZONE 4-A'}
                        </span>
                    </div>
                </div>

                {/* 🧭 Industrial Tab Controls */}
                <div className="flex p-1 rounded-card border border-outline-variant/60 mb-6 bg-surface-container-low gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('GENERATE')}
                        className={cn(
                            "flex-1 py-2.5 px-3 rounded-card text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-none",
                            activeTab === 'GENERATE'
                                ? "bg-surface-container-high text-tertiary shadow-xs"
                                : "text-text-secondary hover:text-text-primary bg-transparent"
                        )}
                    >
                        <QrCode className="w-4 h-4 shrink-0" />
                        <span>Get Vouch QR</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (!isVerifiedConstituent) return;
                            setActiveTab('SCAN');
                        }}
                        disabled={!isVerifiedConstituent}
                        className={cn(
                            "flex-1 py-2.5 px-3 rounded-card text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-none relative",
                            !isVerifiedConstituent
                                ? "opacity-30 cursor-not-allowed text-text-secondary bg-transparent"
                                : activeTab === 'SCAN'
                                    ? "bg-surface-container-high text-error shadow-xs"
                                    : "text-text-secondary hover:text-text-primary bg-transparent"
                        )}
                        title={!isVerifiedConstituent ? "You must be verified by 3 local peers before scanning others." : ""}
                    >
                        <Scan className="w-4 h-4 shrink-0" />
                        <span>Scan Peer Code</span>
                    </button>
                </div>

                {/* 🔄 Dynamic Context Injection Component View */}
                <div className="flex-1 flex items-center justify-center bg-surface-container-low/40 p-3 rounded-card border border-outline-variant/40 min-h-[320px]">
                    {activeTab === 'GENERATE' ? (
                        <RequestVouchToken userToken={userToken} />
                    ) : (
                        <VerifyPeerScanner userToken={userToken} onVouchSuccess={handleVouchSuccess} />
                    )}
                </div>

                {/* ℹ️ Sub-Footer Context Alert Notice */}
                <div className="mt-6 pt-3 border-t border-outline-variant/40 text-[14px] font-medium leading-relaxed text-text-secondary text-center flex items-center justify-center gap-2">
                    {!isVerifiedConstituent ? (
                        <>
                            <ShieldAlert className="w-6 h-6 text-secondary shrink-0" />
                            <span>Notice: Meet with 3 verified local workers in person to activate peer auditing capabilities.</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                            <span>Authorization Clear: Scan peer QR codes strictly inside your assigned legislative boundary.</span>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CitizenVerificationDashboard;