import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useLocalOffices } from '../../components/localOfficesConfig';
import { useCandidatePitchesQuery, useVotePitchMutation } from '../../features/campaigns/useCampaignDataHooks';
import {
    Video,
    ArrowUp,
    ArrowDown,
    Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const LocalOfficeDirectoryPageN = () => {
    const currentUser = useAuthStore((state) => state.user);

    // Extract location parameters directly from user schema
    const country = currentUser?.country || 'US';
    const city = currentUser?.city_name || 'Austin';
    const state = currentUser?.state || 'TX';

    // Generate location-aware local ballot matrices dynamically
    const localOffices = useLocalOffices(country, city, state);

    // Track selected office id inside state switchboard
    const [selectedOfficeId, setSelectedOfficeId] = useState(localOffices[0]?.id || 'city_council');

    // Locate active metadata config map safely
    const activeOffice = localOffices.find(o => o.id === selectedOfficeId) || localOffices[0] || {};

    // TanStack Data Hooks Connection Pipeline
    const { data: pitches, isPending } = useCandidatePitchesQuery(activeOffice?.id, activeOffice?.targetDistrictCode);
    const voteMutation = useVotePitchMutation(activeOffice?.id, activeOffice?.targetDistrictCode);

    return (
        <div className="w-full flex flex-col gap-6 font-sans animate-in fade-in duration-200">

            {/* 🧭 TOP HEADER & CATEGORY STRIP (YouTube-style Topic Bar) */}
            <div className="w-full space-y-4">

                {/* Page Title & Location Badge */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-outline-variant/40 pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                            Municipal Ballots
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-text-secondary mt-0.5">
                            Vetted working-class seats matching your city or county bounds
                        </p>
                    </div>
                    <div className="font-mono text-xs text-text-secondary font-bold uppercase tracking-wider bg-surface-container-low px-3 py-1 rounded-card border border-outline-variant/60 shrink-0 w-fit">
                        📍 {city}, {state} ({country})
                    </div>
                </div>

                {/* Horizontal Scroll Selector (Fits directly beneath MainLayout Header) */}
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
                    {localOffices.map((office) => {
                        const isOfficeActive = selectedOfficeId === office.id;
                        return (
                            <button
                                key={office.id}
                                type="button"
                                onClick={() => setSelectedOfficeId(office.id)}
                                className={cn(
                                    "px-4 py-2.5 rounded-card text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-2",
                                    isOfficeActive
                                        ? "bg-primary border-primary text-white shadow-xs"
                                        : "bg-surface-container border-outline-variant text-text-secondary hover:border-primary hover:bg-surface-container-high hover:text-text-primary"
                                )}
                            >
                                <span className="font-mono uppercase text-[10px] opacity-75">[{office.scope}]</span>
                                <span>{office.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 📚 CIVIC AWARENESS BANNER */}
            <div className="w-full p-5 sm:p-6 bg-surface-container border border-outline-variant rounded-card shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                    <h2 className="text-base sm:text-lg font-black text-text-primary tracking-tight">
                        Functional Power: {activeOffice?.label}
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                        "{activeOffice?.desc}"
                    </p>
                </div>
                <div className="shrink-0 p-3 bg-surface-container-low border border-outline-variant/60 font-mono text-left md:text-right rounded-card">
                    <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                        Target District Code
                    </div>
                    <div className="text-sm font-black text-primary uppercase tracking-wider mt-0.5">
                        {activeOffice?.targetDistrictCode}
                    </div>
                </div>
            </div>

            <CivicAwarenessBanner userCity={city} userState={state} />

            {/* 🥞 FULL-WIDTH YOUTUBE-STYLE CANDIDATES GRID */}
            <div className="w-full space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary/60">
                    Ranked Video Pitch Manifesto Submissions
                </h3>

                {isPending ? (
                    <div className="py-24 text-center flex flex-col items-center justify-center gap-3 bg-surface-container/20 border border-outline-variant/40 rounded-card">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                            Syncing video arrays...
                        </span>
                    </div>
                ) : (!pitches || pitches.length === 0) ? (
                    <div className="w-full border border-dashed border-outline-variant bg-surface-container/30 p-16 text-center rounded-card flex flex-col items-center justify-center space-y-2">
                        <Video className="w-10 h-10 text-text-secondary/30 mb-1" />
                        <p className="text-sm sm:text-base font-bold text-text-primary">
                            No recorded declarations filed for this specific municipal tier yet.
                        </p>
                        <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                            Vetted working-class citizens can use the candidate studio dashboard to log their manifestos and unlock this category pipeline.
                        </p>
                    </div>
                ) : (
                    /* Responsive 1 to 4 column video grid extending across 100% of the main panel */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
                        {pitches.map((pitch, idx) => (
                            <div
                                key={pitch.id}
                                className="bg-surface-container border border-outline-variant/60 rounded-card p-4 flex flex-col gap-3 relative group hover:border-outline transition-all shadow-xs"
                            >
                                {/* Ranking Tag Overlay */}
                                <div className="absolute top-6 left-6 w-7 h-7 rounded-card bg-background/80 backdrop-blur-md font-mono font-bold text-xs text-text-secondary flex items-center justify-center border border-outline-variant z-10 shadow-xs">
                                    #{idx + 1}
                                </div>

                                {/* Video Player Box */}
                                <div className="w-full aspect-video bg-background rounded-card overflow-hidden border border-outline-variant/60 relative">
                                    <video
                                        src={pitch.video_url}
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Metadata & Quora-style Voting Control */}
                                <div className="flex justify-between items-start gap-3 min-w-0 select-none pt-1">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-text-primary text-sm sm:text-base truncate leading-snug">
                                            {pitch.user?.name || 'Independent Citizen'}
                                        </h4>
                                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider mt-0.5 block truncate">
                                            {pitch.user?.profession || 'Worker Node'}
                                        </span>
                                    </div>

                                    {/* SCOREBOARD VOTE MECHANIC */}
                                    <div className="flex items-center gap-1 bg-surface-container-low border border-outline-variant rounded-card p-1 font-mono font-bold text-xs shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => voteMutation.mutate({ videoId: pitch.id, scoreDelta: 1 })}
                                            className="p-1 text-text-secondary hover:text-emerald-500 transition-colors bg-transparent border-none cursor-pointer rounded-sm"
                                            aria-label="Upvote pitch"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <span className="px-1 text-text-primary min-w-[20px] text-center font-bold text-xs">
                                            {pitch.votes_count || 0}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => voteMutation.mutate({ videoId: pitch.id, scoreDelta: -1 })}
                                            className="p-1 text-text-secondary hover:text-error transition-colors bg-transparent border-none cursor-pointer rounded-sm"
                                            aria-label="Downvote pitch"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

// Append this inline visual banner component into your src/pages/campaigns/LocalOfficeDirectoryPage.jsx layout stage:
export function CivicAwarenessBanner({ userCity, userState }) {
    return (
        <div className="p-4 bg-surface-container border border-white/5 rounded-2xl flex items-start gap-4 select-none animate-in fade-in duration-300">
            <div className="w-9 h-9 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                <span className="material-symbols-outlined text-[18px]">lan</span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-lg font-black text-white tracking-tight">
                    Active Node Matching: {userCity}, {userState}
                </span>
                <p className="text-[16px] text-text-secondary leading-relaxed max-w-xl font-medium">
                    Your profile metadata is automatically synchronized with local municipal grids. Below you will see working-class candidate declarations running for open seats inside your city council boundaries and county lines.
                </p>
            </div>
        </div>
    );
}
