// src/features/timeline/ComposerBox.jsx
import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

export function ComposerBox({ onClose }) {
    const queryClient = useQueryClient();
    const maxCharacters = 500;

    // Local Form Content States
    const [text, setText] = useState('');
    const [contentWarning, setContentWarning] = useState('');
    const [showCwInput, setShowCwInput] = useState(false);
    const [mediaUrls, setMediaUrls] = useState([]); // Array of staged media attachments strings
    const [inputUrl, setInputUrl] = useState('');
    const [showMediaInput, setShowMediaInput] = useState(false);

    // 🎯 TRANSACT QUERY MUTATION: Dispatches raw post properties down to your local Elixir endpoint
    const composeMutation = useMutation({
        mutationFn: async (newPostPayload) => {
            return apiFetch('/api/v1/posts', {
                method: 'POST',
                body: JSON.stringify(newPostPayload),
            });
        },
        onSuccess: () => {
            // Invalidate your main timeline cache blocks so the brand new post mounts instantly
            queryClient.invalidateQueries({ queryKey: ['timeline', 'home'] });

            // Wipe the form variables clean
            setText('');
            setContentWarning('');
            setMediaUrls([]);
            setShowCwInput(false);
            setShowMediaInput(false);

            // Fire an optional layout modal closing callback sequence if passed from header navs
            onClose?.();
        },
    });

    const handleAddMedia = (e) => {
        e.preventDefault();
        if (!inputUrl.trim()) return;
        setMediaUrls((prev) => [...prev, inputUrl.trim()]);
        setInputUrl('');
        setShowMediaInput(false);
    };

    const handleRemoveMedia = (idxToRemove) => {
        setMediaUrls((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() && mediaUrls.length === 0) return;

        composeMutation.mutate({
            text: text.trim(),
            images: mediaUrls,
            contentWarning: showCwInput ? contentWarning.trim() : undefined,
        });
    };

    const remainingChars = maxCharacters - text.length;
    const isOverLimit = remainingChars < 0;

    return (
        <form
            onSubmit={handleSubmit}
            className="composer-box bg-surface-container-low border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col gap-4 w-full animate-in fade-in duration-200"
        >
            {/* ⚠️ Content Warning Sub-Input Overlay (The Soapbox Pattern) */}
            {showCwInput && (
                <input
                    type="text"
                    value={contentWarning}
                    onChange={(e) => setContentWarning(e.target.value)}
                    placeholder="Write content warning banner marker (e.g., Sensitive, Spoilers)..."
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary-container transition-colors text-xs font-bold"
                    disabled={composeMutation.isPending}
                />
            )}

            {/* 📝 Core Composition Textarea Field */}
            <div className="w-full relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What's breaking across your grid node coordinates?"
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-4 text-sm min-h-[120px] text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-primary-container resize-none leading-relaxed transition-colors"
                    disabled={composeMutation.isPending}
                    maxLength={maxCharacters + 50} // Allow a small buffer for over-limit visibility checking
                />
            </div>

            {/* 🖼️ STAGED ATTACHMENT IMAGES ROW STRIP (High-Utility UX Fix) */}
            {mediaUrls.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar select-none animate-in slide-in-from-bottom-2 duration-200">
                    {mediaUrls.map((url, idx) => (
                        <div key={idx} className="w-20 h-20 rounded-xl border border-white/10 overflow-hidden relative shrink-0 group shadow-md bg-surface-container-lowest">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => handleRemoveMedia(idx)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white border-none cursor-pointer p-0"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Inline Quick URL Attachment Dropdown Overlay Form */}
            {showMediaInput && (
                <div className="flex gap-2 w-full animate-in slide-in-from-top-2 duration-200">
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Paste graphic link URL (https://...)"
                        className="flex-1 bg-surface-container-lowest border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary-container text-text-primary"
                    />
                    <button
                        type="button"
                        onClick={handleAddMedia}
                        className="bg-primary-container text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:brightness-110 border-none"
                    >
                        Attach
                    </button>
                </div>
            )}

            {/* 🧭 Composition Controls Bottom Toolbar Footer Panel Layout Row */}
            <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-1 select-none">
                <div className="flex items-center gap-2">

                    {/* Attachment Toggle Trigger Button */}
                    <button
                        type="button"
                        onClick={() => setShowMediaInput(!showMediaInput)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border border-transparent ${showMediaInput ? 'bg-primary-container/20 text-primary-container border-primary-container/20' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary bg-transparent'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">image</span>
                    </button>

                    {/* Content Warning Toggle Trigger Button */}
                    <button
                        type="button"
                        onClick={() => { setShowCwInput(!showCwInput); if (showCwInput) setContentWarning(''); }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border border-transparent ${showCwInput ? 'bg-primary-container/20 text-primary-container border-primary-container/20' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary bg-transparent'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                    </button>

                </div>

                <div className="flex items-center gap-4">
                    {/* Character countdown text badge layout tracker element */}
                    <span className={`text-xs font-mono font-bold tracking-wide ${isOverLimit ? 'text-rose-500' : remainingChars <= 50 ? 'text-amber-500' : 'text-text-secondary/50'
                        }`}>
                        {remainingChars}
                    </span>

                    <button
                        type="submit"
                        disabled={composeMutation.isPending || isOverLimit || (!text.trim() && mediaUrls.length === 0)}
                        className="bg-primary-container text-white font-bold text-xs px-6 py-2.5 rounded-xl crimson-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border-none"
                    >
                        {composeMutation.isPending ? (
                            <>
                                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                                <span>Broadcasting...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">campaign</span>
                                <span>Broadcast</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
