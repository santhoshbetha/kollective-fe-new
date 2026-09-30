// src/features/timeline/ThreadLine.jsx
import { cn } from "@/lib/utils";

export function ThreadLine({ type, depth, userType }) {
    // Offset alignments mapping directly to center coordinates under 48px avatars
    const leftOffsetClass = depth > 1 ? 'left-[104px]' : 'left-[48px]';

    // 🎨 EXTENDED BRANDING MATRICES: Map precise user types to attentive, theme-friendly colors
    const getBrandColors = () => {
        switch (userType?.toLowerCase()) {
            case 'journalist':
            case 'voice':
                return {
                    bg: 'bg-primary-container', // Signature crimson alert
                    border: 'border-primary-container',
                    shadow: 'rgba(211,47,47,0.3)',
                    pulse: 'from-primary-container'
                };
            case 'activist':
                return {
                    bg: 'bg-amber-500', // Dynamic high-urgency amber
                    border: 'border-amber-500',
                    shadow: 'rgba(245,158,11,0.3)',
                    pulse: 'from-amber-500'
                };
            case 'scholar':
                return {
                    bg: 'bg-indigo-400', // Academic deep-indigo/violet
                    border: 'border-indigo-400',
                    shadow: 'rgba(129,140,248,0.3)',
                    pulse: 'from-indigo-400'
                };
            default:
                return {
                    bg: 'bg-white/10', // Standard layout track profile
                    border: 'border-white/10',
                    shadow: 'rgba(255,255,255,0.1)',
                    pulse: 'from-white/20'
                };
        }
    };

    const brand = getBrandColors();

    // 🚀 Performance-first layout token strings
    const baseLineStyles = cn(
        "absolute -translate-x-1/2 z-0 pointer-events-none transition-all duration-300 group-hover:bg-primary-container",
        "group-hover:shadow-[0_0_8px_rgba(211,47,47,0.4)]",
        brand.bg
    );

    const baseBranchStyles = cn(
        "absolute border-b-2 border-l-2 pointer-events-none z-0 transition-all duration-300 group-hover:border-primary-container",
        "group-hover:drop-shadow-[0_0_4px_rgba(211,47,47,0.3)]",
        brand.border
    );

    switch (type) {
        // 🔽 Case A: Continuous top-to-bottom trail underneath a parent avatar frame
        case 'ancestor':
            return (
                <div className={cn(baseLineStyles, leftOffsetClass, "top-[72px] bottom-0 w-[2px]")}>
                    {/* Synchronized contextual downward micro-pulse */}
                    <div className={cn("w-full h-1/2 bg-gradient-to-b to-transparent opacity-0 animate-thread-pulse", brand.pulse)} />
                </div>
            );

        // ↩️ Case B: Curved branch indicator for direct sub-replies (depth === 1)
        case 'l-branch':
            return (
                <div className={cn(baseBranchStyles, "top-0 left-[48px] w-14 h-12 rounded-bl-xl")} />
            );

        // ⬆️ Case C: Tracking connector running from top border down to sub-reply avatar cap (depth > 1)
        case 'sub-reply-top':
            return (
                <div className={cn(baseLineStyles, "top-0 h-[30px] w-[2px] left-[104px]")} />
            );

        // 🔽 Case D: Straight connecting rule trailing down below an active response avatar frame
        case 'descendant-child':
            return (
                <div className={cn(baseLineStyles, "top-[72px] bottom-0 w-[2px] left-[104px]")}>
                    <div className={cn("w-full h-1/2 bg-gradient-to-b to-transparent opacity-0 animate-thread-pulse", brand.pulse)} />
                </div>
            );

        default:
            return null;
    }
}


/*
// src/features/timeline/ThreadLine.jsx
import React from 'react';
import { cn } from '../../utils/cn'; // Adjust your classnames utility path

export function ThreadLine({ type, depth, verificationType }) {
    // Offset alignments mapping directly to center coordinates under 48px avatars
    const leftOffsetClass = depth > 1 ? 'left-[104px]' : 'left-[48px]';

    // 🎨 BRANDING SWITCHBOARD: Map verification channels directly to attentive accent hues
    const getBrandColors = () => {
        switch (verificationType) {
            case 'journalist':
                return {
                    bg: 'bg-primary-container', // Your core Voice/Journalist crimson-red theme color
                    border: 'border-primary-container',
                    shadow: 'rgba(211,47,47,0.3)',
                    pulse: 'from-primary-container'
                };
            case 'organization':
                return {
                    bg: 'bg-emerald-500', // Emerald green theme colors for companies/networks
                    border: 'border-emerald-500',
                    shadow: 'rgba(16,185,129,0.3)',
                    pulse: 'from-emerald-500'
                };
            default:
                return {
                    bg: 'bg-white/10', // Default clean configuration bounds
                    border: 'border-white/10',
                    shadow: 'rgba(255,255,255,0.1)',
                    pulse: 'from-white/20'
                };
        }
    };

    const brand = getBrandColors();

    // 🚀 Global Animation & Interaction Tokens
    const baseLineStyles = cn(
        "absolute -translate-x-1/2 z-0 pointer-events-none transition-all duration-300 group-hover:bg-primary-container",
        "group-hover:shadow-[0_0_8px_rgba(211,47,47,0.4)]",
        brand.bg
    );
    
    const baseBranchStyles = cn(
        "absolute border-b-2 border-l-2 pointer-events-none z-0 transition-all duration-300 group-hover:border-primary-container",
        "group-hover:drop-shadow-[0_0_4px_rgba(211,47,47,0.3)]",
        brand.border
    );

    switch (type) {
        // 🔽 Case A: Continuous top-to-bottom trail underneath a parent avatar frame
        case 'ancestor':
            return (
                <div className={cn(baseLineStyles, leftOffsetClass, "top-[72px] bottom-0 w-[2px]")} style={{ shadowColor: brand.shadow }}>
                   <div className={cn("w-full h-1/2 bg-gradient-to-b to-transparent opacity-0 animate-thread-pulse", brand.pulse)} />
                </div >
            );

        // ↩️ Case B: Custom curved branch indicator for direct sub-replies (depth === 1)
        case 'l-branch':
return (
    <div className={cn(baseBranchStyles, "top-0 left-[48px] w-14 h-12 rounded-bl-xl")} />
);

        // ⬆️ Case C: Tracking connector running from top border down to sub-reply avatar cap (depth > 1)
        case 'sub-reply-top':
return (
    <div className={cn(baseLineStyles, "top-0 h-[30px] w-[2px] left-[104px]")} />
);

        // 🔽 Case D: Straight connecting rule trailing down below an active response avatar frame
        case 'descendant-child':
return (
    <div className={cn(baseLineStyles, "top-[72px] bottom-0 w-[2px] left-[104px]")}>
        <div className={cn("w-full h-1/2 bg-gradient-to-b to-transparent opacity-0 animate-thread-pulse", brand.pulse)} />
    </div>
);

        default:
return null;
    }
}

*/