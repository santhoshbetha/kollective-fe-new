// src/pages/campaigns/AssemblyHallPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useDebateEventsQuery, useClaimShiftMutation } from '../../features/campaigns/useDebateLogistics';
import {
    MapPin,
    Calendar,
    CalendarX,
    CheckCircle,
    Loader2,
    UserCheck,
    Users,
    ArrowLeft
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const AssemblyHallPageOK = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // 🎛️ Scope Toggle State: 'higher' | 'local'
    const [macroScope, setMacroScope] = useState('higher');

    // 💊 Sub-Tier State: 'congress' | 'state_senate' | 'state_rep' | 'municipal'
    const [subLevel, setSubLevel] = useState('congress');

    // Handle cross-over reset hooks to ensure user never gets stuck on an orphan tab
    const handleScopeChange = (targetScope) => {
        setMacroScope(targetScope);
        setSubLevel(targetScope === 'higher' ? 'congress' : 'municipal');
    };

    // 🎯 THE DUAL-FLOW TARGET ASSIGNER
    const activeDistrictCode =
        subLevel === 'congress' ? currentUser?.district_l1_code || 'TX-10' :
            subLevel === 'state_senate' ? currentUser?.district_l2_code || 'SD-14' :
                subLevel === 'state_rep' ? currentUser?.district_l3_code || 'HD-46' :
                    `${currentUser?.city_name || 'Austin'}_${currentUser?.state || 'TX'}`.toLowerCase().replace(/\s+/g, '_');

    // 📡 TanStack Data Hooks Connection
    const { data: events, isPending, isError } = useDebateEventsQuery(subLevel, activeDistrictCode);
    const claimShiftMutation = useClaimShiftMutation(subLevel, activeDistrictCode, currentUser);

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 Header */}
            <div className="border-b border-white/5 pb-4 select-none">
                <button
                    onClick={() => navigate('/campaigns/local')}
                    className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-bold text-[11px] uppercase tracking-wider border-none bg-transparent cursor-pointer mb-3"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Assembly Hub
                </button>
                <h1 className="text-2xl font-black text-text-primary tracking-tight">
                    Assembly Hall: Debates
                </h1>
                <p className="text-xs text-text-secondary mt-0.5">
                    Claim logistics tasks and volunteer shifts for neighborhood debates.
                </p>
            </div>

            {/* 🏁 STEP 1: MACRO SCOPE SWITCHBOARD BAR */}
            <div className="flex bg-surface-container-low border border-outline-variant/60 p-1 rounded-xl select-none shadow-inner w-full">
                <button
                    type="button"
                    onClick={() => handleScopeChange('higher')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${macroScope === 'higher' ? 'bg-surface-container-high border-outline-variant text-text-primary font-black shadow-md' : 'text-text-secondary border-transparent hover:text-text-primary bg-transparent'
                        }`}
                >
                    Higher Offices (Federal &amp; State)
                </button>
                <button
                    type="button"
                    onClick={() => handleScopeChange('local')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${macroScope === 'local' ? 'bg-surface-container-high border-outline-variant text-text-primary font-black shadow-md' : 'text-text-secondary border-transparent hover:text-text-primary bg-transparent'
                        }`}
                >
                    Local Offices (Municipal &amp; County)
                </button>
            </div>

            {/* 💊 STEP 2: DYNAMIC INNER PILLS (Rendered contextually based on Macro Scope) */}
            <div className="flex gap-2 select-none">
                {macroScope === 'higher' ? (
                    <>
                        <button type="button" onClick={() => setSubLevel('congress')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${subLevel === 'congress' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-outline-variant/60 text-text-secondary hover:text-text-primary'}`}>Federal Congress</button>
                        <button type="button" onClick={() => setSubLevel('state_senate')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${subLevel === 'state_senate' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-outline-variant/60 text-text-secondary hover:text-text-primary'}`}>State Senate</button>
                        <button type="button" onClick={() => setSubLevel('state_rep')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${subLevel === 'state_rep' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-outline-variant/60 text-text-secondary hover:text-text-primary'}`}>State Assembly</button>
                    </>
                ) : (
                    <div className="text-[11px] font-mono font-black uppercase text-primary bg-primary/5 border border-primary/15 px-3 py-1.5 rounded-xl w-full text-center">
                        📍 Mapping Ballot System to: {currentUser?.city_name || 'Municipal'} District Node
                    </div>
                )}
            </div>

            {/* 🥞 CORE EVENTS GRID STACK CANVAS AREA */}
            {isPending ? (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-3 bg-surface-container/20 border border-outline-variant/40 rounded-card">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                        Syncing shift data registry...
                    </span>
                </div>
            ) : isError || !events || events.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-outline-variant bg-surface-container/40 rounded-card flex flex-col items-center justify-center space-y-2">
                    <CalendarX className="w-10 h-10 text-text-secondary/30 mb-1" />
                    <p className="text-base font-bold text-text-primary">
                        No debate town halls scheduled for {activeDistrictCode} yet.
                    </p>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                        When local candidates pass the voting thresholds, the town hall logistics engine initializes automatically.
                    </p>
                </div>
            ) : (
                <div className="space-y-8 flex flex-col w-full">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-surface-container border border-outline-variant/80 rounded-card p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300"
                        >

                            {/* Event Metadata Banner Layout Header Row */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/40 pb-5 select-none">
                                <div className="space-y-1">
                                    <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                                        {event.title}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-text-secondary font-medium flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                                        <span>{event.venue_address}</span>
                                    </p>
                                </div>

                                <div className="flex flex-col items-start md:items-end shrink-0 font-mono">
                                    <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-card border border-primary/20 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {new Date(event.date_time).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </span>
                                    </span>
                                    <span className="text-[11px] text-text-secondary font-bold uppercase tracking-widest mt-1.5">
                                        Jurisdiction: {event.district_code}
                                    </span>
                                </div>
                            </div>

                            {/* WORKER-LED SHIFTS REGISTRY STACK TABLE */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between select-none">
                                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>Logistics Operations Roster</span>
                                    </h3>
                                </div>

                                <div className="flex flex-col border border-outline-variant/80 bg-surface-container-low rounded-card overflow-hidden divide-y divide-outline-variant/40">
                                    {event.shifts?.map((shift) => {
                                        const isUserVolunteered = shift.volunteers?.some(v => v.id === currentUser?.id);
                                        const isFull = (shift.volunteers?.length || 0) >= shift.max_volunteers;
                                        const isProcessing = claimShiftMutation.isPending && claimShiftMutation.variables === shift.id;

                                        return (
                                            <div
                                                key={shift.id}
                                                className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-surface-container-high/30 transition-colors"
                                            >
                                                <div className="flex flex-col min-w-0 space-y-1.5">
                                                    <span className="font-bold text-text-primary text-sm sm:text-base">
                                                        {shift.role_name}
                                                    </span>

                                                    {/* Claimed User Identity Tokens */}
                                                    <div className="flex gap-2 flex-wrap select-none items-center">
                                                        {(!shift.volunteers || shift.volunteers.length === 0) ? (
                                                            <span className="text-xs font-mono font-bold text-text-secondary/50 italic">
                                                                Vacant slot — Needs assignment
                                                            </span>
                                                        ) : (
                                                            shift.volunteers.map((volunteer, idx) => (
                                                                <span
                                                                    key={volunteer.id || idx}
                                                                    className={cn(
                                                                        "text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-card border flex items-center gap-1",
                                                                        volunteer.id === currentUser?.id
                                                                            ? "bg-primary/20 border-primary/30 text-primary"
                                                                            : "bg-surface-container border-outline-variant text-text-secondary"
                                                                    )}
                                                                >
                                                                    {volunteer.id === currentUser?.id && <UserCheck className="w-3 h-3" />}
                                                                    <span>@{volunteer.username}</span>
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
                                                    className={cn(
                                                        "px-5 py-2.5 text-xs sm:text-sm font-bold rounded-card transition-all border-none shrink-0 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98",
                                                        isUserVolunteered
                                                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default"
                                                            : isFull
                                                                ? "bg-surface-container border border-outline-variant text-text-secondary/40 cursor-not-allowed"
                                                                : "bg-primary hover:brightness-110 text-on-primary shadow-xs"
                                                    )}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            <span>Assigning...</span>
                                                        </>
                                                    ) : isUserVolunteered ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                            <span>Assigned ✓</span>
                                                        </>
                                                    ) : isFull ? (
                                                        <span>Capacity Filled</span>
                                                    ) : (
                                                        <span>Claim Shift ({shift.volunteers?.length || 0}/{shift.max_volunteers})</span>
                                                    )}
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
