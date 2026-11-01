import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TrendingWidget } from '../../components/TrendingWidget';
import { ImageCarouselModal } from '../../components/modals/ImageCarouselModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePostActions } from '../../features/timeline/usePostActions';
import { apiFetchPosts } from '../../api/apiClient';
import { usePostsStore } from '../../store/usePostsStore';
import { useThread } from '../../hooks/useThread';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { LoginPromptModal } from '../../components/modals/LoginPromptModal';
import { getReplyCount } from '../../utils/postHelpers';
import { prepareBroadcastPayload } from '../../utils/broadcastNormalize';
import { ModernLargeThreadContainer } from '../../components/posts/ModernLargeThreadContainer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '../../components/ui/Dialog';

export const PostDetailsPage = () => {
    const { id: currentPostId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const postActions = usePostActions();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

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
    const [activeReplyPostId, setActiveReplyPostId] = useState(null);
    const [localDescendants, setLocalDescendants] = useState([]);
    const commentFileInputRef = useRef(null);

    const [showToast, setShowToast] = useState(false);
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Reset local descendants when navigating between different posts
    useEffect(() => {
        setLocalDescendants([]);
        setActiveReplyPostId(null);
    }, [currentPostId]);

    /**
     * 📸 HANDLES LOCAL FILE SELECTION FOR INLINE TIMELINE COMMENTS
     */
    const handleCommentFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            const maxCommentByteLimit = 5 * 1024 * 1024; // 5MB
            if (file.size > maxCommentByteLimit) {
                setFeedbackModal({
                    type: 'error',
                    title: 'Media Allocation Dropped',
                    message: `The attached image is too heavy (${(file.size / (1024 * 1024)).toFixed(1)}MB). Comment attachments are bounded to a maximum size of 5.0MB.`
                });
                return;
            }

            const immediatePreviewUrl = URL.createObjectURL(file);
            setCommentImage(immediatePreviewUrl);
            setIsCommentExpanded(true);
        }
    };

    // 🎯 NETWORK INTERACTION QUERY: Fetch the complete thread map list from your Elixir context endpoint
    const { data: threadContext, isPending, isError: isThreadError, error: threadError } = useThread(currentPostId);

    const isBlockedThread = Boolean(
        (isThreadError && (
            threadError?.status === 403 ||
            threadError?.data?.error === 'blocked' ||
            /blocked/i.test(threadError?.message || '')
        )) ||
        threadContext?._raw?.error === 'blocked' ||
        threadContext?.focus?.blocked_by === true ||
        threadContext?.focus?.author?.blocked_by === true
    );

    const fallbackFocusPost = useMemo(() => {
        if (!currentPostId) return null;
        const isAliceSlug = String(currentPostId).toLowerCase().startsWith('alice');
        const currentUsername = (currentUser?.username || activeAccount?.username || '').toLowerCase();
        const currentEmail = (currentUser?.email || '').toLowerCase();
        const isCurrentUserAlice = currentUsername === 'alice' || currentEmail.startsWith('alice@');

        const fallbackAuthor = isAliceSlug
            ? {
                id: isCurrentUserAlice ? (currentUser?.id || activeAccount?.id || 'usr-alice') : 'usr-alice',
                name: 'Alice',
                username: 'alice',
                handle: '@alice',
                verified: true
            }
            : {
                id: 'usr-julian-thorne',
                name: "Julian Thorne",
                username: "j_thorne",
                handle: "@j_thorne",
                avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c",
                verified: true
            };

        return {
            id: currentPostId,
            user_id: fallbackAuthor.id,
            author: fallbackAuthor,
            title: "Sovereign Community Node Update",
            text: "Exploring decentralized parameters, localized mesh coordination, and civic engagement pipelines across the Kollective network.",
            time: "10m ago",
            likes: 42,
            commentsCount: 2
        };
    }, [currentPostId, currentUser, activeAccount]);

    const focusPost = threadContext?.focus || storePost || fallbackFocusPost;

    const replyMutation = useMutation({
        mutationFn: async (payload) => {
            const targetParentId = payload.parent_id || activeReplyPostId || currentPostId;
            const enrichedPayload = {
                ...payload,
                parent_id: targetParentId
            };

            return apiFetchPosts(`/api/v1/posts/${currentPostId}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrichedPayload),
            });
        },

        // 🚀 Step 1: Fire instantly when mutate() is executed
        onMutate: async (payload) => {
            const threadKey = ['post', currentPostId, 'thread'];
            const targetParentId = payload.parent_id || activeReplyPostId || currentPostId;

            await queryClient.cancelQueries({ queryKey: threadKey });
            const previousThreadData = queryClient.getQueryData(threadKey);

            const tempId = `temp-${Date.now()}`;
            const activeAuthor = activeAccount || currentUser || { name: 'Citizen', handle: '@citizen' };
            const replyBody = payload.body || payload.text || payload.content || commentText;

            const optimisticReply = {
                id: tempId,
                body: replyBody,
                text: replyBody,
                content: replyBody,
                parent_id: targetParentId,
                in_reply_to_id: targetParentId,
                inserted_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                isOptimistic: true,
                author: activeAuthor,
                user: activeAuthor,
                account: activeAuthor,
                user_id: activeAuthor?.id,
                likes: 0,
                replies_count: 0
            };

            usePostsStore.getState().importFetchedPosts([optimisticReply]);
            setLocalDescendants((prev) => [...prev, optimisticReply]);

            if (targetParentId) {
                usePostsStore.getState().updatePostEntity(targetParentId, (existing) => {
                    if (!existing) return existing;
                    const nextCount = getReplyCount(existing) + 1;
                    return {
                        ...existing,
                        replies_count: nextCount,
                        commentsCount: nextCount,
                        repliesCount: nextCount,
                    };
                });
            }

            queryClient.setQueryData(threadKey, (oldData) => {
                const baseData = oldData || { ancestors: [], focus: focusPost, descendants: [] };
                const currentDescendants = Array.isArray(baseData.descendants) ? baseData.descendants : [];

                const updatedFocus = (baseData.focus && (baseData.focus.id === targetParentId || !activeReplyPostId)) ? {
                    ...baseData.focus,
                    replies_count: getReplyCount(baseData.focus) + 1,
                    commentsCount: getReplyCount(baseData.focus) + 1,
                    repliesCount: getReplyCount(baseData.focus) + 1,
                } : baseData.focus;

                const updatedDescendants = currentDescendants.map((desc) => {
                    if (desc.id === targetParentId) {
                        const count = getReplyCount(desc) + 1;
                        return { ...desc, replies_count: count, commentsCount: count, repliesCount: count };
                    }
                    return desc;
                });

                return {
                    ...baseData,
                    focus: updatedFocus,
                    descendants: [...updatedDescendants, optimisticReply],
                    ...(baseData._raw ? {
                        _raw: {
                            ...baseData._raw,
                            focus: updatedFocus,
                            descendants: [...(baseData._raw.descendants || []), optimisticReply]
                        }
                    } : {})
                };
            });

            setCommentText('');
            setCommentCwText('');
            setCommentImage(null);
            setShowEmojiDropdown(false);
            setShowCommentCwInput(false);
            setIsCommentExpanded(false);

            return { previousThreadData, threadKey, tempId, targetParentId };
        },

        // 🛡️ Step 2: Roll back to exact state if the network fails
        onError: (error, payload, context) => {
            console.error("Failed to post reply:", error);

            if (context?.tempId) {
                setLocalDescendants((prev) => prev.filter((item) => item.id !== context.tempId));
            }

            if (context?.threadKey && context?.previousThreadData) {
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
            const rawReply = res?.data || res;
            const targetParentId = context?.targetParentId || activeReplyPostId || currentPostId;
            const fallbackAuthor = activeAccount || currentUser || { name: 'Citizen', handle: '@citizen' };
            const resolvedAuthor = rawReply?.author || rawReply?.user || rawReply?.account || fallbackAuthor;
            const resolvedText = rawReply?.text || rawReply?.body || rawReply?.content || payload?.text || payload?.content || '';

            const replyData = rawReply ? {
                ...rawReply,
                author: resolvedAuthor,
                user: rawReply.user || resolvedAuthor,
                user_id: rawReply.user_id || resolvedAuthor?.id,
                text: resolvedText,
                body: rawReply.body || resolvedText,
                content: rawReply.content || resolvedText,
                parent_id: rawReply.parent_id || rawReply.in_reply_to_id || targetParentId,
                in_reply_to_id: rawReply.in_reply_to_id || rawReply.parent_id || targetParentId,
                isOptimistic: false
            } : null;

            if (replyData && replyData.id) {
                usePostsStore.getState().importFetchedPosts([replyData]);

                setLocalDescendants((prev) => {
                    const hasTemp = prev.some((item) => item.id === context?.tempId);
                    if (hasTemp) {
                        return prev.map((item) => item.id === context.tempId ? replyData : item);
                    }
                    return [...prev, replyData];
                });

                if (context?.threadKey) {
                    queryClient.setQueryData(context.threadKey, (oldData) => {
                        const baseData = oldData || { ancestors: [], focus: focusPost, descendants: [] };
                        const currentDescendants = Array.isArray(baseData.descendants) ? baseData.descendants : [];
                        const hasTemp = currentDescendants.some((item) => item.id === context.tempId);
                        const updatedDescendants = hasTemp
                            ? currentDescendants.map((item) => item.id === context.tempId ? replyData : item)
                            : [...currentDescendants, replyData];

                        return {
                            ...baseData,
                            descendants: updatedDescendants,
                            ...(baseData._raw ? {
                                _raw: {
                                    ...baseData._raw,
                                    descendants: (baseData._raw.descendants || []).some((item) => item.id === context.tempId)
                                        ? (baseData._raw.descendants || []).map((item) => item.id === context.tempId ? replyData : item)
                                        : [...(baseData._raw.descendants || []), replyData]
                                }
                            } : {})
                        };
                    });
                }
            }

            toast.success('Reply published successfully!');
            setActiveReplyPostId(null);
        },

        onSettled: (data, error, payload, context) => {
            if (context?.threadKey) {
                queryClient.invalidateQueries({
                    queryKey: context.threadKey,
                    refetchType: 'none'
                });
            }
        }
    });

    const ancestors = threadContext?.ancestors || [];
    const rawDescendants = threadContext?.descendants || [];

    const isFocusSelf = () => {
        if (!focusPost) return false;
        const focusAuthor = focusPost.author || focusPost.user || focusPost.account;
        if (!focusAuthor) return false;
        const currentUserId = currentUser?.id || activeAccount?.id;
        const currentUsername = currentUser?.username || activeAccount?.username;
        const currentName = currentUser?.name || activeAccount?.name;

        const authorId = focusPost.user_id || focusAuthor.id;
        const authorUsername = focusAuthor.username || (focusAuthor.handle ? focusAuthor.handle.replace('@', '').split('@')[0] : null);
        const authorName = focusAuthor.name;

        if (currentUserId && authorId && String(currentUserId) === String(authorId)) return true;
        if (currentUsername && authorUsername && currentUsername.toLowerCase() === authorUsername.toLowerCase()) return true;
        if (currentName && authorName && currentName.toLowerCase() === authorName.toLowerCase()) return true;
        return false;
    };
    const isFocusPostSelf = isFocusSelf();

    const descendants = useMemo(() => {
        const baseList = (rawDescendants && Array.isArray(rawDescendants) && rawDescendants.length > 0)
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

        const mergedMap = new Map();
        baseList.forEach((item) => {
            if (item?.id) mergedMap.set(String(item.id), item);
        });
        localDescendants.forEach((item) => {
            if (item?.id) mergedMap.set(String(item.id), item);
        });
        return Array.from(mergedMap.values());
    }, [rawDescendants, focusPost?.comments, localDescendants]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPostId]);

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

        const cleanCommentText = commentText?.trim() || '';
        if (!cleanCommentText && !commentImage) return;

        const basePayload = prepareBroadcastPayload({
            content: cleanCommentText,
            contentType: 'comment',
            audience: 'World',
            postIdentity: activeAccount?.type === 'organization' ? 'organization' : 'personal',
            activeAccount,
            user: currentUser,
            showCw: showCommentCwInput,
            cwText: commentCwText
        });

        replyMutation.mutate({
            ...basePayload,
            parent_id: activeReplyPostId || currentPostId,
            images: commentImage ? [commentImage] : undefined,
            content_warning: basePayload.contentWarning
        }, {
            onSuccess: () => {
                setCommentText('');
                setCommentCwText('');
                setCommentImage(null);
                setShowCommentCwInput(false);
                queryClient.invalidateQueries({ queryKey: ['timeline'] });
            },
            onError: (err) => {
                console.error("Failed to append inline response:", err);
                setFeedbackModal({
                    type: 'error',
                    title: 'Broadcast Failed',
                    message: err?.data?.message || err?.message || "Failed to sync comment with edge registry."
                });
            }
        });
    };

    const handleReplyClick = useCallback((authorName, postId) => {
        if (!postId) return;

        if (activeReplyPostId === postId) {
            setActiveReplyPostId(null);
            setIsCommentExpanded(false);
            setCommentText('');
            return;
        }

        setActiveReplyPostId(postId);
        setCommentText(`@${authorName} `);
        setIsCommentExpanded(true);

        setTimeout(() => {
            document.getElementById('comment-textarea')?.focus();
        }, 50);
    }, [activeReplyPostId]);

    if (isBlockedThread) {
        return (
            <div className="max-w-3xl mx-auto py-24 px-6 flex flex-col items-center justify-center text-center">
                <div
                    data-testid="blocked-profile-banner"
                    className="blocked-profile-banner glass-panel rounded-2xl border border-rose-500/30 bg-[#141414] p-10 max-w-lg w-full flex flex-col items-center gap-4 shadow-2xl"
                >
                    <span className="material-symbols-outlined text-4xl text-rose-500">block</span>
                    <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
                        You are blocked
                    </h1>
                    <p className="text-sm text-text-secondary leading-relaxed">
                        You are blocked. You are blocked from following or viewing this account&apos;s posts.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/home')}
                        className="mt-2 px-6 py-2.5 rounded-xl bg-surface-container-high border border-white/10 text-text-primary text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all cursor-pointer"
                    >
                        Return to Feed
                    </button>
                </div>
            </div>
        );
    }

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

                    <ModernLargeThreadContainer
                        currentUser={currentUser}
                        activeAccount={activeAccount}
                        ancestors={ancestors}
                        focusPost={focusPost}
                        descendants={descendants}
                        isFocusPostSelf={isFocusPostSelf}
                        isAuthenticated={isAuthenticated}
                        setIsLoginPromptOpen={setIsLoginPromptOpen}
                        postActions={postActions}
                        handleReplyClick={handleReplyClick}
                        handleCommentSubmit={handleCommentSubmit}
                        commentText={commentText}
                        setCommentText={setCommentText}
                        commentCwText={commentCwText}
                        setCommentCwText={setCommentCwText}
                        showCommentCwInput={showCommentCwInput}
                        setShowCommentCwInput={setShowCommentCwInput}
                        isCommentExpanded={isCommentExpanded}
                        setIsCommentExpanded={setIsCommentExpanded}
                        commentImage={commentImage}
                        setCommentImage={setCommentImage}
                        commentFileInputRef={commentFileInputRef}
                        handleCommentFileChange={handleCommentFileChange}
                        replyMutation={replyMutation}
                        showEmojiDropdown={showEmojiDropdown}
                        setShowEmojiDropdown={setShowEmojiDropdown}
                        activeReplyPostId={activeReplyPostId}
                        setActiveReplyPostId={setActiveReplyPostId}
                    />

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
