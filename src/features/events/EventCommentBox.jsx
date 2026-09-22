// src/features/events/EventCommentBox.jsx
import React, { useState, useRef } from 'react';
import { useAddEventComment } from './useEventsFeature';
import { EmojiSelector } from '../../components/EmojiSelector';

export function EventCommentBox({ eventId }) {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const fileInputRef = useRef(null);

    const commentMutation = useAddEventComment(eventId);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() && !image) return;

        commentMutation.mutate({ eventId, commentText: text.trim(), imageUrl: image }, {
            onSuccess: () => {
                setText('');
                setImage(null);
                setShowEmoji(false);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full bg-surface-container-low p-4 rounded-2xl border border-white/5 relative">
            {commentMutation.isError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl font-medium">
                    Failed to post update: {commentMutation.error?.message}
                </div>
            )}

            <div className="flex flex-col gap-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Coordinate coordination parameters, logistics, updates..."
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-3 text-body-md focus:outline-none focus:border-primary-container transition-colors resize-none h-20 placeholder-text-text-secondary/30 text-text-primary leading-relaxed"
                    disabled={commentMutation.isPending}
                    maxLength={400}
                />

                {image && (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/10 group">
                        <img src={image} alt="Attachment Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => setImage(null)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black text-white text-[10px] flex items-center justify-center border-none cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-2 relative">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 rounded-full hover:bg-white/5 text-text-secondary hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center"
                            title="Attach Image"
                        >
                            <span className="material-symbols-outlined text-[20px]">attachment</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowEmoji(!showEmoji)}
                            className="p-1.5 rounded-full hover:bg-white/5 text-text-secondary hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center"
                            title="Add Emoji"
                        >
                            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                        </button>

                        {showEmoji && (
                            <EmojiSelector
                                onSelect={(emoji) => setText((prev) => prev + emoji)}
                                onClose={() => setShowEmoji(false)}
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={commentMutation.isPending || (!text.trim() && !image)}
                        className="bg-primary-container text-white font-bold text-label-md px-6 py-2.5 rounded-xl crimson-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center min-w-[90px] disabled:opacity-40 disabled:pointer-events-none cursor-pointer border-none"
                    >
                        {commentMutation.isPending ? (
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            'Post'
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
