// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileQuery } from '../features/profile/useProfileFeature';
import { ProfileFeed } from '../features/profile/ProfileFeed';
import { useAuthStore } from '../store/auth/useAuthStore';
import { PinnedPostsSection } from '../features/profile/PinnedPostsSection';

export const ProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();

    // Connect session stores to toggle administrative edit credentials hooks inline
    const currentUser = useAuthStore((state) => state.user);
    const isOwnProfile = currentUser?.handle?.toLowerCase().replace('@', '') === username?.toLowerCase();

    const { data: profile, isPending, isError } = useProfileQuery(username);

    if (isPending) {
        return (
            <div className="pt-32 text-center flex flex-col items-center justify-center gap-4 w-full">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                <p className="text-text-secondary text-xs font-mono font-bold uppercase tracking-widest animate-pulse">Resolving citizen credentials...</p>
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="pt-32 text-center max-w-md mx-auto flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-rose-500">no_accounts</span>
                <h2 className="text-xl font-black text-white tracking-tight">Node Address Unresolved</h2>
                <p className="text-sm text-text-secondary">The requested identity profile parameters do not exist across this localized network grid topology configuration.</p>
                <button type="button" onClick={() => navigate('/home')} className="mt-2 px-5 py-2.5 bg-surface-container border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-surface-container-high transition-colors cursor-pointer">Return to Grid</button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20 w-full relative animate-in fade-in duration-300">

            {/* 🏙️ PANORAMIC HEADER BANNER FRAME MATRIX */}
            <div className="w-full aspect-[3/1] bg-surface-container-high rounded-2xl border border-white/5 overflow-hidden relative shadow-md select-none">
                {profile.headerImage ? (
                    <img src={profile.headerImage} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#2d0a0a] via-[#1a1616] to-[#141414]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* 👤 AVATAR & IDENTITY DISPATCH TOOLBAR LAYER */}
            <div className="flex justify-between items-end px-4 -mt-16 relative z-10 select-none">
                {/* Profile Large Avatar Cap */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#141414] bg-[#1A1616] shadow-xl shrink-0">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary-container flex items-center justify-center font-black text-white text-3xl uppercase">{profile.name?.[0]}</div>
                    )}
                </div>

                {/* Action button toggles based on relational session authentication mapping */}
                {isOwnProfile ? (
                    <button
                        type="button"
                        onClick={() => navigate(`/profile/edit`)}
                        className="px-5 py-2 bg-surface-container border border-white/10 rounded-xl text-xs font-bold text-text-primary hover:bg-surface-container-high hover:border-white/20 transition-all active:scale-95 cursor-pointer shadow-md"
                    >
                        Edit Credentials
                    </button>
                ) : (
                    <button
                        type="button"
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border ${profile.following
                            ? 'bg-surface-container-high border-white/5 text-text-secondary'
                            : 'bg-primary-container text-white border-primary-container crimson-glow font-black'
                            }`}
                    >
                        {profile.following ? 'Following ✓' : 'Follow Node'}
                    </button>
                )}
            </div>

            {/* 📝 METADATA BLOCK PROFILE FIELDS INFORMATION CARD */}
            <div className="px-4 space-y-3 mt-2 flex flex-col">
                <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <h1 className="text-2xl font-black text-text-primary tracking-tight">{profile.name}</h1>
                        {profile.verified && <span className="material-symbols-outlined text-[18px] text-primary-container shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                        {profile.role && <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10 text-text-secondary">{profile.role}</span>}
                    </div>
                    <p className="text-xs font-mono font-bold text-primary-container mt-0.5">@{profile.username}@kollective.social</p>
                </div>

                {/* Profile Bio plain string descriptions block */}
                {profile.bio && (
                    <p className="text-sm text-text-secondary leading-relaxed max-w-xl whitespace-pre-wrap">
                        {profile.bio}
                    </p>
                )}

                {/* 📊 NUMERICAL ACCOUNT RELATIONSHIP SCALING TRACKERS */}
                <div className="flex items-center gap-5 pt-2 text-sm select-none border-t border-white/5 mt-1">
                    <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="font-black text-text-primary">{(profile.followingCount || 0).toLocaleString()}</span>
                        <span className="text-text-secondary/50 uppercase tracking-wider text-[11px] font-bold">Following</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="font-black text-text-primary">{(profile.followersCount || 0).toLocaleString()}</span>
                        <span className="text-text-secondary/50 uppercase tracking-wider text-[11px] font-bold">Followers</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs ml-auto text-text-secondary/40 font-bold uppercase tracking-widest text-[10px]">
                        <span className="material-symbols-outlined text-sm">lan</span>
                        <span>Node ID: {profile.id || 'unindexed'}</span>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 🏆 DECOUPLED PINNED HIGHLIGHTS STREAM INJECTION POINT */}
            {/* ========================================================================= */}
            <PinnedPostsSection
                accountId={profile.id}
                isOwnProfile={isOwnProfile}
            />

            {/* 🏆 DECOUPLED INFINITE ACTION FEED CONTAINER INJECTION POINT */}
            <ProfileFeed username={username} />

        </div>
    );
};
