// src/features/events/EventCommentBox.jsx
import React, { useState } from 'react';
import { useAddEventComment } from './useAddEventComment';

export function EventCommentBox({ eventId }) {
    const [text, setText] = useState('');
    const commentMutation = useAddEventComment(eventId);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        commentMutation.mutate(text.trim(), {
            onSuccess: () => {
                setText(''); // Empty the input on a successful network write
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full bg-surface-container-low p-4 rounded-2xl border border-white/5">
            {commentMutation.isError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl font-medium">
                    Failed to post update: {commentMutation.error.message}
                </div>
            )}

            <div className="flex gap-3 items-end">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Coordinate coordination parameters, logistics, updates..."
                    className="flex-1 bg-surface-container-lowest border border-white/10 rounded-xl p-3 text-body-md focus:outline-none focus:border-primary-container transition-colors resize-none h-20 placeholder-text-text-secondary/30 text-text-primary leading-relaxed"
                    disabled={commentMutation.isPending}
                    maxLength={400}
                    required
                />

                <button
                    type="submit"
                    disabled={commentMutation.isPending || !text.trim()}
                    className="bg-primary-container text-white font-bold text-label-md px-6 py-3 rounded-xl crimson-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center min-w-[90px] h-12 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                    {commentMutation.isPending ? (
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                        'Post'
                    )}
                </button>
            </div>
        </form>
    );
}
