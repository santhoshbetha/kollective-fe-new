import React, { useState, useRef, useEffect } from 'react';
import { useAudioSettingsStore } from '../store/useAudioSettingsStore';

export function KollectiveVideoPlayer({
    src,
    poster,
    isGif = false,
    title = "",
    className = "",
    processingStatus = "completed" // Hooked to your Elixir PubSub payload status
}) {
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [hasError, setHasError] = useState(false);

    // 🚀 THE GLOBAL SYNC ACCENT: Bind local parameters directly to your global media store state
    const isGlobalMuted = useAudioSettingsStore((state) => state.isGlobalMuted);
    const setGlobalMuted = useAudioSettingsStore((state) => state.setGlobalMuted);

    // GIFs are structurally always muted, otherwise follow the global timeline state preference
    const isMuted = isGif ? true : isGlobalMuted;

    // --- HOOK: VIEWPORT TIMELINE INTERSECTION OBSERVER
    // Keep intersection observers active from before to pause elements scrolling off screen-
    useEffect(() => {
        const container = containerRef.current;
        const currentVideo = videoRef.current;

        if (!container || !currentVideo || isGif || processingStatus !== "completed") return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    currentVideo.play()
                        .then(() => setIsPlaying(true))
                        .catch((err) => console.warn("Autoplay block caught:", err));
                } else {
                    currentVideo.pause();
                    setIsPlaying(false);
                }
            },
            { threshold: 0.2 } // Triggers when 20% of the video canvas is visible
        );

        observer.observe(container);
        return () => {
            if (container) observer.unobserve(container);
            observer.disconnect();
        };
    }, [isGif, processingStatus]);

    // --- HOOK: HARD AUDIO VOLUME SYNC ---
    // Track state variations synchronously across direct browser raw DOM node layers
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds) || timeInSeconds === null) return "0:00";
        const mins = Math.floor(timeInSeconds / 60);
        const secs = Math.floor(timeInSeconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
    // --- HANDLER: PLAY / PAUSE LOGIC ---
    const togglePlay = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const video = videoRef.current;
        if (!video || processingStatus !== "completed") return;

        if (video.paused) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        setHasError(false);
                    })
                    .catch((err) => {
                        console.warn("Playback blocked. Trying muted channel fallback:", err);
                        // Force global timeline volume state down on failure block
                        setGlobalMuted(true);
                        video.play()
                            .then(() => {
                                setIsPlaying(true);
                                setHasError(false);
                            })
                            .catch((err2) => {
                                console.error("Critical timeline video player error:", err2);
                                setHasError(true);
                            });
                    });
            }
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    // --- HANDLER: VOLUME OR MUTING CHANGE ---
    const toggleMute = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (isGif) return;
        setGlobalMuted(!isGlobalMuted);
    };

    // --- HANDLER: PROGRESS TIMELINE SCRUBBING ---
    const handleSeek = (e) => {
        if (e) e.stopPropagation();
        if (!videoRef.current || !duration) return;
        const newTime = parseFloat(e.target.value);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // --- HANDLER: FULLSCREEN SWITCHER ---
    const toggleFullscreen = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const video = videoRef.current;
        if (!video) return;

        if (document.fullscreenElement) {
            document.exitFullscreen().catch((err) => console.error(err));
        } else {
            if (video.requestFullscreen) video.requestFullscreen();
            else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
        }
    };

    // --- HANDLER: USER MOUSE MOVEMENT CONTROLS TIMING ---
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 2500);
        }
    };
    return (
        <div
            ref={containerRef}
            className={`relative w-full aspect-video bg-[#0d0d0d] rounded-2xl overflow-hidden border border-white/10 shadow-lg group select-none ${className}`}
            onClick={togglePlay}
            onMouseEnter={() => {
                setIsHovered(true);
                setShowControls(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                if (isPlaying) setShowControls(false);
            }}
            onMouseMove={handleMouseMove}
        >
            {/* --- ELIXIR ASYNC TRANSCODING STATUS OVERLAYS --- */}
            {processingStatus === "processing" && (
                <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center p-4 text-center gap-3 backdrop-blur-xs">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-gray-300">Processing video optimizations...</p>
                </div>
            )}

            {processingStatus === "failed" && (
                <div className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center p-4 text-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-3xl">disabled_by_default</span>
                    <p className="text-sm font-bold text-white">Transcoding Failed</p>
                    <p className="text-xs text-gray-400">This file type is unsupported.</p>
                </div>
            )}

            {/* --- NATIVE VIDEO LAYER --- */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                muted={isMuted}
                loop={isGif}
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={() => {
                    setDuration(videoRef.current?.duration || 0);
                    setHasError(false);
                }}
                onEnded={() => setIsPlaying(false)}
                onError={() => processingStatus === "completed" && setHasError(true)}
                className="w-full h-full object-cover cursor-pointer"
            />

            {/* --- ERROR FALLBACK CANVAS --- */}
            {hasError && processingStatus === "completed" && (
                <div className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center p-4 text-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-2xl">videocam_off</span>
                    <p className="text-xs font-bold text-white">Video stream unavailable</p>
                </div>
            )}

            {/* --- PLAYER OVERLAYS & PROGRESS CONTROLS --- */}
            {!hasError && processingStatus === "completed" && (
                <>
                    {/* Metadata Badges */}
                    {isGif ? (
                        <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded bg-black/70 border border-white/10 font-mono font-black text-[10px] text-white tracking-widest uppercase">
                            GIF
                        </div>
                    ) : (
                        !isPlaying && duration > 0 && (
                            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 font-mono font-bold text-xs text-white tracking-wider flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px] text-indigo-400">videocam</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        )
                    )}

                    {/* Central Play/Pause Giant Trigger Button Overlay */}
                    {(!isPlaying || isHovered) && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200">
                            <button
                                type="button"
                                onClick={togglePlay}
                                className={`w-14 h-14 rounded-full bg-black/60 hover:bg-indigo-600/90 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-2xl transition-all pointer-events-auto cursor-pointer ${!isPlaying ? "scale-100 opacity-100" : "scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[30px] ml-0.5">
                                    {isPlaying ? "pause" : "play_arrow"}
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Bottom Controls Drawer */}
                    <div
                        className={`absolute bottom-0 inset-x-0 z-20 p-3 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${showControls || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Timeline Progress Range Slider Input Track */}
                        {!isGif && (
                            <div className="relative w-full flex items-center">
                                <input
                                    ref={progressRef}
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    step="0.1"
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="w-full h-1 bg-white/20 rounded appearance-none cursor-pointer accent-indigo-500"
                                    style={{
                                        background: `linear-gradient(to right, #6366f1 ${progressPercentage}%, rgba(255,255,255,0.2) ${progressPercentage}%)`,
                                    }}
                                />
                            </div>
                        )}

                        {/* Control Bar Actions Layout Grid */}
                        <div className="flex items-center justify-between gap-3 text-white">
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={togglePlay} className="p-1 hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer flex items-center">
                                    <span className="material-symbols-outlined text-[22px]">{isPlaying ? "pause" : "play_arrow"}</span>
                                </button>
                                <button type="button" onClick={toggleMute} className="p-1 hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer flex items-center">
                                    <span className="material-symbols-outlined text-[20px]">{isMuted ? "volume_off" : "volume_up"}</span>
                                </button>
                                {!isGif && (
                                    <span className="text-xs font-mono text-gray-400 font-medium">
                                        {formatTime(currentTime)}/{formatTime(duration)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 min-w-0">
                                {title && <span className="text-xs font-medium text-gray-400 truncate max-w-[140px] hidden sm:inline">{title}</span>}
                                <button type="button" onClick={toggleFullscreen} className="p-1 hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer flex items-center">
                                    <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
