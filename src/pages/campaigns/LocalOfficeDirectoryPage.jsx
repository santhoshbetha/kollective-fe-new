// src/pages/campaigns/LocalOfficeDirectoryPage.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useLocalOffices } from '../../components/ui/localOfficesConfig';
import { useCandidatePitchesQuery, useVotePitchMutation } from '../../features/campaigns/useCampaignDataHooks';

export const LocalOfficeDirectoryPage = () => {
    const currentUser = useAuthStore((state) => state.user);

    // 🗺️ Extract country, city, and state parameters straight out of your user schema variables
    const country = currentUser?.country || 'US';
    const city = currentUser?.city_name || 'Austin';
    const state = currentUser?.state || 'TX';

    // 📡 Generate location-aware local ballot matrices dynamically
    const localOffices = useLocalOffices(country, city, state);

    // Track selected office id inside the switchboard: defaults to the first available category
    const [selectedOfficeId, setSelectedOfficeId] = useState(localOffices[0]?.id || 'city_council');

    // Locate active metadata config maps
    const activeOffice = localOffices.find(o => o.id === selectedOfficeId) || localOffices[0];

    // 📡 TanStack Data Hooks Connection Pipeline: Target the generated district signature code maps
    const { data: pitches, isPending } = useCandidatePitchesQuery(activeOffice.id, activeOffice.targetDistrictCode);
    const voteMutation = useVotePitchMutation(activeOffice.id, activeOffice.targetDistrictCode);

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 LEFT COLUMN: INSTANCE LOCAL OFFICE CATEGORY SIDEBAR */}
            <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 select-none">
                <div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight">Municipal Ballots</h1>
                    <p className="text-xs text-text-secondary mt-0.5">Vetted working-class seats matching your city or county bounds</p>
                </div>

                <div className="flex flex-col gap-1.5 bg-[#141414] border border-[#262626] p-2 rounded-2xl shadow-xl max-h-[70vh] overflow-y-auto no-scrollbar">
                    {localOffices.map((office) => {
                        const isOfficeActive = selectedOfficeId === office.id;
                        return (
                            <button
                                key={office.id}
                                type="button"
                                onClick={() => setSelectedOfficeId(office.id)}
                                className={`flex flex-col gap-1 w-full p-4 text-left rounded-xl transition-all border border-transparent cursor-pointer bg-transparent group ${isOfficeActive
                                        ? 'bg-surface-container-high border-white/5 text-text-primary shadow-md font-black'
                                        : 'text-text-secondary hover:bg-white/[0.01] hover:text-text-primary'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${isOfficeActive ? 'bg-primary-container/20 text-primary-container' : 'bg-white/5 text-text-secondary/60'
                                        }`}>
                                        {office.category}
                                    </span>
                                    <span className="text-[10px] font-mono text-text-secondary/30 uppercase font-bold tracking-widest ml-auto">Scope: {office.scope}</span>
                                </div>
                                <span className="text-sm font-extrabold tracking-tight mt-1 text-white">{office.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 🖥️ RIGHT COLUMN: CIVIC CONTENT WORKSPACE & ACTIVE PITCHES GRID */}
            <div className="flex-1 min-w-0 bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-2xl min-h-[600px] flex flex-col gap-6">

                {/* 📚 THE CIVIC AWARENESS CANVAS PANEL (Parsed straight from LDF TMI Dataset) */}
                <div className="p-5 bg-gradient-to-r from-primary-container/5 to-transparent border border-primary-container/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                    <div className="space-y-1 max-w-xl">
                        <h2 className="text-lg font-black text-white tracking-tight">Functional Power: {activeOffice.label}</h2>
                        <p className="text-xs text-text-secondary leading-relaxed font-medium">"{activeOffice.desc}"</p>
                    </div>
                    <div className="shrink-0 p-3 bg-[#111111] border border-white/5 font-mono text-right rounded-xl">
                        <div className="text-[10px] text-text-secondary/40 font-bold uppercase tracking-widest">Target District Code</div>
                        <div className="text-xs font-black text-primary-container uppercase tracking-wider mt-0.5">{activeOffice.targetDistrictCode}</div>
                    </div>
                </div>

                {/* 🥞 ACTIVE WORKING-CLASS CANDIDATES STREAM LOOP */}
                <div className="flex flex-col gap-4 flex-1">
                    <h3 className="text-xs font-mono font-black uppercase tracking-wider text-text-secondary/40 select-none">
                        Ranked Video Pitch Manifesto Submissions
                    </h3>

                    {isPending ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary/40">Syncing video arrays...</span>
                        </div>
                    ) : (!pitches || pitches.length === 0) ? (
                        <div className="border-2 border-dashed border-white/5 bg-[#111111]/30 p-12 text-center rounded-2xl flex flex-col items-center justify-center flex-1">
                            <span className="material-symbols-outlined text-3xl text-text-secondary/20 mb-2">video_library</span>
                            <p className="text-sm font-medium text-text-secondary">No recorded declarations filed for this specific municipal tier yet.</p>
                            <p className="text-xs text-text-secondary/40 mt-1 max-w-xs mx-auto">Vetted working-class citizens can use the candidate studio dashboard to log their manifestos and unlock this category pipeline.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {pitches.map((pitch, idx) => (
                                <div key={pitch.id} className="bg-[#111111] border border-[#262626] rounded-2xl p-5 flex flex-col gap-4 relative group">
                                    <div className="absolute top-4 left-4 w-7 h-7 rounded-lg bg-black/40 font-mono font-black text-xs text-text-secondary flex items-center justify-center border border-white/5 z-10">#{idx + 1}</div>

                                    {/* Embedded Player */}
                                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5">
                                        <video src={pitch.video_url} controls className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex justify-between items-start gap-4 min-w-0 select-none">
                                        <div className="min-w-0">
                                            <h4 className="font-extrabold text-white text-base truncate">{pitch.user?.name || 'Independent Citizen'}</h4>
                                            <span className="text-xs font-mono font-bold text-primary-container uppercase tracking-wider mt-0.5 block">{pitch.user?.profession || 'Worker Node'}</span>
                                        </div>

                                        {/* 🎛️ QUORA-STYLE SCOREBOARD ATOMIC INTERACTION MECHANIC */}
                                        <div className="flex items-center gap-1 bg-surface-container border border-white/5 rounded-xl p-1 font-mono font-bold text-xs">
                                            <button type="button" onClick={() => voteMutation.mutate({ videoId: pitch.id, scoreDelta: 1 })} className="p-1 text-text-secondary hover:text-emerald-400 transition-colors bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[18px]">arrow_upward</span></button>
                                            <span className="px-1 text-white min-w-[28px] text-center">{pitch.votes_count || 0}</span>
                                            <button type="button" onClick={() => voteMutation.mutate({ videoId: pitch.id, scoreDelta: -1 })} className="p-1 text-text-secondary hover:text-rose-400 transition-colors bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[18px]">arrow_downward</span></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};
