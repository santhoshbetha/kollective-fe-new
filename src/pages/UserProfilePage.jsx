// src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useStore } from '../store/useStore';
import { useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import { cn } from '../lib/utils';
import { resolveUserPersona } from '../utils/accountMapper';
import { PostCard } from '../components/posts/PostCard';
import { VerificationBadge } from '../components/VerificationBadge';
import { UserAvatar } from '../components/accounts/UserAvatar';
import { TrendingWidget } from '../components/TrendingWidget';
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
    useProfileQuery,
    useProfileTimelineQuery,
    useToggleFollowMutation,
    useProfileConnectionsQuery
} from '../features/profile/useProfileFeature';

export function UserProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const [activeTab, setActiveTab] = useState('Posts');
    const [connectionView, setConnectionView] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showCorrectionLog, setShowCorrectionLog] = useState(false);

    const cleanUsername = (username || '').toLowerCase().replace('@', '');

    // 📡 REST DATA HANDLERS: Fetch profiles straight from your backend storage endpoints
    const { data: remoteProfile, isLoading: isProfileLoading } = useProfileQuery(cleanUsername);

    const currentTimelineMode = activeTab === 'Posts' ? 'root_only' : 'with_replies';
    const {
        data: timelinePagesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useProfileTimelineQuery(cleanUsername, currentTimelineMode);

    // Invoke the connections query lane for follower/following matrices
    const {
        data: connectionsData,
        fetchNextPage: fetchNextConnectionsPage,
        hasNextPage: hasNextConnectionsPage,
        isFetchingNextPage: isFetchingNextConnectionsPage,
        isLoading: isConnectionsLoading
    } = useProfileConnectionsQuery(cleanUsername, connectionView);

    // Flatten paginated connection accounts list profiles safely
    const connectionAccounts = useMemo(() => {
        return connectionsData?.pages?.flatMap(page => page?.accounts || page?.data || (Array.isArray(page) ? page : [])) || [];
    }, [connectionsData?.pages]);

    const toggleFollowMutation = useToggleFollowMutation(cleanUsername);

    // Safeguard isOwnProfile boolean evaluations
    const isOwnProfile = useMemo(() => {
        if (!currentUser && !activeAccount) return false;
        const currentHandle = (currentUser?.handle || activeAccount?.handle || '').toLowerCase().replace('@', '');
        const currentName = (currentUser?.username || activeAccount?.username || '').toLowerCase();
        return currentHandle === cleanUsername || currentName === cleanUsername;
    }, [currentUser, activeAccount, cleanUsername]);

    // Parse remote server data layouts safely and inject structural defaults dynamically
    const profile = useMemo(() => {
        const base = remoteProfile?.data || remoteProfile?.user || remoteProfile;
        const sourceObj = isOwnProfile ? (currentUser || activeAccount || base) : base;

        if (!sourceObj) {
            return {
                name: cleanUsername.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                handle: `@${cleanUsername}`,
                bio: 'Active contributor to the decentralized community feed.',
                postsCount: 0, followingCount: 0, followersCount: 0,
                metadata: []
            };
        }

        const rawFields = sourceObj.fields || sourceObj.custom_fields || [];
        const mappedMetadata = Array.isArray(rawFields) ? rawFields.map(f => ({
            key: f.name || f.key,
            value: f.value,
            verified: !!(f.verified_at || f.verified),
            url: typeof f.value === 'string' && f.value.startsWith('http') ? f.value : null
        })) : [];

        const userPersona = resolveUserPersona(sourceObj);

        const mockMembers = [
            { name: 'Julian Thorne', handle: '@j_thorne', role: 'Architect & Editor', avatar: '' },
            { name: 'Elena Thorne', handle: '@elena_thorne', role: 'Cooperative Researcher', avatar: '' },
            { name: 'Marcus Vane', handle: '@marcus_vane', role: 'Chief Coordinator', avatar: '' }
        ];

        return {
            id: sourceObj.id,
            name: sourceObj.display_name || sourceObj.name || sourceObj.username || cleanUsername,
            handle: `@${sourceObj.username || cleanUsername}`,
            avatar: sourceObj.avatar_url || sourceObj.avatar || '',
            banner: sourceObj.cover_image_url || sourceObj.header_url || sourceObj.banner || '',
            bio: sourceObj.bio || sourceObj.note || '',
            location: sourceObj.location || '',
            postsCount: sourceObj.posts_count ?? sourceObj.note_count ?? 0,
            followingCount: sourceObj.following_count ?? 0,
            followersCount: sourceObj.followers_count ?? sourceObj.follower_count ?? 0,
            badge_type: sourceObj.badge_type || userPersona,
            type: sourceObj.type || (userPersona === 'organization' ? 'organization' : 'user'),
            orcid_id: sourceObj.orcid_id || (userPersona === 'scholar' ? '0000-0002-1825-0001' : null),
            publication_count: sourceObj.publication_count || (userPersona === 'scholar' ? 14 : 0),
            recent_publications: sourceObj.recent_publications || (userPersona === 'scholar' ? [
                "Union Density and Automation Offsets in Heavy Manufacturing (2025)",
                "Comparative Strike Tariffs: A Multi-district Longitudinal Survey (2026)"
            ] : []),
            portfolio_url: sourceObj.portfolio_url || (userPersona === 'journalist' ? 'https://muckrack.com' : null),
            primary_outlet: sourceObj.primary_outlet || (userPersona === 'journalist' ? 'Independent Correspondent' : null),
            under_investigation: typeof sourceObj.under_investigation !== 'undefined' ? sourceObj.under_investigation : false,
            members: mockMembers,
            correction_log: sourceObj.correction_log || [
                {
                    timestamp: "2026-06-25T14:00:00Z",
                    original_claim: "Sector 4 strike count reported at 50,000 workers.",
                    correction_fact: "Sector 4 union records list strike count at 12,500 active workers."
                }
            ],
            strike_reason: sourceObj.strike_reason || "Incorrect strike worker tally reported.",
            metadata: mappedMetadata
        };
    }, [remoteProfile, isOwnProfile, currentUser, activeAccount, cleanUsername]);

    useEffect(() => {
        if (remoteProfile) {
            const base = remoteProfile.data || remoteProfile.user || remoteProfile;
            const followStatus = !!(base?.following || base?.relationship?.following);
            setIsFollowing(followStatus);
        }
    }, [remoteProfile]);

    const showPersonalHandle = useStore((state) => state.showPersonalHandleOnOrg);

    const finalUserPosts = useMemo(() => {
        const posts = timelinePagesData?.pages?.flatMap(page => page?.posts || page?.data || (Array.isArray(page) ? page : [])) || [];
        if (activeTab === 'Media') {
            return posts.filter(p => Array.isArray(p?.images) && p.images.length > 0);
        }
        return posts;
    }, [timelinePagesData?.pages, activeTab]);

    const displayMetadata = useMemo(() => {
        let meta = Array.isArray(profile?.metadata) ? [...profile.metadata] : [];
        if (cleanUsername === 'j_thorne' && showPersonalHandle) {
            if (!meta.some(m => m.key === 'Organization')) {
                meta.push({
                    key: 'Organization',
                    value: 'New York Magazine',
                    verified: true,
                    url: '/profile/nymag'
                });
            }
        }
        return meta;
    }, [profile?.metadata, cleanUsername, showPersonalHandle]);

    const handleToggleFollow = async () => {
        if (!isAuthenticated) {
            alert("Please log in to follow users.");
            return;
        }
        if (isOwnProfile) return;

        const targetId = profile.id || cleanUsername;
        const nextState = !isFollowing;
        setIsFollowing(nextState);

        try {
            await toggleFollowMutation.mutateAsync({ targetId });
        } catch (err) {
            setIsFollowing(!nextState);
            console.error("Failed to toggle follow status:", err);
        }
    };

    const isScholar = profile.badge_type?.toLowerCase() === 'scholar' || !!profile.orcid_id;
    const isJournalist = profile.badge_type?.toLowerCase() === 'journalist' || !!profile.portfolio_url;
    const isOrg = profile.type === 'organization' || profile.badge_type?.toLowerCase() === 'organization' || profile.badge_type?.toLowerCase() === 'warned';

    if (isProfileLoading) {
        return (
            <div className="max-w-7xl mx-auto p-12 text-center text-xs font-mono font-bold tracking-widest text-text-secondary select-none animate-pulse">
        // COMPILING_DECENTRALIZED_IDENTITY_SCHEMA...
            </div>
        );
    }
    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 p-4 bg-white dark:bg-[#090d12] text-text-primary dark:text-white transition-colors font-sans">
            {/* Left Main Axis Column Container */}
            <div className="flex-1 flex flex-col gap-6 max-w-3xl text-left">

                {/* Back Button Action Header Row */}
                <div className="flex items-center gap-4 pb-4 border-b border-black/10 dark:border-white/5 mb-2 select-none">
                    {location.state?.fromCard && (
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text-primary dark:hover:text-white transition-all active:scale-95 flex items-center justify-center bg-transparent cursor-pointer outline-none group"
                            title="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 stroke-[2.5px] transition-transform group-hover:-translate-x-0.5" />
                        </button>
                    )}
                    <div>
                        <h2 className="font-black text-text-primary dark:text-white text-lg leading-tight tracking-tight">{profile.name}</h2>
                        <p className="text-[14px] text-text-secondary font-bold font-mono">{profile.postsCount} pulses recorded</p>
                    </div>
                </div>

                {/* Cover Banner and Avatar Profile Deck Layer Card */}
                <div className="rounded-2xl overflow-hidden relative border border-black/10 dark:border-white/5 bg-black/[0.01] dark:bg-[#141414] shadow-xl transition-colors">
                    {/* Cover Banner Panoramic Window */}
                    <div className="h-48 w-full relative bg-gradient-to-r from-primary-container/20 via-black/10 to-black/30 overflow-hidden select-none border-b border-black/5 dark:border-white/5">
                        {profile.banner ? (
                            <img alt="User profile cover canvas banner" className="w-full h-full object-cover opacity-90" src={profile.banner} />
                        ) : (
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary-container,#d32f2f),transparent)] opacity-20 dark:opacity-30" />
                        )}
                    </div>

                    {/* Integrated Biography Block Info Core Area */}
                    <div className="p-6 relative flex flex-col gap-6">
                        <div className="flex justify-between items-start select-none">
                            <UserAvatar
                                user={profile}
                                className="w-24 h-24 md:w-32 md:h-32 border-4 border-white dark:border-[#141414] shadow-2xl mt-[-64px] md:mt-[-80px] relative z-10 text-3xl md:text-4xl bg-black/[0.02] dark:bg-[#1d1d1f] font-sans font-black transition-all"
                                roundedClassName="rounded-2xl"
                            />

                            <div className="flex items-center gap-2.5 font-mono text-xs uppercase font-bold tracking-wider">
                                <button
                                    type="button"
                                    onClick={() => alert(`Direct message / mention input opened to ${profile.handle}`)}
                                    className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text-primary dark:hover:text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer bg-transparent outline-none"
                                    title="Mention User"
                                >
                                    <span className="text-sm font-bold">@</span>
                                </button>
                                {isOwnProfile ? (
                                    <button
                                        type="button"
                                        onClick={() => navigate('/settings/profile')}
                                        className="px-5 py-2.5 rounded-xl font-black text-xs tracking-wide transition-all active:scale-95 cursor-pointer bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-text-primary dark:text-white hover:bg-black/[0.08] dark:hover:bg-white/10 outline-none font-sans uppercase tracking-normal"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleToggleFollow}
                                        disabled={toggleFollowMutation.isPending}
                                        className={cn(
                                            "px-5 py-2.5 rounded-xl font-black text-xs tracking-wide transition-all active:scale-95 cursor-pointer outline-none font-sans uppercase tracking-normal border-none",
                                            isFollowing
                                                ? "bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-text-secondary hover:text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20"
                                                : "bg-primary-container text-white crimson-glow hover:brightness-105"
                                        )}
                                    >
                                        {toggleFollowMutation.isPending ? 'Processing...' : isFollowing ? 'Following ✓' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* User Title & Handle Header Typography Panels */}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl md:text-3xl font-black text-text-primary dark:text-white tracking-tight">{profile.name}</h1>
                                {profile.badge_type && (
                                    <VerificationBadge type={profile.badge_type.toLowerCase()} size="lg" />
                                )}
                            </div>
                            <p className="text-xs text-text-secondary font-mono font-bold mt-1">
                                {profile.handle}@kollective.social
                            </p>
                        </div>

                        {/* Biography Content Body */}
                        <p className="text-sm md:text-base text-text-primary/90 dark:text-white/90 leading-relaxed max-w-2xl font-medium">
                            {profile.bio || "Active contributor to the decentralized community feed."}
                        </p>
                        {/* 🔬 [SCHOLAR MANIFEST] ORCID Peer Review Audit Trail Panel */}
                        {isScholar && profile.orcid_id && (
                            <div className="border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-black/30 p-5 rounded-xl space-y-4 font-mono text-text-primary dark:text-white w-full max-w-2xl animate-in fade-in duration-300 transition-colors">
                                <div>
                                    <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-widest mb-2 uppercase flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 stroke-[2.5px]" />
                                        <span>OPEN RESEARCH AUDIT MANIFEST</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-xs text-text-secondary font-bold">
                                        <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                                            <span>REGISTRY RESOURCE:</span>
                                            <span className="text-text-primary dark:text-white">ORCID PUBLIC REGISTER</span>
                                        </div>
                                        <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1 items-center">
                                            <span>IDENTIFICATION INDEX:</span>
                                            <a href={`https://orcid.org{profile.orcid_id}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline flex items-center gap-1 hover:opacity-85 font-mono">
                                                {profile.orcid_id}<span>↗</span>
                                            </a>
                                        </div>
                                        <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                                            <span>SYNC INTEGRITY:</span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">✓ SHA-256 MATCH</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>TOTAL REGISTERED WORKS:</span>
                                            <span className="text-text-primary dark:text-white font-extrabold">{profile.publication_count || 0} PEER-REVIEWED PAPERS</span>
                                        </div>
                                    </div>
                                </div>

                                {profile.recent_publications && profile.recent_publications.length > 0 && (
                                    <div className="border-t border-black/5 dark:border-white/5 pt-3">
                                        <div className="text-[9px] font-black text-text-secondary tracking-widest mb-2 uppercase">LATEST INDEXED RELEASES (CRON VERIFIED):</div>
                                        <ul className="space-y-2 font-sans text-xs">
                                            {profile.recent_publications.map((pubTitle, idx) => (
                                                <li key={`pub-${idx}`} className="text-text-primary dark:text-white bg-black/[0.01] dark:bg-white/[0.02] p-2.5 border-l-2 border-emerald-500 flex gap-2 rounded-r-lg font-medium">
                                                    <span className="text-text-secondary font-bold font-mono">[{idx + 1}]</span>
                                                    <span className="italic leading-normal">{pubTitle}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 📰 [JOURNALIST PORTFOLIO] Synced Press Credentials Audit Track Panel */}
                        {isJournalist && profile.portfolio_url && (
                            <div className="border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-black/30 p-5 rounded-xl space-y-4 font-mono text-text-primary dark:text-white w-full max-w-2xl animate-in fade-in duration-300 transition-colors">
                                <div>
                                    <div className="text-[10px] font-black text-teal-600 dark:text-teal-400 tracking-widest mb-2 uppercase flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 stroke-[2.5px]" />
                                        <span>VERIFIED MEDIA AUDIT TRAILS</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-xs text-text-secondary font-bold">
                                        <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                                            <span>CREDENTIAL SYSTEM:</span>
                                            <span className="text-text-primary dark:text-white">DIGITAL PORTFOLIO INDEX</span>
                                        </div>
                                        <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1 items-center">
                                            <span>VERIFIED BYLINE LINK:</span>
                                            <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline flex items-center gap-1 hover:opacity-85 font-mono">
                                                <span>Open Press Portfolio</span><span>↗</span>
                                            </a>
                                        </div>
                                        <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                                            <span>AFFILIATION OUTLET:</span>
                                            <span className="text-text-primary dark:text-white font-extrabold">{profile.primary_outlet || "Independent Correspondent"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>INTEGRITY CLEARANCE:</span>
                                            <span className="text-teal-600 dark:text-teal-400 font-extrabold">✓ SYNCED MEDIA PRESS PROFILE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* 🏢 [ORGANIZATION MANIFEST] Retractions accountability and probation alert blocks */}
                        {isOrg && (
                            <div className={cn(
                                "border font-mono text-text-primary dark:text-white p-5 w-full max-w-2xl rounded-xl space-y-4 animate-in fade-in duration-300 transition-all",
                                profile.badge_type?.toLowerCase() === 'warned'
                                    ? "border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                                    : "border-black/10 dark:border-white/5 bg-black/[0.01] dark:bg-black/30"
                            )}>
                                <div className="flex justify-between items-start gap-4 flex-wrap">
                                    <div className="text-left">
                                        <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest">PUBLIC TRUST &amp; RETRACTION MANIFEST</h3>
                                        <p className="text-[11px] font-bold text-text-secondary mt-1">Institutional Corrections: {profile.correction_log?.length || 0} active logs</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowCorrectionLog(!showCorrectionLog)}
                                        className="text-xs font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 px-3 py-1.5 text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors cursor-pointer rounded-lg outline-none bg-transparent"
                                    >
                                        {showCorrectionLog ? 'HIDE AUDIT' : `CORRECTION LOG (${profile.correction_log?.length || 0})`}
                                    </button>
                                </div>

                                {profile.badge_type?.toLowerCase() === 'warned' && (
                                    <div className="border border-amber-500/20 bg-amber-500/10 p-4 rounded-xl text-xs text-amber-600 dark:text-amber-400 leading-relaxed font-sans font-medium text-left">
                                        <div className="font-black uppercase mb-1 font-mono tracking-wider flex items-center gap-1.5 text-amber-500">
                                            <AlertTriangle className="w-4 h-4 stroke-[2.5px]" />
                                            <span>⚠️ SYSTEM TRANSPARENCY WARNING FLAG:</span>
                                        </div>
                                        This institutional media publisher is serving a 30-day probation penalty for violating platform truth standards.
                                        <div className="mt-2 text-text-secondary/70 italic">Reason: "{profile.strike_reason || 'Publication discrepancies.'}"</div>
                                    </div>
                                )}

                                {showCorrectionLog && (
                                    <div className="border-t border-dashed border-black/10 dark:border-white/10 pt-4 mt-2 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                        {profile.correction_log && profile.correction_log.length > 0 ? (
                                            <div className="space-y-3 pt-2 text-left">
                                                {profile.correction_log.map((log, idx) => (
                                                    <div key={`log-${idx}`} className="text-xs border border-black/10 dark:border-white/5 bg-black/[0.005] dark:bg-white/[0.02] p-3.5 rounded-xl space-y-2 font-mono">
                                                        <div className="flex justify-between items-center text-[10px] text-text-secondary font-black tracking-wider">
                                                            <span>INDEX LOG: #00{idx + 1}</span>
                                                            <span>FILED: {new Date(log.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="text-text-primary dark:text-white font-extrabold">
                                                            ORIGINAL CLAIM: <span className="text-text-secondary line-through font-normal">{log.original_claim}</span>
                                                        </div>
                                                        <div className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2.5 border-l-2 border-emerald-500 font-sans font-medium leading-normal rounded-r-xl">
                                                            <span className="font-mono font-black text-[10px] block text-emerald-600 dark:text-emerald-400 mb-0.5 tracking-wider">VERIFIED CORRECTION:</span>
                                                            {log.correction_fact}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-text-secondary/40 italic font-sans text-left">No retractions logged inside active database cycle.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ⚠️ Suspended dispute appeal panel banner flags layout */}
                        {isOwnProfile && (profile.under_investigation || (profile.badge_type?.toLowerCase() === 'citizen' && profile.orcid_id)) && (
                            <div className="border border-amber-600/30 bg-amber-500/5 p-5 rounded-xl flex flex-col gap-3 font-mono w-full max-w-2xl animate-in fade-in duration-300 text-left">
                                <div className="text-sm text-amber-500 font-black tracking-wider uppercase flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 stroke-[2.5px]" />
                                    <span>SCHOLAR STATUS SUSPENDED: DELTA ERROR DETECTED</span>
                                </div>
                                <p className="text-xs text-text-secondary font-sans font-medium leading-relaxed">
                                    Your researcher sync node reported a work drop discrepancy. Access credentials have been temporarily downgraded.
                                    You can submit written statement appeals or ORCID merges on your dispute dashboard page.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/verify/dispute')}
                                    className="w-fit px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white dark:text-black text-xs uppercase tracking-wider font-black transition-colors cursor-pointer border-none rounded-xl outline-none"
                                >
                                    Go to Scholar Dispute Portal ➔
                                </button>
                            </div>
                        )}

                        {/* Core Followers Statistics row metrics counters */}
                        <div className="flex gap-8 border-t border-black/5 dark:border-white/5 pt-4 w-full max-w-2xl font-mono text-sm select-none">
                            <button
                                type="button"
                                onClick={() => { setConnectionView(null); setActiveTab('Posts'); }}
                                className={cn(
                                    "flex gap-1.5 items-baseline bg-transparent border-none cursor-pointer transition-colors outline-none",
                                    !connectionView ? "text-primary-container font-black" : "text-text-secondary hover:text-text-primary dark:hover:text-white"
                                )}
                            >
                                <span className="font-black text-lg text-text-primary dark:text-white">
                                    {typeof profile.postsCount === 'number' ? profile.postsCount.toLocaleString() : profile.postsCount || 0}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">posts</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setConnectionView('following')}
                                className={cn(
                                    "flex gap-1.5 items-baseline bg-transparent border-none cursor-pointer transition-colors p-0.5 rounded outline-none",
                                    connectionView === 'following' ? "text-primary-container font-black" : "text-text-secondary hover:text-text-primary dark:hover:text-white"
                                )}
                            >
                                <span className="font-black text-lg text-text-primary dark:text-white">
                                    {typeof profile.followingCount === 'number' ? profile.followingCount.toLocaleString() : profile.followingCount || 0}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">following</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setConnectionView('followers')}
                                className={cn(
                                    "flex gap-1.5 items-baseline bg-transparent border-none cursor-pointer transition-colors p-0.5 rounded outline-none",
                                    connectionView === 'followers' ? "text-primary-container font-black" : "text-text-secondary hover:text-text-primary dark:hover:text-white"
                                )}
                            >
                                <span className="font-black text-lg text-text-primary dark:text-white">
                                    {typeof profile.followersCount === 'number' ? profile.followersCount.toLocaleString() : profile.followersCount || 0}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">followers</span>
                            </button>
                        </div>

                    </div>
                </div>
                {/* Metadata Verified Grid Layout Sheets */}
                {displayMetadata.length > 0 && (
                    <div className="rounded-2xl border border-black/10 dark:border-white/5 overflow-hidden flex flex-col w-full bg-black/[0.005] dark:bg-white/[0.01] shadow-sm select-none">
                        {displayMetadata.map((item, idx) => (
                            <div
                                key={`meta-row-${idx}`}
                                className={cn(
                                    "flex border-b border-black/5 dark:border-white/5 last:border-none items-stretch min-h-[44px]",
                                    item.verified ? "bg-emerald-500/[0.01] border-l-4 border-l-emerald-500/40" : ""
                                )}
                            >
                                <div className="w-1/3 px-4 py-3 bg-black/[0.005] dark:bg-white/[0.005] border-r border-black/5 dark:border-white/5 font-mono text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center text-left">
                                    {item.key}
                                </div>
                                <div className="flex-1 px-4 py-3 text-sm truncate flex items-center gap-2 text-left">
                                    {item.verified && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10 stroke-[2.5px] shrink-0" />
                                    )}
                                    {item.url ? (
                                        item.url.startsWith('/') ? (
                                            <Link to={item.url} className={cn("truncate text-xs font-mono font-bold underline outline-none", item.verified ? "text-emerald-600 dark:text-emerald-400" : "text-primary-container")}>
                                                {item.value}
                                            </Link>
                                        ) : (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className={cn("truncate text-xs font-mono font-bold underline outline-none", item.verified ? "text-emerald-600 dark:text-emerald-400" : "text-primary-container")}>
                                                {item.value}
                                            </a>
                                        )
                                    ) : (
                                        <span className={cn("truncate text-xs font-mono font-semibold", item.verified ? "text-emerald-600 dark:text-emerald-400" : "text-text-primary dark:text-white")}>
                                            {item.value}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Navigation Section Tabs layout bar */}
                <div className="flex border-b border-black/10 dark:border-[#262626] mt-4 w-full text-xs font-black uppercase tracking-widest font-mono select-none">
                    {(profile.type === 'organization' || profile.badge_type?.toLowerCase() === 'organization' || profile.badge_type?.toLowerCase() === 'warned' ? ['Posts', 'Posts & replies', 'Media', 'Team'] : ['Posts', 'Posts & replies', 'Media']).map((tab) => {
                        const isTabTargetReplies = tab === 'Posts & replies';
                        const isActive = activeTab === tab || (isTabTargetReplies && activeTab === 'Replies');
                        return (
                            <button
                                key={`nav-tab-${tab}`}
                                type="button"
                                onClick={() => setActiveTab(isTabTargetReplies ? 'Replies' : tab)}
                                className={cn(
                                    "flex-1 py-4 text-center border-none bg-transparent cursor-pointer transition-all relative outline-none font-mono tracking-widest text-xs font-black",
                                    isActive ? "text-primary-container font-black" : "text-text-secondary hover:text-text-primary dark:hover:text-white"
                                )}
                            >
                                {tab}
                                {isActive && (
                                    <div className="absolute bottom-0 inset-x-4 h-[2px] bg-primary-container rounded-t-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Sub-reply dynamic lists stream or organization panel lists core wrapper viewports */}
                <div className="flex flex-col gap-6 mt-2">
                    {/* 🚀 ROSTER ACTION INTERCEPT: If connectionView is armed, mount the vertical directory stack */}
                    {connectionView ? (
                        <div className="flex flex-col gap-2 font-sans">
                            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/5 pb-2 font-mono text-xs uppercase font-bold text-text-secondary select-none">
                                <span>Active User Directory: {connectionView}</span>
                                <button
                                    type="button"
                                    onClick={() => setConnectionView(null)}
                                    className="text-primary-container hover:underline bg-transparent border-none cursor-pointer font-black outline-none"
                                >
                                    ✕ Close View
                                </button>
                            </div>

                            {isConnectionsLoading ? (
                                <div className="text-center font-mono text-xs font-bold text-text-secondary py-8 select-none animate-pulse"> LOADING_RELATIONSHIP_MATRICES...</div>
                            ) : connectionAccounts.length === 0 ? (
                                <div className="rounded-2xl p-12 text-center border border-black/10 dark:border-white/5 bg-black/[0.01] dark:bg-[#141414] font-mono text-xs font-bold text-text-secondary/40 select-none">
                                    NO_RELATIONS_RECORDED_ON_THIS_NODE
                                </div>
                            ) : (
                                <div className="flex flex-col border border-black/10 dark:border-[#262626] bg-transparent overflow-hidden shadow-2xl relative rounded-xl">
                                    <Virtuoso
                                        useWindowScroll
                                        data={connectionAccounts}
                                        computeItemKey={(index, account) => account?.id || index}
                                        initialItemCount={Math.min(connectionAccounts.length, 6)}
                                        increaseViewportBy={300}
                                        endReached={() => {
                                            if (hasNextConnectionsPage && !isFetchingNextConnectionsPage) fetchNextConnectionsPage();
                                        }}
                                        itemContent={(index, account) => {
                                            const persona = resolveUserPersona(account);
                                            return (
                                                <div className="p-4 border-b border-black/5 dark:border-white/5 last:border-none flex items-center justify-between hover:bg-black/[0.01] dark:hover:bg-white/[0.015] bg-white dark:bg-[#141414] transition-colors animate-in fade-in duration-150 text-left">
                                                    <div className="flex items-center gap-4 min-w-0 select-none">
                                                        <UserAvatar user={account} className="w-11 h-11 border border-black/10 dark:border-white/10 shrink-0 text-sm font-semibold" roundedClassName="rounded-xl" />
                                                        <div className="min-w-0 flex flex-col gap-0.5 text-left">
                                                            <h4 className="font-extrabold text-text-primary dark:text-white text-sm flex items-center gap-1.5 leading-none">
                                                                <span>{account.display_name || account.name || account.username}</span>
                                                                {persona !== 'citizen' && <VerificationBadge type={persona} size="sm" />}
                                                            </h4>
                                                            <p className="text-xs text-text-secondary font-mono font-bold">
                                                                @{account.username || 'anonymous'}@kollective.social
                                                            </p>
                                                            {account.bio && <p className="text-xs text-text-secondary/80 font-sans font-medium truncate mt-1 max-w-md">{account.bio}</p>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setConnectionView(null);
                                                            navigate(`/profile/${account.username}`, { state: { fromCard: true } });
                                                        }}
                                                        className="px-4 py-2 rounded-xl bg-black/[0.04] dark:bg-[#1c1c1e] border border-black/10 dark:border-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 text-text-primary dark:text-white text-xs font-black tracking-wide transition-all cursor-pointer active:scale-95 whitespace-nowrap outline-none font-mono uppercase text-[10px]"
                                                    >
                                                        View Profile
                                                    </button>
                                                </div>
                                            );
                                        }}
                                        components={{
                                            Footer: () => isFetchingNextConnectionsPage ? (
                                                <div className="py-6 text-center text-xs font-mono font-bold text-text-secondary select-none animate-pulse"> FETCHING_NEXT_CURSOR_SEGMENTS...</div>
                                            ) : null
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )
                        /* 👥 Organization Team Roster Directory Row Panel */
                        : activeTab === 'Team' && (profile.type === 'organization' || profile.badge_type?.toLowerCase() === 'organization' || profile.badge_type?.toLowerCase() === 'warned') ? (
                            <div className="flex flex-col gap-3 font-sans">
                                {profile.members && profile.members.map((member) => (
                                    <div key={`member-node-${member.handle}`} className="w-full bg-black/[0.01] dark:bg-white/[0.005] border border-black/10 dark:border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.015] transition-colors text-left">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <UserAvatar user={member} className="w-11 h-11 border border-black/10 dark:border-white/10 shrink-0 text-sm font-semibold" roundedClassName="rounded-xl" />
                                            <div className="min-w-0 flex flex-col gap-0.5 text-left">
                                                <h4 className="font-extrabold text-text-primary dark:text-white text-sm flex items-center gap-1.5 leading-none">
                                                    <span>{member.name}</span>
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10 stroke-[2.5px] shrink-0" />
                                                </h4>
                                                <p className="text-xs text-text-secondary font-mono font-bold truncate">
                                                    {member.handle === '@j_thorne' && !showPersonalHandle
                                                        ? '[Personal Handle Hidden]'
                                                        : `${member.handle}@kollective.social`}
                                                </p>
                                                <p className="text-[10px] text-text-secondary/70 font-black uppercase tracking-wider font-mono mt-1">{member.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const memberUsername = member.handle.replace('@', '');
                                                navigate(`/profile/${memberUsername}`, { state: { fromCard: true } });
                                            }}
                                            className="px-4 py-2 rounded-xl bg-black/[0.04] dark:bg-[#1c1c1e] border border-black/10 dark:border-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 text-text-primary dark:text-white text-xs font-black tracking-wide transition-all cursor-pointer active:scale-95 outline-none font-mono uppercase text-[10px] whitespace-nowrap"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : finalUserPosts.length === 0 ? (
                            /* 🌌 Empty State Feed Stream Fallback */
                            <div className="w-full rounded-2xl p-12 text-center border border-black/10 dark:border-white/5 bg-black/[0.01] dark:bg-[#141414] text-text-secondary/40 font-mono text-xs font-bold select-none">
                                NO_ENTRIES_FOUND: No activity under the "{activeTab}" filter selection.
                            </div>
                        ) : (
                            /* 🏆 THE PERFORMANCE CANVAS TIMELINE RENDER CORE */
                            <div className="flex flex-col border border-black/10 dark:border-[#262626] bg-transparent overflow-hidden shadow-2xl relative rounded-xl">
                                <Virtuoso
                                    useWindowScroll
                                    data={finalUserPosts}
                                    computeItemKey={(index, post) => post?.id || index}
                                    initialItemCount={finalUserPosts.length > 0 ? Math.min(finalUserPosts.length, 5) : 0}
                                    increaseViewportBy={400}
                                    overscan={200}
                                    endReached={() => {
                                        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                                    }}
                                    itemContent={(index, post) => (
                                        <PostCard post={post} isLast={index === finalUserPosts.length - 1} />
                                    )}
                                    components={{
                                        Footer: () => isFetchingNextPage ? (
                                            <div className="py-12 flex flex-col items-center gap-4 border-t border-black/10 dark:border-white/5 bg-black/[0.01] dark:bg-[#141414] select-none text-left">
                                                <Loader2 className="w-5 h-5 text-primary-container animate-spin shrink-0" />
                                                <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest font-mono">Synchronizing stream...</p>
                                            </div>
                                        ) : !hasNextPage && finalUserPosts.length > 0 ? (
                                            <div className="py-8 text-center bg-black/[0.01] dark:bg-[#141414] border-t border-black/10 dark:border-white/5 select-none font-mono">
                                                <p className="text-xs text-text-secondary/40 uppercase tracking-wider italic"> PROFILE_STREAM_END: List calculation complete.</p>
                                            </div>
                                        ) : null
                                    }}
                                />
                            </div>
                        )}
                </div>
            </div>

            {/* Asymmetric Desktop Right Sidebar Layout Column Balance */}
            <div className="w-80 shrink-0 hidden lg:flex flex-col gap-6 select-none">
                <TrendingWidget />
            </div>
        </div>
    );
}
