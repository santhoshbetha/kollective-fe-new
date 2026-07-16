// src/pages/SuggestionsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuggestionsQuery, useSuggestionFollowMutation } from '../features/suggestions/useSuggestionsFeature';

export const SuggestionsPage = () => {
    const navigate = useNavigate();
    const { data: suggestions, isPending } = useSuggestionsQuery();
    const followMutation = useSuggestionFollowMutation();

    if (isPending) {
        return (
            <div className="pt-32 text-center flex flex-col items-center justify-center gap-4 w-full">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                <p className="text-text-secondary text-xs font-mono font-bold uppercase tracking-widest animate-pulse">Scanning network nodes...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 select-none">
                <div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight">Citizen Discovery</h1>
                    <p className="text-xs text-text-secondary mt-0.5">Recommended account profiles to expand your local timeline channels.</p>
                </div>
                <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-surface-container border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer select-none">Back</button>
            </div>

            {!suggestions || suggestions.length === 0 ? (
                <div className="p-12 text-center border border-white/5 bg-surface-container-low/40 rounded-2xl">
                    <p className="text-sm text-text-secondary">Your network circle is fully synchronized.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {suggestions.map((item) => {
                        const account = item.account || item;
                        const handle = account.handle || `@${account.username}@kollective.social`;
                        const isProcessing = followMutation.isPending && followMutation.variables === account.id;

                        return (
                            <div key={account.id} className="p-5 bg-[#141414] border border-[#262626] rounded-2xl flex items-center justify-between gap-4 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#1A1616]">
                                        <img src={account.avatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-text-primary text-sm truncate">{account.name || account.username}</span>
                                        <span className="text-xs font-mono font-bold text-text-secondary/40 truncate">{handle}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => followMutation.mutate(account.id)}
                                    className="px-4 py-1.5 bg-primary-container hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none shrink-0"
                                >
                                    {isProcessing ? 'Connecting...' : 'Connect'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
