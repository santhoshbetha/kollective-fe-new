// src/features/settings/SettingsDashboard.jsx
import React, { useState, useEffect } from 'react';
import TeamManagement from './TeamManagement';
import AuditLogs from './AuditLogs';
import GeneralOrgSettings from './GeneralOrgSettings';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useSwitchAccount } from '../../store/auth/useSwitchAccount';

export default function SettingsDashboard({ activeOrg: propActiveOrg }) {
    const storeActiveAccount = useAuthStore((state) => state.activeAccount);
    const storeUser = useAuthStore((state) => state.user);
    const switchAccount = useSwitchAccount();

    const [activeTab, setActiveTab] = useState('roster');
    const [selectedOrgId, setSelectedOrgId] = useState(null);

    // Resolve active organization
    const activeOrg = propActiveOrg || (storeActiveAccount?.type === 'organization' ? storeActiveAccount : null) || (
        selectedOrgId ? storeUser?.memberships?.find(m => m.organization?.id === selectedOrgId)?.organization : null
    ) || storeUser?.memberships?.[0]?.organization || null;

    // Resolve user's role in this organization
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

    // Guard if user has no organizations
    const memberships = storeUser?.memberships?.filter(m => m.status === 'active') || [];
    if (!activeOrg && memberships.length === 0) {
        return (
            <div className="max-w-4xl mx-auto my-8 p-8 bg-surface-container border border-white/10 rounded-2xl text-center shadow-xl">
                <span className="material-symbols-outlined text-text-secondary/40 text-[48px] mb-3">
                    corporate_fare
                </span>
                <h2 className="text-xl font-bold text-text-primary mb-2">No Organization Access</h2>
                <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                    You are not currently registered as a contributor, admin, or owner of any organizations.
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
        <div className="max-w-6xl mx-auto my-4 w-full animate-in fade-in duration-200">
            {/* Organization Switcher Bar if user has multiple memberships */}
            {memberships.length > 1 && (
                <div className="mb-4 flex items-center justify-between p-3.5 bg-surface-container rounded-2xl border border-white/10 shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[20px]">corporate_fare</span>
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Managing Workspace:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={activeOrg?.id}
                            onChange={(e) => {
                                setSelectedOrgId(e.target.value);
                                if (storeActiveAccount?.type === 'organization' && storeActiveAccount.id !== e.target.value) {
                                    switchAccount.mutate(e.target.value);
                                }
                            }}
                            className="bg-surface-container-high border border-white/10 text-text-primary text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                        >
                            {memberships.map((m) => (
                                <option key={m.organization.id} value={m.organization.id}>
                                    {m.organization.name} ({m.role || 'Member'})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 bg-[#141414] rounded-2xl border border-[#262626] shadow-2xl overflow-hidden min-h-[560px]">
                {/* Navigation Sidebar Panel Container */}
                <aside className="w-full lg:w-72 bg-surface-container-low/60 p-5 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col gap-2">
                    <div className="px-3 py-2 mb-3 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-text-secondary/70 uppercase tracking-wider">
                                Workspace Settings
                            </span>
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">
                                {userRole}
                            </span>
                        </div>
                        <p className="text-base font-black text-text-primary truncate">
                            {activeOrg?.name}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                            {activeOrg?.handle || `@${activeOrg?.username}`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setActiveTab('roster')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition cursor-pointer text-left ${
                            activeTab === 'roster'
                                ? 'bg-primary-container text-white shadow-lg crimson-glow'
                                : 'text-text-secondary hover:bg-surface-container-high/60 hover:text-text-primary'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">group</span>
                        Active Team Roster
                    </button>

                    {/* Conditional layout tabs guarded directly on client side */}
                    {isAdminOrOwner && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('audit')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition cursor-pointer text-left ${
                                activeTab === 'audit'
                                    ? 'bg-primary-container text-white shadow-lg crimson-glow'
                                    : 'text-text-secondary hover:bg-surface-container-high/60 hover:text-text-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                            Security Audit Trails
                        </button>
                    )}

                    {isOwner && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition cursor-pointer text-left ${
                                activeTab === 'general'
                                    ? 'bg-primary-container text-white shadow-lg crimson-glow'
                                    : 'text-text-secondary hover:bg-surface-container-high/60 hover:text-text-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                            Owner Administrative Panel
                        </button>
                    )}
                </aside>

                {/* Dynamic Inner Component Render Stage */}
                <main className="flex-1 p-6 md:p-8 min-h-[500px] overflow-y-auto custom-scrollbar">
                    {renderTabContent()}
                </main>
            </div>
        </div>
    );
}

function ForbiddenView() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <span className="material-symbols-outlined text-[48px] text-amber-400 mb-2">lock</span>
            <h3 className="text-lg font-bold text-text-primary mb-1">Administrative Access Required</h3>
            <p className="text-xs text-text-secondary max-w-sm">Your assigned profile role slot rank inside this organization space cannot view these logs files.</p>
        </div>
    );
}

