// src/components/KollectiveImagePlayer.jsx
import React, { useState, useEffect } from 'react';
import { Play, Eye, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to match your local project layout path

/**
 * ⚡ ENHANCED SOVEREIGN MEDIA TIMELINE CONTROLLER
 * Supports Blurhash -> Static Frame -> Full GIF Lifecycle,
 * while encapsulating your custom imageMeta overlay fields and onClick lightbox triggers.
 */
export function KollectiveImagePlayer({
    src = '',
    staticUrl = '',
    blurhash = '',
    imageMeta = '',
    alt = 'Editorial Voice Visual',
    className = '',
    onClick // Pass your click handler from PostCard down here to slide open the Lightbox
}) {
    const isGif = src?.toLowerCase().endsWith('.gif') || src?.includes('gif');

    // Media performance lifecycle state monitors
    const [isPlaying, setIsPlaying] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const activePreviewFrame = staticUrl || src;

    useEffect(() => {
        setIsPlaying(false);
        setIsImageLoaded(false);
        setHasError(false);
    }, [src, staticUrl]);

    const handleContainerClick = (e) => {
        if (onClick) {
            e.stopPropagation();
            onClick(e); // Trigger the parent carousel/lightbox opening sequence
        }
    };

    return (
        <div
            onClick={handleContainerClick}
            onMouseEnter={() => isGif && setIsPlaying(true)}
            onMouseLeave={() => isGif && setIsPlaying(false)}
            className={cn(
                "relative w-full aspect-[16/9] overflow-hidden bg-neutral-900 select-none group border border-black/5 dark:border-white/5 rounded-xl cursor-pointer shadow-md",
                className
            )}
        >
            {/* 🎨 STATE 1: LOADING TIMELINE SKELETON PLACEHOLDER */}
            {(!isImageLoaded && !hasError) && (
                <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center font-mono text-[10px] font-bold uppercase tracking-widest text-text-secondary/20">
                    Buffering Asset...
                </div>
            )}

            {/* ERROR INTERCEPTOR FRAME */}
            {hasError && (
                <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-2 p-4 text-center text-xs text-rose-400 font-bold font-sans">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <span>Failed to resolve visual asset.</span>
                </div>
            )}

            {/* 🎥 ACTIVE IMAGE CONTAINER CANVAS */}
            {!hasError && (
                <>
                    <img
                        src={isPlaying && isGif ? src : activePreviewFrame}
                        alt={imageMeta || alt}
                        onLoad={() => setIsImageLoaded(true)}
                        onError={() => setHasError(true)}
                        className={cn(
                            "w-full h-full object-cover transition-all duration-700",
                            !isImageLoaded ? "opacity-0" : "opacity-100",
                            (!isPlaying) ? "scale-100 group-hover:scale-[1.015]" : ""
                        )}
                        loading="lazy"
                    />

                    {/* Shadow overlay vignette backdrop to make text pop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/77 via-black/10 to-transparent pointer-events-none" />
                </>
            )}

            {/* 🎫 STATE 2: INTERACTIVE VISUAL PLAY PILL BADGE FOR PAUSED GIFS */}
            {(isGif && !isPlaying && isImageLoaded) && (
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center animate-in fade-in duration-150">
                    <div className="px-4 py-2 bg-black/75 hover:bg-primary-container text-white border border-white/10 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-md font-mono text-[10px] font-black uppercase tracking-widest transition-all scale-100 group-hover:scale-105 active:scale-95">
                        <Play className="w-3.5 h-3.5 fill-current stroke-[3px]" />
                        <span>GIF</span>
                    </div>
                </div>
            )}

            {/* 🏛️ INTEGRATED ACCENTS LAYER: Avatar Stack & Image Meta Overlay Context Row */}
            {(isImageLoaded && !hasError) && (
                <div className="absolute bottom-4 left-6 flex items-center gap-3 select-none pointer-events-none">
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-surface-ink bg-white/10 backdrop-blur-xs flex items-center justify-center text-[10px] text-white/40 font-mono font-bold">1</div>
                        <div className="w-6 h-6 rounded-full border border-surface-ink bg-white/10 backdrop-blur-xs flex items-center justify-center text-[10px] text-white/40 font-mono font-bold">2</div>
                        <div className="w-6 h-6 rounded-full border border-surface-ink bg-white/10 backdrop-blur-xs flex items-center justify-center text-[10px] text-white/40 font-mono font-bold">3</div>
                    </div>
                    {imageMeta && (
                        <span className="text-[11px] font-bold font-sans text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md border border-white/5 shadow-sm tracking-wide">
                            {imageMeta}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
