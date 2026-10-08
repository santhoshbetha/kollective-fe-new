// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/apiClient';
import { useStore } from '../store/useStore';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/Alert';
import { KollectiveSpinner } from '../components/ui/KollectiveSpinner';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';

export function ForgotPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const theme = useStore((state) => state.theme);
    const toggleTheme = useStore((state) => state.toggleTheme);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertInfo, setAlertInfo] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // 1️⃣ Handle Request Reset Link Submission (POST /api/users/reset_password)
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setAlertInfo(null);

        if (!email.trim()) {
            setAlertInfo({ type: 'error', message: 'Please enter your email address.' });
            return;
        }

        setLoading(true);

        try {
            const data = await apiFetch('/api/users/reset_password', {
                method: 'POST',
                body: JSON.stringify({
                    user: { email: email.trim() }
                })
            });

            setIsSubmitted(true);
            setAlertInfo({
                type: 'success',
                message: data?.message || 'If an account exists with this email, a password reset link has been sent to your inbox.'
            });
        } catch (err) {
            setAlertInfo({
                type: 'error',
                message: err.data?.message || err.message || 'Failed to send password reset request. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    // 2️⃣ Handle Submit New Password (PUT /api/users/reset_password/:token)
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setAlertInfo(null);

        if (!password || !passwordConfirm) {
            setAlertInfo({ type: 'error', message: 'Please enter and confirm your new password.' });
            return;
        }

        if (password.length < 8) {
            setAlertInfo({ type: 'error', message: 'Password must be at least 8 characters long.' });
            return;
        }

        if (password !== passwordConfirm) {
            setAlertInfo({ type: 'error', message: 'Passwords do not match.' });
            return;
        }

        setLoading(true);

        try {
            const data = await apiFetch(`/api/users/reset_password/${token}`, {
                method: 'PUT',
                body: JSON.stringify({
                    user: {
                        password: password,
                        password_confirmation: passwordConfirm
                    }
                })
            });

            setIsSubmitted(true);
            setAlertInfo({
                type: 'success',
                message: data?.message || 'Your password has been reset successfully.'
            });
        } catch (err) {
            setAlertInfo({
                type: 'error',
                message: err.data?.message || err.message || 'The password reset token is invalid or has expired. Please request a new link.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between bg-background text-on-surface overflow-x-hidden isolate">
            {/* Top Navigation Header */}
            <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-transparent border-b border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                        <img src="/Shield&WINGS.png" alt="Kollective Logo" className="h-12 w-auto" />
                        <span
                            className="text-xl font-bold bg-[#CC033B] bg-clip-text text-transparent"
                            style={{ fontFamily: "Protest Riot, sans-serif" }}
                        >
                            Kollective
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full border border-white/10 bg-surface-container/40 text-text-primary hover:bg-surface-container/70 transition-all cursor-pointer"
                        title="Toggle Theme"
                    >
                        <span className="material-symbols-outlined text-lg block">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <Link
                        to="/login"
                        className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </header>

            {/* Main Form Section */}
            <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16 relative">
                {/* Background Decorative Blur Spheres */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#CC033B]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#f8c62c]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 dark:border-white/10 shadow-2xl bg-surface/90 backdrop-blur-xl space-y-6">

                        {/* Title & Icon Header */}
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#CC033B]/10 border border-[#CC033B]/20 text-[#CC033B] mb-1">
                                {token ? <KeyRound className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                                {token ? 'Reset Your Password' : 'Forgot Password?'}
                            </h1>
                            <p className="text-md text-text-secondary font-medium leading-relaxed">
                                {token
                                    ? 'Set a new password to regain access to your account.'
                                    : 'Enter your email address and we will send you a password reset link.'}
                            </p>
                        </div>

                        {/* Alert Banner */}
                        {alertInfo && (
                            <Alert
                                variant={alertInfo.type === 'error' ? 'destructive' : 'default'}
                                onClose={() => setAlertInfo(null)}
                            >
                                <AlertTitle className="flex items-center gap-2">
                                    {alertInfo.type === 'error' ? (
                                        <span className="material-symbols-outlined text-sm">error</span>
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    )}
                                    <span>{alertInfo.type === 'error' ? 'Error' : 'Success'}</span>
                                </AlertTitle>
                                <AlertDescription>{alertInfo.message}</AlertDescription>
                            </Alert>
                        )}

                        {/* Loading State Overlay */}
                        {loading && (
                            <div className="py-8 flex justify-center">
                                <KollectiveSpinner size="md" text={token ? "Updating password..." : "Sending reset email..."} />
                            </div>
                        )}

                        {/* Form State 1: Password Reset Requested Successfully */}
                        {!loading && isSubmitted && !token && (
                            <div className="space-y-6 text-center animate-in fade-in duration-300">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-sm font-medium leading-relaxed">
                                    Check your inbox for a link to reset your password. If it doesn't appear in a few minutes, check your spam folder.
                                </div>
                                <button
                                    onClick={() => { setIsSubmitted(false); setAlertInfo(null); }}
                                    className="text-xs font-semibold text-text-secondary hover:text-text-primary underline cursor-pointer bg-transparent border-none"
                                >
                                    Didn't receive an email? Click here to try again
                                </button>
                                <div className="pt-2">
                                    <Link
                                        to="/login"
                                        className="w-full py-3.5 px-6 rounded-xl font-bold bg-[#CC033B] text-white hover:bg-[#b00233] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#CC033B]/20"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Return to Login
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Form State 2: Password Changed Successfully */}
                        {!loading && isSubmitted && token && (
                            <div className="space-y-6 text-center animate-in fade-in duration-300">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-sm font-medium flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span>Your password has been reset successfully! You can now log in.</span>
                                </div>
                                <div className="pt-2">
                                    <Link
                                        to="/login"
                                        className="w-full py-3.5 px-6 rounded-xl font-bold bg-[#CC033B] text-white hover:bg-[#b00233] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#CC033B]/20"
                                    >
                                        Log In Now
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Form State 3A: Request Link Form (!token) */}
                        {!loading && !isSubmitted && !token && (
                            <form onSubmit={handleRequestReset} className="space-y-5">
                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="email" className="block text-sm font-bold text-text-secondary uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-container/60 border border-white/10 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-[#CC033B] transition-colors font-medium text-md"
                                        />
                                        <Mail className="w-5 h-5 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 px-6 rounded-xl font-bold bg-[#CC033B] text-white hover:bg-[#b00233] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-[#CC033B]/25 cursor-pointer"
                                >
                                    Send Reset Link
                                </button>
                            </form>
                        )}

                        {/* Form State 3B: Set New Password Form (token present) */}
                        {!loading && !isSubmitted && token && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                {/* New Password Input */}
                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="password" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-surface-container/60 border border-white/10 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-[#CC033B] transition-colors font-medium text-sm"
                                        />
                                        <Lock className="w-5 h-5 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm New Password Input */}
                                <div className="space-y-1.5 text-left">
                                    <label htmlFor="passwordConfirm" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="passwordConfirm"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            value={passwordConfirm}
                                            onChange={(e) => setPasswordConfirm(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-surface-container/60 border border-white/10 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-[#CC033B] transition-colors font-medium text-sm"
                                        />
                                        <Lock className="w-5 h-5 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 px-6 rounded-xl font-bold bg-[#CC033B] text-white hover:bg-[#b00233] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-[#CC033B]/25 cursor-pointer"
                                >
                                    Reset Password
                                </button>
                            </form>
                        )}

                        {/* Back to Login Footer Link */}
                        {!isSubmitted && (
                            <div className="pt-2 text-center border-t border-white/5">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1.5 text-md font-semibold text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <ArrowLeft className="w-4.5 h-4.5" />
                                    <span>Back to Login</span>
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

export default ForgotPassword;
