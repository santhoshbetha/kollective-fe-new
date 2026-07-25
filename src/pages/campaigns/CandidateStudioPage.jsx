import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useElectionDeadlinesQuery } from '../../features/campaigns/useDeadlines';
import {
    Video,
    AlertTriangle,
    Send,
    UploadCloud,
    CheckCircle2,
    FileText,
    X
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const CandidateStudioPage = () => {
    const currentUser = useAuthStore((state) => state.user);
    const politicalCountry = useStore((state) => state.politicalCountry);
    const districtFederal = useStore((state) => state.districtFederal);

    const { data: dates } = useElectionDeadlinesQuery(
        currentUser?.state,
        'congress',
        currentUser?.district_l1_code
    );

    const targetDeadline = dates?.[0]?.application_deadline;

    const [profession, setProfession] = useState('');
    const [manifesto, setManifesto] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCandidacyPublish = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            alert("Candidacy signed and broadcasted across localized node parameters.");
            setIsSubmitting(false);
        }, 800);
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-16 w-full font-sans animate-in fade-in duration-200">

            {/* ⚠️ Election Deadline Alert Bar */}
            {targetDeadline && (
                <div className="p-3.5 bg-error/10 border border-error/20 text-xs font-mono font-bold text-error rounded-card flex items-center gap-2.5 animate-pulse select-none">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>POTENTIAL REGISTRATION DEADLINE: {targetDeadline}</span>
                </div>
            )}

            {/* Header Context Banner */}
            <div className="border-b border-outline-variant/40 pb-4">
                <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                    Candidate Studio
                </h1>
                <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
                    Publish your platform manifesto and launch your campaign video declaration.
                </p>
            </div>

            <form onSubmit={handleCandidacyPublish} className="space-y-6 flex flex-col w-full">

                {/* Dynamic target tracking diagnostic bar */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-card text-xs font-mono font-bold text-primary flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>
                        Target Seat: {politicalCountry || 'US'} Pool · {districtFederal || 'Federal Boundary (Select in preferences)'}
                    </span>
                </div>

                {/* Working-Class Profession Input */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Your Working-Class Profession <span className="text-primary">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g., Nurse, Plumber, Warehouse Logistics Specialist"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-3 text-xs sm:text-sm font-medium text-text-primary placeholder:text-text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    />
                </div>

                {/* Drag & Drop Video Pitch Upload */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Video Pitch Upload (Max 3 Mins) <span className="text-primary">*</span>
                    </label>

                    <div className={cn(
                        "w-full min-h-[140px] border-2 border-dashed rounded-card flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all relative group",
                        videoFile
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "border-outline-variant hover:border-primary/50 bg-surface-container-low"
                    )}>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />

                        {videoFile ? (
                            <div className="flex items-center gap-3 z-20">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                                <div className="text-left">
                                    <p className="text-xs sm:text-sm font-bold text-text-primary truncate max-w-xs sm:max-w-md">
                                        {videoFile.name}
                                    </p>
                                    <p className="text-[10px] font-mono text-text-secondary/60">
                                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for processing
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setVideoFile(null);
                                    }}
                                    className="p-1 rounded-card hover:bg-surface-container-high text-text-secondary hover:text-text-primary z-30 transition-colors border-none bg-transparent cursor-pointer ml-2"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                                <UploadCloud className="w-8 h-8 text-text-secondary group-hover:text-primary transition-colors" />
                                <span className="text-xs font-bold text-text-primary">
                                    Select or drop video file asset...
                                </span>
                                <span className="text-[10px] text-text-secondary/60 font-mono">
                                    MP4 or WebM format required (Max 100MB)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manifesto Platform Statement Area */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Manifesto Platform Statement <span className="text-primary">*</span>
                    </label>
                    <textarea
                        rows={5}
                        required
                        placeholder="Outline your vision for the constituency. How will you represent the community against corporate interests?"
                        value={manifesto}
                        onChange={(e) => setManifesto(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-card p-4 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none leading-relaxed"
                    />
                </div>

                {/* Submit Action Bar */}
                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={!videoFile || !profession.trim() || !manifesto.trim() || isSubmitting}
                        className={cn(
                            "px-6 py-3 bg-primary hover:brightness-110 text-on-primary font-bold text-xs rounded-card border-none uppercase tracking-wider shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer",
                            (!videoFile || !profession.trim() || !manifesto.trim() || isSubmitting) && "opacity-40 cursor-not-allowed"
                        )}
                    >
                        <span>{isSubmitting ? 'Broadcasting...' : 'Broadcast Manifesto'}</span>
                        <Send className="w-4 h-4" />
                    </button>
                </div>

            </form>

        </div>
    );
};