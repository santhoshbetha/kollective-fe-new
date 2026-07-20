import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0b0f19] text-text-primary font-sans relative pb-20">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-container/5 blur-[120px] -z-10 rounded-full animate-pulse duration-[8000ms]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-container/5 blur-[100px] -z-10 rounded-full animate-pulse duration-[10000ms]" />

            <header className="max-w-[1000px] mx-auto px-6 pt-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-text-secondary hover:text-[#c2185b] transition-colors font-bold text-xs uppercase tracking-wider border-none bg-transparent cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </header>

            <main className="max-w-[1000px] mx-auto px-6 mt-8 animate-in fade-in duration-300">
                <div className="glass-panel border border-white/5 bg-[var(--surface-container)]/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                        <div className="p-3 bg-[#c2185b]/10 text-[#c2185b] rounded-2xl">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Terms of Service</h1>
                            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">Last Updated: 21 July 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-lg text-text-secondary/90 leading-relaxed space-y-6">
                        <p>
                            Welcome to Kollective, a digital platform designed to streamline community coordination and local consensus activities. By accessing or using our website, services, and applications (collectively, the “Services”), you agree to be bound by these Terms of Service (“Terms”).
                        </p>

                        <h2 className="text-lg font-bold text-white uppercase tracking-wider pt-4 border-b border-white/5 pb-2">1. Acceptance of Terms</h2>
                        <p>
                            By creating an account, accessing, or using the Services, you signify your agreement to these Terms. If you do not agree to these Terms, you may not access or use the Services. Kollective reserves the right to modify or replace these Terms at any time at its sole discretion.
                        </p>

                        <h2 className="text-lg font-bold text-white uppercase tracking-wider pt-4 border-b border-white/5 pb-2">2. Use of Services</h2>
                        <p>
                            <strong>a. Eligibility:</strong> You must be at least 16 years old to use the Services. By agreeing to these Terms, you represent and warrant that you are of legal age to form a binding contract.
                        </p>
                        <p>
                            <strong>b. Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and password.
                        </p>
                        <p>
                            <strong>c. Acceptable Conduct:</strong> You agree not to use the Services for any unlawful purposes, automated bot actions, sybil manipulation, or in ways that disrupt the system feed integrity.
                        </p>

                        <h2 className="text-lg font-bold text-white uppercase tracking-wider pt-4 border-b border-white/5 pb-2">3. Content & Trust Framework</h2>
                        <p>
                            <strong>a. User Content:</strong> You retain ownership of content you post to the feed, local forums, or project updates. However, you are solely responsible for ensuring it does not violate local statutes or zero-tolerance parameters (e.g. hate speech, spam, fake credentials).
                            <br />
                            {/* Verification roles and badges commented out for initial launch
                            <strong>b. Verification Roles:</strong> Standard users can request upgraded validation badges (such as Journalist Teal, Activist Red, or Scholar Emerald). Abuse of these roles, such as providing false press credentials, will lead to immediate badge suspension by the vetting panels.
                            */}
                        </p>

                        <h2 className="text-lg font-bold text-white uppercase tracking-wider pt-4 border-b border-white/5 pb-2">4. Disclaimers & Liability</h2>
                        <p>
                            The Services are provided "as is" and "as available". We do not warrant that the Services will be uninterrupted or error-free. To the maximum extent permitted by law, Kollective is not liable for direct, indirect, or incidental damages resulting from your use of the platform.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};
