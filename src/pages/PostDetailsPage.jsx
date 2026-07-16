// src/pages/PostDetailsPage.jsx (Part 1 of 4)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingWidget } from '../components/TrendingWidget';
import { ImageCarouselModal } from '../components/ImageCarouselModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePostActions } from '../features/timeline/usePostActions';
import { apiFetch, apiFetchPosts } from '../api/apiClient';
import { CascadedPostRow } from '../components/CascadedPostRow';

// Helper: Hides sensitive data or spoilers behind a button toggle natively
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
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShow(!show); }}
                    className="px-3.5 py-1.5 bg-surface-container text-text-primary rounded-lg text-sm font-bold hover:bg-primary-container hover:text-white transition-all cursor-pointer"
                >
                    {show ? 'Hide Details' : 'Show Details'}
                </button>
            </div>
            {show && <div className="pt-3 border-t border-white/5">{children}</div>}
        </div>
    );
};

// Helper: Parses word tokens to extract profile handle syntax highlights automatically
const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\s+)/).map((word, idx) => {
        if (word.startsWith('@')) {
            return (
                <span key={idx} className="text-primary-container font-bold hover:underline cursor-pointer">
                    {word}
                </span>
            );
        }
        return word;
    });
};

function CascadedPostRowX({ post, isFocus, isAncestor, hasNextReply, onClick, onReplyClick, actions }) {
    const authorHandle = post.author?.handle || `@${post.author?.name.toLowerCase().replace(/\s+/g, '')}@kollective.social`;

    const handleRowClick = (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('span.cursor-pointer')) {
            return;
        }
        if (!isFocus) onClick(post.id);
    };

    return (
        <div
            onClick={handleRowClick}
            className={`flex flex-col relative p-6 border-b border-[#262626] last:border-b-0 transition-colors ${isFocus ? 'bg-[#181818]' : 'bg-[#141414] hover:bg-white/[0.015] cursor-pointer'
                }`}
        >
            {/* 🧵 The Continuous Context Thread Guideline line element */}
            {isAncestor && hasNextReply && (
                <div className="absolute top-[72px] bottom-0 w-[2px] bg-white/10 left-[48px] -translate-x-1/2 z-0" />
            )}

            <div className="flex gap-4 z-10 relative">
                {/* User Profile Avatar Frame */}
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-[#1A1616]">
                    {post.author?.avatar ? (
                        <img src={post.author.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary-container flex items-center justify-center font-bold text-white uppercase text-lg">
                            {post.author?.name ? post.author.name[0] : '?'}
                        </div>
                    )}
                </div>

                {/* Text Content Node Stack */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-text-primary text-sm md:text-base hover:underline truncate">
                                {post.author?.name}
                            </span>
                            {post.author?.verified && (
                                <span className="material-symbols-outlined text-[16px] text-text-secondary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    verified
                                </span>
                            )}
                            <span className="text-xs text-text-secondary font-mono truncate">{authorHandle}</span>
                        </div>
                        <span className="text-xs text-text-secondary shrink-0">{post.time || 'Just now'}</span>
                    </div>

                    {/* Focused expanded layout title checks */}
                    {isFocus && post.title && (
                        <h2 className="font-headline-lg text-2xl font-bold mb-4 text-text-primary tracking-tight leading-snug">
                            {post.title}
                        </h2>
                    )}

                    {/* Core Content Body Output */}
                    {post.contentWarning ? (
                        <ContentWarningWrapper warning={post.contentWarning}>
                            <p className={`text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap ${isFocus ? 'text-lg' : 'text-sm'}`}>
                                {renderText(post.text)}
                            </p>
                        </ContentWarningWrapper>
                    ) : (
                        <p className={`text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap ${isFocus ? 'text-lg' : 'text-sm'}`}>
                            {renderText(post.text)}
                        </p>
                    )}

                    {/* 🖼️ Preserved Image Attachment Grid View Matrix */}
                    {post.images && post.images.length > 0 && (
                        <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl mb-4 max-h-[320px]">
                            <div className={`grid gap-2 aspect-video w-full overflow-hidden ${post.images.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {post.images.slice(0, 4).map((img, idx) => (
                                    <div key={idx} className="cursor-pointer" onClick={() => { setCarouselIndex(idx); setCarouselOpen(true); }}>
                                        <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interactive Control Row Panel */}
                    <div className="pt-2 flex items-center gap-8 text-text-secondary">
                        <button
                            onClick={(e) => { e.stopPropagation(); onReplyClick(post.author?.name); }}
                            className="flex items-center gap-1.5 text-sm hover:text-primary-container bg-transparent border-none cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">reply</span>
                            <span>{post.commentsCount || 0}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); actions.toggleLike(post.id); }}
                            className={`flex items-center gap-1.5 text-sm transition-colors bg-transparent border-none cursor-pointer ${post.liked ? 'text-primary-container' : 'hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post.liked ? "'FILL' 1" : "'FILL' 0" }}>
                                favorite
                            </span>
                            <span>{(post.likes || 0).toLocaleString()}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); actions.toggleBookmark(post.id); }}
                            className={`flex items-center gap-1.5 text-sm transition-colors bg-transparent border-none cursor-pointer ml-auto ${post.bookmarked ? 'text-amber-500' : 'hover:text-amber-500'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">bookmark</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export const PostDetailsPage = () => {
    const { id: currentPostId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const postActions = usePostActions();

    // Local Form creation control configurations
    const [commentText, setCommentText] = useState('');
    const [showCommentCwInput, setShowCommentCwInput] = useState(false);
    const [commentCwText, setCommentCwText] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    // 🎯 NETWORK INTERACTION QUERY: Fetch the complete thread map list from your Elixir context endpoint
    const { data: threadContext, isPending } = useQuery({
        queryKey: ['post', currentPostId, 'thread'],
        queryFn: async () => {
            // Expected backend layout array parameters: { ancestors: [...], focus: {...}, descendants: [...] }
            return apiFetchPosts(`/posts/${currentPostId}/context`);
        },
    });

    // 🎯 SUBMISSION BALLOT MUTATION: Dispatches flat response elements natively near the view
    const replyMutation = useMutation({
        mutationFn: async (payload) => {
            return apiFetchPosts(`/posts/${currentPostId}/reply`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        },
        onSuccess: () => {
            // Invalidate target query indices to trigger an immediate localized refresh
            queryClient.invalidateQueries({ queryKey: ['post', currentPostId, 'thread'] });
            setCommentText('');
            setCommentCwText('');
            setShowCommentCwInput(false);
        },
    });

    const ancestors = threadContext?.ancestors || [];
    const focusPost = threadContext?.focus;
    const descendants = threadContext?.descendants || [];

    // Reset scroll metrics smoothly exactly when thread IDs change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPostId]);

    // Show a trending toast simulation on page open
    useEffect(() => {
        if (focusPost && focusPost?.id === 'renaissance-post') {
            const timer = setTimeout(() => {
                setShowToast(true);
                const hideTimer = setTimeout(() => {
                    setShowToast(false);
                }, 5000);
                return () => clearTimeout(hideTimer);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [focusPost]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        replyMutation.mutate({
            text: commentText.trim(),
            content_warning: showCommentCwInput ? commentCwText.trim() : undefined,
        });
    };

    const handleReplyClick = (authorName) => {
        const rawHandle = `@${authorName.toLowerCase().replace(/\s+/g, '')} `;
        setCommentText((prev) => prev.includes(rawHandle) ? prev : `${rawHandle}${prev}`);
        document.getElementById('comment-textarea')?.focus();
    };

    if (isPending) {
        return (
            <div className="pt-24 px-4 text-center flex flex-col items-center justify-center gap-4 w-full">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                <p className="text-text-secondary text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Thread Grid...</p>
            </div>
        );
    }

    console.log("ancestors", ancestors);
    console.log("focusPost", focusPost);
    console.log("descendants", descendants);

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 pb-20 w-full">
            {/* Central main timeline layout stack frame */}
            <div className="flex-1 flex flex-col gap-4 max-w-3xl">

                {/* Sticky configuration navigation header back elements */}
                <div className="sticky top-[60px] z-30 bg-surface backdrop-blur-md py-3 border-b border-white/5 flex justify-between items-center w-full">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-primary-container transition-colors font-bold text-sm cursor-pointer bg-transparent border-none">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span>Back</span>
                    </button>
                    <h4 className="text-xs uppercase tracking-widest text-text-secondary font-mono">Cascading Context</h4>
                </div>

                {/* 🥞 THE CASCADING STREAM WRAPPING SHIELD BOX */}
                <div className="flex flex-col border border-[#262626] bg-[#141414] overflow-hidden shadow-2xl w-full">

                    {/* 🔽 LAYOUT MARKS A: Ancestors (Context lines positioned above the focus) */}
                    {ancestors.map((item, idx) => (
                        <CascadedPostRow
                            key={item.id}
                            post={item}
                            isAncestor
                            hasNextReply={idx < ancestors.length}
                            onClick={(id) => navigate(`/post/${id}`)}
                            onReplyClick={handleReplyClick}
                            onLike={(id) => postActions.toggleLike(id)}
                            onBookmark={(id) => postActions.toggleBookmark(id)}
                        />
                    ))}

                    {/* 🎯 LAYOUT MARKS B: The Focus Card element itself */}
                    {focusPost && (
                        <CascadedPostRow
                            post={focusPost}
                            isFocus
                            onReplyClick={handleReplyClick}
                            onLike={(id) => postActions.toggleLike(id)}
                            onBookmark={(id) => postActions.toggleBookmark(id)}
                        />
                    )}

                    {/* 🗳️ LAYOUT MARKS C: Inline Response Form Element */}
                    <form onSubmit={handleCommentSubmit} className="p-6 bg-[#111111] border-b border-[#262626] flex flex-col gap-4">
                        {showCommentCwInput && (
                            <input
                                type="text"
                                placeholder="Content Warning label..."
                                value={commentCwText}
                                onChange={(e) => setCommentCwText(e.target.value)}
                                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary-container"
                            />
                        )}
                        <textarea
                            id="comment-textarea"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Publish your response parameters..."
                            className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-4 text-sm h-24 text-text-primary placeholder:text-text-secondary/30 focus:outline-none resize-none leading-relaxed"
                            required
                        />
                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => setShowCommentCwInput(!showCommentCwInput)}
                                className="text-xs font-bold text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer"
                            >
                                {showCommentCwInput ? 'Remove CW' : 'Add CW'}
                            </button>
                            <button
                                type="submit"
                                disabled={replyMutation.isPending || !commentText.trim()}
                                className="bg-primary-container text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-40"
                            >
                                {replyMutation.isPending ? 'Broadcasting...' : 'Broadcast Reply'}
                            </button>
                        </div>
                    </form>

                    {/* 🔼 LAYOUT MARKS D: Descendants (Responses sub-trees compiled underneath) */}
                    {descendants.map((item) => (
                        <CascadedPostRow
                            key={item.id}
                            post={item}
                            onClick={(id) => navigate(`/post/${id}`)}
                            onReplyClick={handleReplyClick}
                            onLike={(id) => postActions.toggleLike(id)}
                            onBookmark={(id) => postActions.toggleBookmark(id)}
                        />
                    ))}

                </div>
            </div>

            {/* Right Column: Sidebar Widgets */}
            <TrendingWidget />

            {/* Floating Trending Toast notification */}
            {showToast && (
                <div className="fixed bottom-24 right-8 transform transition-all duration-500 ease-out z-50 pointer-events-none">
                    <div className="bg-secondary-container text-on-secondary-container px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 animate-bounce">
                        <span className="material-symbols-outlined">trending_up</span>
                        <div>
                            <p className="font-bold text-sm">Post Trending!</p>
                            <p className="text-sm opacity-80">This Voice is gaining rapid impact.</p>
                        </div>
                    </div>
                </div>
            )}


            {focusPost && (
                <ImageCarouselModal
                    isOpen={carouselOpen}
                    onClose={() => setCarouselOpen(false)}
                    images={focusPost?.images && focusPost?.images.length > 0 ? focusPost?.images : focusPost?.image ? [focusPost?.image] : []}
                    imageAlts={focusPost?.images && focusPost?.images.length > 0 ? focusPost?.imageAlts : focusPost?.image ? [focusPost?.imageMeta || ""] : []}
                    initialIndex={carouselIndex}
                    post={focusPost}
                />
            )}
        </div>
    );
};
