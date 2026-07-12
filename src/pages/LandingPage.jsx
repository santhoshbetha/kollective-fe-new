import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useStore } from '../store/useStore';

export const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useStore((s) => s.theme);
  const isLight = theme === 'light';
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'What is Kollective?',
      a: 'Kollective is a sovereign, decentralized microblogging and digital organizing network built for the people, by the people, and of the people. It returns ownership of data and voice back to communities.'
    },
    {
      q: 'How do I get started?',
      a: 'Simply click "Launch App" or "Join the Kollective" to enter the feed. You can select your local district node, read discussions, and start posting immediately without centralized corporate oversight.'
    },
    {
      q: 'What types of content can I share?',
      a: 'You can publish standard Posts (sharing thoughts, images, or links) or broadcast urgent Campaign Voices to mobilize community solidarity actions.'
    },
    {
      q: 'Is Kollective free to use?',
      a: 'Yes, Kollective is fully open-source and free to participate. It operates on mutual aid principles and community sovereignty protocols.'
    },
    {
      q: 'How do I control who sees my content?',
      a: 'When drafting a pulse, you can configure your target audience to be Global (visible to the entire network) or Local Nodes (restricted to your regional organizers).'
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
            <span className="text-xl font-bold sm:inline-block bg-[#E2023F] bg-clip-text text-transparent"
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
            <Link to="/signup">
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
            <p className="font-body-lg text-lg dark:text-on-surface-variant text-on-surface font-medium font-semibold mb-12 max-w-2xl mx-auto leading-relaxed text-xl dark:bg-transparent bg-white/30 dark:backdrop-blur-none backdrop-blur-sm dark:border-transparent border border-white/30 dark:p-0 p-6 rounded-card dark:shadow-none shadow-sm">
              If 'X', 'Threads' and 'Truth' feel like someone's private property and decentralized apps leave us disconnected, join Kollective to reclaim your <span className={`${isLight ? 'text-primary font-extrabold underline decoration-primary decoration-2 underline-offset-4' : 'text-secondary'}`} style={{ fontWeight: isLight ? 800 : 700 }}>"Voice"</span>.
            </p>
          </div>
        </section>

        {/* Pillars / Features Bento Grid */}
        <section className="py-24 dark:bg-surface-ink border-0 dark:border-white/5 border-black/5">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-4xl md:text-6xl dark:text-white text-on-surface mb-4 dark:text-primary-container text-primary font-extrabold tracking-tight">
                The Foundation of Collective Power
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="p-8 dark:bg-surface-container bg-white border border-black/5 shadow-sm rounded-card hover:border-primary/30 transition-all"
                id="sovereign-voice">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary">security</span>
                </div>
                <h3 className="font-headline-md text-on-surface dark:text-white mb-4 font-bold text-xl">
                  Create a profile
                </h3>
                <p className="text-on-surface-variant font-body-md text-lg font-semibold">
                  Choose a username, add a bio, and you're good to go. Share your thoughts locally or globally.
                </p>
              </div>

              <div className="p-8 dark:bg-surface-container bg-white/70 backdrop-blur-[12px] border dark:border-white/5 border-black/5 shadow-sm rounded-card dark:hover:border-primary-container/30 hover:border-primary/30 transition-all cursor-pointer group" id="geographic-hubs">
                <div className="w-12 h-12 dark:bg-primary-container/10 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border dark:border-primary-container/20 border-transparent group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined dark:text-primary-container text-primary group-hover:text-white">hub</span>
                </div>
                <h3 className="font-headline-md text-on-surface dark:text-white mb-4 font-bold text-xl">
                  Share your voice
                </h3>
                <p className="text-on-surface-variant font-body-md text-lg font-semibold">
                  Post content that matters to you. Target your audience from local communities to the entire world.
                </p>
              </div>

              <div className="p-8 dark:bg-surface-container bg-white/70 backdrop-blur-[12px] border dark:border-white/5 border-black/5 shadow-sm rounded-card dark:hover:border-primary-container/30 hover:border-primary/30 transition-all cursor-pointer group" id="democratic-governance">
                <div className="w-12 h-12 dark:bg-primary-container/10 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border dark:border-primary-container/20 border-transparent group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined dark:text-primary-container text-primary group-hover:text-white">how_to_vote</span>
                </div>
                <h3 className="font-headline-md text-on-surface dark:text-white mb-4 font-bold text-xl">
                  Ask and answer questions
                </h3>
                <p className="text-on-surface-variant font-body-md text-lg font-semibold">
                  Engage with the community in an open and friendly way. Share knowledge and learn from others.
                </p>
              </div>

              <div className="p-8 dark:bg-surface-container bg-white/70 backdrop-blur-[12px] border dark:border-white/5 border-black/5 shadow-sm rounded-card dark:hover:border-primary-container/30 hover:border-primary/30 transition-all cursor-pointer group" id="geographic-hubs">
                <div className="w-12 h-12 dark:bg-primary-container/10 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border dark:border-primary-container/20 border-transparent group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined dark:text-primary-container text-primary group-hover:text-white">hub</span>
                </div>
                <h3 className="font-headline-md text-on-surface dark:text-white mb-4 font-bold text-xl">
                  Discover
                </h3>
                <p className="text-on-surface-variant font-body-md text-lg font-semibold">
                  Keep an eye on the people you admire, explore communities, and expand your circle.
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
                Join thousands of users already building the next generation of social interaction.
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
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg dark:text-primary-container text-primary mb-4 font-extrabold">
                Frequently Asked Questions
              </h2>
              <p className="text-on-surface-variant font-body-lg text-lg">
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
                      <h3 className="font-headline-md dark:text-white text-on-surface font-bold text-md pr-4">{faq.q}</h3>
                      <span className="material-symbols-outlined text-on-surface-variant dark:group-hover:text-primary-container group-hover:text-primary transition-colors">
                        {isOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-4 text-text-secondary text-sm leading-relaxed border-t dark:border-white/5 border-black/5 pt-4 animate-in fade-in duration-300">
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
      <footer className="w-full py-16 dark:bg-surface-ink bg-white border-t dark:border-white/5 border-black/5">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="font-headline-md text-headline-md font-bold dark:text-gold-muted text-primary mb-6 tracking-tighter text-lg">
                Kollective
              </div>
              <p className="text-on-surface-variant font-body-md mb-6 pr-8 text-sm leading-relaxed">
                Building the foundation for a truly sovereign and decentralized digital society.
              </p>
            </div>
            <div>
              <h4 className="dark:text-white text-on-surface font-label-md mb-6 text-sm font-bold">Platform</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#sovereign-voice">
                    Sovereign Voice Protocols
                  </a>
                </li>
                <li>
                  <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#geographic-hubs">
                    Geographic Nodes
                  </a>
                </li>
                <li>
                  <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#democratic-governance">
                    Democratic Governance
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="dark:text-white text-on-surface font-label-md mb-6 text-sm font-bold">Resources</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#">
                    Documentation
                  </a>
                </li>
                <li>
                  <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#">
                    Security
                  </a>
                </li>
                <li>
                  <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#">
                    Whitepaper
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="dark:text-white text-on-surface font-label-md mb-6 text-sm font-bold">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#">
                    Privacy
                  </a>
                </li>
                <li>
                  <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#">
                    Terms
                  </a>
                </li>
                <li>
                  <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t dark:border-white/5 border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-on-surface-variant font-label-md text-sm">
              © 2024 Kollective. Built for the Sovereign Voice.
            </div>
            <div className="flex items-center gap-6">
              <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#">
                <span className="material-symbols-outlined text-[20px]">public</span>
              </a>
              <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#">
                <span className="material-symbols-outlined text-[20px]">alternate_email</span>
              </a>
              <a className="text-on-surface-variant dark:hover:text-white hover:text-primary transition-colors" href="#">
                <span className="material-symbols-outlined text-[20px]">code</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
