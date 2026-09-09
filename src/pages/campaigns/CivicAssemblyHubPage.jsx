// src/pages/campaigns/CivicAssemblyHubPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useLocalOffices } from '../../components/localOfficesConfig';
import { useCandidatePitchesQuery, useVotePitchMutation } from '../../features/campaigns/useCampaignDataHooks';
import { useCandidacyApplicationQuery } from '../../features/campaigns/useCandidacyApplication';
import {
    Landmark,
    Users,
    Star,
    Video,
    UserCheck,
    Gavel,
    RotateCcw,
    ThumbsUp,
    CheckCircle2,
    VideoOff,
    Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const CivicAssemblyHubPage = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // Geolocation parameters extracted straight from core user schema
    const country = currentUser?.country || 'US';
    const city = currentUser?.city_name || 'Austin';
    const state = currentUser?.state || 'TX';

    // Macro Scope Switcher Selection: 'higher' | 'local'
    const [macroScope, setMacroScope] = useState('higher');

    // Dynamic Sub-Tier State Tracker
    const [selectedTierId, setSelectedTierId] = useState('congress');

    const { data: app, isPending: isAppPending } = useCandidacyApplicationQuery();

    // Fetch municipal configurations mapped from the framework
    //const localOffices = useLocalOffices(country, city, state);
    const masterCivicOffices = useLocalOffices(country, city, state, currentUser);

    // Handled dynamically! If user lives in an unincorporated zone, masterCivicOffices 
    // does not contain "mayor" or "city_council", and they will never appear in the UI sidebar list.
    //const higherChambers = masterCivicOffices.filter(o =>
    //     o.category.includes('Statewide') || o.category.includes('Federal') || o.category.includes('State Legislative')
    // );

    // Define Higher Chambers metadata collection inline
    const higherChambers = [
        {
            id: 'congress',
            label: 'Federal Congress (US House)',
            category: 'Federal',
            desc: 'Passes national legislation, overrides vetoes, and manages federal budget line-items.',
            targetDistrictCode: currentUser?.district_l1_code || 'TX-10'
        },
        {
            id: 'state_senate',
            label: 'State Senate (Upper Chamber)',
            category: 'State Upper',
            desc: 'Presides over statewide legislation, confirms appointments, and audits governor bills.',
            targetDistrictCode: currentUser?.district_l2_code || 'SD-14',
            omitted: !currentUser?.district_l2_code
        },
        {
            id: 'state_rep',
            label: 'State Assembly (Lower Chamber)',
            category: 'State Lower',
            desc: 'Drafts regional legislation, introduces budget codes, and sits as the direct voice of your house district.',
            targetDistrictCode: currentUser?.district_l3_code || 'HD-46'
        }
    ].filter(c => !c.omitted);

    const localOffices = masterCivicOffices.filter(o => !higherChambers.some(h => h.id === o.id));

    // Active Menu Options
    const activeMenuOptions = macroScope === 'higher' ? higherChambers : localOffices;
    const activeOffice = activeMenuOptions.find(o => o.id === selectedTierId) || activeMenuOptions[0] || {};

    // Reset handler when switching macro scopes
    const handleMacroScopeChange = (targetScope) => {
        setMacroScope(targetScope);
        setSelectedTierId(targetScope === 'higher' ? 'congress' : localOffices[0]?.id || 'city_council');
    };

    // TanStack Data Hooks Connection Pipeline
    const { data: pitches, isPending } = useCandidatePitchesQuery(activeOffice.id, activeOffice.targetDistrictCode);
    const voteMutation = useVotePitchMutation(activeOffice.id, activeOffice.targetDistrictCode);

    return (
        <div className="w-full max-w-[var(--spacing-container-max)] xl:max-w-none xl:px-12 mx-auto flex flex-col gap-6 pb-20 font-sans animate-in fade-in duration-200">

            {/* 🧭 Precinct Node Header */}
            <section className="glass-panel p-6 rounded-xl flex flex-col xl:flex-row items-start xl:items-center justify-between border border-primary/20 bg-surface-container/70 shadow-2xl gap-6 select-none">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/30 shrink-0">
                        <span className="material-symbols-outlined text-primary text-4xl">account_balance</span>
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-bold text-on-surface">Your Local Precinct Node: {city}, {state}</h2>
                            <span className="bg-primary/20 text-primary text-[12px] px-2 py-0.5 rounded-full font-mono border border-primary/30 tracking-wider">LIVE</span>
                        </div>
                        <p className="text-on-surface-variant text-xs sm:text-sm mt-1">Explore available ballots or monitor your grassroots validation parameters.</p>
                    </div>
                </div>

                <div className="flex gap-3 flex-wrap sm:flex-nowrap shrink-0 items-center w-full xl:w-auto">
                    <button
                        type="button"
                        onClick={() => navigate('/campaigns/debates')}
                        className="flex items-center gap-2 px-4 py-2 border border-outline-variant hover:bg-surface-variant/50 rounded-lg text-on-surface font-mono text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-sm">forum</span>
                        Debates Hall
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/campaigns/consensus')}
                        className="flex items-center gap-2 px-4 py-2 border border-outline-variant hover:bg-surface-variant/50 rounded-lg text-on-surface font-mono text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-sm">grade</span>
                        Consensus Slate
                    </button>

                    {/* CONDITIONAL APPLICATION LIFECYCLE ROUTER */}
                    {isAppPending ? (
                        <div className="w-5 h-5 rounded-full border-2 border-t-primary border-outline-variant animate-spin shrink-0 ml-2" />
                    ) : currentUser?.is_candidate && currentUser?.is_verified_candidate ? (
                        /* TRACK 1: Approved candidate */
                        <button
                            type="button"
                            onClick={() => navigate('/campaigns/studio')}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-mono text-xs uppercase hover:bg-primary-container/20 rounded-lg transition-all active:scale-95 cursor-pointer border-none font-bold"
                        >
                            <span className="material-symbols-outlined text-sm">video_call</span>
                            <span>Candidate Studio</span>
                        </button>
                    ) : app?.status === 'pending_vouches' ? (
                        /* TRACK 2: Awaiting vouches */
                        <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/30 px-3.5 py-2 rounded-lg text-xs font-bold text-secondary font-mono">
                            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                            <span>Awaiting Vouches ({app.vouches_count || 0}/3)</span>
                        </div>
                    ) : app?.status === 'under_jury_review' ? (
                        /* TRACK 3: Under Jury Review */
                        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-lg text-xs font-bold text-primary font-mono animate-pulse">
                            <span className="material-symbols-outlined text-sm">gavel</span>
                            <span>Jury Audit Active</span>
                        </div>
                    ) : app?.status === 'rejected' ? (
                        /* TRACK 4: File Rejected / Reapply */
                        <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono font-bold text-error uppercase tracking-wider bg-error/10 px-2.5 py-1 rounded border border-error/20">
                                File Rejected
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/campaigns/apply')}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant text-text-primary text-xs font-bold rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                            >
                                <span className="material-symbols-outlined text-sm">refresh</span>
                                <span>Reapply</span>
                            </button>
                        </div>
                    ) : (
                        /* TRACK 5: Standard voter profile -> Run For Office */
                        <button
                            type="button"
                            onClick={() => navigate('/campaigns/apply')}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-container/10 border border-primary text-primary font-mono text-xs hover:bg-primary-container/20 rounded-lg transition-all active:scale-95 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm">person_add</span>
                            <span>RUN FOR OFFICE</span>
                        </button>
                    )}
                </div>
            </section>

            {/* 🏁 SWITCHER TABS ROW */}
            <div className="grid grid-cols-2 gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant max-w-4xl mx-auto w-full">
                <button
                    type="button"
                    onClick={() => handleMacroScopeChange('higher')}
                    className={cn(
                        "py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border",
                        macroScope === 'higher'
                            ? "bg-primary-container/20 border-primary/30 text-primary shadow-inner font-bold"
                            : "text-on-surface-variant border-transparent hover:bg-surface-variant/30"
                    )}
                >
                    Higher Chambers (Federal & State Representatives)
                </button>
                <button
                    type="button"
                    onClick={() => handleMacroScopeChange('local')}
                    className={cn(
                        "py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border",
                        macroScope === 'local'
                            ? "bg-primary-container/20 border-primary/30 text-primary shadow-inner font-bold"
                            : "text-on-surface-variant border-transparent hover:bg-surface-variant/30"
                    )}
                >
                    Local Ballots (Municipal & County Infrastructure)
                </button>
            </div>

            {/* MAIN BENTO WORKSPACE */}
            <div className="grid grid-cols-12 gap-6 w-full items-start">

                {/* Left Sidebar: Available Tiers */}
                <div className="col-span-12 lg:col-span-3 space-y-4 select-none">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-mono text-xs text-on-tertiary-container uppercase tracking-widest">Available Office Tiers</h3>
                        <span className="text-on-tertiary-container text-xs">{activeMenuOptions.length} Active</span>
                    </div>

                    {activeMenuOptions.map((opt) => {
                        const isTierActive = selectedTierId === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelectedTierId(opt.id)}
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
                                        "text-[12px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                        isTierActive
                                            ? "bg-primary/20 text-primary border border-primary/30"
                                            : "bg-surface-container-highest text-on-surface-variant"
                                    )}>
                                        {opt.category}
                                    </span>
                                    <span className="text-on-tertiary-container font-mono text-[10px]">
                                        CODE: {opt.targetDistrictCode}
                                    </span>
                                </div>
                                <h4 className="font-bold text-base text-on-surface">{opt.label}</h4>
                            </button>
                        );
                    })}
                </div>

                {/* Right Workspace Section */}
                <div className="col-span-12 lg:col-span-9 space-y-6 w-full">

                    {/* Definition Card */}
                    <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant shadow-md">
                        <div className="space-y-1.5">
                            <h5 className="text-primary font-mono text-[12px] uppercase tracking-wider">Functional Power Definition: {activeOffice?.label}</h5>
                            <p className="text-on-surface font-semibold text-base sm:text-lg italic leading-relaxed">"{activeOffice?.desc}"</p>
                        </div>
                    </div>

                    {/* Candidate Submissions Grid */}
                    <div className="flex flex-col gap-4 w-full">
                        <h3 className="font-mono text-xs text-on-tertiary-container uppercase tracking-widest px-1">
                            Ranked Candidate Submissions ({pitches?.length || 0})
                        </h3>

                        {isPending ? (
                            <div className="py-24 text-center flex flex-col items-center justify-center gap-3 bg-surface-container-low/20 rounded-xl border border-outline-variant">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                                    Syncing video array feeds...
                                </span>
                            </div>
                        ) : (!pitches || pitches.length === 0) ? (
                            <div className="border border-dashed border-outline-variant bg-surface-container-low/20 p-16 text-center rounded-xl flex flex-col items-center justify-center space-y-4 select-none">
                                <div className="w-20 h-20 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-full"></div>
                                    <span className="material-symbols-outlined text-on-tertiary-container text-4xl opacity-30">videocam_off</span>
                                </div>
                                <div className="max-w-md">
                                    <h4 className="text-lg font-bold text-on-surface mb-1">No recorded declarations filed inside this boundary sector yet.</h4>
                                    <p className="text-on-surface-variant text-sm">Vetted candidates can use the studio dashboard to submit manifesto pitches for this tier.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-surface-container-highest border border-outline-variant text-on-surface rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-surface-bright transition-all active:scale-95 cursor-pointer"
                                >
                                    Refresh Validation Node
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
                                {pitches.map((pitch, idx) => {
                                    const hasEndorsed = pitch.has_voted;
                                    const isProcessing = voteMutation.isPending && voteMutation.variables?.videoId === pitch.id;

                                    return (
                                        <article
                                            key={pitch.id}
                                            className="bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col gap-4 relative shadow-md hover:scale-[1.01] hover:border-primary/50 transition-all duration-200"
                                        >
                                            {/* Rank Position Overlay */}
                                            <div className="absolute top-7 left-7 w-7 h-7 rounded-lg bg-background/80 backdrop-blur-md font-mono font-bold text-xs text-text-secondary flex items-center justify-center border border-outline-variant z-10 select-none shadow-sm">
                                                #{idx + 1}
                                            </div>

                                            {/* Video Player Box */}
                                            <div className="w-full aspect-video bg-background rounded-xl overflow-hidden border border-outline-variant/60 select-none relative">
                                                <video
                                                    src={pitch.video_url}
                                                    controls
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Metadata & Voting Bar */}
                                            <div className="flex justify-between items-center gap-4 min-w-0 select-none pt-1">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-text-primary text-base sm:text-lg tracking-tight truncate">
                                                        {pitch.user?.name || 'Independent Citizen'}
                                                    </h4>
                                                    <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block mt-0.5 truncate">
                                                        {pitch.user?.profession || 'Worker Representative'}
                                                    </span>
                                                </div>

                                                {/* Atomic Endorsement Action Trigger Box */}
                                                <div className="flex items-center gap-2 shrink-0 bg-surface-container border border-outline-variant/80 p-1.5 rounded-lg shadow-sm">
                                                    <div className="flex flex-col font-mono text-right pr-1">
                                                        <span className="text-xs sm:text-sm font-black text-text-primary">
                                                            {pitch.votes_count || 0}
                                                        </span>
                                                        <span className="text-[12px] text-text-secondary font-bold uppercase tracking-wider">
                                                            Endorsements
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={hasEndorsed || isProcessing}
                                                        onClick={() => voteMutation.mutate({ videoId: pitch.id, scoreDelta: 1 })}
                                                        className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all border p-0 cursor-pointer shadow-xs active:scale-95",
                                                            hasEndorsed
                                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default"
                                                                : "bg-surface-container-low hover:bg-primary/10 border-outline-variant hover:border-primary/40 text-text-secondary hover:text-primary"
                                                        )}
                                                        title={hasEndorsed ? "Endorsement Verified" : "Endorse Candidate"}
                                                    >
                                                        {isProcessing ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                        ) : hasEndorsed ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        ) : (
                                                            <ThumbsUp className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Manifestos Quote Block */}
                                            <p className="text-xs sm:text-sm text-text-primary leading-relaxed bg-surface-container/60 p-3.5 rounded-lg border border-outline-variant/40 flex-1 font-medium whitespace-pre-wrap italic">
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