// src/features/polls/PollComposer.jsx
import React from 'react';
import { BarChart3, Plus, Trash2, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export function PollComposer({ options, setOptions, expiresValue, setExpiresValue, onClose }) {
    const minOptions = 2;
    const maxOptions = 4;

    const handleOptionChange = (idx, value) => {
        setOptions((prev) => prev.map((opt, i) => (i === idx ? value : opt)));
    };

    const handleAddOption = () => {
        if (options.length >= maxOptions) return;
        setOptions((prev) => [...prev, '']);
    };

    const handleRemoveOption = (idxToRemove) => {
        if (options.length <= minOptions) return;
        setOptions((prev) => prev.filter((_, i) => i !== idxToRemove));
    };

    return (
        <div className="bg-black/[0.01] dark:bg-surface-container-lowest/50 border border-black/10 dark:border-white/10 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 relative text-left font-sans w-full">

            {/* ✕ Clear Poll Action Trigger Cross Button */}
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer outline-none transition-colors p-1"
                title="Remove Poll Form"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Dynamic Card Header Section */}
            <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2.5 select-none">
                <BarChart3 className="w-4 h-4 text-primary-container shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest text-text-primary dark:text-white font-mono">Configure Poll Options</span>
            </div>

            {/* 🗳️ Dynamic Input Selection Rows */}
            <div className="space-y-3">
                {options.map((option, idx) => (
                    <div key={`poll-opt-${idx}`} className="flex gap-2 items-center w-full relative group">
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Choice option ${idx + 1}`}
                            maxLength={100}
                            className="flex-1 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-primary-container transition-colors"
                        />

                        {/* Display close delete icon if choice array expands past baseline bounds */}
                        {options.length > minOptions && (
                            <button
                                type="button"
                                onClick={() => handleRemoveOption(idx)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/40 hover:text-rose-500 bg-transparent border-none cursor-pointer p-1 outline-none transition-colors"
                                title={`Delete Choice ${idx + 1}`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* 🧭 Controls Bottom Menu Toolbar Row */}
            <div className="flex justify-between items-center pt-2 select-none font-mono text-[10px] uppercase font-bold tracking-wider">
                {options.length < maxOptions ? (
                    <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-xs font-black text-primary-container hover:opacity-85 bg-transparent border-none cursor-pointer flex items-center gap-1.5 p-0 outline-none uppercase font-sans tracking-wide"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5px]" />
                        <span>Add Option</span>
                    </button>
                ) : (
                    <div />
                )}

                {/* ⏱️ Clean Life Cycle Duration Dropdown Menu */}
                <div className="flex items-center gap-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60 font-mono">Poll Expiration:</label>
                    <select
                        value={expiresValue}
                        onChange={(e) => setExpiresValue(e.target.value)}
                        className="bg-white dark:bg-[#111111] border border-black/10 dark:border-white/5 text-xs font-bold rounded-lg px-2.5 py-1.5 text-text-primary dark:text-white focus:outline-none cursor-pointer font-sans transition-colors"
                    >
                        <option value="86400" className="bg-white dark:bg-[#111111]">24 Hours</option>
                        <option value="259200" className="bg-white dark:bg-[#111111]">3 Days</option>
                        <option value="604800" className="bg-white dark:bg-[#111111]">1 Week</option>
                        <option value="1209600" className="bg-white dark:bg-[#111111]">2 Weeks</option>
                    </select>
                </div>
            </div>

        </div>
    );
}
