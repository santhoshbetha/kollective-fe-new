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
    const localOffices = useLocalOffices(country, city, state);

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
        <div className="w-full max-w-[var(--spacing-container-max)] mx-auto flex flex-col gap-6 pb-20 font-sans animate-in fade-in duration-200">

            {/* 🧭 TOP BAR: MACRO DIRECTION ROUTER CONTROL PANEL */}
            <div className="p-5 sm:p-6 bg-surface-container border border-outline-variant rounded-card shadow-2xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 w-full select-none">

                {/* Precinct Node Meta */}
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-card bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                        <Landmark className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-base sm:text-lg md:text-xl font-black text-text-primary tracking-tight">
                            Your Local Precinct Node: {city}, {state}
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-text-secondary mt-0.5 truncate">
                            Explore available ballots or monitor your grassroots validation parameters.
                        </p>
                    </div>
                </div>

                {/* CONDITION LIFECYCLE MONITORING MATRIX */}
                <div className="flex gap-2.5 flex-wrap sm:flex-nowrap shrink-0 items-center w-full xl:w-auto">

                    {/* Shared Base Actions */}
                    <button
                        type="button"
                        onClick={() => navigate('/campaigns/debates')}
                        className="px-4 py-2.5 bg-surface-container-low border border-outline-variant text-text-primary text-xs sm:text-sm font-bold rounded-card cursor-pointer hover:bg-surface-container-high transition-all flex items-center gap-2 shadow-xs"
                    >
                        <Users className="w-4 h-4 text-text-secondary" />
                        <span>Debates Hall</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/campaigns/consensus')}
                        className="px-4 py-2.5 bg-surface-container-low border border-outline-variant text-text-primary text-xs sm:text-sm font-bold rounded-card cursor-pointer hover:bg-surface-container-high transition-all flex items-center gap-2 shadow-xs"
                    >
                        <Star className="w-4 h-4 text-gold-muted" />
                        <span>Consensus Slate</span>
                    </button>

                    {/* CONDITIONAL APPLICATION LIFECYCLE ROUTER */}
                    {isAppPending ? (
                        <div className="w-5 h-5 rounded-full border-2 border-t-primary border-outline-variant animate-spin shrink-0 ml-2" />
                    ) : currentUser?.is_candidate && currentUser?.is_verified_candidate ? (
                        /* TRACK 1: Approved candidate */
                        <button
                            type="button"
                            onClick={() => navigate('/campaigns/studio')}
                            className="px-4 py-2.5 bg-primary hover:brightness-110 text-on-primary text-xs sm:text-sm font-black rounded-card border-none cursor-pointer uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all active:scale-98"
                        >
                            <Video className="w-4 h-4" />
                            <span>Candidate Studio</span>
                        </button>
                    ) : app?.status === 'pending_vouches' ? (
                        /* TRACK 2: Awaiting vouches */
                        <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/30 px-3.5 py-2 rounded-card text-xs sm:text-sm font-bold text-secondary font-mono">
                            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                            <span>Awaiting Vouches ({app.vouches_count || 0}/3)</span>
                        </div>
                    ) : app?.status === 'under_jury_review' ? (
                        /* TRACK 3: Under Jury Review */
                        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-card text-xs sm:text-sm font-bold text-primary font-mono animate-pulse">
                            <Gavel className="w-4 h-4" />
                            <span>Jury Audit Active</span>
                        </div>
                    ) : app?.status === 'rejected' ? (
                        /* TRACK 4: File Rejected / Reapply */
                        <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono font-bold text-error uppercase tracking-wider bg-error/10 px-2.5 py-1 rounded-card border border-error/20">
                                File Rejected
                            </span>
                            <button
                                type="button"
                                onClick={() => navigate('/campaigns/apply')}
                                className="px-3.5 py-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant text-text-primary text-xs sm:text-sm font-bold rounded-card cursor-pointer transition-all uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reapply</span>
                            </button>
                        </div>
                    ) : (
                        /* TRACK 5: Standard voter profile -> Run For Office */
                        <button
                            type="button"
                            onClick={() => navigate('/campaigns/apply')}
                            className="px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 text-xs sm:text-sm font-bold rounded-card cursor-pointer hover:bg-primary/20 transition-all uppercase tracking-wider flex items-center gap-2 shadow-xs"
                        >
                            <UserCheck className="w-4 h-4" />
                            <span>Run For Office</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 🏁 MACRO SCOPE SWITCHER TABS ROW */}
            <div className="flex bg-surface-container-low border border-outline-variant p-1.5 rounded-card select-none shadow-inner w-full gap-1">
                <button
                    type="button"
                    onClick={() => handleMacroScopeChange('higher')}
                    className={cn(
                        "flex-1 py-3 rounded-card text-xs sm:text-sm font-bold transition-all border cursor-pointer",
                        macroScope === 'higher'
                            ? "bg-surface-container-high border-outline-variant/80 text-text-primary font-black shadow-xs"
                            : "text-text-secondary border-transparent hover:text-text-primary bg-transparent"
                    )}
                >
                    Higher Chambers (Federal & State Representatives)
                </button>
                <button
                    type="button"
                    onClick={() => handleMacroScopeChange('local')}
                    className={cn(
                        "flex-1 py-3 rounded-card text-xs sm:text-sm font-bold transition-all border cursor-pointer",
                        macroScope === 'local'
                            ? "bg-surface-container-high border-outline-variant/80 text-text-primary font-black shadow-xs"
                            : "text-text-secondary border-transparent hover:text-text-primary bg-transparent"
                    )}
                >
                    Local Ballots (Municipal & County Infrastructure)
                </button>
            </div>

            {/* MAIN CONTENT SPLIT COLUMN INTERFACE */}
            <div className="flex flex-col lg:flex-row gap-6 w-full items-start">

                {/* 🥞 SIDEBAR SUB-TIER BUTTON MENU */}
                <div className="w-full lg:w-80 flex flex-col gap-2 bg-surface-container border border-outline-variant p-3 rounded-card shadow-2xl select-none shrink-0">
                    <span className="text-xs font-mono font-bold uppercase text-text-secondary/70 px-2 py-1 block tracking-wider">
                        Available Office Tiers
                    </span>
                    {activeMenuOptions.map((opt) => {
                        const isTierActive = selectedTierId === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelectedTierId(opt.id)}
                                className={cn(
                                    "flex flex-col gap-1 w-full p-3.5 text-left rounded-card transition-all cursor-pointer border bg-transparent group",
                                    isTierActive
                                        ? "bg-surface-container-high border-outline-variant text-text-primary shadow-xs font-bold"
                                        : "border-transparent text-text-secondary hover:bg-surface-container-low hover:text-text-primary"
                                )}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <span className={cn(
                                        "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                        isTierActive
                                            ? "bg-primary-container/20 text-primary"
                                            : "bg-surface-container-low border border-outline-variant/60 text-text-secondary"
                                    )}>
                                        {opt.category}
                                    </span>
                                    <span className="text-[10px] font-mono text-text-secondary/70 uppercase font-bold tracking-widest ml-auto">
                                        Code: {opt.targetDistrictCode}
                                    </span>
                                </div>
                                <span className="text-xs sm:text-sm font-extrabold tracking-tight mt-1 text-text-primary">
                                    {opt.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 🖥️ CONTENT WORKSPACE CANVAS */}
                <div className="flex-1 min-w-0 bg-surface-container border border-outline-variant rounded-card p-5 sm:p-6 shadow-2xl min-h-[560px] flex flex-col gap-6 w-full">

                    {/* Functional Power Definition Banner */}
                    <div className="p-4 sm:p-5 bg-surface-container-low border border-outline-variant/60 rounded-card flex flex-col gap-1 select-none">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                            Functional Power Definition: {activeOffice?.label}
                        </h4>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium mt-1">
                            "{activeOffice?.desc}"
                        </p>
                    </div>

                    {/* Video Pitch Manifesto Cascade Loop Grid */}
                    <div className="flex flex-col gap-4 flex-1 w-full">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary select-none">
                            Ranked Candidate Submissions ({pitches?.length || 0})
                        </h3>

                        {isPending ? (
                            <div className="py-24 text-center flex flex-col items-center justify-center gap-3 flex-1 bg-surface-container-low/20 rounded-card border border-outline-variant/40">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                                    Syncing video array feeds...
                                </span>
                            </div>
                        ) : (!pitches || pitches.length === 0) ? (
                            <div className="border border-dashed border-outline-variant bg-surface-container-low/30 p-16 text-center rounded-card flex flex-col items-center justify-center flex-1 space-y-2 select-none">
                                <VideoOff className="w-10 h-10 text-text-secondary/30 mb-1" />
                                <p className="text-sm sm:text-base font-bold text-text-primary">
                                    No recorded declarations filed inside this boundary sector yet.
                                </p>
                                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                                    Vetted candidates can use the studio dashboard to submit manifesto pitches for this tier.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {pitches.map((pitch, idx) => {
                                    const hasEndorsed = pitch.has_voted;
                                    const isProcessing = voteMutation.isPending && voteMutation.variables?.videoId === pitch.id;

                                    return (
                                        <article
                                            key={pitch.id}
                                            className="bg-surface-container-low border border-outline-variant rounded-card p-5 flex flex-col gap-4 relative shadow-sm hover:border-outline transition-all"
                                        >
                                            {/* Rank Position Overlay */}
                                            <div className="absolute top-7 left-7 w-7 h-7 rounded-card bg-background/80 backdrop-blur-md font-mono font-bold text-xs text-text-secondary flex items-center justify-center border border-outline-variant z-10 select-none shadow-xs">
                                                #{idx + 1}
                                            </div>

                                            {/* Video Player Box */}
                                            <div className="w-full aspect-video bg-background rounded-card overflow-hidden border border-outline-variant/60 select-none relative">
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
                                                <div className="flex items-center gap-2 shrink-0 bg-surface-container border border-outline-variant/80 p-1.5 rounded-card shadow-xs">
                                                    <div className="flex flex-col font-mono text-right pr-1">
                                                        <span className="text-xs sm:text-sm font-black text-text-primary">
                                                            {pitch.votes_count || 0}
                                                        </span>
                                                        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                                                            Endorsements
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={hasEndorsed || isProcessing}
                                                        onClick={() => voteMutation.mutate({ videoId: pitch.id, scoreDelta: 1 })}
                                                        className={cn(
                                                            "w-10 h-10 rounded-card flex items-center justify-center transition-all border p-0 cursor-pointer shadow-xs active:scale-95",
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
                                            <p className="text-xs sm:text-sm text-text-primary leading-relaxed bg-surface-container/60 p-3.5 rounded-card border border-outline-variant/40 flex-1 font-medium whitespace-pre-wrap italic">
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