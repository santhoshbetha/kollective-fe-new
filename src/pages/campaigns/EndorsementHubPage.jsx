// src/pages/campaigns/EndorsementHubPage.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useConsensusNomineeQuery, useSignPetitionMutation } from '../../features/campaigns/useConsensusFeature';

export const EndorsementHubPage = () => {
    const currentUser = useAuthStore((state) => state.user);

    // Tab Switcher Level Trackers: 'congress' | 'state_senate' | 'state_rep'
    const [selectedTier, setSelectedTier] = useState('congress');

    // Dynamically extract user district code parameters from their session store configuration profile
    const activeDistrictCode =
        selectedTier === 'congress' ? currentUser?.district_l1_code || 'TX-10' :
            selectedTier === 'state_senate' ? currentUser?.district_l2_code || 'SD-14' :
                currentUser?.district_l3_code || 'HD-46';

    // 📡 TanStack Query Pipelines
    const { data: nominee, isPending, isError } = useConsensusNomineeQuery(selectedTier, activeDistrictCode);
    const signPetitionMutation = useSignPetitionMutation(selectedTier, activeDistrictCode);

    // Layout formatting configuration maps
    const tierLabels = {
        congress: 'Federal Congressional Representative',
        state_senate: 'State Senate Senator (Upper House)',
        state_rep: 'State Assembly Representative (Lower House)'
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 Central Presentation Header */}
            <div className="border-b border-white/5 pb-4 select-none text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container text-xl shadow-inner mb-2 animate-pulse">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                </div>
                <h1 className="text-3xl font-black text-text-primary tracking-tight">Consensus Ballot Endorsements</h1>
                <p className="text-xs text-text-secondary mt-1 max-w-md leading-relaxed">
                    Vetted, worker-class independent nominees who won community debates. Support their real-life ballot signature drives below.
                </p>
            </div>

            {/* 📊 Symmetrical Legislative Chamber Tabs Selector */}
            <div className="flex bg-surface-container-lowest p-1 rounded-xl select-none">
                {Object.keys(tierLabels).map((tierKey) => (
                    <button
                        key={tierKey}
                        type="button"
                        onClick={() => setSelectedTier(tierKey)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border border-transparent cursor-pointer ${selectedTier === tierKey
                                ? 'bg-surface-container-high text-text-primary border-white/5 font-black shadow-sm'
                                : 'text-text-secondary hover:text-text-primary bg-transparent'
                            }`}
                    >
                        {tierKey === 'congress' ? 'Federal' : tierKey === 'state_senate' ? 'Upper House' : 'Lower House'}
                    </button>
                ))}
            </div>

            {/* 🥞 NOMINEE DATA PRESENTATION CANVAS */}
            {isPending ? (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary/40">Resolving nominee parameters...</span>
                </div>
            ) : isError || !nominee ? (
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-surface-container-low/40">
                    <span className="material-symbols-outlined text-3xl text-text-secondary/30 mb-2">gavel</span>
                    <p className="text-sm font-medium text-text-secondary">No consensus nominee confirmed for {activeDistrictCode} yet.</p>
                    <p className="text-xs text-text-secondary/50 mt-1 max-w-xs mx-auto">
                        Debate town halls are currently coordinating. The candidate who wins the local voter vote will automatically fill this spot.
                    </p>
                </div>
            ) : (
                <div className="bg-gradient-to-b from-primary-container/5 to-transparent border border-primary-container/20 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-5 relative overflow-hidden animate-in fade-in duration-300">

                    {/* Office Badge Metadata Ribbon */}
                    <div className="text-[10px] font-mono font-black uppercase text-primary-container bg-primary-container/10 px-3 py-1 rounded-full border border-primary-container/10 select-none">
                        {tierLabels[selectedTier]} · District {nominee.district_code}
                    </div>

                    {/* Profile Picture Sizing Mask */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#141414] bg-[#1A1616] shadow-2xl shrink-0 select-none">
                        <img src={nominee.user?.avatar || "https://unsplash.com"} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{nominee.user?.name}</h2>
                        <p className="text-xs font-mono font-black text-text-secondary uppercase tracking-wider mt-0.5">
                            Background: {nominee.user?.profession || 'Working Class Professional'}
                        </p>
                    </div>

                    {/* Campaign Manifesto Block */}
                    <p className="text-xs text-text-secondary leading-relaxed bg-[#111111]/80 p-4 rounded-xl border border-white/5 max-w-lg font-medium whitespace-pre-wrap">
                        "{nominee.title}: {nominee.user?.manifesto || 'Platform guidelines are being compiled across the localized district nodes.'}"
                    </p>

                    {/* 📊 PROGRESS BAR: REAL-LIFE BALLOT ACCESS TRACKER */}
                    <div className="w-full max-w-md flex flex-col gap-1.5 select-none pt-2">
                        <div className="flex justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">
                            <span>Ballot Signature Goal</span>
                            <span className="text-white font-black">
                                {nominee.petition_signatures_count || 0} / {nominee.signatures_required || 500}
                            </span>
                        </div>

                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-primary-container transition-all duration-500 rounded-full shadow-lg shadow-primary-container/35"
                                style={{ width: `${Math.min(100, ((nominee.petition_signatures_count || 0) / (nominee.signatures_required || 500)) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Action Interaction Controls Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 w-full max-w-md select-none">
                        <button
                            type="button"
                            disabled={nominee.has_signed_petition || signPetitionMutation.isPending}
                            onClick={() => signPetitionMutation.mutate(nominee.id)}
                            className={`flex-1 px-5 py-3 text-xs font-bold rounded-xl border-none uppercase tracking-wider shadow-md transition-all ${nominee.has_signed_petition
                                    ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                                    : 'bg-primary-container text-white hover:brightness-110 active:scale-95 cursor-pointer crimson-glow font-black'
                                }`}
                        >
                            {signPetitionMutation.isPending ? 'Signing Petition...' :
                                nominee.has_signed_petition ? 'Signed Endorsement ✓' :
                                    'Sign Ballot Petition'}
                        </button>

                        <button
                            type="button"
                            className="px-5 py-3 bg-surface-container border border-white/10 hover:bg-surface-container-high hover:border-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                            Watch Vetted Debate
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
};
