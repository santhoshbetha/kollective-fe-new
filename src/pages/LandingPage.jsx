// src/pages/LandingPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
    AtSign,
    Home, Globe,
    Shield,
    Code,
    Terminal,
    Award,
    Calendar,
    HelpCircle,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/auth/useAuthStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogFooter
} from '../components/ui/Dialog';
import { cn } from '../lib/utils';

export const LandingPage = () => {
    const navigate = useNavigate();
    const theme = useStore((s) => s.theme);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLight = theme === 'light';
    const [activeFaq, setActiveFaq] = useState(null);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

    const handleVoiceInClick = () => {
        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
        } else {
            navigate('/home');
        }
    };

    const faqs = [
        {
            q: 'What is Kollective?',
            a: 'Kollective is a community-driven social network built for working people, independent journalists, and economists. It is a platform dedicated to highlighting everyday grassroots realities alongside expert analysis, free from corporate censorship.'
        },
        {
            q: 'How do I get started?',
            a: 'Simply click "Join the Kollective" to set up your account. From there, you can browse the feed, share your perspective on local issues, or read deep-dive analyses from verified professionals immediately.'
        },
        {
            q: 'What types of content can I share?',
            a: 'You can publish standard Posts to share your everyday experiences, images, or links. You can broadcast urgent Voice Posts instantly to highlight pressing issues or live happenings around you or in the world.'
        },
        {
            q: 'Is Kollective free to use?',
            a: 'Yes, Kollective is completely free to use. We operate on principles of community support and independent media, ensuring that the platform remains accessible to every working-class voice.'
        },
        {
            q: 'How do I control who sees my content?',
            a: 'When posting, you can choose your visibility. You can share Globally to reach the entire platform, or limit your post to your specific Local Community feed to connect directly with nearby neighbors and organizers.'
        }
    ];

    return (
        <div className="bg-background text-on-surface font-body-md antialiased min-h-screen selection:bg-primary-container selection:text-white flex flex-col text-left">
            {/* Top Navigation Bar */}
            <nav className="w-full sticky top-0 z-50 backdrop-blur-xl dark:bg-[#090d12]/80 bg-white/80 border-b dark:border-white/10 border-black/5 shadow-sm px-4 sm:px-10 md:px-20 select-none">
                <div className="max-w-[1280px] mx-auto flex justify-between items-center h-20">
                    <div className="flex items-center gap-2">
                        <img src="/Shield&WINGS.png" alt="Kollective Logo" className="h-14 w-14 object-contain" />
                        <span className="text-xl font-bold inline-block bg-[#CC033B] bg-clip-text text-transparent"
                            style={{ fontSize: "36px", fontFamily: "Protest Riot, sans-serif" }}>
                            Kollective
                        </span>
                    </div>

                    {/* Navigation Action Anchors */}
                    <div className="flex items-center gap-2 font-sans">
                        <Link to="/home">
                            <Button variant="ghost" className="gap-2 font-bold text-xs uppercase tracking-wider">
                                <Home className="h-4 w-4 text-primary-container" />
                                <span className="hidden sm:inline">Home</span>
                            </Button>
                        </Link>
                        <Button variant="ghost" onClick={handleVoiceInClick} className="font-bold text-xs uppercase tracking-wider text-text-primary">
                            Voice in
                        </Button>
                        <Link to="/create-account">
                            <Button variant="default" className="bg-primary-container hover:opacity-90 text-white px-6 font-bold text-xs uppercase tracking-wider shadow-md">
                                Join
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content Viewport Canvas */}
            <main className="flex-1 w-full relative">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48 w-full border-b dark:border-white/5 border-black/5">
                    <div className={cn("absolute inset-0 z-0 pointer-events-none select-none", isLight ? 'opacity-50' : 'opacity-30')}>
                        <img
                            alt="Collective Power Graphic"
                            className="w-full h-full object-cover"
                            // 🚀 THE ORB SECURITY FIX: Embedded an elegant vector canvas string to completely stop external loading blocks
                            src={!isLight ? "/people-light-bg.png" : "/people-dark-bg.png"}
                        //src={"/people-light-bg.png"}
                        />
                        <div className={cn("absolute inset-0 bg-gradient-to-b via-transparent to-background", isLight ? 'from-background/10' : 'from-background')}></div>
                    </div>

                    <div className="max-w-[1280px] mx-auto px-6 md:px-12 relative z-10 text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 ${isLight ? 'bg-primary text-on-primary border border-primary shadow-sm shadow-primary/20' : 'bg-surface-crimson-low border border-primary-container/30'}`}>
                            <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-on-primary' : 'bg-secondary'}`}></span>
                            <span className={`font-label-sm uppercase tracking-widest text-lg font-bold ${isLight ? 'text-on-primary' : 'text-secondary'}`}>
                                The Voice of the People
                            </span>
                            <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-on-primary' : 'bg-secondary'}`}></span>
                        </div>
                        <div className={cn(
                            "inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 font-mono text-xs uppercase tracking-widest font-bold select-none",
                            isLight ? 'bg-primary-container text-white border border-primary-container shadow-sm' : 'bg-surface-crimson-low border border-primary-container/30'
                        )} hidden>
                            <span className={cn("w-2 h-2 rounded-full animate-pulse", isLight ? 'bg-white' : 'bg-amber-400')}></span>

                            <span className={isLight ? 'text-white text-lg' : 'text-amber-400 text-lg'}>
                                The Voice of the People
                            </span>
                            <span className={cn("w-2 h-2 rounded-full animate-pulse", isLight ? 'bg-white' : 'bg-amber-400')}></span>
                        </div>

                        <h1 className="font-display-lg text-5xl md:text-8xl dark:text-white text-bg-surface mb-6 leading-none max-w-5xl mx-auto tracking-tighter font-black select-none"
                            style={{ fontFamily: "Protest Riot, sans-serif" }}>
                            Kollective.Social
                            <br />
                            <span className="dark:text-primary-container text-primary text-2xl md:text-5xl block mt-4 font-sans font-black tracking-tight uppercase">
                                Of the people, for the people
                            </span>
                        </h1>


                        <p className="font-body-lg dark:text-on-surface-variant text-on-surface font-medium mb-12 max-w-3xl mx-auto leading-relaxed text-xl dark:bg-transparent bg-white/40 dark:backdrop-blur-none backdrop-blur-md dark:border-transparent border border-white/20 p-6 sm:p-8 rounded-2xl dark:shadow-none shadow-sm font-sans">
                            If 'X', 'Threads' and 'Truth' feel like someone's private property and decentralized apps leave us disconnected, <strong className="font-black dark:text-white text-primary">Kollective</strong> is where we stand united to reclaim our <span className={cn("font-black tracking-wide underline underline-offset-4 decoration-2", isLight ? 'text-primary-container decoration-primary-container' : 'text-amber-400 decoration-amber-400')}>"Voice"</span>—because we are <span className="text-primary-container font-extrabold">stronger together</span>.
                        </p>

                        <div className="mt-4 text-center select-none font-sans">
                            <button
                                type="button"
                                onClick={() => navigate('/create-account')}
                                className="px-10 py-4.5 text-xl font-black bg-amber-400 hover:bg-amber-500 text-black rounded-full transition-all active:scale-95 shadow-xl shadow-amber-500/10 cursor-pointer border-none uppercase tracking-wider tracking-tight"
                            >
                                Join the Kollective
                            </button>
                        </div>
                    </div>
                </section>
                {/* Pillars / Features Bento Grid */}
                <section className="py-24 dark:bg-[#090d12] bg-[#f8fafc] border-b dark:border-white/5 border-black/5 w-full">
                    <div className="max-w-[1280px] mx-auto px-6 md:px-12">
                        <div className="text-center mb-16 select-none">
                            <h2 className="font-display-lg text-4xl md:text-6xl dark:text-primary-container text-primary font-black tracking-tight uppercase">
                                The Foundation of Collective Power
                            </h2>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 font-sans">
                            {/* Card 1: Setup */}
                            <div className="p-8 dark:bg-[#111823] bg-white border dark:border-white/10 border-black/5 shadow-sm rounded-2xl hover:border-primary-container/30 transition-all text-left" id="profile-setup">
                                <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center mb-6 select-none">
                                    <span className="material-symbols-outlined text-primary-container font-black">badge</span>
                                </div>
                                <h3 className="text-on-surface dark:text-white mb-3 font-black text-xl tracking-tight">
                                    Choose your lens
                                </h3>
                                <p className="text-text-secondary text-base font-semibold leading-relaxed">
                                    Register as an individual or an organization. Highlight your background as a citizen, journalist, or economist.
                                </p>
                            </div>

                            {/* Card 2: Voice Posts */}
                            <div className="p-8 dark:bg-[#111823] bg-white border dark:border-white/10 border-black/5 shadow-sm rounded-2xl hover:border-primary-container/40 transition-all cursor-pointer group text-left" id="urgent-voice-posts">
                                <div className="w-12 h-12 dark:bg-primary-container/10 bg-primary-container/10 rounded-xl flex items-center justify-center mb-6 border border-transparent group-hover:bg-primary-container transition-colors select-none">
                                    <span className="material-symbols-outlined text-primary-container group-hover:text-white font-black">campaign</span>
                                </div>
                                <h3 className="text-on-surface dark:text-white mb-3 font-black text-xl tracking-tight group-hover:text-primary-container transition-colors">
                                    Broadcast a Voice Post
                                </h3>
                                <p className="text-text-secondary text-base font-semibold leading-relaxed">
                                    Flag pressing local issues and live happenings immediately. Get urgent realities noticed by your community.
                                </p>
                            </div>

                            {/* Card 3: Standard Posts & Target Feeds */}
                            <div className="p-8 dark:bg-[#111823] bg-white border dark:border-white/10 border-black/5 shadow-sm rounded-2xl hover:border-primary-container/40 transition-all cursor-pointer group text-left" id="targeted-sharing">
                                <div className="w-12 h-12 dark:bg-primary-container/10 bg-primary-container/10 rounded-xl flex items-center justify-center mb-6 border border-transparent group-hover:bg-primary-container transition-colors select-none">
                                    <span className="material-symbols-outlined text-primary-container group-hover:text-white font-black">travel_explore</span>
                                </div>
                                <h3 className="text-on-surface dark:text-white mb-3 font-black text-xl tracking-tight group-hover:text-primary-container transition-colors">
                                    Share standard updates
                                </h3>
                                <p className="text-text-secondary text-base font-semibold leading-relaxed">
                                    Post daily experiences, images, or media links. Target your audience locally or broadcast globally.
                                </p>
                            </div>

                            {/* Card 4: Discovery Grid */}
                            <div className="p-8 dark:bg-[#111823] bg-white border dark:border-white/10 border-black/5 shadow-sm rounded-2xl hover:border-primary-container/40 transition-all cursor-pointer group text-left" id="discover-analysis">
                                <div className="w-12 h-12 dark:bg-primary-container/10 bg-primary-container/10 rounded-xl flex items-center justify-center mb-6 border border-transparent group-hover:bg-primary-container transition-colors select-none">
                                    <span className="material-symbols-outlined text-primary-container group-hover:text-white font-black">analytics</span>
                                </div>
                                <h3 className="text-on-surface dark:text-white mb-3 font-black text-xl tracking-tight group-hover:text-primary-container transition-colors">
                                    Discover deep analysis
                                </h3>
                                <p className="text-text-secondary text-base font-semibold leading-relaxed">
                                    Follow working-class stories, look through nearby regional feeds, and read verified data from economists.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="py-24 dark:bg-transparent bg-white w-full font-sans">
                    <div className="max-w-[1280px] mx-auto px-6 md:px-12">
                        <div className="dark:bg-[#111823] bg-[#f1f5f9] rounded-[32px] p-12 md:p-20 text-center border dark:border-white/10 border-black/5 relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-64 h-64 dark:bg-primary-container/10 bg-primary-container/5 blur-[100px] rounded-full pointer-events-none"></div>
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 dark:bg-amber-500/10 bg-primary-container/5 blur-[100px] rounded-full pointer-events-none"></div>

                            <h2 className="dark:text-white text-on-surface mb-6 relative z-10 text-4xl md:text-6xl font-black tracking-tighter uppercase select-none">
                                Ready to take back your voice?
                            </h2>
                            <p className="text-text-secondary font-medium mb-12 max-w-2xl mx-auto relative z-10 text-lg sm:text-xl leading-relaxed">
                                Be part of the foundation. Join the new wave of social interaction built for everyday people and real community voices.
                            </p>
                            <div className="relative z-10 select-none">
                                <button
                                    type="button"
                                    onClick={() => navigate('/home')}
                                    className="px-12 py-5 bg-primary-container text-white rounded-full font-bold glow-button hover:opacity-95 transition-all active:scale-95 shadow-2xl dark:shadow-primary-container/30 shadow-primary-container/20 uppercase text-sm tracking-wider cursor-pointer border-none"
                                >
                                    Join the Kollective Today
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                {/* FAQ Section Accordion List */}
                <section className="py-24 bg-background w-full">
                    <div className="max-w-[1280px] mx-auto px-6 md:px-12">
                        <div className="text-center mb-16 select-none font-sans">
                            <h2 className="dark:text-primary-container text-primary mb-3 font-black text-4xl uppercase tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-text-secondary text-lg font-medium">
                                Everything you need to know about the platform structure
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-4 font-sans text-left">
                            {faqs.map((faq, index) => {
                                const isOpen = activeFaq === index;
                                return (
                                    <div
                                        key={`faq-row-${index}`}
                                        onClick={() => setActiveFaq(isOpen ? null : index)}
                                        className="dark:bg-[#111823] bg-white border dark:border-white/10 border-black/5 rounded-2xl p-6 dark:hover:border-primary-container/30 hover:border-primary-container/30 transition-all cursor-pointer group shadow-sm"
                                    >
                                        <div className="flex justify-between items-center select-none">
                                            <h3 className="dark:text-white text-on-surface font-extrabold text-lg pr-4 tracking-tight">{faq.q}</h3>
                                            <span className="material-symbols-outlined text-text-secondary dark:group-hover:text-primary-container group-hover:text-primary-container transition-colors font-bold">
                                                {isOpen ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </div>
                                        {isOpen && (
                                            <p className="mt-4 text-text-secondary text-base sm:text-lg leading-relaxed border-t dark:border-white/5 border-black/5 pt-4 animate-in fade-in duration-200">
                                                {faq.a}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer System Container */}
            <footer className="w-full py-16 dark:bg-[#0b0f16] bg-white border-t dark:border-white/10 border-black/5 font-sans select-none">
                <div className="max-w-[1280px] mx-auto px-6 md:px-12">
                    {/* Top Section Layout Rows */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16 text-left">
                        <div className="col-span-2 space-y-4">
                            <div className="text-2xl font-black tracking-tighter dark:text-primary-container text-primary uppercase">
                                Kollective
                            </div>
                            <p className="text-sm font-semibold text-text-secondary leading-relaxed pr-6 max-w-sm">
                                Building the foundation for a truly sovereign and decentralized digital society.
                            </p>
                        </div>

                        {/* Column links platforms */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black tracking-widest uppercase text-text-primary">Platform</h4>
                            <ul className="space-y-3 text-sm font-bold">
                                <li><Link to="/home" className="text-text-secondary hover:text-primary-container transition-colors">Sovereign Voice Protocols</Link></li>
                                <li><Link to="/home" className="text-text-secondary hover:text-primary-container transition-colors">Geographic Nodes</Link></li>
                                <li><Link to="/home" className="text-text-secondary hover:text-primary-container transition-colors">Democratic Governance</Link></li>
                            </ul>
                        </div>

                        {/* Column links resources */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black tracking-widest uppercase text-text-primary">Resources</h4>
                            <ul className="space-y-3 text-sm font-bold">
                                <li><Link to="/home" className="text-text-secondary hover:text-primary-container transition-colors">Documentation</Link></li>
                                <li><Link to="/home" className="text-text-secondary hover:text-primary-container transition-colors">Security Metrics</Link></li>
                                <li><Link to="/home" className="text-text-secondary hover:text-primary-container transition-colors">Whitepaper</Link></li>
                            </ul>
                        </div>

                        {/* Column links legals */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black tracking-widest uppercase text-text-primary">Legal Matrix</h4>
                            <ul className="space-y-3 text-sm font-bold">
                                <li><Link to="/privacy" className="text-text-secondary hover:text-primary-container transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="text-text-secondary hover:text-primary-container transition-colors">Terms of Service</Link></li>
                                <li><Link to="/contact" className="text-text-secondary hover:text-primary-container transition-colors">Contact Node</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Copyright line and media vector networks row links */}
                    <div className="pt-8 border-t dark:border-white/10 border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-text-secondary">
                        <div>
                            © {new Date().getFullYear()} Kollective. Built for the Sovereign Voice. All rights reserved.
                        </div>
                        <div className="flex items-center gap-5">
                            <Link to="/home" className="text-text-secondary hover:text-primary-container transition-colors p-1.5 hover:bg-white/5 rounded-lg" aria-label="Global network layer">
                                <Globe className="w-4 h-4" />
                            </Link>
                            <Link to="/home" className="text-text-secondary hover:text-primary-container transition-colors p-1.5 hover:bg-white/5 rounded-lg" aria-label="Federated handling address mail">
                                <AtSign className="w-4 h-4" />
                            </Link>
                            <Link to="/home" className="text-text-secondary hover:text-primary-container transition-colors p-1.5 hover:bg-white/5 rounded-lg" aria-label="Source context matrix core">
                                <Code className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
            {/* 🔒 Unauthenticated Log in Prompt Modal */}
            {
                isLoginPromptOpen && (
                    <Dialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
                        <DialogContent className="max-w-[420px] bg-[#141414] text-white border border-white/10 rounded-2xl p-6 shadow-2xl font-sans">
                            <DialogHeader className="border-b border-white/10 pb-4 p-0 bg-transparent flex flex-row items-center justify-between">
                                <DialogTitle className="text-xl font-extrabold dark:text-white text-black flex items-center gap-2 tracking-tight select-none">
                                    <span className="material-symbols-outlined text-primary-container text-2xl font-black">lock</span>
                                    Log in Required
                                </DialogTitle>
                            </DialogHeader>

                            <div className="py-6 space-y-2 text-left">
                                <p className="text-text-primary text-lg font-bold leading-snug">
                                    Please log in to broadcast a post.
                                </p>
                                <p className="text-text-secondary text-[16px] font-semibold leading-relaxed">
                                    Voices and strategic alerts require a valid profile node session signature to be indexed on the main tactical feeds.
                                </p>
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5 p-0 select-none">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLoginPromptOpen(false);
                                        navigate('/login');
                                    }}
                                    className="w-full py-3 bg-primary-container hover:bg-primary-container/90 text-white font-bold rounded-xl shadow-lg shadow-primary-container/20 transition-all cursor-pointer text-xs uppercase tracking-wider border-none outline-none font-sans"
                                >
                                    Log in
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsLoginPromptOpen(false)}
                                    className="w-full py-3 dark:bg-[#222] hover:bg-white/10 text-text-secondary hover:text-white font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider border border-white/5 outline-none font-sans"
                                >
                                    Cancel
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )
            }
        </div >
    );
};
