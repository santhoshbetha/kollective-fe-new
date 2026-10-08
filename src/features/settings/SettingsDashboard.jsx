// src/features/settings/SettingsDashboard.jsx
import React, { useState, useEffect } from 'react';
import TeamManagement from './TeamManagement';
import AuditLogs from './AuditLogs';
import GeneralOrgSettings from './GeneralOrgSettings';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useSwitchAccount } from '../../store/auth/useSwitchAccount';
import { Building2, ShieldAlert, Users, ShieldCheck, Settings } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to your layout utility directory helper path

export default function SettingsDashboard({ activeOrg: propActiveOrg }) {
    const storeActiveAccount = useAuthStore((state) => state.activeAccount);
    const storeUser = useAuthStore((state) => state.user);
    const switchAccount = useSwitchAccount();

    const [activeTab, setActiveTab] = useState('roster');
    const [selectedOrgId, setSelectedOrgId] = useState(null);

    // Resolve active organization safely from unified cache references
    const activeOrg = propActiveOrg || (storeActiveAccount?.type === 'organization' ? storeActiveAccount : null) || (
        selectedOrgId ? storeUser?.memberships?.find(m => m.organization?.id === selectedOrgId)?.organization : null
    ) || storeUser?.memberships?.[0]?.organization || null;

    // Resolve user's explicit authorization role in this organization
    const membership = storeUser?.memberships?.find(
        m => m.organization?.id === activeOrg?.id
    );
    const userRole = activeOrg?.role || membership?.role || 'contributor';

    useEffect(() => {
        if (!selectedOrgId && activeOrg?.id) {
            setSelectedOrgId(activeOrg.id);
        }
    }, [activeOrg, selectedOrgId]);

    const isAdminOrOwner = userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'owner' || userRole?.toLowerCase() === 'lead organizer';
    const isOwner = userRole?.toLowerCase() === 'owner' || userRole?.toLowerCase() === 'lead organizer';

    // Filter active active connection networks rows
    const memberships = storeUser?.memberships?.filter(m => m.status === 'active') || [];

    // Guard if user has no organizations access
    if (!activeOrg && memberships.length === 0) {
        return (
            <div className="max-w-4xl mx-auto my-8 p-12 bg-surface-container border dark:border-white/10 border-black/5 rounded-2xl text-center shadow-2xl font-sans animate-in fade-in duration-200">
                <Building2 className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-text-primary mb-2 tracking-tight">No Organization Access</h2>
                <p className="text-base font-medium text-text-secondary max-w-md mx-auto leading-relaxed">
                    You are not currently registered as a contributor, admin, or owner of any organizations inside the mesh network.
                </p>
            </div>
        );
    }

    const renderTabContent = () => {
        if (!activeOrg?.id) return null;
        switch (activeTab) {
            case 'roster':
                return <TeamManagement activeOrgId={activeOrg.id} userRole={userRole} />;
            case 'audit':
                return isAdminOrOwner ? <AuditLogs activeOrgId={activeOrg.id} /> : <ForbiddenView />;
            case 'general':
                return isOwner ? <GeneralOrgSettings activeOrgId={activeOrg.id} /> : <ForbiddenView />;
            default:
                return <TeamManagement activeOrgId={activeOrg.id} userRole={userRole} />;
        }
    };

    return (
        <div className="w-full my-4 animate-in fade-in duration-200 flex flex-col gap-6 text-left font-sans">

            {/* 🏢 Organization Switcher Bar: Transformed into an upscaled, brand-aware header card */}
            {memberships.length > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface-container rounded-2xl border dark:border-white/10 border-black/5 shadow-lg select-none">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-primary-container shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-md font-extrabold text-text-secondary uppercase tracking-wider font-mono">
                                Managing Workspace
                            </span>
                            <span className="text-lg font-semibold text-text-secondary mt-0.5">
                                Toggle context focus across multiple memberships
                            </span>
                        </div>
                    </div>
                    <div className="w-full sm:w-auto">
                        <select
                            value={activeOrg?.id}
                            onChange={(e) => {
                                setSelectedOrgId(e.target.value);
                                if (storeActiveAccount?.type === 'organization' && storeActiveAccount.id !== e.target.value) {
                                    switchAccount.mutate(e.target.value);
                                }
                            }}
                            className="w-full sm:w-72 bg-white dark:bg-[#111111] border border-white/10 dark:border-white/5 text-sm font-bold rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary-container cursor-pointer transition-colors"
                        >
                            {memberships.map((m) => (
                                <option key={m.organization.id} value={m.organization.id} className="bg-white dark:bg-[#111111]">
                                    {m.organization.name} ({m.role || 'Member'})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            <div className="flex flex-col lg:flex-row gap-6 bg-[#141414] rounded-2xl border border-[#262626] shadow-2xl overflow-hidden min-h-[560px] w-full">
                {/* Navigation Sidebar Panel Container */}
                <aside className="w-full lg:w-72 bg-surface-container-low/40 p-5 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col gap-2 shrink-0 select-none">
                    <div className="px-3 py-2 mb-4 border-b border-white/5 pb-5">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-[14px] uppercase font-bold tracking-wider select-none">
                            <span className="text-text-secondary/70">
                                Workspace Settings
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20 font-extrabold">
                                {userRole}
                            </span>
                        </div>
                        <p className="text-xl font-black text-text-primary truncate tracking-tight">
                            {activeOrg?.name || 'Anonymous Project'}
                        </p>
                        <p className="text-sm font-semibold font-mono text-text-secondary truncate mt-0.5 opacity-60">
                            {activeOrg?.handle || `@${activeOrg?.username || 'unknown_node'}`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setActiveTab('roster')}
                        className={cn(
                            "w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-bold rounded-xl transition-all cursor-pointer text-left border border-transparent outline-none",
                            activeTab === 'roster'
                                ? 'bg-primary-container text-white shadow-lg crimson-glow font-extrabold'
                                : 'text-text-secondary hover:bg-surface-container-high/40 hover:text-text-primary'
                        )}
                    >
                        <Users className="w-4 h-4 shrink-0" />
                        <span>Active Team Roster</span>
                    </button>

                    {/* Conditional layout tabs guarded directly on client side */}
                    {isAdminOrOwner && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('audit')}
                            className={cn(
                                "w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-bold rounded-xl transition-all cursor-pointer text-left border border-transparent outline-none",
                                activeTab === 'audit'
                                    ? 'bg-primary-container text-white shadow-lg crimson-glow font-extrabold'
                                    : 'text-text-secondary hover:bg-surface-container-high/40 hover:text-text-primary'
                            )}
                        >
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>Security Audit Trails</span>
                        </button>
                    )}

                    {isOwner && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={cn(
                                "w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-bold rounded-xl transition-all cursor-pointer text-left border border-transparent outline-none",
                                activeTab === 'general'
                                    ? 'bg-primary-container text-white shadow-lg crimson-glow font-extrabold'
                                    : 'text-text-secondary hover:bg-surface-container-high/40 hover:text-text-primary'
                            )}
                        >
                            <Settings className="w-4 h-4 shrink-0" />
                            <span>Owner Administrative Panel</span>
                        </button>
                    )}
                </aside>

                {/* Dynamic Inner Component Render Stage Canvas */}
                <main className="flex-1 p-6 md:p-8 min-h-[500px] overflow-y-auto custom-scrollbar relative bg-transparent w-full">
                    <div className="w-full h-full animate-in fade-in duration-150">
                        {renderTabContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}

/**
 * 🔒 ATOMIC FORBIDDEN ROUTE SHIELD CELL: Handles authorization validation failures cleanly
 */
function ForbiddenView() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center p-8 font-sans select-none animate-in fade-in duration-200">
            <ShieldAlert className="w-14 h-14 text-amber-500 mb-3 animate-bounce duration-1000" />
            <h3 className="text-xl font-black text-text-primary mb-1 tracking-tight">Administrative Access Required</h3>
            <p className="text-sm font-medium text-text-secondary max-w-sm leading-relaxed">
                Your assigned profile role slot rank inside this organization workspace cannot view these encrypted logs files.
            </p>
        </div>
    );
}

