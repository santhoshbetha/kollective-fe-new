// src/components/Feed/CreatePostBox.jsx
import { useFeatureFlagsStore } from '../../store/useFeatureFlags';
import { Mic, Image, Sparkles } from 'lucide-react';

export function CreatePostBox() {
    const isVoiceActive = useFeatureFlagsStore((state) => state.flags.voice_broadcast_active);

    return (
        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm">
            <textarea placeholder="Share an update or issue a district pulse alert..." className="w-full border-none resize-none focus:outline-none" />

            <div className="flex justify-between items-center border-t border-neutral-100 pt-3 mt-2">
                <div className="flex items-center gap-3 text-neutral-400">
                    <button type="button" className="hover:text-neutral-600"><Image className="w-4 h-4" /></button>

                    {/* 🚀 REAL-TIME MICROPHONE LOCKOUT */}
                    {isVoiceActive ? (
                        <button type="button" className="text-primary-container hover:brightness-105 flex items-center gap-1 text-xs font-mono font-bold bg-primary-container/5 px-2 py-1 rounded-lg border border-primary-container/10">
                            <Mic className="w-3.5 h-3.5" />
                            <span>Record Voice</span>
                        </button>
                    ) : (
                        <span className="text-[10px] font-mono font-bold text-neutral-300 uppercase select-none cursor-not-allowed flex items-center gap-1 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100">
                            <Mic className="w-3.5 h-3.5 opacity-40" />
                            <span>Voice Locked</span>
                        </span>
                    )}
                </div>
                <button className="bg-primary-container text-white px-4 py-1.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider">Publish</button>
            </div>
        </div>
    );
}

/*
 Disabling Urgent Voice Recordings in the Post Action Box
If voice_broadcast_active is toggled off, the microphone action button immediately vanishes or gray-scales out across everyone's timeline cards [1.4]:
*/