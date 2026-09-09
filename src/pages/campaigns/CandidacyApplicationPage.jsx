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
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-20 w-full font-sans animate-in fade-in duration-200">

            {/* 🧭 Back Navigation */}
            <button
                type="button"
                onClick={() => navigate('/campaigns/local')}
                className="group flex items-center gap-2 mb-4 text-on-surface-variant hover:text-primary transition-colors font-mono text-[10px] uppercase tracking-widest border-none bg-transparent cursor-pointer"
            >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span>BACK TO ASSEMBLY HUB</span>
            </button>

            {/* Header Section */}
            <div className="mb-8 select-none">
                <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Candidacy Declaration Desk</h2>
                <p className="text-sm text-on-surface-variant max-w-xl">
                    Submit your onboarding file. Tiers lock automatically according to volunteer calendar ledger entries. 
                    Please ensure all documents are legible.
                </p>
            </div>

            {openOffices.length === 0 ? (
                /* EXVERSION BLOCK: If no active registration windows exist */
                <div className="flex items-center justify-center py-10 w-full select-none animate-in zoom-in duration-200">
                    <div className="w-full max-w-2xl p-8 sm:p-12 glass-panel border border-outline-variant bg-surface-container rounded-xl flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
                        {/* Decorative glow */}
                        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
                        {/* Status Icon */}
                        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-surface-container-highest/50 border border-outline-variant/30 mb-6 relative animate-pulse">
                            <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'wght' 200" }}>schedule</span>
                            <div className="absolute inset-0 rounded-full animate-ping bg-primary/10 opacity-20"></div>
                        </div>
                        {/* Content */}
                        <h2 className="text-xl sm:text-2xl font-black text-on-surface mb-4 uppercase tracking-widest font-extrabold">
                            REGISTRATION WINDOWS TERMINATED
                        </h2>
                        <div className="max-w-md">
                            <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed mb-6">
                                There are currently no active filing deadlines found for the state of <span className="text-primary font-bold">{userState}</span>. Please coordinate with local Vanguard operators to refresh calendar windows.
                            </p>
                        </div>
                        {/* Action Items */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
                            <button
                                type="button"
                                className="flex items-center justify-center py-3 border border-outline-variant hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-lg uppercase tracking-wider transition-all cursor-pointer bg-transparent"
                                onClick={() => alert("Connecting with local Vanguard operators...")}
                            >
                                <span className="material-symbols-outlined mr-2 text-[18px]">contact_support</span>
                                <span>CONTACT OPERATOR</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center py-3 border border-primary text-primary hover:bg-primary/10 transition-all rounded-lg font-semibold text-xs uppercase tracking-wider cursor-pointer bg-transparent"
                                onClick={() => navigate('/events')}
                            >
                                <span className="material-symbols-outlined mr-2 text-[18px]">calendar_month</span>
                                <span>VIEW CALENDAR</span>
                            </button>
                        </div>
                        {/* Footer Detail */}
                        <div className="mt-8 pt-4 border-t border-outline-variant/30 w-full flex justify-between items-center text-[10px] font-mono uppercase opacity-50 font-semibold">
                            <span className="flex items-center"><span className="material-symbols-outlined text-[14px] mr-1">info</span> STATUS: INACTIVE</span>
                            <span>REGION: {userState}_HQ</span>
                        </div>
                    </div>
                </div>
            ) : (
                /* FRESH ENTRY PORTFOLIO CONTAINER FORM */
                <div className="card-elevation-1 rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden bg-surface-container border border-outline-variant">
                    {/* Decorative atmospheric glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                    <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
                        {/* Input: Target Seat */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold font-mono text-on-surface-variant flex items-center gap-1 uppercase tracking-wider select-none">
                                Target Legislative / Local Seat <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    required
                                    value={officeLevel}
                                    onChange={(e) => setOfficeLevel(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface p-4 rounded-xl appearance-none focus:ring-0 focus:border-primary transition-all outline-none"
                                >
                                    <option value="" disabled>Select an open ballot track...</option>
                                    {openOffices.map((office) => (
                                        <option key={office.id} value={office.office_level}>
                                            {office.office_level.toUpperCase()} (Filing Deadline: {office.application_deadline})
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                            </div>
                        </div>

                        {/* Input: Primary Profession */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold font-mono text-on-surface-variant flex items-center gap-1 uppercase tracking-wider select-none">
                                Your Primary Worker Profession <span className="text-primary">*</span>
                            </label>
                            <div>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Warehouse Logistics Clerk, Public Bus Operator, Registered Nurse"
                                    value={profession}
                                    onChange={(e) => setProfession(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface p-4 rounded-xl focus:ring-0 focus:border-primary transition-all placeholder:text-on-tertiary-container/40 outline-none"
                                />
                            </div>
                        </div>

                        {/* Input: LinkedIn (Optional) */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center select-none">
                                <label className="text-xs font-bold font-mono text-on-surface-variant uppercase tracking-wider">LinkedIn Profile Link</label>
                                <span className="text-[10px] font-mono font-bold bg-surface-variant px-2 py-0.5 rounded text-on-surface-variant">OPTIONAL</span>
                            </div>
                            <div>
                                <input
                                    type="url"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant text-on-surface p-4 rounded-xl focus:ring-0 focus:border-primary transition-all placeholder:text-on-tertiary-container/40 outline-none"
                                />
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold font-mono text-on-surface-variant flex items-center gap-1 uppercase tracking-wider select-none">
                                Employment Verification Document <span className="text-primary">*</span>
                            </label>
                            <div className={cn(
                                "group cursor-pointer relative border-2 border-dashed border-outline-variant hover:border-primary rounded-xl transition-all p-8 flex flex-col items-center justify-center text-center",
                                proofFile ? "bg-emerald-500/5 border-emerald-500/50" : "bg-surface-container-low/50 hover:bg-surface-container-high"
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
                                        <FileCheck className="w-10 h-10 text-emerald-500 shrink-0" />
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-on-surface truncate max-w-xs sm:max-w-md">
                                                {proofFile.name}
                                            </p>
                                            <p className="text-[11px] font-mono text-on-surface-variant">
                                                {(proofFile.size / (1024 * 1024)).toFixed(2)} MB · Verification attached
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setProofFile(null);
                                            }}
                                            className="p-1 rounded-card hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface z-30 transition-colors border-none bg-transparent cursor-pointer ml-2 relative"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center pointer-events-none select-none">
                                        <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                                        </div>
                                        <h4 className="text-base font-bold text-on-surface mb-2">Attach pay stub, union card, or public registration...</h4>
                                        <p className="text-xs text-on-surface-variant">PDF or Image files accepted (Max 10MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitMutation.isPending || !officeLevel || !profession.trim() || !proofFile}
                                className={cn(
                                    "group bg-primary hover:bg-primary-container text-white font-bold py-4 px-10 rounded-xl flex items-center gap-3 shadow-[0_8px_20px_-6px_rgba(255,78,124,0.4)] active:scale-95 transition-all cursor-pointer border-none outline-none disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm uppercase tracking-wider"
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
                                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">send</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};