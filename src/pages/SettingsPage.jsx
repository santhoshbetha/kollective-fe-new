// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useTranslation } from '../components/locales';
import { AppPreferencesForm } from '../features/preferences/AppPreferencesForm';
import { EmailSettingsForm, PasswordSettingsForm, DangerZoneSettingsForm } from '../features/settings/SettingsSubForms';
import InvitationsList from './InvitationsList';
import SettingsDashboard from '../features/settings/SettingsDashboard';
import { UserAvatar } from '../components/UserAvatar';
import { ArrowLeft, User, Mail, Lock, ShieldAlert, Settings, Network, Grid } from 'lucide-react'; // Hardware-accelerated fallbacks
import { cn } from "@/lib/utils";

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

    // 🔒 FIXED ROUTE GUARD SAFETY LOOP: Safely verify session tokens within an insulated side-effect
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && tabParam !== activeSettingsTab) {
            setActiveSettingsTab(tabParam);
        }
    }, [searchParams, activeSettingsTab]);

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
        setActiveSettingsTab(tabId);
        if (tabId === 'index') {
            setSearchParams({});
        } else {
            setSearchParams({ tab: tabId });
        }
    };

    const handleReturnClick = () => {
        if (activeSettingsTab !== 'index') {
            handleTabChange('index');
        } else {
            navigate('/home');
        }
    };

    if (!isAuthenticated) return null; //Insulate view while effect guard fires redirect push

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col xl:flex-row gap-8 pb-20 w-full animate-in fade-in duration-200 text-left font-sans">
            {/* Left Hand Sidebar Navigation Navigation Node Column Block */}
            <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0 select-none">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-text-primary tracking-tight">{t('settings_title')}</h1>
                        <p className="text-sm text-text-secondary mt-0.5 font-medium">Control node parameters and profile locks</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleReturnClick}
                        className="xl:hidden p-2 bg-surface-container border border-white/10 rounded-xl flex items-center justify-center text-text-primary outline-none transition-colors hover:bg-white/5"
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
                                onClick={() => handleTabChange(menuItem.id)}
                                className={cn(
                                    "flex items-center gap-4 w-full p-4 text-left rounded-xl transition-all border border-transparent cursor-pointer bg-transparent group outline-none",
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
                                <div className="flex flex-col min-w-0">
                                    <span className="text-base font-bold tracking-tight dark:text-white">{menuItem.label}</span>
                                    <span className="text-[13px] text-text-secondary/50 font-medium truncate mt-0.5">{menuItem.desc}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            {/* Right Hand Dynamic Settings Sub-Form Canvas Area */}
            <div className="flex-1 min-w-0 bg-[#141414] border border-[#262626] p-6 shadow-2xl relative min-h-[500px] rounded-2xl">
                {activeSettingsTab !== 'index' && (
                    <button
                        type="button"
                        onClick={() => handleTabChange('index')}
                        className="hidden xl:flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-white transition-colors mb-6 bg-transparent border-none cursor-pointer p-0 outline-none select-none"
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
                                className="w-14 h-14 border-2 border-primary-container/20 shrink-0 text-lg font-bold"
                                roundedClassName="rounded-full"
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

                {/* ⚡ LOAD THE SEPARATED DECOUPLED CONTENT SUB-FORMS CONFIGURATIONS */}
                <div className="w-full relative">
                    {activeSettingsTab === 'index' && <AppPreferencesForm />}
                    {activeSettingsTab === 'invitations' && <InvitationsList />}
                    {activeSettingsTab === 'org_workspace' && <SettingsDashboard />}
                    {activeSettingsTab === 'email' && <EmailSettingsForm />}
                    {activeSettingsTab === 'password' && <PasswordSettingsForm />}
                    {activeSettingsTab === 'account' && <DangerZoneSettingsForm />}
                </div>
            </div>
        </div>
    );
};
