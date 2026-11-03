import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '../VerificationBadge';
import { Link } from 'lucide-react';
import { cn } from "@/lib/utils";
// Import your design system's Radix portal primitives
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useAccountsStore } from '../../store/useAccountsStore';
import { usePresenceStore } from '../../store/usePresenceStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { apiFetch } from '../../api/apiClient';
import UserAvatar from './UserAvatar';

const formatCount = (count) => {
    if (count === null || count === undefined) return '0';
    if (typeof count === 'string' && isNaN(Number(count))) return count;
    const num = Number(count);
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

export const UserHoverCard = ({ author: propAuthor, children }) => {
    const storeAccount = useAccountsStore((state) => propAuthor?.id ? state.entities[propAuthor.id] : null);
    const author = storeAccount || propAuthor || {};
    const storeFollowingIds = useAccountsStore((state) => state.followingIds || state.following_ids);

    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    const isOnline = usePresenceStore((state) => author?.id ? !!state.activeList[String(author.id)] : false);

    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const abortControllerRef = useRef(null);

    const targetId = author?.id || author?.user_id;

    // Check if target is followed in the accounts store graph
    const isFollowedInStore = useMemo(() => {
        if (!targetId) return false;
        const sId = String(targetId);
        const inList = (storeFollowingIds || []).map(String).includes(sId);
        const inEntity = storeAccount?.following;
        if (inEntity !== undefined) return Boolean(inEntity);
        return inList;
    }, [storeFollowingIds, storeAccount, targetId]);

    // Compute whether this profile belongs to the currently logged in account
    const isSelf = useMemo(() => {
        if (!author) return false;
        const currentUserId = currentUser?.id || activeAccount?.id;
        const currentUsername = currentUser?.username || activeAccount?.username;
        const currentName = currentUser?.name || activeAccount?.name;

        const authorId = author.id || author.user_id;
        const authorUsername = author.username || (author.handle ? author.handle.replace('@', '') : null);
        const authorName = author.name;

        if (authorId === 'user-1' || authorName === 'Editor' || authorUsername === 'editor') return true;
        if (currentUserId && authorId && String(currentUserId) === String(authorId)) return true;
        if (currentUsername && authorUsername && currentUsername.toLowerCase() === authorUsername.toLowerCase()) return true;
        if (currentName && authorName && currentName.toLowerCase() === authorName.toLowerCase()) return true;
        return false;
    }, [author, currentUser, activeAccount]);

    const handleOpenChange = async (open) => {
        if (open) {
            if (!targetId) return;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsLoading(true);
            try {
                const res = await apiFetch(`/api/v1/accounts/${targetId}`, {
                    signal: controller.signal
                });
                const data = res?.data || res;
                if (data && typeof data === 'object') {
                    setProfileData(data);
                    const followBool = data.following !== undefined ? Boolean(data.following) : (data.is_following !== undefined ? Boolean(data.is_following) : undefined);
                    if (followBool !== undefined) {
                        setIsFollowing(followBool);
                        useAccountsStore.getState().importFetchedAccounts([
                            {
                                ...data,
                                id: String(targetId),
                                following: followBool,
                            }
                        ]);
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('Failed to fetch user hover card profile:', err);
                }
            } finally {
                if (abortControllerRef.current === controller) {
                    setIsLoading(false);
                }
            }
        } else {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        if (isPending) return;
        if (profileData?.following !== undefined) {
            setIsFollowing(Boolean(profileData.following));
        } else if (profileData?.is_following !== undefined) {
            setIsFollowing(Boolean(profileData.is_following));
        } else if (isFollowedInStore) {
            setIsFollowing(true);
        } else if (author?.following !== undefined) {
            setIsFollowing(Boolean(author.following));
        }
    }, [profileData, isFollowedInStore, author, isPending]);

    const handleFollowToggle = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isPending || !targetId) return;

        const nextState = !isFollowing;
        setIsPending(true);
        setIsFollowing(nextState);

        setProfileData((prev) => prev ? { ...prev, following: nextState, is_following: nextState } : { following: nextState });

        useAccountsStore.getState().importFetchedAccounts([
            {
                id: String(targetId),
                ...(profileData || author),
                following: nextState,
            }
        ]);

        try {
            const endpoint = nextState
                ? `/api/v1/accounts/${targetId}/follow`
                : `/api/v1/accounts/${targetId}/unfollow`;
            const res = await apiFetch(endpoint, { method: 'POST' });
            const resData = res?.data || res;
            const confirmedFollowing = resData?.following !== undefined ? Boolean(resData.following) : nextState;

            setIsFollowing(confirmedFollowing);
            setProfileData((prev) => prev ? { ...prev, following: confirmedFollowing, is_following: confirmedFollowing } : { following: confirmedFollowing });
            useAccountsStore.getState().importFetchedAccounts([
                {
                    id: String(targetId),
                    ...((typeof resData === 'object' && resData) || profileData || author),
                    following: confirmedFollowing,
                }
            ]);
        } catch (err) {
            console.warn('Failed to toggle follow in hover card:', err);
            setIsFollowing(!nextState);
            setProfileData((prev) => prev ? { ...prev, following: !nextState, is_following: !nextState } : { following: !nextState });
            useAccountsStore.getState().importFetchedAccounts([
                {
                    id: String(targetId),
                    ...(profileData || author),
                    following: !nextState,
                }
            ]);
        } finally {
            setIsPending(false);
        }
    };

    const handleNavigation = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const username = (author.handle || author.name?.toLowerCase().replace(/\s+/g, '_') || 'user').replace('@', '');
        navigate(`/profile/${username}`, { state: { fromCard: true } });
    };

    const bio = profileData?.bio ?? profileData?.note ?? author?.bio ?? '';
    const rawFollowers = profileData?.followers_count ?? profileData?.followersCount ?? profileData?.followers ?? author?.followers_count ?? author?.followersCount ?? 0;
    const formattedFollowers = formatCount(rawFollowers);
    const website = profileData?.website || profileData?.url || author?.website || 'kollective.social';
    const role = profileData?.role || author?.role || 'Citizen';
    const name = profileData?.name || profileData?.display_name || author?.name || 'User';
    const handle = profileData?.handle || profileData?.username || author?.handle || (author?.name ? `@${author.name.toLowerCase().replace(/\s+/g, '_')}` : '@user');
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;

    return (
        <HoverCard openDelay={150} closeDelay={200} onOpenChange={handleOpenChange}>
            {/* Trigger element wraps your child avatar/username safely */}
            <HoverCardTrigger asChild>
                <span className="cursor-pointer inline-flex items-center" onClick={handleNavigation}>
                    {children}
                </span>
            </HoverCardTrigger>

            {/* HoverCardContent uses a Portal under the hood, completely safe from overlap */}
            <HoverCardContent
                onClick={(e) => e.stopPropagation()}
                align="start"
                side="bottom"
                sideOffset={8}
                className="HoverCard w-72 bg-surface-container bg-[var(--surface-container)]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[999]"
            >
                {isLoading && !profileData ? (
                    /* Minimal Animated Loading Skeleton */
                    <div className="space-y-3 animate-pulse py-1 select-none">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white/10 shrink-0" />
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="h-3.5 bg-white/10 rounded w-2/3" />
                                <div className="h-2.5 bg-white/10 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <div className="h-2.5 bg-white/10 rounded w-full" />
                            <div className="h-2.5 bg-white/10 rounded w-4/5" />
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border/20">
                            <div className="h-2.5 bg-white/10 rounded w-16" />
                            <div className="h-2.5 bg-white/10 rounded w-24" />
                        </div>
                        <div className="h-2.5 bg-white/10 rounded w-20" />
                        {!isSelf && <div className="h-8 bg-white/10 rounded-xl w-full" />}
                    </div>
                ) : (
                    <>
                        {/* Summary Block */}
                        <div className="flex gap-3 items-start mb-3">
                            <UserAvatar
                                user={profileData || author}
                                name={name}
                                avatar={profileData?.avatar || profileData?.avatar_url || author.avatar}
                                className="w-11 h-11"
                                roundedClassName="rounded-xl"
                                showStatus={true}
                            />

                            <div className="min-w-0 flex-1">
                                <h4
                                    onClick={handleNavigation}
                                    className="font-semibold text-foreground/90 text-sm truncate flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                                >
                                    {name}
                                    {(profileData?.verified || author.verified) && <VerificationBadge type="journalist" size="md" className="opacity-80" />}
                                </h4>

                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-sm text-muted-foreground/100 truncate font-bold">
                                        {cleanHandle}@kollective.social
                                    </p>
                                    {isOnline && (
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                            Online
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bio Node */}
                        {bio && (
                            <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3 line-clamp-3 font-normal">
                                {bio}
                            </p>
                        )}

                        {/* Metadata Row */}
                        <div className="flex items-center justify-between text-lg mb-3 border-t border-border/20 pt-2.5">
                            <span className="font-medium text-muted-foreground/90">{role}</span>
                            {website && (
                                <a
                                    href={website.startsWith('http') ? website : `https://${website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[#c2185b]/80 hover:text-[#c2185b] font-semibold inline-flex items-center gap-1 transition-colors text-lg"
                                >
                                    <Link className="w-3 h-3 opacity-60" />
                                    {website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>

                        {/* Followers Count */}
                        <p className="text-md text-muted-foreground/70 mb-4">
                            <strong className="font-semibold text-foreground/80 mr-0.5">{formattedFollowers}</strong> followers
                        </p>

                        {/* Follow CTA Button - Hidden for Self Profile */}
                        {!isSelf && (
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleFollowToggle}
                                className={cn(
                                    "w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-xs",
                                    isPending && "opacity-70 cursor-not-allowed",
                                    isFollowing
                                        ? "bg-[var(--surface-container)]/50 border border-border/30 text-muted-foreground/80 hover:text-foreground"
                                        : "bg-[#c2185b]/80 hover:bg-[#c2185b] text-white/90 hover:text-white"
                                )}
                            >
                                {isPending ? 'Updating...' : (isFollowing ? 'Following ✓' : 'Follow')}
                            </button>
                        )}
                    </>
                )}
            </HoverCardContent>
        </HoverCard>
    );
};

export default UserHoverCard;


