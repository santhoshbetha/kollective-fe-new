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

export const EndorsementHubPage = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // Macro Scope Segment: 'higher' | 'local'
    const [macroScope, setMacroScope] = useState('higher');

    // Sub Tier Segment: 'congress' | 'state_senate' | 'state_rep' | local offices...
    const [selectedTier, setSelectedTier] = useState('congress');

    const handleScopeChange = (targetScope) => {
        setMacroScope(targetScope);
        setSelectedTier(targetScope === 'higher' ? 'congress' : 'school_board_member');
    };

    // Dual-Flow Target Assigner
    const activeDistrictCode =
        selectedTier === 'congress' ? currentUser?.district_l1_code || 'TX-10' :
            selectedTier === 'state_senate' ? currentUser?.district_l2_code || 'SD-14' :
                selectedTier === 'state_rep' ? currentUser?.district_l3_code || 'HD-46' :
                    `${currentUser?.city_name || 'Austin'}_${currentUser?.state || 'TX'}`.toLowerCase().replace(/\s+/g, '_');

    // TanStack Pipelines
    const { data: nominee, isPending, isError } = useConsensusNomineeQuery(selectedTier, activeDistrictCode);
    const signPetitionMutation = useSignPetitionMutation(selectedTier, activeDistrictCode);

    const currentSignatures = nominee?.petition_signatures_count || 0;
    const requiredSignatures = nominee?.signatures_required || 500;
    const progressPercentage = Math.min(100, Math.round((currentSignatures / requiredSignatures) * 100));

    const tierLabels = {
        congress: 'Federal Congressional Representative',
        state_senate: 'State Senate Senator (Upper House)',
        state_rep: 'State Assembly Representative (Lower House)',
        school_board_member: 'School Board Member',
        county_sheriff: 'County Sheriff',
        district_attorney: 'District Attorney',
        county_coroner: 'County Coroner',
        city_council_member: 'City Council Member',
        city_mayor: 'City Mayor',
        city_treasurer: 'City Treasurer',
        city_attorney: 'City Attorney',
        city_board_commissioner: 'City Board Commissioner',
        public_works_commissioner: 'Public Works Commissioner',
        city_comproller: 'City Comptroller'
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-20 font-sans animate-in fade-in duration-200">

            {/* 🧭 Header & Back Nav */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate('/campaigns/local')}
                    className="group flex items-center gap-2 mb-4 text-on-surface-variant hover:text-primary transition-colors font-mono text-[10px] uppercase tracking-widest border-none bg-transparent cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span>BACK TO ASSEMBLY HUB</span>
                </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 mb-6 select-none">
                <div className="w-16 h-16 rounded-full border border-primary/40 flex items-center justify-center bg-primary/5 shadow-md">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-on-surface tracking-tight">Consensus Ballot Endorsements</h1>
                    <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl mx-auto mt-2">
                        Vetted independent choices who won community debates. Our decentralized voting engine confirms these candidates through multi-round deliberation.
                    </p>
                </div>
            </div>

            {/* 🏁 STEP 1: MACRO SCOPE SWITCHBOARD BAR */}
            <div className="flex justify-center mb-4">
                <div className="inline-flex p-1 bg-surface-container-low border border-outline-variant rounded-xl w-full max-w-md">
                    <button
                        type="button"
                        onClick={() => handleScopeChange('higher')}
                        className={cn(
                            "flex-1 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border-none",
                            macroScope === 'higher'
                                ? "bg-primary text-on-primary shadow-md font-bold"
                                : "text-on-surface-variant hover:text-on-surface bg-transparent"
                        )}
                    >
                        HIGHER BALLOTS
                    </button>
                    <button
                        type="button"
                        onClick={() => handleScopeChange('local')}
                        className={cn(
                            "flex-1 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border-none",
                            macroScope === 'local'
                                ? "bg-primary text-on-primary shadow-md font-bold"
                                : "text-on-surface-variant hover:text-on-surface bg-transparent"
                        )}
                    >
                        LOCAL BALLOTS
                    </button>
                </div>
            </div>

            {/* MAIN BENTO WORKSPACE GRID */}
            <div className="grid grid-cols-12 gap-6 w-full items-start">

                {/* Left Sidebar: Available Tiers */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 select-none">
                    <div className="flex items-center justify-between px-1 mb-1">
                        <h3 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">Available Tiers</h3>
                        <span className="text-on-surface-variant text-[11px] font-bold">
                            {macroScope === 'higher' ? 3 : 11} Active
                        </span>
                    </div>

                    {macroScope === 'higher' ? (
                        ['congress', 'state_senate', 'state_rep'].map((tierKey) => {
                            const isTierActive = selectedTier === tierKey;
                            const label = tierKey === 'congress' ? 'Federal Congressional' : tierKey === 'state_senate' ? 'State Senate' : 'State Assembly';
                            const category = tierKey === 'congress' ? 'Federal' : tierKey === 'state_senate' ? 'State Upper' : 'State Lower';
                            return (
                                <button
                                    key={tierKey}
                                    type="button"
                                    onClick={() => setSelectedTier(tierKey)}
                                    className={cn(
                                        "p-4 text-left rounded-xl transition-all cursor-pointer border w-full relative overflow-hidden group block",
                                        isTierActive
                                            ? "border-2 border-primary bg-surface-container-high shadow-md"
                                            : "border-outline-variant bg-surface-container-low hover:border-on-surface-variant/50"
                                    )}
                                >
                                    {isTierActive && <div className="absolute top-0 right-0 w-1 h-full bg-primary" />}
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={cn(
                                            "text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                            isTierActive
                                                ? "bg-primary/20 text-primary border border-primary/30"
                                                : "bg-surface-container-highest text-on-surface-variant"
                                        )}>
                                            {category}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm sm:text-base text-on-surface">{label}</h4>
                                </button>
                            );
                        })
                    ) : (
                        ['school_board_member', 'county_sheriff', 'district_attorney', 'county_coroner', 'city_council_member',
                            'city_mayor', 'city_treasurer', 'city_attorney', 'city_board_commissioner', 'public_works_commissioner', 'city_comproller'].map((tierKey) => {
                                const isTierActive = selectedTier === tierKey;
                                const label = tierKey === 'school_board_member' ? 'School Board Member' : tierKey === 'county_sheriff' ? 'County Sheriff' :
                                    tierKey === 'district_attorney' ? 'District Attorney' : tierKey === 'county_coroner' ? 'County Coroner' :
                                        tierKey === 'city_council_member' ? 'City Council Member' :
                                            tierKey === 'city_mayor' ? 'City Mayor' : tierKey === 'city_treasurer' ? 'City Treasurer' :
                                                tierKey === 'city_attorney' ? 'City Attorney' : tierKey === 'city_board_commissioner' ? 'City Board Commissioner' :
                                                    tierKey === 'public_works_commissioner' ? 'Public Works Commissioner' : 'City Comptroller';
                                const category = tierKey === 'school_board_member' ? 'Education' :
                                    ['county_sheriff', 'district_attorney', 'county_coroner'].includes(tierKey) ? 'Justice' :
                                        tierKey === 'public_works_commissioner' ? 'Infrastructure' : 'Governance';
                                return (
                                    <button
                                        key={tierKey}
                                        type="button"
                                        onClick={() => setSelectedTier(tierKey)}
                                        className={cn(
                                            "p-4 text-left rounded-xl transition-all cursor-pointer border w-full relative overflow-hidden group block",
                                            isTierActive
                                                ? "border-2 border-primary bg-surface-container-high shadow-md"
                                                : "border-outline-variant bg-surface-container-low hover:border-on-surface-variant/50"
                                        )}
                                    >
                                        {isTierActive && <div className="absolute top-0 right-0 w-1 h-full bg-primary" />}
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={cn(
                                                "text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                                isTierActive
                                                    ? "bg-primary/20 text-primary border border-primary/30"
                                                    : "bg-surface-container-highest text-on-surface-variant"
                                            )}>
                                                {category}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm sm:text-base text-on-surface">{label}</h4>
                                    </button>
                                );
                            })
                    )}
                </div>

                {/* Right Workspace Section */}
                <div className="col-span-12 lg:col-span-8 space-y-6 w-full animate-in fade-in duration-200" key={selectedTier}>

                    {/* 🥞 NOMINEE DATA PRESENTATION CANVAS */}
                    {isPending ? (
                        <div className="py-24 text-center flex flex-col items-center justify-center gap-3 bg-surface-container/20 border border-outline-variant/40 rounded-card">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                                Resolving nominee parameters...
                            </span>
                        </div>
                    ) : isError || !nominee ? (
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-700"></div>
                            <div className="relative glass-panel border border-outline-variant rounded-xl min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4 border-dashed border-2 bg-surface-container/60 shadow-xl">
                                <div className="w-20 h-20 rounded-full bg-surface-container-highest/30 flex items-center justify-center mb-1 animate-pulse">
                                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40" style={{ fontVariationSettings: "'FILL' 0" }}>gavel</span>
                                </div>
                                <div className="space-y-2 max-w-lg">
                                    <h3 className="text-xl font-bold text-on-surface">No consensus nominee confirmed for {activeDistrictCode} yet.</h3>
                                    <p className="text-sm text-on-surface-variant leading-relaxed">
                                        Debate town halls are currently coordinating. The candidate who wins the final local voter vote will automatically fill this spot through our cryptographically verified consensus protocol.
                                    </p>
                                </div>
                                <div className="flex gap-4 pt-4 select-none">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/campaigns/debates')}
                                        className="px-4 py-2 border border-outline-variant text-on-surface-variant font-mono text-[10px] uppercase rounded-lg hover:border-primary/50 hover:text-primary transition-all bg-transparent cursor-pointer"
                                    >
                                        VIEW DEBATE SCHEDULE
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-primary font-mono text-[10px] uppercase rounded-lg hover:bg-primary/10 transition-all border-none bg-transparent cursor-pointer"
                                    >
                                        VOLUNTEER AS VETTER
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel border border-outline-variant p-6 sm:p-8 rounded-xl shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden bg-surface-container/60">
                            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-30 pointer-events-none"></div>

                            {/* Office Badge Metadata Ribbon */}
                            <div className="text-xs font-mono font-bold uppercase text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 select-none">
                                {tierLabels[selectedTier]} · District {nominee.district_code}
                            </div>

                            {/* Profile Picture Frame */}
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-surface-container-low bg-surface-container-high shadow-2xl shrink-0 select-none relative z-10 animate-in zoom-in duration-200">
                                <img
                                    src={nominee.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                                    alt={nominee.user?.name || "Nominee Avatar"}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="space-y-1 relative z-10 select-none">
                                <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                                    {nominee.user?.name}
                                </h2>
                                <p className="text-xs sm:text-sm font-mono font-bold text-primary uppercase tracking-wider">
                                    Background: {nominee.user?.profession || 'Working Class Professional'}
                                </p>
                            </div>

                            {/* Campaign Manifesto Block */}
                            <p className="text-sm sm:text-base text-on-surface leading-relaxed bg-surface-container-low p-5 rounded-xl border border-outline-variant max-w-xl font-medium whitespace-pre-wrap text-left sm:text-center italic relative z-10">
                                "{nominee.title}: {nominee.user?.manifesto || 'Platform guidelines are being compiled across the localized district nodes.'}"
                            </p>

                            {/* PROGRESS BAR: REAL-LIFE BALLOT ACCESS TRACKER */}
                            <div className="w-full max-w-lg flex flex-col gap-2 select-none pt-2 relative z-10">
                                <div className="flex justify-between font-mono text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                    <span>Ballot Signature Progress</span>
                                    <span className="text-on-surface font-black">
                                        {currentSignatures} / {requiredSignatures} ({progressPercentage}%)
                                    </span>
                                </div>

                                <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden border border-outline-variant">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 rounded-full shadow-xs"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Action Interaction Controls Bar */}
                            <div className="flex flex-col sm:flex-row gap-3.5 pt-3 w-full max-w-lg select-none relative z-10">
                                <button
                                    type="button"
                                    disabled={nominee.has_signed_petition || signPetitionMutation.isPending}
                                    onClick={() => signPetitionMutation.mutate(nominee.id)}
                                    className={cn(
                                        "flex-1 px-6 py-3.5 text-xs sm:text-sm font-bold rounded-xl border-none uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98",
                                        nominee.has_signed_petition
                                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default"
                                            : "bg-primary hover:bg-primary-container text-white font-black"
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
                                    className="px-6 py-3.5 bg-surface-container-low border border-outline-variant hover:bg-surface-container-high text-on-surface font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Tv className="w-4 h-4 text-on-surface-variant" />
                                    <span>Watch Vetted Debate</span>
                                </button>
                            </div>

                        </div>
                    )}

                    {/* Footer / Statistics Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 select-none">
                        <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col gap-1">
                            <span className="font-mono text-[10px] text-on-surface-variant">CURRENT PHASE</span>
                            <span className="text-base font-bold text-on-surface">Deliberation</span>
                        </div>
                        <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col gap-1">
                            <span className="font-mono text-[10px] text-on-surface-variant">VERIFIED VOTERS</span>
                            <span className="text-base font-bold text-on-surface">12,482</span>
                        </div>
                        <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col gap-1">
                            <span className="font-mono text-[10px] text-on-surface-variant">DEBATE ROUNDS</span>
                            <span className="text-base font-bold text-on-surface">3 of 5</span>
                        </div>
                        <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col gap-1">
                            <span className="font-mono text-[10px] text-on-surface-variant">SYSTEM STATUS</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-base font-bold text-on-surface">Secure</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
};