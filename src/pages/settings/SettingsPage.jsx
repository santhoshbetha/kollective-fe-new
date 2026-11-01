// src/pages/SettingsPage.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useTranslation } from '../../components/locales';
import { UserAvatar } from '../../components/accounts/UserAvatar';
import { Loader2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from "@/lib/utils";

// ⚡ LAZY LOAD TAB MODULES FOR INSTANT PAGE INITIALIZATION & ZERO FLICKER
const AppPreferencesForm = lazy(() => import('../../features/preferences/AppPreferencesForm').then(m => ({ default: m.AppPreferencesForm })));
const EditProfilePage = lazy(() => import('./EditProfilePage').then(m => ({ default: m.EditProfilePage })));
const EmailSettingsForm = lazy(() => import('../../features/settings/SettingsSubForms').then(m => ({ default: m.EmailSettingsForm })));
const PasswordSettingsForm = lazy(() => import('../../features/settings/SettingsSubForms').then(m => ({ default: m.PasswordSettingsForm })));
const DangerZoneSettingsForm = lazy(() => import('../../features/settings/SettingsSubForms').then(m => ({ default: m.DangerZoneSettingsForm })));
const InvitationsList = lazy(() => import('./InvitationsList'));
const SettingsDashboard = lazy(() => import('../../features/settings/SettingsDashboard'));
const BlockedProfilesForm = lazy(() => import('../../features/settings/BlockedProfilesForm').then(m => ({ default: m.BlockedProfilesForm || m.default })));
const MutedProfilesForm = lazy(() => import('../../features/settings/MutedProfilesForm').then(m => ({ default: m.MutedProfilesForm || m.default })));

export const SettingsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const isOrg = activeAccount?.type === 'organization';

    // Connect active language variables straight to translation dictionaries
    const currentLanguage = useStore((state) => state.appLanguage);
    const t = useTranslation(currentLanguage);

    const rawInitialTab = searchParams.get('tab') || 'index';
    const isIllegalForOrg = isOrg && ['invitations', 'email', 'password', 'account'].includes(rawInitialTab);
    const isIllegalForPersonal = !isOrg && ['org_workspace'].includes(rawInitialTab);
    const initialTab = (isIllegalForOrg || isIllegalForPersonal) ? 'index' : rawInitialTab;

    const [activeSettingsTab, setActiveSettingsTab] = useState(initialTab);
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([initialTab]));
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem('settings_sidebar_collapsed') === 'true';
    });

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('settings_sidebar_collapsed', next.toString());
            return next;
        });
    };

    // 🔒 ROUTE GUARD SAFETY LOOP
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // 🔄 FALLBACK REDIRECT LOOP: Prevent illegal tab access across context shifts
    useEffect(() => {
        const orgIllegalTabs = ['invitations', 'email', 'password', 'account'];
        const personalIllegalTabs = ['org_workspace'];

        if (isOrg && orgIllegalTabs.includes(activeSettingsTab)) {
            setActiveSettingsTab('index');
            setSearchParams({ tab: 'index' }, { replace: true });
        } else if (!isOrg && personalIllegalTabs.includes(activeSettingsTab)) {
            setActiveSettingsTab('index');
            setSearchParams({ tab: 'index' }, { replace: true });
        }
    }, [isOrg, activeSettingsTab, setSearchParams]);

    useEffect(() => {
        const tabParam = searchParams.get('tab') || 'index';
        const orgIllegalTabs = ['invitations', 'email', 'password', 'account'];
        const personalIllegalTabs = ['org_workspace'];

        let resolvedTab = tabParam;
        if (isOrg && orgIllegalTabs.includes(tabParam)) {
            resolvedTab = 'index';
            setSearchParams({ tab: 'index' }, { replace: true });
        } else if (!isOrg && personalIllegalTabs.includes(tabParam)) {
            resolvedTab = 'index';
            setSearchParams({ tab: 'index' }, { replace: true });
        }

        if (resolvedTab !== activeSettingsTab) {
            setActiveSettingsTab(resolvedTab);
        }
    }, [searchParams, isOrg, activeSettingsTab, setSearchParams]);

    useEffect(() => {
        setVisitedTabs((prev) => {
            if (prev.has(activeSettingsTab)) return prev;
            const next = new Set(prev);
            next.add(activeSettingsTab);
            return next;
        });
    }, [activeSettingsTab]);

    // 📋 DYNAMIC COMPUTING BLOCK FOR SETTINGS MENU TABS
    const settingsMenu = useMemo(() => {
        if (isOrg) {
            return [
                { id: 'index', label: t('pref_heading'), icon: 'settings_accessibility', desc: t('pref_desc') },
                { id: 'profile', label: 'Edit Organization Profile', icon: 'account_circle', desc: "Update organization's profile bio, banner, and info" },
                { id: 'org_workspace', label: 'Workspace & Team', icon: 'corporate_fare', desc: 'Manage org roster, invite contributors & audit logs' }
            ];
        }

        return [
            { id: 'index', label: t('pref_heading'), icon: 'settings_accessibility', desc: t('pref_desc') },
            { id: 'profile', label: 'Edit Profile', icon: 'account_circle', desc: 'Update profile picture, banner, and info' },
            { id: 'invitations', label: 'Organization Invitations', icon: 'mail_lock', desc: 'Pending team invites and access grants' },
            { id: 'email', label: 'Email Configuration', icon: 'mail', desc: 'Manage your contact address links' },
            { id: 'password', label: 'Security & Keys', icon: 'lock', desc: 'Modify entry passwords and authorization keys' },
            { id: 'blocked_profiles', label: 'Blocked Profiles', icon: 'block', desc: 'Manage restricted profiles blocked from your timeline' },
            { id: 'muted_profiles', label: 'Muted Profiles', icon: 'volume_off', desc: 'Manage muted feeds and hidden response cards' },
            { id: 'account', label: 'Danger Zone', icon: 'gavel', desc: 'Permanent account destruction matrices' }
        ];
    }, [isOrg, t]);

    const handleTabChange = (tabId) => {
        const orgIllegalTabs = ['invitations', 'email', 'password', 'account'];
        const personalIllegalTabs = ['org_workspace'];

        let targetTab = tabId;
        if (isOrg && orgIllegalTabs.includes(tabId)) {
            targetTab = 'index';
        } else if (!isOrg && personalIllegalTabs.includes(tabId)) {
            targetTab = 'index';
        }

        if (targetTab !== activeSettingsTab) {
            setActiveSettingsTab(targetTab);
            setSearchParams({ tab: targetTab }, { replace: true });
        }
    };

    const handleReturnClick = () => {
        if (activeSettingsTab !== 'index') {
            handleTabChange('index');
        } else {
            navigate('/home');
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="w-full max-w-full lg:max-w-none mx-auto flex flex-col lg:flex-row gap-8 pb-20 text-left font-sans">
            {/* Left Hand Sidebar Navigation Column */}
            <div className={cn(
                "w-full flex flex-col gap-4 shrink-0 select-none transition-all duration-300",
                isSidebarCollapsed ? "lg:w-20" : "lg:w-80"
            )}>
                <div className={cn(
                    "flex items-center justify-between border-b border-white/5 pb-4 min-h-[57px]",
                    isSidebarCollapsed ? "lg:justify-center" : ""
                )}>
                    <div className={isSidebarCollapsed ? "lg:hidden" : ""}>
                        <h1 className="text-2xl font-black text-text-primary tracking-tight">{t('settings_title')}</h1>
                        <p className="text-sm text-text-secondary mt-0.5 font-medium">Control node parameters and profile locks</p>
                    </div>

                    {/* Collapse / Expand Toggle Button for Desktop */}
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className="hidden lg:flex p-2 bg-surface-container hover:bg-white/10 border border-white/10 rounded-xl items-center justify-center text-text-secondary hover:text-text-primary outline-none transition-all cursor-pointer"
                    >
                        {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                    </button>

                    {/* Mobile Back Button */}
                    <button
                        type="button"
                        onClick={handleReturnClick}
                        className="lg:hidden p-2 bg-surface-container border border-white/10 rounded-xl flex items-center justify-center text-text-primary outline-none transition-colors hover:bg-white/5"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                    </button>
                </div>

                <div className="flex flex-col gap-1.5 bg-[#141414] border border-[#262626] p-2 shadow-xl rounded-2xl">
                    {settingsMenu.map((menuItem) => {
                        const isTabActive = activeSettingsTab === menuItem.id;
                        return (
                            <button
                                key={menuItem.id}
                                type="button"
                                title={isSidebarCollapsed ? menuItem.label : undefined}
                                onClick={() => handleTabChange(menuItem.id)}
                                className={cn(
                                    "flex items-center gap-4 w-full p-3 lg:p-4 text-left rounded-xl transition-all border border-transparent cursor-pointer bg-transparent group outline-none relative",
                                    isSidebarCollapsed ? "lg:justify-center lg:px-2" : "",
                                    isTabActive
                                        ? "bg-surface-container-high border-white/5 text-text-primary shadow-md font-extrabold"
                                        : "text-text-secondary hover:bg-white/[0.015] hover:text-text-primary"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-colors select-none",
                                    isTabActive
                                        ? "bg-primary-container/20 border-primary-container/20 text-primary-container font-black"
                                        : "bg-surface-container border-white/5 text-text-secondary group-hover:text-text-primary"
                                )}>
                                    <span className="material-symbols-outlined text-[20px] font-bold">{menuItem.icon}</span>
                                </div>
                                <div className={cn(
                                    "flex flex-col min-w-0 transition-opacity duration-200",
                                    isSidebarCollapsed ? "lg:hidden" : "flex"
                                )}>
                                    <span className="text-base font-bold tracking-tight dark:text-white whitespace-nowrap">{menuItem.label}</span>
                                    <span className="text-[13px] text-text-secondary/50 font-medium truncate mt-0.5">{menuItem.desc}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Hand Dynamic Settings Sub-Form Canvas Area */}
            <div className="flex-1 min-w-0 bg-[#141414] border border-[#262626] p-6 sm:p-8 shadow-2xl relative min-h-[500px] rounded-2xl w-full">
                {activeSettingsTab !== 'index' && (
                    <button
                        type="button"
                        onClick={() => handleTabChange('index')}
                        className="hidden lg:flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-white transition-colors mb-6 bg-transparent border-none cursor-pointer p-0 outline-none select-none"
                    >
                        <span className="material-symbols-outlined text-[16px] font-bold">arrow_back</span>
                        <span>Return to Preferences</span>
                    </button>
                )}

                {/* Profile Shortcut Card Element Row Banner */}
                {activeSettingsTab === 'index' && (
                    <div
                        onClick={() => handleTabChange('profile')}
                        className="mb-6 p-4 bg-surface-container-lowest/50 border border-white/10 hover:border-primary-container/40 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high/40 hover:shadow-lg transition-all group select-none"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <UserAvatar
                                user={isOrg ? activeAccount : currentUser}
                                className="w-14 h-14 shrink-0 text-lg font-bold"
                                roundedClassName="rounded-none"
                            />
                            <div className="min-w-0">
                                <h3 className="font-extrabold text-xl text-text-primary group-hover:text-primary-container transition-colors flex items-center gap-2 tracking-tight">
                                    <span>{isOrg ? 'Edit Organization Profile' : 'Edit Profile'}</span>
                                    <span className="material-symbols-outlined text-sm opacity-50 group-hover:translate-x-1 transition-transform font-bold">arrow_forward</span>
                                </h3>
                                <p className="text-md text-text-secondary mt-0.5 font-medium truncate">
                                    {isOrg
                                        ? "Update organization's profile picture, banner, and public information"
                                        : "Update your profile picture, banner, and personal information"}
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-primary-container uppercase tracking-wider bg-primary-container/10 border border-primary-container/20 px-3.5 py-2 rounded-xl shrink-0 group-hover:bg-primary-container group-hover:text-white transition-all">
                            <span>Edit</span>
                            <span className="material-symbols-outlined text-[16px] font-bold">edit</span>
                        </div>
                    </div>
                )}

                {/* ⚡ LOAD LAZY CONTENT WITH INSTANT TAB CACHING */}
                <div className="w-full relative">
                    <Suspense fallback={
                        <div className="py-24 flex flex-col items-center justify-center text-text-secondary font-sans opacity-70">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-container mb-2" />
                            <span className="text-xs font-mono font-bold tracking-wider uppercase">Loading Settings Module...</span>
                        </div>
                    }>
                        {visitedTabs.has('index') && (
                            <div className={activeSettingsTab === 'index' ? 'block' : 'hidden'}>
                                <AppPreferencesForm />
                            </div>
                        )}
                        {visitedTabs.has('profile') && (
                            <div className={activeSettingsTab === 'profile' ? 'block' : 'hidden'}>
                                <EditProfilePage />
                            </div>
                        )}
                        {!isOrg && visitedTabs.has('invitations') && (
                            <div className={activeSettingsTab === 'invitations' ? 'block' : 'hidden'}>
                                <InvitationsList />
                            </div>
                        )}
                        {isOrg && visitedTabs.has('org_workspace') && (
                            <div className={activeSettingsTab === 'org_workspace' ? 'block' : 'hidden'}>
                                <SettingsDashboard />
                            </div>
                        )}
                        {!isOrg && visitedTabs.has('email') && (
                            <div className={activeSettingsTab === 'email' ? 'block' : 'hidden'}>
                                <EmailSettingsForm />
                            </div>
                        )}
                        {!isOrg && visitedTabs.has('password') && (
                            <div className={activeSettingsTab === 'password' ? 'block' : 'hidden'}>
                                <PasswordSettingsForm />
                            </div>
                        )}
                        {visitedTabs.has('blocked_profiles') && (
                            <div className={activeSettingsTab === 'blocked_profiles' ? 'block' : 'hidden'}>
                                <BlockedProfilesForm />
                            </div>
                        )}
                        {visitedTabs.has('muted_profiles') && (
                            <div className={activeSettingsTab === 'muted_profiles' ? 'block' : 'hidden'}>
                                <MutedProfilesForm />
                            </div>
                        )}
                        {!isOrg && visitedTabs.has('account') && (
                            <div className={activeSettingsTab === 'account' ? 'block' : 'hidden'}>
                                <DangerZoneSettingsForm />
                            </div>
                        )}
                    </Suspense>
                </div>
            </div>
        </div>
    );
};
