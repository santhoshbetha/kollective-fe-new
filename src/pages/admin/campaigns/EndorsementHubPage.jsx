// src/pages/campaigns/EndorsementHubPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const EndorsementHubPage = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-300">
            <div className="border-b border-white/5 pb-4 select-none text-center">
                <span className="material-symbols-outlined text-4xl text-primary-container shadow-md">stars</span>
                <h1 className="text-3xl font-black text-text-primary tracking-tight mt-2">Consensus Endorsement</h1>
                <p className="text-xs text-text-secondary mt-1">The people-vetted Independent choice for the upcoming real-world ballot</p>
            </div>

            {/* Primary Nominee Display Spotlight Card Layout Frame */}
            <div className="bg-gradient-to-b from-primary-container/10 to-transparent border border-primary-container/30 p-6 rounded-3xl shadow-xl flex flex-col items-center text-center gap-4 relative overflow-hidden">

                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#141414] bg-[#1A1616] shadow-2xl shrink-0">
                    <img src="https://unsplash.com" alt="" className="w-full h-full object-cover" />
                </div>

                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Clara Diaz</h2>
                    <p className="text-xs font-mono font-black text-primary-container uppercase tracking-wider mt-0.5">Endorsed Candidate for District 46</p>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed bg-[#111111]/60 backdrop-blur-sm p-4 rounded-xl border border-white/5 max-w-md font-medium">
                    "Winner of the July 15 Town Hall debate. Clara secured 64% of verified constituent votes, defeating traditional establishment party representatives. Use the campaign instructions below to volunteer for her ballot-access signature drive."
                </p>

                <div className="flex gap-3 pt-2 w-full max-w-sm select-none">
                    <button type="button" onClick={() => navigate('/verify/citizen')} className="flex-1 px-4 py-2.5 bg-primary-container text-white font-bold text-xs rounded-xl border-none uppercase tracking-wider cursor-pointer crimson-glow">Sign Ballot Petition</button>
                    <button type="button" className="flex-1 px-4 py-2.5 bg-surface-container border border-white/10 hover:bg-surface-container-high text-white font-bold text-xs rounded-xl transition-all cursor-pointer">View Debate Stream</button>
                </div>
            </div>
        </div>
    );
};
