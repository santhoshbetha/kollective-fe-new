import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { CascadedPostRow } from './CascadedPostRow';
import { useNavigate } from 'react-router-dom';
import { EmojiSelector } from '../EmojiSelector';
import { InlineFormTransition } from '../InlineFormTransition'
import { Smile, Paperclip, Loader2, X, Image as ImageIcon } from 'lucide-react';
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
    setShowCommentCwInput,
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
    const [showCommentEmojiDropdown, setShowCommentEmojiDropdown] = useState(false);

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

    //console.log("ModernLargeThreadContainer: unifiedLayoutItems", unifiedLayoutItems);
    //console.log("ModernLargeThreadContainer: focusPost", focusPost);

    console.log("ModernLargeThreadContainer: ancestors", ancestors);

    console.log("ModernLargeThreadContainer: focusPost : ", focusPost?.id, focusPost?.content, focusPost?.likes_count);


    // 🚀 Optimization 1: Standardize window scroll alignment on thread transitions
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [focusPost?.id]);

    // 🚀 Optimization 2: Stable, memoized callbacks to prevent unneeded card re-renders while typing
    const handlePostNavigation = useCallback((id) => {
        navigate(`/post/${id}`);
    }, [navigate]);

    const handleActionToggleX = useCallback((actionType, id) => {
        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
            return;
        }
        console.log("likeMutation handleActionToggle: actionType", actionType);
        console.log("likeMutation handleActionToggle: id", id);
        switch (actionType) {
            case 'like': postActions.toggleLike(id); break;
            case 'bookmark': postActions.toggleBookmark(id); break;
            case 'reblog': postActions.toggleReblog(id); break;
            default: break;
        }
    }, [isAuthenticated, setIsLoginPromptOpen, postActions]);

    const handleActionToggle = useCallback((actionType, payload) => {
        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
            return;
        }

        // 🚀 TARGET NORMALIZATION GATE: 
        // Safely check if the input is an advanced object parameter or a legacy loose string id
        const isObjectPayload = payload && typeof payload === 'object';
        const rawPostId = isObjectPayload ? payload.postId : payload;
        const rawReblogId = isObjectPayload ? payload.reblogId : null;

        // If we are inside the Thread View page, item.data is already the original content.
        // We ensure targetId maps directly to the active content item.
        const targetId = rawReblogId || rawPostId;

        console.log("likeMutation handleActionToggle: actionType", actionType);
        console.log("likeMutation handleActionToggle: targetId", targetId);
        console.log("likeMutation handleActionToggle: payload", payload);
        console.log("likeMutation handleActionToggle: rawPostId", rawPostId);
        console.log("likeMutation handleActionToggle: rawReblogId", rawReblogId);
        console.log("likeMutation handleActionToggle: isObjectPayload", isObjectPayload);

        switch (actionType) {
            case 'like':
                // Always pass down the exact targetId matching your mutation expectations
                //postActions.toggleLike(targetId);
                postActions.toggleLike({
                    postId: rawPostId,
                    reblogId: rawReblogId,
                    isCurrentlyLiked: isObjectPayload ? payload.isCurrentlyLiked : false
                });
                break;
            case 'bookmark':
                // Pass the structured object to match your bookmark mutation arguments block
                postActions.toggleBookmark({
                    postId: rawPostId,
                    reblogId: rawReblogId,
                    isCurrentlyBookmarked: isObjectPayload ? payload.isCurrentlyBookmarked : false
                });
                break;
            case 'reblog':
                postActions.toggleReblog(targetId);
                break;
            default:
                break;
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

        // Standardized character limits to keep layout inputs uniform
        const replyCharacterLimit = 500;
        const replyCharsLeft = replyCharacterLimit - (commentText || '').length;

        return (
            <div className="w-full bg-white dark:bg-[#111111] border-b border-black/10 dark:border-[#262626] animate-in fade-in slide-in-from-top-2 duration-200 text-left font-sans relative">
                <form
                    onSubmit={handleCommentSubmit}
                    className="p-5 sm:p-6 flex flex-col gap-4 relative w-full"
                >
                    {/* Content Warning input row block */}
                    {showCommentCwInput && (
                        <div className="animate-in slide-in-from-top-2 duration-150">
                            <input
                                type="text"
                                placeholder="Content Warning label..."
                                value={commentCwText}
                                onChange={(e) => setCommentCwText(e.target.value)}
                                className="w-full bg-black/[0.01] dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-primary-container transition-colors"
                            />
                        </div>
                    )}

                    {/* Main textarea canvas interaction box */}
                    <div className="relative w-full emoji-dropdown-container">
                        <textarea
                            id="comment-textarea"
                            value={commentText}
                            onFocus={() => setIsCommentExpanded(true)}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={`Replying to ${targetPost?.author?.name || 'citizen'}...`}
                            className={cn(
                                "w-full bg-black/[0.01] dark:bg-[#161616] border border-black/10 dark:border-white/10 rounded-xl p-4 text-base text-text-primary placeholder:text-text-secondary/30 focus:outline-none resize-none leading-relaxed transition-all duration-300",
                                isCommentExpanded ? 'h-40 md:h-48 shadow-xl border-primary-container/40' : 'h-24'
                            )}
                        />

                        {/* 📊 EMOJI SELECTOR INTEGRATION ROW */}
                        {showCommentEmojiDropdown && (
                            <EmojiSelector
                                onSelect={(emoji) => setCommentText(prev => (prev || '') + emoji)}
                                onClose={() => setShowCommentEmojiDropdown(false)}
                                className="bottom-16 left-2 z-50"
                            />
                        )}
                    </div>

                    {/* Multi-Media Attached Previews Strip Container */}
                    {commentImage && (
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 group select-none animate-in zoom-in-95 duration-100">
                            <img src={commentImage} alt="Attachment Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setCommentImage(null)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white text-xs flex items-center justify-center border-none cursor-pointer outline-none transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
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

                    {/* Toolbar Options Footer Panel Row */}
                    <div className="flex justify-between items-center relative font-mono text-[10px] uppercase font-bold tracking-wider select-none">
                        <div className="flex items-center gap-1 relative">
                            {/* Media upload action buttons */}
                            <button
                                type="button"
                                onClick={() => commentFileInputRef.current?.click()}
                                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center outline-none"
                                title="Attach Graphic Element"
                            >
                                <Paperclip className="w-4 h-4 stroke-[2.5px]" />
                            </button>

                            {/* Emoji menu activation switch controls */}
                            <button
                                type="button"
                                onClick={() => setShowCommentEmojiDropdown(!showCommentEmojiDropdown)}
                                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-primary-container transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center emoji-trigger-btn outline-none"
                                title="Insert Emojis"
                            >
                                <Smile className="w-4 h-4" />
                            </button>

                            {/* Content Warning toggle buttons strip */}
                            <button
                                type="button"
                                onClick={() => setShowCommentCwInput(!showCommentCwInput)}
                                className={cn(
                                    "p-2.5 rounded-xl flex items-center justify-center border-none text-[10px] uppercase tracking-wide font-sans font-bold cursor-pointer transition-all outline-none",
                                    showCommentCwInput ? 'bg-amber-500/10 text-amber-400' : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 bg-transparent'
                                )}
                                title="Toggle Content Warning"
                            >
                                CW
                            </button>
                        </div>

                        {/* Controls Submit Panel Buttons */}
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "text-xs font-mono font-bold select-none",
                                replyCharsLeft < 0 ? 'text-rose-500' : 'text-text-secondary/30'
                            )}>
                                {replyCharsLeft}
                            </span>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveReplyPostId(null);
                                    if (typeof setCommentText === 'function') setCommentText('');
                                    if (typeof setCommentImage === 'function') setCommentImage(null);
                                }}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold font-sans text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none outline-none active:scale-95"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={replyMutation.isPending || (!commentText.trim() && !commentImage) || replyCharsLeft < 0}
                                className="bg-primary-container text-white font-black text-xs font-sans px-5 py-2.5 rounded-xl hover:brightness-105 active:scale-95 cursor-pointer disabled:opacity-40 transition-all border-none outline-none crimson-glow flex items-center gap-1.5"
                            >
                                {replyMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 aristocracy-spin animate-spin" />
                                        <span>Broadcasting...</span>
                                    </>
                                ) : (
                                    <span>Broadcast Reply</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    };


    const renderInlineReplyFormWN = (targetPost) => {
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
    const renderInlineReplyFormWO = (targetPost) => {
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
