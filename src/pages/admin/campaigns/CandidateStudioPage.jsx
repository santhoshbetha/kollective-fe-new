// src/pages/campaigns/CandidateStudioPage.jsx
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

export const CandidateStudioPage = () => {
    const politicalCountry = useStore((state) => state.politicalCountry);
    const districtFederal = useStore((state) => state.districtFederal);

    const [profession, setProfession] = useState('');
    const [manifesto, setManifesto] = useState('');
    const [videoFile, setVideoFile] = useState(null);

    const handleCandidacyPublish = (e) => {
        e.preventDefault();
        alert("Candidacy signed and broadcasted across localized node parameters.");
    };

    return (
        <div className="max-w-xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4">
                <h1 className="text-2xl font-black text-text-primary tracking-tight">Candidate Studio</h1>
                <p className="text-xs text-text-secondary mt-0.5">Publish your platform manifesto and launch your campaign video.</p>
            </div>

            <form onSubmit={handleCandidacyPublish} className="space-y-5 flex flex-col w-full">
                {/* Dynamic target tracking diagnostic bar */}
                <div className="p-4 bg-primary-container/10 border border-primary-container/20 rounded-xl text-xs font-mono font-bold text-primary-container">
                    Target Seat: {politicalCountry} Pool · {districtFederal || 'Federal Boundary (Select in preferences)'}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your Working-Class Profession</label>
                    <input type="text" required placeholder="e.g., Nurse, Plumber, Warehouse Logistics Specialist" value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none" />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Video Pitch Upload (Max 3 Mins)</label>
                    <div className="w-full h-32 border-2 border-dashed border-white/10 hover:border-primary-container/40 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-[#111111] relative">
                        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <span className="material-symbols-outlined text-text-secondary text-2xl mb-1">video_call</span>
                        <span className="text-xs font-bold text-white">{videoFile ? videoFile.name : 'Select or drop video file asset...'}</span>
                        <span className="text-[10px] text-text-secondary/40 font-medium mt-1 font-mono">MP4 format required</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Manifesto Platform Statement</label>
                    <textarea rows="4" required placeholder="Outline your vision for the constituency. How will you represent the community against dark money interests?" value={manifesto} onChange={(e) => setManifesto(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl p-4 text-sm text-text-primary focus:outline-none resize-none leading-relaxed" />
                </div>

                <button type="submit" disabled={!videoFile || !profession.trim()} className="px-6 py-3 bg-primary-container text-white font-bold text-xs rounded-xl border-none uppercase tracking-wider shadow-lg disabled:opacity-40 cursor-pointer crimson-glow mt-2 ml-auto">Broadcast Manifesto</button>
            </form>
        </div>
    );
};
