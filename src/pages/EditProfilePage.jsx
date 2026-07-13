import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useUpdateUser } from '../features/profile/useProfileFeature';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const updateUserMutation = useUpdateUser();

  // Form states prefilled with context user details
  const [name, setName] = useState(user?.name || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handleUploadPhoto = () => {
    const newUrl = prompt('Enter a new avatar image URL:', avatar);
    if (newUrl !== null && newUrl.trim() !== '') {
      setAvatar(newUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserMutation.mutate({
      name,
      handle,
      email,
      bio,
      location,
      website,
      avatar,
    });
    navigate('/settings');
  };

  const handleCancel = () => {
    navigate('/settings');
  };

  return (
    <div className="max-w-[1000px] mx-auto py-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleCancel}
          className="material-symbols-outlined p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer text-text-primary"
        >
          arrow_back
        </button>
        <div>
          <h2 className="font-headline-lg text-2xl font-bold text-text-primary">Edit Profile</h2>
          <p className="text-lg text-text-secondary">Update your profile information and appearance</p>
        </div>
      </div>

      {/* Profile Settings Card */}
      <div className="glass-panel bg-surface-ink border border-white/10 rounded-[24px] overflow-hidden mb-12">
        {/* Banner Upload */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-headline-md text-xl font-bold text-text-primary mb-1">Profile Banner</h3>
              <p className="text-lg text-text-secondary">Recommended size: 1500x500px. Max file size: 5MB</p>
            </div>
          </div>
          <div
            onClick={() => alert('Banner upload feature placeholder clicked')}
            className="relative w-full aspect-[3/1] bg-surface-container rounded-2xl border-2 border-dashed border-outline-variant/30 overflow-hidden group cursor-pointer hover:border-primary-container/50 transition-colors"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-secondary group-hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
              <span className="text-sm font-semibold">Upload Header Image</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {/* Profile Picture Upload */}
        <div className="px-8 py-8 flex flex-col md:flex-row items-center gap-8 border-t border-white/5">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-surface-container border-4 border-surface-ink overflow-hidden shadow-xl">
              {avatar ? (
                <img
                  alt="User avatar preview"
                  className="w-full h-full object-cover"
                  src={avatar}
                />
              ) : (
                <div className="w-full h-full bg-primary-container flex items-center justify-center text-white text-3xl font-bold">
                  {name ? name[0] : 'U'}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleUploadPhoto}
              className="absolute bottom-0 right-0 p-2 bg-primary-container text-white rounded-full shadow-lg active:scale-90 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-headline-md text-xl font-bold text-text-primary mb-1">Profile Picture</h3>
            <p className="text-lg text-text-secondary mb-4">Recommended size: 400x400px. Max file size: 2MB</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button
                type="button"
                onClick={handleUploadPhoto}
                className="px-6 py-2 bg-primary-container text-white rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer text-sm uppercase tracking-wider crimson-glow"
              >
                Upload Photo
              </button>
              <span className="text-sm text-text-secondary flex items-center">JPG, PNG or GIF</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="font-label-md text-md font-bold text-text-primary ml-1 block">Username</label>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-lg text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                placeholder="@username"
                type="text"
                required
              />
            </div>
            {/* Display Name */}
            <div className="space-y-2">
              <label className="font-label-md text-md font-bold text-text-primary ml-1 block">Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-lg text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                placeholder="Enter display name"
                type="text"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="font-label-md text-md font-bold text-text-primary ml-1 block">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-lg text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
              type="email"
              required
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="font-label-md text-md font-bold text-text-primary ml-1 block">Bio</label>
              <span className="text-md text-text-secondary">{bio.length}/160 characters</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-lg text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none resize-none"
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-2">
              <label className="font-label-md text-md font-bold text-text-primary ml-1 block">Location</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                  location_on
                </span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-surface-container-low border border-white/10 rounded-xl pl-12 pr-4 py-3 text-lg text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                  placeholder="City, State"
                  type="text"
                />
              </div>
            </div>
            {/* Website */}
            <div className="space-y-2">
              <label className="font-label-md text-md font-bold text-text-primary ml-1 block">Website</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
                  language
                </span>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-surface-container-low border border-white/10 rounded-xl pl-12 pr-4 py-3 text-lg text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                  placeholder="https://yourwebsite.com"
                  type="url"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-8 py-3.5 bg-primary-container text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-wider crimson-glow cursor-pointer"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-surface-container-high border border-white/5 hover:bg-surface-container-highest text-text-primary rounded-xl font-bold active:scale-95 transition-all text-sm cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="p-8 border border-red-500/20 rounded-[24px] bg-red-950/10 flex items-center justify-between">
        <div>
          <h4 className="font-label-md text-lg font-bold text-red-500 mb-1">Deactivate Account</h4>
          <p className="text-lg text-text-secondary">Temporarily hide your profile and posts</p>
        </div>
        <button
          onClick={() => alert('Account deactivation is a placeholder action?.')}
          className="px-6 py-2 border border-red-500/40 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors font-bold text-sm uppercase tracking-wider cursor-pointer"
        >
          Deactivate
        </button>
      </div>
    </div>
  );
};
