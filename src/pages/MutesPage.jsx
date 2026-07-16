// src/pages/MutesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MutesFeed } from '../features/mutes/MutesFeed';

export const MutesPage = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20 w-full relative animate-in fade-in duration-200">

            {/* 🧭 Top Navigation Header Action Row Toolbar Panel */}
            <div className="flex justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="font-display-lg text-3xl font-extrabold text-text-primary mb-1 tracking-tight">
                        Muted Accounts
                    </h1>
                    <p className="text-body-sm text-text-secondary">
                        Manage silenced feed timelines, account suppressions, and stream filters.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-white/10 rounded-xl text-xs font-bold text-text-primary hover:bg-surface-container-high transition-colors cursor-pointer select-none"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Back</span>
                </button>
            </div>

            {/* ⚡ LOAD THE SEPARATED VIRTUALIZED MUTED ACCOUNTS ACCESSORY FEED */}
            <MutesFeed />

        </div>
    );
};
