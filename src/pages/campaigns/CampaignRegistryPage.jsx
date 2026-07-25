import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useCandidatePitchesQuery, useVotePitchMutation } from '../../features/campaigns/useCampaignDataHooks';
import {
    ThumbsUp,
    CheckCircle2,
    Loader2,
    PlusCircle,
    FileVideo2
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const CampaignRegistryPage = () => {
    const { country = 'US', districtId } = useParams();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // TanStack Data Hooks Layer Connection
    const { data: pitches, isPending, isError } = useCandidatePitchesQuery('congress', districtId);
    const voteMutation = useVotePitchMutation('congress', districtId);

    const handleEndorseClick = (videoId) => {
        // Dispatch an atomic +1 increment modification through the secure ledger pipeline
        voteMutation.mutate({ videoId, scoreDelta: 1 });
    };

    if (isPending) {
        return (
            <div className="py-32 text-center flex flex-col items-center justify-center gap-4 w-full font-sans">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-text-secondary text-xs font-mono font-bold uppercase tracking-widest animate-pulse">
                    Syncing campaign registry...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 w-full font-sans animate-in fade-in duration-200">

            {/* 🧭 Top Context Structural Toolbar Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5 select-none">
                <div className="space-y-1">
                    <span className="text-xs font-mono font-bold uppercase text-primary bg-primary/10 px-3 py-1 rounded-card border border-primary/20 inline-block">
                        Vetted Endorsement Matrix
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-text-primary tracking-tight">
                        Declarations: {districtId}
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-text-secondary">
                        Ranked in real time by verified constituent support parameters
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/campaigns/studio')}
                    className="px-6 py-3 bg-primary hover:brightness-110 text-on-primary text-xs sm:text-sm font-bold rounded-card border-none cursor-pointer uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 shrink-0"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Declare Candidacy</span>
                </button>
            </div>

            {/* 🥞 CANDIDATES PITCH CASCADE GRID MATRIX */}
            {isError || !pitches || pitches.length === 0 ? (
                <div className="border border-dashed border-outline-variant bg-surface-container/40 p-16 text-center rounded-card flex flex-col items-center justify-center space-y-2">
                    <FileVideo2 className="w-10 h-10 text-text-secondary/30 mb-1" />
                    <p className="text-base font-bold text-text-primary">
                        No recorded pitches filed inside this district boundary yet.
                    </p>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                        Be the first worker candidate to log a manifesto video and initiate constituent endorsement tracking.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 w-full">
                    {pitches.map((pitch, idx) => {
                        // Check if this user account profile is catalogued in pitch voter records
                        const hasEndorsed = pitch.voted_users?.some(id => id === currentUser?.id) || pitch.has_voted;
                        const isProcessing = voteMutation.isPending && voteMutation.variables?.videoId === pitch.id;

                        return (
                            <article
                                key={pitch.id}
                                className="bg-surface-container border border-outline-variant/80 rounded-card p-5 sm:p-6 flex flex-col gap-4 relative group shadow-2xl transition-all"
                            >

                                {/* Visual Rank Position Tracker Overlay Badge */}
                                <div className="absolute top-7 left-7 w-8 h-8 rounded-card bg-background/80 backdrop-blur-md font-mono font-bold text-xs text-text-secondary flex items-center justify-center border border-outline-variant z-10 select-none shadow-xs">
                                    #{idx + 1}
                                </div>

                                {/* Video Pitch Canvas Area */}
                                <div className="w-full aspect-video bg-background rounded-card border border-outline-variant/60 overflow-hidden relative shadow-inner select-none">
                                    <video src={pitch.video_url} controls className="w-full h-full object-cover" />
                                </div>

                                {/* Identity Metadata & Vote Action Controls */}
                                <div className="flex justify-between items-center gap-4 min-w-0 pt-1">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-black text-text-primary text-base sm:text-lg tracking-tight truncate">
                                            {pitch.user?.name || 'Independent Citizen'}
                                        </h3>
                                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block mt-0.5 select-none truncate">
                                            {pitch.user?.profession || 'Worker Representative'}
                                        </span>
                                    </div>

                                    {/* SECURED, PURE-ENDORSEMENT ACTION TRIGGER MECHANIC */}
                                    <div className="flex items-center gap-3 select-none shrink-0">
                                        <div className="flex flex-col text-right font-mono pr-1">
                                            <span className="text-sm font-black text-text-primary">
                                                {pitch.votes_count || 0}
                                            </span>
                                            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                                                Endorsements
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={hasEndorsed || isProcessing}
                                            onClick={() => handleEndorseClick(pitch.id)}
                                            className={cn(
                                                "w-11 h-11 rounded-card flex items-center justify-center transition-all border p-0 cursor-pointer shadow-xs active:scale-95",
                                                hasEndorsed
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default"
                                                    : "bg-surface-container-low hover:bg-primary/10 border-outline-variant hover:border-primary/40 text-text-secondary hover:text-primary"
                                            )}
                                            title={hasEndorsed ? "Endorsement Verified" : "Endorse Candidate"}
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            ) : hasEndorsed ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            ) : (
                                                <ThumbsUp className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Manifesto Platform Summary Card */}
                                <p className="text-xs sm:text-sm text-text-primary leading-relaxed bg-surface-container-low p-4 rounded-card border border-outline-variant/60 flex-1 font-medium whitespace-pre-wrap italic">
                                    "{pitch.manifesto || pitch.user?.manifesto || 'Platform manifesto guidelines logged across local nodes.'}"
                                </p>

                            </article>
                        );
                    })}
                </div>
            )}

        </div>
    );
};