// src/features/preferences/AppPreferencesForm.jsx
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { APP_LOCALES, useTranslation } from '../../components/locales';

export function AppPreferencesFormN1() {
    // 1. Fetch structural state managers from global store matrix
    const currentTheme = useStore((state) => state.theme);
    const currentLanguage = useStore((state) => state.appLanguage);
    const setTheme = useStore((state) => state.setTheme);
    const setAppLanguage = useStore((state) => state.setAppLanguage);

    // 2. Local memory states for handling changes
    const [localTheme, setLocalTheme] = useState(currentTheme);
    const [localLanguage, setLocalLanguage] = useState(currentLanguage);

    // 3. Initialize interpreter dictionary mapping
    const t = useTranslation(currentLanguage);

    const handlePreferencesSubmit = (e) => {
        e.preventDefault();
        setTheme(localTheme);
        setAppLanguage(localLanguage);
        alert("Application telemetry parameters refreshed cleanly.");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200 mt-4">
            <div className="border-b border-white/5 pb-4 select-none">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                    {t('pref_heading')}
                </h2>
                <p className="text-sm text-text-secondary mt-0.5">
                    {t('pref_desc')}
                </p>
            </div>

            <form onSubmit={handlePreferencesSubmit} className="space-y-6 flex flex-col w-full max-w-md">

                {/* 🌐 Option Bracket: Language Selector Dropdown */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">
                        {t('lang_label')}
                    </label>
                    <select
                        value={localLanguage}
                        onChange={(e) => setLocalLanguage(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 text-sm font-bold rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary-container cursor-pointer select-none"
                    >
                        {Object.keys(APP_LOCALES).map((localeKey) => (
                            <option key={localeKey} value={localeKey}>
                                {APP_LOCALES[localeKey].label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 🎨 Option Bracket: Visual Application Theme Radio Group */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">
                        {t('theme_label')}
                    </label>
                    <div className="flex flex-col gap-2 bg-[#111111] border border-white/5 p-4 rounded-xl shadow-inner select-none">

                        {/* Radio Choice: Dark Mode */}
                        <label className="flex items-center gap-3 cursor-pointer py-1">
                            <input
                                type="radio"
                                name="appTheme"
                                value="dark"
                                checked={localTheme === 'dark'}
                                onChange={() => setLocalTheme('dark')}
                                className="rounded-full border-white/10 text-primary-container focus:ring-0 w-4 h-4 bg-[#141414]"
                            />
                            <span className="text-sm font-medium text-text-primary">
                                {t('theme_dark')}
                            </span>
                        </label>

                        {/* Radio Choice: Light Mode */}
                        <label className="flex items-center gap-3 cursor-pointer py-1">
                            <input
                                type="radio"
                                name="appTheme"
                                value="light"
                                checked={localTheme === 'light'}
                                onChange={() => setLocalTheme('light')}
                                className="rounded-full border-white/10 text-primary-container focus:ring-0 w-4 h-4 bg-[#141414]"
                            />
                            <span className="text-sm font-medium text-text-primary">
                                {t('theme_light')}
                            </span>
                        </label>

                    </div>
                </div>

                {/* 🧭 Commit Submission Footer Button Row */}
                <button
                    type="submit"
                    disabled={localTheme === currentTheme && localLanguage === currentLanguage}
                    className="w-fit px-5 py-2.5 bg-primary-container text-white font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md border-none uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                    {t('btn_save')}
                </button>

            </form>
        </div>
    );
}
