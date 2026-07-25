// src/pages/admin/CandidacyReviewPanel.jsx (Part 1 of 2)
import React, { useState } from 'react';
import {
    usePendingApplicationsQuery,
    useProcessCandidacyMutation
} from '../../features/admin/useAdminCandidacyFeature';

const CandidacyReviewPanel = () => {
    // Filter tabs: 'under_jury_review' | 'pending_vouches' | 'approved' | 'rejected'
    const [filterStatus, setFilterStatus] = useState('under_jury_review');

    // 📡 TanStack Data Flow Integration
    const { data: applications, isPending, isError } = usePendingApplicationsQuery(filterStatus);
    const processMutation = useProcessCandidacyMutation(filterStatus);

    const filterTabs = [
        { id: 'under_jury_review', label: 'Jury / Review', icon: 'gavel' },
        { id: 'pending_vouches', label: 'Collecting Vouches', icon: 'diversity_3' },
        { id: 'approved', label: 'Approved Slate', icon: 'verified' },
        { id: 'rejected', label: 'Rejected Files', icon: 'cancel' }
    ];

    const handleActionClick = (id, action) => {
        const confirmation = window.confirm(`CRITICAL: Confirm execution of candidacy file [${action.toUpperCase()}]?`);
        if (!confirmation) return;
        processMutation.mutate({ id, action });
    };

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 LEFT COLUMN: TAB MANAGEMENT CONTROL SWITCHBOARD */}
            <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 select-none">
                <div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight">Candidacy Control</h1>
                    <p className="text-xs text-text-secondary mt-0.5">Audit worker-class applications and verify credentials</p>
                </div>

                <div className="flex flex-col gap-1.5 bg-[#141414] border border-[#262626] p-2 rounded-2xl shadow-xl">
                    {filterTabs.map((tab) => {
                        const isTabActive = filterStatus === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setFilterStatus(tab.id)}
                                className={`flex items-center gap-4 w-full p-4 text-left rounded-xl transition-all border border-transparent cursor-pointer bg-transparent group ${isTabActive
                                    ? 'bg-surface-container-high border-white/5 text-text-primary shadow-md font-black'
                                    : 'text-text-secondary hover:bg-white/[0.01] hover:text-text-primary'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${isTabActive ? 'bg-primary-container/20 border-primary-container/20 text-primary-container' : 'bg-surface-container border-white/5 text-text-secondary group-hover:text-text-primary'
                                    }`}>
                                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-black tracking-tight text-white">{tab.label}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 🖥️ RIGHT COLUMN: APPLICATIONS CONTENT FEED STAGE */}
            <div className="flex-1 min-w-0 bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-2xl min-h-[600px] flex flex-col gap-6">
                <div className="border-b border-white/5 pb-3 select-none">
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight font-mono">
                        Active Ledger Streams
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                        Cross-reference document proofs and local signatures to guarantee corporate firewall integrity
                    </p>
                </div>

                {isPending ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary/40">Syncing application arrays...</span>
                    </div>
                ) : isError || !applications || applications.length === 0 ? (
                    <div className="border-2 border-dashed border-white/5 bg-[#111111]/30 p-12 text-center rounded-2xl flex flex-col items-center justify-center flex-1">
                        <span className="material-symbols-outlined text-3xl text-text-secondary/20 mb-2">folder_open</span>
                        <p className="text-sm font-medium text-text-secondary">No candidacy profiles catalogued under this filtering matrix.</p>
                    </div>
                ) : (
                    /* 🥞 ITERATIVE ROWS APPLICATION CARD LIST MATRIX */
                    <div className="space-y-4 flex flex-col w-full">
                        {applications.map((item) => (
                            <div key={item.id} className="p-5 bg-[#111111] border border-white/5 rounded-2xl flex flex-col gap-4 hover:border-white/10 transition-colors animate-in fade-in duration-200">

                                {/* 1. Header Information Row: Profile and State Indicators */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#1A1616] select-none">
                                            <img src={item.user?.avatar || "https://unsplash.com"} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-extrabold text-sm text-white truncate">{item.user?.name || 'Citizen Applicant'}</span>
                                            <span className="text-xs font-mono font-bold text-primary-container mt-0.5">@{item.user?.username || 'user_node'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0 font-mono text-right text-[10px] select-none">
                                        <span className="text-white font-black uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                            Jurisdiction: {item.user?.state || 'TX'}
                                        </span>
                                        <span className="text-text-secondary/40 font-bold mt-1 uppercase tracking-widest">
                                            Vouches: {item.vouches_count || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Portfolio Verification Data Core Grid Parameters */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#141414] p-4 rounded-xl border border-white/5 text-xs">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-mono text-[10px] uppercase font-black text-text-secondary/40 select-none">Declared Worker Profession</span>
                                        <span className="text-white font-bold text-sm tracking-tight">{item.declared_profession}</span>
                                    </div>

                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-mono text-[10px] uppercase font-black text-text-secondary/40 select-none">Professional Networks Tracker</span>
                                        {item.linkedin_url ? (
                                            <a
                                                href={item.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-container hover:underline font-bold flex items-center gap-1 mt-0.5 truncate"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">link</span>
                                                <span>View LinkedIn Profile URL Link</span>
                                            </a>
                                        ) : (
                                            <span className="text-text-secondary/30 font-medium italic mt-0.5">No link pointer provided</span>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Document Proof File Downloads Strip Trigger */}
                                <div className="flex items-center justify-between p-3 bg-[#141414]/60 border border-white/5 rounded-xl text-xs font-medium text-text-secondary select-none">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="material-symbols-outlined text-sm text-text-secondary/50">description</span>
                                        <span className="truncate pr-4">Primary Background Proof Document File Attachment</span>
                                    </div>
                                    <a
                                        href={item.employment_proof_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-surface-container border border-white/10 hover:border-white/20 rounded-lg text-white font-bold text-[11px] transition-colors shrink-0 uppercase tracking-wider shadow-inner"
                                    >
                                        Open Document
                                    </a>
                                </div>

                                {/* 4. Interactive Review Action Trigger Controls Block (Hidden if already closed) */}
                                {filterStatus === 'under_jury_review' && (
                                    <div className="flex items-center gap-3 pt-1 select-none w-full justify-end">
                                        <button
                                            type="button"
                                            disabled={processMutation.isPending}
                                            onClick={() => handleActionClick(item.id, 'approve')}
                                            className="px-5 py-2 bg-primary-container text-white font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer border-none uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none crimson-glow font-black"
                                        >
                                            Approve File
                                        </button>
                                        <button
                                            type="button"
                                            disabled={processMutation.isPending}
                                            onClick={() => handleActionClick(item.id, 'reject')}
                                            className="px-5 py-2 bg-surface-container hover:bg-rose-950/20 border border-white/5 hover:border-rose-500/20 text-text-secondary hover:text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                                        >
                                            Reject File
                                        </button>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default CandidacyReviewPanel;
