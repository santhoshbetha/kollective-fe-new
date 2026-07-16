// src/features/timeline/EmojiSelector.jsx
import React, { useState } from 'react';

const EMOJI_MATRIX = {
    SMILEYS: ['😀', '😂', '😍', '🤔', '👀', '😎', '🤫', '💥'],
    SIGNALS: ['👍', '👏', '🔥', '🚀', '💡', '🚨', '💯', '✨'],
    COLLECTIVE: ['👥', '📢', '⚖️', '🌍', '🛠️', '🔒', '🛡️', '✊']
};

export function EmojiSelector({ onSelect, onClose }) {
    const [activeCategory, setActiveCategory] = useState('SMILEYS');
    const categories = Object.keys(EMOJI_MATRIX);

    return (
        <>
            {/* Click backdrop shield to close the popover dropdown menu */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div className="absolute bottom-16 w-[330px] left-4 bg-[#111111] border border-white/10 rounded-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 w-64 flex flex-col gap-3">

                {/* 🧭 Top Category Navigation Bar Header (The Soapbox Pattern) */}
                <div className="flex gap-1 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar select-none">
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActiveCategory(cat)}
                                className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${isActive
                                    ? 'bg-primary-container text-white shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                                    }`}
                            >
                                {cat.toLowerCase()}
                            </button>
                        );
                    })}
                </div>

                {/* 🎨 Curated Symbol Selection Matrix Grid */}
                <div className="grid grid-cols-4 gap-2 justify-items-center">
                    {EMOJI_MATRIX[activeCategory].map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                                onSelect(emoji);
                                onClose();
                            }}
                            className="text-xl hover:scale-125 active:scale-95 transition-transform p-1.5 rounded-lg hover:bg-white/5 cursor-pointer bg-transparent border-none text-text-primary select-none flex items-center justify-center w-10 h-10"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
