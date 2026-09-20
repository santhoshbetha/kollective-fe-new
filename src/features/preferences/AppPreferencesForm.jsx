// src/features/preferences/AppPreferencesForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { APP_LOCALES, useTranslation } from '../../components/locales';
import { DISTRICT_TERMINOLOGY } from '../../components/politicalConfig';
import { getStatesByCountry } from '../../utils/geoUtils';
import { lookupAddressBoundaries } from '../../api/mockApi';
import { apiFetch } from '../../api/apiClient';

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

    // Zustand Auth Store hooks
    const authUser = useAuthStore((state) => state.user);
    const updateActiveProfile = useAuthStore((state) => state.updateActiveProfile);

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
    const userState = useStore((state) => state.userState);
    const setUserState = useStore((state) => state.setUserState);
    const stateUpdatedAt = useStore((state) => state.stateUpdatedAt);
    const setStateUpdatedAt = useStore((state) => state.setStateUpdatedAt);
    const streetAddress = useStore((state) => state.streetAddress);
    const setStreetAddress = useStore((state) => state.setStreetAddress);
    const userCity = useStore((state) => state.userCity);
    const setUserCity = useStore((state) => state.setUserCity);
    const districtFederal = useStore((state) => state.districtFederal);
    const districtStateLower = useStore((state) => state.districtStateLower);
    const districtStateUpper = useStore((state) => state.districtStateUpper);

    const setPoliticalOptIn = useStore((state) => state.setPoliticalOptIn);
    const setPoliticalCountry = useStore((state) => state.setPoliticalCountry);
    const setDistrictFields = useStore((state) => state.setDistrictFields);

    // Local Form state buffers
    const [localTheme, setLocalTheme] = useState(currentTheme);
    const [localLanguage, setLocalLanguage] = useState(currentLanguage);
    const [selectedState, setSelectedState] = useState(userState || '');
    const [localStreetAddress, setLocalStreetAddress] = useState(streetAddress || '');
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);
    const [lookupError, setLookupError] = useState(null);
    const [stateSavedStatus, setStateSavedStatus] = useState(false);
    const [isSavingState, setIsSavingState] = useState(false);
    const [pendingState, setPendingState] = useState(null);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [repliesEnabled, setRepliesEnabled] = useState(true);
    const [privateProfile, setPrivateProfile] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);

    // Calculate active state and local 30-day cooldown based on state_updated_at in profile data
    const activeSavedState = userState || authUser?.state || authUser?.political_location?.state;
    const rawStateUpdatedAt = authUser?.state_updated_at || authUser?.political_location?.state_updated_at || stateUpdatedAt || authUser?.metadata?.state_updated_at;
    let cooldownDaysRemaining = 0;
    if (rawStateUpdatedAt) {
        const lastUpdate = new Date(rawStateUpdatedAt);
        if (!isNaN(lastUpdate.getTime())) {
            const secondsPassed = Math.floor((new Date() - lastUpdate.getTime()) / 1000);
            const cooldownSeconds = 30 * 86400;
            if (secondsPassed >= 0 && secondsPassed < cooldownSeconds) {
                cooldownDaysRemaining = Math.max(1, Math.ceil((cooldownSeconds - secondsPassed) / 86400));
            }
        }
    }

    // Translation interpreter
    const t = useTranslation(currentLanguage);

    // Dynamic country states loaded based on selected politicalCountry
    const states = getStatesByCountry(politicalCountry);

    const handleSaveState = async (stateValue = selectedState) => {
        const stateToSave = stateValue || selectedState;
        if (!stateToSave) return;

        // 🚨 FRONTEND DATE GUARD: Reject state change in FE directly without calling backend route if < 30 days
        if (cooldownDaysRemaining > 0 && userState && userState !== stateToSave) {
            setLookupError(`State change is limited to once per month. Next change available in ${cooldownDaysRemaining} day(s).`);
            setPendingState(null);
            return;
        }

        setIsSavingState(true);
        setLookupError(null);
        try {
            const response = await apiFetch('/user/location', {
                method: 'PUT',
                body: JSON.stringify({ state: stateToSave, country: politicalCountry || 'US' })
            });

            // Capture state_updated_at returned from backend or default to current ISO time
            const nowIso = response?.user?.state_updated_at || response?.state_updated_at || new Date().toISOString();

            // Update local profile data to prevent changing state multiple times in the same login
            updateActiveProfile({ state_updated_at: nowIso, state: stateToSave });
            setStateUpdatedAt(nowIso);

            // Reset street address & resolved districts info in Zustand store on state change
            setStreetAddress('');
            setLocalStreetAddress('');
            setUserCity('');
            setDistrictFields({
                federal: null,
                stateUpper: null,
                stateLower: null
            });

            setUserState(stateToSave);
            setSelectedState(stateToSave);
            setStateSavedStatus(true);
            setTimeout(() => setStateSavedStatus(false), 4000);
        } catch (err) {
            console.warn('Backend state location update error', err);
            const msg = err?.message || err?.error || "State change is limited to once per month.";
            setLookupError(msg);
        } finally {
            setIsSavingState(false);
        }
    };

    const handleLookupBoundaries = async () => {
        if (!localStreetAddress || !localStreetAddress.trim()) {
            setLookupError("Please enter a street address first.");
            return;
        }
        setLookupError(null);
        setIsResolvingAddress(true);
        try {
            const result = await lookupAddressBoundaries(localStreetAddress, selectedState, politicalCountry);
            setStreetAddress(result.address);
            setUserCity(result.city);
            setDistrictFields({
                federal: result.districtFederal,
                stateUpper: result.districtStateUpper,
                stateLower: result.districtStateLower
            });
            if (selectedState !== result.state && result.state) {
                setUserState(result.state);
                setSelectedState(result.state);
            }
        } catch (err) {
            setLookupError(err.message || "Failed to resolve boundaries from backend.");
        } finally {
            setIsResolvingAddress(false);
        }
    };

    const targetConfig = DISTRICT_TERMINOLOGY[politicalCountry] || DISTRICT_TERMINOLOGY['US'];

    const handlePreferencesSubmit = (e) => {
        e.preventDefault();
        setTheme(localTheme);
        setAppLanguage(localLanguage);
        alert("Application telemetry parameters refreshed cleanly.");
    };

    console.log("authUser:", authUser);
    console.log("authUser.state:", authUser.state);

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
                            <span className="text-lg font-bold dark:text-white block mb-1">Choose Account Role</span>
                            <p className="text-lg text-text-secondary leading-relaxed">Select your category and authenticate credentials with peer review boards.</p>
                        </div>
                        <span className="text-primary-container font-mono font-bold text-[12px] uppercase mt-3 block">Start Onboarding ➔</span>
                    </div>
                    <div onClick={() => navigate('/verify/citizen')} className="p-4 bg-surface-container-low border border-white/10 hover:border-primary-container/40 rounded-xl cursor-pointer transition-all flex flex-col justify-between">
                        <div>
                            <span className="text-lg font-bold dark:text-white block mb-1">Peer-to-Peer Vouching</span>
                            <p className="text-lg text-text-secondary leading-relaxed">Verify other grassroots citizens in person or get vouched for by local trusted nodes.</p>
                        </div>
                        <span className="text-primary-container font-mono font-bold text-[12px] uppercase mt-3 block">Enter Vouching Desk ➔</span>
                    </div>
                </div>
            </div>

            {/* 📍 3. LOCATION PARAMETERS: STATE/PROVINCE & OPTIONAL STREET ADDRESS LOOKUP */}
            <div className="space-y-5 border-b border-white/5 pb-6">
                <div className="flex items-center justify-between font-bold text-lg select-none">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary-container">location_on</span>
                        <h3 className="uppercase font-mono text-lg tracking-wider text-text-secondary">Location Parameters</h3>
                    </div>
                    {activeSavedState && (
                        <span className="text-xs font-bold text-primary-container bg-primary-container/15 px-3 py-1 rounded-full border border-primary-container/30 flex items-center gap-1.5 animate-in fade-in duration-200">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Saved State: <strong>{activeSavedState}</strong>
                        </span>
                    )}
                </div>

                {/* 💡 1. State / Province Opt-In Banner & Message */}
                <div className="p-4 bg-primary-container/10 border border-primary-container/20 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary-container text-[22px] shrink-0 mt-0.5">map</span>
                    <div className="space-y-1">
                        <p className="font-bold text-text-primary text-md">
                            State &amp; Regional Post Feeds
                        </p>
                        <p className="text-text-secondary text-[16px] leading-relaxed">
                            Select and save your State or Province to opt in to state-level feeds, enabling you to view and publish posts specific to your state or regional community.
                        </p>
                    </div>
                </div>

                {/* 📍 Top Option: State/Province Selector + Auto-Save to Backend */}
                <div className="flex flex-col gap-3">
                    {activeSavedState ? (
                        <div className="p-4 bg-surface-container-low border border-primary-container/30 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary-container text-[24px]">verified_user</span>
                                <div>
                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Active Saved State / Province</span>
                                    <span className="text-lg font-extrabold text-text-primary">{activeSavedState}</span>
                                    {cooldownDaysRemaining > 0 && (
                                        <span className="text-md font-semibold text-amber-400 flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-[14px]">lock</span>
                                            State change on cooldown (1 month limit). Next change available in {cooldownDaysRemaining} day(s).
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={cooldownDaysRemaining > 0}
                                onClick={() => {
                                    if (cooldownDaysRemaining > 0) {
                                        setLookupError(`State change is limited to once per month. Next change available in ${cooldownDaysRemaining} day(s).`);
                                        return;
                                    }
                                    setUserState('');
                                    setSelectedState('');
                                    setStateSavedStatus(false);
                                }}
                                title={cooldownDaysRemaining > 0 ? `State change on cooldown (${cooldownDaysRemaining} day(s) remaining)` : 'Change State'}
                                className={`px-3.5 py-2 rounded-lg text-[14px] font-bold transition-all border flex items-center gap-1.5 shrink-0 ${cooldownDaysRemaining > 0 ? 'bg-white/5 text-text-secondary/40 border-white/5 cursor-not-allowed opacity-50' : 'bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border-white/10 cursor-pointer'}`}
                            >
                                <span className="material-symbols-outlined text-[15px]">{cooldownDaysRemaining > 0 ? 'lock' : 'edit'}</span>
                                {cooldownDaysRemaining > 0 ? `Locked (${cooldownDaysRemaining}d)` : 'Change State'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                            <div className="flex-1 flex flex-col gap-1.5 w-full">
                                <div className="flex items-center justify-between">
                                    <label className="text-[12px] font-bold text-text-secondary uppercase">State / Province</label>
                                    {activeSavedState && (
                                        <span className="text-xs font-bold text-primary-container flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            Current: {activeSavedState}
                                        </span>
                                    )}
                                </div>
                                <select
                                    value={selectedState}
                                    onChange={(e) => {
                                        const newSt = e.target.value;
                                        if (cooldownDaysRemaining > 0 && userState && userState !== newSt) {
                                            setLookupError(`State change is limited to once per month. Next change available in ${cooldownDaysRemaining} day(s).`);
                                            return;
                                        }
                                        setSelectedState(newSt);
                                        if (newSt) {
                                            setPendingState(newSt);
                                        }
                                    }}
                                    disabled={isSavingState || cooldownDaysRemaining > 0}
                                    className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-lg text-text-primary focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select your state / province</option>
                                    {states.map((st) => <option key={st} value={st}>{st}</option>)}
                                </select>
                                {activeSavedState && (
                                    <span className="text-xs text-text-secondary font-medium">
                                        Saved State / Province: <strong className="text-text-primary">{activeSavedState}</strong>
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (cooldownDaysRemaining > 0 && userState && userState !== selectedState) {
                                        setLookupError(`State change is limited to once per month. Next change available in ${cooldownDaysRemaining} day(s).`);
                                        return;
                                    }
                                    if (selectedState) {
                                        setPendingState(selectedState);
                                    }
                                }}
                                disabled={!selectedState || isSavingState || cooldownDaysRemaining > 0}
                                className="w-full md:w-auto px-6 py-3 bg-primary-container hover:bg-primary-container/90 text-white font-bold text-md rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shrink-0"
                            >
                                <span className="material-symbols-outlined text-[18px]">{cooldownDaysRemaining > 0 ? 'lock' : 'save'}</span>
                                {isSavingState ? 'Saving to DB...' : (cooldownDaysRemaining > 0 ? `Locked (${cooldownDaysRemaining}d remaining)` : (stateSavedStatus ? 'Saved to DB!' : 'Save State'))}
                            </button>
                        </div>
                    )}
                    {stateSavedStatus && (
                        <p className="text-emerald-400 font-medium text-sm flex items-center gap-1.5 animate-in fade-in duration-200">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            State saved to backend DB successfully. State-specific posting and feeds activated!
                        </p>
                    )}
                    {lookupError && (
                        <p className="text-amber-400 font-medium text-sm flex items-center gap-1.5 animate-in fade-in duration-200">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            {lookupError}
                        </p>
                    )}
                </div>

                {/* 🚨 Pop-up Modal Confirmation Overlay for State Selection */}
                {pendingState && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
                        <div className="bg-[#161616] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl crimson-glow">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[22px]">warning</span>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xl text-text-primary">Confirm State Change</h3>
                                    <p className="text-md text-text-secondary">Save <strong>{pendingState}</strong> to your account?</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-md text-text-secondary leading-relaxed bg-surface-container-low p-4 rounded-xl border border-white/5">
                                <p className="flex items-start gap-2 text-text-primary font-bold">
                                    <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 mt-0.5">hourglass_top</span>
                                    <span><strong>1 Month Cooldown:</strong> State changes can only be performed <strong>once per month</strong> (30-day limit).</span>
                                </p>
                                <p className="flex items-start gap-2 text-text-secondary">
                                    <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">refresh</span>
                                    <span>Selecting <strong>{pendingState}</strong> will reset your previously saved street address, city, and voting district boundaries.</span>
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPendingState(null);
                                        setSelectedState(userState || '');
                                    }}
                                    className="px-5 py-2.5 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:bg-white/5 font-bold text-sm transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const stateToConfirm = pendingState;
                                        setPendingState(null);
                                        handleSaveState(stateToConfirm);
                                    }}
                                    disabled={isSavingState}
                                    className="px-6 py-2.5 rounded-xl bg-primary-container hover:bg-primary-container/90 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    {isSavingState ? 'Saving...' : 'Confirm & Save State'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🏠 2. Optional Street Address Section for City & District Boundaries */}
                <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="p-4 bg-surface-container-high/40 border border-white/10 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary-container text-[22px] shrink-0 mt-0.5">location_city</span>
                        <div className="space-y-1">
                            <p className="font-bold text-text-primary text-md">
                                Optional: Add Street Address for Local Features &amp; Boundaries
                            </p>
                            <p className="text-text-secondary text-[16px] leading-relaxed">
                                Adding your street address is optional. Providing it allows our backend to automatically resolve your exact city and political voting districts, granting you access to location-based posts, local business directory, and community classifieds.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-text-secondary uppercase">
                            Street Address <span className="text-text-secondary/60 font-normal lowercase">(optional)</span>
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={localStreetAddress}
                                onChange={(e) => setLocalStreetAddress(e.target.value)}
                                placeholder="e.g. 100 Congress Ave, Austin, TX"
                                className="flex-1 bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-lg text-text-primary focus:outline-none focus:border-primary-container/60 transition-all placeholder:text-text-secondary/40"
                            />
                            <button
                                type="button"
                                onClick={handleLookupBoundaries}
                                disabled={isResolvingAddress || !localStreetAddress.trim()}
                                className="px-5 py-3 bg-surface-container-high hover:bg-surface-container-highest text-text-primary border border-white/10 font-bold text-md rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                            >
                                {isResolvingAddress ? (
                                    <>
                                        <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                                        Resolving BE...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px] text-primary-container">travel_explore</span>
                                        Lookup Boundaries
                                    </>
                                )}
                            </button>
                        </div>
                        {lookupError && (
                            <p className="text-rose-400 text-xs font-semibold mt-1">{lookupError}</p>
                        )}
                    </div>

                    {/* Display Resolved Backend Boundaries & Unlocked Access */}
                    {(userCity || districtFederal) && (
                        <div className="p-4 bg-[#141414] border border-white/10 rounded-xl space-y-3 animate-in fade-in duration-200 mt-2">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Resolved Backend Boundaries</span>
                                </div>
                                <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">BE Synchronized</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
                                    <span className="text-text-secondary block font-bold text-[10px] uppercase mb-0.5">Resolved City</span>
                                    <span className="font-bold text-text-primary text-sm flex items-center gap-1">
                                        📍 {userCity || 'Not resolved'}
                                    </span>
                                </div>
                                <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
                                    <span className="text-text-secondary block font-bold text-[10px] uppercase mb-0.5">Federal District</span>
                                    <span className="font-bold text-text-primary text-sm flex items-center gap-1">
                                        🏛️ {districtFederal || 'Not resolved'}
                                    </span>
                                </div>
                                <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
                                    <span className="text-text-secondary block font-bold text-[10px] uppercase mb-0.5">State Senate (Upper)</span>
                                    <span className="font-bold text-text-primary text-sm flex items-center gap-1">
                                        🏛️ {districtStateUpper || 'Not resolved'}
                                    </span>
                                </div>
                                <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
                                    <span className="text-text-secondary block font-bold text-[10px] uppercase mb-0.5">State House (Lower)</span>
                                    <span className="font-bold text-text-primary text-sm flex items-center gap-1">
                                        🏛️ {districtStateLower || 'Not resolved'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                                <span className="px-2.5 py-1 bg-primary-container/15 text-primary-container border border-primary-container/20 rounded-full font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">lock_open</span> Location Posts Unlocked
                                </span>
                                <span className="px-2.5 py-1 bg-primary-container/15 text-primary-container border border-primary-container/20 rounded-full font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">storefront</span> Local Businesses Unlocked
                                </span>
                                <span className="px-2.5 py-1 bg-primary-container/15 text-primary-container border border-primary-container/20 rounded-full font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">sell</span> Classifieds Access Active
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 🗳️ 4. POLITICAL ENGINE OPT-IN & REPRESENTATION SECTION */}
            <div className="space-y-5 border-b border-white/5 pb-6">
                <div className="flex items-center justify-between select-none">
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <span className="material-symbols-outlined text-[18px] text-primary-container">campaign</span>
                        <div className="flex flex-col">
                            <span className="text-md font-bold dark:text-white">Political &amp; Civic Governance Features</span>
                            <span className="text-[14px] text-text-secondary">Opt in to civic action networks, governance campaign boards, or run for office platforms</span>
                        </div>
                    </div>
                    <Toggle checked={politicalOptIn} onChange={() => setPoliticalOptIn(!politicalOptIn)} />
                </div>

                {/* 🛡️ Peer-to-Peer Vouching Requirement Notice when Political Features are Enabled */}
                {politicalOptIn && (
                    <div className="p-5 bg-gradient-to-r from-primary-container/15 via-[#141414] to-[#111111] border border-primary-container/30 rounded-2xl space-y-3 animate-in slide-in-from-top-3 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary-container font-bold text-sm">
                                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                                <span className="uppercase tracking-wider">Peer-to-Peer Vouching Verification Required</span>
                            </div>
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold">Opt-In Active</span>
                        </div>

                        <p className="text-sm text-text-secondary leading-relaxed">
                            Political and Civic Governance features are enabled. To protect system integrity and prevent astroturfing, please complete <strong className="text-text-primary font-bold">Peer-to-Peer Vouching</strong> to access governance features including <strong className="text-text-primary font-bold">Organize</strong> and <strong className="text-text-primary font-bold">Civic Assembly</strong> (to run for office or view candidate debate videos).
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/verify/citizen')}
                                className="px-5 py-2.5 bg-primary-container hover:bg-primary-container/90 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                                Finish Peer-to-Peer Vouching ➔
                            </button>
                            <span className="text-xs text-text-secondary/70 font-mono text-center sm:text-left">
                                Unlocks Organize hubs, Civic Assembly, & Candidate Desk
                            </span>
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
                            <span className="text-md font-bold dark:text-white">Push Notifications</span>
                            <span className="text-[14px] text-text-secondary">Receive push tokens on your active device</span>
                        </div>
                        <Toggle checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <span className="text-md font-bold dark:text-white">Email Notifications</span>
                            <span className="text-[14px] text-text-secondary">Receive automated contact memos via email</span>
                        </div>
                        <Toggle checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <span className="text-md font-bold dark:text-white">Comment Replies</span>
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
                            <span className="text-md font-bold dark:text-white">Private Profile</span>
                            <span className="text-[14px] text-text-secondary">Only approved followers can see your status logs</span>
                        </div>
                        <Toggle checked={privateProfile} onChange={() => setPrivateProfile(!privateProfile)} />
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <span className="text-md font-bold dark:text-white">Two-Factor Authentication</span>
                            <span className="text-[14px] text-text-secondary">Add a secondary verification code signature</span>
                        </div>
                        <Toggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex flex-col">
                            <span className="text-md font-bold dark:text-white">Show Handle on Organization Profile</span>
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
                            <span className="text-md font-bold dark:text-white">Dark Mode</span>
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
