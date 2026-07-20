// src/pages/campaigns/CampaignRegistryPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useCandidatePitchesQuery, useVotePitchMutation } from '../../features/campaigns/useCampaignDataHooks';

export const CampaignRegistryPage = () => {
    const { country = 'US', districtId } = useParams();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // 📡 TanStack Data Hooks Layer Connection
    const { data: pitches, isPending, isError } = useCandidatePitchesQuery('congress', districtId);
    const voteMutation = useVotePitchMutation('congress', districtId);

    const handleEndorseClick = (videoId) => {
        // Dispatch an atomic +1 increment modification through the secure ledger pipeline
        voteMutation.mutate({ videoId, scoreDelta: 1 });
    };

    if (isPending) {
        return (
            <div className="pt-32 text-center flex flex-col items-center justify-center gap-4 w-full">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                <p className="text-text-secondary text-xs font-mono font-bold uppercase tracking-widest animate-pulse">Syncing campaign registry...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 Top Context Structural Toolbar Panel */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 select-none">
                <div>
                    <span className="text-[10px] font-mono font-black uppercase text-primary-container bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/10">Vetted Endorsement Matrix</span>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight mt-1">Declarations: {districtId}</h1>
                    <p className="text-xs text-text-secondary mt-0.5">Ranked in real time by verified constituent support parameters</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/campaigns/studio')}
                    className="px-5 py-2.5 bg-primary-container text-white text-xs font-black rounded-xl crimson-glow border-none cursor-pointer uppercase tracking-wider"
                >
                    Declare Candidacy
                </button>
            </div>

            {/* 🥞 CANDIDATES PITCh CASCADE GRID MATRIX */}
            {isError || !pitches || pitches.length === 0 ? (
                <div className="border-2 border-dashed border-white/5 bg-[#111111]/40 p-12 text-center rounded-2xl">
                    <p className="text-sm font-medium text-text-secondary">No recorded pitches filed inside this district boundary yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {pitches.map((pitch, idx) => {
                        // Check if this specific account profile is already catalogued inside the pitch's voter record maps
                        const hasEndorsed = pitch.voted_users?.some(id => id === currentUser?.id) || pitch.has_voted;
                        const isProcessing = voteMutation.isPending && voteMutation.variables?.videoId === pitch.id;

                        return (
                            <article key={pitch.id} className="bg-[#141414] border border-[#262626] rounded-2xl p-5 flex flex-col gap-4 relative group shadow-2xl">

                                {/* Visual Rank Position Tracker badge overlay */}
                                <div className="absolute top-4 left-4 w-7 h-7 rounded-lg bg-black/50 font-mono font-black text-xs text-text-secondary flex items-center justify-center border border-white/5 z-10 select-none">
                                    #{idx + 1}
                                </div>

                                {/* Video Pitch Canvas Area */}
                                <div className="w-full aspect-video bg-[#0b0b0b] rounded-xl border border-white/5 overflow-hidden relative shadow-inner select-none">
                                    <video src={pitch.video_url} controls className="w-full h-full object-cover" />
                                </div>

                                {/* Identity Metadata Layout Panel */}
                                <div className="flex justify-between items-center gap-4 min-w-0">
                                    <div className="min-w-0">
                                        <h3 className="font-extrabold text-white text-base tracking-tight truncate">{pitch.user?.name}</h3>
                                        <span className="text-xs text-primary-container font-mono font-black uppercase tracking-wider block mt-0.5 select-none">
                                            {pitch.user?.profession || 'Worker Representative'}
                                        </span>
                                    </div>

                                    {/* 🗳️ SECURED, PURE-ENDORSEMENT ACTION TRIGGER MECHANIC */}
                                    <div className="flex items-center gap-2 select-none shrink-0">
                                        <div className="flex flex-col text-right font-mono pr-1">
                                            <span className="text-xs font-black text-white">{pitch.votes_count || 0}</span>
                                            <span className="text-[9px] text-text-secondary/40 font-bold uppercase tracking-wider">Endorsements</span>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={hasEndorsed || isProcessing}
                                            onClick={() => handleEndorseClick(pitch.id)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border p-0 cursor-pointer ${hasEndorsed
                                                    ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 cursor-default'
                                                    : 'bg-surface-container hover:bg-primary-container/20 border-white/5 hover:border-primary-container/30 text-text-secondary hover:text-primary-container active:scale-95'
                                                }`}
                                            title={hasEndorsed ? "Endorsement Verified" : "Endorse Candidate"}
                                        >
                                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: hasEndorsed ? "'FILL' 1" : "'FILL' 0" }}>
                                                {hasEndorsed ? 'check_circle' : 'thumb_up'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-text-secondary leading-relaxed bg-[#111111] p-3 rounded-xl border border-white/5 flex-1 font-medium whitespace-pre-wrap">
                                    "{pitch.manifesto || pitch.user?.manifesto}"
                                </p>

                            </article>
                        );
                    })}
                </div>
            )}

        </div>
    );
};
