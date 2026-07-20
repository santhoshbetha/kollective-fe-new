// src/pages/campaigns/DeadlineManagerPage.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useLogDeadlineMutation, useElectionDeadlinesQuery } from '../../features/campaigns/useDeadlines';
import { DatePicker } from '../../components/ui/date-picker';

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
            <div className="pt-32 text-center max-w-sm mx-auto flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-rose-500 text-4xl">gavel</span>
                <h2 className="text-lg font-black text-white">Access Terminated</h2>
                <p className="text-xs text-text-secondary">Only authorized individuals are permitted to submit timeline deadlines.</p>
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
                alert("Election parameters submitted.");
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pb-20 w-full animate-in fade-in duration-200">

            {/* COLUMN A: CROWDSOURCED REGISTRATION CONTROL PANEL */}
            <form onSubmit={handleFormSubmit} className="space-y-4 bg-[#141414] border border-[#262626] p-6 rounded-2xl shadow-xl flex flex-col h-fit">
                <div className="border-b border-white/5 pb-3">
                    <h1 className="text-xl font-black text-white">Ledger Desk: {userState}</h1>
                    <p className="text-[11px] text-text-secondary mt-0.5">Input verified ballot dates for your state jurisdiction</p>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-text-secondary">Office Category</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none">
                        <option value="congress">Federal (Congress/MP)</option>
                        <option value="state_senate">State Upper House (Senate)</option>
                        <option value="state_rep">State Lower House (Assembly)</option>
                        <option value="municipal">Municipal (City Council/Mayor)</option>
                        <option value="county">County (Sheriff/Board)</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-text-secondary">Base District Code or City ID</label>
                    <input type="text" required placeholder="e.g., TX-10, Austin, SD-24" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none font-bold" />
                </div>

                {['municipal', 'county'].includes(level) && (
                    <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-150">
                        <label className="text-[10px] font-bold uppercase text-text-secondary">Specific Seat / Ward Title</label>
                        <input type="text" required placeholder="e.g., City Council Place 2, County Judge" value={subLocal} onChange={(e) => setSubLocal(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none font-bold" />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-text-secondary">Application Deadline</label>
                        <DatePicker
                            value={deadlineDate}
                            onChange={setDeadlineDate}
                            className="bg-[#111111] border border-white/10 rounded-xl p-2 text-xs text-white"
                            placeholder="Select date"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-text-secondary">Real Election Date</label>
                        <DatePicker
                            value={electionDate}
                            onChange={setElectionDate}
                            className="bg-[#111111] border border-white/10 rounded-xl p-2 text-xs text-white"
                            placeholder="Select date"
                        />
                    </div>
                </div>

                <button type="submit" disabled={logMutation.isPending} className="w-full py-2.5 bg-primary-container text-white text-xs font-black rounded-xl border-none uppercase tracking-wider cursor-pointer shadow-md crimson-glow mt-2">{logMutation.isPending ? 'Submitting data...' : 'Publish to Ledger'}</button>
            </form>

            {/* COLUMN B: PUBLIC READ-ONLY MONITOR FEED */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-text-secondary/50 px-1 select-none">Active Regional Entries</h3>

                {!activeDeadlines || activeDeadlines.length === 0 ? (
                    <div className="p-8 border border-dashed border-white/5 bg-[#141414]/30 rounded-2xl text-center text-xs text-text-secondary/40 font-medium italic">No parameters catalogued for this specific cross-section yet.</div>
                ) : (
                    <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden divide-y divide-[#262626] shadow-xl">
                        {activeDeadlines.map((item, idx) => (
                            <div key={item.id || idx} className="p-4 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <span className="text-xs font-bold text-white block truncate">{item.sub_local_name ? `${item.sub_local_name} (${item.district_code})` : `District ${item.district_code}`}</span>
                                    <span className="text-[10px] font-mono font-bold text-primary-container uppercase tracking-wider block mt-0.5">{item.office_level} level</span>
                                </div>
                                <div className="flex flex-col items-end shrink-0 font-mono text-right text-[11px]">
                                    <span className="text-rose-400 font-bold">Apply By: {item.application_deadline}</span>
                                    <span className="text-text-secondary/40 font-medium mt-0.5">Vote: {item.election_date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};
