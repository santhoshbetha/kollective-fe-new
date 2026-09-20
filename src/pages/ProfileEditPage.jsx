// src/pages/ProfileEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useProfileQuery, useUpdateProfileMutation } from '../features/profile/useProfileFeature';
import { UserAvatar } from '../components/UserAvatar';
import { ImageUploader } from '../components/ImageUploader';

export const ProfileEditPage = () => {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const username = currentUser?.handle?.toLowerCase().replace('@', '');

    // 1. Fetch current profile data to populate input defaults
    const { data: profile, isPending } = useProfileQuery(username);
    const updateProfileMutation = useUpdateProfileMutation(username);

    // 2. Local controlled input memory state blocks
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [role, setRole] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [headerImageUrl, setHeaderImageUrl] = useState('');

    // Symmetrically map incoming cache values into local memory inputs upon loading
    useEffect(() => {
        if (profile) {
            setDisplayName(profile.name || '');
            setBio(profile.bio || '');
            setRole(profile.role || '');
            setAvatarUrl(profile.avatar || '');
            setHeaderImageUrl(profile.headerImage || '');
        }
    }, [profile]);

    if (isPending) {
        return (
            <div className="pt-32 text-center flex flex-col items-center justify-center gap-4 w-full">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                <p className="text-text-secondary text-xs font-mono font-bold uppercase tracking-widest animate-pulse">Loading secure keyrings...</p>
            </div>
        );
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!displayName.trim()) return;

        // Dispatch flat data matrix payload safely over the mutation network channel
        updateProfileMutation.mutate({
            name: displayName.trim(),
            bio: bio.trim(),
            role: role.trim(),
            avatar: avatarUrl.trim(),
            headerImage: headerImageUrl.trim()
        }, {
            onSuccess: () => {
                // Pivot immediately back to the updated identity presentation canvas
                navigate(`/profile/${username}`);
            }
        });
    };

    const bioCharLimit = 160;
    const bioCharsLeft = bioCharLimit - bio.length;

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 Top Navigation Action Toolbar Header Row */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 select-none">
                <div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight">Edit Node Credentials</h1>
                    <p className="text-xs text-text-secondary mt-0.5">Modify your citizen cryptographic profile variables</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer"
                >
                    Cancel
                </button>
            </div>

            {/* 🖼️ REAL-TIME HARDWARE-ACCELERATED VISUAL MEDIA PREVIEW PANELS */}
            <div className="flex flex-col gap-6 w-full select-none glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Header Banner</label>
                    <ImageUploader
                        mode="banner"
                        aspectRatio={3}
                        value={headerImageUrl}
                        onChange={(newBanner) => setHeaderImageUrl(newBanner)}
                        onImageRemove={() => setHeaderImageUrl('')}
                        label="Upload Header Banner"
                    />
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Profile Avatar</label>
                    <ImageUploader
                        mode="avatar"
                        aspectRatio={1}
                        value={avatarUrl}
                        onChange={(newAvatar) => setAvatarUrl(newAvatar)}
                        onImageRemove={() => setAvatarUrl('')}
                        label="Profile Picture"
                        description="Square format (400x400). Crop and position your avatar."
                    />
                </div>
            </div>

            {/* 🏛️ PRIMARY CREDENTIALS MANAGEMENT FORM BODY */}
            <form onSubmit={handleFormSubmit} className="space-y-5 flex flex-col w-full">

                {/* Input Block: Display Name Configuration */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">Display Name</label>
                    <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => e.target.value.length <= 50 && setDisplayName(e.target.value)}
                        placeholder="Julian Thorne"
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary-container transition-colors"
                        disabled={updateProfileMutation.isPending}
                    />
                </div>

                {/* Input Block: Role Descriptor Tag */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">Grid Node Role Descriptor</label>
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => e.target.value.length <= 30 && setRole(e.target.value)}
                        placeholder="Kollective, Grid Operator, Validator..."
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary-container transition-colors"
                        disabled={updateProfileMutation.isPending}
                    />
                </div>

                {/* Input Block: Avatar Image Pointer */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">Avatar Image Link URL</label>
                    <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://unsplash.com... (Square aspect ratio recommended)"
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono font-bold text-text-primary focus:outline-none focus:border-primary-container transition-colors"
                        disabled={updateProfileMutation.isPending}
                    />
                </div>

                {/* Input Block: Panoramic Header Banner Link Pointer */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider select-none">Panoramic Header Banner Link URL</label>
                    <input
                        type="text"
                        value={headerImageUrl}
                        onChange={(e) => setHeaderImageUrl(e.target.value)}
                        placeholder="https://unsplash.com... (3:1 aspect ratio recommended)"
                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono font-bold text-text-primary focus:outline-none focus:border-primary-container transition-colors"
                        disabled={updateProfileMutation.isPending}
                    />
                </div>

                {/* Input Block: Character-Guarded Biography Canvas */}
                <div className="flex flex-col gap-1.5 relative">
                    <div className="flex justify-between items-center w-full select-none">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Biography Manifesto</label>
                        <span className={`text-xs font-mono font-bold ${bioCharsLeft < 0 ? 'text-rose-500 font-extrabold animate-pulse' : 'text-text-secondary/30'}`}>
                            {bioCharsLeft}
                        </span>
                    </div>
                    <textarea
                        rows="4"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Publish your structural collective values, mission scope parameters, or grid node specifications..."
                        className="w-full bg-[#111111] border border-white/10 rounded-xl p-4 text-sm text-text-primary placeholder:text-text-secondary/20 focus:outline-none focus:border-primary-container resize-none leading-relaxed transition-colors"
                        disabled={updateProfileMutation.isPending}
                        maxLength={bioCharLimit + 10}
                    />
                </div>

                {/* 🧭 Form Submission Footer Actions Row Layout */}
                <div className="pt-4 border-t border-white/5 flex justify-end items-center select-none mt-2">
                    <button
                        type="submit"
                        disabled={updateProfileMutation.isPending || bioCharsLeft < 0 || !displayName.trim()}
                        className="px-6 py-2.5 bg-primary-container text-white font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary-container/20 disabled:opacity-40 disabled:pointer-events-none crimson-glow uppercase tracking-wider cursor-pointer border-none"
                    >
                        {updateProfileMutation.isPending ? (
                            <div className="flex items-center gap-2">
                                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                                <span>Signing Manifest...</span>
                            </div>
                        ) : (
                            'Commit Changes'
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};
