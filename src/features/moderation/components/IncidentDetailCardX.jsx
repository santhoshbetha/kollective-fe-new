// src/features/moderation/components/IncidentDetailCard.jsx
import React from 'react';
import { ShieldAlert, Trash2, CheckCircle2, Ban, Calendar, Globe, Terminal, User } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function IncidentDetailCardX({ incident, actionPending, onResolve }) {
    if (!incident) return null;

    const formattedDate = incident.inserted_at
        ? new Date(incident.inserted_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
        : "Pending sync...";

    return (
        <div className="flex flex-col h-full max-h-full min-h-0 bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm font-sans animate-in fade-in duration-200 text-neutral-800">

            {/* 🏷️ Card Header Status Strip */}
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500 stroke-[2.5px]" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-mono text-neutral-500">
                        Adjudication Target File
                    </h3>
                </div>
                <div className="font-mono text-[10px] font-black bg-neutral-200 text-neutral-600 px-2 py-0.5 border border-neutral-300 rounded shadow-sm">
                    ID: {incident.id}
                </div>
            </div>

            {/* 📜 Content Details Canvas Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-white">

                {/* Section A: Attributed Account Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px] font-bold text-neutral-500 select-none">
                    <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-3">
                        <User className="w-4 h-4 text-primary-container shrink-0" />
                        <div className="min-w-0 flex-1">
                            <span className="block text-[9px] text-neutral-400 uppercase tracking-wider">Target Profile</span>
                            <span className="text-neutral-800 font-sans font-black text-xs truncate block">
                                @{incident.target_username || "UnknownCitizen"}
                            </span>
                        </div>
                    </div>

                    <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-3">
                        <Globe className="w-4 h-4 text-primary-container shrink-0" />
                        <div className="min-w-0 flex-1">
                            <span className="block text-[9px] text-neutral-400 uppercase tracking-wider">Geographic Source</span>
                            <span className="text-neutral-800 text-xs font-black truncate block">
                                Zone: {incident.country_code || "Global"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section B: Infraction Context Narrative Box */}
                <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-400 ml-1 select-none">
                        Reported Incident Narrative
                    </label>
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-700 leading-relaxed break-words shadow-inner">
                        {incident.description || "No localized behavioral metadata attached."}
                    </div>
                </div>

                {/* Section C: Distributed Node Metadata Matrix */}
                <div className="p-4 border border-neutral-200 bg-neutral-50/50 rounded-2xl flex flex-col gap-2 font-mono text-[10px] font-bold text-neutral-400 select-none">
                    <div className="flex items-center gap-2 border-b border-neutral-100 pb-1.5">
                        <Terminal className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="uppercase text-neutral-600 tracking-wider">Mesh Telemetry Contract</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Origin Node:</span>
                        <span className="text-neutral-700 tracking-wide">{incident.origin_node_atom || "node_primary@127.0.0.1"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Network Timestamp:</span>
                        <span className="text-neutral-700 font-sans">{formattedDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-400">Lease Integrity:</span>
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded text-[9px]">ACTIVE_LEASE_LOCKED</span>
                    </div>
                </div>
            </div>

            {/* 🛠️ Adjudication Actions Control Toolbar */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row gap-3 font-mono text-xs font-bold uppercase tracking-wider select-none shrink-0">
                <button
                    type="button"
                    disabled={actionPending}
                    onClick={() => onResolve("dismiss")}
                    className="flex-1 py-3 px-4 bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 outline-none disabled:opacity-40"
                >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.5px]" />
                    <span>Dismiss Flag</span>
                </button>

                <button
                    type="button"
                    disabled={actionPending}
                    onClick={() => onResolve("soft_delete")}
                    className="flex-1 py-3 px-4 bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 outline-none disabled:opacity-40"
                >
                    <Trash2 className="w-4 h-4 text-amber-500 stroke-[2.5px]" />
                    <span>Soft Delete</span>
                </button>

                <button
                    type="button"
                    disabled={actionPending}
                    onClick={() => onResolve("hard_ban")}
                    className="flex-1 py-3 px-4 bg-rose-600 text-white hover:brightness-105 border-none transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 outline-none shadow-sm disabled:opacity-40"
                >
                    <Ban className="w-4 h-4 stroke-[2.5px]" />
                    <span>Sovereign Ban</span>
                </button>
            </div>
        </div>
    );
}
