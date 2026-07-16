// src/features/filters/FiltersFeed.jsx
import React, { useState } from 'react';
import { useFiltersQuery, useCreateFilterMutation, useDeleteFilterMutation } from './useFiltersFeature';

export function FiltersFeed() {
    const { data: filters, isPending, isError } = useFiltersQuery();
    const createMutation = useCreateFilterMutation();
    const deleteMutation = useDeleteFilterMutation();

    // Local form controlled state matrices
    const [phrase, setPhrase] = useState('');
    const [filterAction, setFilterAction] = useState('warn'); // 'warn' (blur) | 'hide' (drop)
    const [showForm, setShowForm] = useState(false);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!phrase.trim()) return;

        createMutation.mutate({
            title: phrase.trim(),
            context: ['home', 'public', 'notifications'], // Enforce global coverage parameters
            filter_action: filterAction
        }, {
            onSuccess: () => {
                setPhrase('');
                setShowForm(false);
            }
        });
    };

    if (isPending) {
        return (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                <p className="text-text-secondary text-xs font-mono font-bold uppercase tracking-widest animate-pulse">Syncing keyword filters...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">

            {/* ➕ Quick Creation Interface Button Header Trigger Row */}
            <div className="flex justify-between items-center select-none w-full">
                <h3 className="text-sm font-black uppercase tracking-wider text-text-secondary/60 font-mono">Active Muted Rules ({filters?.length || 0})</h3>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-primary-container text-white text-xs font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer flex items-center gap-1 border-none shadow-md"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">add</span>
                        <span>Add New Filter</span>
                    </button>
                )}
            </div>

            {/* 🗳️ INLINE COMPOSITION CARDS FORM (Inspired by Soapbox Edit Layout) */}
            {showForm && (
                <form onSubmit={handleFormSubmit} className="p-5 bg-[#111111] border border-white/10 rounded-2xl flex flex-col gap-4 animate-in slide-in-from-top-3 duration-200">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Filter Phrase / Keyword</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter text string pattern (e.g., Spoilers, Crypto)..."
                            value={phrase}
                            onChange={(e) => setPhrase(e.target.value)}
                            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary-container font-bold"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-1 select-none">
                        <div className="flex items-center gap-4">
                            <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Action Strategy:</label>
                            <div className="flex gap-1 bg-[#141414] border border-white/5 rounded-lg p-0.5">
                                {['warn', 'hide'].map((action) => (
                                    <button
                                        key={action}
                                        type="button"
                                        onClick={() => setFilterAction(action)}
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${filterAction === action ? 'bg-primary-container text-white shadow-sm' : 'text-text-secondary hover:text-text-primary bg-transparent'
                                            }`}
                                    >
                                        {action === 'warn' ? 'Collapse & Warn' : 'Hide Completely'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            <button type="button" onClick={() => { setShowForm(false); setPhrase(''); }} className="px-3 py-2 text-xs font-bold text-text-secondary hover:text-white bg-transparent border-none cursor-pointer">Cancel</button>
                            <button type="submit" disabled={createMutation.isPending || !phrase.trim()} className="px-5 py-2 bg-primary-container text-white font-bold text-xs rounded-xl hover:brightness-110 cursor-pointer border-none uppercase tracking-wider disabled:opacity-40">{createMutation.isPending ? 'Saving...' : 'Deploy Filter'}</button>
                        </div>
                    </div>
                </form>
            )}

            {/* 🥞 STATIC STRUCTURAL INDEX GRID TIMELINE CASCADE */}
            {isError || !filters || filters.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-surface-container-low/40">
                    <span className="material-symbols-outlined text-3xl text-text-secondary/40 mb-2">filter_alt_off</span>
                    <p className="text-sm font-medium text-text-secondary">No custom content filters active across your node profile.</p>
                </div>
            ) : (
                <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-2xl w-full">
                    {filters.map((item, idx) => {
                        const isDeleting = deleteMutation.isPending && deleteMutation.variables === item.id;
                        return (
                            <div key={item.id || idx} className="flex items-center justify-between p-5 border-b border-[#262626] last:border-b-0 hover:bg-white/[0.01] transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-surface-container border border-white/5 flex items-center justify-center text-primary-container shrink-0">
                                        <span className="material-symbols-outlined text-[20px]">filter_alt</span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-text-primary text-sm truncate">{item.title || item.phrase}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap select-none">
                                            <span className={`text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${item.filter_action === 'hide' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                }`}>
                                                {item.filter_action === 'hide' ? 'drop post' : 'collapse warning'}
                                            </span>
                                            <span className="text-[10px] font-mono text-text-secondary/40 font-bold uppercase tracking-widest">Scope: Global Grid</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => deleteMutation.mutate(item.id)}
                                    className="w-9 h-9 rounded-xl bg-surface-container-high/40 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-text-secondary hover:text-rose-500 flex items-center justify-center transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                                    title="Delete Filter Rule"
                                >
                                    <span className="material-symbols-outlined text-[18px]">{isDeleting ? 'progress_activity' : 'delete'}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
