import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const LoginPageO = () => {
  const navigate = useNavigate();
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    // Simulate successful login by navigating to /home
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-on-surface overflow-x-hidden isolate">

      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-6 bg-transparent border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-0 cursor-pointer" onClick={() => navigate('/')}>
          <img
            alt="Kollective Logo"
            className="h-14 w-auto"
            src="/K99.png"
          />
          <span className="font-headline-md text-2xl font-bold text-[#CC033B] tracking-tight hidden sm:block"
            style={{ fontSize: "36px", fontFamily: "Protest Riot, sans-serif" }}>
            Kollective
          </span>
        </div>
        <nav className="flex items-center gap-8" hidden>
          <Link to="/" className="font-label-md text-base text-on-surface-variant hover:text-primary transition-colors">
            Manifesto
          </Link>
          <button onClick={toggleTheme} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center relative py-20 px-margin-mobile">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-[25%] left-[25%] w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[25%] right-[25%] w-80 h-80 bg-secondary-container/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md z-10 mt-12">
          {/* Center Card */}
          <div className="glass-panel rounded-lg p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Subtle brand accent */}
            {/* <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-container/10 to-transparent pointer-events-none"></div> */}

            <div className="text-center mb-10">
              <h1 className="font-display-lg text-3xl md:text-4xl font-extrabold text-text-primary mb-2">Welcome Back</h1>
              <p className="font-body-md text-base text-on-surface-variant">Log in and share your voice</p>
            </div>

            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="email">
                  <svg className="w-4 h-4 text-on-surface-variant/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002 2H5a2 2 0 00-2-2zm0 0V6a2 2 0 012-2h10a2 2 0 012 2v13H5z" />
                  </svg>
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    className="w-full px-4 py-3 bg-surface-container/40 rounded-xl border border-outline-variant text-text-primary placeholder:text-on-surface-variant/40 outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    id="email"
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-on-surface-variant" htmlFor="password">
                    <svg className="w-4 h-4 text-on-surface-variant/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <input
                    className="w-full pl-4 pr-12 py-3 bg-surface-container/40 rounded-xl border border-outline-variant text-text-primary placeholder:text-on-surface-variant/40 outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              <div className="flex items-center justify-between text-sm py-1">
                <label className="flex items-center gap-2.5 cursor-pointer group select-none text-on-surface-variant hover:text-text-primary transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-outline-variant bg-surface-container/40 text-primary focus:ring-primary/20 focus:ring-offset-0 accent-primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#forgot" className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors focus:outline-none focus:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    // Create a new navigate function that ignores the first argument
                    const newNavigate = (...args) => navigate(...args.slice(1));
                    newNavigate(1, { replace: true });
                  }}
                >
                  Forgot password?
                </a>
              </div>

              <div className="flex items-center justify-between" hidden>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      className="peer sr-only"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="w-5 h-5 border border-surface-variant rounded bg-surface-container-lowest peer-checked:bg-primary-container peer-checked:border-primary-container transition-all"></div>
                    <span className="material-symbols-outlined absolute inset-0 text-white text-[14px] opacity-0 peer-checked:opacity-100 flex items-center justify-center">check</span>
                  </div>
                  <span className="font-label-sm text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
                </label>
                <a className="font-label-sm text-sm text-primary hover:text-text-secondary transition-colors" href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Password recovery link sent.'); }}>Forgot your password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-primary/30"
              >
                Log In
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="font-body-md text-base text-on-surface-variant">
                Don't have an account?
                <Link className="text-text-secondary font-bold hover:underline underline-offset-4 ml-1 text-base" to="/create-account">Create Account</Link>
              </p>
            </div>
          </div>

          {/* Aesthetic Credit */}
          <div className="mt-8 flex items-center justify-center gap-4 opacity-40 hover:opacity-100 transition-opacity" hidden>
            <div className="w-12 h-12 flex items-center justify-center bg-surface-container rounded-full border border-white/10">
              <img alt="Identity" className="w-6 h-6 grayscale opacity-60" src="/K99.png" />
            </div>
            <div className="text-left">
              <p className="text-[14px] font-bold uppercase tracking-widest text-on-surface-variant">Aesthetic Reference</p>
              <p className="text-[12px] text-text-secondary">Crimson Refined Series</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Segment */}
      <footer className="w-full py-8 mt-auto border-t border-white/5 bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-4 w-full max-w-container-max mx-auto">
          <div className="flex items-center gap-4 font-label-sm text-sm text-on-surface-variant">
            <img alt="Logo" className="h-5 w-auto opacity-50" src="/K99.png" />
            <span>© {new Date().getFullYear()} Kollective. The Revolution is Digital.</span>
          </div>
          <div className="flex gap-6">
            <a className="font-label-sm text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a>
            <a className="font-label-sm text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="font-label-sm text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
