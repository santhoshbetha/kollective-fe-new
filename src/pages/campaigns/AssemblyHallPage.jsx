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

export const AssemblyHallPage = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // Scope Toggle State: 'higher' | 'local'
    const [macroScope, setMacroScope] = useState('higher');

    // Sub-Tier State: 'congress' | 'state_senate' | 'state_rep' | 'municipal'
    const [subLevel, setSubLevel] = useState('congress');

    // Handle cross-over reset hooks to ensure user never gets stuck on an orphan tab
    const handleScopeChange = (targetScope) => {
        setMacroScope(targetScope);
        setSubLevel(targetScope === 'higher' ? 'congress' : 'municipal');
    };

    // Dual-Flow Target Assigner
    const activeDistrictCode =
        subLevel === 'congress' ? currentUser?.district_l1_code || 'TX-10' :
            subLevel === 'state_senate' ? currentUser?.district_l2_code || 'SD-14' :
                subLevel === 'state_rep' ? currentUser?.district_l3_code || 'HD-46' :
                    `${currentUser?.city_name || 'Austin'}_${currentUser?.state || 'TX'}`.toLowerCase().replace(/\s+/g, '_');

    // TanStack Data Hooks Connection
    const { data: events, isPending, isError } = useDebateEventsQuery(subLevel, activeDistrictCode);
    const claimShiftMutation = useClaimShiftMutation(subLevel, activeDistrictCode, currentUser);

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-20 w-full font-sans animate-in fade-in duration-200">

            {/* 🧭 Header & Back Navigation */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate('/campaigns/local')}
                    className="group flex items-center gap-2 mb-4 text-on-surface-variant hover:text-primary transition-colors font-mono text-[10px] uppercase tracking-widest border-none bg-transparent cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span>BACK TO ASSEMBLY HUB</span>
                </button>
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-1">Assembly Hall: Debates</h1>
                    <p className="text-sm text-on-surface-variant">Claim logistics tasks and volunteer shifts for neighborhood debates.</p>
                </div>
            </div>

            {/* 🏁 STEP 1: MACRO SCOPE SWITCHBOARD BAR */}
            <div className="flex p-1 bg-surface-container rounded-xl mb-6 w-full max-w-2xl border border-outline-variant">
                <button
                    type="button"
                    onClick={() => handleScopeChange('higher')}
                    className={cn(
                        "flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-200 cursor-pointer border-none",
                        macroScope === 'higher'
                            ? "bg-surface-container-highest text-primary active-glow"
                            : "text-on-surface-variant hover:bg-surface-variant/30 bg-transparent"
                    )}
                >
                    Higher Offices (Federal & State)
                </button>
                <button
                    type="button"
                    onClick={() => handleScopeChange('local')}
                    className={cn(
                        "flex-1 py-3 px-6 rounded-lg font-bold transition-all duration-200 cursor-pointer border-none",
                        macroScope === 'local'
                            ? "bg-surface-container-highest text-primary active-glow"
                            : "text-on-surface-variant hover:bg-surface-variant/30 bg-transparent"
                    )}
                >
                    Local Offices (Municipal & County)
                </button>
            </div>

            {/* 💊 STEP 2: SUB-TABS FILTER ROW */}
            {macroScope === 'higher' ? (
                <div className="flex flex-wrap gap-4 mb-6 items-center border-b border-outline-variant pb-4 select-none">
                    {['congress', 'state_senate', 'state_rep'].map((tierKey) => (
                        <button
                            key={tierKey}
                            type="button"
                            onClick={() => setSubLevel(tierKey)}
                            className={cn(
                                "px-6 py-2 rounded-full font-bold transition-all cursor-pointer text-xs",
                                subLevel === tierKey
                                    ? "border-2 border-primary-container bg-primary-container/10 text-primary font-bold shadow-sm"
                                    : "border border-outline-variant text-on-surface-variant hover:bg-surface-variant/30 bg-transparent"
                            )}
                        >
                            {tierKey === 'congress' ? 'Federal Congress' : tierKey === 'state_senate' ? 'State Senate' : 'State Assembly'}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-4 mb-6 items-center border-b border-outline-variant pb-4">
                    <div className="text-xs font-mono font-bold uppercase text-primary bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-full w-full text-center shadow-xs">
                        📍 Mapping Ballot System to: {currentUser?.city_name || 'Municipal'} District Node
                    </div>
                </div>
            )}

            {/* 🥞 CORE CONTENT CANVAS */}
            {isPending ? (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-3 bg-surface-container/20 border border-outline-variant/40 rounded-card">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                        Syncing shift data registry...
                    </span>
                </div>
            ) : isError || !events || events.length === 0 ? (
                <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center border border-outline-variant bg-surface-container/60 relative overflow-hidden shadow-2xl">
                    {/* Atmospheric Background Detail */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/5 blur-[100px] rounded-full"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-container/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10 flex flex-col items-center max-w-md">
                        {/* Icon with glow */}
                        <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-8 border border-outline-variant relative">
                            <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-full"></div>
                            <span className="material-symbols-outlined text-4xl text-primary-container relative z-10">calendar_clock</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-4">No debate town halls scheduled for {activeDistrictCode} yet.</h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                            When local candidates pass the mandatory voting thresholds and consensus requirements, the Kollective town hall logistics engine initializes automatically to scout venues and assign moderators.
                        </p>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-primary-container text-primary-container font-bold rounded-xl hover:bg-primary-container/10 transition-all cursor-pointer group"
                            onClick={() => alert("Subscribed to alerts for " + activeDistrictCode)}
                        >
                            <span>Subscribe to Alerts</span>
                            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">notifications_active</span>
                        </button>
                    </div>
                    {/* Subtle Grid Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#ff4e7c 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
                </div>
            ) : (
                <div className="space-y-8 flex flex-col w-full">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-surface-container border border-outline-variant rounded-card p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300"
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
                                    <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider bg-primary/10 px-3.5 py-1.5 rounded-card border border-primary/20 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {new Date(event.date_time).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </span>
                                    </span>
                                    <span className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1.5">
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

                                <div className="flex flex-col border border-outline-variant bg-surface-container-low rounded-card overflow-hidden divide-y divide-outline-variant/40">
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
                                                            <span className="text-xs font-mono font-bold text-text-secondary/60 italic">
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
                                                                    {volunteer.id === currentUser?.id && <UserCheck className="w-3.5 h-3.5" />}
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

            {/* Information Cards (Bento style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="glass-panel p-5 bg-surface-container/60 border border-outline-variant rounded-2xl flex flex-col gap-4">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <h4 className="font-bold text-lg text-on-surface">Eligibility</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Candidates must hold a minimum 15% sentiment rating within the district to trigger a mandatory Assembly debate session.</p>
                </div>
                <div className="glass-panel p-5 bg-surface-container/60 border border-outline-variant rounded-2xl flex flex-col gap-4">
                    <span className="material-symbols-outlined text-primary">volunteer_activism</span>
                    <h4 className="font-bold text-lg text-on-surface">Logistics</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Logistics managers receive Action Credits for venue sourcing, safety coordination, and digital stream management.</p>
                </div>
                <div className="glass-panel p-5 bg-surface-container/60 border border-outline-variant rounded-2xl flex flex-col gap-4">
                    <span className="material-symbols-outlined text-primary">gavel</span>
                    <h4 className="font-bold text-lg text-on-surface">Ruleset</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">All debates follow the Civic Commons Protocol (CCP), ensuring neutral moderation and verified fact-checking in real-time.</p>
                </div>
            </div>
        </div>
    );
};