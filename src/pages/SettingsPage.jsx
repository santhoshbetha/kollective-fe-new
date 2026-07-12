import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/auth/useAuthStore';

// Reusable toggle switch component matching the redesign style
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary-container' : 'bg-surface-container-high border border-white/5'
      }`}
  >
    <span
      className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full transition duration-200 ease-in-out mt-[2px] ml-[2px] ${checked ? 'translate-x-[20px] bg-white' : 'translate-x-0 bg-gold-muted'
        }`}
    />
  </button>
);

export const SettingsPage = () => {
  const navigate = useNavigate();
  const theme = useAuthStore((state) => state.theme);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const user = useAuthStore((state) => state.user);
  const showPersonalHandle = useStore((state) => state.showPersonalHandleOnOrg);
  const setShowPersonalHandle = useStore((state) => state.setShowPersonalHandleOnOrg);

  // Settings states
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [repliesEnabled, setRepliesEnabled] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const states = ['California', 'New York', 'Texas'];
  const citiesByState = {
    California: ['Los Angeles', 'San Francisco', 'San Diego'],
    'New York': ['New York City', 'Buffalo', 'Rochester'],
    Texas: ['Houston', 'Austin', 'Dallas'],
  };

  const handleSaveChanges = () => {
    navigate('/home');
  };

  const handleCancel = () => {
    navigate('/home');
  };



  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 text-scale-large">
      <header className="mb-10">
        <h1 className="font-display-lg text-3xl font-extrabold text-text-primary mb-2">Settings</h1>
        <p className="font-body-md text-xl font-semibold text-text-secondary">
          Manage your account preferences, privacy, and digital experience.
        </p>
      </header>

      {/* Edit Profile Quick Action */}
      <section
        onClick={() => navigate('/settings/profile')}
        className="glass-card bg-surface-ink border border-white/10 rounded-xl p-1 flex items-center justify-between cursor-pointer hover:border-primary-container/40 hover:shadow-lg transition-all group"
      >
        <div className="flex items-center gap-6 p-4">
          <div className="w-14 h-14 rounded-full border-2 border-primary-container/20 p-1 flex-shrink-0">
            <img
              alt="User avatar"
              className="w-full h-full rounded-full object-cover"
              src={user?.avatar}
            />
          </div>
          <div>
            <h3 className="font-headline-md text-xl text-text-primary group-hover:text-primary-container transition-colors font-bold">
              Edit Profile
            </h3>
            <p className="text-lg text-text-secondary">
              Update your profile picture, banner, and personal information
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined text-text-secondary mr-6 transition-transform group-hover:translate-x-1">
          chevron_right
        </span>
      </section>

      {/* Identity & Verification Section */}
      <section className="glass-card bg-surface-ink border border-white/10 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="material-symbols-outlined text-primary-container">verified</span>
          <h2 className="font-headline-md text-lg font-bold text-text-primary">Identity &amp; Verification</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigate('/verify')}
            className="p-5 bg-surface-container-low border border-white/10 hover:border-primary-container/40 rounded-xl cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-text-primary font-bold text-lg mb-1">
                <span className="material-symbols-outlined text-[20px] text-primary-container">assignment_ind</span>
                Choose Account Role
              </div>
              <p className="text-md text-text-secondary leading-relaxed">
                Select your platform category and authenticate with MuckRack, ORCID, or community boards.
              </p>
            </div>
            <div className="text-primary-container font-bold text-xs uppercase mt-4 flex items-center gap-1">
              Start Verification Onboarding <span className="text-[14px]">➔</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/verify/citizen')}
            className="p-5 bg-surface-container-low border border-white/10 hover:border-primary-container/40 rounded-xl cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-text-primary font-bold text-lg mb-1">
                <span className="material-symbols-outlined text-[20px] text-primary-container">qr_code_scanner</span>
                Peer-to-Peer Vouching
              </div>
              <p className="text-md text-text-secondary leading-relaxed">
                Verify other grassroots citizens in person or get vouched for by local trusted nodes.
              </p>
            </div>
            <div className="text-primary-container font-bold text-xs uppercase mt-4 flex items-center gap-1">
              Enter Citizen Vouching Desk <span className="text-[14px]">➔</span>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="glass-card bg-surface-ink border border-white/10 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="material-symbols-outlined text-primary-container">location_on</span>
          <h2 className="font-headline-md text-lg font-bold text-text-primary">Location</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="font-label-md text-sm font-bold text-text-secondary block">State</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('');
              }}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary-container/50 focus:border-primary-container focus:outline-none transition-all"
            >
              <option value="">Select your state</option>
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-sm font-bold text-text-secondary block">City</label>
            <select
              value={selectedCity}
              disabled={!selectedState}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={`w-full bg-surface-container-low border border-white/10 rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary-container/50 focus:border-primary-container focus:outline-none transition-all ${!selectedState ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <option value="">
                {selectedState ? 'Select a city' : 'Select a state first'}
              </option>
              {selectedState &&
                citiesByState[selectedState].map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
            </select>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="glass-card bg-surface-ink border border-white/10 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="material-symbols-outlined text-primary-container">notifications_active</span>
          <h2 className="font-headline-md text-xl font-bold text-text-primary">Notifications</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label-md text-lg font-semibold text-text-primary">Push Notifications</p>
              <p className="text-md text-text-secondary">Receive push notifications on your device</p>
            </div>
            <Toggle checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label-md text-lg font-semibold text-text-primary">Email Notifications</p>
              <p className="text-md text-text-secondary">Receive notifications via email</p>
            </div>
            <Toggle checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label-md text-lg font-semibold text-text-primary">Comment Replies</p>
              <p className="text-md text-text-secondary">Get notified when someone replies to your comment</p>
            </div>
            <Toggle checked={repliesEnabled} onChange={() => setRepliesEnabled(!repliesEnabled)} />
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="glass-card bg-surface-ink border border-white/10 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="material-symbols-outlined text-primary-container">security</span>
          <h2 className="font-headline-md text-xl font-bold text-text-primary">Privacy &amp; Security</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label-md text-lg font-semibold text-text-primary">Private Profile</p>
              <p className="text-md text-text-secondary">Only approved followers can see your posts</p>
            </div>
            <Toggle checked={privateProfile} onChange={() => setPrivateProfile(!privateProfile)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label-md text-lg font-semibold text-text-primary">Two-Factor Authentication</p>
              <p className="text-md text-text-secondary">Add an extra layer of security to your account</p>
            </div>
            <Toggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label-md text-lg font-semibold text-text-primary">Show Personal Handle on Organization Profile</p>
              <p className="text-md text-text-secondary">Allow your personal account handle to be visible when listed under organizations</p>
            </div>
            <Toggle checked={showPersonalHandle} onChange={() => setShowPersonalHandle(!showPersonalHandle)} />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="glass-card bg-surface-ink border border-white/10 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="material-symbols-outlined text-primary-container">palette</span>
          <h2 className="font-headline-md text-xl font-bold text-text-primary">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-label-md text-lg font-semibold text-text-primary">Dark Mode</p>
            <p className="text-lg text-text-secondary">Use dark theme across the application</p>
          </div>
          <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={handleSaveChanges}
          className="flex items-center gap-2 bg-primary-container text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all crimson-glow cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          Save Changes
        </button>
        <button
          onClick={handleCancel}
          className="bg-surface-container-high border border-white/5 hover:bg-surface-container-highest text-text-primary px-8 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
