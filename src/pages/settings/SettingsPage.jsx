// src/pages/SettingsPage.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useTranslation } from '../../components/locales';
import { UserAvatar } from '../../components/accounts/UserAvatar';
import { Loader2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from "@/lib/utils";

// ⚡ LAZY LOAD TAB MODULES FOR INSTANT PAGE INITIALIZATION & ZERO FLICKER
const AppPreferencesForm = lazy(() => import('../../features/preferences/AppPreferencesForm').then(m => ({ default: m.AppPreferencesForm })));
const EmailSettingsForm = lazy(() => import('../../features/settings/SettingsSubForms').then(m => ({ default: m.EmailSettingsForm })));
const PasswordSettingsForm = lazy(() => import('../../features/settings/SettingsSubForms').then(m => ({ default: m.PasswordSettingsForm })));
const DangerZoneSettingsForm = lazy(() => import('../../features/settings/SettingsSubForms').then(m => ({ default: m.DangerZoneSettingsForm })));
const InvitationsList = lazy(() => import('./InvitationsList'));
const SettingsDashboard = lazy(() => import('../../features/settings/SettingsDashboard'));

export const SettingsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentUser = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Connect active language variables straight to translation dictionaries
    const currentLanguage = useStore((state) => state.appLanguage);
    const t = useTranslation(currentLanguage);

    const initialTab = searchParams.get('tab') || 'index';
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

    useEffect(() => {
        const tabParam = searchParams.get('tab') || 'index';
        if (tabParam !== activeSettingsTab) {
            setActiveSettingsTab(tabParam);
        }
    }, [searchParams]);

    useEffect(() => {
        setVisitedTabs((prev) => {
            if (prev.has(activeSettingsTab)) return prev;
            const next = new Set(prev);
            next.add(activeSettingsTab);
            return next;
        });
    }, [activeSettingsTab]);

    const settingsMenu = [
        { id: 'index', label: t('pref_heading'), icon: 'settings_accessibility', desc: t('pref_desc') },
        { id: 'profile', label: 'Edit Profile', icon: 'account_circle', desc: 'Update profile picture, banner, and info' },
        { id: 'invitations', label: 'Organization Invitations', icon: 'mail_lock', desc: 'Pending team invites and access grants' },
        { id: 'org_workspace', label: 'Workspace & Team', icon: 'corporate_fare', desc: 'Manage org roster, invite contributors & audit logs' },
        { id: 'email', label: 'Email Configuration', icon: 'mail', desc: 'Manage your contact address links' },
        { id: 'password', label: 'Security & Keys', icon: 'lock', desc: 'Modify entry passwords and authorization keys' },
        { id: 'account', label: 'Danger Zone', icon: 'gavel', desc: 'Permanent account destruction matrices' }
    ];

    const handleTabChange = (tabId) => {
        if (tabId === 'profile') {
            navigate('/settings/profile');
            return;
        }
        if (tabId !== activeSettingsTab) {
            setActiveSettingsTab(tabId);
            setSearchParams({ tab: tabId }, { replace: true });
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
                        onClick={() => navigate('/settings/profile')}
                        className="mb-6 p-4 bg-surface-container-lowest/50 border border-white/10 hover:border-primary-container/40 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high/40 hover:shadow-lg transition-all group select-none"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <UserAvatar
                                user={currentUser}
                                className="w-14 h-14 shrink-0 text-lg font-bold"
                                roundedClassName="rounded-none"
                            />
                            <div className="min-w-0">
                                <h3 className="font-extrabold text-xl text-text-primary group-hover:text-primary-container transition-colors flex items-center gap-2 tracking-tight">
                                    <span>Edit Profile</span>
                                    <span className="material-symbols-outlined text-sm opacity-50 group-hover:translate-x-1 transition-transform font-bold">arrow_forward</span>
                                </h3>
                                <p className="text-sm text-text-secondary mt-0.5 font-medium truncate">
                                    Update your profile picture, banner, and personal information
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
                        {visitedTabs.has('invitations') && (
                            <div className={activeSettingsTab === 'invitations' ? 'block' : 'hidden'}>
                                <InvitationsList />
                            </div>
                        )}
                        {visitedTabs.has('org_workspace') && (
                            <div className={activeSettingsTab === 'org_workspace' ? 'block' : 'hidden'}>
                                <SettingsDashboard />
                            </div>
                        )}
                        {visitedTabs.has('email') && (
                            <div className={activeSettingsTab === 'email' ? 'block' : 'hidden'}>
                                <EmailSettingsForm />
                            </div>
                        )}
                        {visitedTabs.has('password') && (
                            <div className={activeSettingsTab === 'password' ? 'block' : 'hidden'}>
                                <PasswordSettingsForm />
                            </div>
                        )}
                        {visitedTabs.has('account') && (
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
