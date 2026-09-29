import React, { useState, useMemo, useCallback } from 'react';
import { PostContent } from '../features/timeline/PostContent';
import { PostMedia } from '../features/timeline/PostMedia';
import { ImageLightbox } from '../features/timeline/ImageLightbox';
import { usePostsStore } from '../store/usePostsStore';
import { useAuthStore } from '../store/auth/useAuthStore';
import { usePostActions } from '../features/timeline/usePostActions';
import { UserHoverCard } from '../components/UserHoverCard';
import { UserAvatar } from './UserAvatar';

import { resolveUserPersona } from '../utils/accountMapper';
import { getReplyCount, getReblogCount } from '../utils/postHelpers';
import { ThreadLine } from '../features/timeline/ThreadLine';
import cn from 'clsx';

export const CascadedPostRow = React.memo(function CascadedPostRow({
    post: propPost,
    isFocus,
    isAncestor,
    depth = 0,
    hasNextReply,
    onClick,
    onReplyClick,
    onLike,
    onBookmark,
    onReblog
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

    const authorHandle = post?.author?.handle || `@${post?.author?.name?.toLowerCase().replace(/\s+/g, '') || 'anonymous'}@kollective.social`;
    const allImages = post?.images || (post?.image ? [post?.image] : []);

    const handleRowClick = (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('span.cursor-pointer')) {
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

                        <div className="shrink-0 self-start">
                            {post?.isOptimistic ? (
                                <span className="text-xs text-primary-container font-mono font-bold animate-pulse">
                                    Sending...
                                </span>
                            ) : null}
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
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post?.liked ? "'FILL' 1" : "'FILL' 0" }}>star</span>
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