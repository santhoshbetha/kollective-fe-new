import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/Alert';
import { DatePicker } from '../components/ui/date-picker';

const DEMOCRATIC_COUNTRIES = [
    "Albania", "Argentina", "Australia", "Austria", "Belgium", "Botswana", "Brazil", 
    "Bulgaria", "Canada", "Cape Verde", "Chile", "Colombia", "Costa Rica", "Croatia", 
    "Cyprus", "Czechia", "Denmark", "Dominican Republic", "Ecuador", "Estonia", 
    "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Guyana", 
    "Honduras", "Iceland", "India", "Indonesia", "Ireland", "Israel", "Italy", 
    "Jamaica", "Japan", "Latvia", "Lithuania", "Luxembourg", "Malaysia", "Malta", 
    "Mauritius", "Moldova", "Mongolia", "Montenegro", "Namibia", "Netherlands", 
    "New Zealand", "North Macedonia", "Norway", "Panama", "Paraguay", "Peru", 
    "Philippines", "Poland", "Portugal", "Romania", "Senegal", "Serbia", "Singapore", 
    "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", 
    "Suriname", "Sweden", "Switzerland", "Taiwan", "Thailand", "Trinidad and Tobago", 
    "United Kingdom", "United States", "Uruguay"
];

export const SignupPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1); // 1: Welcome, 2: Details, 3: Verify
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);

    // Fully loaded data state
    const [formData, setFormData] = useState({
        accountType: 'personal', // 'personal' or 'organization'
        username: '',
        email: '',
        password: '',
        fullName: '',
        dob: '',
        country: '',
        organizationName: '',
        agreeToGuidelines: false
    });

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
        setError(null);
    };

    const handleNext = (e) => {
        e.preventDefault();
        setError(null);
        if (currentStep === 1 && !formData.agreeToGuidelines) {
            setError("Please agree to the community guidelines to proceed.");
            return;
        }
        if (currentStep < 3) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setError(null);
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-background text-on-surface p-4 sm:p-6 isolate selection:bg-primary/30">

            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-transparent border-b border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div onClick={() => navigate('/')} className="mb-8 px-2 flex items-center gap-0 cursor-pointer hover:opacity-90">
                        <img src="/K99.png" alt="Kollective Logo" className="h-12 w-auto" />
                        <div>
                            <span className="text-xl font-bold sm:inline-block bg-[#CC033B] bg-clip-text text-transparent"
                                style={{ fontSize: "28px", fontFamily: "Protest Riot, sans-serif" }}>
                                Kollective
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Stepper Progress Bar (Matched to Screenshot #1) --- */}
            <div className="flex items-center gap-8 mb-8 relative z-10">
                <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full border-4 transition-all duration-300 ${currentStep >= 1 ? 'bg-[#c2185b] border-[#c2185b]/30 shadow-[0_0_8px_#c2185b]' : 'bg-[#1e293b] border-transparent'
                        }`} />
                    <span className={`text-xs mt-2 font-bold tracking-wide ${currentStep === 1 ? 'text-[#c2185b]' : 'text-zinc-100 dark:text-zinc-50/60'}`}>Welcome</span>
                </div>
                <div className="h-0.5 w-12 bg-outline-variant/30 -mt-5" />
                <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full border-4 transition-all duration-300 ${currentStep >= 2 ? 'bg-[#c2185b] border-[#c2185b]/30 shadow-[0_0_8px_#c2185b]' : 'bg-[#1e293b] border-transparent'
                        }`} />
                    <span className={`text-xs mt-2 font-bold tracking-wide ${currentStep === 2 ? 'text-[#c2185b]' : 'text-zinc-100 dark:text-zinc-50/60'}`}>Details</span>
                </div>
                <div className="h-0.5 w-12 bg-outline-variant/30 -mt-5" />
                <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full border-4 transition-all duration-300 ${currentStep === 3 ? 'bg-[#c2185b] border-[#c2185b]/30 shadow-[0_0_8px_#c2185b]' : 'bg-[#1e293b] border-transparent'
                        }`} />
                    <span className={`text-xs mt-2 font-bold tracking-wide ${currentStep === 3 ? 'text-[#c2185b]' : 'text-zinc-100 dark:text-zinc-50/60'}`}>Verify</span>
                </div>
            </div>

            {/* Main Container Card using our premium glass utility */}
            <div className="glass-panel w-full max-w-xl rounded-2xl p-8 md:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#c2185b]/10 to-transparent pointer-events-none blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none blur-xl"></div>

                {error && (
                    <Alert variant="destructive"
                        className="mb-6 z-10 relative"
                        onClose={() => setError(null)}
                    >
                        <span className="material-symbols-outlined">error</span>
                        <AlertTitle>Validation Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* ================= STEP 1: WELCOME & GUIDELINES ================= */}
                {currentStep === 1 && (
                    <div className="relative z-10 animate-fadeIn space-y-8">
                        <div className="text-center">
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
                                Welcome to the Kollective.
                            </h1>
                            <p className="text-sm text-zinc-100 dark:text-zinc-50 max-w-sm mx-auto leading-relaxed">
                                Before joining the revolution, please review our community code of conduct.
                            </p>
                        </div>

                        {/* Grid of Guideline Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Card 1 - Be Kind & Respectful */}
                            <div className="p-5 rounded-xl border border-outline-variant/40 bg-[var(--surface-container)]/20 hover:bg-[var(--surface-container)]/40 transition-colors">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-bold text-text-primary text-sm">Be Kind & Respectful</h3>
                                        <p className="text-sm text-slate-400 dark:text-zinc-400 mt-1 leading-relaxed">
                                            Empathy is our baseline. Treat every member with baseline human dignity. Debate ideas fiercely, but never attack the individual.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 - Keep it Real */}
                            <div className="p-5 rounded-xl border border-outline-variant/40 bg-[var(--surface-container)]/20 hover:bg-[var(--surface-container)]/40 transition-colors">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-bold text-text-primary text-sm">Keep it Real</h3>
                                        <p className="text-sm text-slate-400 dark:text-zinc-400 mt-1 leading-relaxed">
                                            Authenticity matters. No bots, fake accounts, spam, or algorithmic manipulation—just genuine human collaboration.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 - Zero Tolerance Policy */}
                            <div className="p-5 rounded-xl border border-outline-variant/40 bg-[var(--surface-container)]/20 hover:bg-[var(--surface-container)]/40 transition-colors">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-bold text-red-500 dark:text-red-400 text-sm">Zero Tolerance Policy</h3>
                                        <p className="text-sm text-slate-400 dark:text-zinc-400 mt-1 leading-relaxed">
                                            No racism, hate speech, religious attacks, or harassment. This is a safe space for global collaboration.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4 - Protect Privacy */}
                            <div className="p-5 rounded-xl border border-outline-variant/40 bg-[var(--surface-container)]/20 hover:bg-[var(--surface-container)]/40 transition-colors">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <div>
                                        <h3 className="font-bold text-text-primary text-sm">Protect Privacy</h3>
                                        <p className="text-sm text-slate-400 dark:text-zinc-400 mt-1 leading-relaxed">
                                            Your data is yours. Respect the safety, identity, and confidentiality of your peers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checkbox agreement */}
                        <div className="flex items-center gap-3 pt-4">
                            <input
                                id="agreeToGuidelines"
                                type="checkbox"
                                checked={formData.agreeToGuidelines}
                                onChange={handleInputChange}
                                className="w-4 h-4 rounded border-outline-variant bg-[var(--surface-container)]/40 text-[#c2185b] focus:ring-0 accent-[#c2185b]"
                            />
                            <label htmlFor="agreeToGuidelines" className="text-sm font-semibold text-zinc-100 dark:text-zinc-50 hover:text-text-primary cursor-pointer transition-colors">
                                I agree to follow these community guidelines
                            </label>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!formData.agreeToGuidelines}
                                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-[#c2185b] hover:bg-[#a2123c] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
                            >
                                Let's get started!
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="w-full sm:w-auto flex-1 border border-outline-variant/40 hover:bg-[var(--surface-container)]/30 font-bold py-3.5 px-6 rounded-xl transition-colors focus:outline-none"
                            >
                                Not ready yet
                            </button>
                        </div>

                        <div className="text-center text-sm text-zinc-100 dark:text-zinc-50 pt-2 border-t border-outline-variant/20">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-[#c2185b] hover:underline transition-colors">Log In</Link>
                        </div>
                    </div>
                )}

                {/* ================= STEP 2: CREDENTIALS & DETAILS ================= */}
                {currentStep === 2 && (
                    <form onSubmit={handleNext} className="relative z-10 animate-fadeIn space-y-6">
                        <div className="text-center mb-4">
                            <h1 className="text-2xl font-black text-white">Set Up Your Profile</h1>
                            <p className="text-xs text-slate-400 dark:text-zinc-400">Fill in the details to establish your node on the network.</p>
                        </div>

                        {/* Account Type Selector */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-400">Account Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, accountType: 'personal' }))}
                                    className={`p-3 rounded-lg border text-sm font-semibold transition-all text-left ${formData.accountType === 'personal'
                                        ? 'border-secondary bg-secondary/10 text-white'
                                        : 'border-outline-variant/40 bg-[var(--surface-container)]/10 text-slate-400 hover:bg-[var(--surface-container)]/20'
                                        }`}
                                >
                                    <span className={formData.accountType === 'personal' ? 'text-secondary' : 'text-white'}>Personal</span>
                                    <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1 font-normal normal-case leading-relaxed">
                                        For citizens, workers, independent journalists, activists, and independent voices.
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, accountType: 'organization' }))}
                                    className={`p-3 rounded-lg border text-sm font-semibold transition-all text-left ${formData.accountType === 'organization'
                                        ? 'border-secondary bg-secondary/10 text-white'
                                        : 'border-outline-variant/40 bg-[var(--surface-container)]/10 text-slate-400 hover:bg-[var(--surface-container)]/20'
                                        }`}
                                >
                                    <span className={formData.accountType === 'organization' ? 'text-secondary' : 'text-white'}>Organization</span>
                                    <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1 font-normal normal-case leading-relaxed">
                                        For News Orgs, YouTube channels, independent groups, and local communities.
                                    </p>
                                </button>
                            </div>
                        </div>


                        {/* Grid Layout for compact data inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {formData.accountType === 'organization' && (
                                <div className="sm:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold tracking-wider uppercase text-zinc-100 dark:text-zinc-50" htmlFor="organizationName">Org Name</label>
                                    <input
                                        id="organizationName"
                                        type="text"
                                        required
                                        value={formData.organizationName}
                                        onChange={handleInputChange}
                                        placeholder="Kollective LLC"
                                        className="w-full px-4 py-2.5 bg-[var(--surface-container)]/40 rounded-xl border border-outline-variant text-sm text-text-primary outline-none focus:border-[#c2185b] focus:ring-2 focus:ring-[#c2185b]/20 transition-all"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold tracking-wider uppercase text-zinc-100 dark:text-zinc-50" htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="@username"
                                    className="w-full px-4 py-2.5 bg-[var(--surface-container)]/40 rounded-xl border border-outline-variant text-sm text-text-primary outline-none focus:border-[#c2185b] focus:ring-2 focus:ring-[#c2185b]/20 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold tracking-wider uppercase text-zinc-100 dark:text-zinc-50" htmlFor="fullName">
                                    {formData.accountType === 'organization' ? 'Representative Name' : 'Full Name'}
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2.5 bg-[var(--surface-container)]/40 rounded-xl border border-outline-variant text-sm text-text-primary outline-none focus:border-[#c2185b] focus:ring-2 focus:ring-[#c2185b]/20 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold tracking-wider uppercase text-zinc-100 dark:text-zinc-50" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="name@email.com"
                                    className="w-full px-4 py-2.5 bg-[var(--surface-container)]/40 rounded-xl border border-outline-variant text-sm text-text-primary outline-none focus:border-[#c2185b] focus:ring-2 focus:ring-[#c2185b]/20 transition-all"
                                />
                            </div>

                            {formData.accountType === 'personal' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-400" htmlFor="dob">
                                        Date of Birth
                                    </label>
                                    <input
                                        id="dob"
                                        type="date"
                                        required
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-[var(--surface-container)]/40 rounded-xl 
                                            border border-outline-variant text-sm text-text-primary dark:text-zinc-100 outline-none 
                                            focus:border-[#c2185b] focus:ring-2 focus:ring-[#c2185b]/20 transition-all custom-date-input"
                                    />
                                </div>
                            )}

                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] font-bold tracking-wider uppercase text-zinc-100 dark:text-zinc-50" htmlFor="country">Country</label>
                                <select
                                    id="country"
                                    required
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-[var(--surface-container)]/40 rounded-xl border border-outline-variant text-sm text-text-primary outline-none focus:border-[#c2185b] focus:ring-2 focus:ring-[#c2185b]/20 transition-all cursor-pointer bg-[#0b0f19]"
                                >
                                    <option value="" disabled className="text-slate-500">Select your country</option>
                                    {DEMOCRATIC_COUNTRIES.map((country) => (
                                        <option key={country} value={country} className="bg-[#0b0f19] text-white">
                                            {country}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold tracking-wider uppercase text-zinc-100 dark:text-zinc-50" htmlFor="password">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full pl-4 pr-12 py-2.5 bg-[var(--surface-container)]/40 rounded-xl border border-outline-variant text-sm text-text-primary outline-none focus:border-[#c2185b] focus:ring-2 focus:ring-[#c2185b]/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-100 dark:text-zinc-400 hover:text-text-primary"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>

                                </div>
                            </div>
                        </div>

                        {/* Stepper Wizard Navigation Controls */}
                        <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/20">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 py-3 border border-outline-variant/40 rounded-xl text-sm font-bold hover:bg-[var(--surface-container)]/30 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-[#c2185b] hover:bg-[#a2123c] text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Continue Setup
                            </button>
                        </div>
                    </form>
                )}

                {/* ================= STEP 3: VERIFICATION (Matched to Screenshot #2) ================= */}
                {currentStep === 3 && (
                    <div className="relative z-10 animate-fadeIn space-y-8 flex flex-col items-center py-4">

                        {/* Status Badge Pill */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c2185b]/10 border border-[#c2185b]/20">
                            <svg className="w-4 h-4 text-[#c2185b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-4A2 2 0 0113.11 4H20a2 2 0 012 2v10a2 2 0 01-2 2H5.26a2 2 0 01-1.22-.42L3 19z" />
                            </svg>
                            <span className="text-[10px] tracking-wider uppercase font-extrabold text-[#c2185b]">Verification email sent</span>
                        </div>

                        {/* Central Mail Icon Box */}
                        <div className="w-24 h-24 rounded-2xl bg-[#1a1f30] border border-outline-variant/20 flex items-center justify-center shadow-lg shadow-black/40">
                            <svg className="w-10 h-10 text-[#c2185b]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                        </div>

                        {/* Informational Text */}
                        <div className="text-center space-y-3">
                            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Almost there!</h1>
                            <p className="text-sm text-zinc-100 dark:text-zinc-50 max-w-sm leading-relaxed">
                                A confirmation link has been sent to{' '}
                                <span className="font-bold text-[#c2185b]">{formData.email || 'santhosh.betha@gmail.com'}</span>.
                                Please check your inbox and click the link to activate your account.
                            </p>
                        </div>

                        {/* Primary Action Button */}
                        <button
                            type="button"
                            className="w-full bg-[#c2185b] hover:bg-[#a2123c] text-white font-extrabold py-3.5 px-6 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-[#c2185b]/10"
                        >
                            Open Mail App
                        </button>

                        {/* Resend and Correction Options */}
                        <div className="space-y-4 pt-2 text-center">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-100 dark:text-zinc-50 hover:text-text-primary transition-colors mx-auto"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15.29M21 12H16" />
                                </svg>
                                Didn't receive the email? Send it again
                            </button>

                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-100 dark:text-zinc-50/70 hover:text-text-primary transition-colors mx-auto"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Wrong email address? Go back
                            </button>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}