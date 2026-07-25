// src/pages/campaigns/CivicAssemblyHubPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useLocalOffices } from '../../components/localOfficesConfig';
import { useCandidatePitchesQuery, useVotePitchMutation } from '../../features/campaigns/useCampaignDataHooks';
import { useCandidacyApplicationQuery } from '../../features/campaigns/useCandidacyApplication';

export const CivicAssemblyHubPageOK = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // Geolocation parameters extracted straight from your core user schema variables
    const country = currentUser?.country || 'US';
    const city = currentUser?.city_name || 'Austin';
    const state = currentUser?.state || 'TX';

    // 🎛️ Macro Scope Switcher Selection: 'higher' | 'local'
    const [macroScope, setMacroScope] = useState('higher');

    // 💊 Dynamic Sub-Tier State Tracker
    const [selectedTierId, setSelectedTierId] = useState('congress');

    const { data: app, isPending: isAppPending } = useCandidacyApplicationQuery();

    // Fetch the 10 municipal configurations mapped from the LDF Thurgood Marshall Institute framework
    const localOffices = useLocalOffices(country, city, state);

    // Define the rigid Higher Chambers metadata collection inline to prevent network overhead
    const higherChambers = [
        { id: 'congress', label: 'Federal Congress (US House)', category: 'Federal', desc: 'Passes national legislation, overrides vetoes, and manages federal budget line-items.', targetDistrictCode: currentUser?.district_l1_code || 'TX-10' },
        { id: 'state_senate', label: 'State Senate (Upper Chamber)', category: 'State Upper', desc: 'Presides over statewide legislation, confirms appointments, and audits governor bills.', targetDistrictCode: currentUser?.district_l2_code || 'SD-14', omitted: !currentUser?.district_l2_code },
        { id: 'state_rep', label: 'State Assembly (Lower Chamber)', category: 'State Lower', desc: 'Drafts regional legislation, introduces budget codes, and sits as the direct voice of your house district.', targetDistrictCode: currentUser?.district_l3_code || 'HD-46' }
    ].filter(c => !c.omitted);

    // Active Menu Array Pointer Switchboard
    const activeMenuOptions = macroScope === 'higher' ? higherChambers : localOffices;
    const activeOffice = activeMenuOptions.find(o => o.id === selectedTierId) || activeMenuOptions[0] || activeMenuOptions;

    // Reset hooks to ensure the user never gets stuck on an orphan sub-tab when toggling scopes
    const handleMacroScopeChange = (targetScope) => {
        setMacroScope(targetScope);
        setSelectedTierId(targetScope === 'higher' ? 'congress' : localOffices[0]?.id || 'city_council');
    };

    // 📡 TanStack Data Hooks Connection Pipeline
    const { data: pitches, isPending } = useCandidatePitchesQuery(activeOffice.id, activeOffice.targetDistrictCode);
    const voteMutation = useVotePitchMutation(activeOffice.id, activeOffice.targetDistrictCode);

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 TOP BAR: THE MACRO DIRECTION ROUTER BANNER CONTROL PANEL */}
            {/* Action Triggers Grid Block */}
            <div className="p-5 bg-surface-container border border-outline-variant/60 rounded-2xl flex flex-col xl:flex-row md:items-center justify-between gap-4 select-none shadow-xl w-full">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[22px]">account_balance</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-md font-black text-text-primary tracking-tight">
                            Your Local Precinct Node: {city}, {state}
                        </h1>
                        <p className="text-[14px] text-text-secondary mt-0.5 font-medium truncate">
                            Explore available ballots or monitor your grassroots validation parameters.
                        </p>
                    </div>
                </div>

                {/* ⚡ THE CONDITION LIFECYCLE MONITORING MATRIX */}
                <div className="flex gap-2 flex-wrap sm:flex-nowrap shrink-0 items-center">

                    {/* Global Shared Base Action Elements */}
                    <button type="button" onClick={() => navigate('/campaigns/debates')} className="px-3 py-2 bg-surface-container-high border border-outline-variant/60 text-text-primary text-[14px] font-bold rounded-lg cursor-pointer hover:bg-surface-container-highest transition-all flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">groups</span><span>Debates Hall</span></button>
                    <button type="button" onClick={() => navigate('/campaigns/consensus')} className="px-3 py-2 bg-surface-container-high border border-outline-variant/60 text-text-primary text-[14px] font-bold rounded-lg cursor-pointer hover:bg-surface-container-highest transition-all flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">stars</span><span>Consensus Slate</span></button>

                    {/* ========================================================================= */}
                    {/* 🎛️ SYSTEM CONDITIONAL APPLICATION LIFECYCLE ROUTER */}
                    {/* ========================================================================= */}
                    {isAppPending ? (
                        <div className="w-4 h-4 rounded-full border border-t-primary border-outline-variant/40 animate-spin shrink-0" />
                    ) : currentUser?.is_candidate && currentUser?.is_verified_candidate ? (
                        /* 🟢 TRACK 1: User is an approved, fully deployed campaign candidate */
                        <button
                            type="button"
                            onClick={() => navigate('/campaigns/studio')}
                            className="px-3 py-2 bg-primary text-white text-[14px] font-black rounded-lg border-none cursor-pointer crimson-glow uppercase tracking-wider flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[14px]">video_call</span>
                            <span>Candidate Studio</span>
                        </button>
                    ) : app?.status === 'pending_vouches' ? (
                        /* 🟡 TRACK 2: Portfolio filed, but awaiting constituent vouch signatures */
                        <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 px-3 py-2 rounded-lg text-[14px] font-bold text-amber-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span>Awaiting Vouches ({app.vouches_count || 0}/3)</span>
                        </div>
                    ) : app?.status === 'under_jury_review' ? (
                        /* 🔵 TRACK 3: Signatures logged, application currently before the decentralized peer jury */
                        <div className="flex items-center gap-2 bg-primary-container/10 border border-primary-container/20 px-3 py-2 rounded-lg text-[14px] font-bold text-primary-container font-mono animate-pulse">
                            <span className="material-symbols-outlined text-[14px]">gavel</span>
                            <span>Jury Audit Active</span>
                        </div>
                    ) : app?.status === 'rejected' ? (
                        /* 🔴 TRACK 4: Portfolio previously denied review. Revealing a clear re-application track */
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-bold text-rose-400 uppercase tracking-wider bg-rose-500/5 px-2 py-1 rounded border border-rose-500/20">File Rejected</span>
                            <button
                                type="button"
                                onClick={() => navigate('/campaigns/apply')}
                                className="px-3 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-text-primary text-[14px] font-bold rounded-lg cursor-pointer transition-all uppercase tracking-wider flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[14px]">refresh</span>
                                <span>Reapply</span>
                            </button>
                        </div>
                    ) : (
                        /* 👤 TRACK 5: Clean slate voter account profile. Exposes standard candidacy portal application buttons */
                        <button
                            type="button"
                            onClick={() => navigate('/campaigns/apply')}
                            className="px-3 py-2 bg-primary-container/20 text-primary-container border border-primary-container/20 text-[14px] font-bold rounded-lg cursor-pointer hover:bg-primary-container/30 transition-all uppercase tracking-wider flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                            <span>Run For Office</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 🏁 THE MACRO SCOPE SWITCHER TABS BAR ROW */}
            <div className="flex bg-surface-container-low border border-outline-variant/60 p-1 rounded-xl select-none shadow-inner w-full">
                <button
                    type="button"
                    onClick={() => handleMacroScopeChange('higher')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border cursor-pointer ${macroScope === 'higher' ? 'bg-surface-container-high border-outline-variant text-text-primary font-black shadow-md' : 'text-text-secondary border-transparent hover:text-text-primary bg-transparent'
                        }`}
                >
                    Higher Chambers (Federal &amp; State Representatives)
                </button>
                <button
                    type="button"
                    onClick={() => handleMacroScopeChange('local')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border cursor-pointer ${macroScope === 'local' ? 'bg-surface-container-high border-outline-variant text-text-primary font-black shadow-md' : 'text-text-secondary border-transparent hover:text-text-primary bg-transparent'
                        }`}
                >
                    Local Ballots (Municipal &amp; County Infrastructure)
                </button>
            </div>

            {/* MAIN CONTENT SPLIT COLUMN INTERFACE */}
            <div className="flex flex-col lg:flex-row gap-6 w-full items-start">

                {/* 🥞 SIDEBAR SUB-TIER BUTTON MENU SELECTION ROW */}
                <div className="w-full lg:w-80 flex flex-col gap-1.5 bg-surface-container border border-outline-variant/60 p-2 rounded-2xl shadow-xl select-none">
                    <span className="text-sm font-mono font-black uppercase text-text-secondary/30 px-3 py-1 block tracking-wider">Available Office Tiers</span>
                    {activeMenuOptions.map((opt) => {
                        const isTierActive = selectedTierId === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelectedTierId(opt.id)}
                                className={`flex flex-col gap-0.5 w-full p-3.5 text-left rounded-xl transition-all border border-transparent cursor-pointer bg-transparent group ${isTierActive
                                    ? 'bg-surface-container-high border-outline-variant text-text-primary shadow-md font-black'
                                    : 'text-text-secondary hover:bg-surface-container-high/40 hover:text-text-primary'
                                    }`}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <span className={`text-[11px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${isTierActive ? 'bg-primary-container/20 text-primary-container' : 'bg-surface-container-low border border-outline-variant/40 text-text-secondary/70'
                                        }`}>{opt.category}</span>
                                    <span className="text-[11px] font-mono text-text-secondary/40 uppercase font-black tracking-widest ml-auto">Code: {opt.targetDistrictCode}</span>
                                </div>
                                <span className="text-sm font-extrabold tracking-tight mt-1 text-text-primary">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 🖥️ CONTENT WORKSPACE AREA CONTAINER */}
                <div className="flex-1 min-w-0 bg-surface-container border border-outline-variant/60 rounded-2xl p-6 shadow-2xl min-h-[560px] flex flex-col gap-5 w-full">

                    {/* Civic Awareness Info Banner Panel */}
                    <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-xl flex flex-col gap-0.5 select-none animate-in fade-in duration-150">
                        <h4 className="text-sm font-mono font-black uppercase tracking-wider text-primary">Functional Power Definition</h4>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium mt-1">"{activeOffice?.desc}"</p>
                    </div>

                    {/* Video Pitch Manifesto Cascade Loop Grid */}
                    <div className="flex flex-col gap-4 flex-1 w-full">
                        <h3 className="text-sm font-mono font-black uppercase tracking-wider text-text-secondary/40 select-none">
                            Ranked Candidate Submissions ({pitches?.length || 0})
                        </h3>

                        {isPending ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 flex-1">
                                <div className="w-6 h-6 rounded-full border-2 border-t-primary border-outline-variant animate-spin" />
                                <span className="text-sm font-mono font-bold uppercase tracking-wider text-text-secondary/40">Syncing video array feeds...</span>
                            </div>
                        ) : (!pitches || pitches.length === 0) ? (
                            <div className="border border-dashed border-outline-variant bg-surface-container-low/20 p-12 text-center rounded-xl flex flex-col items-center justify-center flex-1 select-none">
                                <span className="material-symbols-outlined text-3xl text-text-secondary/20 mb-2">video_library</span>
                                <p className="text-sm font-medium text-text-secondary">No recorded declarations filed inside this boundary sector yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {pitches.map((pitch, idx) => {
                                    const hasEndorsed = pitch.has_voted;
                                    return (
                                        <article key={pitch.id} className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col gap-4 relative shadow-md hover:scale-[1.01] transition-all duration-200">

                                            {/* Rank Position Tracker badge overlay */}
                                            <div className="absolute top-4 left-4 w-7 h-7 rounded-lg bg-background/80 backdrop-blur-md font-mono font-black text-sm text-text-secondary flex items-center justify-center border border-outline-variant/60 z-10 select-none">
                                                #{idx + 1}
                                            </div>

                                            {/* Video Preview Poster Background */}
                                            <div className="w-full aspect-video bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/40 select-none">
                                                <video
                                                    src={pitch.video_url}
                                                    controls
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Name and Profession labels */}
                                            <div className="flex justify-between items-center gap-4 min-w-0 select-none">
                                                <div className="min-w-0">
                                                    <h4 className="font-extrabold text-text-primary text-base tracking-tight truncate">{pitch.user?.name}</h4>
                                                    <span className="text-sm text-primary font-mono font-black uppercase tracking-wider block mt-0.5">
                                                        {pitch.user?.profession || 'Worker Representative'}
                                                    </span>
                                                </div>

                                                {/* Atomic Endorsement Action Trigger Box */}
                                                <div className="flex items-center gap-1.5 shrink-0 bg-surface-container border border-outline-variant/60 p-1 rounded-xl">
                                                    <div className="flex flex-col font-mono text-right pr-1">
                                                        <span className="text-sm font-black text-text-primary">{pitch.votes_count || 0}</span>
                                                        <span className="text-[8px] text-text-secondary/50 font-bold uppercase tracking-wider">Endorsements</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={hasEndorsed}
                                                        onClick={() => voteMutation.mutate({ videoId: pitch.id, scoreDelta: 1 })}
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border p-0 cursor-pointer ${hasEndorsed
                                                            ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 cursor-default'
                                                            : 'bg-surface-container hover:bg-primary-container/20 border-outline-variant/60 text-text-secondary hover:text-primary active:scale-95'
                                                            }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            {hasEndorsed ? 'check_circle' : 'thumb_up'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Manifestos Quote Block Footer Element */}
                                            <p className="text-sm text-text-secondary leading-relaxed bg-surface-container/60 p-3 rounded-xl border border-outline-variant/40 flex-1 font-medium whitespace-pre-wrap italic">
                                                "{pitch.manifesto || pitch.user?.manifesto || 'No manifesto summary filed with this declaration.'}"
                                            </p>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
};
