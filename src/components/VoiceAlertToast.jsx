// src/components/VoiceAlertToast.jsx
import React, { useEffect, useRef } from 'react';
import { useSocket } from '../context/PhoenixSocketContext';
import { Volume2, X } from 'lucide-react';

export function VoiceAlertToast() {
    const { latestVoiceAlert, setLatestVoiceAlert } = useSocket();
    const audioRef = useRef(null);

    useEffect(() => {
        if (latestVoiceAlert?.voice_url && audioRef.current) {
            // Force browser to play the audio stream alert right away
            audioRef.current.load();
            audioRef.current.play().catch(err => {
                console.warn("Autoplay was blocked by browser audio security permissions policies:", err);
            });
        }
    }, [latestVoiceAlert]);

    if (!latestVoiceAlert) return null;

    return (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-white p-4 rounded-2xl shadow-2xl border border-white/20 max-w-sm flex items-start gap-4 animate-in slide-in-from-top-6 duration-300">
            {/* Native browser audio element hidden behind the scenes */}
            <audio ref={audioRef} src={latestVoiceAlert.voice_url} preload="auto" />

            <img src={latestVoiceAlert.author_avatar} className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" alt="Author" />

            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-widest bg-white/10 w-fit px-2 py-0.5 rounded-md mb-1 text-white">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    <span>Live District Broadcast</span>
                </div>
                <h4 className="text-xs font-black truncate">@{latestVoiceAlert.author_name} issued an alert</h4>
                <p className="text-[11px] opacity-90 line-clamp-2 mt-0.5 italic leading-tight">
                    "{latestVoiceAlert.preview_text || "No preview text recorded"}"
                </p>
            </div>

            <button
                onClick={() => {
                    if (audioRef.current) audioRef.current.pause();
                    setLatestVoiceAlert(null);
                }}
                className="text-white/60 hover:text-white cursor-pointer bg-transparent border-none outline-none shrink-0"
            >
                <X className="w-4 h-4 stroke-[2.5px]" />
            </button>
        </div>
    );
}
