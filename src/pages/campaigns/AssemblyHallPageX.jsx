// src/pages/campaigns/AssemblyHallPage.jsx
import React, { useState } from 'react';

export const AssemblyHallPageX = () => {
    const [shifts, setShifts] = useState([
        { id: '1', role: 'Venue Setup Coordinator', location: 'Central Public Library Aud.', volunteers: ['Sarah K.'], maxVolunteers: 3 },
        { id: '2', role: 'AV Stream Technician', location: 'Live Broadcast Node 1', volunteers: [], maxVolunteers: 2 },
        { id: '3', role: 'Traditional Party Invitation Outreach', location: 'Remote / Digits', volunteers: ['Liam G.', 'Elena R.'], maxVolunteers: 5 }
    ]);

    const claimShift = (id) => {
        setShifts(prev => prev.map(s => s.id === id && s.volunteers.length < s.maxVolunteers ? { ...s, volunteers: [...s.volunteers, 'You'] } : s));
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4 select-none">
                <span className="text-[10px] font-mono font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">Top 5 Primary Stage</span>
                <h1 className="text-2xl font-black text-text-primary tracking-tight mt-1">Assembly Hall: Debate Coordination</h1>
                <p className="text-xs text-text-secondary mt-0.5">Claim logistics tasks and volunteer shifts to organize the debate events.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none mb-2">
                <div className="p-4 bg-surface-container-low border border-white/5 rounded-xl"><span className="text-xs font-mono font-bold text-text-secondary uppercase">Debate Date</span><span className="block font-black text-white text-lg mt-1">Wednesday, July 15</span></div>
                <div className="p-4 bg-surface-container-low border border-white/5 rounded-xl"><span className="text-xs font-mono font-bold text-text-secondary uppercase">Staged Challengers</span><span className="block font-black text-white text-lg mt-1">5 Grassroots · 2 Traditional</span></div>
                <div className="p-4 bg-surface-container-low border border-white/5 rounded-xl"><span className="text-xs font-mono font-bold text-text-secondary uppercase">Broadcast Stream</span><span className="block font-black text-primary-container text-lg mt-1 font-mono">Kollective Live Node</span></div>
            </div>

            <h3 className="text-sm font-black uppercase tracking-wider text-text-secondary/60 font-mono select-none">Logistics Operations Registry</h3>
            <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-xl w-full">
                {shifts.map((shift) => {
                    const isFull = shift.volunteers.length >= shift.maxVolunteers;
                    return (
                        <div key={shift.id} className="flex items-center justify-between p-5 border-b border-[#262626] last:border-b-0">
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-white text-sm truncate">{shift.role}</span>
                                <span className="text-xs text-text-secondary font-mono mt-0.5">{shift.location}</span>
                                <div className="flex gap-1.5 mt-2 flex-wrap">{shift.volunteers.map((v, i) => <span key={i} className="text-[9px] font-mono font-black uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10 text-text-secondary">{v}</span>)}</div>
                            </div>
                            <button type="button" disabled={isFull} onClick={() => claimShift(shift.id)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border-none shrink-0 ${isFull ? 'bg-white/5 text-text-secondary/20 cursor-not-allowed' : 'bg-primary-container hover:brightness-110 text-white'}`}>Claim Shift ({shift.volunteers.length}/{shift.maxVolunteers})</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
