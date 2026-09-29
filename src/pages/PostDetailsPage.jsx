import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { getReplyCount } from '../utils/postHelpers';
import { ModernLargeThreadContainer } from '../components/ModernLargeThreadContainer';
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

export const PostDetailsPage = () => {
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
    const replyMutationX2 = useMutation({
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

            // Reset the form tracker pointer back to focal center layout anchors
            setActiveReplyPostId(focusPost?.id);
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

    /*
        To make sure your Elixir backend knows exactly which specific post node inside the thread tree
        is being replied to (whether it's the root post or a deep sub-reply), we need to modify the payload dynamically.
        
        By injecting the activeReplyPostId as the parent_id parameter directly into the payload, 
        the backend can perfectly attach the comment node to the correct ancestry line.
        
        Note: This is a comment, not a reply. 
        
        Because of your robust optimistic update, we will also inject parent_id into the temporary 
        mock post object so your frontend layout indicators (ThreadLine branching) render cleanly 
        on screen immediately.
    */
    const replyMutation = useMutation({
        mutationFn: async (payload) => {
            // 🚀 THE PAYLOAD FIX: Dynamically append the target parent_id into the POST body array
            const enrichedPayload = {
                ...payload,
                parent_id: activeReplyPostId || currentPostId
            };

            return apiFetchPosts(`/api/v1/posts/${currentPostId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrichedPayload),
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

                /* 
                   🚀 OPTIMISTIC INDENTATION ACCENT: Pass the true parent pointer to your local 
                   mock structure so tree rails can evaluate depths correctly during submission delays.
                */
                parent_id: activeReplyPostId || currentPostId,

                inserted_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                isOptimistic: true,
                account: activeAccount || currentUser || {},
                likes: 0,
                replies_count: 0
            };

            // Pre-sync Zustand entity dictionary index table so components can format it
            usePostsStore.getState().importFetchedPosts([optimisticReply]);

            const targetParentId = activeReplyPostId || currentPostId;
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

            // Inject the optimistic comment directly into the cached array list
            queryClient.setQueryData(threadKey, (oldData) => {
                if (!oldData) return oldData;

                const currentDescendants = Array.isArray(oldData.descendants) ? oldData.descendants : [];

                const updatedFocus = (oldData.focus && (oldData.focus.id === targetParentId || !activeReplyPostId)) ? {
                    ...oldData.focus,
                    replies_count: getReplyCount(oldData.focus) + 1,
                    commentsCount: getReplyCount(oldData.focus) + 1,
                    repliesCount: getReplyCount(oldData.focus) + 1,
                } : oldData.focus;

                const updatedDescendants = currentDescendants.map((desc) => {
                    if (desc.id === targetParentId) {
                        const count = getReplyCount(desc) + 1;
                        return { ...desc, replies_count: count, commentsCount: count, repliesCount: count };
                    }
                    return desc;
                });

                return {
                    ...oldData,
                    focus: updatedFocus,
                    descendants: [...updatedDescendants, optimisticReply],
                    ...(oldData._raw ? {
                        _raw: {
                            ...oldData._raw,
                            focus: updatedFocus,
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

            // 🚀 Reset the form tracker pointer back to null / closed state safely
            setActiveReplyPostId(null);
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

    console.log("PostDetailsPage: threadContext?.focus", threadContext?.focus);
    console.log("PostDetailsPage: storePost", storePost);
    console.log("PostDetailsPage: focusPost", focusPost);

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
    const [activeReplyPostId, setActiveReplyPostId] = useState(null); // Defaults to the main focus post

    //  useEffect(() => {
    //      if (focusPost?.id) {
    //          setActiveReplyPostId(focusPost.id);
    //      }
    //  }, [focusPost?.id]);

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

        // Trigger mutation payload matching backend column assignments
        replyMutation.mutate({
            text: commentText.trim(),
            content_warning: showCommentCwInput ? commentCwText.trim() : undefined,
            images: commentImage ? [commentImage] : undefined,
        });
    };

    const handleReplyClickX = (authorName) => {
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

    const handleReplyClickNew = useCallback((authorName, postId) => {
        // 🚀 Set the target ID where the inline input form should explicitly mount
        setActiveReplyPostId(postId);

        // Pre-populate the textarea with the handle mention parameter securely
        setCommentText(`@${authorName} `);
        setIsCommentExpanded(true);

        // Optional: Smooth focus alignment anchor
        setTimeout(() => {
            document.getElementById('comment-textarea')?.focus();
        }, 50);
    }, []);

    const handleReplyClick = useCallback((authorName, postId) => {
        if (!postId) return;

        console.log('activeReplyPostId', activeReplyPostId);
        console.log('postId', postId);

        // If the clicked box is already open, close it cleanly
        if (activeReplyPostId === postId) {
            setActiveReplyPostId(null);
            setIsCommentExpanded(false);
            setCommentText('');
            return;
        }

        console.log('authorName', authorName);

        // Otherwise, open it for the new post target as normal
        // Otherwise, lock focus down onto the newly selected post target node row
        setActiveReplyPostId(postId);
        setCommentText(`@${authorName} `);
        setIsCommentExpanded(true);

        setTimeout(() => {
            document.getElementById('comment-textarea')?.focus();
        }, 50);
    }, [activeReplyPostId]); // Ensure activeReplyPostId is in the dependency array so the toggle logic reads live values!


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
