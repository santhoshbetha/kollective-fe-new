// src/features/timeline/ThreadLine.jsx
import { cn } from "@/lib/utils";

export function ThreadLineN1({ type, depth }) {
    // Offset alignments mapping directly to center coordinates under 48px avatars
    const leftOffsetClass = depth > 1 ? 'left-[104px]' : 'left-[48px]';

    // 🚀 Global Animation Shared Classes:
    // Uses group-hover matching so when a parent .group card is hovered, the lines transition smoothly.
    const baseLineStyles = "absolute -translate-x-1/2 z-0 pointer-events-none transition-all duration-300 group-hover:bg-primary-container group-hover:shadow-[0_0_8px_rgba(211,47,47,0.4)]";
    const baseBranchStyles = "absolute border-white/10 pointer-events-none z-0 transition-all duration-300 group-hover:border-primary-container group-hover:drop-shadow-[0_0_4px_rgba(211,47,47,0.3)]";

    switch (type) {
        // 🔽 Case A: Continuous top-to-bottom trail underneath a parent avatar frame
        case 'ancestor':
            return (
                <div className={cn(baseLineStyles, leftOffsetClass, "top-[72px] bottom-0 w-[2px] bg-white/10")}>
                    {/* Subtle downward pulse animation effect on mount */}
                    <div className="w-full h-1/2 bg-gradient-to-b from-primary-container to-transparent opacity-0 animate-thread-pulse" />
                </div>
            );

        // ↩️ Case B: Custom curved branch indicator for direct sub-replies (depth === 1)
        case 'l-branch':
            return (
                <div className={cn(baseBranchStyles, "top-0 left-[48px] w-14 h-12 border-l-2 border-b-2 rounded-bl-xl")} />
            );

        // ⬆️ Case C: Tracking connector running from top border down to sub-reply avatar cap (depth > 1)
        case 'sub-reply-top':
            return (
                <div className={cn(baseLineStyles, "top-0 h-[30px] w-[2px] bg-white/10 left-[104px]")} />
            );

        // 🔽 Case D: Straight connecting rule trailing down below an active response avatar frame
        case 'descendant-child':
            return (
                <div className={cn(baseLineStyles, "top-[72px] bottom-0 w-[2px] bg-white/10 left-[104px]")}>
                    <div className="w-full h-1/2 bg-gradient-to-b from-primary-container to-transparent opacity-0 animate-thread-pulse" />
                </div>
            );

        default:
            return null;
    }
}
