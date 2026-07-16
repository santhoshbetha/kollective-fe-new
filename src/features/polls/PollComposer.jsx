// src/features/polls/PollComposer.jsx
import React from 'react';

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
        <div className="poll-composer-card bg-surface-container-lowest border border-white/10 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 relative">

            {/* ✕ Clear Poll Action Trigger */}
            <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 text-text-secondary hover:text-white bg-transparent border-none cursor-pointer"
                title="Remove Poll"
            >
                <span className="material-symbols-outlined text-[16px] font-bold">close</span>
            </button>

            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 select-none">
                <span className="material-symbols-outlined text-[18px] text-primary-container">ballot</span>
                <span className="text-xs font-black uppercase tracking-wider text-text-primary">Configure Poll Options</span>
            </div>

            {/* 🗳️ Dynamic Input Selection Rows */}
            <div className="space-y-2">
                {options.map((option, idx) => (
                    <div key={idx} className="flex gap-2 items-center w-full relative group">
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Choice ${idx + 1}`}
                            maxLength={100}
                            className="flex-1 bg-[#111111] border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary-container transition-colors"
                        />

                        {/* Display close icon if choice array expands past baseline bounds */}
                        {options.length > minOptions && (
                            <button
                                type="button"
                                onClick={() => handleRemoveOption(idx)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/40 hover:text-rose-500 bg-transparent border-none cursor-pointer p-0"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* 🧭 Controls Bottom Menu Toolbar */}
            <div className="flex justify-between items-center pt-2 select-none">
                {options.length < maxOptions ? (
                    <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-xs font-bold text-primary-container hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1 p-0"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Add option</span>
                    </button>
                ) : (
                    <div />
                )}

                {/* ⏱️ Clean Life Cycle Duration Dropdown Menu */}
                <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary/50">Expires:</label>
                    <select
                        value={expiresValue}
                        onChange={(e) => setExpiresValue(e.target.value)}
                        className="bg-[#111111] border border-white/10 text-xs font-bold rounded-lg px-2 py-1 text-text-primary focus:outline-none cursor-pointer"
                    >
                        <option value="300">5 Minutes</option>
                        <option value="86400">1 Day</option>
                        <option value="604800">1 Week</option>
                    </select>
                </div>
            </div>

        </div>
    );
}
