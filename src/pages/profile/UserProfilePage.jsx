// src/features/profile/UserProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useStore } from '../../store/useStore';
import { useQueryClient } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import { cn } from '../../lib/utils';
import { resolveUserPersona } from '../../utils/accountMapper';
import { PostCard } from '../../components/posts/PostCard';
import VerificationBadge from '../../components/VerificationBadge';
import UserAvatar from '../../components/accounts/UserAvatar';
import { TrendingWidget } from '../../components/TrendingWidget';
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle, ShieldCheck, MessageSquare } from 'lucide-react';
import { useDirectMessageStore } from '../../store/useDirectMessageStore';
import {
  useProfileQuery,
  useProfileTimelineQuery,
  useToggleFollowMutation,
  useProfileConnectionsQuery
} from '../../features/profile/useProfileFeature';

export function UserProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const openDM = useDirectMessageStore((state) => state.openDM);
  const queryClient = useQueryClient();

  const currentUser = useAuthStore((state) => state.user);
  const activeAccount = useAuthStore((state) => state.activeAccount);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [activeTab, setActiveTab] = useState('Posts'); // Tracks base tabs ('Posts', 'Media', 'Team')
  const [connectionView, setConnectionView] = useState(null); // 🚀 NEW: Tracks 'followers' | 'following' view overlays;
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

  // 🛡️ Safe guard isOwnProfile boolean evaluations
  const isOwnProfile = useMemo(() => {
    if (!currentUser && !activeAccount) return false;
    const currentHandle = (currentUser?.handle || activeAccount?.handle || '').toLowerCase().replace('@', '');
    const currentName = (currentUser?.username || activeAccount?.username || '').toLowerCase();
    return currentHandle === cleanUsername || currentName === cleanUsername;
  }, [currentUser, activeAccount, cleanUsername]);

  // Parse remote server data layouts safely and inject structural defaults dynamically
  const profile = useMemo(() => {
    const base = remoteProfile?.data || remoteProfile?.user || remoteProfile;

    // Target active account data loops if viewing your own profile row
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

    // Standardized mock team lists and data extensions to bind onto your active schema
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

  // Sync remote follow mapping updates cleanly
  useEffect(() => {
    if (remoteProfile) {
      const base = remoteProfile.data || remoteProfile.user || remoteProfile;
      const followStatus = !!(base?.following || base?.relationship?.following);
      setIsFollowing(followStatus);
    }
  }, [remoteProfile]);

  const showPersonalHandle = useStore((state) => state.showPersonalHandleOnOrg);

  // Flatten timeline parameters from TanStack infinite queries pages
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
      <div className="max-w-7xl mx-auto p-6 text-center text-xs font-mono text-text-secondary animate-pulse">
        COMPILING_DECENTRALIZED_IDENTITY_SCHEMA...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex gap-16 p-4 bg-[#090d12]X">
      {/* Left Main Axis Column Container */}
      <div className="flex-1 flex flex-col gap-6 max-w-3xl">

        {/* Back Button Action Header Row */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/5 mb-2">
          {location.state?.fromCard && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all active:scale-95 flex items-center justify-center bg-transparent cursor-pointer"
              title="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}
          <div>
            <h2 className="font-bold text-text-primary text-lg leading-tight">{profile.name}</h2>
            <p className="text-[12px] text-text-secondary font-mono">{profile.postsCount} pulses recorded</p>
          </div>
        </div>

        {/* Cover Banner and Avatar Profile Deck Layer */}
        <div className="glass-panel rounded-2xl overflow-hidden relative border border-white/5 bg-[#141414]">
          {/* Cover Banner */}
          <div className="h-48 w-full relative bg-gradient-to-r from-primary-container/20 via-[#0d0d0d] to-[#1a1822] overflow-hidden select-none">
            {profile.banner ? (
              <img alt="User profile cover canvas banner" className="w-full h-full object-cover opacity-80" src={profile.banner} />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary-container,#d32f2f),transparent)] opacity-30" />
            )}
          </div>

          {/* Integrated Biography Block Info Core Area */}
          <div className="p-6 relative flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <UserAvatar
                user={profile}
                className="w-24 h-24 md:w-32 md:h-32 border-4 border-[#141414] shadow-2xl mt-[-64px] md:mt-[-80px] relative z-10 text-3xl md:text-4xl bg-[#1d1d1f]"
                roundedClassName="rounded-2xl"
              />

              <div className="flex items-center gap-2.5 font-mono text-xs uppercase font-bold tracking-wider">
                {!isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => openDM(profile)}
                    className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all active:scale-95 flex items-center justify-center cursor-pointer bg-transparent"
                    title="Send Direct Message"
                  >
                    <MessageSquare className="w-4 h-4 text-primary-container" />
                    <span>Message</span>
                  </button>
                )}
                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => navigate('/settings/profile')}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 cursor-pointer bg-surface-container-high border border-white/10 text-text-primary hover:bg-white/10"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    disabled={toggleFollowMutation.isPending}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 cursor-pointer",
                      isFollowing
                        ? "bg-surface-container-high border border-white/10 text-text-secondary hover:text-red-400 hover:border-red-500/30"
                        : "bg-primary-container text-white crimson-glow hover:brightness-110 border-none"
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
                <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">{profile.name}</h1>
                {profile.badge_type && (
                  <VerificationBadge type={profile.badge_type.toLowerCase()} size="lg" />
                )}
              </div>
              <p className="text-sm text-text-secondary font-mono mt-1">
                {profile.handle}@kollective.social
              </p>
            </div>

            {/* Biography Content Body */}
            <p className="text-sm md:text-base text-text-primary/90 leading-relaxed max-w-2xl font-medium">
              {profile.bio}
            </p>

            {/* 🔬 [SCHOLAR MANIFEST] ORCID Peer Review Audit Trail Panel */}
            {isScholar && profile.orcid_id && (
              <div className="border border-white/10 bg-black/30 p-6 rounded-xl space-y-4 font-mono text-text-primary w-full max-w-2xl animate-in fade-in duration-300">
                <div>
                  <div className="text-xs font-bold text-emerald-400 tracking-wider mb-2 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    OPEN RESEARCH AUDIT MANIFEST
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>REGISTRY RESOURCE:</span>
                      <span className="text-text-primary font-bold">ORCID PUBLIC REGISTER</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1 items-center">
                      <span>IDENTIFICATION INDEX:</span>
                      <a href={`https://orcid.org{profile.orcid_id}`} target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline flex items-center gap-1 hover:text-blue-400">
                        {profile.orcid_id}<span>↗</span>
                      </a>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>SYNC INTEGRITY:</span>
                      <span className="text-emerald-400 font-bold">✓ SHA-256 MATCH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TOTAL REGISTERED WORKS:</span>
                      <span className="text-text-primary font-bold">{profile.publication_count || 0} PEER-REVIEWED PAPERS</span>
                    </div>
                  </div>
                </div>


                {profile.recent_publications && profile.recent_publications.length > 0 && (
                  <div className="border-t border-white/5 pt-3">
                    <div className="text-[10px] font-bold text-text-secondary tracking-wider mb-2 uppercase">LATEST INDEXED RELEASES (CRON VERIFIED):</div>
                    <ul className="space-y-2 font-sans text-xs">
                      {profile.recent_publications.map((title, idx) => (
                        <li key={idx} className="text-text-primary bg-white/[0.02] p-2.5 border-l-2 border-emerald-500 flex gap-2 rounded-r-lg">
                          <span className="text-text-secondary font-bold font-mono">[{idx + 1}]</span>
                          <span className="italic leading-normal">{title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 📰 [JOURNALIST PORTFOLIO] Synced Press Credentials Audit Track Panel */}
            {isJournalist && profile.portfolio_url && (
              <div className="border border-white/10 bg-black/30 p-6 rounded-xl space-y-4 font-mono text-text-primary w-full max-w-2xl animate-in fade-in duration-300">
                <div>
                  <div className="text-xs font-bold text-teal-400 tracking-wider mb-2 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    VERIFIED MEDIA AUDIT TRAILS
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>CREDENTIAL SYSTEM:</span>
                      <span className="text-text-primary font-bold">DIGITAL PORTFOLIO INDEX</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1 items-center">
                      <span>VERIFIED BYLINE LINK:</span>
                      <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline flex items-center gap-1 hover:text-blue-400">
                        Open Press Portfolio<span>↗</span>
                      </a>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>AFFILIATION OUTLET:</span>
                      <span className="text-text-primary font-bold">{profile.primary_outlet || "Independent Correspondent"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>INTEGRITY CLEARANCE:</span>
                      <span className="text-teal-400 font-bold">✓ SYNCED MEDIA PRESS PROFILE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🏢 [ORGANIZATION MANIFEST] Retractions accountability and probation alert blocks */}
            {isOrg && (
              <div className={cn(
                "border font-mono text-text-primary p-6 w-full max-w-2xl rounded-xl space-y-4 animate-in fade-in duration-300",
                profile.badge_type?.toLowerCase() === 'warned' ? "border-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(244,208,0,0.05)]" : "border-white/10 bg-black/30"
              )}>
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary tracking-wider uppercase">PUBLIC TRUST & RETRACTION MANIFEST</h3>
                    <p className="text-xs text-text-secondary mt-1">Institutional Corrections: {profile.correction_log?.length || 0} active logs</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCorrectionLog(!showCorrectionLog)}
                    className="text-xs border border-white/10 hover:border-white/20 px-3 py-1.5 bg-[#1c1c1e] text-text-secondary hover:text-text-primary font-bold transition-all cursor-pointer rounded-lg border-none"
                  >
                    {showCorrectionLog ? 'HIDE AUDIT' : `CORRECTION LOG (${profile.correction_log?.length || 0})`}
                  </button>
                </div>

                {profile.badge_type?.toLowerCase() === 'warned' && (
                  <div className="border border-yellow-500/30 bg-yellow-500/10 p-4 rounded-lg text-xs text-yellow-500 leading-relaxed font-sans">
                    <div className="font-bold uppercase mb-1 font-mono">⚠️ SYSTEM TRANSPARENCY WARNING FLAG:</div>
                    This institutional media publisher is serving a 30-day probation penalty for violating platform truth standards.
                    <div className="mt-2 text-text-secondary/70 italic">Reason: "{profile.strike_reason || 'Publication discrepancies.'}"</div>
                  </div>
                )}

                {showCorrectionLog && (
                  <div className="border-t border-dashed border-white/10 pt-4 mt-2 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {profile.correction_log && profile.correction_log.length > 0 ? (
                      <div className="space-y-3 pt-2">
                        {profile.correction_log.map((log, idx) => (
                          <div key={idx} className="text-xs border border-white/5 bg-white/[0.02] p-3.5 rounded-lg space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-text-secondary font-bold">
                              <span>INDEX LOG: #00{idx + 1}</span>
                              <span>FILED: {new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="text-text-primary font-bold">
                              ORIGINAL CLAIM: <span className="text-text-secondary line-through font-normal">{log.original_claim}</span>
                            </div>
                            <div className="text-emerald-400 bg-emerald-500/5 p-2.5 border-l-2 border-emerald-500 font-sans leading-normal rounded-r-lg">
                              <span className="font-mono font-bold text-[10px] block text-emerald-400 mb-0.5">VERIFIED CORRECTION:</span>
                              {log.correction_fact}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary/40 italic font-sans">No retractions logged inside active database cycle.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* ⚠️ Suspended dispute appeal panel banner flags layout */}
            {isOwnProfile && (profile.under_investigation || (profile.badge_type?.toLowerCase() === 'citizen' && profile.orcid_id)) && (
              <div className="border border-yellow-600/40 bg-yellow-500/5 p-5 rounded-xl flex flex-col gap-3 font-mono w-full max-w-2xl animate-in fade-in duration-300">
                <div className="text-sm text-yellow-500 font-bold tracking-wider uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  SCHOLAR STATUS SUSPENDED: DELTA ERROR DETECTED
                </div>
                <p className="text-xs text-text-secondary font-sans leading-relaxed">
                  Your researcher sync node reported a work drop discrepancy. Access credentials have been temporarily downgraded.
                  You can submit written statement appeals or ORCID merges on your dispute dashboard page.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/verify/dispute')}
                  className="w-fit px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border-none rounded-xl"
                >
                  Go to Scholar Dispute Portal ➔
                </button>
              </div>
            )}

            {/* Core Followers Statistics row metrics counters */}
            <div className="flex gap-8 border-t border-white/5 pt-4 w-full max-w-2xl font-mono text-sm">
              <button
                type="button"
                onClick={() => { setConnectionView(null); setActiveTab('Posts'); }}
                className={cn(
                  "flex gap-1.5 items-baseline bg-transparent border-none cursor-pointer transition-colors",
                  !connectionView ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <span className="font-extrabold text-lg">
                  {typeof profile.postsCount === 'number' ? profile.postsCount.toLocaleString() : profile.postsCount || 0}
                </span>
                <span className="text-md">posts</span>
              </button>

              <button
                type="button"
                onClick={() => setConnectionView('following')}
                className={cn(
                  "flex gap-1.5 items-baseline bg-transparent border-none cursor-pointer transition-colors p-1 rounded-lg",
                  connectionView === 'following' ? "text-primary-container font-bold" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <span className="font-extrabold text-lg text-text-primary">
                  {typeof profile.followingCount === 'number' ? profile.followingCount.toLocaleString() : profile.followingCount || 0}
                </span>
                <span className="text-md">following</span>
              </button>

              <button
                type="button"
                onClick={() => setConnectionView('followers')}
                className={cn(
                  "flex gap-1.5 items-baseline bg-transparent border-none cursor-pointer transition-colors p-1 rounded-lg",
                  connectionView === 'followers' ? "text-primary-container font-bold" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <span className="font-extrabold text-lg text-text-primary">
                  {typeof profile.followersCount === 'number' ? profile.followersCount.toLocaleString() : profile.followersCount || 0}
                </span>
                <span className="text-md">followers</span>
              </button>
            </div>

          </div>
        </div>

        {/* Metadata Verified Grid Layout Sheets */}
        {displayMetadata.length > 0 && (
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col w-full bg-white/[0.01]">
            {displayMetadata.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex border-b border-white/5 last:border-none items-stretch min-h-[44px]",
                  item.verified ? "bg-emerald-500/[0.01] border-l-4 border-l-emerald-500/30" : ""
                )}
              >
                <div className="w-1/3 px-4 py-3 bg-white/[0.005] border-r border-white/5 font-mono text-xs text-text-secondary uppercase tracking-wider flex items-center">
                  {item.key}
                </div>
                <div className="flex-1 px-4 py-3 text-sm truncate flex items-center gap-2">
                  {item.verified && (
                    <span className="material-symbols-outlined text-[16px] text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  )}
                  {item.url ? (
                    item.url.startsWith('/') ? (
                      <Link to={item.url} className={cn("truncate text-xs font-mono underline", item.verified ? "text-emerald-400 font-bold" : "text-primary-container")}>
                        {item.value}
                      </Link>
                    ) : (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={cn("truncate text-xs font-mono underline", item.verified ? "text-emerald-400 font-bold" : "text-primary-container")}>
                        {item.value}
                      </a>
                    )
                  ) : (
                    <span className={cn("truncate text-xs font-mono", item.verified ? "text-emerald-400 font-bold" : "text-text-primary")}>
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Section Tabs layout bar */}
        <div className="flex border-b border-[#262626] mt-4 w-full text-sm font-bold tracking-wide">
          {(profile.type === 'organization' || profile.badge_type?.toLowerCase() === 'organization' || profile.badge_type?.toLowerCase() === 'warned' ? ['Posts', 'Posts & replies', 'Media', 'Team'] : ['Posts', 'Posts & replies', 'Media']).map((tab) => {
            const isTabTargetReplies = tab === 'Posts & replies';
            const isActive = activeTab === tab || (isTabTargetReplies && activeTab === 'Replies');
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(isTabTargetReplies ? 'Replies' : tab)}
                className={cn(
                  "flex-1 py-4 text-center text-sm font-bold border-none bg-transparent cursor-pointer transition-all relative",
                  isActive ? "text-primary-container font-extrabold" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 inset-x-4 h-[2px] bg-primary-container rounded-t-full shadow-[0_0_8px_var(--color-primary-container)]" />
                )}
              </button>
            );
          })}
        </div>
        {/* Sub-reply dynamic lists stream or organization panel lists core wrapper viewports */}
        <div className="flex flex-col gap-6 mt-2">
          {/* 🚀 ROSTER ACTION INTERCEPT: If connectionView is armed, mount the vertical directory stack */}
          {connectionView ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 font-mono text-xs uppercase text-text-secondary">
                <span>Active User Directory: {connectionView}</span>
                <button
                  type="button"
                  onClick={() => setConnectionView(null)}
                  className="text-primary-container hover:underline bg-transparent border-none cursor-pointer font-bold"
                >
                  ✕ Close View
                </button>
              </div>

              {isConnectionsLoading ? (
                <div className="text-center font-mono text-xs text-text-secondary py-8 animate-pulse"> LOADING_RELATIONSHIP_MATRICES...</div>
              ) : connectionAccounts.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-[#141414] font-mono text-xs text-text-secondary/40">
                  NO_RELATIONS_RECORDED_ON_THIS_NODE
                </div>
              ) : (
                <div className="flex flex-col border border-[#262626] bg-transparent overflow-hidden shadow-2xl relative">
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
                        <div className="glass-panel p-4 border-b border-white/5 last:border-none flex items-center justify-between hover:bg-white/[0.015] bg-[#141414] transition-all duration-200 animate-in fade-in duration-150">
                          <div className="flex items-center gap-4 min-w-0">
                            <UserAvatar user={account} className="w-11 h-11 border border-white/10 shrink-0 text-sm font-semibold" roundedClassName="rounded-xl" />
                            <div className="min-w-0 flex flex-col gap-0.5">
                              <h4 className="font-bold text-text-primary text-sm flex items-center gap-1.5 leading-none">
                                {account.display_name || account.name || account.username}
                                {persona !== 'citizen' && <VerificationBadge type={persona} size="sm" />}
                              </h4>
                              <p className="text-xs text-text-secondary font-mono truncate">
                                @{account.username || 'anonymous'}@kollective.social
                              </p>
                              {account.bio && <p className="text-xs text-text-secondary/80 font-sans truncate mt-1 max-w-md">{account.bio}</p>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setConnectionView(null);
                              navigate(`/profile/${account.username}`, { state: { fromCard: true } });
                            }}
                            className="px-4 py-2 rounded-xl bg-[#1c1c1e] border border-white/5 hover:bg-white/10 text-text-primary text-xs font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            View Profile
                          </button>
                        </div>
                      );
                    }}
                    components={{
                      Footer: () => isFetchingNextConnectionsPage ? (
                        <div className="py-6 text-center text-xs font-mono text-text-secondary animate-pulse"> FETCHING_NEXT_CURSOR_SEGMENTS...</div>
                      ) : null
                    }}
                  />
                </div>
              )}
            </div>
          )
            /* 👥 Organization Team Roster Directory Row Panel */
            : activeTab === 'Team' && (profile.type === 'organization' || profile.badge_type?.toLowerCase() === 'organization' || profile.badge_type?.toLowerCase() === 'warned') ? (
              /* 👥 Organization Team Roster Directory */
              <div className="flex flex-col gap-3">
                {profile.members && profile.members.map((member) => (
                  <div key={member.handle} className="glass-panel rounded-xl p-4 border border-white/5 flex items-center justify-between hover:bg-white/[0.015] bg-white/[0.005]">
                    <div className="flex items-center gap-4 min-w-0">
                      <UserAvatar user={member} className="w-11 h-11 border border-white/10 shrink-0 text-sm font-semibold" roundedClassName="rounded-xl" />
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <h4 className="font-bold text-text-primary text-sm flex items-center gap-1.5 leading-none">
                          {member.name}
                          <span className="material-symbols-outlined text-[16px] text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                        </h4>
                        <p className="text-xs text-text-secondary font-mono truncate">
                          {member.handle === '@j_thorne' && !showPersonalHandle
                            ? '[Personal Handle Hidden]'
                            : `${member.handle}@kollective.social`}
                        </p>
                        <p className="text-[11px] text-text-secondary/70 font-semibold uppercase tracking-wider font-mono mt-1">{member.role}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const memberUsername = member.handle.replace('@', '');
                        navigate(`/profile/${memberUsername}`, { state: { fromCard: true } });
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1c1c1e] border border-white/5 hover:bg-white/10 text-text-primary text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : finalUserPosts.length === 0 ? (
              /* 🌌 Empty State Feed Stream Fallback */
              <div className="glass-card rounded-2xl p-12 text-center border border-white/5 bg-[#141414] font-mono text-xs text-text-secondary/40">
                NO_ENTRIES_FOUND: No activity under the "{activeTab}" filter selection.
              </div>
            ) : (
              /* 🏆 THE PERFORMANCE CANVAS RENDER CORE */
              <div className="flex flex-col border border-[#262626] bg-transparent overflow-hidden shadow-2xl relative">
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
                      <div className="py-12 flex flex-col items-center gap-4 border-t border-white/5 bg-[#141414]">
                        <div className="w-5 h-5 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                        <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest font-mono">Synchronizing stream...</p>
                      </div>
                    ) : !hasNextPage && finalUserPosts.length > 0 ? (
                      <div className="py-8 text-center bg-[#141414] border-t border-white/5">
                        <p className="text-xs text-text-secondary font-mono uppercase tracking-wider italic opacity-40"> PROFILE_STREAM_END: List calculation complete.</p>
                      </div>
                    ) : null
                  }}
                />
              </div>
            )}
        </div>
      </div>

      {/* Asymmetric Desktop Right Sidebar Layout Column Balance */}
      <div className="w-80 shrink-0 hidden lg:flex flex-col gap-6">
        <TrendingWidget />
      </div>
    </div>
  );
}
