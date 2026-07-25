// src/pages/campaigns/EndorsementHubPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useConsensusNomineeQuery, useSignPetitionMutation } from '../../features/campaigns/useConsensusFeature';
import {
    Star,
    Gavel,
    Loader2,
    CheckCircle2,
    PenTool,
    Tv,
    ArrowLeft
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const EndorsementHubPageOK = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // 🎛️ Macro Scope Segment: 'higher' | 'local'
    const [macroScope, setMacroScope] = useState('higher');

    // 💊 Sub Tier Segment: 'congress' | 'state_senate' | 'state_rep' | 'municipal'
    const [selectedTier, setSelectedTier] = useState('congress');

    const handleScopeChange = (targetScope) => {
        setMacroScope(targetScope);
        setSelectedTier(targetScope === 'higher' ? 'congress' : 'municipal');
    };

    // 🎯 THE DUAL-FLOW TARGET ASSIGNER
    const activeDistrictCode =
        selectedTier === 'congress' ? currentUser?.district_l1_code || 'TX-10' :
            selectedTier === 'state_senate' ? currentUser?.district_l2_code || 'SD-14' :
                selectedTier === 'state_rep' ? currentUser?.district_l3_code || 'HD-46' :
                    `${currentUser?.city_name || 'Austin'}_${currentUser?.state || 'TX'}`.toLowerCase().replace(/\s+/g, '_');

    // 📡 TanStack Pipelines
    const { data: nominee, isPending, isError } = useConsensusNomineeQuery(selectedTier, activeDistrictCode);
    const signPetitionMutation = useSignPetitionMutation(selectedTier, activeDistrictCode);

    const currentSignatures = nominee?.petition_signatures_count || 0;
    const requiredSignatures = nominee?.signatures_required || 500;
    const progressPercentage = Math.min(100, Math.round((currentSignatures / requiredSignatures) * 100));

    const tierLabels = {
        congress: 'Federal Congressional Representative',
        state_senate: 'State Senate Senator (Upper House)',
        state_rep: 'State Assembly Representative (Lower House)',
        municipal: `Municipal Vetted Nominee (${currentUser?.city_name || 'Local'} City Tier)`
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 Header */}
            <div className="border-b border-outline-variant/40 pb-4 select-none text-center flex flex-col items-center">
                <div className="self-start mb-2">
                    <button
                        onClick={() => navigate('/campaigns/local')}
                        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-bold text-[11px] uppercase tracking-wider border-none bg-transparent cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Assembly Hub
                    </button>
                </div>
                <div className="w-14 h-14 rounded-card bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner animate-pulse">
                    <Star className="w-7 h-7 fill-primary/20 text-primary" />
                </div>
                <h1 className="text-3xl font-black text-text-primary tracking-tight">
                    Consensus Ballot Endorsements
                </h1>
                <p className="text-xs text-text-secondary mt-1">Vetted independent choices who won community debates.</p>
            </div>

            {/* 🏁 STEP 1: MACRO SCOPE SWITCHBOARD BAR */}
            <div className="flex bg-surface-container-low border border-outline-variant/60 p-1 rounded-xl select-none">
                <button
                    type="button"
                    onClick={() => handleScopeChange('higher')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${macroScope === 'higher' ? 'bg-surface-container-high border-outline-variant text-text-primary font-black shadow-md' : 'text-text-secondary border-transparent hover:text-text-primary bg-transparent'
                        }`}
                >
                    Higher Ballots
                </button>
                <button
                    type="button"
                    onClick={() => handleScopeChange('local')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${macroScope === 'local' ? 'bg-surface-container-high border-outline-variant text-text-primary font-black shadow-md' : 'text-text-secondary border-transparent hover:text-text-primary bg-transparent'
                        }`}
                >
                    Local Ballots
                </button>
            </div>

            {/* 💊 STEP 2: INNER SUB-TIER BUTTON ROW (Rendered contextually based on selected Macro Scope) */}
            {macroScope === 'higher' && (
                <div className="flex bg-surface-container-lowest p-1 rounded-xl select-none gap-1 border border-outline-variant/40">
                    {['congress', 'state_senate', 'state_rep'].map((tierKey) => (
                        <button
                            key={tierKey}
                            type="button"
                            onClick={() => setSelectedTier(tierKey)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border border-transparent cursor-pointer ${selectedTier === tierKey ? 'bg-surface-container-high text-text-primary font-black border-outline-variant' : 'text-text-secondary hover:text-text-primary bg-transparent'
                                }`}
                        >
                            {tierKey === 'congress' ? 'Federal' : tierKey === 'state_senate' ? 'Upper' : 'Lower'}
                        </button>
                    ))}
                </div>
            )}

            {/* (Rest of the Nominee Spotlight cards, progress bars, and petition signing action logic mount natively below...) */}
            {/* 🥞 NOMINEE DATA PRESENTATION CANVAS */}
            {isPending ? (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-3 bg-surface-container/20 border border-outline-variant/40 rounded-card">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                        Resolving nominee parameters...
                    </span>
                </div>
            ) : isError || !nominee ? (
                <div className="p-16 text-center border border-dashed border-outline-variant bg-surface-container/40 rounded-card flex flex-col items-center justify-center space-y-2">
                    <Gavel className="w-10 h-10 text-text-secondary/30 mb-1" />
                    <p className="text-base font-bold text-text-primary">
                        No consensus nominee confirmed for {activeDistrictCode} yet.
                    </p>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                        Debate town halls are currently coordinating. The candidate who wins the local voter vote will automatically fill this spot.
                    </p>
                </div>
            ) : (
                <div className="bg-surface-container border border-outline-variant/80 p-6 sm:p-8 rounded-card shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden animate-in fade-in duration-300">

                    {/* Office Badge Metadata Ribbon */}
                    <div className="text-xs font-mono font-bold uppercase text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 select-none">
                        {tierLabels[selectedTier]} · District {nominee.district_code}
                    </div>

                    {/* Profile Picture Frame */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-card overflow-hidden border-4 border-surface-container-low bg-surface-container-high shadow-2xl shrink-0 select-none">
                        <img
                            src={nominee.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                            alt={nominee.user?.name || "Nominee Avatar"}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                            {nominee.user?.name}
                        </h2>
                        <p className="text-xs sm:text-sm font-mono font-bold text-primary uppercase tracking-wider">
                            Background: {nominee.user?.profession || 'Working Class Professional'}
                        </p>
                    </div>

                    {/* Campaign Manifesto Block */}
                    <p className="text-sm sm:text-base text-text-primary leading-relaxed bg-surface-container-low p-5 rounded-card border border-outline-variant/60 max-w-xl font-medium whitespace-pre-wrap text-left sm:text-center italic">
                        "{nominee.title}: {nominee.user?.manifesto || 'Platform guidelines are being compiled across the localized district nodes.'}"
                    </p>

                    {/* PROGRESS BAR: REAL-LIFE BALLOT ACCESS TRACKER */}
                    <div className="w-full max-w-lg flex flex-col gap-2 select-none pt-2">
                        <div className="flex justify-between font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">
                            <span>Ballot Signature Progress</span>
                            <span className="text-text-primary font-black">
                                {currentSignatures} / {requiredSignatures} ({progressPercentage}%)
                            </span>
                        </div>

                        <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/60">
                            <div
                                className="h-full bg-primary transition-all duration-500 rounded-full shadow-xs"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Action Interaction Controls Bar */}
                    <div className="flex flex-col sm:flex-row gap-3.5 pt-3 w-full max-w-lg select-none">
                        <button
                            type="button"
                            disabled={nominee.has_signed_petition || signPetitionMutation.isPending}
                            onClick={() => signPetitionMutation.mutate(nominee.id)}
                            className={cn(
                                "flex-1 px-6 py-3.5 text-xs sm:text-sm font-bold rounded-card border-none uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98",
                                nominee.has_signed_petition
                                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default"
                                    : "bg-primary hover:brightness-110 text-on-primary font-black"
                            )}
                        >
                            {signPetitionMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Signing Petition...</span>
                                </>
                            ) : nominee.has_signed_petition ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Signed Endorsement ✓</span>
                                </>
                            ) : (
                                <>
                                    <PenTool className="w-4 h-4" />
                                    <span>Sign Ballot Petition</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="px-6 py-3.5 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-text-primary font-bold text-xs sm:text-sm rounded-card transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Tv className="w-4 h-4 text-text-secondary" />
                            <span>Watch Vetted Debate</span>
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};
