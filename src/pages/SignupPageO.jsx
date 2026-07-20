import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const SignupPageO = () => {
  const navigate = useNavigate();
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  // Signup steps: 1 = Welcome/Guidelines, 2 = Details, 3 = Verification
  const [step, setStep] = useState(1);
  const [termsAgree, setTermsAgree] = useState(false);
  const [animateShake, setAnimateShake] = useState(false);

  // Step 2 Form States
  const [accountType, setAccountType] = useState('personal');
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [cityVal, setCityVal] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendStatus, setResendStatus] = useState('normal'); // 'normal', 'sending', 'sent'

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!termsAgree) {
      setAnimateShake(true);
      setTimeout(() => setAnimateShake(false), 500);
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (!fullname.trim() || !username.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    setStep(3);
  };

  const handleResendEmail = (e) => {
    e.preventDefault();
    if (resendStatus !== 'normal') return;
    setResendStatus('sending');
    setTimeout(() => {
      setResendStatus('sent');
      setTimeout(() => {
        setResendStatus('normal');
      }, 4000);
    }, 1800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-on-surface overflow-x-hidden">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-6 bg-transparent border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-0 cursor-pointer" onClick={() => navigate('/')}>
          <img
            alt="Kollective Logo"
            className="h-14 w-auto"
            src="/K99.png"
          />
          <span className="font-headline-md text-xl font-bold text-[#CC033B] tracking-tight hidden sm:block"
            style={{ fontSize: "36px", fontFamily: "Protest Riot, sans-serif" }}>
            Kollective
          </span>
        </div>
        <nav className="flex items-center gap-8" hidden>
          <Link to="/" className="font-label-md text-sm text-on-surface-variant hover:text-primary transition-colors">Manifesto</Link>
          <button onClick={toggleTheme} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </nav>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center w-full px-margin-mobile py-24 mt-8">
        {/* Background Asset (Atmospheric) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-30">
          <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-surface-crimson-low/50 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-2xl flex flex-col gap-10">
          {/* Stepper Progress */}
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center relative">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-3 h-3 rounded-full transition-all ${step >= 1 ? 'bg-primary ring-4 ring-primary-container/30' : 'bg-surface-variant'
                  }`}></div>
                <span className={`font-label-sm text-sm ${step >= 1 ? 'text-primary font-bold' : 'text-on-surface-variant opacity-40'}`}>Welcome</span>
              </div>
              <div className="w-full absolute top-[5px] -z-10 h-px bg-surface-variant"></div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-3 h-3 rounded-full transition-all ${step >= 2 ? 'bg-primary ring-4 ring-primary-container/30' : 'bg-surface-variant'
                  }`}></div>
                <span className={`font-label-sm text-sm ${step >= 2 ? 'text-primary font-bold' : 'text-on-surface-variant opacity-40'}`}>Details</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-3 h-3 rounded-full transition-all ${step >= 3 ? 'bg-primary ring-4 ring-primary-container/30' : 'bg-surface-variant'
                  }`}></div>
                <span className={`font-label-sm text-sm ${step >= 3 ? 'text-primary font-bold' : 'text-on-surface-variant opacity-40'}`}>Verify</span>
              </div>
            </div>
          </div>

          {/* Step 1: Guidelines */}
          {step === 1 && (
            <div className={`glass-card crimson-gradient-glow rounded-xl p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/5 transition-transform duration-300 ${animateShake ? 'animate-shake' : ''
              }`}>
              {/* Content Header */}
              <div className="text-center mb-10">
                <h1 className="font-display-lg text-3xl md:text-4xl font-extrabold text-text-primary leading-tight mb-3">Welcome to the Kollective.</h1>
                <p className="font-body-md text-base text-text-secondary max-w-lg mx-auto">Before joining the revolution, please review our community code of conduct.</p>
              </div>

              {/* Guidelines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {/* Be Kind */}
                <div className="p-5 rounded-lg bg-surface-container/40 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">favorite</span>
                    <div>
                      <h3 className="font-label-md text-base text-text-primary mb-1">Be Kind &amp; Respectful</h3>
                      <p className="font-label-sm text-sm text-on-surface-variant leading-relaxed">Empathy is our baseline. Treat all members with dignity.</p>
                    </div>
                  </div>
                </div>

                {/* Keep it Real */}
                <div className="p-5 rounded-lg bg-surface-container/40 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">verified</span>
                    <div>
                      <h3 className="font-label-md text-base text-text-primary mb-1">Keep it Real</h3>
                      <p className="font-label-sm text-sm text-on-surface-variant leading-relaxed">Authenticity matters. No bots, just genuine human collaboration.</p>
                    </div>
                  </div>
                </div>

                {/* Protect Privacy */}
                <div className="p-5 rounded-lg bg-surface-container/40 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">shield</span>
                    <div>
                      <h3 className="font-label-md text-base text-text-primary mb-1">Protect Privacy</h3>
                      <p className="font-label-sm text-sm text-on-surface-variant leading-relaxed">Your data is yours. Respect the confidentiality of peer projects.</p>
                    </div>
                  </div>
                </div>

                {/* Stay Informed */}
                <div className="p-5 rounded-lg bg-surface-container/40 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">auto_stories</span>
                    <div>
                      <h3 className="font-label-md text-base text-text-primary mb-1">Stay Informed</h3>
                      <p className="font-label-sm text-sm text-on-surface-variant leading-relaxed">The ecosystem evolves fast. Engage with weekly manifesto updates.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Buttons */}
              <div className="flex flex-col gap-8">
                <label className="flex items-center gap-2.5 cursor-pointer group select-none text-on-surface-variant hover:text-text-primary transition-colors">
                  <input
                    type="checkbox"
                    id="terms-agree"
                    className="w-4 h-4 rounded border-outline-variant bg-surface-container/40 text-primary focus:ring-primary/20 focus:ring-offset-0 accent-primary"
                    checked={termsAgree}
                    onChange={(e) => setTermsAgree(e.target.checked)}
                  />
                  I agree to follow these community guidelines
                </label>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="flex-[2] px-8 py-4 bg-primary-container text-white font-label-md text-base font-bold rounded-lg primary-button-glow hover:bg-inverse-primary active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer border-none"
                    onClick={handleStep1Submit}
                  >
                    <span>Let's get started!</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 px-8 py-4 bg-transparent border border-outline-variant text-text-secondary font-label-md text-base font-bold rounded-lg hover:bg-white/5 hover:text-text-primary active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
                  >
                    Not ready yet
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="font-body-md text-base text-on-surface-variant">
                  Already have an account?
                  <Link className="text-text-secondary font-bold hover:underline underline-offset-4 ml-1 text-base" to="/login">Log In</Link>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <div className="w-full glass-panel rounded-lg p-8 md:p-12 shadow-2xl border border-white/10 relative">
              <h1 className="font-display-lg text-3xl md:text-4xl font-extrabold text-text-primary mb-2">Build your profile</h1>
              <p className="font-body-md text-base text-text-secondary mb-10">Tell us a bit more about how you intend to use the Kollective platform.</p>

              <form className="space-y-10" onSubmit={handleStep2Submit}>
                {/* Account Type Selection */}
                <div className="space-y-4">
                  <label className="font-label-md text-base text-text-secondary block mb-4">Select Account Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Personal Card */}
                    <label className="relative cursor-pointer group">
                      <input
                        checked={accountType === 'personal'}
                        onChange={() => setAccountType('personal')}
                        className="peer sr-only"
                        name="account_type"
                        type="radio"
                        value="personal"
                      />
                      <div className="p-6 rounded-lg bg-surface-container border border-white/5 peer-checked:border-primary-container peer-checked:bg-surface-crimson-low transition-all duration-300 h-full flex flex-col items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center group-hover:scale-105 transition-transform duration-300 peer-checked:bg-primary-container">
                          <span className="material-symbols-outlined text-text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                        </div>
                        <div>
                          <h3 className="font-label-md text-base text-text-primary group-hover:text-primary-container transition-colors font-bold">Personal Account</h3>
                          <p className="text-sm text-text-secondary mt-1 leading-relaxed">For individual builders, creators, and visionaries.</p>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 peer-checked:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>
                        </div>
                      </div>
                    </label>

                    {/* Organization Card */}
                    <label className="relative cursor-pointer group">
                      <input
                        checked={accountType === 'organization'}
                        onChange={() => setAccountType('organization')}
                        className="peer sr-only"
                        name="account_type"
                        type="radio"
                        value="organization"
                      />
                      <div className="p-6 rounded-lg bg-surface-container border border-white/5 peer-checked:border-primary-container peer-checked:bg-surface-crimson-low transition-all duration-300 h-full flex flex-col items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center group-hover:scale-105 transition-transform duration-300 peer-checked:bg-primary-container">
                          <span className="material-symbols-outlined text-text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
                        </div>
                        <div>
                          <h3 className="font-label-md text-base text-text-primary group-hover:text-primary-container transition-colors font-bold">Organization</h3>
                          <p className="text-sm text-text-secondary mt-1 leading-relaxed">Manage teams, departments, or high-growth collectives.</p>
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 peer-checked:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-primary-container text-[20px]">check_circle</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="font-label-sm text-sm text-text-secondary" htmlFor="fullname">Full Name *</label>
                    <input
                      required
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary-container input-glow transition-all font-body-md text-base"
                      id="fullname"
                      placeholder="Alexander Kollective"
                      type="text"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="font-label-sm text-sm text-text-secondary" htmlFor="username">Username *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-container font-bold text-base">@</span>
                      <input
                        required
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-lg pl-9 pr-4 py-3 text-text-primary focus:outline-none focus:border-primary-container input-glow transition-all font-body-md text-base"
                        id="username"
                        placeholder="alex_v"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="font-label-sm text-sm text-text-secondary" htmlFor="email">Email Address *</label>
                    <input
                      required
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary-container input-glow transition-all font-body-md text-base"
                      id="email"
                      placeholder="alex@kollective.social"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Birthday */}
                  <div className="space-y-2">
                    <label className="font-label-sm text-sm text-text-secondary" htmlFor="birthday">Birthday</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary-container input-glow transition-all font-body-md text-base appearance-none"
                        id="birthday"
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">calendar_month</span>
                    </div>
                  </div>

                  {/* Location Selection */}
                  <div className="space-y-2">
                    <label className="font-label-sm text-sm text-text-secondary" htmlFor="state">State</label>
                    <select
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary-container input-glow transition-all font-body-md text-base appearance-none"
                      id="state"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                    >
                      <option value="">Select State</option>
                      <option value="NY">New York</option>
                      <option value="CA">California</option>
                      <option value="TX">Texas</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-sm text-text-secondary" htmlFor="city">City</label>
                    <select
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary-container input-glow transition-all font-body-md text-base appearance-none"
                      id="city"
                      value={cityVal}
                      onChange={(e) => setCityVal(e.target.value)}
                    >
                      <option value="">Select City</option>
                      <option value="NYC">New York City</option>
                      <option value="LA">Los Angeles</option>
                      <option value="SF">San Francisco</option>
                    </select>
                  </div>

                  {/* Password (Span 2) */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label-sm text-sm text-text-secondary" htmlFor="password">Create Password *</label>
                    <div className="relative">
                      <input
                        required
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary-container input-glow transition-all font-body-md text-base"
                        id="password"
                        placeholder="••••••••••••"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer flex items-center justify-center"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <div className="h-1 flex-1 bg-primary-container rounded-full"></div>
                      <div className="h-1 flex-1 bg-primary-container rounded-full"></div>
                      <div className="h-1 flex-1 bg-primary-container rounded-full"></div>
                      <div className="h-1 flex-1 bg-surface-variant rounded-full"></div>
                    </div>
                    <p className="text-sm text-text-secondary">Strong: Use 12+ characters, including symbols and numbers.</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 pt-8">
                  <button
                    className="order-2 md:order-1 flex-1 py-4 rounded-lg border border-white/10 text-text-primary font-label-md text-base font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 group cursor-pointer"
                    type="button"
                    onClick={() => setStep(1)}
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Back
                  </button>
                  <button
                    className="order-1 md:order-2 flex-[2] py-4 rounded-lg bg-primary-container text-white font-label-md text-base font-bold hover:brightness-110 shadow-lg shadow-primary-container/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none group"
                    type="submit"
                  >
                    Continue to Verification
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 glass-panel crimson-glow flex flex-col items-center text-center gap-8 border border-white/5 relative overflow-hidden">
              {/* Subtle Gradient Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-container/5 to-transparent"></div>

              {/* Status Banner */}
              <div className="bg-primary-container/15 text-primary px-4 py-2 rounded-full font-label-md text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
                Verification email sent
              </div>

              {/* Large Success Icon */}
              <div className="relative animate-float my-4">
                <div className="absolute inset-0 bg-primary-container/20 blur-[30px] rounded-full scale-125"></div>
                <div className="w-32 h-32 bg-surface-container-high rounded-2xl flex items-center justify-center relative z-10 shadow-2xl border border-white/10">
                  <span className="material-symbols-outlined text-[64px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_unread</span>
                </div>
              </div>

              {/* Messaging */}
              <div className="flex flex-col gap-4">
                <h1 className="font-headline-lg text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">Almost there!</h1>
                <p className="font-body-md text-base text-on-surface-variant max-w-[340px] mx-auto leading-relaxed">
                  A confirmation link has been sent to <span className="text-text-secondary font-semibold">{email || 'kollective.user@example.com'}</span>. Please check your inbox and click the link to activate your account.
                </p>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-6 mt-2">
                <button
                  onClick={() => navigate('/home')}
                  className="w-full py-4 bg-primary-container text-white font-label-md text-base font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-primary-container/20 border-t border-white/10 cursor-pointer border-none"
                >
                  Open Mail App
                </button>
                <div className="flex flex-col gap-4">
                  <a
                    className="text-label-md font-label-md text-base text-on-surface-variant hover:text-text-secondary transition-colors inline-flex items-center justify-center gap-2 group"
                    href="#resend"
                    onClick={handleResendEmail}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${resendStatus === 'sending' ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>
                      {resendStatus === 'sent' ? 'check_circle' : 'refresh'}
                    </span>
                    {resendStatus === 'normal' && "Didn't receive the email? Send it again"}
                    {resendStatus === 'sending' && "Sending link..."}
                    {resendStatus === 'sent' && "New link sent!"}
                  </a>
                  <a
                    className="text-label-sm text-sm text-on-surface-variant/50 hover:text-on-surface transition-colors inline-flex items-center justify-center gap-2"
                    href="#back"
                    onClick={(e) => { e.preventDefault(); setStep(2); }}
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Wrong email address? Go back
                  </a>
                </div>
              </div>
            </div>
          )}

          <p className="text-label-sm text-sm text-text-secondary text-center opacity-60">
            Securely processed by Kollective Identity Labs. <br className="md:hidden" />
            <a className="text-primary-container hover:underline underline-offset-4" href="#legal" onClick={(e) => e.preventDefault()}>Legal Compliance</a> &amp; <a className="text-primary-container hover:underline underline-offset-4" href="#terms" onClick={(e) => e.preventDefault()}>Terms of Use</a>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 mt-auto bg-surface-container-lowest/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-6 w-full max-w-container-max mx-auto">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <img alt="Kollective" className="w-5 h-5 opacity-80" src="/K99.png" />
              <span className="font-label-md font-bold text-text-primary text-sm">Kollective</span>
            </div>
            <span className="font-label-sm text-sm text-on-surface-variant opacity-60">© {new Date().getFullYear()} Kollective. The Revolution is Digital.</span>
          </div>
          <div className="flex gap-8">
            <a className="font-label-sm text-sm text-on-surface-variant hover:text-primary transition-colors" href="#terms" onClick={(e) => e.preventDefault()}>Terms</a>
            <a className="font-label-sm text-sm text-on-surface-variant hover:text-primary transition-colors" href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a className="font-label-sm text-sm text-on-surface-variant hover:text-primary transition-colors" href="#manifesto" onClick={(e) => e.preventDefault()}>Manifesto</a>
            <a className="font-label-sm text-sm text-on-surface-variant hover:text-primary transition-colors" href="#contact" onClick={(e) => e.preventDefault()}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
