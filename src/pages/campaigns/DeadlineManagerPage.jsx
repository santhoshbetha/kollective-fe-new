// src/pages/campaigns/DeadlineManagerPage.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useLogDeadlineMutation, useElectionDeadlinesQuery } from '../../features/campaigns/useDeadlines';
import { DatePicker } from '../../components/ui/date-picker';
import {
    ShieldAlert,
    Send,
    Calendar,
    ListFilter,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const DeadlineManagerPage = () => {
    const currentUser = useAuthStore((state) => state.user);

    // Local state parameter hooks
    const [level, setLevel] = useState('congress');
    const [district, setDistrict] = useState('');
    const [subLocal, setSubLocal] = useState('');
    const [electionDate, setElectionDate] = useState('');
    const [deadlineDate, setDeadlineDate] = useState('');

    const userState = currentUser?.state || 'TX'; // Example default or locked state parameter

    const { data: activeDeadlines } = useElectionDeadlinesQuery(userState, level, district || 'all');
    const logMutation = useLogDeadlineMutation(userState, level, district);

    // Authorization Security Interceptor Check inline
    const isVettedStudent = currentUser?.role === 'Vanguard' || currentUser?.is_verified_candidate;

    if (!isVettedStudent) {
        return (
            <div className="pt-24 pb-20 text-center max-w-md mx-auto flex flex-col items-center justify-center gap-4 font-sans px-4">
                <div className="w-16 h-16 rounded-card bg-error/10 border border-error/20 flex items-center justify-center text-error shadow-xs">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                        Access Restricted
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-text-secondary leading-relaxed">
                        Only authorized Vanguard operators or verified candidates are permitted to manage regional timeline deadlines.
                    </p>
                </div>
            </div>
        );
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        logMutation.mutate({
            office_level: level,
            district_code: district.trim().toUpperCase(),
            sub_local_name: ['municipal', 'county'].includes(level) ? subLocal.trim() : null,
            election_date: electionDate,
            application_deadline: deadlineDate,
            state: userState,
            logged_by_id: currentUser.id
        }, {
            onSuccess: () => {
                setDistrict('');
                setSubLocal('');
                setElectionDate('');
                setDeadlineDate('');
                alert("Election parameters successfully registered to ledger.");
            }
        });
    };

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20 w-full font-sans animate-in fade-in duration-200">

            {/* COLUMN A: CROWDSOURCED REGISTRATION CONTROL PANEL */}
            <form onSubmit={handleFormSubmit} className="space-y-5 bg-surface-container border border-outline-variant p-6 sm:p-8 rounded-card shadow-2xl flex flex-col h-fit">
                <div className="border-b border-outline-variant/40 pb-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                        Ledger Desk: {userState}
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
                        Input verified ballot dates for your state jurisdiction
                    </p>
                </div>

                {/* Office Level Select */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Office Category <span className="text-primary">*</span>
                    </label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-3 text-xs sm:text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none"
                    >
                        <option value="congress">Federal (Congress/MP)</option>
                        <option value="state_senate">State Upper House (Senate)</option>
                        <option value="state_rep">State Lower House (Assembly)</option>
                        <option value="municipal">Municipal (City Council/Mayor)</option>
                        <option value="county">County (Sheriff/Board)</option>
                    </select>
                </div>

                {/* Base District Code or City ID */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Base District Code or City ID <span className="text-primary">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g., TX-10, Austin, SD-24"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-3 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary font-bold transition-all"
                    />
                </div>

                {/* Sub-Local Title Option */}
                {['municipal', 'county'].includes(level) && (
                    <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                            Specific Seat / Ward Title <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., City Council Place 2, County Judge"
                            value={subLocal}
                            onChange={(e) => setSubLocal(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-3 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary font-bold transition-all"
                        />
                    </div>
                )}

                {/* Date Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                            Application Deadline
                        </label>
                        <DatePicker
                            value={deadlineDate}
                            onChange={setDeadlineDate}
                            className="bg-surface-container-low border border-outline-variant rounded-card p-3 text-xs sm:text-sm text-text-primary focus:border-primary"
                            placeholder="Select date"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                            Real Election Date
                        </label>
                        <DatePicker
                            value={electionDate}
                            onChange={setElectionDate}
                            className="bg-surface-container-low border border-outline-variant rounded-card p-3 text-xs sm:text-sm text-text-primary focus:border-primary"
                            placeholder="Select date"
                        />
                    </div>
                </div>

                {/* Submit Action Control */}
                <button
                    type="submit"
                    disabled={logMutation.isPending || !district.trim() || !deadlineDate || !electionDate}
                    className={cn(
                        "w-full py-3.5 bg-primary hover:brightness-110 text-on-primary text-xs sm:text-sm font-black rounded-card border-none uppercase tracking-wider cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 mt-2",
                        (logMutation.isPending || !district.trim() || !deadlineDate || !electionDate) && "opacity-40 cursor-not-allowed"
                    )}
                >
                    {logMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting data...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            <span>Publish to Ledger</span>
                        </>
                    )}
                </button>
            </form>

            {/* COLUMN B: PUBLIC READ-ONLY MONITOR FEED */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2 px-1 select-none">
                    <ListFilter className="w-4 h-4 text-primary" />
                    <span>Active Regional Entries</span>
                </h3>

                {!activeDeadlines || activeDeadlines.length === 0 ? (
                    <div className="p-12 border border-dashed border-outline-variant bg-surface-container/30 rounded-card text-center text-xs sm:text-sm text-text-secondary font-medium leading-relaxed italic">
                        No parameters catalogued for this specific cross-section yet.
                    </div>
                ) : (
                    <div className="flex flex-col border border-outline-variant bg-surface-container rounded-card overflow-hidden divide-y divide-outline-variant/40 shadow-2xl">
                        {activeDeadlines.map((item, idx) => (
                            <div key={item.id || idx} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-container-high/30 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <span className="text-sm sm:text-base font-bold text-text-primary block truncate">
                                        {item.sub_local_name ? `${item.sub_local_name} (${item.district_code})` : `District ${item.district_code}`}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block mt-0.5">
                                        {item.office_level} level
                                    </span>
                                </div>

                                <div className="flex flex-col items-end shrink-0 font-mono text-right text-xs sm:text-sm">
                                    <span className="text-error font-bold flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Apply: {item.application_deadline}</span>
                                    </span>
                                    <span className="text-text-secondary font-medium mt-0.5">
                                        Vote: {item.election_date}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};