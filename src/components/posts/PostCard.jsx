import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    GlobeLock
} from 'lucide-react';

const renderMenu = (post, showMenu, setShowMenu, authorHandle, domain, navigate) => {
    if (!showMenu) return null;

    return (
        <div
            className="absolute right-0 top-8 z-[100] w-72 bg-surface-container border border-outline-variant rounded-card shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 font-sans"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Standard Navigation Actions */}
            <button
                type="button"
                onClick={() => { setShowMenu(false); navigate(`/post/${post?.id}`); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <ExternalLink className="w-4 h-4 text-text-secondary shrink-0" />
                <span>Expand this post</span>
            </button>

            <button
                type="button"
                onClick={() => { setShowMenu(false); alert("Opening original post page..."); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <LinkIcon className="w-4 h-4 text-text-secondary shrink-0" />
                <span>Open original page</span>
            </button>

            <button
                type="button"
                onClick={() => {
                    setShowMenu(false);
                    const linkText = `${window.location.origin}/post/${post?.id}`;
                    navigator.clipboard.writeText(linkText);
                    alert("Link copied to clipboard!");
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <Copy className="w-4 h-4 text-text-secondary shrink-0" />
                <span>Copy link to post</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            {/* Social Interaction Actions */}
            <button
                type="button"
                onClick={() => { setShowMenu(false); alert(`Drafting a mention to ${authorHandle}...`); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <AtSign className="w-4 h-4 text-text-secondary shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Mention {authorHandle}</span>
            </button>

            <button
                type="button"
                onClick={() => { setShowMenu(false); alert(`Drafting a private mention to ${authorHandle}...`); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-surface-container-high transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <Mail className="w-4 h-4 text-text-secondary shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Privately mention {authorHandle}</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            {/* Destructive / Moderation Actions */}
            <button
                type="button"
                onClick={() => { setShowMenu(false); alert(`You have muted ${authorHandle}.`); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none min-w-0"
            >
                <VolumeX className="w-4 h-4 text-error shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Mute {authorHandle}</span>
            </button>

            <button
                type="button"
                onClick={() => { setShowMenu(false); alert(`You have blocked ${authorHandle}.`); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <ShieldBan className="w-4 h-4 text-error shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Block {authorHandle}</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            <button
                type="button"
                onClick={() => { setShowMenu(false); alert("This post has been filtered from your timeline."); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <Filter className="w-4 h-4 text-error shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Filter this post</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            <button
                type="button"
                onClick={() => { setShowMenu(false); alert(`Report submitted for ${authorHandle}.`); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <Flag className="w-4 h-4 text-error shrink-0" />
                <span className="break-all line-clamp-2 flex-1">Report {authorHandle}</span>
            </button>

            <div className="border-t border-outline-variant/60 my-1" />

            <button
                type="button"
                onClick={() => { setShowMenu(false); alert(`Domain ${domain} has been blocked.`); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 cursor-pointer border-none"
            >
                <GlobeLock className="w-4 h-4 text-error shrink-0" />
                <span>Block domain {domain}</span>
            </button>
        </div>
    );
};

// Module-level global state tracking which menu is currently open in the feed
let activeMenuPostId = null;
let activeMenuSetShowMenu = null;

export const PostCard = React.memo(function PostCard({
    post: propPost,
    isLast = false,
    standalone = false
}) {
    const storePost = usePostsStore((state) => propPost?.id ? state.entities[propPost.id] : null);
    const post = storePost || propPost;
    const storeEntities = usePostsStore((state) => state.entities);

    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    const toggleBookmarkMutation = useToggleBookmark();

    const getDisplayPostDebug = (rawPost) => {
        console.log("here! getDisplayPost rawPost 1: ", rawPost);
        console.log("here! getDisplayPost typeof rawPost.reblog : ", typeof rawPost.reblog);
        if (!rawPost) return rawPost;
        console.log("here! getDisplayPost 2 ");
        if (rawPost.reblog && typeof rawPost.reblog === 'object') return rawPost.reblog;
        console.log("here! getDisplayPost 3");
        if (rawPost.reblog && typeof rawPost.reblog === 'string' && storeEntities[rawPost.reblog]) return storeEntities[rawPost.reblog];
        console.log("here! getDisplayPost 4");
        if (rawPost.reblog_of_id && storeEntities[rawPost.reblog_of_id]) return storeEntities[rawPost.reblog_of_id];
        console.log("here! getDisplayPost 5");
        if (rawPost.reblogOf && storeEntities[rawPost.reblogOf]) return storeEntities[rawPost.reblogOf];
        console.log("here! getDisplayPost 6");
        return rawPost;
    };

    const getDisplayPostX = (rawPost) => {
        if (!rawPost) return rawPost;
        if (rawPost.reblog && typeof rawPost.reblog === 'object') return rawPost.reblog;
        if (rawPost.reblog && typeof rawPost.reblog === 'string' && storeEntities[rawPost.reblog]) return storeEntities[rawPost.reblog];
        if (rawPost.reblog_of_id && storeEntities[rawPost.reblog_of_id]) return storeEntities[rawPost.reblog_of_id];
        if (rawPost.reblogOf && storeEntities[rawPost.reblogOf]) return storeEntities[rawPost.reblogOf];
        return rawPost;
    };

    const getDisplayPost = (rawPost) => {
        if (!rawPost) return rawPost;

        // 🚀 THE MASTER SYNC FIX: 
        // If the post is a reblog, pull the original content's ID and extract it 
        // straight out of our normalized Zustand entity dictionary (Single Source of Truth).
        if (rawPost.reblog && rawPost.reblog.id && storeEntities[rawPost.reblog.id]) {
            return storeEntities[rawPost.reblog.id];
        }

        // Fallback A: If the store hasn't normalized this nested target id yet, fall back to the inline object safely
        if (rawPost.reblog && typeof rawPost.reblog === 'object') {
            return rawPost.reblog;
        }

        // Fallback B: Legacy string key fallback safety checks
        if (rawPost.reblog && typeof rawPost.reblog === 'string' && storeEntities[rawPost.reblog]) {
            return storeEntities[rawPost.reblog];
        }

        return rawPost;
    };


    const displayPost = getDisplayPost(post);
    const author = displayPost?.author || post?.author;

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
        ? (post?.reblog || {})  // Real source content for bookmarking logic
        : post;

    console.log("here! PostCard storeEntities : ", storeEntities);
    console.log("here! PostCard propPost : ", propPost?.id, propPost?.content, propPost?.likes_count);
    console.log("here! PostCard storePost : ", storePost?.id, storePost?.content, storePost?.likes_count);
    console.log("here! PostCard post : ", post?.id, post?.content, post?.likes_count, post);
    console.log("here! PostCard displayPost : ", displayPost?.id, displayPost?.content, displayPost?.likes_count, displayPost?.liked, displayPost?.bookmarked);
    console.log("here! PostCard targetData : ", targetData?.id, targetData?.content, targetData?.likes_count);

    // Derive active saved state parameters cleanly from incoming data matrices
    // 🚀 THE DEEP DEBUG FIX: Force the individual card to explicitly subscribe 
    // to its own dynamic entity slice in the Zustand store memory.
    // const livePost = usePostsStore(
    //     React.useCallback((state) => state.entities[targetPostId] || post, [targetPostId, post])
    // );
    //const isBookmarked = Boolean(livePost?.bookmarked || livePost?.isBookmarked || livePost?.rsvp === 'Interested');
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
    console.log('PostCard isBookmarked', isBookmarked);
    console.log('PostCard post?.content', post?.content);
    console.log('PostCard post?.bookmarked', post?.bookmarked);
    console.log('PostCard targetData?.bookmarked', targetData?.bookmarked);
    console.log('PostCard targetData?.isBookmarked', targetData?.isBookmarked);
    console.log('PostCard displayPost?.bookmarked', displayPost?.bookmarked);
    console.log('PostCard displayPost?.isBookmarked', displayPost?.isBookmarked);
    console.log('PostCard isLiked', isLiked);
    console.log('PostCard isBookmarked', isBookmarked);
    console.log('PostCard post?.reblogged', post?.reblogged);
    console.log('PostCard targetData?.reblogged', targetData?.reblogged);
    console.log('PostCard displayPost?.reblogged', displayPost?.reblogged);
    //console.log('PostCard livePost', livePost);

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
        if (isSelf || isAlreadyReblogged) return;
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
        if (isSelf) return; ``
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
        if (targetPostId) navigate(`/post/${targetPostId}`);
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

    useEffect(() => {
        if (!showMenu) return;

        const handleOutsideClick = (e) => {
            if (!e.target.closest('.menu-container-relative')) {
                setShowMenu(false);
                if (activeMenuPostId === post?.id) {
                    activeMenuPostId = null;
                    activeMenuSetShowMenu = null;
                }
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [showMenu, post?.id]);

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
    const authorHandle = displayPost?.author?.handle || post?.author?.handle || `@${(displayPost?.author?.name || post?.author?.name || 'user').toLowerCase().replace(/\s+/g, '')}@kollective.social`;
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
        console.log("handleCardClick displayPost?.id : ", displayPost?.id);
        console.log("handleCardClick post?.id : ", post?.id);
        if (displayPost?.id) {
            navigate(`/post/${displayPost?.id}`);
        } else {
            navigate(`/post/${post?.id}`);
        }
    }, [navigate, displayPost?.id, post?.id]);

    console.log("PostCard Post 22 : ", post?.id, post?.content, post?.likes_count);

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
                                onClick={handleMenuToggleClick}
                                className="p-2 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/60 text-text-secondary hover:text-white transition-all cursor-pointer flex items-center justify-center border border-white/5"
                                title="More actions"
                            >
                                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                            </button>
                            {renderMenu && renderMenu(post, showMenu, handleToggleMenu, authorHandle)}
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
                                    disabled={isActionPending || isAlreadyReblogged}
                                    className={cn(
                                        "flex items-center gap-2 font-bold transition-all border-none bg-transparent cursor-pointer",
                                        isAlreadyReblogged ? "text-emerald-500 font-extrabold cursor-default opacity-80" : "hover:text-text-primary hover:scale-105 active:scale-95"
                                    )}
                                    title="Boost"
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
                                    disabled={isActionPending}
                                    className={cn(
                                        "flex items-center gap-2 font-bold transition-all border-none bg-transparent cursor-pointer hover:text-text-primary hover:scale-105 active:scale-95",
                                        post?.liked ? "text-primary-container font-extrabold" : ""
                                    )}
                                    title={post?.liked ? "Unlike" : "Like"}
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
                            <button
                                onClick={(e) => { e.stopPropagation(); handleJoinActionClick(); }}
                                className={cn(
                                    "px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer shadow-md active:scale-95 border",
                                    isActionJoined
                                        ? "bg-white/5 text-primary-container border-white/10"
                                        : "bg-primary-container text-white border-transparent hover:brightness-110 crimson-glow"
                                )}
                            >
                                {isActionJoined ? '✓ Joined Action' : 'Join the Action'}
                            </button>
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
            <div
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
                                        <span className="font-bold text-text-primary text-sm md:text-base hover:underline truncate">
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
                            {author?.type === 'organization' && (
                                <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-lg w-fit">
                                    <span>posted by</span>
                                    <span className="font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1">
                                        {author.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Dropdown Context Navigation Target */}
                        <div className="relative shrink-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleToggleMenu(); }}
                                className="p-2 hover:bg-white/5 rounded-full text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer"
                                title="More actions"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    more_horiz
                                </span>
                            </button>
                            {renderMenu && renderMenu(post, showMenu, handleToggleMenu, authorHandle)}
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
                                disabled={isSelf || isActionPending || isAlreadyReblogged}
                                className={cn(
                                    "flex items-center gap-1.5 font-bold text-xs transition-colors border-none bg-transparent cursor-pointer",
                                    isSelf ? "opacity-30 cursor-not-allowed" :
                                        isAlreadyReblogged ? "text-emerald-500 font-extrabold cursor-default" : "hover:text-emerald-500"
                                )}
                                title={isSelf ? "Own post" : isAlreadyReblogged ? "Reblogged" : "Reblog"}
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
                                disabled={isActionPending}
                                className={cn(
                                    "flex items-center gap-1.5 font-bold text-xs transition-colors bg-transparent border-none cursor-pointer",
                                    (displayPost?.liked) ? "text-primary-container font-extrabold" : "hover:text-white"
                                )}
                                title="Like"
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
                                disabled={isActionPending || isSelf}
                                className={cn(
                                    "flex items-center justify-center p-1.5 rounded-full transition-colors border-none bg-transparent ml-auto cursor-pointer",
                                    isSelf ? "opacity-30 cursor-not-allowed" :
                                        (displayPost?.bookmarked) ? "text-amber-500 hover:bg-white/5" : "hover:text-text-primary hover:bg-white/5"
                                )}
                                title="Bookmark"
                            >
                                <span
                                    className="material-symbols-outlined text-[18px]"
                                    style={{ fontVariationSettings: (displayPost?.bookmarked) ? "'FILL' 1" : "'FILL' 0" }}
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
            </div>
        </>
    );
}, (prevProps, nextProps) => {
    // Precise state shallow matching to bails out extra rendering loads
    return (
        prevProps.post?.id === nextProps.post?.id &&
        prevProps.post?.liked === nextProps.post?.liked &&
        prevProps.post?.bookmarked === nextProps.post?.bookmarked &&
        getReblogCount(prevProps.post) === getReblogCount(nextProps.post) &&
        getLikeCount(prevProps.post) === getLikeCount(nextProps.post) &&
        getReplyCount(prevProps.post) === getReplyCount(nextProps.post) &&
        prevProps.isCircleJoined === nextProps.isCircleJoined &&
        prevProps.isActionPending === nextProps.isActionPending &&
        prevProps.showMenu === nextProps.showMenu &&
        prevProps.isLast === nextProps.isLast
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

