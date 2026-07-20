import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/Alert';

export const LoginPage = () => {
    const navigate = useNavigate();
    const theme = useStore((state) => state.theme);
    const toggleTheme = useStore((state) => state.toggleTheme);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [alertInfo, setAlertInfo] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setAlertInfo(null);
        if (!email.trim() || !password.trim()) {
            setAlertInfo({ type: 'error', message: 'Please fill in all fields.' });
            return;
        }
        // Navigate to platform home base
        navigate('/home');
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        setAlertInfo({ type: 'success', message: 'Password recovery link sent.' });
    };

    return (
        <div className="min-h-screen flex flex-col justify-between bg-background text-on-surface overflow-x-hidden isolate">

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

                <nav className="flex items-center gap-6" hidden>
                    <Link to="/" className="text-sm font-semibold text-on-surface-variant hover:text-[#c2185b] transition-colors">
                        Manifesto
                    </Link>
                    <button
                        onClick={toggleTheme}
                        className="text-on-surface-variant hover:text-[#c2185b] transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer"
                        aria-label="Toggle display mode theme"
                    >
                        <span className="material-symbols-outlined text-[22px]">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                </nav>
            </header>

            {/* Main Focus Area */}
            <main className="flex-grow flex items-center justify-center relative py-24 px-6">
                {/* Background Ambient Decorative Lights */}
                <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-[#c2185b]/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-full max-w-md z-10 mt-8">
                    {/* Main Panel Card Wrapper */}
                    <div className="glass-panel rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-[#c2185b]/5">

                        {/* Header Text Block */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-primary mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-sm text-on-surface-variant">
                                Log in and share your voice
                            </p>
                        </div>

                        {alertInfo && (
                            <Alert
                                variant={alertInfo?.type === 'error' ? 'destructive' : 'default'}
                                className="mb-6"
                                onClose={() => setAlertInfo(null)}
                            >
                                <span className="material-symbols-outlined">
                                    {alertInfo?.type === 'error' ? 'error' : 'check_circle'}
                                </span>
                                <AlertTitle>
                                    {alertInfo?.type === 'error' ? 'Error' : 'Success'}
                                </AlertTitle>
                                <AlertDescription>{alertInfo?.message}</AlertDescription>
                            </Alert>
                        )}

                        {/* Credential Access Form */}
                        <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>

                            {/* Email Address Block */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="email">
                                    <svg className="w-4 h-4 text-on-surface-variant/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002 2H5a2 2 0 00-2-2zm0 0V6a2 2 0 012-2h10a2 2 0 012 2v13H5z" />
                                    </svg>
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--surface-container)]/40 rounded-xl border border-outline-variant text-text-primary placeholder:text-on-surface-variant/40 outline-none transition-all duration-200 focus:border-[#c2185b] focus:ring-4 focus:ring-[#c2185b]/10"
                                />
                            </div>

                            {/* Password Verification Block */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="password">
                                    <svg className="w-4 h-4 text-on-surface-variant/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-4 pr-12 py-3 bg-[var(--surface-container)]/40 rounded-xl border border-outline-variant text-text-primary placeholder:text-on-surface-variant/40 outline-none transition-all duration-200 focus:border-[#c2185b] focus:ring-4 focus:ring-[#c2185b]/10"
                                    />

                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant/60 hover:text-text-primary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {!showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Form Options Settings Row */}
                            <div className="flex items-center justify-between text-sm py-1">
                                <label className="flex items-center gap-2.5 cursor-pointer group select-none text-on-surface-variant hover:text-text-primary transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-outline-variant bg-[var(--surface-container)]/40 text-[#c2185b] accent-[#c2185b]"
                                    />
                                    Remember me
                                </label>
                                <a
                                    href="#forgot"
                                    onClick={handleForgotPassword}
                                    className="font-bold text-[#c2185b] hover:underline transition-colors focus:outline-none"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            {/* Action Call Button */}
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-[#c2185b] hover:bg-[#a2123c] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#c2185b]/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
                            >
                                Log In
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </form>

                        {/* Alternating Form Redirect Link */}
                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-sm text-on-surface-variant">
                                Don't have an account?
                                <Link className="text-[#c2185b] font-bold hover:underline ml-1" to="/create-account">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Interface Footer Segment */}
            <footer className="w-full py-6 border-t border-white/5 bg-[var(--surface-container)]/20 relative z-10 backdrop-blur-md">
                <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 gap-4 w-full mx-auto">
                    <div className="flex items-center gap-3 text-xs font-semibold text-on-surface-variant/70">
                        <img alt="Identity Badge" className="h-5 w-auto opacity-40" src="/K99.png" />
                        <span>© {new Date().getFullYear()} Kollective. The Revolution is Digital.</span>
                    </div>
                    <div className="flex gap-6 text-xs font-bold text-on-surface-variant/70">
                        <Link className="hover:text-[#c2185b] transition-colors" to="/terms">Terms</Link>
                        <Link className="hover:text-[#c2185b] transition-colors" to="/privacy">Privacy</Link>
                        <a className="hover:text-[#c2185b] transition-colors" href="#contact" onClick={(e) => { e.preventDefault(); alert('For support, please contact team@kollective.social'); }}>Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};