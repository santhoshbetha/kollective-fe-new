// src/pages/campaigns/AssemblyHallPage.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useDebateEventsQuery, useClaimShiftMutation } from '../../features/campaigns/useDebateLogistics';

export const AssemblyHallPage = () => {
    const currentUser = useAuthStore((state) => state.user);

    // 🎛️ Local View Filter Tab Row Panel: 'congress' | 'state_senate' | 'state_rep'
    const [officeLevel, setOfficeLevel] = useState('congress');

    // Dynamically pull the correct constituency boundary code map based on selected tier
    const activeDistrictCode =
        officeLevel === 'congress' ? currentUser?.district_l1_code || 'TX-10' :
            officeLevel === 'state_senate' ? currentUser?.district_l2_code || 'SD-14' :
                currentUser?.district_l3_code || 'HD-46';

    // 📡 TanStack Data Hooks connection pipeline
    const { data: events, isPending, isError } = useDebateEventsQuery(officeLevel, activeDistrictCode);
    const claimShiftMutation = useClaimShiftMutation(officeLevel, activeDistrictCode, currentUser);

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 Top Context Tracking Structural Header */}
            <div className="border-b border-white/5 pb-4 select-none">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                        Assembly Hall Node
                    </span>
                    <span className="text-[10px] font-mono font-bold text-text-secondary/50 uppercase tracking-widest">
                        Precinct: {currentUser?.precinct || 'Central Grid'}
                    </span>
                </div>
                <h1 className="text-2xl font-black text-text-primary tracking-tight mt-1">
                    Debate Logistics Switchboard
                </h1>
                <p className="text-xs text-text-secondary mt-0.5">
                    Claim open operations shifts and help coordinate worker-led debates within your district.
                </p>
            </div>

            {/* 📊 Symmetrical Tier Pivot Selection Toolbar */}
            <div className="flex bg-surface-container-lowest p-1 rounded-xl select-none">
                {[
                    { id: 'congress', label: 'Federal / National' },
                    { id: 'state_senate', label: 'Upper Chamber (Senate)' },
                    { id: 'state_rep', label: 'Lower Chamber (Assembly)' }
                ].map((tier) => (
                    <button
                        key={tier.id}
                        type="button"
                        onClick={() => setOfficeLevel(tier.id)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all border border-transparent cursor-pointer ${officeLevel === tier.id
                                ? 'bg-surface-container-high text-text-primary border-white/5 font-black shadow-sm'
                                : 'text-text-secondary hover:text-text-primary bg-transparent'
                            }`}
                    >
                        {tier.label}
                    </button>
                ))}
            </div>

            {/* 🥞 CORE EVENTS GRID STACK CANVAS AREA */}
            {isPending ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary/40">Syncing shift data registry...</span>
                </div>
            ) : isError || !events || events.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-surface-container-low/40">
                    <span className="material-symbols-outlined text-3xl text-text-secondary/30 mb-2">event_busy</span>
                    <p className="text-sm font-medium text-text-secondary">No debate town halls scheduled for {activeDistrictCode} yet.</p>
                    <p className="text-xs text-text-secondary/50 mt-1 max-w-xs mx-auto">When local candidates pass the voting thresholds, the town hall logistics engine initializes automatically.</p>
                </div>
            ) : (
                <div className="space-y-8 flex flex-col w-full">
                    {events.map((event) => (
                        <div key={event.id} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">

                            {/* Event Metadata Banner Layout Header Row */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 select-none">
                                <div>
                                    <h2 className="text-xl font-black text-white tracking-tight">{event.title}</h2>
                                    <p className="text-xs text-text-secondary font-mono mt-1 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-primary-container">location_on</span>
                                        <span>{event.venue_address}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end shrink-0 font-mono text-right">
                                    <span className="text-xs font-black text-primary-container uppercase tracking-wider bg-primary-container/10 px-2.5 py-1 rounded-lg border border-primary-container/10">
                                        {new Date(event.date_time).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="text-[10px] text-text-secondary/40 font-bold uppercase tracking-widest mt-1">
                                        Jurisdiction: {event.district_code}
                                    </span>
                                </div>
                            </div>

                            {/* 🥞 WORKER-LED SHIFTS REGISTRY STACK TABLE */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-mono font-black uppercase tracking-wider text-text-secondary/40 select-none">
                                    Logistics Operations Roster
                                </h3>

                                <div className="flex flex-col border border-[#262626] bg-[#111111] rounded-xl overflow-hidden divide-y divide-[#262626]">
                                    {event.shifts?.map((shift) => {
                                        const isUserVolunteered = shift.volunteers?.some(v => v.id === currentUser?.id);
                                        const isFull = (shift.volunteers?.length || 0) >= shift.max_volunteers;
                                        const isProcessing = claimShiftMutation.isPending && claimShiftMutation.variables === shift.id;

                                        return (
                                            <div key={shift.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 hover:bg-white/[0.005] transition-colors">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-white text-sm truncate">{shift.role_name}</span>

                                                    {/* Claimed User Identity Tokens Loop */}
                                                    <div className="flex gap-1.5 mt-2 flex-wrap select-none">
                                                        {(!shift.volunteers || shift.volunteers.length === 0) ? (
                                                            <span className="text-[10px] font-mono font-bold text-text-secondary/20 italic">
                                                                Vacant slot — Needs assignment
                                                            </span>
                                                        ) : (
                                                            shift.volunteers.map((volunteer, idx) => (
                                                                <span
                                                                    key={volunteer.id || idx}
                                                                    className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${volunteer.id === currentUser?.id
                                                                            ? 'bg-primary-container/20 border-primary-container/20 text-primary-container'
                                                                            : 'bg-white/5 border-white/10 text-text-secondary'
                                                                        }`}
                                                                >
                                                                    @{volunteer.username}
                                                                </span>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Shift Interactive Action Control Trigger Button */}
                                                <button
                                                    type="button"
                                                    disabled={isFull || isUserVolunteered || isProcessing}
                                                    onClick={() => claimShiftMutation.mutate(shift.id)}
                                                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border-none shrink-0 cursor-pointer ${isUserVolunteered
                                                            ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                                                            : isFull
                                                                ? 'bg-white/5 text-text-secondary/20 cursor-not-allowed'
                                                                : 'bg-primary-container text-white hover:brightness-110 active:scale-95 shadow-md shadow-primary-container/25'
                                                        }`}
                                                >
                                                    {isProcessing ? 'Assigning...' :
                                                        isUserVolunteered ? 'Assigned ✓' :
                                                            isFull ? 'Capacity Filled' :
                                                                `Claim Shift (${shift.volunteers?.length || 0}/${shift.max_volunteers})`}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};
