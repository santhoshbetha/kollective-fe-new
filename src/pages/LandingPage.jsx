import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { AtSign, Home } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Globe, Shield, Code, Terminal } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useStore((s) => s.theme);
  const isLight = theme === 'light';
  const [activeFaq, setActiveFaq] = useState(null);

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
      a: 'You can publish standard Posts to share your everyday experiences, images, or links. You can broadcast urgent Voice Posts to instantly to highlight pressing issues or live happenings around you or in the world.'
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
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen selection:bg-primary-container selection:text-white flex flex-col">
      {/* Top Navigation */}
      <nav className="w-full sticky top-0 z-50 backdrop-blur-xl dark:bg-background/80 bg-white/80 border-b dark:border-white/10 border-black/5 shadow-sm">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center h-20">
          <div className="flex items-center gap-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-container crimson-glow" hidden>
              <span className="material-symbols-outlined text-white text-xl">
                shield
              </span>
            </div>
            <span className="text-headline-md-mobile md:text-headline-md tracking-tighter text-[#e00000]" hidden
              style={{ fontSize: "36px", fontFamily: "Protest Riot, sans-serif" }}>
              Kollective
            </span>
            <img src="/K99.png" alt="Kollective Logo" className="h-14 w-16" />
            <span className="text-xl font-bold sm:inline-block  bg-[#CC033B] bg-clip-text text-transparent"
              style={{ fontSize: "36px", fontFamily: "Protest Riot, sans-serif" }}>
              Kollective
            </span>
          </div>
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Link to="/home">
              <Button variant="ghost" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost">Voice in</Button>
            </Link>
            <Link to="/create-account">
              <Button variant="default">Join</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
          <div className={`absolute inset-0 z-0 pointer-events-none ${isLight ? 'opacity-60' : 'opacity-40'}`}>
            <img
              alt="Collective Power Graphic"
              className="w-full h-full object-cover"
              src={isLight ? "/people-light-bg.png" : "https://lh3.googleusercontent.com/aida-public/AB6AXuCbfuCCX9ANj5aS3FTr6VTAA7qmIt4GfyCIS6z-38Y0ZdWRN6T5i8AJLclKnIzR-CbRryltONJwwMjntaRAFNe0VPDyxhWFmkCqGgn06o4B4jlmD6URq69XFy3IEcm1e-U9Xik-Lo71q1p3CMPPCjuA3AttZCdvRDyVXE3xkBuuAF-fxJNUG035UBbe7yX6VAL7B0lKhBcE6i-FaVa2Mgfm29wuTYA-FO2FarEjU06xp6UsMTkiUnvwfeyS3Yu4yuZev9HKxlwL-j4"}
            />
            <div className={`absolute inset-0 bg-gradient-to-b ${isLight ? 'from-background/20' : 'from-background'} via-transparent to-background`}></div>
          </div>
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 ${isLight ? 'bg-primary text-on-primary border border-primary shadow-sm shadow-primary/20' : 'bg-surface-crimson-low border border-primary-container/30'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-on-primary' : 'bg-secondary'}`}></span>
              <span className={`font-label-sm uppercase tracking-widest text-lg font-bold ${isLight ? 'text-on-primary' : 'text-secondary'}`}>
                The Voice of the People
              </span>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? 'bg-on-primary' : 'bg-secondary'}`}></span>
            </div>
            <h1 className="font-display-lg text-5xl md:text-8xl dark:text-white text-on-surface mb-6 leading-tight max-w-4xl mx-auto 
               tracking-tighter font-extrabold"
              style={{ fontFamily: "Protest Riot, sans-serif", lineHeight: "0.9" }}>
              Kollective.Social
              <br />
              <span className="dark:text-primary-container text-primary text-3xl md:text-5xl block mt-4 font-extrabold tracking-tight">
                Of the people, for the people
              </span>
            </h1>
            <p className="font-body-lg dark:text-on-surface-variant text-on-surface font-semibold mb-12 max-w-2xl mx-auto leading-relaxed text-xl dark:bg-transparent bg-white/30 dark:backdrop-blur-none backdrop-blur-sm dark:border-transparent border border-white/30 dark:p-0 p-6 rounded-card dark:shadow-none shadow-sm">
              If 'X', 'Threads' and 'Truth' feel like someone's private property and decentralized apps leave us disconnected, <strong className="font-extrabold text-white">Kollective</strong> is where we stand united to reclaim our <span className={`${isLight ? 'text-primary font-extrabold underline decoration-primary decoration-2 underline-offset-4' : 'text-secondary'}`} style={{ fontWeight: isLight ? 800 : 700 }}>"Voice"</span>—because we are <span className={`${isLight ? 'text-primary' : 'text-secondary'} font-bold`}>stronger together</span>.
            </p>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/create-account')}
                className="px-8 py-4 !text-xl !bold !transition-all !duration-300 !transform !hover:scale-105 !shadow-lg !bg-secondary
                            dark:text-on-secondary !hover:bg-secondary/90 !dark:shadow-secondary/20 !cursor-pointer !rounded-full"
              >
                Join the Kollective
              </button>
            </div>
          </div>
        </section>

        {/* Pillars / Features Bento Grid */}
        <section className="py-24 dark:bg-surface-ink border-0 dark:border-white/5 border-black/5">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-4xl md:text-6xl dark:text-white text-on-surface mb-4 dark:text-primary-container text-primary font-extrabold tracking-tight">
                The Foundation of Collective Power {/*Built for Working Voices & Expert Insights*/}
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Card 1: Setup */}
              <div className="p-8 dark:bg-surface-container bg-white border border-black/5 shadow-sm rounded-card hover:border-primary/30 transition-all"
                id="profile-setup">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary">badge</span>
                </div>
                <h3 className="font-headline-md text-on-surface dark:text-white mb-4 font-bold text-xl">
                  Choose your lens
                </h3>
                <p className="text-on-surface-variant font-body-md text-lg font-semibold">
                  Register as an individual or an organization. Highlight your background as a citizen, journalist, or economist.
                </p>
              </div>

              {/* Card 2: Voice Posts */}
              <div className="p-8 dark:bg-surface-container bg-white/70 backdrop-blur-[12px] border dark:border-white/5 border-black/5 shadow-sm rounded-card dark:hover:border-primary-container/30 hover:border-primary/30 transition-all cursor-pointer group" id="urgent-voice-posts">
                <div className="w-12 h-12 dark:bg-primary-container/10 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border dark:border-primary-container/20 border-transparent group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined dark:text-primary-container text-primary group-hover:text-white">campaign</span>
                </div>
                <h3 className="font-headline-md text-on-surface dark:text-white mb-4 font-bold text-xl">
                  Broadcast a Voice Post
                </h3>
                <p className="text-on-surface-variant font-body-md text-lg font-semibold">
                  Flag pressing local issues and live happenings immediately. Get urgent realities noticed by your community.
                </p>
              </div>

              {/* Card 3: Standard Posts & Target Feeds */}
              <div className="p-8 dark:bg-surface-container bg-white/70 backdrop-blur-[12px] border dark:border-white/5 border-black/5 shadow-sm rounded-card dark:hover:border-primary-container/30 hover:border-primary/30 transition-all cursor-pointer group" id="targeted-sharing">
                <div className="w-12 h-12 dark:bg-primary-container/10 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border dark:border-primary-container/20 border-transparent group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined dark:text-primary-container text-primary group-hover:text-white">travel_explore</span>
                </div>
                <h3 className="font-headline-md text-on-surface dark:text-white mb-4 font-bold text-xl">
                  Share standard updates
                </h3>
                <p className="text-on-surface-variant font-body-md text-lg font-semibold">
                  Post daily experiences, images, or media links. Target your audience locally or broadcast globally.
                </p>
              </div>

              {/* Card 4: Discovery Grid */}
              <div className="p-8 dark:bg-surface-container bg-white/70 backdrop-blur-[12px] border dark:border-white/5 border-black/5 shadow-sm rounded-card dark:hover:border-primary-container/30 hover:border-primary/30 transition-all cursor-pointer group" id="discover-analysis">
                <div className="w-12 h-12 dark:bg-primary-container/10 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border dark:border-primary-container/20 border-transparent group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined dark:text-primary-container text-primary group-hover:text-white">analytics</span>
                </div>
                <h3 className="font-headline-md text-on-surface dark:text-white mb-4 font-bold text-xl">
                  Discover deep analysis
                </h3>
                <p className="text-on-surface-variant font-body-md text-lg font-semibold">
                  Follow working-class stories, look through nearby regional feeds, and read verified data from economists.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Banner */}
        <section className="py-24 dark:bg-transparent bg-white">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="dark:bg-surface-ink bg-surface-container rounded-[32px] p-12 md:p-20 text-center border dark:border-white/5 
              border-black/5 relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 dark:bg-primary-container/10 bg-primary/5 blur-[100px] rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 dark:bg-secondary/10 bg-primary/5 blur-[100px] rounded-full"></div>

              <h2 className="font-display-lg dark:text-white text-on-surface mb-6 relative z-10 text-4xl md:text-6xl font-extrabold tracking-tighter">
                Ready to take back your voice?
              </h2>
              <p className="text-on-surface-variant font-body-lg mb-12 max-w-xl mx-auto relative z-10 text-lg font-semibold">
                Be part of the foundation. Join the new wave of social interaction built for everyday people and real community voices.
              </p>
              <div className="relative z-10">
                <button
                  onClick={() => navigate('/home')}
                  className="px-12 py-5 bg-primary-container text-white rounded-full font-headline-md glow-button hover:opacity-90 transition-all active:scale-95 shadow-2xl dark:shadow-primary-container/40 shadow-primary/20 font-bold"
                >
                  Join the Kollective Today
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-background">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg dark:text-primary-container text-primary mb-4 font-extrabold text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="text-on-surface-variant font-body-lg text-xl">
                Everything you need to know about Kollective
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="dark:bg-surface-container bg-white/70 backdrop-blur-[12px] border dark:border-white/5 border-black/5 rounded-card p-6 dark:hover:border-primary-container/30 hover:border-primary/30 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-headline-md dark:text-white text-on-surface font-bold text-lg pr-4">{faq.q}</h3>
                      <span className="material-symbols-outlined text-on-surface-variant dark:group-hover:text-primary-container group-hover:text-primary transition-colors">
                        {isOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-4 text-text-secondary text-lg leading-relaxed border-t dark:border-white/5 border-black/5 pt-4 animate-in fade-in duration-300">
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

      {/* Footer */}
      <footer className="w-full py-16 dark:bg-surface-ink bg-surface border-t border-outline-variant/60 font-sans">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">

          {/* Top Section: Brand Matrix & Navigation Links */}
          <div className="flex flex-row justify-between mb-16">

            {/* Brand Identity Node */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="text-xl font-black tracking-tight dark:text-gold-muted text-primary uppercase">
                Kollective
              </div>
              <p className="text-sm font-medium text-text-secondary leading-relaxed pr-6">
                Building the foundation for a truly sovereign and decentralized digital society.
              </p>
            </div>

            {/* Column: Platform */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-text-primary">Platform</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <a className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors" href="#sovereign-voice">
                    Sovereign Voice Protocols
                  </a>
                </li>
                <li>
                  <a className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors" href="#geographic-hubs">
                    Geographic Nodes
                  </a>
                </li>
                <li>
                  <a className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors" href="#democratic-governance">
                    Democratic Governance
                  </a>
                </li>
              </ul>
            </div>

            {/* Column: Resources */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-text-primary">Resources</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <a className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors" href="#">
                    Documentation
                  </a>
                </li>
                <li>
                  <a className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors" href="#">
                    Security Metrics
                  </a>
                </li>
                <li>
                  <a className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors" href="#">
                    Whitepaper
                  </a>
                </li>
              </ul>
            </div>

            {/* Column: Legal */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-text-primary">Legal Matrix</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link to="/privacy" className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors">
                    Contact Node
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Section: Copyright & Social Vector Networks */}
          <div className="pt-8 border-t border-outline-variant/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs font-medium text-text-secondary text-center sm:text-left">
              © {new Date().getFullYear()} Kollective. Built for the Sovereign Voice. All rights reserved.
            </div>

            <div className="flex items-center gap-5">
              <Link className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors p-1.5 hover:bg-surface-variant/40 dark:hover:bg-surface-variant/20 rounded-lg" href="#" aria-label="Global network layer">
                <Globe className="w-4 h-4" />
              </Link>
              <Link className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors p-1.5 hover:bg-surface-variant/40 dark:hover:bg-surface-variant/20 rounded-lg" href="#" aria-label="Federated handling address mail">
                <AtSign className="w-4 h-4" />
              </Link>
              <Link className="text-text-secondary dark:hover:text-text-primary hover:text-primary transition-colors p-1.5 hover:bg-surface-variant/40 dark:hover:bg-surface-variant/20 rounded-lg" href="#" aria-label="Source context matrix core">
                <Code className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

