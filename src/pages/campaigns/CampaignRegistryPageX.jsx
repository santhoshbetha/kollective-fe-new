// src/pages/campaigns/CampaignRegistryPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { usePoliticalLabels } from '../../components/ui/politicalConfig';

export const CampaignRegistryPageX = () => {
    const { country = 'US', districtId } = useParams();
    const navigate = useNavigate();
    const { labels } = usePoliticalLabels(country);

    // Mock data representing working-class candidate registry records
    const [candidates, setCandidates] = useState([
        { id: '1', name: 'Clara Diaz', profession: 'Transit Electrician', votes: 1420, videoUrl: 'https://example.com', platform: 'Universal municipal broadband and grid reinforcement.' },
        { id: '2', name: 'Marcus Vance', profession: 'Public School Teacher', votes: 980, videoUrl: 'https://example.com', platform: 'Classroom size limits and fully funded student breakfast blocks.' }
    ]);

    const handleVote = (id, delta) => {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, votes: c.votes + delta } : c)
            .sort((a, b) => b.votes - a.votes) // Real-time deterministic sorting mapping
        );
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* Header Context Tracking Strip */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                    <span className="text-[10px] font-mono font-black uppercase text-primary-container bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/10">Working Class Primary</span>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight mt-1">Active Declarations: {districtId}</h1>
                    <p className="text-xs text-text-secondary mt-0.5">Ranked dynamically by verified constituency consensus parameters</p>
                </div>
                <button type="button" onClick={() => navigate('/campaigns/studio')} className="px-5 py-2.5 bg-primary-container text-white text-xs font-black rounded-xl crimson-glow border-none cursor-pointer uppercase tracking-wider">Declare Candidacy</button>
            </div>

            {/* Grid Canvas Stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {candidates.map((candidate, idx) => (
                    <article key={candidate.id} className="bg-[#141414] border border-[#262626] rounded-2xl p-5 flex flex-col gap-4 relative group">

                        {/* Rank Badge Badge overlay */}
                        <div className="absolute top-4 left-4 w-7 h-7 rounded-lg bg-white/5 font-mono font-black text-xs text-text-secondary flex items-center justify-center border border-white/5 z-10">#{idx + 1}</div>

                        {/* Video Pitch Player Stage Frame */}
                        <div className="w-full aspect-video bg-[#0b0b0b] rounded-xl border border-white/5 overflow-hidden relative shadow-inner">
                            <video src={candidate.videoUrl} controls poster="https://unsplash.com" className="w-full h-full object-cover" />
                        </div>

                        {/* Identity Metadata Information Panel */}
                        <div className="flex justify-between items-start gap-4 min-w-0">
                            <div className="min-w-0">
                                <h3 className="font-extrabold text-white text-lg tracking-tight truncate">{candidate.name}</h3>
                                <span className="text-xs text-primary-container font-mono font-black uppercase tracking-wider block mt-0.5">{candidate.profession}</span>
                            </div>

                            {/* 🎛️ QUORA-STYLE UPVOTE/DOWNVOTE SCOREBOARD MATRIX */}
                            <div className="flex items-center gap-1 bg-[#111111] border border-white/10 rounded-xl p-1 select-none font-mono font-bold text-xs">
                                <button type="button" onClick={() => handleVote(candidate.id, 1)} className="p-1 text-text-secondary hover:text-emerald-500 transition-colors bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[18px]">arrow_upward</span></button>
                                <span className="px-1 text-white min-w-[32px] text-center">{candidate.votes}</span>
                                <button type="button" onClick={() => handleVote(candidate.id, -1)} className="p-1 text-text-secondary hover:text-rose-500 transition-colors bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[18px]">arrow_downward</span></button>
                            </div>
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed bg-[#111111] p-3 rounded-xl border border-white/5 flex-1 font-medium">"{candidate.platform}"</p>
                    </article>
                ))}
            </div>
        </div>
    );
};
