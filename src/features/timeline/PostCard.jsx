// src/features/timeline/PostCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserHoverCard } from '../../components/UserHoverCard';
import { UserAvatar } from '../../components/UserAvatar';
import VerificationBadge from '../../components/VerificationBadge';
import { useLikePost } from '../../features/timeline/useLikePost';
import { useBookmarkPost } from '../../features/timeline/useBookmarkPost';
import { PostContent } from './PostContent';
import { PostMedia } from './PostMedia';
import { KollectiveVideoPlayer } from './KollectiveVideoPlayer';
import { ImageLightbox } from './ImageLightbox';
import { usePostActions } from './usePostActions';
import { useRsvpToAction } from '../../features/organize/useOrganizeFeature';
import { usePostsStore } from '../../store/usePostsStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { LoginPromptModal } from '../../components/LoginPromptModal';
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

export function PostCard({ post: propPost, isLast = false, standalone = false }) {
    const storePost = usePostsStore((state) => propPost?.id ? state.entities[propPost.id] : null);
    const post = storePost || propPost;
    const storeEntities = usePostsStore((state) => state.entities);

    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    const getDisplayPost = (rawPost) => {
        if (!rawPost) return rawPost;
        if (rawPost.reblog && typeof rawPost.reblog === 'object') return rawPost.reblog;
        if (rawPost.reblog && typeof rawPost.reblog === 'string' && storeEntities[rawPost.reblog]) return storeEntities[rawPost.reblog];
        if (rawPost.reblog_of_id && storeEntities[rawPost.reblog_of_id]) return storeEntities[rawPost.reblog_of_id];
        if (rawPost.reblogOf && storeEntities[rawPost.reblogOf]) return storeEntities[rawPost.reblogOf];
        return rawPost;
    };

    const displayPost = getDisplayPost(post);

    const isSelfPost = () => {
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
    };
    const isSelf = isSelfPost();

    const isRebloggedPost = !!(
        post?.reblog ||
        post?.reblog_of_id ||
        post?.reblogOf ||
        post?.isReblog
    );

    //console.log("post::", post);

    const targetPostId = displayPost?.id || post?.id;
    const isAlreadyReblogged = !!(post?.reblogged || post?.has_reblogged || displayPost?.reblogged || displayPost?.has_reblogged);

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
    const allImages = displayPost?.images || (displayPost?.image ? [displayPost.image] : (post?.images || (post?.image ? [post.image] : [])));

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
            toggleLike(targetPostId);
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
        if (isSelf) return;
        if (!isAuthenticated) {
            triggerLoginPrompt("Please log in to bookmark posts.");
            return;
        }
        if (targetPostId) {
            toggleBookmark(targetPostId);
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

    React.useEffect(() => {
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

    React.useEffect(() => {
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
    const authorHandle = displayPost?.author?.handle || post?.author?.handle || `@${(displayPost?.author?.name || post?.author?.name || 'user').toLowerCase().replace(/\s+/g, '')}@kollective.social`;
    const domain = displayPost?.domain || post?.domain || 'universeodon.com';

    const handleCardClick = (e) => {
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
        navigate(`/post/${displayPost?.id || post?.id}`);
    };

    console.log("PostCard Post: ", post);

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
                    className={`relative p-0 hover:bg-white/[0.01] border-b ${isLast ? 'border-transparent' : 'border-black/20 dark:border-white/20'} transition-all group cursor-pointer 
                ${standalone
                            ? 'glass-card rounded-[16px] border-20 border-primary-container/40 crimson-glow overflow-hidden'
                            : ''
                        } ${showMenu ? 'z-30' : 'z-10'}`}
                >
                    {/* Voice Badge */}
                    <div className="absolute top-0 left-0 bg-primary-container text-white px-4 py-1.5 flex items-center gap-2 rounded-br-xl z-20">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            campaign
                        </span>
                        <span className="font-bold text-[15px] uppercase tracking-widest">VOICE</span>
                    </div>

                    {/* Top Right Actions */}
                    <div className="absolute top-3 right-4 flex items-center gap-2 z-20">
                        <div className="relative menu-container-relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleMenu();
                                }}
                                className="p-2 rounded-full backdrop-blur-md text-text-secondary hover:text-white focus:outline-none transition-all cursor-pointer flex items-center justify-center"
                                title="More actions"
                            >
                                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                            </button>
                            {renderMenu(post, showMenu, setShowMenu, authorHandle, domain, navigate)}
                        </div>
                    </div>

                    <div className="p-8 flex flex-col gap-6">
                        <div>
                            <UserHoverCard author={post?.author}>
                                <div className="flex items-center gap-4 hover:opacity-85 transition-opacity">
                                    <UserHoverCard author={post?.author}>
                                        <UserAvatar user={post?.author} className="w-12 h-12" showStatus={false} />
                                    </UserHoverCard>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-text-primary leading-tight">{post?.author.name}</h3>
                                            <span className="material-symbols-outlined text-[#008080] text-[18px]" hidden
                                                style={{ fontVariationSettings: "'FILL' 1" }}>
                                                verified
                                            </span>
                                            <VerificationBadge type="journalist" size='lg' />
                                        </div>

                                        <p className="font-label-sm text-text-secondary">{post?.author.role} • {post?.time}</p>
                                    </div>
                                </div>
                            </UserHoverCard>
                            {post?.author && (
                                <div className="mt-3 ml-16 flex items-center gap-1.5 text-sm text-text-secondary">
                                    <span>posted by</span>
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const username = post?.author.handle.replace('@', '');
                                            navigate(`/profile/${username}`, { state: { fromCard: true } });
                                        }}
                                        className="font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1.5"
                                    >
                                        <UserAvatar user={post?.author} className="w-5 h-5" showStatus={false} />
                                        {post?.author.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight leading-tight group-hover:text-primary-container transition-colors duration-300">
                                {post?.title}
                            </h2>
                            {post?.contentWarning ? (
                                <ContentWarningWrapper warning={post?.contentWarning}>
                                    <p className="font-body-lg text-xl text-text-primary/90 leading-relaxed">
                                        {post?.text}
                                    </p>
                                </ContentWarningWrapper>
                            ) : (
                                <p className="font-body-lg text-xl text-text-primary/90 leading-relaxed">
                                    {post?.text}
                                </p>
                            )}
                        </div>

                        {post?.video || post?.videoUrl ? (
                            <KollectiveVideoPlayer
                                src={typeof post?.video === 'string' ? post.video : post?.video?.url || post?.videoUrl}
                                poster={post?.videoPoster || post?.image}
                                isGif={post?.isGif}
                                title={post?.title}
                            />
                        ) : post?.image && (
                            <div
                                className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/5 cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }}
                            >
                                <img
                                    alt="Strike Visual"
                                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                                    src={post?.image}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        <div className="w-7 h-7 rounded-full border-2 border-surface-ink bg-gray-500"></div>
                                        <div className="w-7 h-7 rounded-full border-2 border-surface-ink bg-gray-600"></div>
                                        <div className="w-7 h-7 rounded-full border-2 border-surface-ink bg-gray-700"></div>
                                    </div>
                                    <span className="text-[12px] font-bold text-white shadow-sm">{post?.imageMeta}</span>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={handleLikeClick}
                                    disabled={isActionPending}
                                    className={cn(
                                        "flex items-center gap-2 font-bold transition-all border-none bg-transparent cursor-pointer hover:scale-105 active:scale-95",
                                        post?.liked ? "text-primary-container font-extrabold" : "text-text-secondary hover:text-text-primary"
                                    )}
                                    title={post?.liked ? "Unlike Voice" : "Like Voice"}
                                >
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: post?.liked ? "'FILL' 1" : "'FILL' 0" }}>
                                        favorite
                                    </span>
                                    <span className="text-sm">
                                        {post?.likes ?? post?.likesCount ?? 0}
                                    </span>
                                </button>
                                <button
                                    onClick={handleReblogClick}
                                    disabled={isActionPending || isAlreadyReblogged}
                                    className={cn(
                                        "flex items-center gap-2 font-bold transition-all border-none bg-transparent",
                                        isAlreadyReblogged
                                            ? "opacity-60 cursor-not-allowed text-emerald-500 font-extrabold"
                                            : "text-text-secondary hover:text-text-primary cursor-pointer hover:scale-105 active:scale-95"
                                    )}
                                    title={isAlreadyReblogged ? "Already reblogged this post" : "Boost Voice"}
                                >
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isAlreadyReblogged ? "'wght' 700" : "'wght' 400" }}>
                                        repeat
                                    </span>
                                    <span className="text-sm">{post?.shares ?? post?.reblogsCount ?? post?.reblogs_count ?? 0}</span>
                                </button>
                                <button
                                    onClick={handleCommentClick}
                                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-bold transition-all border-none bg-transparent cursor-pointer hover:scale-105 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[20px]">mode_comment</span>
                                    <span className="text-sm">{post?.commentsCount ?? post?.repliesCount ?? '1.2k'}</span>
                                </button>
                            </div>

                            {(post?.category === 'voice' || post?.isAction || post?.id === 'strike-post-1') && (
                                <button
                                    onClick={handleJoinActionClick}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md active:scale-95 ${isActionJoined
                                        ? 'bg-surface-container-high text-primary-container border border-primary-container/30'
                                        : 'bg-primary-container text-white hover:brightness-110 crimson-glow'
                                        }`}
                                >
                                    {isActionJoined ? '✓ Joined Action' : 'Join the Action'}
                                </button>
                            )}
                        </div>
                    </div>
                </article>

                {/* 🏆 3. FULLSCREEN MEDIA OVERLAY CANVAS LIGHTBOX */}
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
                className={`p-4 hover:bg-white/[0.01]X border-b border-[#262626] ${isLast ? 'border-transparent' : 'border-black/20 dark:border-white/20'} transition-all group cursor-pointer relative  
                ${standalone
                        ? 'glass-card rounded-[16px] border border-white/5 shadow-md'
                        : ''
                    } ${showMenu ? 'z-30' : 'z-10'} ${post?.isOptimistic ? 'opacity-60 pointer-events-none' : ''}`}
            >
                {/* 🔄 Reblogged Header Indicator Banner */}
                {isRebloggedPost && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 mb-3 px-1">
                        <span className="material-symbols-outlined text-[18px]">repeat</span>
                        <span>
                            {post?.author?.name || post?.author?.username || post?.account?.display_name || post?.account?.username ? (
                                <>
                                    <span className="text-text-primary font-bold">
                                        {post?.author?.name || post?.author?.username || post?.account?.display_name || post?.account?.username}
                                    </span>{' '}
                                    reblogged
                                </>
                            ) : (
                                'Reblogged'
                            )}
                        </span>
                    </div>
                )}

                <div className="flex gap-4 items-start relative z-10 w-full">
                    <UserHoverCard author={displayPost?.author || post?.author}>
                        <UserAvatar user={displayPost?.author || post?.author} className="w-12 h-12" showStatus={false} />
                    </UserHoverCard>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <UserHoverCard author={displayPost?.author || post?.author}>
                                    <div className="hover:opacity-85 transition-opacity">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-text-primary">{displayPost?.author?.name || post?.author?.name}</span>
                                            {(displayPost?.author?.role || post?.author?.role) && (
                                                <span className="text-[12px] px-1.5 py-0.5 bg-surface-container-highest rounded text-text-secondary">
                                                    {displayPost?.author?.role || post?.author?.role}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-label-sm text-text-secondary">
                                            {displayPost?.author?.handle || post?.author?.handle || '@circle'} • {displayPost?.time || post?.time}
                                            {post?.isOptimistic && (
                                                <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary-container font-mono font-bold animate-pulse">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping" />
                                                    Sending...
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </UserHoverCard>
                                {(displayPost?.author || post?.author) && (
                                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-text-secondary">
                                        {(displayPost?.author?.type || post?.author?.type) === 'organization' ?
                                            <>
                                                <span>posted by </span>
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const targetAuthor = displayPost?.author || post?.author;
                                                        const username = targetAuthor?.handle?.replace('@', '');
                                                        navigate(`/profile/${username}`, { state: { fromCard: true } });
                                                    }}
                                                    className="font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1"
                                                >
                                                    <img src={(displayPost?.author || post?.author)?.avatar || null} className="w-4 h-4 rounded-full object-cover" alt="" />
                                                    {(displayPost?.author || post?.author)?.name}
                                                </span>
                                            </>
                                            :
                                            <></>
                                        }
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <div className="relative menu-container-relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleMenu();
                                        }}
                                        className="p-1.5 hover:bg-white/5 rounded-full transition-colors focus:outline-none cursor-pointer flex items-center justify-center border-none bg-transparent"
                                        title="More actions"
                                    >
                                        <span className="material-symbols-outlined text-text-secondary">more_horiz</span>
                                    </button>
                                    {renderMenu(post, showMenu, setShowMenu, authorHandle, domain, navigate)}
                                </div>
                            </div>
                        </div>

                        {/* 🏆 1. DECOUPLED RICH TEXT CONTENT SWITCHBOARD */}
                        {/* Handles server-tokens, content warnings, and embedded PollCards/EventCards */}
                        {displayPost?.contentWarning ? (
                            <ContentWarningWrapper warning={displayPost?.contentWarning}>
                                <PostContent post={displayPost} isFocus={false} />
                            </ContentWarningWrapper>
                        ) : (
                            <PostContent post={displayPost} isFocus={false} />
                        )}

                        {/* 🏆 2. DECOUPLED MOSAIC MEDIA INJECTION POINT */}
                        {/* Handles 1-4 grids blurring layers, and indicators overlays */}
                        <PostMedia
                            post={displayPost}
                            setCarouselIndex={setCarouselIndex}
                            setCarouselOpen={setCarouselOpen}
                        />

                        {/* Tag Chips */}
                        {displayPost?.tags && displayPost?.tags.length > 0 && (
                            <div className="mt-4 flex gap-2 flex-wrap">
                                {displayPost?.tags.map((tag, idx) => {
                                    const tagName = typeof tag === 'object' ? tag?.name || tag?.title || tag?.tag || '' : tag;
                                    if (!tagName) return null;
                                    return (
                                        <span
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/timeline?tag=${encodeURIComponent(tagName)}`);
                                            }}
                                            className="px-3 py-1 rounded-lg bg-surface-container-high/60 hover:bg-primary-container/20 text-primary-container font-bold text-[14px] border border-primary-container/15 transition-all cursor-pointer hover:scale-102 active:scale-98"
                                        >
                                            &#35;{tagName}
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        {/* Engagement Button Bar Row */}
                        <div className="mt-6 flex items-center justify-between gap-4 border-t border-outline-variant/30 pt-4 w-full min-w-0">

                            <div className="flex items-center gap-6">
                                {/* Comment Button */}
                                <button
                                    onClick={handleCommentClick}
                                    className="flex items-center gap-1.5 text-text-secondary font-bold text-sm transition-all border-none bg-transparent shrink-0 hover:text-primary-container cursor-pointer hover:scale-105 active:scale-95"
                                    title="Comment on post"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        reply
                                    </span>
                                    <span>{displayPost?.commentsCount ?? displayPost?.repliesCount ?? post?.commentsCount ?? post?.repliesCount ?? 0}</span>
                                </button>

                                {/* Share / Boost Button */}
                                <button
                                    onClick={handleReblogClick}
                                    disabled={isSelf || isActionPending || isAlreadyReblogged}
                                    className={cn(
                                        "flex items-center gap-1.5 font-bold text-sm transition-all border-none bg-transparent shrink-0",
                                        isSelf
                                            ? "opacity-40 cursor-not-allowed text-text-secondary/50"
                                            : isAlreadyReblogged
                                                ? "opacity-60 cursor-not-allowed text-emerald-500 font-extrabold"
                                                : "text-text-secondary hover:text-text-primary cursor-pointer hover:scale-105 active:scale-95"
                                    )}
                                    title={
                                        isSelf
                                            ? "You cannot reblog your own post"
                                            : isAlreadyReblogged
                                                ? "Already reblogged this post"
                                                : "Reblog post"
                                    }
                                >
                                    <span
                                        className="material-symbols-outlined text-[20px]"
                                        style={{ fontVariationSettings: isAlreadyReblogged ? "'wght' 700" : "'wght' 400" }}
                                    >
                                        repeat
                                    </span>
                                    <span>{displayPost?.shares ?? displayPost?.reblogsCount ?? post?.shares ?? post?.reblogsCount ?? 0}</span>
                                </button>

                                {/* Like Button */}
                                <button
                                    onClick={handleLikeClick}
                                    disabled={isActionPending}
                                    className={cn(
                                        "flex items-center gap-1.5 font-bold text-sm transition-all cursor-pointer border-none bg-transparent hover:scale-105 active:scale-95 shrink-0",
                                        (displayPost?.liked || post?.liked) ? "text-primary-container font-extrabold" : "text-text-secondary hover:text-text-primary"
                                    )}
                                    title={(displayPost?.liked || post?.liked) ? "Unlike post" : "Like post"}
                                >
                                    <span
                                        className="material-symbols-outlined text-[20px]"
                                        style={{ fontVariationSettings: (displayPost?.liked || post?.liked) ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        star
                                    </span>
                                    <span>{displayPost?.likes ?? displayPost?.likesCount ?? post?.likes ?? post?.likesCount ?? 0}</span>
                                </button>
                            </div>

                            {post?.communityJoinable ? (
                                <button
                                    onClick={handleJoinCircleClick}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-full border font-bold text-[12px] transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs active:scale-95",
                                        isCircleJoined
                                            ? "bg-surface-container-high text-text-primary border-outline-variant"
                                            : "border-primary-container/40 text-primary-container hover:bg-primary-container hover:text-white"
                                    )}
                                >
                                    {isCircleJoined ? '✓ Joined Circle' : 'Join Circle'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleBookmarkClick}
                                    disabled={isActionPending || isSelf}
                                    className={cn(
                                        "flex items-center gap-2 transition-colors ml-auto shrink-0 border-none bg-transparent p-1.5 rounded-full",
                                        isSelf
                                            ? "opacity-40 cursor-not-allowed text-text-secondary/50"
                                            : (displayPost?.bookmarked || post?.bookmarked) ? "text-amber-500 cursor-pointer hover:bg-surface-container-high" : "text-text-secondary hover:text-text-primary cursor-pointer hover:bg-surface-container-high"
                                    )}
                                    title={isSelf ? "You cannot bookmark your own post" : (displayPost?.bookmarked || post?.bookmarked) ? "Remove bookmark" : "Save to bookmarks"}
                                >
                                    <span
                                        className="material-symbols-outlined text-[20px]"
                                        style={{ fontVariationSettings: (displayPost?.bookmarked || post?.bookmarked) ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        bookmark
                                    </span>
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            {/* 🏆 3. FULLSCREEN MEDIA OVERLAY CANVAS LIGHTBOX */}
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

const ContentWarningWrapper = ({ warning, children }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="mt-3 p-4 bg-surface-crimson-low/10 rounded-xl border border-primary-container/20 space-y-3">
            <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm font-bold text-primary font-mono uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px] text-primary">warning</span>
                    Content Warning: {warning}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShow(!show);
                    }}
                    className="px-3.5 py-1.5 bg-surface-container text-text-primary rounded-lg text-sm font-bold hover:bg-primary-container hover:text-white transition-all cursor-pointer"
                >
                    {show ? 'Hide Details' : 'Show Details'}
                </button>
            </div>
            {show && <div className="pt-3 border-t border-white/5">{children}</div>}
        </div>
    );
};

