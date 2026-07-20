import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPage = () => {
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
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
                            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">Last Updated: 19 Feb 2026</p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-lg text-text-secondary/90 leading-relaxed space-y-6">
                        <p>
                            Welcome to Kollective ("we," "us," "our"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at <a href="mailto:team@kollective.social" className="text-[#c2185b] hover:underline font-semibold">team@kollective.social</a>.
                        </p>

                        <h2 className="text-lg font-bold text-white uppercase tracking-wider pt-4 border-b border-white/5 pb-2">1. Information We Collect</h2>
                        <p>
                            We may collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and services, participate in activities on the Services, or otherwise when you contact us.
                        </p>
                        <p>
                            The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the features you use. The personal information we collect may include:
                        </p>
                        <ul className="list-disc pl-6 space-y-1.5">
                            <li>Username and Display Name</li>
                            <li>Email address</li>
                            <li>Account passwords (stored securely via cryptographic hashing)</li>
                            <li>Identity credentials (such as verification proof uploaded for basic roles like citizen or organization onboarding)</li>
                            {/* Political-related features temporarily commented out
                            <li>Location bounds or municipal coordinates (for localized voting ledger bounds)</li>
                            */}
                        </ul>

                        <h2 className="text-lg font-bold text-white uppercase tracking-wider pt-4 border-b border-white/5 pb-2">2. How We Use Your Information</h2>
                        <p>
                            We use personal information collected via our Services for standard coordination and system operations:
                        </p>
                        <ul className="list-disc pl-6 space-y-1.5">
                            <li>To facilitate account creation and user authentication.</li>
                            <li>To manage user credentials and verification statuses.</li>
                            {/* Political-related uses temporarily commented out
                            <li>To construct the decentralized consensus parameters (such as verifying voter eligibility in municipal precincts).</li>
                            <li>To process and log decentralized video evidence or peer endorsement ledger updates.</li>
                            */}
                        </ul>

                        <h2 className="text-lg font-bold text-white uppercase tracking-wider pt-4 border-b border-white/5 pb-2">3. Sharing of Your Information</h2>
                        <p>
                            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill platform security obligations. Personal email details and raw documents uploaded for onboarding verification are strictly private and restricted.
                        </p>

                        <h2 className="text-lg font-bold text-white uppercase tracking-wider pt-4 border-b border-white/5 pb-2">4. Data Security</h2>
                        <p>
                            We aim to protect your personal information through a system of organizational and technical security measures. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Once your account is created, you are responsible for keeping your password confidential.
                        </p>

                        <h2 className="text-lg font-bold text-white uppercase tracking-wider pt-4 border-b border-white/5 pb-2">5. Privacy Rights</h2>
                        <p>
                            You have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time. For users within the European Economic Area (EEA), EU, or local regions, we process information in compliance with GDPR.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};
