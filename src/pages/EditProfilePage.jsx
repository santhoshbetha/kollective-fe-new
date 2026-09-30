// src/pages/EditProfilePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useUpdateUser } from '../features/profile/useProfileFeature';
import { ImageUploader } from '../components/ImageUploader';
import { ArrowLeft, MapPin, Globe, Loader2, Save, X } from 'lucide-react';
import { cn } from "@/lib/utils";

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
    const [isSavingLocal, setIsSavingLocal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSavingLocal(true);

        try {
            // 🚀 BE PIPELINE SHIFT: Pass raw local media sources directly.
            // The backend transaction will intercept these parameters and optimize them asynchronously.
            await updateUserMutation.mutateAsync({
                name,
                display_name: name,
                handle,
                email,
                bio,
                location,
                website,
                avatar_url: avatar,
                cover_image_url: banner,
            });

            navigate('/settings');
        } catch (err) {
            console.error('Error updating user profile context parameters:', err);
        } finally {
            setIsSavingLocal(false);
        }
    };

    const handleCancel = () => {
        navigate('/settings');
    };

    const isPendingTx = isSavingLocal || updateUserMutation.isPending;

    return (
        <div className="max-w-[1000px] mx-auto py-6 px-4 font-sans text-left animate-in fade-in duration-200">

            {/* Header Block Section */}
            <div className="flex items-center gap-4 mb-8 select-none">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="p-2.5 bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] rounded-full transition-colors cursor-pointer text-text-primary dark:text-white border-none outline-none active:scale-95"
                    aria-label="Return to settings layout"
                >
                    <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-text-primary dark:text-white tracking-tight">Edit Profile</h2>
                    <p className="text-sm text-text-secondary mt-0.5 font-medium">Update your profile information and appearance parameters</p>
                </div>
            </div>

            {/* Profile Graphics Canvas Settings Card Layout */}
            <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 rounded-[24px] overflow-hidden shadow-2xl transition-colors">

                {/* Banner Upload Matrix Box */}
                <div className="p-6 sm:p-8 pb-4">
                    <div className="mb-4 select-none">
                        <h3 className="text-xl font-black text-text-primary dark:text-white tracking-tight mb-1">Profile Banner</h3>
                        <p className="text-sm text-text-secondary font-medium">Recommended scale layout: 1200x400px. Drag &amp; drop or upload your header image canvas.</p>
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
                            <label className="text-xs font-black text-text-secondary uppercase tracking-widest select-none block ml-1">Username</label>
                            <input
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                className="w-full bg-black/[0.01] dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl px-4 py-3 text-base font-bold text-text-primary dark:text-white focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                                placeholder="@username"
                                type="text"
                                required
                            />
                        </div>
                        {/* Display Name Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-secondary uppercase tracking-widest select-none block ml-1">Display Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/[0.01] dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl px-4 py-3 text-base font-bold text-text-primary dark:text-white focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                                placeholder="Enter display name"
                                type="text"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Configuration Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-secondary uppercase tracking-widest select-none block ml-1">Email Coordinates</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/[0.01] dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl px-4 py-3 text-base font-bold text-text-primary dark:text-white focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none font-mono"
                            type="email"
                            placeholder="writer@domain.com"
                            required
                        />
                    </div>

                    {/* Bio & Mission Statement Textarea */}
                    <div className="space-y-2">
                        <div className="flex justify-between select-none">
                            <label className="text-xs font-black text-text-secondary uppercase tracking-widest block ml-1">Profile Bio</label>
                            <span className="text-xs font-mono font-bold text-text-secondary/60">{bio.length}/160 characters</span>
                        </div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 160))}
                            className="w-full bg-black/[0.01] dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl px-4 py-3 text-base font-medium text-text-primary dark:text-white focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none resize-none leading-relaxed"
                            placeholder="Tell us about yourself or your collective mission parameters..."
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Geographic Proximity Location Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-secondary uppercase tracking-widest select-none block ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60" />
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-black/[0.01] dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl pl-12 pr-4 py-3 text-base font-bold text-text-primary dark:text-white focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none"
                                    placeholder="e.g. Austin, TX"
                                    type="text"
                                />
                            </div>
                        </div>
                        {/* Website External Domain Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-secondary uppercase tracking-widest select-none block ml-1">Official Website</label>
                            <div className="relative">
                                <Globe className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60" />
                                <input
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="w-full bg-black/[0.01] dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl pl-12 pr-4 py-3 text-base font-bold text-text-primary dark:text-white focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all focus:outline-none font-mono"
                                    placeholder="https://yourwebsite.com"
                                    type="url"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Master Form Control Actions Row */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-black/5 dark:border-white/5 select-none font-mono text-xs uppercase font-bold tracking-wider">
                        <button
                            type="submit"
                            disabled={isPendingTx}
                            className="flex-1 sm:flex-none px-8 py-3.5 bg-primary-container text-white rounded-xl font-black hover:brightness-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 border-none cursor-pointer outline-none crimson-glow disabled:opacity-40"
                        >
                            {isPendingTx ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                    <span>Saving Profile...</span>
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
                            className="flex-1 sm:flex-none px-8 py-3.5 bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/5 hover:bg-black/[0.05] dark:hover:bg-white/5 text-text-primary dark:text-white rounded-xl font-black active:scale-95 transition-all outline-none cursor-pointer text-xs font-bold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
