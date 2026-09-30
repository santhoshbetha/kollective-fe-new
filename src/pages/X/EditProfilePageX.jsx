import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useUpdateUser } from '../features/profile/useProfileFeature';
import { ImageUploader } from '../components/ImageUploader';
import { uploadProfileImageToR2 } from '../utils/uploadMedia';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const updateUserMutation = useUpdateUser();

  // Form states prefilled with context user details
  const [name, setName] = useState(user?.name || user?.display_name || '');
  const [handle, setHandle] = useState(user?.handle || user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatar_url || user?.avatar || '');
  const [banner, setBanner] = useState(user?.cover_image_url || user?.banner || user?.headerImage || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalAvatarUrl = avatar;
      let finalBannerUrl = banner;

      // 1. Upload avatar image to R2 if changed / new data URL
      if (avatar && (avatar.startsWith('data:') || avatar instanceof File)) {
        finalAvatarUrl = await uploadProfileImageToR2(avatar, 'avatar');
      }

      // 2. Upload banner image to R2 if changed / new data URL
      if (banner && (banner.startsWith('data:') || banner instanceof File)) {
        finalBannerUrl = await uploadProfileImageToR2(banner, 'banner');
      }

      // 3. Persist profile graphics & data to backend database & auth state
      await updateUserMutation.mutateAsync({
        name,
        display_name: name,
        handle,
        email,
        bio,
        location,
        website,
        avatar: finalAvatarUrl,
        avatar_url: finalAvatarUrl,
        banner: finalBannerUrl,
        cover_image_url: finalBannerUrl,
        headerImage: finalBannerUrl,
      });

      navigate('/settings');
    } catch (err) {
      console.error('Error updating user profile:', err);
    } finally {
      setIsUploading(false);
    }
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
          <div className="mb-4">
            <h3 className="font-headline-md text-xl font-bold text-text-primary mb-1">Profile Banner</h3>
            <p className="text-sm text-text-secondary">Recommended size: 1500x500px. Drag & drop or upload your header image.</p>
          </div>
          <ImageUploader
            mode="banner"
            aspectRatio={3}
            value={banner}
            onChange={(newBanner) => setBanner(newBanner)}
            onImageRemove={() => setBanner('')}
            label="Upload Header Image"
          />
        </div>

        {/* Profile Picture Upload */}
        <div className="px-8 py-8 border-t border-white/5">
          <ImageUploader
            mode="avatar"
            aspectRatio={1}
            value={avatar}
            onChange={(newAvatar) => setAvatar(newAvatar)}
            onImageRemove={() => setAvatar('')}
            label="Profile Picture"
            description="Recommended size: 400x400px. Select, crop, and position your photo."
          />
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
              disabled={isUploading || updateUserMutation.isPending}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-primary-container text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-wider crimson-glow cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'Uploading to R2...' : updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
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
    </div>
  );
};
