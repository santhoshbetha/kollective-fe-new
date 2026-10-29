import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiFetch } from '../../api/apiClient';
import { UserHoverCard } from '../accounts/UserHoverCard';
import { UserAvatar } from '../accounts/UserAvatar';
import VerificationBadge from '../../components/VerificationBadge';
import { PostContent } from './PostContent';
import { PostMedia } from './PostMedia';
import { ImageLightbox } from '../../components/ImageLightbox';
import { KollectiveVideoPlayer } from '../../components/KollectiveVideoPlayer';
import { usePostActions } from '../../features/timeline/usePostActions';
import { useRsvpToAction } from '../../features/organize/useOrganizeFeature';
import { usePostsStore } from '../../store/usePostsStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useToggleBookmark } from '../../features/bookmarks/useToggleBookmark';
import { LoginPromptModal } from '../modals/LoginPromptModal';
import { getReplyCount, getReblogCount, getLikeCount } from '../../utils/postHelpers';
import { KollectiveImagePlayer } from '../../components/KollectiveImagePlayer';
import { cn } from "@/lib/utils";
import { saveFeedScrollTarget } from '../../utils/feedScrollManager';

import { ModerationAppealForm } from '../../features/moderation/components/ModerationAppealForm';

import {
    ExternalLink,
    Link as LinkIcon,
    Copy,
    AtSign,
    Mail,
    VolumeX,
    ShieldBan,
    Filter,
    Flag,
    GlobeLock,
    Scale,
    Clock
} from 'lucide-react';

const renderMenu = (post, showMenu, setShowMenu, authorHandle, domain, navigate, menuRef, menuPosition) => {
    if (!showMenu || !menuPosition?.isReady) return null;

    const handleExpandPost = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (post?.id) {
            const cardEl = e?.currentTarget?.closest('article') || document.getElementById(`post-${post.id}`);
            saveFeedScrollTarget({
                postId: post.id,
                displayPostId: post.id,
                cardElement: cardEl,
                scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
            });
            navigate(`/post/${post.id}`);
        }
    };

    const handleOpenOriginalPage = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const targetUrl = post?.url || post?.external_url || post?.uri || post?.original_url;
        if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
            toast.info('Opening original post link...');
        } else if (post?.id) {
            const cardEl = e?.currentTarget?.closest('article') || document.getElementById(`post-${post.id}`);
            saveFeedScrollTarget({
                postId: post.id,
                displayPostId: post.id,
                cardElement: cardEl,
                scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
            });
            navigate(`/post/${post.id}`);
            toast.info('Opening post details...');
        } else {
            toast.info('Post link unavailable');
        }
    };

    const handleCopyLink = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const linkText = `${window.location.origin}/post/${post?.id}`;
        navigator.clipboard.writeText(linkText)
            .then(() => toast.success('Link copied to clipboard!'))
            .catch(() => toast.success('Link copied to clipboard!'));
    };

    const handleMention = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (authorHandle) {
            navigator.clipboard.writeText(authorHandle).catch(() => { });
            toast.success(`Mention handle ${authorHandle} copied!`);
            navigate(`/timeline?mention=${encodeURIComponent(authorHandle)}`);
        }
    };

    const handlePrivateMention = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (authorHandle) {
            toast.success(`Private message channel opened for ${authorHandle}`);
            navigate(`/messages?user=${encodeURIComponent(authorHandle)}`);
        }
    };

    const handleMuteUser = async (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const authorId = post?.author?.id;
        try {
            if (authorId) {
                await apiFetch(`/api/v1/accounts/${authorId}/mute`, { method: 'POST' });
            }
        } catch (err) {
            console.warn('Mute request logged:', err);
        }
        if (post?.id) {
            usePostsStore.getState().removePostEntity(post.id);
        }
        toast.success(`You have muted ${authorHandle}.`);
    };

    const handleBlockUser = async (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const authorId = post?.author?.id;
        try {
            if (authorId) {
                await apiFetch(`/api/v1/accounts/${authorId}/block`, { method: 'POST' });
            }
        } catch (err) {
            console.warn('Block request logged:', err);
        }
        if (post?.id) {
            usePostsStore.getState().removePostEntity(post.id);
        }
        toast.success(`You have blocked ${authorHandle}.`);
    };

    const handleFilterPost = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (post?.id) {
            usePostsStore.getState().removePostEntity(post.id);
        }
        toast.success('This post has been filtered from your timeline.');
    };

    const handleReportUser = async (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const authorId = post?.author?.id;
        try {
            if (authorId && post?.id) {
                await apiFetch('/api/v1/reports', {
                    method: 'POST',
                    body: JSON.stringify({ account_id: authorId, status_ids: [post.id], comment: 'User report from timeline' })
                });
            }
        } catch (err) {
            console.warn('Report request logged:', err);
        }
        toast.success(`Report submitted for ${authorHandle}.`);
    };

    const handleBlockDomain = async (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (domain) {
            try {
                await apiFetch('/api/v1/domain_blocks', {
                    method: 'POST',
                    body: JSON.stringify({ domain })
                });
            } catch (err) {
                console.warn('Domain block request logged:', err);
            }
            toast.success(`Domain ${domain} has been blocked.`);
        }
    };

    const menuContent = (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                top: menuPosition.openUpward ? 'auto' : `${menuPosition.top}px`,
                bottom: menuPosition.openUpward ? `${window.innerHeight - menuPosition.top}px` : 'auto',
                left: `${menuPosition.left}px`,
                maxHeight: `${menuPosition.maxHeight}px`,
                zIndex: 9999
            }}
            className="w-72 bg-surface-container border border-outline-variant rounded-card shadow-2xl overflow-y-auto py-1.5 animate-in fade-in zoom-in-95 duration-100 font-sans custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Standard Navigation Actions */}
            <button
                type="button"
                onClick={handleExpandPost}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <ExternalLink className="w-4 h-4 text-text-secondary shrink-0" />
                <span>Expand this post</span>
            </button>

            <button
                type="button"
                onClick={handleOpenOriginalPage}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <LinkIcon className="w-4 h-4 text-text-secondary shrink-0" />
                <span>Open original page</span>
            </button>

            <button
                type="button"
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <Copy className="w-4 h-4 text-text-secondary shrink-0" />
                <span>Copy link to post</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            {/* Social Interaction Actions */}
            <button
                type="button"
                onClick={handleMention}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <AtSign className="w-4 h-4 text-text-secondary shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Mention {authorHandle}</span>
            </button>

            <button
                type="button"
                onClick={handlePrivateMention}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <Mail className="w-4 h-4 text-text-secondary shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Privately mention {authorHandle}</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            {/* Destructive / Moderation Actions */}
            <button
                type="button"
                onClick={handleMuteUser}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none min-w-0"
            >
                <VolumeX className="w-4 h-4 text-error shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Mute {authorHandle}</span>
            </button>

            <button
                type="button"
                onClick={handleBlockUser}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <ShieldBan className="w-4 h-4 text-error shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Block {authorHandle}</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            <button
                type="button"
                onClick={handleFilterPost}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <Filter className="w-4 h-4 text-error shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Filter this post</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            <button
                type="button"
                onClick={handleReportUser}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <Flag className="w-4 h-4 text-error shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Report {authorHandle}</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            <button
                type="button"
                onClick={handleBlockDomain}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <GlobeLock className="w-4 h-4 text-error shrink-0" />
                <span>Block domain {domain}</span>
            </button>
        </div>
    );

    return createPortal(menuContent, document.body);
};

// Module-level global state tracking which menu is currently open in the feed
let activeMenuPostId = null;
let activeMenuSetShowMenu = null;

export const PostCard = React.memo(function PostCard({
    post: propPost,
    isLast = false,
    standalone = false
}) {
    const reblogTargetId = propPost?.reblog?.id ||
        (typeof propPost?.reblog === 'string' ? propPost.reblog : null) ||
        propPost?.reblog_of_id ||
        propPost?.reblogOf;

    const storePost = usePostsStore((state) => propPost?.id ? state.entities[propPost.id] : null);
    const storeReblogTarget = usePostsStore((state) => reblogTargetId ? state.entities[reblogTargetId] : null);

    const post = storePost ? { ...propPost, ...storePost } : propPost;

    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const isOrgNonAdmin = activeAccount?.type === 'organization' && !['admin', 'owner'].includes(activeAccount?.role?.toLowerCase());
    const orgNonAdminTooltip = "Only administrators can perform social actions on behalf of this organization";

    const toggleBookmarkMutation = useToggleBookmark();
    const [isAppealOpen, setIsAppealOpen] = useState(false);
    const [hasAppealed, setHasAppealed] = useState(false);

    const displayPost = storeReblogTarget || (post?.reblog && typeof post.reblog === 'object' ? post.reblog : post);
    const rawAuthor = displayPost?.author || post?.author;
    const postOrg = displayPost?.organization || post?.organization;
    const hasOrgAttribution = Boolean(
        displayPost?.organization_id ||
        post?.organization_id ||
        postOrg ||
        rawAuthor?.type === 'organization'
    );
    const orgDisplayName = postOrg?.name || postOrg?.display_name || (rawAuthor?.type === 'organization' ? rawAuthor?.name : null) || 'Metro Tenant Union';

    const author = hasOrgAttribution ? {
        id: displayPost?.organization_id || post?.organization_id || postOrg?.id || rawAuthor?.id,
        name: orgDisplayName,
        username: postOrg?.username || (rawAuthor?.type === 'organization' ? rawAuthor?.username : 'metro_tenants'),
        handle: postOrg?.username ? `@${postOrg.username}` : (rawAuthor?.type === 'organization' ? rawAuthor?.handle : '@metro_tenants'),
        avatar: postOrg?.avatar_url || (rawAuthor?.type === 'organization' ? rawAuthor?.avatar : '/default-org.jpg'),
        avatar_url: postOrg?.avatar_url || (rawAuthor?.type === 'organization' ? rawAuthor?.avatar_url : '/default-org.jpg'),
        type: 'organization',
        role: 'Organization',
        verified: true
    } : rawAuthor;

    const reblogsCount = getReblogCount(displayPost);
    const likesCount = getLikeCount(displayPost);

    const isSelfPost = useMemo(() => {
        const targetAuthor = displayPost?.author || post?.author;
        if (!targetAuthor) return false;
        const currentUserId = currentUser?.id || activeAccount?.id;
        const currentUsername = currentUser?.username || activeAccount?.username;
        const currentName = currentUser?.name || activeAccount?.name;

        const authorId = targetAuthor.id;
        const authorUsername = targetAuthor.username || (targetAuthor.handle ? targetAuthor.handle.replace('@', '') : null);
        const authorName = targetAuthor.name;

        if (currentUserId && authorId && String(currentUserId) === String(authorId)) return true;
        if (currentUsername && authorUsername && currentUsername.toLowerCase() === authorUsername.toLowerCase()) return true;
        if (currentName && authorName && currentName.toLowerCase() === authorName.toLowerCase()) return true;
        return false;
    }, [displayPost?.author, post?.author, currentUser?.id, activeAccount?.id, currentUser?.username, activeAccount?.username, currentUser?.name, activeAccount?.name]);

    const isSelf = isSelfPost;

    const isRebloggedPost = useMemo(() => {
        return !!(
            post?.reblog ||
            post?.reblog_of_id ||
            post?.reblogOf ||
            post?.isReblog
        );
    }, [post?.reblog, post?.reblog_of_id, post?.reblogOf, post?.isReblog]);

    const targetPostId = displayPost?.id || post?.id;
    const isAlreadyReblogged = !!(post?.reblogged || post?.has_reblogged || displayPost?.reblogged || displayPost?.has_reblogged);

    const targetData = isRebloggedPost
        ? (displayPost || post?.reblog || {})  // Real source content for bookmarking logic
        : post;

    const isLiked = Boolean(
        targetData?.liked ||
        targetData?.has_liked ||
        post?.liked ||
        post?.has_liked
    );
    const isBookmarked = Boolean(
        targetData?.bookmarked ||
        targetData?.isBookmarked ||
        post?.bookmarked ||
        post?.isBookmarked
    );

    const { toggleLike, toggleReblog, toggleBookmark, isActionPending } = usePostActions();
    const rsvpMutation = useRsvpToAction();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginPromptMessage, setLoginPromptMessage] = useState("Please log in to interact with posts.");
    const [showMenu, setShowMenu] = useState(false);
    const [isActionJoined, setIsActionJoined] = useState(false);
    const [isCircleJoined, setIsCircleJoined] = useState(false);
    // 🎛️ Lightbox state parameters sandboxed per post card item
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const allImages = displayPost?.images || (displayPost?.image ? [displayPost.image] : (post?.images || (post?.image ? [post?.image] : [])));

    const triggerLoginPrompt = (message = "Please log in to interact with posts.") => {
        setLoginPromptMessage(message);
        setIsLoginPromptOpen(true);
    };

    const handleLikeClick = (e) => {
        if (e) e.stopPropagation();
        if (isOrgNonAdmin) return;
        if (!isAuthenticated) {
            triggerLoginPrompt("Please log in to like posts.");
            return;
        }
        if (targetPostId) {
            //toggleLike(targetPostId);
            toggleLike({
                postId: post?.id,
                reblogId: isRebloggedPost ? post?.reblog.id : null,
                isCurrentlyLiked: isLiked
            });
        }
    };

    const handleReblogClick = (e) => {
        if (e) e.stopPropagation();
        if (isOrgNonAdmin) return;
        if (isSelf) return;
        if (!isAuthenticated) {
            triggerLoginPrompt("Please log in to reblog posts.");
            return;
        }
        if (targetPostId) {
            toggleReblog(targetPostId);
        }
    };

    const handleBookmarkClick = (e) => {
        if (e) e.stopPropagation();
        if (!isAuthenticated) {
            triggerLoginPrompt("Please log in to bookmark posts.");
            return;
        }

        if (targetPostId) {
            //toggleBookmark(targetPostId);
            toggleBookmark({
                postId: post?.id, // Wrapper post ID
                reblogId: isRebloggedPost ? post?.reblog.id : null, // Target inner ID
                isCurrentlyBookmarked: isBookmarked
            });
        }
    };

    const handleCommentClick = (e) => {
        if (e) e.stopPropagation();
        if (!isAuthenticated) {
            triggerLoginPrompt("Please log in to comment on posts.");
            return;
        }
        if (targetPostId) {
            const cardEl = e?.currentTarget?.closest('article') || document.getElementById(`post-${post?.id}`);
            saveFeedScrollTarget({
                postId: post?.id,
                displayPostId: targetPostId,
                cardElement: cardEl,
                scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
            });
            navigate(`/post/${targetPostId}`);
        }
    };

    const handleJoinCircleClick = (e) => {
        if (e) e.stopPropagation();
        if (!isAuthenticated) {
            triggerLoginPrompt("Please log in to join circles.");
            return;
        }
        setIsCircleJoined(!isCircleJoined);
    };

    const handleJoinActionClick = (e) => {
        if (e) e.stopPropagation();
        if (isOrgNonAdmin) return;
        if (!isAuthenticated) {
            triggerLoginPrompt("Please log in to join actions.");
            return;
        }
        const nextState = !isActionJoined;
        setIsActionJoined(nextState);
        if (nextState) {
            rsvpMutation.mutate({ actionId: post?.actionId || 'action-1', status: 'Attending' });
        }
    };

    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, openUpward: false, maxHeight: 280, isReady: false });

    const updateMenuPosition = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 288;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow;
        const maxHeight = Math.min(280, openUpward ? spaceAbove - 16 : spaceBelow - 16);

        setMenuPosition({
            top: openUpward ? rect.top - 6 : rect.bottom + 6,
            left: Math.max(12, Math.min(window.innerWidth - menuWidth - 12, rect.right - menuWidth)),
            openUpward,
            maxHeight: Math.max(160, maxHeight),
            isReady: true
        });
    }, []);

    useEffect(() => {
        if (!showMenu) return;
        updateMenuPosition();

        const handleOutsideClick = (e) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setShowMenu(false);
                if (activeMenuPostId === post?.id) {
                    activeMenuPostId = null;
                    activeMenuSetShowMenu = null;
                }
            }
        };

        const handleScrollOrResize = (e) => {
            if (menuRef.current && menuRef.current.contains(e.target)) return;
            setShowMenu(false);
            if (activeMenuPostId === post?.id) {
                activeMenuPostId = null;
                activeMenuSetShowMenu = null;
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleOutsideClick);
            window.addEventListener('scroll', handleScrollOrResize, true);
            window.addEventListener('resize', handleScrollOrResize);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [showMenu, post?.id, updateMenuPosition]);

    useEffect(() => {
        return () => {
            if (activeMenuPostId === post?.id) {
                activeMenuPostId = null;
                activeMenuSetShowMenu = null;
            }
        };
    }, [post?.id]);

    const handleToggleMenu = () => {
        if (showMenu) {
            setShowMenu(false);
            if (activeMenuPostId === post?.id) {
                activeMenuPostId = null;
                activeMenuSetShowMenu = null;
            }
        } else {
            if (activeMenuPostId !== null && activeMenuPostId !== post?.id && activeMenuSetShowMenu !== null) {
                activeMenuSetShowMenu(false);
            }
            activeMenuPostId = post?.id;
            activeMenuSetShowMenu = setShowMenu;
            updateMenuPosition();
            setShowMenu(true);
        }
    };

    // ⚡ Top-Scope Unification: Safe payload normalization
    const videoSource = typeof post?.video === 'string'
        ? post?.video
        : post?.video?.url || post?.videoUrl;

    const authorRole = post?.author?.role || 'Journalist';
    const commentsDisplayCount = getReplyCount(displayPost) || getReplyCount(post);
    const handleMenuToggleClick = (e) => {
        e.stopPropagation();
        handleToggleMenu();
    };
    const authorHandle = author?.handle || displayPost?.author?.handle || post?.author?.handle || `@${(author?.name || 'user').toLowerCase().replace(/\s+/g, '')}@kollective.social`;
    const domain = displayPost?.domain || post?.domain || 'universeodon.com';

    const handleCardClick = useCallback((e) => {
        // Avoid navigating if clicking interactive buttons/links
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
            return;
        }
        if (showMenu) {
            setShowMenu(false);
            if (activeMenuPostId === post?.id) {
                activeMenuPostId = null;
                activeMenuSetShowMenu = null;
            }
            return;
        }
        if (activeMenuPostId !== null) {
            if (activeMenuSetShowMenu) {
                activeMenuSetShowMenu(false);
            }
            activeMenuPostId = null;
            activeMenuSetShowMenu = null;
            return;
        }
        const cardEl = e.currentTarget || document.getElementById(`post-${post?.id}`);
        saveFeedScrollTarget({
            postId: post?.id,
            displayPostId: displayPost?.id,
            cardElement: cardEl,
            scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
        });
        if (displayPost?.id) {
            navigate(`/post/${displayPost?.id}`);
        } else {
            navigate(`/post/${post?.id}`);
        }
    }, [navigate, displayPost?.id, post?.id, showMenu]);

    const isSoftDeleted = Boolean(
        post?.is_deleted ||
        post?.soft_deleted ||
        displayPost?.is_deleted ||
        displayPost?.soft_deleted ||
        post?.status === 'soft_deleted' ||
        post?.status === 'rejected' ||
        post?.status === 'resolved_deleted' ||
        post?.status === 'deleted' ||
        displayPost?.status === 'soft_deleted' ||
        displayPost?.status === 'rejected' ||
        displayPost?.status === 'resolved_deleted' ||
        displayPost?.status === 'deleted' ||
        post?.deleted === true ||
        displayPost?.deleted === true
    );
    const isAppealed = Boolean(
        post?.status === 'appealed' ||
        displayPost?.status === 'appealed' ||
        hasAppealed
    );

    // SOFT-DELETED / GOVERNANCE ADJUDICATED POST STYLE
    if (isSoftDeleted) {
        if (!isSelf) {
            return (
                <div className={cn(
                    "p-4 border-b border-[#262626] bg-[#141414] text-neutral-400 font-sans flex items-center justify-between gap-3 text-xs select-none",
                    isLast ? "border-transparent" : "border-black/20 dark:border-white/10"
                )}>
                    <div className="flex items-center gap-2.5">
                        <Scale className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span className="italic">This post was soft-deleted by platform moderation.</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider">Removed</span>
                </div>
            );
        }

        return (
            <>
                <article
                    id={post?.id ? `post-${post.id}` : undefined}
                    data-post-id={post?.id}
                    data-display-post-id={displayPost?.id}
                    className={cn(
                        "p-6 flex flex-col gap-4 border-b border-[#262626] bg-[#141414] transition-all relative select-none",
                        isLast ? "border-transparent" : "border-black/20 dark:border-white/10",
                        standalone ? "glass-card rounded-[20px] border border-amber-500/20 shadow-xl" : "border-l-4 border-l-amber-500/60"
                    )}
                >
                    {/* Header info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[#1A1616]">
                                <UserHoverCard author={author}>
                                    <UserAvatar user={author} className="w-10 h-10" showStatus={false} />
                                </UserHoverCard>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-text-primary text-sm truncate">{author?.name}</span>
                                <span className="text-xs text-text-secondary font-mono truncate">{authorHandle} • {displayPost?.time || "Recently"}</span>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Soft-Deleted
                        </span>
                    </div>

                    {/* Moderation Explanation Box */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2.5 text-left">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                            <Scale className="w-4 h-4 stroke-[2.5px]" />
                            <span>Content Soft-Deleted by Moderation</span>
                        </div>
                        <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                            This publication has been soft-deleted and removed from public discovery feeds following governance moderation review. As the author, you have the right to submit a formal dispute to the regional governance panel.
                        </p>
                        {(displayPost?.rejection_reason || post?.rejection_reason || post?.reason) && (
                            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg text-xs font-mono text-neutral-300">
                                <span className="text-neutral-500 font-black uppercase text-[10px] block mb-0.5 tracking-wider">Adjudication Note:</span>
                                {displayPost?.rejection_reason || post?.rejection_reason || post?.reason}
                            </div>
                        )}
                        {(displayPost?.text || displayPost?.content || post?.text || post?.content) && (
                            <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-xs font-sans text-neutral-400 italic line-clamp-2">
                                "{displayPost?.text || displayPost?.content || post?.text || post?.content}"
                            </div>
                        )}
                    </div>

                    {/* Dispute Actions */}
                    <div className="flex items-center justify-between pt-1 font-mono">
                        {isAppealed ? (
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Dispute Under Review by Governance Council</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-[11px] text-neutral-500">Appeal routes directly to your country zone operator matrix.</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAppealOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-container text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none shadow-md"
                                >
                                    <Scale className="w-3.5 h-3.5 stroke-[2.5px]" />
                                    <span>Dispute Soft-Delete</span>
                                </button>
                            </>
                        )}
                    </div>
                </article>

                <ModerationAppealForm
                    isOpen={isAppealOpen}
                    onClose={() => setIsAppealOpen(false)}
                    incidentId={displayPost?.incident_id || post?.incident_id || displayPost?.id || post?.id}
                    onSubmitted={() => setHasAppealed(true)}
                />
            </>
        );
    }

    // SYSTEM AI POST STYLE
    if (post?.isSystem) {
        return (
            <article className={`p-6 flex flex-col gap-4 border-b ${isLast ? 'border-transparent' : 'border-black/20 dark:border-white/20'}  
            ${standalone
                    ? 'bg-surface-crimson-low/20 rounded-[16px] border border-primary-container/20 shadow-md'
                    : 'bg-surface-crimson-low/10 border-l-4 border-l-primary-container'
                }`}>
                {/* User Profile Avatar */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white crimson-glow">
                        <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-primary">{post?.title}</h4>
                        <p className="text-sm text-text-secondary">{post?.author.role} • {post?.time}</p>
                    </div>
                </div>

                <p className="font-body-md text-text-primary/90">
                    Trend Alert: Community discussions around <span className="text-primary-container font-bold">"Digital Autonomy"</span> have increased by 140% in the last 24 hours. The Collective is polarizing around Clause 14.
                </p>

                <div className="bg-surface-ink rounded-xl p-4 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary-container">trending_up</span>
                        <span className="text-sm font-bold">New Policy Draft Available</span>
                    </div>
                    <button
                        onClick={() => alert('Opening policy draft...')}
                        className="text-primary-container font-bold text-sm hover:underline"
                    >
                        {post?.actionText}
                    </button>
                </div>
            </article>
        );
    }

    if (post?.category === 'voice') {
        return (
            <>
                <article
                    id={post?.id ? `post-${post.id}` : undefined}
                    data-post-id={post?.id}
                    data-display-post-id={displayPost?.id}
                    onClick={handleCardClick}
                    // Replace Line 12 in Part 2 layout frame code block with this:
                    className={cn(
                        "relative p-0 border-b border-[#262626] transition-all group cursor-pointer bg-[#0e1117] hover:bg-[#131720]  bg-[#111720]X hover:bg-[#161f2b]X",
                        /* 
                        🚀 THE ATTENTION RAIL: Adds a solid 3px crimson stripe on the left edge.
                        This frames the Voice post instantly without breaking the scroll axis line.
                        */
                        "border-l-[3px] border-l-primary-container",
                        standalone ? "glass-card rounded-2xl border border-primary-container/30 crimson-glow shadow-[inset_0_0_12px_rgba(211,47,47,0.08)] overflow-hidden" : "",
                        showMenu ? "z-30" : "z-10"
                    )}

                >
                    {/* 📣 Absolute Positioning Category Badge Overlay */}
                    <div className="absolute top-0 left-0 bg-primary-container text-white px-4 py-1.5 flex items-center gap-2 rounded-br-xl z-20 shadow-md">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            campaign
                        </span>
                        <span className="font-bold text-xs uppercase tracking-widest font-mono">VOICE</span>
                    </div>

                    {/* 🛠️ More Actions Kebab Context Layout Anchor */}
                    <div className="absolute top-3 right-4 flex items-center gap-2 z-20">
                        <div className="relative">
                            <button
                                ref={buttonRef}
                                onClick={handleMenuToggleClick}
                                className="p-2 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/60 text-text-secondary hover:text-white transition-all cursor-pointer flex items-center justify-center border border-white/5"
                                title="More actions"
                            >
                                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                            </button>
                            {renderMenu && renderMenu(post, showMenu, handleToggleMenu, authorHandle, domain, navigate, menuRef, menuPosition)}
                        </div>
                    </div>

                    {/* Editorial Padding Content Arena */}
                    <div className="p-8 flex flex-col gap-6 pt-14">

                        {/* Header Context Section */}
                        <div className="flex flex-col gap-3">
                            <UserHoverCard author={post?.author}>
                                <div className="flex items-center gap-4 hover:opacity-90 transition-opacity">
                                    <UserAvatar user={post?.author} className="w-12 h-12" showStatus={false} />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-base md:text-lg text-text-primary leading-tight">
                                                {post?.author?.name}
                                            </h3>
                                            <VerificationBadge type="journalist" size="lg" />
                                        </div>
                                        <p className="text-xs md:text-sm text-text-secondary font-medium">
                                            {authorRole} • {post?.time || 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            </UserHoverCard>

                            {/* Co-author attribution layouts if organization accounts manage it */}
                            {post?.author?.type === 'organization' && (
                                <div className="mt-1 ml-16 flex items-center gap-1.5 text-xs text-text-secondary">
                                    <span>posted by</span>
                                    <span className="font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1">
                                        {post?.author?.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content Core Body Elements */}
                        <div className="flex flex-col gap-3">
                            <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight leading-tight group-hover:text-primary-container transition-colors duration-300">
                                {post?.title}
                            </h2>

                            {post?.contentWarning ? (
                                <ContentWarningWrapper warning={post?.contentWarning}>
                                    <p className="font-body-lg text-base md:text-lg text-text-primary/90 leading-relaxed font-normal">
                                        {post?.text}
                                    </p>
                                </ContentWarningWrapper>
                            ) : (
                                <p className="font-body-lg text-base md:text-lg text-text-primary/90 leading-relaxed font-normal">
                                    {post?.text}
                                </p>
                            )}
                        </div>

                        {/* Integrated Rich Media Injection Switchboard Block */}
                        {videoSource ? (
                            <KollectiveVideoPlayer
                                src={videoSource}
                                poster={post?.videoPoster || post?.image?.url}
                                isGif={post?.isGif}
                                title={post?.title}
                            />

                        ) : post?.image?.url ? (
                            <>
                                <div
                                    className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/5 cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }}
                                >
                                    <img
                                        alt={post?.imageMeta || "Editorial Voice Visual"}
                                        className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-700"
                                        src={post?.image?.url}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/77 via-black/10 to-transparent" />

                                    {/* Avatar Stack & Image Meta Overlay Context Row */}
                                    <div className="absolute bottom-4 left-6 flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full border border-surface-ink bg-white/10 backdrop-blur-xs flex items-center justify-center text-[10px] text-white/40">1</div>
                                            <div className="w-6 h-6 rounded-full border border-surface-ink bg-white/10 backdrop-blur-xs flex items-center justify-center text-[10px] text-white/40">2</div>
                                            <div className="w-6 h-6 rounded-full border border-surface-ink bg-white/10 backdrop-blur-xs flex items-center justify-center text-[10px] text-white/40">3</div>
                                        </div>
                                        {post?.imageMeta && (
                                            <span className="text-[11px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md border border-white/5 shadow-sm">
                                                {post?.imageMeta}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Render the refactored player block, feeding parameters directly down to the child layer */}
                                <KollectiveImagePlayer
                                    src={post?.image.url} // ✅ Fixed
                                    staticUrl={post?.image.static_url} // ✅ Matches your PostJSON object key!
                                    blurhash={post?.image.blurhash}    // ✅ Matches your PostJSON object key!
                                    imageMeta={post?.image.imageMeta || post?.imageMeta}
                                    onClick={() => {
                                        setCarouselIndex(0);
                                        setCarouselOpen(true);
                                    }}
                                />
                            </>
                        ) : null}

                        {/* Action Bar Engagement Matrix Row Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-text-secondary">
                            <div className="flex items-center gap-6">

                                {/* Standard Response Bubble Action button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleCommentClick(); }}
                                    className="flex items-center gap-2 font-bold transition-all border-none bg-transparent cursor-pointer hover:text-text-primary hover:scale-105 active:scale-95"
                                    title="Comment"
                                >
                                    <span className="material-symbols-outlined text-[18px]">reply</span>
                                    <span className="text-xs md:text-sm">
                                        {commentsDisplayCount.toLocaleString()}
                                    </span>
                                </button>

                                {/* Reblog/Boost action button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleReblogClick(); }}
                                    disabled={isActionPending || isAlreadyReblogged || isOrgNonAdmin}
                                    className={cn(
                                        "flex items-center gap-2 font-bold transition-all border-none bg-transparent",
                                        isOrgNonAdmin
                                            ? "opacity-30 cursor-not-allowed"
                                            : isAlreadyReblogged
                                            ? "text-emerald-500 font-extrabold cursor-default opacity-80"
                                            : "cursor-pointer hover:text-text-primary hover:scale-105 active:scale-95"
                                    )}
                                    title={isOrgNonAdmin ? orgNonAdminTooltip : "Boost"}
                                >
                                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isAlreadyReblogged ? "'wght' 700" : "'wght' 400" }}>
                                        repeat
                                    </span>
                                    <span className="text-xs md:text-sm">
                                        {reblogsCount.toLocaleString()}
                                    </span>
                                </button>

                                {/* Heart / Endorsement Tracker button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLikeClick();
                                    }}
                                    disabled={isActionPending || isOrgNonAdmin}
                                    className={cn(
                                        "flex items-center gap-2 font-bold transition-all border-none bg-transparent",
                                        isOrgNonAdmin
                                            ? "opacity-30 cursor-not-allowed"
                                            : "cursor-pointer hover:text-text-primary hover:scale-105 active:scale-95",
                                        post?.liked ? "text-primary-container font-extrabold" : ""
                                    )}
                                    title={isOrgNonAdmin ? orgNonAdminTooltip : post?.liked ? "Unlike" : "Like"}
                                >
                                    <span
                                        className="material-symbols-outlined text-[18px]"
                                        style={{ fontVariationSettings: displayPost?.liked ? "'FILL' 1" : "'FILL' 0" }}>
                                        star
                                    </span>
                                    <span>
                                        {likesCount.toLocaleString()}
                                    </span>
                                </button>
                            </div>

                            {/* Interactive Campaign/Action Button Core Interface */}
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleJoinActionClick(); }}
                                disabled={isActionPending || isOrgNonAdmin}
                                title={isOrgNonAdmin ? orgNonAdminTooltip : undefined}
                                className={cn(
                                    "px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all shadow-md active:scale-95 border",
                                    isOrgNonAdmin
                                        ? "opacity-30 cursor-not-allowed pointer-events-none bg-white/5 text-text-secondary border-white/5"
                                        : isActionJoined
                                        ? "bg-white/5 text-primary-container border-white/10 cursor-pointer"
                                        : "bg-primary-container text-white border-transparent hover:brightness-110 crimson-glow cursor-pointer"
                                )}
                            >
                                {isActionJoined ? '✓ Joined Action' : 'Join the Action'}
                            </Button>
                        </div>
                    </div>
                </article>
                {/* Lightbox Modals & Identity Overlay elements */}
                <ImageLightbox
                    isOpen={carouselOpen}
                    images={allImages}
                    activeIndex={carouselIndex}
                    setActiveIndex={setCarouselIndex}
                    onClose={() => setCarouselOpen(false)}
                />

                <LoginPromptModal
                    isOpen={isLoginPromptOpen}
                    onClose={() => setIsLoginPromptOpen(false)}
                    message={loginPromptMessage}
                />
            </>
        );
    }

    // STANDARD / CAROUSEL POSTS
    return (
        <>
            <article
                id={post?.id ? `post-${post.id}` : undefined}
                data-post-id={post?.id}
                data-display-post-id={displayPost?.id}
                data-testid="post-card"
                onClick={handleCardClick}
                className={cn(
                    "p-5 border-b border-[#262626] transition-all group relative bg-[#141414] cursor-pointer",
                    isLast ? "border-transparent" : "border-black/20 dark:border-white/10",
                    standalone ? "glass-card rounded-2xl border border-white/5 shadow-lg" : "",
                    showMenu ? "z-30" : "z-10",
                    post?.isOptimistic ? "opacity-60 pointer-events-none" : ""
                )}
            >
                {/* 🔄 Reblogged Context Top Banner */}
                {isRebloggedPost && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 mb-3 px-1">
                        <span className="material-symbols-outlined text-[16px]">repeat</span>
                        <span className="truncate">
                            <span className="text-text-primary hover:underline cursor-pointer">
                                {post?.author?.name || post?.account?.display_name || 'Someone'}
                            </span>{" "}
                            reblogged
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[#1A1616]">
                            <UserHoverCard author={author}>
                                <UserAvatar user={author} className="w-10 h-10" showStatus={false} />
                            </UserHoverCard>
                        </div>
                        <div className="min-w-0 flex-1">
                            <UserHoverCard author={author}>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="post-author-tag font-bold text-text-primary text-sm md:text-base hover:underline truncate">
                                            {author?.name}
                                        </span>
                                        {author?.role && (
                                            <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider bg-surface-container-highest border border-white/5 rounded text-text-secondary">
                                                {author.role}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-text-secondary font-mono truncate mt-0.5">
                                        {authorHandle} • {displayPost?.time || "Just now"}
                                        {post?.isOptimistic && (
                                            <span className="ml-2 inline-flex items-center gap-1 font-bold text-primary-container animate-pulse">
                                                Sending...
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </UserHoverCard>

                            {/* Organization Secondary Sub-Attribution Banner */}
                            {hasOrgAttribution && rawAuthor && rawAuthor.name !== author.name && (
                                <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-lg w-fit">
                                    <span>posted by</span>
                                    <span className="font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1">
                                        {rawAuthor.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Dropdown Context Navigation Target */}
                        <div className="relative shrink-0">
                            <button
                                ref={buttonRef}
                                onClick={(e) => { e.stopPropagation(); handleToggleMenu(); }}
                                className="p-2 hover:bg-white/5 rounded-full text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer"
                                title="More actions"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    more_horiz
                                </span>
                            </button>
                            {renderMenu && renderMenu(post, showMenu, handleToggleMenu, authorHandle, domain, navigate, menuRef, menuPosition)}
                        </div>
                    </div>

                    {/* 🏆 DECOUPLED CONTENT WRAPPERS */}
                    <div className="text-sm md:text-base text-text-primary leading-relaxed break-words mt-1">
                        {displayPost?.contentWarning ? (
                            <ContentWarningWrapper warning={displayPost.contentWarning}>
                                <PostContent post={displayPost} isFocus={false} />
                            </ContentWarningWrapper>
                        ) : (
                            <PostContent post={displayPost} isFocus={false} />
                        )}
                    </div>

                    {/* 🏆 SINGLE IMAGE INJECTION MODULE POINT */}
                    {(allImages.length > 0 || videoSource) && (
                        <div className="mt-3">
                            <PostMedia
                                post={displayPost}
                                setCarouselIndex={setCarouselIndex}
                                setCarouselOpen={setCarouselOpen}
                            />
                        </div>
                    )}

                    {/* Tag Chips Array Mapping Row Layout */}
                    {displayPost?.tags && displayPost.tags.length > 0 && (
                        <div className="mt-4 flex gap-1.5 flex-wrap">
                            {displayPost.tags.map((tag, idx) => {
                                const name = typeof tag === 'object' ? tag?.name || tag?.tag || '' : tag;
                                if (!name) return null;
                                return (
                                    <span
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/timeline?tag=${encodeURIComponent(name)}`);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-primary-container/20 text-primary-container font-semibold text-xs border border-white/5 transition-all cursor-pointer"
                                    >
                                        #{name}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Engagement Action Button Toolbar Row */}
                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/5 pt-4 w-full min-w-0 text-text-secondary">
                        <div className="flex items-center gap-6">

                            {/* Comment Navigation Action button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCommentClick(); }}
                                className="flex items-center gap-1.5 font-bold text-xs hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer"
                                title="Comment on post"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    reply
                                </span>
                                <span>{(getReplyCount(displayPost) || getReplyCount(post)).toLocaleString()}</span>
                            </button>

                            {/* Share / Reblog Sync Action button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleReblogClick(); }}
                                disabled={isSelf || isActionPending || isOrgNonAdmin}
                                className={cn(
                                    "reblog-btn flex items-center gap-1.5 font-bold text-xs transition-colors border-none bg-transparent",
                                    isOrgNonAdmin
                                        ? "opacity-30 cursor-not-allowed"
                                        : isSelf
                                        ? "opacity-30 cursor-not-allowed"
                                        : isAlreadyReblogged
                                        ? "text-emerald-500 font-extrabold cursor-pointer"
                                        : "hover:text-emerald-500 cursor-pointer"
                                )}
                                title={isOrgNonAdmin ? orgNonAdminTooltip : isSelf ? "Own post" : isAlreadyReblogged ? "Undo reblog" : "Reblog"}
                            >
                                <span
                                    className="material-symbols-outlined text-[18px]"
                                    style={{ fontVariationSettings: isAlreadyReblogged ? "'wght' 700" : "'wght' 400" }}
                                >
                                    repeat
                                </span>
                                <span>{reblogsCount.toLocaleString()}</span>
                            </button>

                            {/* Like Sync Engagement Action button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikeClick();
                                }}
                                disabled={isActionPending || isOrgNonAdmin}
                                className={cn(
                                    "like-btn flex items-center gap-1.5 font-bold text-xs transition-colors bg-transparent border-none",
                                    isOrgNonAdmin
                                        ? "opacity-30 cursor-not-allowed"
                                        : "cursor-pointer",
                                    (displayPost?.liked) ? "text-primary-container font-extrabold" : "hover:text-white"
                                )}
                                title={isOrgNonAdmin ? orgNonAdminTooltip : "Like"}
                            >
                                <span className="material-symbols-outlined text-[18px]"
                                    style={{ fontVariationSettings: (displayPost?.liked) ? "'FILL' 1" : "'FILL' 0" }}>
                                    star
                                </span>
                                <span>{likesCount.toLocaleString()}</span>
                            </button>
                        </div>

                        {/* Context Action layout toggle section */}
                        {displayPost?.communityJoinable ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleJoinCircleClick(); }}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-xl border font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer",
                                    isCircleJoined ? "bg-white/5 text-text-primary border-white/10" : "border-primary-container/40 text-primary-container hover:bg-primary-container hover:text-white"
                                )}
                            >
                                {isCircleJoined ? '✓ Joined Circle' : 'Join Circle'}
                            </button>
                        ) : (
                            <button
                                onClick={handleBookmarkClick}
                                disabled={isActionPending}
                                data-testid="bookmark-btn"
                                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
                                aria-pressed={isBookmarked}
                                className={cn(
                                    "flex items-center justify-center p-1.5 rounded-full transition-colors border-none bg-transparent ml-auto cursor-pointer",
                                    isBookmarked
                                        ? "text-amber-500 hover:bg-white/5 active-bookmarked"
                                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                                )}
                                title={isBookmarked ? "Bookmarked" : "Bookmark"}
                            >
                                <span
                                    data-testid="bookmark-icon"
                                    className="material-symbols-outlined text-[18px]"
                                    style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                    bookmark
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 🏆 FULLSCREEN IMAGE CAROUSEL CANVASES */}
                <ImageLightbox
                    isOpen={carouselOpen}
                    images={allImages}
                    activeIndex={carouselIndex}
                    setActiveIndex={setCarouselIndex}
                    onClose={() => setCarouselOpen(false)}
                />
                <LoginPromptModal
                    isOpen={isLoginPromptOpen}
                    onClose={() => setIsLoginPromptOpen(false)}
                    message={loginPromptMessage}
                />
            </article>
        </>
    );
}, (prevProps, nextProps) => {
    // Precise state shallow matching to bails out extra rendering loads
    return (
        prevProps.post?.id === nextProps.post?.id &&
        prevProps.post?.liked === nextProps.post?.liked &&
        (prevProps.post?.bookmarked ?? prevProps.post?.isBookmarked) === (nextProps.post?.bookmarked ?? nextProps.post?.isBookmarked) &&
        (prevProps.post?.reblogged ?? prevProps.post?.has_reblogged) === (nextProps.post?.reblogged ?? nextProps.post?.has_reblogged) &&
        getReblogCount(prevProps.post) === getReblogCount(nextProps.post) &&
        getLikeCount(prevProps.post) === getLikeCount(nextProps.post) &&
        getReplyCount(prevProps.post) === getReplyCount(nextProps.post) &&
        prevProps.isLast === nextProps.isLast &&
        prevProps.standalone === nextProps.standalone
    );
});

export const ContentWarningWrapper = ({ warning, children }) => {
    const [show, setShow] = useState(false);

    return (
        <div
            /* 
               🚀 THE UX FIX: Stop any clicking/text-selection actions inside this 
               warning box from accidentally triggering a parent row navigation card swipe!
            */
            onClick={(e) => e.stopPropagation()}
            className="mt-3 p-4 bg-surface-crimson-low/10 rounded-xl border border-primary-container/20 space-y-3 select-text"
        >
            <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-xs md:text-sm font-bold text-primary font-mono uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px] text-primary select-none">
                        warning
                    </span>
                    <span className="truncate max-w-[180px] sm:max-w-[300px]" title={warning}>
                        CW: {warning}
                    </span>
                </span>

                <button
                    type="button" // Guard explicitly against structural forms down-stream
                    onClick={() => setShow(!show)}
                    className="px-3.5 py-1.5 bg-surface-container text-text-primary rounded-lg text-xs md:text-sm font-bold hover:bg-primary-container hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                    {show ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            {show && (
                <div className="pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

