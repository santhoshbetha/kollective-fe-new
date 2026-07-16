// src/features/preferences/AppPreferencesForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { APP_LOCALES, useTranslation } from '../../components/locales';
import { DISTRICT_TERMINOLOGY } from '../../components/politicalConfig';

// 🎛️ Reusable toggle switch component matching the redesign style
const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary-container' : 'bg-surface-container-high border border-white/5'
            }`}
    >
        <span
            className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full transition duration-200 ease-in-out mt-[2px] ml-[2px] ${checked ? 'translate-x-[20px] bg-white' : 'translate-x-0 bg-[#a34b07]'
                }`}
        />
    </button>
);

export function AppPreferencesForm() {
    const navigate = useNavigate();

    // Zustand State hooks
    const currentTheme = useStore((state) => state.theme);
    const currentLanguage = useStore((state) => state.appLanguage);
    const setTheme = useStore((state) => state.setTheme);
    const setAppLanguage = useStore((state) => state.setAppLanguage);
    const showPersonalHandle = useStore((state) => state.showPersonalHandleOnOrg);
    const setShowPersonalHandle = useStore((state) => state.setShowPersonalHandleOnOrg);

    // Zustand Political Persistence Store links
    const politicalOptIn = useStore((state) => state.politicalOptIn);
    const politicalCountry = useStore((state) => state.politicalCountry);
    const districtFederal = useStore((state) => state.districtFederal);
    const districtStateLower = useStore((state) => state.districtStateLower);
    const districtStateUpper = useStore((state) => state.districtStateUpper);

    const setPoliticalOptIn = useStore((state) => state.setPoliticalOptIn);
    const setPoliticalCountry = useStore((state) => state.setPoliticalCountry);
    const setDistrictFields = useStore((state) => state.setDistrictFields);

    // Local Form state buffers
    const [localTheme, setLocalTheme] = useState(currentTheme);
    const [localLanguage, setLocalLanguage] = useState(currentLanguage);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [repliesEnabled, setRepliesEnabled] = useState(true);
    const [privateProfile, setPrivateProfile] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);

    // Translation interpreter
    const t = useTranslation(currentLanguage);

    const states = ['California', 'New York', 'Texas'];
    const citiesByState = {
        California: ['Los Angeles', 'San Francisco', 'San Diego'],
        'New York': ['New York City', 'Buffalo', 'Rochester'],
        Texas: ['Houston', 'Austin', 'Dallas'],
    };

    const targetConfig = DISTRICT_TERMINOLOGY[politicalCountry] || DISTRICT_TERMINOLOGY['US'];

    const handlePreferencesSubmit = (e) => {
        e.preventDefault();
        setTheme(localTheme);
        setAppLanguage(localLanguage);
        alert("Application telemetry parameters refreshed cleanly.");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-200 max-h-full overflow-y-auto pr-2 no-scrollbar">

            {/* 🌐 1. MULTI-LANGUAGE & THEME SUB-SECTION */}
            <form onSubmit={handlePreferencesSubmit} className="space-y-5 border-b border-white/5 pb-6">
                <div className="border-b border-white/5 pb-3 select-none">
                    <h2 className="text-xl font-extrabold text-text-primary tracking-tight">{t('pref_heading')}</h2>
                    <p className="text-lg text-text-secondary mt-0.5">{t('pref_desc')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-lg font-bold text-text-secondary uppercase tracking-wider">{t('lang_label')}</label>
                        <select
                            value={localLanguage}
                            onChange={(e) => setLocalLanguage(e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 text-lg font-bold rounded-xl px-4 py-3 text-text-primary focus:outline-none cursor-pointer"
                        >
                            {Object.keys(APP_LOCALES).map((key) => (
                                <option key={key} value={key}>{APP_LOCALES[key].label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-lg font-bold text-text-secondary uppercase tracking-wider">{t('theme_label')}</label>
                        <select
                            value={localTheme}
                            onChange={(e) => setLocalTheme(e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 text-lg font-bold rounded-xl px-4 py-3 text-text-primary focus:outline-none cursor-pointer"
                        >
                            <option value="dark">{t('theme_dark')}</option>
                            <option value="light">{t('theme_light')}</option>
                        </select>
                    </div>
                </div>

                <button type="submit" disabled={localTheme === currentTheme && localLanguage === currentLanguage} className="px-4 py-2 bg-primary-container text-white font-bold text-lg rounded-xl cursor-pointer border-none uppercase tracking-wider disabled:opacity-40">
                    {t('btn_save')}
                </button>
            </form>

            {/* 🛡️ 2. IDENTITY & VERIFICATION ONBOARDING CARDS */}
            <div className="space-y-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-2 text-text-primary font-bold text-lg select-none">
                    <span className="material-symbols-outlined text-[18px] text-primary-container">verified</span>
                    <h3 className="uppercase font-mono text-lg tracking-wider text-text-secondary">Identity &amp; Verification</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div onClick={() => navigate('/verify')} className="p-4 bg-surface-container-low border border-white/10 hover:border-primary-container/40 rounded-xl cursor-pointer transition-all flex flex-col justify-between">
                        <div>
                            <span className="text-lg font-bold text-white block mb-1">Choose Account Role</span>
                            <p className="text-lg text-text-secondary leading-relaxed">Select your category and authenticate credentials with peer review boards.</p>
                        </div>
                        <span className="text-primary-container font-mono font-bold text-[12px] uppercase mt-3 block">Start Onboarding ➔</span>
                    </div>
                    <div onClick={() => navigate('/verify/citizen')} className="p-4 bg-surface-container-low border border-white/10 hover:border-primary-container/40 rounded-xl cursor-pointer transition-all flex flex-col justify-between">
                        <div>
                            <span className="text-lg font-bold text-white block mb-1">Peer-to-Peer Vouching</span>
                            <p className="text-lg text-text-secondary leading-relaxed">Verify other grassroots citizens in person or get vouched for by local trusted nodes.</p>
                        </div>
                        <span className="text-primary-container font-mono font-bold text-[12px] uppercase mt-3 block">Enter Vouching Desk ➔</span>
                    </div>
                </div>
            </div>

            {/* 📍 3. LOCATION DROP-DOWN SELECTORS */}
            <div className="space-y-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-2 font-bold text-lg select-none">
                    <span className="material-symbols-outlined text-[18px] text-primary-container">location_on</span>
                    <h3 className="uppercase font-mono text-lg tracking-wider text-text-secondary">Location Parameters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary uppercase">State</label>
                        <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }} className="w-full bg-[#111111] border border-white/10 rounded-xl py-2 px-3 text-lg text-text-primary focus:outline-none">
                            <option value="">Select your state</option>
                            {states.map((st) => <option key={st} value={st}>{st}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary uppercase">City</label>
                        <select value={selectedCity} disabled={!selectedState} onChange={(e) => setSelectedCity(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl py-2 px-3 text-lg text-text-primary focus:outline-none disabled:opacity-40">
                            <option value="">{selectedState ? 'Select a city' : 'Select a state first'}</option>
                            {selectedState && citiesByState[selectedState].map((city) => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* 🗳️ 4. POLITICAL ENGINE OPT-IN & REPRESENTATION SECTION */}
            <div className="space-y-5 border-b border-white/5 pb-6">
                <div className="flex items-center justify-between select-none">
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <span className="material-symbols-outlined text-[18px] text-primary-container">campaign</span>
                        <div className="flex flex-col">
                            <span className="text-md font-bold text-white">Political &amp; Civic Governance Features</span>
                            <span className="text-[14px] text-text-secondary">Opt in to civic action networks, governance campaign boards, or run for office platforms</span>
                        </div>
                    </div>
                    <Toggle checked={politicalOptIn} onChange={() => setPoliticalOptIn(!politicalOptIn)} />
                </div>

                {/* 🗺️ Dynamic Forms Field Stack Cascades */}
                {politicalOptIn && (
                    <div className="p-5 bg-[#111111] border border-white/10 rounded-2xl space-y-4 animate-in slide-in-from-top-3 duration-200 flex flex-col">

                        {/* Country Selector Switchboard */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-black uppercase tracking-wider text-text-secondary">Jurisdiction Country Boundary</label>
                            <select
                                value={politicalCountry}
                                onChange={(e) => setPoliticalCountry(e.target.value)}
                                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-md font-bold text-text-primary focus:outline-none"
                            >
                                {Object.keys(DISTRICT_TERMINOLOGY).map((ccode) => (
                                    <option key={ccode} value={ccode}>{DISTRICT_TERMINOLOGY[ccode].countryLabel}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dynamic District Parameters Rows Map */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">

                            {/* Dynamic Dropdown Field A: Federal Boundaries */}
                            {targetConfig.labels.federal && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-text-secondary uppercase truncate" title={targetConfig.labels.federal}>
                                        {targetConfig.labels.federal}
                                    </label>
                                    <select
                                        value={districtFederal}
                                        onChange={(e) => setDistrictFields({ federal: e.target.value })}
                                        className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2.5 text-md text-text-primary focus:outline-none"
                                    >
                                        <option value="">Select Boundary...</option>
                                        {targetConfig.options['TX'].federal.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Dynamic Dropdown Field B: Upper House (Conditionally Rendered/Omitted) */}
                            {targetConfig.labels.stateUpper ? (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-text-secondary uppercase truncate" title={targetConfig.labels.stateUpper}>
                                        {targetConfig.labels.stateUpper}
                                    </label>
                                    <select
                                        value={districtStateUpper}
                                        onChange={(e) => setDistrictFields({ stateUpper: e.target.value })}
                                        className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2.5 text-md text-text-primary focus:outline-none"
                                    >
                                        <option value="">Select Upper...</option>
                                        {targetConfig.options['TX'].stateUpper.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                /* Symmetrical Grid Placeholder layout fallback structure to balance empty spaces */
                                <div className="hidden md:flex flex-col justify-center p-3 text-[12px] font-mono border border-dashed border-white/5 rounded-xl text-text-secondary/20 select-none">
                                    Upper House Appointed / Omitted
                                </div>
                            )}

                            {/* Dynamic Dropdown Field C: Lower House Boundaries */}
                            {targetConfig.labels.stateLower && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-text-secondary uppercase truncate" title={targetConfig.labels.stateLower}>
                                        {targetConfig.labels.stateLower}
                                    </label>
                                    <select
                                        value={districtStateLower}
                                        onChange={(e) => setDistrictFields({ stateLower: e.target.value })}
                                        className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2.5 text-md text-text-primary focus:outline-none"
                                    >
                                        <option value="">Select Lower...</option>
                                        {targetConfig.options['TX'].stateLower.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>


            {/* 🔔 5. NOTIFICATION TOGGLE OPTIONS */}
            <div className="space-y-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-2 font-bold text-sm select-none">
                    <span className="material-symbols-outlined text-[18px] text-primary-container">notifications_active</span>
                    <h3 className="uppercase font-mono text-sm tracking-wider text-text-secondary">Notifications Channels</h3>
                </div>
                <div className="space-y-3 bg-[#111111] border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-md font-bold text-white">Push Notifications</span>
                            <span className="text-[14px] text-text-secondary">Receive push tokens on your active device</span>
                        </div>
                        <Toggle checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <span className="text-md font-bold text-white">Email Notifications</span>
                            <span className="text-[14px] text-text-secondary">Receive automated contact memos via email</span>
                        </div>
                        <Toggle checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <span className="text-md font-bold text-white">Comment Replies</span>
                            <span className="text-[14px] text-text-secondary">Get notified when someone responds to your pulses</span>
                        </div>
                        <Toggle checked={repliesEnabled} onChange={() => setRepliesEnabled(!repliesEnabled)} />
                    </div>
                </div>
            </div>

            {/* 🛡️ 6. PRIVACY & ACCOUNT SECURITY CONTROLS */}
            <div className="space-y-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-2 font-bold text-sm select-none">
                    <span className="material-symbols-outlined text-[18px] text-primary-container">security</span>
                    <h3 className="uppercase font-mono text-sm tracking-wider text-text-secondary">Privacy &amp; Security Keys</h3>
                </div>
                <div className="space-y-3 bg-[#111111] border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-md font-bold text-white">Private Profile</span>
                            <span className="text-[14px] text-text-secondary">Only approved followers can see your status logs</span>
                        </div>
                        <Toggle checked={privateProfile} onChange={() => setPrivateProfile(!privateProfile)} />
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <span className="text-md font-bold text-white">Two-Factor Authentication</span>
                            <span className="text-[14px] text-text-secondary">Add a secondary verification code signature</span>
                        </div>
                        <Toggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <span className="text-md font-bold text-white">Show Handle on Organization Profile</span>
                            <span className="text-[14px] text-text-secondary">Expose your personal handle link when publishing for a brand</span>
                        </div>
                        <Toggle checked={showPersonalHandle} onChange={() => setShowPersonalHandle(!showPersonalHandle)} />
                    </div>
                </div>
            </div>

            {/* 🎨 7. APPEARANCE MANAGEMENT SUB-SECTION (Your Custom Style Merged) */}
            <div className="space-y-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-2 font-bold text-sm select-none">
                    <span className="material-symbols-outlined text-[18px] text-primary-container">palette</span>
                    <h3 className="uppercase font-mono text-sm tracking-wider text-text-secondary">Appearance Settings</h3>
                </div>
                <div className="space-y-3 bg-[#111111] border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-md font-bold text-white">Dark Mode</span>
                            <span className="text-[14px] text-text-secondary">Use dark theme across the application context</span>
                        </div>
                        {/* Syncs your local visual selector options with the state handlers */}
                        <Toggle checked={localTheme === 'dark'} onChange={() => setLocalTheme(localTheme === 'dark' ? 'light' : 'dark')} />
                    </div>
                </div>
            </div>

            {/* 🧭 8. MASTER CONTROL ACTION BUTTONS BAR ROW */}
            <div className="flex items-center gap-4 pt-4 select-none w-full justify-end">
                <button
                    type="button"
                    onClick={(e) => {
                        handlePreferencesSubmit(e);
                        navigate('/home');
                    }}
                    className="flex items-center gap-2 bg-primary-container text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all crimson-glow cursor-pointer border-none shadow-md"
                >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="bg-surface-container-high border border-white/5 hover:bg-surface-container-highest text-text-primary px-8 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                    Cancel
                </button>
            </div>

        </div>
    );
}
