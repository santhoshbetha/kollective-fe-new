import React, { useMemo, useCallback, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { CascadedPostRow } from './CascadedPostRow';
import { useNavigate } from 'react-router-dom';

export const ModernLargeThreadContainer = ({
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
    setShowEmojiDropdown
}) => {
    const navigate = useNavigate();

    console.log("ModernLargeThreadContainer ancestors::", ancestors);
    console.log("ModernLargeThreadContainer focusPost::", focusPost);
    console.log("ModernLargeThreadContainer descendants::", descendants);

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
        }

        // 3. Inject the Input Form block directly as a layout structural element
        list.push({ type: 'INPUT_FORM' });

        // 4. Inject Descendants
        descendants.forEach((item) => {
            list.push({ type: 'DESCENDANT', data: item });
        });

        return list;
    }, [ancestors, focusPost, descendants]);

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

    return (
        <Virtuoso
            useWindowScroll
            data={unifiedLayoutItems}
            computeItemKey={(index, item) => {
                if (item.type === 'INPUT_FORM') return `form-${focusPost?.id || 'main'}`;
                return `${item.type}-${item.data?.id || index}`;
            }}
            /* 
               🚀 Pre-render content 400px *ahead* of the viewport bottom. 
               This triggers smooth background preparation for fast scrolls.
            */
            increaseViewportBy={400}
            overscan={200}

            itemContent={(index, item) => {
                switch (item.type) {
                    case 'ANCESTOR':
                        return (
                            <CascadedPostRow
                                post={item.data}
                                isAncestor
                                hasNextReply={item.hasNextReply}
                                onClick={handlePostNavigation}
                                onReplyClick={handleReplyClick}
                                onLike={(id) => handleActionToggle('like', id)}
                                onBookmark={(id) => handleActionToggle('bookmark', id)}
                                onReblog={(id) => handleActionToggle('reblog', id)}
                            />
                        );
                    case 'FOCUS':
                        return (
                            <CascadedPostRow
                                post={item.data}
                                isFocus
                                onReplyClick={handleReplyClick}
                                onLike={(id) => handleActionToggle('like', id)}
                                onBookmark={(id) => handleActionToggle('bookmark', id)}
                                onReblog={(id) => handleActionToggle('reblog', id)}
                            />
                        );
                    case 'INPUT_FORM':
                        return !isFocusPostSelf ? (
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
                            <div className="p-4 bg-[#111111] border-b border-[#262626] text-center text-xs text-text-secondary/40 font-mono tracking-wider">
                                REPLY_DISABLED // Cannot counter-sign your own pulse entry
                            </div>
                        );
                    case 'DESCENDANT':
                        return (
                            <CascadedPostRow
                                post={item.data}
                                onClick={handlePostNavigation}
                                onReplyClick={handleReplyClick}
                                onLike={(id) => handleActionToggle('like', id)}
                                onBookmark={(id) => handleActionToggle('bookmark', id)}
                                onReblog={(id) => handleActionToggle('reblog', id)}
                            />
                        );
                    default:
                        return null;
                }
            }}
        />
    );
};
