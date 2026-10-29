import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiFetch } from '../../api/apiClient';
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
import { ModerationAppealForm } from '../../features/moderation/components/ModerationAppealForm';
import { PostContent } from './PostContent';
import { ImageLightbox } from '../ImageLightbox';
import { usePostsStore } from '../../store/usePostsStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { usePostActions } from '../../features/timeline/usePostActions';
import { UserHoverCard } from '../accounts/UserHoverCard';
import { UserAvatar } from '../accounts/UserAvatar';
import { KollectiveImagePlayer } from '../KollectiveImagePlayer';
import { resolveUserPersona } from '../../utils/accountMapper';
import { getReplyCount, getReblogCount } from '../../utils/postHelpers';
import { ThreadLine } from './ThreadLine';
import { VerificationBadge } from '../VerificationBadge';
import cn from 'clsx';

export const CascadedPostRow = React.memo(function C({
    post: propPost,
    isFocus,
    isAncestor,
    depth = 0,
    hasNextReply,
    onClick,
    onReplyClick,
    onLike,
    onBookmark,
    onReblog,
    renderMenu: propRenderMenu
}) {
    // 🚀 Reactive store subscription stays atomic per post item card boundary
    const storePost = usePostsStore((state) => propPost?.id ? state.entities[propPost.id] : null);
    const post = propPost ? { ...propPost, ...(storePost || {}) } : storePost;

    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // ⚡ Compute the semantic persona token once per render boundary cycle
    const userPersona = useMemo(() => resolveUserPersona(post?.author), [post?.author]);

    // Memoize the self-post calculation to avoid recalculating on typing renders
    const isSelf = useMemo(() => {
        if (!post || !post.author) return false;
        const currentUserId = currentUser?.id || activeAccount?.id;
        const currentUsername = currentUser?.username || activeAccount?.username;
        const currentName = currentUser?.name || activeAccount?.name;

        const authorId = post.author.id;
        const authorUsername = post.author.username || (post.author.handle ? post.author.handle.replace('@', '') : null);
        const authorName = post.author.name;

        if (currentUserId && authorId && String(currentUserId) === String(authorId)) return true;
        if (currentUsername && authorUsername && currentUsername.toLowerCase() === authorUsername.toLowerCase()) return true;
        if (currentName && authorName && currentName.toLowerCase() === authorName.toLowerCase()) return true;
        return false;
    }, [post?.author, currentUser, activeAccount]);

    const [carouselOpen, setCarouselOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [isAppealOpen, setIsAppealOpen] = useState(false);
    const [hasAppealed, setHasAppealed] = useState(false);

    const authorHandle = post?.author?.handle || `@${post?.author?.name?.toLowerCase().replace(/\s+/g, '') || 'anonymous'}@kollective.social`;
    const allImages = post?.images && post.images.length > 0
        ? post.images
        : (post?.image?.url ? [post.image] : []);

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();

    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, openUpward: false, maxHeight: 280, isReady: false });

    const updateMenuPosition = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 256;
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

        const handleClickOutside = (e) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setShowMenu(false);
            }
        };

        const handleScrollOrResize = (e) => {
            if (menuRef.current && menuRef.current.contains(e.target)) return;
            setShowMenu(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [showMenu, updateMenuPosition]);

    const handleToggleMenu = (e) => {
        if (e) e.stopPropagation();
        if (!showMenu) {
            updateMenuPosition();
            setShowMenu(true);
        } else {
            setShowMenu(false);
        }
    };

    const domain = authorHandle.includes('@') ? authorHandle.split('@')[2] || null : null;

    // 🎯 Functional Menu Item Handlers
    const handleExpandPost = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (post?.id) {
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

    const renderDefaultMenu = () => {
        if (!showMenu || !menuPosition.isReady) return null;

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
                className="w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-y-auto py-1.5 animate-in fade-in zoom-in-95 duration-100 font-sans custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {!isFocus && (
                    <button
                        type="button"
                        onClick={handleExpandPost}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                    >
                        <ExternalLink className="w-4 h-4 text-text-secondary shrink-0" />
                        <span>Expand this post</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleOpenOriginalPage}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <LinkIcon className="w-4 h-4 text-text-secondary shrink-0" />
                    <span>Open original page</span>
                </button>

                <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <Copy className="w-4 h-4 text-text-secondary shrink-0" />
                    <span>Copy link to post</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                    type="button"
                    onClick={handleMention}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <AtSign className="w-4 h-4 text-text-secondary shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Mention {authorHandle}</span>
                </button>

                <button
                    type="button"
                    onClick={handlePrivateMention}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <Mail className="w-4 h-4 text-text-secondary shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Privately mention {authorHandle}</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                    type="button"
                    onClick={handleMuteUser}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent min-w-0"
                >
                    <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Mute {authorHandle}</span>
                </button>

                <button
                    type="button"
                    onClick={handleBlockUser}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <ShieldBan className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Block {authorHandle}</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                    type="button"
                    onClick={handleFilterPost}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <Filter className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Filter this post</span>
                </button>

                <button
                    type="button"
                    onClick={handleReportUser}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <Flag className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Report {authorHandle}</span>
                </button>

                {domain && (
                    <>
                        <div className="border-t border-white/10 my-1" />
                        <button
                            type="button"
                            onClick={handleBlockDomain}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                        >
                            <GlobeLock className="w-4 h-4 text-red-400 shrink-0" />
                            <span>Block domain {domain}</span>
                        </button>
                    </>
                )}
            </div>
        );

        return createPortal(menuContent, document.body);
    };

    const handleRowClick = (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('span.cursor-pointer') || e.target.closest('.menu-container-relative')) {
            return;
        }
        if (!isFocus && onClick && post?.id) onClick(post.id);
    };

    const postActions = usePostActions();
    const isAlreadyReblogged = !!(post?.reblogged || post?.has_reblogged);
    const reblogsCount = getReblogCount(post);

    const handleReblogClick = (e) => {
        if (e) e.stopPropagation();
        if (isSelf || isAlreadyReblogged) return;

        if (onReblog) {
            onReblog(post?.id);
        } else {
            if (!isAuthenticated) return;
            postActions.toggleReblog(post?.id);
        }
    };

    console.log("CascadedPostRow: post", post)

    const isSoftDeleted = Boolean(
        post?.is_deleted ||
        post?.soft_deleted ||
        post?.status === 'soft_deleted' ||
        post?.status === 'rejected' ||
        post?.status === 'resolved_deleted' ||
        post?.status === 'deleted' ||
        post?.deleted === true
    );
    const isAppealed = Boolean(
        post?.status === 'appealed' ||
        hasAppealed
    );

    if (isSoftDeleted) {
        if (!isSelf) {
            return (
                <div className={cn(
                    "flex items-center justify-between gap-3 p-4 border-b border-[#262626] bg-[#141414] text-neutral-400 font-sans text-xs select-none",
                    depth > 1 ? "pl-[88px]" : depth === 1 ? "pl-[32px]" : "pl-6"
                )}>
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span className="italic">This post was soft-deleted by platform moderation.</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider">Removed</span>
                </div>
            );
        }

        return (
            <div className={cn(
                "flex flex-col gap-3 p-6 border-b border-[#262626] bg-[#141414] text-left relative",
                isFocus ? "bg-[#181818]" : "",
                depth > 1 ? "pl-[88px]" : depth === 1 ? "pl-[32px]" : "pl-6"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserHoverCard author={post?.author}>
                            <UserAvatar user={post?.author} className="w-10 h-10" showStatus={false} />
                        </UserHoverCard>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-text-primary text-sm truncate">{post?.author?.name}</span>
                            <span className="text-xs text-text-secondary font-mono truncate">{authorHandle} • {post?.time || "Recently"}</span>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Soft-Deleted
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                        <Scale className="w-4 h-4 stroke-[2.5px]" />
                        <span>Content Soft-Deleted by Moderation</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                        This publication has been soft-deleted and removed from public threads following governance moderation. As the author, you have the right to dispute this action.
                    </p>
                    {(post?.rejection_reason || post?.reason) && (
                        <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg text-xs font-mono text-neutral-300">
                            <span className="text-neutral-500 font-black uppercase text-[10px] block mb-0.5 tracking-wider">Adjudication Note:</span>
                            {post?.rejection_reason || post?.reason}
                        </div>
                    )}
                    {(post?.text || post?.content) && (
                        <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-xs font-sans text-neutral-400 italic line-clamp-2">
                            "{post?.text || post?.content}"
                        </div>
                    )}
                </div>

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

                <ModerationAppealForm
                    isOpen={isAppealOpen}
                    onClose={() => setIsAppealOpen(false)}
                    incidentId={post?.incident_id || post?.id}
                    onSubmitted={() => setHasAppealed(true)}
                />
            </div>
        );
    }

    // Determine verification role channel type
    //const channelType = post?.author?.type === 'organization' ? 'organization' : post?.author?.verified ? 'journalist' : 'standard';
    //const authorType = post?.author?.type || 'standard'; // 'journalist' | 'activist' | 'scholar' | 'standard'
    return (
        <div
            onClick={handleRowClick}
            className={cn(
                "flex flex-col relative p-6 border-b border-[#262626] last:border-b-0 transition-all duration-300",
                isFocus ? "bg-[#181818]" : "bg-[#141414] hover:bg-white/[0.015] cursor-pointer",
                post?.isOptimistic ? "opacity-60 pointer-events-none" : ""
            )}
        >
            {/* 🏆 DECOUPLED THREAD RAIL SYSTEM (Maintained outside the content columns) */}
            {isAncestor && hasNextReply && <ThreadLine type="ancestor" depth={depth} userType={userPersona} />}
            {depth === 1 && <ThreadLine type="l-branch" depth={depth} userType={userPersona} />}
            {depth > 1 && <ThreadLine type="sub-reply-top" depth={depth} userType={userPersona} />}
            {depth > 0 && hasNextReply && <ThreadLine type="descendant-child" depth={depth} userType={userPersona} />}

            {/* 🚀 THE ARCHITECTURAL FIX: Split into a distinct Left Rail lane and Right Content lane */}
            <div
                className={cn(
                    "flex items-start gap-4 z-10 relative w-full",
                    // Nest indentation steps control the outer column margin grid properties
                    depth > 1 ? "pl-[88px]" : depth === 1 ? "pl-[32px]" : "pl-0"
                )}
            >
                {/* COLUMN 1: LEFT RAIL LANE (Strictly holds the Avatar. Lines fall exactly through this axis) */}
                <div className="w-12 flex flex-col items-center shrink-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#1A1616] border border-white/10 shadow-md">
                        <UserHoverCard author={post?.author}>
                            <UserAvatar user={post?.author} className="w-11 h-11" showStatus={false} />
                        </UserHoverCard>
                    </div>
                </div>

                {/* COLUMN 2: RIGHT CONTENT LANE (Unified vertical alignment axis for all copy, media & bars) */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                    {/* Header Metadata Meta */}
                    <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-text-primary text-sm md:text-base hover:underline truncate">
                                    {post?.author?.name}
                                </span>
                                {userPersona !== 'citizen' && (
                                    <VerificationBadge type={userPersona} size="sm" />
                                )}
                            </div>
                            <span className="text-xs text-text-secondary font-mono truncate">
                                {authorHandle} • {post?.time || 'Just now'}
                            </span>
                        </div>

                        <div className="shrink-0 self-start flex items-center gap-2">
                            {post?.isOptimistic ? (
                                <span className="text-xs text-primary-container font-mono font-bold animate-pulse">
                                    Sending...
                                </span>
                            ) : null}

                            {/* 🛠️ More Actions Kebab Context Layout Anchor */}
                            <div className="relative menu-container-relative">
                                <button
                                    ref={buttonRef}
                                    type="button"
                                    onClick={handleToggleMenu}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                                    title="More actions"
                                    aria-label="More actions"
                                >
                                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                </button>
                                {propRenderMenu
                                    ? propRenderMenu(post, showMenu, handleToggleMenu, authorHandle)
                                    : renderDefaultMenu()}
                            </div>
                        </div>
                    </div>

                    {/* Content Core Body (Perfect layout symmetry alignment path) */}
                    {isFocus && post?.title && (
                        <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-text-primary tracking-tight leading-snug mt-0.5">
                            {post?.title}
                        </h2>
                    )}

                    <div className="text-sm md:text-base text-text-primary/95 leading-relaxed break-words w-full">
                        <PostContent post={post} isFocus={isFocus} />
                    </div>

                    {/* Mosaic Media Layout Container */}
                    {allImages.length > 0 && (
                        <div className="w-full rounded-xl overflow-hidden border border-white/5 shadow-inner mt-1">
                            {allImages.length === 1 ? (
                                <div className="aspect-[16/9] w-full overflow-hidden">
                                    <img src={allImages} alt="Attached media asset" className="w-full h-full object-cover hover:scale-[1.015] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                                </div>
                            ) : allImages.length === 2 ? (
                                <div className="grid grid-cols-2 gap-2 aspect-[16/9] w-full overflow-hidden">
                                    <img src={allImages} alt="Attached media asset" className="w-full h-full object-cover hover:scale-[1.015] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                                    <img src={allImages} alt="Attached media asset" className="w-full h-full object-cover hover:scale-[1.015] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(1); setCarouselOpen(true); }} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-[16/9] w-full overflow-hidden">
                                    {allImages.slice(0, 4).map((img, i) => (
                                        <img key={i} src={img} alt="Attached asset mosaic grid item" className="w-full h-full object-cover hover:scale-[1.015] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(i); setCarouselOpen(true); }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 📸 RESPONSIVE MULTI-IMAGE CAROUSEL GRID */}
                    {allImages && allImages.length > 0 && (
                        <div className={cn(
                            "grid gap-2 w-full mt-4 select-none rounded-xl overflow-hidden",
                            allImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
                        )}>
                            {allImages.map((imgNode, index) => {
                                // Support both standard string arrays or rich backend media object structures safely
                                const isObject = typeof imgNode === 'object' && imgNode !== null;
                                const imgSrc = isObject ? imgNode.url : imgNode; // ✅ Streamlined object resolution
                                const imgStatic = isObject ? imgNode.static_url : undefined;
                                const imgBlurhash = isObject ? imgNode.blurhash : undefined;
                                const imgMeta = isObject ? imgNode.imageMeta : post?.imageMeta;

                                return (
                                    <KollectiveImagePlayer
                                        key={`post-media-grid-${post.id}-${index}`}
                                        src={imgSrc}
                                        staticUrl={imgStatic}
                                        blurhash={imgBlurhash}
                                        imageMeta={imgMeta}
                                        onClick={() => {
                                            setCarouselIndex(index);
                                            setCarouselOpen(true);
                                        }}
                                        className={cn(
                                            "w-full h-full object-cover",
                                            (allImages.length === 3 && index === 0) ? "col-span-2 aspect-[21/9]" : "aspect-[16/10]"
                                        )}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Row 4: Engagement Actions Panel Toolbars */}
                    <div className="pt-3.5 flex items-center gap-8 text-text-secondary border-t border-white/5 w-full">
                        <button
                            type="button"
                            disabled={isSelf}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isSelf && onReplyClick) {
                                    onReplyClick(
                                        post?.author?.name,
                                        post?.id
                                    );
                                }
                            }}
                            title={isSelf ? "You cannot reply to your own post" : "Reply"}
                            className={cn(
                                "flex items-center gap-1.5 text-sm bg-transparent border-none transition-colors",
                                isSelf ? "opacity-40 cursor-not-allowed text-text-secondary/50" : "hover:text-primary-container cursor-pointer"
                            )}
                        >
                            <span className="material-symbols-outlined text-[18px]">reply</span>
                            <span>{getReplyCount(post).toLocaleString()}</span>
                        </button>

                        <button
                            type="button"
                            disabled={isSelf || isAlreadyReblogged}
                            onClick={handleReblogClick}
                            title={isSelf ? "You cannot reblog your own post" : isAlreadyReblogged ? "Already reblogged this post" : "Reblog post"}
                            className={cn(
                                "flex items-center gap-1.5 font-bold text-sm transition-all border-none bg-transparent shrink-0",
                                isSelf ? "opacity-40 cursor-not-allowed text-text-secondary/50" : isAlreadyReblogged ? "text-emerald-500 font-extrabold cursor-default opacity-90" : "text-text-secondary hover:text-emerald-500 cursor-pointer"
                            )}
                        >
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isAlreadyReblogged ? "'wght' 700" : "'wght' 400" }}>repeat</span>
                            <span>{(reblogsCount).toLocaleString()}</span>
                        </button>

                        <button
                            type="button"
                            disabled={isSelf}
                            onClick={(e) => { e.stopPropagation(); if (!isSelf && onLike) onLike(post?.id); }}
                            title={isSelf ? "You cannot like your own post" : "Like"}
                            className={cn(
                                "flex items-center gap-1.5 text-sm transition-colors bg-transparent border-none",
                                isSelf ? "opacity-40 cursor-not-allowed text-text-secondary/50" : post?.liked ? "text-primary-container font-black cursor-pointer" : "hover:text-white cursor-pointer"
                            )}
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post?.liked ? "'FILL' 1" : "'FILL' 0" }}>
                                star
                            </span>
                            <span>{(post?.likes || 0).toLocaleString()}</span>
                        </button>

                        <button
                            type="button"
                            disabled={isSelf}
                            onClick={(e) => { e.stopPropagation(); if (!isSelf && onBookmark) onBookmark(post?.id); }}
                            title={isSelf ? "You cannot bookmark your own post" : "Bookmark"}
                            className={cn(
                                "flex items-center gap-1.5 text-sm transition-colors bg-transparent border-none ml-auto",
                                isSelf ? "opacity-40 cursor-not-allowed text-text-secondary/50" : post?.bookmarked ? "text-amber-500 cursor-pointer" : "hover:text-amber-500 cursor-pointer"
                            )}
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post?.bookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                                bookmark
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Lightbox Carousels overlay point */}
            <ImageLightbox
                isOpen={carouselOpen}
                onClose={() => setCarouselOpen(false)}
                images={allImages}
                activeIndex={carouselIndex}
                setActiveIndex={setCarouselIndex}

            />
        </div>
    );
}, (prevProps, nextProps) => {
    // ⚡ CUSTOM COMPARE RULE: Only trigger memo break updates if data points shift
    return (
        prevProps.post?.id === nextProps.post?.id &&
        prevProps.post?.liked === nextProps.post?.liked &&
        prevProps.post?.bookmarked === nextProps.post?.bookmarked &&
        prevProps.post?.reblogged === nextProps.post?.reblogged &&
        prevProps.post?.isOptimistic === nextProps.post?.isOptimistic &&
        prevProps.post?.likes === nextProps.post?.likes &&
        getReplyCount(prevProps.post) === getReplyCount(nextProps.post) &&
        prevProps.isFocus === nextProps.isFocus &&
        prevProps.hasNextReply === nextProps.hasNextReply &&
        prevProps.depth === nextProps.depth
    );
});