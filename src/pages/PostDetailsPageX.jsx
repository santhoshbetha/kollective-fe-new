import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingWidget } from '../components/TrendingWidget';
import { ImageCarouselModal } from '../components/ImageCarouselModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePostActions } from '../features/timeline/usePostActions';
import { apiFetch, apiFetchPosts } from '../api/apiClient';
import { CascadedPostRow } from '../components/CascadedPostRow';
import { usePostsStore } from '../store/usePostsStore';
import { UserAvatar } from '../components/UserAvatar';
import { EmojiSelector } from '../components/EmojiSelector';
import { useThread } from '../hooks/useThread';
import { useAuthStore } from '../store/auth/useAuthStore';
import { LoginPromptModal } from '../components/LoginPromptModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '../components/ui/Dialog';

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
                <UserAvatar user={post.author} className="w-12 h-12 border border-white/10 shrink-0 text-lg font-bold" roundedClassName="rounded-xl" />

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
                            <span className="material-symbols-outlined text-[18px]">
                                bookmark
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export const PostDetailsPageX = () => {
    const { id: currentPostId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const postActions = usePostActions();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState(null);

    // Local Form creation control configurations
    const storePost = usePostsStore((state) => currentPostId ? state.entities[currentPostId] : null);
    const [commentText, setCommentText] = useState('');
    const [showCommentCwInput, setShowCommentCwInput] = useState(false);
    const [commentCwText, setCommentCwText] = useState('');
    const [commentImage, setCommentImage] = useState(null);
    const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
    const [isCommentExpanded, setIsCommentExpanded] = useState(false);
    const commentFileInputRef = useRef(null);

    const [showToast, setShowToast] = useState(false);
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const handleCommentFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCommentImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 🎯 NETWORK INTERACTION QUERY: Fetch the complete thread map list from your Elixir context endpoint
    const { data: threadContext, isPending, error } = useThread(currentPostId);

    const replyMutationX = useMutation({
        mutationFn: async (payload) => {
            return apiFetchPosts(`/api/v1/posts/${currentPostId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // 1. Fix: Ensure backend parses it as JSON
                },
                body: JSON.stringify(payload),
            });
        },
        onSuccess: (res) => {
            const replyData = res?.data || res;
            if (replyData && replyData.id) {
                usePostsStore.getState().importFetchedPosts([replyData]);

                queryClient.setQueryData(['post', currentPostId, 'thread'], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        descendants: [...(oldData.descendants || []), replyData],
                        _raw: oldData._raw ? {
                            ...oldData._raw,
                            descendants: [...(oldData._raw.descendants || []), replyData]
                        } : undefined
                    };
                });
            }

            queryClient.invalidateQueries({
                queryKey: ['post', currentPostId, 'thread']
            });

            setCommentText('');
            setCommentCwText('');
            setCommentImage(null);
            setShowEmojiDropdown(false);
            setShowCommentCwInput(false);
            setIsCommentExpanded(false);

            setFeedbackModal({
                type: 'success',
                title: 'Reply Published',
                message: 'Your reply has been broadcasted successfully!'
            });
        },
        onError: (error) => {
            console.error("Failed to post reply:", error);

            let errorDetails = "Failed to broadcast reply. Please try again.";

            if (error?.data?.error) {
                errorDetails = error.data.error;
            } else if (error?.data?.message) {
                errorDetails = error.data.message;
            } else if (error?.data?.errors) {
                if (typeof error.data.errors === 'string') {
                    errorDetails = error.data.errors;
                } else if (typeof error.data.errors === 'object') {
                    errorDetails = Object.entries(error.data.errors)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join('; ');
                }
            } else if (error?.message) {
                errorDetails = error.message;
            }

            setFeedbackModal({
                type: 'error',
                title: 'Broadcast Failed',
                message: errorDetails
            });
        }
    });

    // 🎯 SUBMISSION BALLOT MUTATION: Dispatches flat response elements natively near the view
    const replyMutation = useMutation({
        mutationFn: async (payload) => {
            return apiFetchPosts(`/api/v1/posts/${currentPostId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        },

        // 🚀 Step 1: Fire instantly when mutate() is executed
        onMutate: async (payload) => {
            const threadKey = ['post', currentPostId, 'thread'];

            // Cancel outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: threadKey });

            // Snapshot the current cache value to use for rollback on failure
            const previousThreadData = queryClient.getQueryData(threadKey);

            // Generate a mock, temporary post structure matching Elixir API conventions
            const tempId = `temp-${Date.now()}`;
            const optimisticReply = {
                id: tempId,
                body: payload.body || payload.text || commentText, // Fallback to current input if needed
                inserted_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                isOptimistic: true,
                // Pre-inject account context so it doesn't look blank in the UI card
                account: activeAccount || currentUser || {},
                likes: 0,
                replies_count: 0
            };

            // Pre-sync Zustand entity dictionary index table so components can format it
            usePostsStore.getState().importFetchedPosts([optimisticReply]);

            // Inject the optimistic comment directly into the cached array list
            queryClient.setQueryData(threadKey, (oldData) => {
                if (!oldData) return oldData;

                const currentDescendants = Array.isArray(oldData.descendants) ? oldData.descendants : [];

                return {
                    ...oldData,
                    descendants: [...currentDescendants, optimisticReply],
                    ...(oldData._raw ? {
                        _raw: {
                            ...oldData._raw,
                            descendants: [...(oldData._raw.descendants || []), optimisticReply]
                        }
                    } : {})
                };
            });

            // Clear local input view elements instantly for a fast UI snap feel
            setCommentText('');
            setCommentCwText('');
            setCommentImage(null);
            setShowEmojiDropdown(false);
            setShowCommentCwInput(false);
            setIsCommentExpanded(false);

            // Return context containing the rollback snapshot
            return { previousThreadData, threadKey, tempId };
        },

        // 🛡️ Step 2: Roll back to exact state if the network fails
        onError: (error, payload, context) => {
            console.error("Failed to post reply:", error);

            if (context?.threadKey && context?.previousThreadData) {
                // Restore snapshot
                queryClient.setQueryData(context.threadKey, context.previousThreadData);
            }

            let errorDetails = "Failed to broadcast reply. Please try again.";
            if (error?.data?.error) errorDetails = error.data.error;
            else if (error?.data?.message) errorDetails = error.data.message;
            else if (error?.message) errorDetails = error.message;

            setFeedbackModal({
                type: 'error',
                title: 'Broadcast Failed',
                message: errorDetails
            });
        },

        // 🎉 Step 3: Swap out the temporary object with the actual backend confirmation payload
        onSuccess: (res, payload, context) => {
            const replyData = res?.data || res;

            if (replyData && replyData.id && context?.threadKey) {
                // Import the official backend post object into the store
                usePostsStore.getState().importFetchedPosts([replyData]);

                queryClient.setQueryData(context.threadKey, (oldData) => {
                    if (!oldData) return oldData;

                    // Swap the matching temporary item pointer with the validated production ID
                    const currentDescendants = Array.isArray(oldData.descendants) ? oldData.descendants : [];
                    const updatedDescendants = currentDescendants.map(item =>
                        item.id === context.tempId ? replyData : item
                    );

                    return {
                        ...oldData,
                        descendants: updatedDescendants,
                        ...(oldData._raw ? {
                            _raw: {
                                ...oldData._raw,
                                descendants: (oldData._raw.descendants || []).map(item =>
                                    item.id === context.tempId ? replyData : item
                                )
                            }
                        } : {})
                    };
                });
            }

            setFeedbackModal({
                type: 'success',
                title: 'Reply Published',
                message: 'Your reply has been broadcasted successfully!'
            });
        },

        // 🏁 Step 4: Always refetch/validate silently in background to keep data exact
        onSettled: (data, error, payload, context) => {
            if (context?.threadKey) {
                queryClient.invalidateQueries({
                    queryKey: context.threadKey,
                    refetchType: 'none' // Silently validates cache without cutting off UI elements
                });
            }
        }
    });

    const ancestors = threadContext?.ancestors || [];
    const rawDescendants = threadContext?.descendants || [];
    const focusPost = threadContext?.focus || storePost || (currentPostId ? {
        id: currentPostId,
        author: { name: "Julian Thorne", handle: "@j_thorne", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c", verified: true },
        title: "Sovereign Community Node Update",
        text: "Exploring decentralized parameters, localized mesh coordination, and civic engagement pipelines across the Kollective network.",
        time: "10m ago",
        likes: 42,
        commentsCount: 2
    } : null);

    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    const isFocusSelf = () => {
        if (!focusPost || !focusPost.author) return false;
        const currentUserId = currentUser?.id || activeAccount?.id;
        const currentUsername = currentUser?.username || activeAccount?.username;
        const currentName = currentUser?.name || activeAccount?.name;

        const authorId = focusPost.author.id;
        const authorUsername = focusPost.author.username || (focusPost.author.handle ? focusPost.author.handle.replace('@', '') : null);
        const authorName = focusPost.author.name;

        if (currentUserId && authorId && String(currentUserId) === String(authorId)) return true;
        if (currentUsername && authorUsername && currentUsername.toLowerCase() === authorUsername.toLowerCase()) return true;
        if (currentName && authorName && currentName.toLowerCase() === authorName.toLowerCase()) return true;
        return false;
    };
    const isFocusPostSelf = isFocusSelf();
    const descendants = (rawDescendants && Array.isArray(rawDescendants) && rawDescendants.length > 0)
        ? rawDescendants
        : (focusPost?.comments && Array.isArray(focusPost.comments)
            ? focusPost.comments.map((c) => ({
                id: c.id || `reply-${Math.random().toString(36).substr(2, 6)}`,
                author: c.author || { name: c.userName || 'Citizen', avatar: c.userAvatar || '/default-avatar.jpg' },
                text: c.content || c.text || '',
                time: c.time || c.timeAgo || 'Just now',
                likes: c.likes || 0,
                commentsCount: c.replies?.length || 0,
                images: c.images || (c.image ? [c.image] : [])
            }))
            : []);

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
        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
            return;
        }
        if (!commentText.trim() && !commentImage) return;

        replyMutation.mutate({
            text: commentText.trim(),
            content_warning: showCommentCwInput ? commentCwText.trim() : undefined,
            images: commentImage ? [commentImage] : undefined,
        });
    };

    const handleReplyClick = (authorName) => {
        const rawHandle = authorName ? `@${authorName.toLowerCase().replace(/\s+/g, '')} ` : '';
        setCommentText((prev) => prev.includes(rawHandle) ? prev : `${rawHandle}${prev}`);
        setIsCommentExpanded(true);
        setTimeout(() => {
            const textarea = document.getElementById('comment-textarea');
            if (textarea) {
                textarea.focus();
                textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50);
    };

    console.log("ancestors:", ancestors);
    console.log("focusPost:", focusPost);
    console.log("descendants:", descendants);

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

                    {isPending && (
                        <div className="py-2.5 px-6 border-b border-[#262626] bg-[#181818] flex items-center justify-between gap-2 text-xs text-text-secondary font-mono">
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
                                <span>Syncing replies and context...</span>
                            </div>
                        </div>
                    )}

                    {/* 🔽 LAYOUT MARKS A: Ancestors (Context lines positioned above the focus) */}
                    {ancestors.map((item, idx) => (
                        <CascadedPostRow
                            key={item.id}
                            post={item}
                            isAncestor
                            hasNextReply={idx < ancestors.length}
                            onClick={(id) => navigate(`/post/${id}`)}
                            onReplyClick={handleReplyClick}
                            onLike={(id) => {
                                if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                                postActions.toggleLike(id);
                            }}
                            onBookmark={(id) => {
                                if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                                postActions.toggleBookmark(id);
                            }}
                            onReblog={(id) => {
                                if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                                postActions.toggleReblog(id);
                            }}
                        />
                    ))}

                    {/* 🎯 LAYOUT MARKS B: The Focus Card element itself */}
                    {focusPost && (
                        <CascadedPostRow
                            post={focusPost}
                            isFocus
                            onReplyClick={handleReplyClick}
                            onLike={(id) => {
                                if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                                postActions.toggleLike(id);
                            }}
                            onBookmark={(id) => {
                                if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                                postActions.toggleBookmark(id);
                            }}
                            onReblog={(id) => {
                                if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                                postActions.toggleReblog(id);
                            }}
                        />
                    )}

                    {/* 🗳️ LAYOUT MARKS C: Inline Response Form Element */}
                    {!isFocusPostSelf ? (
                        <form onSubmit={handleCommentSubmit} className="p-6 bg-[#111111] border-b border-[#262626] flex flex-col gap-4 relative">
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
                                onFocus={() => setIsCommentExpanded(true)}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Publish your response parameters..."
                                className={`w-full bg-surface-container-lowest border border-white/10 rounded-xl p-4 text-lg text-text-primary placeholder:text-text-secondary/30 focus:outline-none resize-none leading-relaxed transition-all duration-300 ${isCommentExpanded ? 'h-40 md:h-48 shadow-lg border-primary-container/40' : 'h-24'
                                    }`}
                            />

                            {commentImage && (
                                <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/10 group">
                                    <img src={commentImage} alt="Attachment Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setCommentImage(null)}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center border-none cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={commentFileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handleCommentFileChange}
                            />

                            <div className="flex justify-between items-center relative">
                                <div className="flex items-center gap-3 relative">
                                    <button
                                        type="button"
                                        onClick={() => commentFileInputRef.current?.click()}
                                        className="p-1.5 rounded-full hover:bg-white/5 text-text-secondary hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center"
                                        title="Attach Image"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">attachment</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiDropdown(!showEmojiDropdown)}
                                        className="p-1.5 rounded-full hover:bg-white/5 text-text-secondary hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center"
                                        title="Add Emoji"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                                    </button>

                                    {showEmojiDropdown && (
                                        <EmojiSelector
                                            onSelect={(emoji) => setCommentText((prev) => prev + emoji)}
                                            onClose={() => setShowEmojiDropdown(false)}
                                        />
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setShowCommentCwInput(!showCommentCwInput)}
                                        className="text-xs font-bold text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer ml-2"
                                    >
                                        {showCommentCwInput ? 'Remove CW' : 'Add CW'}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={replyMutation.isPending || (!commentText.trim() && !commentImage)}
                                    className="bg-primary-container text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-40"
                                >
                                    {replyMutation.isPending ? 'Broadcasting...' : 'Broadcast Reply'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 bg-[#111111] border-b border-[#262626] text-center text-xs text-text-secondary/60 font-mono">
                            You cannot reply to your own post
                        </div>
                    )}

                    {/* 🔼 LAYOUT MARKS D: Descendants (Responses sub-trees compiled underneath) */}
                    {descendants.map((item) => (
                        <CascadedPostRow
                            key={item.id}
                            post={item}
                            onClick={(id) => navigate(`/post/${id}`)}
                            onReplyClick={handleReplyClick}
                            onLike={(id) => {
                                if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                                postActions.toggleLike(id);
                            }}
                            onBookmark={(id) => {
                                if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                                postActions.toggleBookmark(id);
                            }}
                            onReblog={(id) => {
                                if (!isAuthenticated) { setIsLoginPromptOpen(true); return; }
                                postActions.toggleReblog(id);
                            }}
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

            <LoginPromptModal
                isOpen={isLoginPromptOpen}
                onClose={() => setIsLoginPromptOpen(false)}
                message="Please log in to broadcast a reply or interact with posts."
            />

            {feedbackModal && (
                <Dialog open={!!feedbackModal} onOpenChange={() => setFeedbackModal(null)}>
                    <DialogContent className="max-w-[420px] bg-[#141414] text-white border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <DialogHeader className="border-b border-white/10 pb-4 p-0 bg-transparent flex flex-row items-center justify-between">
                            <DialogTitle className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                                <span className={`material-symbols-outlined text-2xl ${feedbackModal.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {feedbackModal.type === 'error' ? 'error' : 'check_circle'}
                                </span>
                                {feedbackModal.title}
                            </DialogTitle>
                            <DialogClose onClick={() => setFeedbackModal(null)} />
                        </DialogHeader>
                        <div className="py-4 space-y-3">
                            <p className="text-text-secondary text-sm leading-relaxed font-bold">
                                {feedbackModal.message}
                            </p>
                        </div>
                        <DialogFooter className="flex justify-end pt-2 border-t-0 p-0">
                            <button
                                type="button"
                                onClick={() => setFeedbackModal(null)}
                                className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all cursor-pointer text-sm uppercase tracking-wider border-none text-white ${feedbackModal.type === 'error'
                                    ? 'bg-rose-600 hover:bg-rose-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                            >
                                Dismiss
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};
