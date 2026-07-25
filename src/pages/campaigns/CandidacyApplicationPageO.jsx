// src/pages/campaigns/CandidacyApplicationPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import {
    useCandidacyApplicationQuery,
    useSubmitCandidacyApplicationMutation
} from '../../features/campaigns/useCandidacyApplication';
import {
    CheckCircle2,
    Gavel,
    UploadCloud,
    Copy,
    Check,
    Loader2,
    X,
    FileCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const CandidacyApplicationPageO = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // Local form buffer states
    const [profession, setProfession] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    // TanStack Data Flow Integration Pipelines
    const { data: app, isPending } = useCandidacyApplicationQuery();
    const submitMutation = useSubmitCandidacyApplicationMutation();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!profession.trim() || !proofFile) return;

        submitMutation.mutate({ profession: profession.trim(), linkedinUrl: linkedinUrl.trim(), proofFile }, {
            onSuccess: () => {
                setProfession('');
                setProofFile(null);
                setLinkedinUrl('');
            }
        });
    };

    const handleCopyLink = (appId) => {
        const link = `kollective.social/campaigns/apply/vouch?id=${appId}`;
        navigator.clipboard.writeText(link);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (isPending) {
        return (
            <div className="pt-32 text-center flex flex-col items-center justify-center gap-3 font-sans">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                    Fetching validation ledgers...
                </span>
            </div>
        );
    }

    // Guard Rule: If the user is already verified as an active candidate
    if (currentUser?.is_candidate && app?.status === 'approved') {
        return (
            <div className="max-w-lg mx-auto pt-20 pb-16 text-center flex flex-col items-center gap-5 animate-in fade-in duration-200 font-sans px-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-card flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                        Candidacy Active
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-text-secondary leading-relaxed max-w-sm mx-auto">
                        Your working-class credentials have been validated by the regional jury pool node.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/campaigns/studio')}
                    className="px-6 py-3.5 bg-primary hover:brightness-110 text-on-primary text-xs sm:text-sm font-bold rounded-card border-none uppercase tracking-wider cursor-pointer shadow-xs transition-all active:scale-98"
                >
                    Enter Candidate Studio
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-20 w-full font-sans animate-in fade-in duration-200">

            {/* Structural Header */}
            <div className="border-b border-outline-variant/40 pb-5 select-none space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-text-primary tracking-tight">
                    Candidacy Onboarding Desk
                </h1>
                <p className="text-xs sm:text-sm font-medium text-text-secondary">
                    Authenticate your working-class background parameters to unlock platform candidate status.
                </p>
            </div>

            {/* 🚀 CASE A: USER HAS AN ACTIVE REGISTRATION ON FILE */}
            {app ? (
                <div className="space-y-6 flex flex-col w-full">

                    {/* STEPPER GRAPHIC PROGRESS DISPLAY BAR LINE PANEL */}
                    <div className="bg-surface-container border border-outline-variant p-6 sm:p-8 rounded-card flex flex-col gap-6 select-none shadow-2xl">
                        <span className="text-xs font-mono font-bold uppercase text-text-secondary tracking-wider">
                            Application Validation Flow Stage
                        </span>

                        <div className="flex items-center w-full relative pt-2">
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-surface-container-high z-0" />
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 z-0"
                                style={{ width: app.status === 'under_jury_review' ? '50%' : app.status === 'approved' ? '100%' : '15%' }}
                            />

                            {/* Stepper Dots Indicators */}
                            <div className="flex justify-between w-full relative z-10 font-mono font-bold text-xs sm:text-sm">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-primary border border-primary text-on-primary flex items-center justify-center font-black">
                                        1
                                    </div>
                                    <span className="text-text-primary text-xs sm:text-sm">Constituent Vouches</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "w-7 h-7 rounded-full border flex items-center justify-center transition-colors font-black",
                                        ['under_jury_review', 'approved'].includes(app.status)
                                            ? "bg-primary border-primary text-on-primary"
                                            : "bg-surface-container-low border-outline-variant text-text-secondary"
                                    )}>
                                        2
                                    </div>
                                    <span className={['under_jury_review', 'approved'].includes(app.status) ? 'text-text-primary text-xs sm:text-sm' : 'text-text-secondary/60 text-xs sm:text-sm'}>
                                        Jury Audit
                                    </span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "w-7 h-7 rounded-full border flex items-center justify-center transition-colors font-black",
                                        app.status === 'approved'
                                            ? "bg-primary border-primary text-on-primary"
                                            : "bg-surface-container-low border-outline-variant text-text-secondary"
                                    )}>
                                        3
                                    </div>
                                    <span className={app.status === 'approved' ? 'text-text-primary text-xs sm:text-sm' : 'text-text-secondary/60 text-xs sm:text-sm'}>
                                        Deployment
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STATUS CONTEXT SPECIFIC ACTION STRIP BLOCKS */}
                    {app.status === 'pending_vouches' && (
                        <div className="p-6 sm:p-8 bg-surface-container border border-outline-variant rounded-card space-y-5 animate-in fade-in duration-200 shadow-2xl">
                            <div className="space-y-1 select-none">
                                <h3 className="text-base sm:text-lg font-bold text-secondary">
                                    Awaiting Peer Validation Vouch Signatures
                                </h3>
                                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                                    To unlock jury review pipelines, you must collect exactly <span className="text-text-primary font-bold">3 vouches</span> from verified platform citizens residing in your same state (<span className="text-primary font-mono font-bold">{currentUser?.state || 'TX'}</span>).
                                </p>
                            </div>

                            {/* Progress counter indicators */}
                            <div className="flex justify-between font-mono text-xs font-bold uppercase tracking-wider text-text-secondary select-none bg-surface-container-low p-4 rounded-card border border-outline-variant/60">
                                <span>Vouches Gathered Matrix</span>
                                <span className="text-secondary font-black">{app.vouches_count || 0} / 3 Signatures</span>
                            </div>

                            {/* Sharing link box */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">
                                    Share request text link
                                </label>
                                <div className="w-full bg-surface-container-low border border-outline-variant p-3.5 rounded-card font-mono text-xs sm:text-sm text-text-secondary relative flex items-center justify-between gap-3">
                                    <span className="truncate select-all pr-2 text-text-primary">
                                        kollective.social/campaigns/apply/vouch?id={app.id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyLink(app.id)}
                                        className="px-3 py-1.5 bg-surface-container border border-outline-variant rounded-card font-bold text-xs uppercase text-text-primary cursor-pointer select-none hover:bg-surface-container-high transition-all flex items-center gap-1.5 shrink-0"
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-emerald-500">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5 text-text-secondary" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {app.status === 'under_jury_review' && (
                        <div className="p-8 bg-surface-container border border-outline-variant rounded-card space-y-3 select-none animate-in fade-in duration-200 text-center shadow-2xl">
                            <div className="w-14 h-14 rounded-card bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
                                <Gavel className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-text-primary tracking-tight pt-2">
                                Jury Verification Matrix Active
                            </h3>
                            <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed font-medium">
                                Your 3 constituent signatures are logged. A decentralized jury pool of 5 randomly chosen residents inside your region are currently auditing your working-class employment data. This takes less than 48 hours.
                            </p>
                        </div>
                    )}

                </div>
            ) : (
                /* 📝 CASE B: FILE SYSTEM IS EMPTY — RENDER INTRODUCTORY MULTIPART FORM BLOCK */
                <form onSubmit={handleFormSubmit} className="space-y-6 bg-surface-container border border-outline-variant p-6 sm:p-8 rounded-card shadow-2xl flex flex-col w-full animate-in fade-in duration-300">
                    <div className="border-b border-outline-variant/40 pb-4 select-none">
                        <h2 className="text-lg sm:text-xl font-black text-text-primary tracking-tight">
                            Declare Your Onboarding File
                        </h2>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1">
                            Submit verification records to prevent corporate party machine infiltration
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">
                            Your Primary Worker Profession <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Transit Electrician, Registered Nurse, Retail Logistics Clerk"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-3 text-xs sm:text-sm font-bold text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    {/* 💼 Optional: LinkedIn Career Link Input field row */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center select-none">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">LinkedIn Profile Link</label>
                            <span className="text-[10px] font-mono font-bold text-text-secondary/40 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Optional</span>
                        </div>
                        <input
                            type="url"
                            placeholder="https://linkedin.com"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary-container font-medium"
                        />
                    </div>


                    {/* File Drag & Drop Upload Block */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">
                            Employment / Identity Verification Record <span className="text-primary">*</span>
                        </label>
                        <div className={cn(
                            "w-full min-h-[140px] border-2 border-dashed rounded-card flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all relative group",
                            proofFile
                                ? "border-emerald-500/50 bg-emerald-500/5"
                                : "border-outline-variant hover:border-primary/50 bg-surface-container-low"
                        )}>
                            <input
                                type="file"
                                required
                                accept="image/*,application/pdf"
                                onChange={(e) => setProofFile(e.target.files[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />

                            {proofFile ? (
                                <div className="flex items-center gap-3 z-20">
                                    <FileCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                                    <div className="text-left">
                                        <p className="text-xs sm:text-sm font-bold text-text-primary truncate max-w-xs sm:max-w-md">
                                            {proofFile.name}
                                        </p>
                                        <p className="text-[11px] font-mono text-text-secondary">
                                            {(proofFile.size / (1024 * 1024)).toFixed(2)} MB · Record attached
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setProofFile(null);
                                        }}
                                        className="p-1 rounded-card hover:bg-surface-container-high text-text-secondary hover:text-text-primary z-30 transition-colors border-none bg-transparent cursor-pointer ml-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 pointer-events-none select-none">
                                    <UploadCloud className="w-8 h-8 text-text-secondary group-hover:text-primary transition-colors" />
                                    <span className="text-xs sm:text-sm font-bold text-text-primary">
                                        Attach your verification record...
                                    </span>
                                    <span className="text-[11px] text-text-secondary font-mono">
                                        Attach Union Card, Pay stub, or Local Utility Log (PDF/Image)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitMutation.isPending || !profession.trim() || !proofFile}
                            className={cn(
                                "px-6 py-3.5 bg-primary hover:brightness-110 text-white font-bold text-xs sm:text-sm rounded-card cursor-pointer border-none uppercase tracking-wider shadow-xs transition-all active:scale-98 select-none flex items-center gap-2",
                                (submitMutation.isPending || !profession.trim() || !proofFile) && "opacity-40 cursor-not-allowed"
                            )}
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Ingesting Portfolio...</span>
                                </>
                            ) : (
                                <span>Submit Credentials File</span>
                            )}
                        </button>
                    </div>
                </form>
            )}

        </div>
    );
};