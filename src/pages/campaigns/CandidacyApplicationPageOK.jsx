// src/pages/campaigns/CandidacyApplicationPage.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useElectionDeadlinesQuery } from '../../features/campaigns/useDeadlines';
import { useCandidacyApplicationQuery, useSubmitCandidacyApplicationMutation } from '../../features/campaigns/useCandidacyApplication';

export const CandidacyApplicationPageOK = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const userState = currentUser?.state || 'TX';

    // Local form buffer states
    const [officeLevel, setOfficeLevel] = useState('');
    const [profession, setProfession] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [proofFile, setProofFile] = useState(null);

    // 📡 TanStack Data Flow Integration Pipelines
    const { data: app, isPending: isAppPending } = useCandidacyApplicationQuery();

    // Fetch active state deadlines catalogued by your volunteer ledger network
    const { data: activeDeadlines, isPending: isDeadlinesPending } = useElectionDeadlinesQuery(userState, 'all', 'all');

    const submitMutation = useSubmitCandidacyApplicationMutation();

    // ⏱️ REAL-TIME FILTERING: Extract open positions whose deadlines haven't expired yet
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
            <div className="pt-32 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary/40">Syncing timeline calendars...</span>
            </div>
        );
    }

    // 🔄 RE-ROUTE STATUS TRAP: If they already hold an application file, redirect them to the status tracker view
    if (app && ['pending_vouches', 'under_jury_review', 'approved'].includes(app.status)) {
        return <Navigate to="/campaigns/local" replace />;
    }

    return (
        <div className="max-w-xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">
            <div className="border-b border-outline-variant/40 pb-4 select-none">
                <button
                    type="button"
                    onClick={() => navigate('/campaigns/local')}
                    className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-bold text-[11px] uppercase tracking-wider border-none bg-transparent cursor-pointer mb-3"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Assembly Hub
                </button>
                <h1 className="text-2xl font-black text-text-primary tracking-tight">Candidacy Declaration Desk</h1>
                <p className="text-xs text-text-secondary mt-0.5">Submit your onboarding file. Tiers lock automatically according to volunteer calendar ledger entries.</p>
            </div>

            {openOffices.length === 0 ? (
                /* 🚨 EXVERSION BLOCK: If no calendar frames are active, block onboarding */
                <div className="p-8 border border-dashed border-rose-500/20 bg-rose-500/5 rounded-2xl text-center flex flex-col items-center gap-2 select-none">
                    <span className="material-symbols-outlined text-rose-400 text-3xl">timer_off</span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registration Windows Terminated</h3>
                    <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
                        There are currently no active filing deadlines found for the state of <span className="text-white font-mono font-bold">{userState}</span>. Please coordinate with local Vanguard students to refresh calendar windows.
                    </p>
                </div>
            ) : (
                /* 📝 FRESH ENTRY INTENS PORTFOLIO CONTAINER FORM */
                <form onSubmit={handleFormSubmit} className="space-y-5 bg-surface-container border border-outline-variant/60 p-6 rounded-2xl shadow-2xl flex flex-col w-full">

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">Target Legislative / Local Seat</label>
                        <select
                            required
                            value={officeLevel}
                            onChange={(e) => setOfficeLevel(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none cursor-pointer focus:border-primary-container"
                        >
                            <option value="">Select an open ballot track...</option>
                            {openOffices.map((office) => (
                                <option key={office.id} value={office.office_level}>
                                    {office.office_level.toUpperCase()} (Filing Deadline: {office.application_deadline})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">Your Primary Worker Profession</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Warehouse Logistics Clerk, Public Bus Operator, Registered Nurse"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary-container"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center select-none">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">LinkedIn Profile Link</label>
                            <span className="text-[10px] font-mono font-bold text-text-secondary/40 uppercase tracking-widest bg-surface-container-low px-1.5 py-0.5 rounded border border-outline-variant/40">Optional</span>
                        </div>
                        <input
                            type="url"
                            placeholder="https://linkedin.com"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary-container"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">Employment Verification Document</label>
                        <div className="w-full h-24 border-2 border-dashed border-outline-variant hover:border-primary-container/40 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-surface-container-low relative">
                            <input type="file" required accept="image/*,application/pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <span className="material-symbols-outlined text-text-secondary text-lg mb-1 select-none">upload_file</span>
                            <span className="text-xs font-bold text-text-primary truncate max-w-xs">{proofFile ? proofFile.name : 'Attach pay stub, union card, or public registration...'}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitMutation.isPending || !officeLevel || !profession.trim() || !proofFile}
                        className="w-fit px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:brightness-110 cursor-pointer border-none uppercase tracking-wider disabled:opacity-40 shadow-md crimson-glow ml-auto select-none mt-2 active:scale-[0.98] transition-transform"
                    >
                        {submitMutation.isPending ? 'Ingesting File...' : 'Submit Credentials'}
                    </button>
                </form>
            )}
        </div>
    );
};
