// src/features/timeline/KollectiveVideoPlayer.jsx
import React, { useState, useRef, useEffect } from 'react';

export function KollectiveVideoPlayer({ src, poster, isGif = false, title = '', className = '' }) {
    const videoRef = useRef(null);
    const progressRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(isGif);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [hasError, setHasError] = useState(false);
    const controlsTimeoutRef = useRef(null);

    // Sync muted property directly on the DOM element for cross-browser consistency
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds) || timeInSeconds === null) return '0:00';
        const mins = Math.floor(timeInSeconds / 60);
        const secs = Math.floor(timeInSeconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlay = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        setHasError(false);
                    })
                    .catch((err) => {
                        console.warn('Unmuted playback blocked or failed, attempting muted fallback:', err);
                        video.muted = true;
                        setIsMuted(true);
                        video.play()
                            .then(() => {
                                setIsPlaying(true);
                                setHasError(false);
                            })
                            .catch((err2) => {
                                console.error('Video play failed:', err2);
                                setHasError(true);
                            });
                    });
            } else {
                setIsPlaying(true);
            }
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (!videoRef.current) return;

        const newMuteState = !isMuted;
        videoRef.current.muted = newMuteState;
        setIsMuted(newMuteState);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
        setHasError(false);
    };

    const handleSeek = (e) => {
        if (e) e.stopPropagation();
        if (!videoRef.current || !duration) return;
        const newTime = parseFloat(e.target.value);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const toggleFullscreen = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (!videoRef.current) return;

        if (document.fullscreenElement) {
            document.exitFullscreen().catch((err) => console.log(err));
        } else {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            } else if (videoRef.current.webkitRequestFullscreen) {
                videoRef.current.webkitRequestFullscreen();
            }
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 2500);
        }
    };

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div
            className={`relative w-full aspect-video bg-[#0d0d0d] rounded-2xl overflow-hidden border border-white/10 shadow-lg group select-none ${className}`}
            onClick={togglePlay}
            onMouseEnter={() => { setIsHovered(true); setShowControls(true); }}
            onMouseLeave={() => { setIsHovered(false); if (isPlaying) setShowControls(false); }}
            onMouseMove={handleMouseMove}
        >
            {/* HTML5 Video element */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                muted={isMuted}
                loop={isGif}
                playsInline
                preload="metadata"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={(err) => {
                    console.error('Video error loading URL:', src, err);
                    setHasError(true);
                }}
                className="w-full h-full object-cover cursor-pointer"
            />

            {/* Error Overlay Fallback */}
            {hasError && (
                <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-4 text-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-3xl">videocam_off</span>
                    <p className="text-xs font-bold text-white">Video stream unavailable</p>
                    <p className="text-[11px] text-text-secondary truncate max-w-full px-4">{src}</p>
                </div>
            )}

            {/* 🏷️ MASTODON BADGES (GIF vs Video indicator) */}
            {isGif ? (
                <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 font-mono font-black text-[11px] text-white tracking-widest uppercase pointer-events-none">
                    GIF
                </div>
            ) : (
                !isPlaying && duration > 0 && (
                    <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 font-mono font-bold text-xs text-white tracking-wider flex items-center gap-1.5 pointer-events-none">
                        <span className="material-symbols-outlined text-[14px] text-primary-container">videocam</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                )
            )}

            {/* ⏯️ BIG CENTER PLAY OVERLAY BUTTON (Mastodon Style) */}
            {(!isPlaying || isHovered) && !hasError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200">
                    <button
                        type="button"
                        onClick={togglePlay}
                        className={`w-16 h-16 rounded-full bg-black/60 hover:bg-primary-container/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl transition-all duration-200 transform pointer-events-auto cursor-pointer ${
                            !isPlaying ? 'scale-100 opacity-100' : 'scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                        }`}
                        title={isPlaying ? 'Pause Video' : 'Play Video'}
                    >
                        <span className="material-symbols-outlined text-[36px] ml-1">
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    </button>
                </div>
            )}

            {/* 🎛️ MASTODON CUSTOM CONTROLS OVERLAY BAR */}
            {!hasError && (
                <div
                    className={`absolute bottom-0 inset-x-0 z-20 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${
                        showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Scrubbing timeline range slider */}
                    {!isGif && (
                        <div className="relative w-full flex items-center group/scrubber">
                            <input
                                ref={progressRef}
                                type="range"
                                min="0"
                                max={duration || 100}
                                step="0.1"
                                value={currentTime}
                                onChange={handleSeek}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary-container hover:h-2 transition-all"
                                style={{
                                    background: `linear-gradient(to right, var(--color-primary-container, #d32f2f) ${progressPercentage}%, rgba(255, 255, 255, 0.2) ${progressPercentage}%)`
                                }}
                            />
                        </div>
                    )}

                    {/* Control buttons & metadata row */}
                    <div className="flex items-center justify-between gap-3 text-white">
                        <div className="flex items-center gap-3">
                            {/* Play/Pause toggle */}
                            <button
                                type="button"
                                onClick={togglePlay}
                                className="p-1 hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none flex items-center"
                                title={isPlaying ? 'Pause' : 'Play'}
                            >
                                <span className="material-symbols-outlined text-[24px]">
                                    {isPlaying ? 'pause' : 'play_arrow'}
                                </span>
                            </button>

                            {/* Mute/Unmute toggle */}
                            <button
                                type="button"
                                onClick={toggleMute}
                                className="p-1 hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none flex items-center"
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                <span className="material-symbols-outlined text-[22px]">
                                    {isMuted ? 'volume_off' : 'volume_up'}
                                </span>
                            </button>

                            {/* Time indicator */}
                            {!isGif && (
                                <span className="text-xs font-mono text-text-secondary/90 font-medium">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Title preview if provided */}
                            {title && (
                                <span className="text-xs font-medium text-text-secondary truncate max-w-[160px] hidden sm:inline">
                                    {title}
                                </span>
                            )}

                            {/* Fullscreen button */}
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="p-1 hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none flex items-center"
                                title="Fullscreen"
                            >
                                <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
