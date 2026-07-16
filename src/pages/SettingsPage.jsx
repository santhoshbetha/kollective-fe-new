// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useTranslation } from '../components/locales';
import { AppPreferencesForm } from '../features/preferences/AppPreferencesForm';
import { EmailSettingsForm, PasswordSettingsForm, DangerZoneSettingsForm } from '../features/settings/SettingsSubForms';

export const SettingsPage = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    // 🗺️ Connect active language variables straight to translation dictionaries
    const currentLanguage = useStore((state) => state.appLanguage);
    const t = useTranslation(currentLanguage);

    // Switchboard tab state tracker: 'index' | 'email' | 'password' | 'account'
    const [activeSettingsTab, setActiveSettingsTab] = useState('index');

    const settingsMenu = [
        { id: 'index', label: t('pref_heading'), icon: 'settings_accessibility', desc: t('pref_desc') },
        { id: 'email', label: 'Email Configuration', icon: 'mail', desc: 'Manage your contact address links' },
        { id: 'password', label: 'Security & Keys', icon: 'lock', desc: 'Modify entry passwords and authorization keys' },
        { id: 'account', label: 'Danger Zone', icon: 'gavel', desc: 'Permanent account destruction matrices' }
    ];

    const handleReturnClick = () => {
        if (activeSettingsTab !== 'index') {
            setActiveSettingsTab('index');
        } else {
            navigate('/home');
        }
    };

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-8 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 LEFT SIDEBAR COLUMN: NAVIGATION STRIP TRACKING PANEL */}
            <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 select-none">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-text-primary tracking-tight">{t('settings_title')}</h1>
                        <p className="text-sm text-text-secondary mt-0.5">Control node parameters and profile locks</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleReturnClick}
                        className="lg:hidden p-2 bg-surface-container border border-white/10 rounded-xl flex items-center justify-center text-text-primary"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </button>
                </div>

                {/* Menu Options Flat Stack Loops */}
                <div className="flex flex-col gap-1.5 bg-[#141414] border border-[#262626] p-2 rounded-2xl shadow-xl">
                    {settingsMenu.map((menuItem) => {
                        const isTabActive = activeSettingsTab === menuItem.id;
                        return (
                            <button
                                key={menuItem.id}
                                type="button"
                                onClick={() => setActiveSettingsTab(menuItem.id)}
                                className={`flex items-center gap-4 w-full p-4 text-left rounded-xl transition-all border border-transparent cursor-pointer bg-transparent group ${isTabActive
                                    ? 'bg-surface-container-high border-white/5 text-text-primary shadow-md'
                                    : 'text-text-secondary hover:bg-white/[0.015] hover:text-text-primary'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${isTabActive ? 'bg-primary-container/20 border-primary-container/20 text-primary-container' : 'bg-surface-container border-white/5 text-text-secondary group-hover:text-text-primary'
                                    }`}>
                                    <span className="material-symbols-outlined text-[20px]">{menuItem.icon}</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-lg font-black tracking-tight text-white">{menuItem.label}</span>
                                    <span className="text-[14px] text-text-secondary/50 font-medium truncate mt-0.5">{menuItem.desc}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 🖥️ RIGHT WORKSPACE COLUMN: EXPLICIT SUB-FORM DETACHED INTERFACES */}
            <div className="flex-1 min-w-0 bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-2xl relative min-h-[500px]">

                {/* Quick Back Arrow Header for Desktop Sub-settings Views */}
                {activeSettingsTab !== 'index' && (
                    <button
                        type="button"
                        onClick={() => setActiveSettingsTab('index')}
                        className="hidden lg:flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-white transition-colors mb-4 bg-transparent border-none cursor-pointer p-0"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Return to Preferences</span>
                    </button>
                )}

                {/* 🏆 SUB-FORM MATRIX SWITCHBOARD INJECTION */}
                {activeSettingsTab === 'index' && <AppPreferencesForm />}
                {activeSettingsTab === 'email' && <EmailSettingsForm />}
                {activeSettingsTab === 'password' && <PasswordSettingsForm />}
                {activeSettingsTab === 'account' && <DangerZoneSettingsForm />}

            </div>

        </div>
    );
};
