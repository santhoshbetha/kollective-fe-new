// src/pages/EditProfilePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useUpdateUser } from '../../features/profile/useProfileFeature';
import { ImageUploader } from '../../components/ImageUploader';
import { uploadProfileImageToR2 } from '../../utils/uploadMedia';
import { ArrowLeft, MapPin, Globe, Loader2, Save, X } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to match your utility path layout structure

export const EditProfilePage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const updateUserMutation = useUpdateUser();

    // Form states prefilled with unified fallback user attributes context details
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

            // 1. Upload avatar image to R2 if changed / contains data URL signature parameters
            if (avatar && (avatar.startsWith('data:') || avatar instanceof File)) {
                finalAvatarUrl = await uploadProfileImageToR2(avatar, 'avatar');
            }

            // 2. Upload banner image to R2 if changed / contains data URL signature parameters
            if (banner && (banner.startsWith('data:') || banner instanceof File)) {
                finalBannerUrl = await uploadProfileImageToR2(banner, 'banner');
            }

            // 3. Persist profile graphics & data straight down to your backend database registries
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
            console.error('Error updating user profile context parameters:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        navigate('/settings');
    };

    return (
        <div className="max-w-[1000px] mx-auto py-6 px-4 font-sans text-left animate-in fade-in duration-200">

            {/* Header Block Section */}
            <div className="flex items-center gap-4 mb-8 select-none">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="p-2.5 bg-surface-container hover:bg-surface-container-high rounded-full transition-colors cursor-pointer text-text-primary border-none outline-none active:scale-95"
                    aria-label="Return to settings layout"
                >
                    <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">Edit Profile</h2>
                    <p className="text-sm text-text-secondary mt-0.5 font-medium">Update your profile information and appearance parameters</p>
                </div>
            </div>

            {/* Profile Graphics Canvas Settings Card Layout */}
            <div className="bg-surface-container dark:bg-surface-ink border border-black/5 dark:border-white/10 rounded-[24px] overflow-hidden shadow-2xl">

                {/* Banner Upload Matrix Box */}
                <div className="p-6 sm:p-8 pb-4">
                    <div className="mb-4 select-none">
                        <h3 className="text-xl font-black text-text-primary tracking-tight mb-1">Profile Banner</h3>
                        <p className="text-sm text-text-secondary font-medium">Recommended scale layout: 1500x500px. Drag &amp; drop or upload your header image canvas.</p>
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

                {/* Profile Picture Upload Matrix Box */}
                <div className="px-6 sm:px-8 py-6 border-t border-black/5 dark:border-white/5">
                    <ImageUploader
                        mode="avatar"
                        aspectRatio={1}
                        value={avatar}
                        onChange={(newAvatar) => setAvatar(newAvatar)}
                        onImageRemove={() => setAvatar('')}
                        label="Profile Picture"
                        description="Recommended resolution: 400x400px. Select, crop, and position your profile picture vector node."
                    />
                </div>
                {/* Form Fields Content Sheet */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 border-t border-black/5 dark:border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none block ml-1">Username</label>
                            <input
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                className="w-full bg-white dark:bg-[#111111] border border-white/10 dark:border-white/5 rounded-xl px-4 py-3 text-base font-bold text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                                placeholder="@username"
                                type="text"
                                required
                            />
                        </div>

                        {/* Display Name Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none block ml-1">Display Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white dark:bg-[#111111] border border-white/10 dark:border-white/5 rounded-xl px-4 py-3 text-base font-bold text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                                placeholder="Enter display name"
                                type="text"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Configuration Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none block ml-1">Email Coordinates</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-[#111111] border border-white/10 dark:border-white/5 rounded-xl px-4 py-3 text-base font-bold text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none font-mono"
                            type="email"
                            placeholder="writer@domain.com"
                            required
                        />
                    </div>

                    {/* Bio & Mission Statement Textarea */}
                    <div className="space-y-2">
                        <div className="flex justify-between select-none">
                            <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider block ml-1">Profile Bio</label>
                            <span className="text-xs font-mono font-bold text-text-secondary/60">{bio.length}/160 characters</span>
                        </div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 160))}
                            className="w-full bg-white dark:bg-[#111111] border border-white/10 dark:border-white/5 rounded-xl px-4 py-3 text-base font-medium text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none resize-none leading-relaxed"
                            placeholder="Tell us about yourself or your collective mission parameters..."
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Geographic Proximity Location Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none block ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60" />
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-white dark:bg-[#111111] border border-white/10 dark:border-white/5 rounded-xl pl-12 pr-4 py-3 text-base font-bold text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                                    placeholder="e.g. Austin, TX"
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Website External Domain Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none block ml-1">Official Website</label>
                            <div className="relative">
                                <Globe className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60" />
                                <input
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="w-full bg-white dark:bg-[#111111] border border-white/10 dark:border-white/5 rounded-xl pl-12 pr-4 py-3 text-base font-bold text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none font-mono"
                                    placeholder="https://yourwebsite.com"
                                    type="url"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Master Form Control Actions Row */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t dark:border-white/5 border-black/5 select-none font-mono text-xs uppercase font-bold tracking-wider">
                        <button
                            type="submit"
                            disabled={isUploading || updateUserMutation.isPending}
                            className="flex-1 sm:flex-none px-8 py-3.5 bg-primary-container text-white rounded-xl font-black hover:brightness-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 border-none cursor-pointer outline-none crimson-glow disabled:opacity-40"
                        >
                            {isUploading || updateUserMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                    <span>{isUploading ? 'Uploading to R2...' : 'Saving...'}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 stroke-[2.5px]" />
                                    <span>Save Profile</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 sm:flex-none px-8 py-3.5 bg-surface-container-high border border-white/10 dark:border-white/5 hover:bg-surface-container-highest text-text-primary hover:text-white rounded-xl font-black active:scale-95 transition-all outline-none cursor-pointer text-xs font-bold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
