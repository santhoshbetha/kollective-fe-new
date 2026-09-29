import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { CascadedPostRow } from './CascadedPostRow';
import { useNavigate } from 'react-router-dom';
import { InlineFormTransition } from './InlineFormTransition';
import { cn } from "@/lib/utils";

export const ModernLargeThreadContainer = ({
    currentUser,
    activeAccount,
    ancestors = [],
    focusPost,
    descendants = [],
    isFocusPostSelf,
    isAuthenticated,
    setIsLoginPromptOpen,
    postActions,
    handleReplyClick,
    handleCommentSubmit,
    commentText,
    setCommentText,
    commentCwText,
    setCommentCwText,
    showCommentCwInput,
    isCommentExpanded,
    setIsCommentExpanded,
    commentImage,
    setCommentImage,
    commentFileInputRef,
    handleCommentFileChange,
    replyMutation,
    showEmojiDropdown,
    setShowEmojiDropdown,
    activeReplyPostId,
    setActiveReplyPostId
}) => {
    const navigate = useNavigate();

    // 🚀 UNIFICATION MATRIX: Combine lists into a flat layout description array
    const unifiedLayoutItems = useMemo(() => {
        const list = [];

        // 1. Inject Ancestors
        ancestors.forEach((item, idx) => {
            list.push({ type: 'ANCESTOR', data: item, hasNextReply: idx < ancestors.length });
        });

        // 2. Inject the main focal post
        if (focusPost) {
            list.push({ type: 'FOCUS', data: focusPost });

            // 🚀 ALWAYS keep this row slot inside the array so Virtuoso's index maps stay permanent
            list.push({ type: 'FOCUS_REPLY_FORM', data: focusPost });
        }

        // 3. Inject Descendants
        descendants.forEach((item) => {
            list.push({ type: 'DESCENDANT', data: item });
        });

        return list;
    }, [ancestors, focusPost, descendants]); // Remove activeReplyPostId from dependencies!

    console.log("ModernLargeThreadContainer: unifiedLayoutItems", unifiedLayoutItems);
    console.log("ModernLargeThreadContainer: focusPost", focusPost);


    // 🚀 Optimization 1: Standardize window scroll alignment on thread transitions
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [focusPost?.id]);

    // 🚀 Optimization 2: Stable, memoized callbacks to prevent unneeded card re-renders while typing
    const handlePostNavigation = useCallback((id) => {
        navigate(`/post/${id}`);
    }, [navigate]);

    const handleActionToggle = useCallback((actionType, id) => {
        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
            return;
        }
        switch (actionType) {
            case 'like': postActions.toggleLike(id); break;
            case 'bookmark': postActions.toggleBookmark(id); break;
            case 'reblog': postActions.toggleReblog(id); break;
            default: break;
        }
    }, [isAuthenticated, setIsLoginPromptOpen, postActions]);

    const renderInlineReplyForm = (targetPost) => {
        if (!targetPost) return null;

        const isCurrentlyTargeted = activeReplyPostId === targetPost.id;

        /* 
           🚀 THE STABILITY FIX: If the box is not active for this post item, 
           we return a 1px invisible element. Virtuoso reads it as a valid row node, 
           bypassing the "Zero-sized element" crash completely, while keeping it hidden from users.
        */
        if (!isCurrentlyTargeted) {
            return <div className="h-[1px] w-full bg-transparent opacity-0 pointer-events-none" />;
        }

        return (
            <div className="w-full bg-[#111111] border-b border-[#262626] animate-in fade-in slide-in-from-top-2 duration-200">
                <form
                    onSubmit={handleCommentSubmit}
                    className="p-6 flex flex-col gap-4 relative w-full"
                >
                    {showCommentCwInput && (
                        <input
                            type="text"
                            placeholder="Content Warning label..."
                            value={commentCwText}
                            onChange={(e) => setCommentCwText(e.target.value)}
                            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary-container"
                        />
                    )}

                    <textarea
                        id="comment-textarea"
                        value={commentText}
                        onFocus={() => setIsCommentExpanded(true)}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={`Replying to ${targetPost?.author?.name}...`}
                        className={`w-full bg-[#161616] border border-white/10 rounded-xl p-4 text-base text-text-primary placeholder:text-text-secondary/30 focus:outline-none resize-none leading-relaxed transition-all duration-300 ${isCommentExpanded ? 'h-40 md:h-48 shadow-lg border-primary-container/40' : 'h-24'
                            }`}
                    />

                    {commentImage && (
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/10 group">
                            <img src={commentImage} alt="Attachment Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setCommentImage(null)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center border-none"
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
                            >
                                <span className="material-symbols-outlined text-[20px]">attachment</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    console.log('Cancelling reply for post', targetPost?.id)
                                    setActiveReplyPostId(null)
                                }}
                                className="px-4 py-2.5 rounded-xl text-xs text-text-secondary hover:text-text-primary font-bold transition-colors cursor-pointer bg-transparent border-none"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={replyMutation.isPending || (!commentText.trim() && !commentImage)}
                                className="bg-primary-container text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-40 transition-all border-none"
                            >
                                {replyMutation.isPending ? 'Broadcasting...' : 'Broadcast Reply'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    };

    // 🗳️ Optimized Inline Response Form Element Closure
    const renderInlineReplyFormW = (targetPost) => {
        if (!targetPost) return null;

        // Track if this specific post is the one actively being replied to
        const isCurrentlyTargeted = Boolean(activeReplyPostId && targetPost?.id && String(activeReplyPostId) === String(targetPost.id));

        /* 
           🚀 THE TRANSITION FIX: Instead of instantly unmounting, we keep the form 
           mounted briefly when isCurrentlyTargeted flips to false, allowing Tailwind's 
           animation engine to play out the closing transition sequences smoothly.
        */
        return (
            <InlineFormTransition
                show={isCurrentlyTargeted}
                onAnimationComplete={() => {
                    // Wipe any temporary field states once the form is cleanly hidden
                    if (!isCurrentlyTargeted) {
                        setIsCommentExpanded(false);
                    }
                }}
            >
                <form
                    onSubmit={handleCommentSubmit}
                    className="p-6 bg-[#111111] border-b border-[#262626] flex flex-col gap-4 relative w-full origin-top"
                >
                    {showCommentCwInput && (
                        <input
                            type="text"
                            placeholder="Content Warning label..."
                            value={commentCwText}
                            onChange={(e) => setCommentCwText(e.target.value)}
                            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary-container animate-in fade-in duration-200"
                        />
                    )}

                    <textarea
                        id="comment-textarea"
                        value={commentText}
                        onFocus={() => setIsCommentExpanded(true)}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={`Replying to ${targetPost?.author?.name}...`}
                        className={`w-full bg-[#161616] border border-white/10 rounded-xl p-4 text-base text-text-primary placeholder:text-text-secondary/30 focus:outline-none resize-none leading-relaxed transition-all duration-300 ${isCommentExpanded ? 'h-40 md:h-48 shadow-lg border-primary-container/40' : 'h-24'
                            }`}
                    />

                    {commentImage && (
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/10 group animate-in zoom-in-95 duration-150">
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
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveReplyPostId(null);
                                }}
                                className="px-4 py-2.5 rounded-xl text-xs text-text-secondary hover:text-text-primary font-bold transition-colors cursor-pointer bg-transparent border-none"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={replyMutation.isPending || (!commentText.trim() && !commentImage)}
                                className="bg-primary-container text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-40 transition-all border-none"
                            >
                                {replyMutation.isPending ? 'Broadcasting...' : 'Broadcast Reply'}
                            </button>
                        </div>
                    </div>
                </form>
            </InlineFormTransition>
        );
    };

    return (
        <Virtuoso
            useWindowScroll
            data={unifiedLayoutItems}
            computeItemKey={(index, item) => {
                if (item.type === 'FOCUS_REPLY_FORM') {
                    return `focus-form-${item.data?.id}`;
                }
                return `${item.type}-${item.data?.id || index}`;
            }}
            increaseViewportBy={400}
            overscan={200}
            itemContent={(index, item) => {
                // 🚀 STEP A: Compute accurate, unique reactive indicator states for each individual row post node item
                const itemPost = item?.data;
                const isReblog = Boolean(itemPost?.reblog);
                const targetData = isReblog ? itemPost.reblog : itemPost;

                const currentRowLiked = Boolean(
                    targetData?.liked ||
                    targetData?.has_liked ||
                    itemPost?.liked ||
                    itemPost?.has_liked
                );

                const currentRowBookmarked = Boolean(
                    targetData?.bookmarked ||
                    targetData?.isBookmarked ||
                    itemPost?.bookmarked ||
                    itemPost?.isBookmarked
                );

                // 🚀 THE VOICE POST DETECTOR CHECK: Matches your timeline feed logic settings
                const isVoicePost = Boolean(
                    itemPost?.category === 'voice' ||
                    targetData?.category === 'voice' ||
                    itemPost?.voice_url ||
                    targetData?.voice_url ||
                    (Array.isArray(itemPost?.media_attachments) && itemPost.media_attachments.some(m => m.type === 'audio'))
                );

                // 🥞 Custom Composed Voice Label Row Fragment Component
                const renderVoiceLabel = () => isVoicePost && (
                    <div className="absolute top-0 left-0 bg-primary-container text-white px-4 py-1.5 flex items-center gap-2 rounded-br-xl z-20 shadow-md">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            campaign
                        </span>
                        <span className="font-bold text-xs uppercase tracking-widest font-mono">VOICE</span>
                    </div>
                );

                switch (item.type) {
                    case 'ANCESTOR':
                        return (
                            <div className="w-full relative pt-0">
                                {renderVoiceLabel()}
                                <CascadedPostRow
                                    post={item.data}
                                    isAncestor
                                    hasNextReply={item.hasNextReply}
                                    onClick={handlePostNavigation}
                                    onReplyClick={(authorName) => handleReplyClick(authorName, item.data?.id)}
                                    // 🚀 UPGRADE: Inject dynamic, instance-specific state fields 
                                    onLike={() => handleActionToggle('like', {
                                        postId: item.data?.id,
                                        reblogId: isReblog ? item.data?.reblog?.id : null,
                                        isCurrentlyLiked: currentRowLiked
                                    })}
                                    onBookmark={() => handleActionToggle('bookmark', {
                                        postId: item.data?.id,
                                        reblogId: isReblog ? item.data?.reblog?.id : null,
                                        isCurrentlyBookmarked: currentRowBookmarked
                                    })}
                                    onReblog={(id) => handleActionToggle('reblog', id)}
                                />
                                {renderInlineReplyForm(item.data)}
                            </div>
                        );
                    case 'FOCUS':
                        // 🚀 SAFE LOCAL BOUNDARY BOUNDS SHIELD: Check category parameters ONLY inside the target FOCUS node
                        const isFocusVoice = Boolean(
                            itemPost?.category === 'voice' ||
                            targetData?.category === 'voice' ||
                            itemPost?.voice_url ||
                            targetData?.voice_url ||
                            (Array.isArray(itemPost?.media_attachments) && itemPost.media_attachments.some(m => m.type === 'audio'))
                        );

                        return (
                            <div className={cn("w-full relative", isFocusVoice ? "pt-10" : "pt-0")}>
                                {renderVoiceLabel(isFocusVoice)}
                                <CascadedPostRow
                                    post={item.data}
                                    isFocus
                                    onReplyClick={(authorName) => {
                                        console.log("🚀 ~ PostDetailsPageTest ~ handleReplyClick ~ item.data?.id:", item.data?.id);
                                        handleReplyClick(authorName, item.data?.id)
                                    }}
                                    // 🚀 UPGRADE: Inject dynamic, instance-specific state fields
                                    onLike={() => handleActionToggle('like', {
                                        postId: item.data?.id,
                                        reblogId: isReblog ? item.data?.reblog?.id : null,
                                        isCurrentlyLiked: currentRowLiked
                                    })}
                                    onBookmark={() => handleActionToggle('bookmark', {
                                        postId: item.data?.id,
                                        reblogId: isReblog ? item.data?.reblog?.id : null,
                                        isCurrentlyBookmarked: currentRowBookmarked
                                    })}
                                    onReblog={(id) => handleActionToggle('reblog', id)}
                                />
                            </div>
                        );

                    case 'FOCUS_REPLY_FORM':
                        return renderInlineReplyForm(focusPost);
                    case 'DESCENDANT':
                        return (
                            <div className="w-full relative pt-0">
                                <CascadedPostRow
                                    post={item.data}
                                    onClick={handlePostNavigation}
                                    onReplyClick={(authorName) => handleReplyClick(authorName, item.data?.id)}
                                    // 🚀 UPGRADE: Standardize Descendant parameters to match the reblog configuration specifications
                                    onLike={() => handleActionToggle('like', {
                                        postId: item.data?.id,
                                        reblogId: isReblog ? item.data?.reblog?.id : null,
                                        isCurrentlyLiked: currentRowLiked
                                    })}
                                    onBookmark={() => handleActionToggle('bookmark', {
                                        postId: item.data?.id,
                                        reblogId: isReblog ? item.data?.reblog?.id : null,
                                        isCurrentlyBookmarked: currentRowBookmarked
                                    })}
                                    onReblog={(id) => handleActionToggle('reblog', id)}
                                />
                                {renderInlineReplyForm(item.data)}
                            </div>
                        );
                    default:
                        return null;
                }
            }}
        />
    );


    /*
    return (
        <Virtuoso
            useWindowScroll
            data={unifiedLayoutItems}
            computeItemKey={(index, item) => {
                if (item.type === 'FOCUS_REPLY_FORM') {
                    return `focus-form-${item.data?.id}`;
                }
                return `${item.type}-${item.data?.id || index}`;
            }}
            //🚀 Pre-render content 400px *ahead* of the viewport bottom. 
            //   This triggers smooth background preparation for fast scrolls.
            increaseViewportBy={400}
            overscan={200}
            itemContent={(index, item) => {
                switch (item.type) {
                    case 'ANCESTOR':
                        return (
                            <>
                                <CascadedPostRow
                                    post={item.data}
                                    isAncestor
                                    hasNextReply={item.hasNextReply}
                                    onClick={handlePostNavigation}
                                    // 🚀 FIX: Pull the unique post ID directly out of item.data.id 
                                    onReplyClick={(authorName) => handleReplyClick(authorName, item.data?.id)}
                                    onLike={(id) => handleActionToggle('like', {
                                        postId: item.data?.id,
                                        reblogId: item.data?.reblogged ? item.data?.reblog.id : null,
                                        isCurrentlyLiked: isLiked
                                    })}
                                    onBookmark={(id) => handleActionToggle('bookmark', id)}
                                    onReblog={(id) => handleActionToggle('reblog', id)}
                                />
                                {renderInlineReplyForm(item.data)}
                            </>
                        );
                    case 'FOCUS':
                        return (
                            <>
                                <CascadedPostRow
                                    post={item.data}
                                    isFocus
                                    // 🚀 FIX: Pull the unique post ID directly out of item.data.id 
                                    onReplyClick={(authorName) => {
                                        console.log("🚀 ~ PostDetailsPageTest ~ handleReplyClick ~ item.data?.id:", item.data?.id);
                                        handleReplyClick(authorName, item.data?.id)
                                    }}
                                    onLike={(id) => handleActionToggle('like', {
                                        postId: item.data?.id,
                                        reblogId: item.data?.reblogged ? item.data?.reblog.id : null,
                                        isCurrentlyLiked: isLiked
                                    })}
                                    onBookmark={(id) => handleActionToggle('bookmark', id)}
                                    onReblog={(id) => handleActionToggle('reblog', id)}
                                />
                            </>
                        );

                    case 'FOCUS_REPLY_FORM':
                        return renderInlineReplyForm(focusPost);
                    case 'DESCENDANT':
                        return (
                            <>
                                <CascadedPostRow
                                    post={item.data}
                                    onClick={handlePostNavigation}
                                    // 🚀 FIX: Pull the unique post ID directly out of item.data.id 
                                    onReplyClick={(authorName) => handleReplyClick(authorName, item.data?.id)}
                                    onLike={(id) => handleActionToggle('like', id)}
                                    onBookmark={(id) => handleActionToggle('bookmark', id)}
                                    onReblog={(id) => handleActionToggle('reblog', id)}
                                />
                            </>
                        );
                    default:
                        return null;
                }
            }}
        />
    );*/
};
