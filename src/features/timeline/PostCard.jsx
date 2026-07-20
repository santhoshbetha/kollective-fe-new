// src/features/timeline/PostCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserHoverCard } from '../../components/UserHoverCard';
import VerificationBadge from '../../components/VerificationBadge';
import { useLikePost } from '../../features/timeline/useLikePost';
import { useBookmarkPost } from '../../features/timeline/useBookmarkPost';
import { PostContent } from './PostContent';
import { PostMedia } from './PostMedia';
import { ImageLightbox } from './ImageLightbox';
import { usePostActions } from './usePostActions';
import { useRsvpToAction } from '../../features/organize/useOrganizeFeature';

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

export function PostCard({ post, isLast = false, standalone = false }) {
    const postActions = usePostActions();
    const rsvpMutation = useRsvpToAction();
    //const { toggleLike, toggleReblog, toggleBookmark, isActionPending } = usePostActions();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    // 🎛️ Lightbox state parameters sandboxed per post card item
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const likeMutation = useLikePost();
    const bookmarkMutation = useBookmarkPost();
    const allImages = post?.images || (post?.image ? [post.image] : []);

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

    const handleLikeClick = (e) => {
        e.stopPropagation();
        if (post?.liked) {
            // Optimistic UI update is handled inside useLikePost mutation
            likeMutation.mutate(post?.id);
        } else {
            // Optimistic UI update is handled inside useLikePost mutation
            likeMutation.mutate(post?.id);
        }
    };
    const authorHandle = post?.author?.handle || `@${post?.author?.name?.toLowerCase().replace(/\s+/g, '')}@kollective.social`;
    const domain = post?.domain || 'universeodon.com';

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
        navigate(`/post/${post?.id}`);
    };

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

    if (post?.isVoice) {
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
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(post?.id);
                            }}
                            className={`p-2 rounded-full backdrop-blur-md border border-white/10 z-20 focus:outline-none transition-all cursor-pointer ${post?.bookmarked ? 'bg-primary-container/20 text-primary-container border-primary-container/40' : 'bg-black/40 text-text-secondary hover:text-white'
                                }`}
                            title={post?.bookmarked ? 'Remove Bookmark' : 'Bookmark Pulse'}
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post?.bookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                                bookmark
                            </span>
                        </button>

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
                                    <div className="w-12 h-12 rounded-full border-2 border-primary-container p-0.5">
                                        <img alt="Author" className="w-full h-full rounded-full object-cover" src={post?.author?.avatar || null} />
                                    </div>
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
                                        <img src={post?.author?.avatar || null} className="w-5 h-5 rounded-full object-cover" alt="" />
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

                        {post?.image && (
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

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => handleLikeClick(post?.id)} // togglelike
                                    disabled={likeMutation.isPending}
                                    className={`flex items-center gap-2 font-bold hover:brightness-125 transition-all ${post?.liked ? 'text-primary-container' : 'text-text-secondary hover:text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: post?.liked ? "'FILL' 1" : "'FILL' 0" }}>
                                        favorite
                                    </span>
                                    <span className="text-sm">{post?.liked ? !likeMutation.isPending ? post?.likes - 1 : 'Liking...' : !likeMutation.isPending ? 'Liking...' : post?.likes}</span>
                                </button>
                                <button
                                    onClick={() => navigate(`/post/${post?.id}`)}
                                    className="flex items-center gap-2 text-text-secondary font-bold hover:text-white transition-all"
                                >
                                    <span className="material-symbols-outlined">chat_bubble</span>
                                    <span className="text-sm">1.2k</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleReblog(post?.id);
                                    }}
                                    className={`flex items-center gap-2 font-bold transition-all ${post?.reblogged ? 'text-green-500 hover:brightness-110' : 'text-text-secondary hover:text-white'
                                        }`}
                                    title="Boost Voice"
                                >
                                    <span className="material-symbols-outlined text-[20px]">repeat</span>
                                    <span className="text-sm">{post?.shares || 0}</span>
                                </button>
                            </div>

                            {post?.id === 'strike-post-1' && (
                                <button
                                    onClick={() => {
                                        rsvpMutation.mutate({ actionId: 'action-1', status: 'Attending' });
                                        alert('You have RSVP\'d to this strike. It has been added to your schedule!');
                                    }}
                                    className="bg-primary-container text-white px-8 py-3 rounded-xl font-bold text-sm crimson-glow active:scale-95 transition-transform"
                                >
                                    Join the Action
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
            </>
        );
    }

    // STANDARD / CAROUSEL POSTS
    return (
        <>
            <div
                onClick={handleCardClick}
                className={`p-6 hover:bg-white/[0.01] border-b ${isLast ? 'border-transparent' : 'border-black/20 dark:border-white/20'} transition-all group cursor-pointer relative 
                ${standalone
                        ? 'glass-card rounded-[16px] border border-white/5 shadow-md'
                        : ''
                    } ${showMenu ? 'z-30' : 'z-10'}`}
            >
                <div className="flex gap-4 items-start relative z-10">
                    <UserHoverCard author={post?.author}>
                        {post?.author.avatar ? (
                            <img
                                alt="User"
                                className="w-12 h-12 rounded-full object-cover border border-white/10"
                                src={post?.author.avatar}
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-orange-600 flex items-center justify-center text-on-secondary font-bold">
                                {post?.author.name.split(' ').map(n => n[0]).join('')}
                            </div>
                        )}
                    </UserHoverCard>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <UserHoverCard author={post?.author}>
                                    <div className="hover:opacity-85 transition-opacity">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-text-primary">{post?.author.name}</span>
                                            {post?.author.role && (
                                                <span className="text-[12px] px-1.5 py-0.5 bg-surface-container-highest rounded text-text-secondary">
                                                    {post?.author.role}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-label-sm text-text-secondary">
                                            {post?.author.handle || '@circle'} • {post?.time}
                                        </span>
                                    </div>
                                </UserHoverCard>
                                {post?.author && (
                                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-text-secondary">
                                        <span>posted by</span>
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const username = post?.author?.handle?.replace('@', '');
                                                navigate(`/profile/${username}`, { state: { fromCard: true } });
                                            }}
                                            className="font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1"
                                        >
                                            <img src={post?.author?.avatar || null} className="w-4 h-4 rounded-full object-cover" alt="" />
                                            {post?.author?.name}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={(e) => handleBookmarkClick(e)} // toggleBookmark(post?.id);
                                    disabled={bookmarkMutation.isPending}
                                    className={`p-1.5 hover:bg-white/5 rounded-full transition-colors focus:outline-none cursor-pointer ${post?.bookmarked ? 'text-primary-container' : 'text-text-secondary hover:text-white'
                                        }`}
                                    title={post?.bookmarked ? 'Remove Bookmark' : 'Bookmark Pulse'}
                                >
                                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: bookmarkMutation.isPending ? "'FILL' 1" : "'FILL' 0" }}>
                                        bookmark
                                    </span>
                                </button>

                                <div className="relative menu-container-relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleMenu();
                                        }}
                                        className="p-1.5 hover:bg-white/5 rounded-full transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
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
                        {post?.contentWarning ? (
                            <ContentWarningWrapper warning={post?.contentWarning}>
                                <PostContent post={post} isFocus={false} />
                            </ContentWarningWrapper>
                        ) : (
                            <PostContent post={post} isFocus={false} />
                        )}

                        {/* 🏆 2. DECOUPLED MOSAIC MEDIA INJECTION POINT */}
                        {/* Handles 1-4 grids blurring layers, and indicators overlays */}
                        <PostMedia
                            post={post}
                            setCarouselIndex={setCarouselIndex}
                            setCarouselOpen={setCarouselOpen}
                        />

                        {/* Tag Chips */}
                        {post?.tags && post?.tags.length > 0 && (
                            <div className="mt-4 flex gap-2">
                                {post?.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded-lg bg-surface-container-highest/50 text-primary-container font-bold text-[15px] border border-primary-container/10"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Engagement Button Bar Row */}
                        <div className="mt-6 flex items-center gap-8 border-t border-white/5 pt-4">
                            <button
                                onClick={() => toggleLike(post?.id)}
                                className={`flex items-center gap-2 hover:text-primary-container transition-colors ${post?.liked ? 'text-primary-container' : 'text-text-secondary'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: post?.liked ? "'FILL' 1" : "'FILL' 0" }}>
                                    thumb_up
                                </span>
                                <span className="font-bold text-sm">{post?.likes}</span>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReblog(post?.id);
                                }}
                                className={`flex items-center gap-2 hover:text-green-500 transition-colors ${post?.reblogged ? 'text-green-500 font-bold' : 'text-text-secondary'
                                    }`}
                                title="Boost Post"
                            >
                                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: post?.reblogged ? "'wght' 700" : "'wght' 400" }}>
                                    repeat
                                </span>
                                <span className="font-bold text-sm">{post?.shares || 0}</span>
                            </button>

                            <button
                                onClick={() => navigate(`/post/${post?.id}`)}
                                className="flex items-center gap-2 text-text-secondary hover:text-primary-container transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">mode_comment</span>
                                <span className="font-bold text-sm">{post?.commentsCount}</span>
                            </button>

                            {post?.communityJoinable ? (
                                <button
                                    onClick={() => alert('Joined planning circle!')}
                                    className="ml-auto px-4 py-1.5 rounded-full border border-primary-container/30 text-primary-container font-bold text-[12px] hover:bg-primary-container hover:text-white transition-all"
                                >
                                    Join Circle
                                </button>
                            ) : (
                                <button className="flex items-center gap-2 text-text-secondary hover:text-primary-container transition-colors ml-auto">
                                    <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
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

