// src/features/timeline/ThreadLine.jsx
import React from 'react';

export function ThreadLine({ type, depth }) {
    // Base structural offset adjustments to align lines perfectly under the center axis of a 48px (w-12) avatar
    // depth === 0: left-[48px] (24px offset + padding)
    // depth === 1: left-[48px]
    // depth > 1: left-[104px] (deep nested offset)
    const leftOffsetClass = depth > 1 ? 'left-[104px]' : 'left-[48px]';

    switch (type) {
        // 🔽 Case A: A continuous top-to-bottom trail underneath a parent avatar frame
        case 'ancestor':
            return (
                <div
                    className={`absolute top-[72px] bottom-0 w-[2px] bg-white/10 -translate-x-1/2 z-0 pointer-events-none ${leftOffsetClass}`}
                />
            );

        // ↩️ Case B: A custom curved branch indicator for direct sub-replies (depth === 1)
        case 'l-branch':
            return (
                <div
                    className="absolute top-0 left-[48px] w-14 h-12 border-l-2 border-b-2 border-white/10 rounded-bl-xl pointer-events-none z-0"
                />
            );

        // ⬆️ Case C: A tracking connector rule running from the top border down to a sub-reply avatar cap (depth > 1)
        case 'sub-reply-top':
            return (
                <div
                    className="absolute top-0 h-[30px] w-[2px] bg-white/10 left-[104px] -translate-x-1/2 z-0 pointer-events-none"
                />
            );

        // 🔽 Case D: A straight connecting rule trailing down below an active response avatar frame
        case 'descendant-child':
            return (
                <div
                    className="absolute top-[72px] bottom-0 w-[2px] bg-white/10 left-[104px] -translate-x-1/2 z-0 pointer-events-none"
                />
            );

        default:
            return null;
    }
}
