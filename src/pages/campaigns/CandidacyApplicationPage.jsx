// src/pages/campaigns/CandidacyApplicationPage.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    UploadCloud,
    FileCheck,
    Loader2,
    X,
    Send
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useElectionDeadlinesQuery } from '../../features/campaigns/useDeadlines';
import { useCandidacyApplicationQuery, useSubmitCandidacyApplicationMutation } from '../../features/campaigns/useCandidacyApplication';
import { cn } from "@/lib/utils";

export const CandidacyApplicationPage = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const userState = currentUser?.state || 'TX';

    // Local form buffer states
    const [officeLevel, setOfficeLevel] = useState('');
    const [profession, setProfession] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [proofFile, setProofFile] = useState(null);

    // TanStack Data Flow Integration Pipelines
    const { data: app, isPending: isAppPending } = useCandidacyApplicationQuery();

    // Fetch active state deadlines catalogued by your volunteer ledger network
    const { data: activeDeadlines, isPending: isDeadlinesPending } = useElectionDeadlinesQuery(userState, 'all', 'all');

    const submitMutation = useSubmitCandidacyApplicationMutation();

    // REAL-TIME FILTERING: Extract open positions whose deadlines haven't expired yet
    const today = new Date();

    const openOffices = (activeDeadlines || []).filter(item => {
        const deadlineDate = new Date(item.application_deadline);
        return deadlineDate >= today; // Must be equal or in the future
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!officeLevel || !profession.trim() || !proofFile) return;

        submitMutation.mutate({
            officeLevel,
            profession: profession.trim(),
            linkedinUrl: linkedinUrl.trim(),
            proofFile
        });
    };

    if (isAppPending || isDeadlinesPending) {
        return (
            <div className="pt-32 text-center flex flex-col items-center justify-center gap-3 font-sans">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                    Syncing timeline calendars...
                </span>
            </div>
        );
    }

    // RE-ROUTE STATUS TRAP: If they already hold an application file, redirect them to the status tracker view
    if (app && ['pending_vouches', 'under_jury_review', 'approved'].includes(app.status)) {
        return <Navigate to="/campaigns/local" replace />;
    }

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-20 w-full font-sans animate-in fade-in duration-200">

            {/* 🧭 Structural Header */}
            <div className="border-b border-outline-variant/40 pb-5 select-none space-y-2">
                <button
                    type="button"
                    onClick={() => navigate('/campaigns/local')}
                    className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-bold text-xs uppercase tracking-wider border-none bg-transparent cursor-pointer mb-2 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Assembly Hub</span>
                </button>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-text-primary tracking-tight">
                    Candidacy Declaration Desk
                </h1>
                <p className="text-xs sm:text-sm font-medium text-text-secondary">
                    Submit your onboarding file. Tiers lock automatically according to volunteer calendar ledger entries.
                </p>
            </div>

            {openOffices.length === 0 ? (
                /* EXVERSION BLOCK: If no calendar frames are active, block onboarding */
                <div className="p-8 sm:p-12 border border-dashed border-error/30 bg-error/5 rounded-card text-center flex flex-col items-center gap-3 select-none">
                    <Clock className="w-10 h-10 text-error shrink-0" />
                    <h3 className="text-base sm:text-lg font-bold text-text-primary uppercase tracking-wider">
                        Registration Windows Terminated
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md">
                        There are currently no active filing deadlines found for the state of <span className="text-text-primary font-mono font-bold">{userState}</span>. Please coordinate with local Vanguard operators to refresh calendar windows.
                    </p>
                </div>
            ) : (
                /* FRESH ENTRY PORTFOLIO CONTAINER FORM */
                <form onSubmit={handleFormSubmit} className="space-y-6 bg-surface-container border border-outline-variant p-6 sm:p-8 rounded-card shadow-2xl flex flex-col w-full">

                    {/* Target Office Select */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">
                            Target Legislative / Local Seat <span className="text-primary">*</span>
                        </label>
                        <select
                            required
                            value={officeLevel}
                            onChange={(e) => setOfficeLevel(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-3 text-xs sm:text-sm font-bold text-text-primary focus:outline-none cursor-pointer focus:border-primary transition-all appearance-none"
                        >
                            <option value="">Select an open ballot track...</option>
                            {openOffices.map((office) => (
                                <option key={office.id} value={office.office_level}>
                                    {office.office_level.toUpperCase()} (Filing Deadline: {office.application_deadline})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Primary Worker Profession */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">
                            Your Primary Worker Profession <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Warehouse Logistics Clerk, Public Bus Operator, Registered Nurse"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-3 text-xs sm:text-sm font-bold text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    {/* LinkedIn Link (Optional) */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center select-none">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                LinkedIn Profile Link
                            </label>
                            <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest bg-surface-container-low px-2 py-0.5 rounded-md border border-outline-variant">
                                Optional
                            </span>
                        </div>
                        <input
                            type="url"
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-3 text-xs sm:text-sm font-bold text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    {/* Employment Verification Document Upload Drag & Drop */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">
                            Employment Verification Document <span className="text-primary">*</span>
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
                                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
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
                                            {(proofFile.size / (1024 * 1024)).toFixed(2)} MB · Verification attached
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
                                        Attach pay stub, union card, or public registration...
                                    </span>
                                    <span className="text-[11px] text-text-secondary font-mono">
                                        PDF or Image files accepted (Max 10MB)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Action Controls */}
                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitMutation.isPending || !officeLevel || !profession.trim() || !proofFile}
                            className={cn(
                                "px-6 py-3.5 bg-primary hover:brightness-110 text-on-primary font-bold text-xs sm:text-sm rounded-card border-none cursor-pointer uppercase tracking-wider shadow-xs transition-all active:scale-98 flex items-center gap-2 select-none",
                                (submitMutation.isPending || !officeLevel || !profession.trim() || !proofFile) && "opacity-40 cursor-not-allowed"
                            )}
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Ingesting File...</span>
                                </>
                            ) : (
                                <>
                                    <span>Submit Credentials</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                </form>
            )}

        </div>
    );
};