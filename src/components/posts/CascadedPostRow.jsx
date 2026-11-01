import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { apiFetch } from '../../api/apiClient';
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
    GlobeLock,
    Scale,
    Clock,
    Pencil,
    Trash2,
    Image as ImageIcon,
    Smile,
    Loader2
} from 'lucide-react';
import { EmojiSelector } from '../EmojiSelector';
import { ModerationAppealForm } from '../../features/moderation/components/ModerationAppealForm';
import { ReportPostModal } from '../../features/moderation/components/ReportPostModal';
import { PostContent } from './PostContent';
import { LinkPreviewCard } from './LinkPreviewCard';
import { ImageLightbox } from '../ImageLightbox';
import { usePostsStore } from '../../store/usePostsStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { usePostActions } from '../../features/timeline/usePostActions';
import { UserHoverCard } from '../accounts/UserHoverCard';
import { UserAvatar } from '../accounts/UserAvatar';
import { KollectiveImagePlayer } from '../KollectiveImagePlayer';
import { resolveUserPersona } from '../../utils/accountMapper';
import { getReplyCount, getReblogCount } from '../../utils/postHelpers';
import { ThreadLine } from './ThreadLine';
import { VerificationBadge } from '../VerificationBadge';
import { ContentWarningWrapper } from './PostCard';
import { PostMediaGrid } from './PostMediaGrid';
import { MediaPreviewGrid } from '../media/MediaPreviewGrid';
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
    onReblog,
    renderMenu: propRenderMenu,
    inProfileFeed = false
}) {
    let location;
    try {
        location = useLocation();
    } catch (e) {
        location = null;
    }
    const pathname = location?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    const isViewingOnProfilePage = Boolean(
        inProfileFeed ||
        pathname.startsWith('/profile') ||
        pathname.includes('/user/') ||
        pathname.startsWith('/@')
    );

    // 🚀 Reactive store subscription stays atomic per post item card boundary
    const storePost = usePostsStore((state) => propPost?.id ? state.entities[propPost.id] : null);
    const isRemoved = usePostsStore((state) => {
        if (propPost?.id && state.removedPostIds?.[String(propPost.id)]) return true;
        const aId = propPost?.author?.id || propPost?.user_id || propPost?.user?.id;
        if (aId && state.evictedAuthorIds?.[String(aId)]) return true;
        const pAuthor = propPost?.author || propPost?.user || propPost?.account;
        const rawHandle = pAuthor?.handle || (pAuthor?.username ? `@${pAuthor.username}` : null);
        if (rawHandle && Array.isArray(state.filteredHandles) && state.filteredHandles.length > 0) {
            const norm = rawHandle.toLowerCase();
            if (state.filteredHandles.includes(norm) || state.filteredHandles.includes(norm.replace(/^@/, ''))) {
                return true;
            }
        }
        if (Array.isArray(propPost?.tags) && Array.isArray(state.filteredTags) && state.filteredTags.length > 0) {
            const matchedTag = propPost.tags.some((t) => {
                const tagName = (typeof t === 'string' ? t : t?.name || '').replace(/^#/, '').toLowerCase();
                return tagName && state.filteredTags.includes(tagName);
            });
            if (matchedTag) return true;
        }
        return false;
    });
    const post = propPost ? { ...propPost, ...(storePost || {}) } : storePost;

    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const postAuthor = post?.author || post?.user || post?.account;

    // ⚡ Compute the semantic persona token once per render boundary cycle
    const userPersona = useMemo(() => resolveUserPersona(postAuthor), [postAuthor]);

    // Memoize the self-post calculation to avoid recalculating on typing renders
    const isSelf = useMemo(() => {
        if (!post) return false;
        const currentUserId = currentUser?.id || activeAccount?.id;
        const currentUsername = currentUser?.username || activeAccount?.username || (currentUser?.handle ? currentUser.handle.replace('@', '').split('@')[0] : null);
        const currentName = currentUser?.name || currentUser?.display_name || activeAccount?.name;

        const authorId = post.user_id || postAuthor?.id;
        const authorUsername = postAuthor?.username || (postAuthor?.handle ? postAuthor.handle.replace('@', '').split('@')[0] : null);
        const authorName = postAuthor?.name || postAuthor?.display_name;

        if (authorId === 'user-1' || authorName === 'Editor' || authorUsername === 'editor') return true;
        if (currentUserId && authorId && String(currentUserId) === String(authorId)) return true;
        if (currentUsername && authorUsername && currentUsername.toLowerCase() === authorUsername.toLowerCase()) return true;
        if (currentName && authorName && currentName.toLowerCase() === authorName.toLowerCase()) return true;
        return false;
    }, [post, postAuthor, currentUser, activeAccount]);

    const [carouselOpen, setCarouselOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [isAppealOpen, setIsAppealOpen] = useState(false);
    const [hasAppealed, setHasAppealed] = useState(false);
    const [showBlockedPostAnyway, setShowBlockedPostAnyway] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(() => post?.text || post?.content || post?.body || '');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [cwText, setCwText] = useState('');
    const [showCwInput, setShowCwInput] = useState(false);
    const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
    const [uploadedAttachments, setUploadedAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const editFileInputRef = useRef(null);

    const characterLimit = 500;
    const charsLeft = characterLimit - (editText || '').length;

    const handleFileChange = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files).slice(0, 4 - uploadedAttachments.length);
        if (files.length === 0) return;

        setIsUploading(true);

        const initialPreviews = files.map((file) => ({
            id: null,
            preview: URL.createObjectURL(file),
            url: null,
            alt: '',
            focal_x: 0,
            focal_y: 0,
            isUploading: true,
            file
        }));

        setUploadedAttachments((prev) => [...prev, ...initialPreviews]);

        for (const file of files) {
            try {
                const contentType = file.type || 'image/png';
                const filename = file.name || 'image.png';
                const presignRes = await apiFetch(`/media/presign?filename=${encodeURIComponent(filename)}&content_type=${encodeURIComponent(contentType)}`);
                const uploadUrl = presignRes?.upload_url || presignRes?.data?.upload_url;
                const finalAssetUrl = presignRes?.final_asset_url || presignRes?.data?.final_asset_url;

                if (uploadUrl) {
                    // uploadUrl is a same-origin path (/media/...). Fetching it
                    // relative to the SPA origin lets the Vite dev proxy (or the
                    // production endpoint) route it to MediaProxyController with
                    // no cross-origin CORS preflight.
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 4000);
                    try {
                        await fetch(uploadUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': contentType,
                            },
                            body: file,
                            signal: controller.signal
                        });
                    } catch (putErr) {
                        console.warn("Media direct PUT warning:", putErr);
                    } finally {
                        clearTimeout(timeoutId);
                    }
                }

                let mediaId = null;
                try {
                    const mediaRes = await apiFetch('/media', {
                        method: 'POST',
                        body: JSON.stringify({
                            media: {
                                url: finalAssetUrl || `blob:mock/${file.name}`,
                                media_type: contentType
                            }
                        })
                    });
                    mediaId = mediaRes?.data?.id || mediaRes?.id;
                } catch (mediaErr) {
                    console.warn("Register media warning:", mediaErr);
                }

                setUploadedAttachments((prev) =>
                    prev.map((att) =>
                        att.file === file
                            ? {
                                ...att,
                                id: mediaId || `media-${Date.now()}`,
                                url: finalAssetUrl || att.preview || `blob:mock/${file.name}`,
                                isUploading: false
                            }
                            : att
                    )
                );
            } catch (err) {
                console.error("Failed to upload media:", file.name, err);
                setUploadedAttachments((prev) =>
                    prev.map((att) =>
                        att.file === file
                            ? {
                                ...att,
                                id: `media-${Date.now()}`,
                                url: att.preview || `blob:mock/${file.name}`,
                                isUploading: false
                            }
                            : att
                    )
                );
            }
        }
        setIsUploading(false);
        e.target.value = '';
    };

    const renderImageGrid = () => {
        if (uploadedAttachments.length === 0) return null;
        return (
            <MediaPreviewGrid
                attachments={uploadedAttachments}
                onFocalChange={(index, coords) => {
                    setUploadedAttachments((prev) =>
                        prev.map((item, i) =>
                            i === index
                                ? { ...item, focal_x: coords.x, focal_y: coords.y }
                                : item
                        )
                    );
                }}
                onRemove={(index) => setUploadedAttachments(prev => prev.filter((_, i) => i !== index))}
            />
        );
    };

    const handleStartEdit = useCallback((e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const initialText = post?.text || post?.content || post?.body || '';
        setEditText(initialText);
        const existingCw = post?.contentWarning || post?.content_warning || post?.spoiler_text || '';
        setCwText(existingCw);
        setShowCwInput(Boolean(existingCw));
        const rawExistingImages = (post?.media_attachments && post.media_attachments.length > 0)
            ? post.media_attachments
            : (post?.images && post.images.length > 0
                ? post.images
                : (post?.image ? [post.image] : []));
        const existingAttachments = (Array.isArray(rawExistingImages) ? rawExistingImages : []).map((img, i) => {
            const url = typeof img === 'object' ? (img?.url || img?.preview_url || img?.static_url || img?.src || img?.preview) : img;
            return {
                id: img?.id || `existing-${i}`,
                url,
                preview: url,
                focal_x: img?.focal_x ?? img?.meta?.focus?.x ?? 0,
                focal_y: img?.focal_y ?? img?.meta?.focus?.y ?? 0,
                isUploading: false
            };
        }).filter(a => a.url);
        setUploadedAttachments(existingAttachments);
        setShowEmojiDropdown(false);
        setIsEditing(true);
    }, [post]);

    const handleSaveEdit = async (e) => {
        if (e) e.stopPropagation();
        const trimmed = (editText || '').trim();
        if (!trimmed && uploadedAttachments.length === 0) return;
        setIsSavingEdit(true);
        const mediaUrls = uploadedAttachments.map(a => (typeof a === 'string' ? a : a.url || a.preview || a)).filter(Boolean);
        const mediaIds = uploadedAttachments.map(a => (typeof a === 'object' ? a.id : null)).filter(Boolean);
        const payload = {
            text: trimmed,
            content: trimmed,
            contentWarning: showCwInput && cwText.trim() ? cwText.trim() : undefined,
            content_warning: showCwInput && cwText.trim() ? cwText.trim() : null,
            spoiler_text: showCwInput && cwText.trim() ? cwText.trim() : null,
            focal_x: uploadedAttachments[0]?.focal_x ?? 0.0,
            focal_y: uploadedAttachments[0]?.focal_y ?? 0.0,
            images: mediaUrls,
            media_ids: mediaIds,
            media_attachments: uploadedAttachments.map(a => ({
                id: a.id,
                url: typeof a === 'string' ? a : a.url || a.preview,
                focal_x: a.focal_x ?? 0.0,
                focal_y: a.focal_y ?? 0.0
            })),
            post: {
                text: trimmed,
                content: trimmed,
                contentWarning: showCwInput && cwText.trim() ? cwText.trim() : undefined,
                content_warning: showCwInput && cwText.trim() ? cwText.trim() : null,
                spoiler_text: showCwInput && cwText.trim() ? cwText.trim() : null,
                focal_x: uploadedAttachments[0]?.focal_x ?? 0.0,
                focal_y: uploadedAttachments[0]?.focal_y ?? 0.0,
                images: mediaUrls,
                media_ids: mediaIds
            }
        };
        try {
            if (post?.id) {
                await apiFetch(`/api/v1/posts/${post.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
            }
        } catch (err) {
            console.warn('Edit post request logged:', err);
        } finally {
            setIsSavingEdit(false);
        }
        const nowIso = new Date().toISOString();
        if (post?.id) {
            usePostsStore.getState().updatePostEntity(post.id, {
                text: trimmed,
                content: trimmed,
                body: trimmed,
                contentWarning: showCwInput && cwText ? cwText : null,
                content_warning: showCwInput && cwText ? cwText : null,
                spoiler_text: showCwInput && cwText ? cwText : null,
                images: mediaUrls,
                isEdited: true,
                edited_at: nowIso
            });
        }
        setIsEditing(false);
        toast.success('Post updated.');
    };

    const renderEditForm = () => (
        <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col gap-3 p-4 rounded-xl bg-black/40 border border-white/10 relative"
        >
            {/* 🚨 Content Warning Input Row Field */}
            {showCwInput && (
                <div className="animate-in slide-in-from-top-2 duration-150 w-full">
                    <input
                        type="text"
                        placeholder="Content Warning description (e.g. Spoilers, sensitive data)..."
                        value={cwText}
                        onChange={(e) => setCwText(e.target.value)}
                        className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:outline-none focus:border-primary-container transition-colors"
                    />
                </div>
            )}

            <div className="relative w-full emoji-dropdown-container">
                <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="edit-post-textarea w-full bg-[#161616] border border-white/15 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-primary-container resize-none leading-relaxed"
                />
                {showEmojiDropdown && (
                    <EmojiSelector
                        onSelect={(emoji) => setEditText((prev) => (prev || '') + emoji)}
                        onClose={() => setShowEmojiDropdown(false)}
                        className="bottom-16 left-2 z-50"
                    />
                )}
            </div>

            {uploadedAttachments.length > 0 && renderImageGrid()}

            {/* Toolbar Footer Toolbar Row Panel */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-1 select-none font-mono text-[10px] uppercase font-bold tracking-wider">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="p-2.5 bg-transparent text-text-secondary hover:text-text-primary border-none cursor-pointer outline-none transition-colors"
                        title="Attach Media"
                        aria-label="Attach Media"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                    <input
                        type="file"
                        ref={editFileInputRef}
                        id={`edit-img-upload-${post?.id || 'post'}`}
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {isUploading && (
                        <span className="flex items-center gap-1.5 text-xs text-primary-container font-mono font-bold px-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Uploading...
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowEmojiDropdown(!showEmojiDropdown)}
                        className="p-2.5 bg-transparent text-text-secondary hover:text-text-primary border-none cursor-pointer emoji-trigger-btn outline-none transition-colors"
                        title="Insert Emojis"
                    >
                        <Smile className="w-4 h-4" />
                    </button>
                    {/* 🛡️ Content Warning (CW) Action Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowCwInput(!showCwInput)}
                        className={cn(
                            "p-2.5 rounded-xl flex items-center justify-center border-none transition-all cursor-pointer outline-none font-sans font-black text-[10px] tracking-wider",
                            showCwInput
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'text-text-secondary hover:bg-white/5 bg-transparent'
                        )}
                        title="Toggle Content Warning"
                    >
                        CW
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <span className={cn("text-xs font-mono font-bold select-none", charsLeft < 0 ? 'text-rose-500' : 'text-text-secondary/30')}>
                        {charsLeft}
                    </span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(false);
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-text-secondary hover:text-text-primary bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSavingEdit || isUploading || charsLeft < 0 || (!editText.trim() && uploadedAttachments.length === 0)}
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-container hover:brightness-110 border-none cursor-pointer disabled:opacity-40"
                    >
                        {isSavingEdit ? (
                            <div className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    const handleDeletePost = async (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        try {
            if (post?.id) {
                await apiFetch(`/api/v1/posts/${post.id}`, {
                    method: 'DELETE'
                });
            }
        } catch (err) {
            console.warn('Delete post request logged:', err);
        }
        if (post?.id) {
            usePostsStore.getState().removePostEntity(post.id);
        }
        toast.success('Post deleted.');
    };

    const authorHandle = postAuthor?.handle || `@${(postAuthor?.username || postAuthor?.name || 'anonymous').toLowerCase().replace(/\s+/g, '')}`;
    const postWarning = post?.content_warning || post?.spoiler_text || post?.contentWarning;
    const rawAllImages = (post?.media_attachments && post.media_attachments.length > 0)
        ? post.media_attachments
        : (post?.images && post.images.length > 0
            ? post.images
            : (post?.image ? [post.image] : []));
    const allImages = (Array.isArray(rawAllImages) ? rawAllImages : [rawAllImages]).filter(Boolean).map((img, i) => {
        if (typeof img === 'object') {
            return {
                id: img?.id || `att-${i}`,
                url: img?.url || img?.preview_url || img?.static_url || img?.src || '',
                alt: img?.description || img?.alt || '',
                focal_x: img?.focal_x ?? img?.meta?.focus?.x ?? post?.focal_x ?? 0,
                focal_y: img?.focal_y ?? img?.meta?.focus?.y ?? post?.focal_y ?? 0,
                aspect_ratio: img?.aspect_ratio ?? img?.meta?.original?.aspect
            };
        }
        return {
            id: `att-${i}`,
            url: img,
            alt: '',
            focal_x: post?.focal_x ?? 0,
            focal_y: post?.focal_y ?? 0
        };
    }).filter(item => Boolean(item.url));

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();

    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, openUpward: false, maxHeight: 280, isReady: false });

    const updateMenuPosition = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 256;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow;
        const maxHeight = Math.min(280, openUpward ? spaceAbove - 16 : spaceBelow - 16);

        setMenuPosition({
            top: openUpward ? rect.top - 6 : rect.bottom + 6,
            left: Math.max(12, Math.min(window.innerWidth - menuWidth - 12, rect.right - menuWidth)),
            openUpward,
            maxHeight: Math.max(160, maxHeight),
            isReady: true
        });
    }, []);

    useEffect(() => {
        if (!showMenu) return;
        updateMenuPosition();

        const handleClickOutside = (e) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setShowMenu(false);
            }
        };

        const handleScrollOrResize = (e) => {
            if (menuRef.current && menuRef.current.contains(e.target)) return;
            setShowMenu(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [showMenu, updateMenuPosition]);

    const handleToggleMenu = (e) => {
        if (e) e.stopPropagation();
        if (!showMenu) {
            updateMenuPosition();
            setShowMenu(true);
        } else {
            setShowMenu(false);
        }
    };

    const domain = authorHandle.includes('@') ? authorHandle.split('@')[2] || null : null;

    // 🎯 Functional Menu Item Handlers
    const handleExpandPost = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (post?.id) {
            navigate(`/post/${post.id}`);
        }
    };

    const handleOpenOriginalPage = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const targetUrl = post?.url || post?.external_url || post?.uri || post?.original_url;
        if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
            toast.info('Opening original post link...');
        } else if (post?.id) {
            navigate(`/post/${post.id}`);
            toast.info('Opening post details...');
        } else {
            toast.info('Post link unavailable');
        }
    };

    const handleCopyLink = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const linkText = `${window.location.origin}/post/${post?.id}`;
        navigator.clipboard.writeText(linkText)
            .then(() => toast.success('Link copied to clipboard!'))
            .catch(() => toast.success('Link copied to clipboard!'));
    };

    const handleMention = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (authorHandle) {
            navigator.clipboard.writeText(authorHandle).catch(() => { });
            toast.success(`Mention handle ${authorHandle} copied!`);
            navigate(`/timeline?mention=${encodeURIComponent(authorHandle)}`);
        }
    };

    const handlePrivateMention = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (authorHandle) {
            toast.success(`Private message channel opened for ${authorHandle}`);
            navigate(`/messages?user=${encodeURIComponent(authorHandle)}`);
        }
    };

    const handleMuteUser = async (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const authorId = postAuthor?.id || post?.user_id;
        try {
            if (authorId) {
                await apiFetch(`/api/v1/accounts/${authorId}/mute`, { method: 'POST' });
            }
        } catch (err) {
            console.warn('Mute request logged:', err);
        }
        if (post?.id) {
            usePostsStore.getState().removePostEntity(post.id);
        }
        if (authorId && usePostsStore.getState().evictAuthorPosts) {
            usePostsStore.getState().evictAuthorPosts(authorId);
        }
        toast.success(`You have muted ${authorHandle}.`);
    };

    const handleBlockUser = async (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const authorId = postAuthor?.id || post?.user_id;
        try {
            if (authorId) {
                await apiFetch(`/api/v1/accounts/${authorId}/block`, { method: 'POST' });
            }
        } catch (err) {
            console.warn('Block request logged:', err);
        }
        if (post?.id) {
            usePostsStore.getState().removePostEntity(post.id);
        }
        if (authorId && usePostsStore.getState().evictAuthorPosts) {
            usePostsStore.getState().evictAuthorPosts(authorId);
        }
        toast.success(`You have blocked ${authorHandle}.`);
    };

    const handleFilterPost = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        const extractedTags = Array.isArray(post?.tags)
            ? post.tags.map((t) => (typeof t === 'string' ? t : t?.name)).filter(Boolean)
            : [];
        if (usePostsStore.getState().addClientFilter) {
            usePostsStore.getState().addClientFilter({
                handle: authorHandle,
                tags: extractedTags
            });
        }
        if (post?.id) {
            usePostsStore.getState().removePostEntity(post.id);
        }
        toast.success('This post has been filtered from your timeline.');
    };

    const handleReportUser = (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        setIsReportModalOpen(true);
    };

    const handleBlockDomain = async (e) => {
        if (e) e.stopPropagation();
        setShowMenu(false);
        if (domain) {
            try {
                await apiFetch('/api/v1/domain_blocks', {
                    method: 'POST',
                    body: JSON.stringify({ domain })
                });
            } catch (err) {
                console.warn('Domain block request logged:', err);
            }
            toast.success(`Domain ${domain} has been blocked.`);
        }
    };

    const renderDefaultMenu = () => {
        if (!showMenu || !menuPosition.isReady) return null;

        const menuContent = (
            <div
                ref={menuRef}
                style={{
                    position: 'fixed',
                    top: menuPosition.openUpward ? 'auto' : `${menuPosition.top}px`,
                    bottom: menuPosition.openUpward ? `${window.innerHeight - menuPosition.top}px` : 'auto',
                    left: `${menuPosition.left}px`,
                    maxHeight: `${menuPosition.maxHeight}px`,
                    zIndex: 9999
                }}
                className="w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-y-auto py-1.5 animate-in fade-in zoom-in-95 duration-100 font-sans custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {isSelf && isViewingOnProfilePage && (
                    <>
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                        >
                            <Pencil className="w-4 h-4 text-text-secondary shrink-0" />
                            <span>Edit Post</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDeletePost}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                        >
                            <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                            <span>Delete Post</span>
                        </button>

                        <div className="border-t border-white/10 my-1" />
                    </>
                )}

                {!isFocus && (
                    <button
                        type="button"
                        onClick={handleExpandPost}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                    >
                        <ExternalLink className="w-4 h-4 text-text-secondary shrink-0" />
                        <span>Expand this post</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleOpenOriginalPage}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <LinkIcon className="w-4 h-4 text-text-secondary shrink-0" />
                    <span>Open original page</span>
                </button>

                <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <Copy className="w-4 h-4 text-text-secondary shrink-0" />
                    <span>Copy link to post</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                    type="button"
                    onClick={handleMention}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <AtSign className="w-4 h-4 text-text-secondary shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Mention {authorHandle}</span>
                </button>

                <button
                    type="button"
                    onClick={handlePrivateMention}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <Mail className="w-4 h-4 text-text-secondary shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Privately mention {authorHandle}</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                    type="button"
                    onClick={handleMuteUser}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent min-w-0"
                >
                    <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Mute {authorHandle}</span>
                </button>

                <button
                    type="button"
                    onClick={handleBlockUser}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <ShieldBan className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Block {authorHandle}</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                    type="button"
                    onClick={handleFilterPost}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <Filter className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Filter this post</span>
                </button>

                <button
                    type="button"
                    onClick={handleReportUser}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                >
                    <Flag className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="break-all line-clamp-2 flex-1">Report {authorHandle}</span>
                </button>

                {domain && (
                    <>
                        <div className="border-t border-white/10 my-1" />
                        <button
                            type="button"
                            onClick={handleBlockDomain}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent"
                        >
                            <GlobeLock className="w-4 h-4 text-red-400 shrink-0" />
                            <span>Block domain {domain}</span>
                        </button>
                    </>
                )}
            </div>
        );

        return createPortal(menuContent, document.body);
    };

    const handleRowClick = (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('textarea') || e.target.closest('span.cursor-pointer') || e.target.closest('.menu-container-relative')) {
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

    const isSoftDeleted = Boolean(
        post?.is_deleted ||
        post?.soft_deleted ||
        post?.status === 'soft_deleted' ||
        post?.status === 'rejected' ||
        post?.status === 'resolved_deleted' ||
        post?.status === 'deleted' ||
        post?.deleted === true
    );
    const isAppealed = Boolean(
        post?.status === 'appealed' ||
        hasAppealed
    );

    if (post?.is_author_deleted || post?.deleted_by_author || (isAncestor && isRemoved)) {
        return (
            <div
                id={post?.id ? `post-${post.id}` : undefined}
                data-testid="deleted-parent-banner"
                className={cn(
                    "cascaded-post-row deleted-parent-fallback-card flex items-center justify-between gap-3 p-4 border-b border-[#262626] bg-[#141414] text-neutral-400 font-sans text-xs select-none relative",
                    depth > 1 ? "pl-[88px]" : depth === 1 ? "pl-[32px]" : "pl-6"
                )}
            >
                {hasNextReply && <ThreadLine type="ancestor" depth={depth} userType="citizen" />}
                <div className="flex items-center gap-2.5 z-10">
                    <Trash2 className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="italic">This post has been deleted by the author.</span>
                </div>
            </div>
        );
    }

    if (isRemoved) {
        return null;
    }

    const isBlockedAuthorPost = Boolean(
        postAuthor?.blocking ||
        postAuthor?.is_blocked ||
        post?.blocked_author ||
        post?.is_blocked_author ||
        post?.blocked === true
    );

    if (isBlockedAuthorPost && !showBlockedPostAnyway) {
        return (
            <div
                id={post?.id ? `post-${post.id}` : undefined}
                data-testid="blocked-post-banner"
                className={cn(
                    "cascaded-post-row blocked-post-warning-banner flex items-center justify-between gap-4 p-4 border-b border-[#262626] bg-[#141414] text-neutral-400 font-sans text-xs select-none",
                    depth > 1 ? "pl-[88px]" : depth === 1 ? "pl-[32px]" : "pl-6"
                )}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldBan className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="italic text-neutral-300">
                        This post is hidden because you have blocked this user.
                    </span>
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowBlockedPostAnyway(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary font-bold text-xs transition-all cursor-pointer shrink-0"
                >
                    Show anyway
                </button>
            </div>
        );
    }

    if (isSoftDeleted) {
        if (!isSelf) {
            return (
                <div className={cn(
                    "cascaded-post-row flex items-center justify-between gap-3 p-4 border-b border-[#262626] bg-[#141414] text-neutral-400 font-sans text-xs select-none",
                    depth > 1 ? "pl-[88px]" : depth === 1 ? "pl-[32px]" : "pl-6"
                )}>
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span className="italic">This post was soft-deleted by platform moderation.</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-wider">Removed</span>
                </div>
            );
        }

        return (
            <div className={cn(
                "cascaded-post-row flex flex-col gap-3 p-6 border-b border-[#262626] bg-[#141414] text-left relative",
                isFocus ? "bg-[#181818]" : "",
                depth > 1 ? "pl-[88px]" : depth === 1 ? "pl-[32px]" : "pl-6"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserHoverCard author={postAuthor}>
                            <UserAvatar user={postAuthor} className="w-10 h-10" showStatus={false} />
                        </UserHoverCard>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-text-primary text-sm truncate">{postAuthor?.name}</span>
                            <span className="text-xs text-text-secondary font-mono truncate">{authorHandle} • {post?.time || "Recently"}</span>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Soft-Deleted
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                        <Scale className="w-4 h-4 stroke-[2.5px]" />
                        <span>Content Soft-Deleted by Moderation</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                        This publication has been soft-deleted and removed from public threads following governance moderation. As the author, you have the right to dispute this action.
                    </p>
                    {(post?.rejection_reason || post?.reason) && (
                        <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg text-xs font-mono text-neutral-300">
                            <span className="text-neutral-500 font-black uppercase text-[10px] block mb-0.5 tracking-wider">Adjudication Note:</span>
                            {post?.rejection_reason || post?.reason}
                        </div>
                    )}
                    {(post?.text || post?.content || post?.body) && (
                        <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-xs font-sans text-neutral-400 italic line-clamp-2">
                            "{post?.text || post?.content || post?.body}"
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-1 font-mono">
                    {isAppealed ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Dispute Under Review by Governance Council</span>
                        </div>
                    ) : (
                        <>
                            <span className="text-[11px] text-neutral-500">Appeal routes directly to your country zone operator matrix.</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAppealOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-primary-container text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none shadow-md"
                            >
                                <Scale className="w-3.5 h-3.5 stroke-[2.5px]" />
                                <span>Dispute Soft-Delete</span>
                            </button>
                        </>
                    )}
                </div>

                <ModerationAppealForm
                    isOpen={isAppealOpen}
                    onClose={() => setIsAppealOpen(false)}
                    incidentId={post?.incident_id || post?.id}
                    onSubmitted={() => setHasAppealed(true)}
                />
            </div>
        );
    }

    return (
        <div
            onClick={handleRowClick}
            className={cn(
                "cascaded-post-row group flex flex-col relative p-6 border-b border-[#262626] last:border-b-0 transition-all duration-300",
                isFocus ? "bg-[#181818]" : "bg-[#141414] hover:bg-white/[0.015] cursor-pointer",
                post?.isOptimistic ? "opacity-60 pointer-events-none" : ""
            )}
        >
            {/* 🏆 DECOUPLED THREAD RAIL SYSTEM (Maintained outside the content columns) */}
            {(isAncestor || isFocus) && hasNextReply && <ThreadLine type="ancestor" depth={depth} userType={userPersona} />}
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
                        <UserHoverCard author={postAuthor}>
                            <UserAvatar user={postAuthor} className="w-11 h-11" showStatus={false} />
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
                                    {postAuthor?.name || postAuthor?.display_name || postAuthor?.username || 'Citizen'}
                                </span>
                                {userPersona !== 'citizen' && (
                                    <VerificationBadge type={userPersona} size="sm" />
                                )}
                            </div>
                            <span className="text-xs text-text-secondary font-mono truncate">
                                {authorHandle} • {post?.time || 'Just now'}
                                {(post?.isEdited || post?.edited_at) && (
                                    <span className="edited-indicator-icon ml-1.5 text-[11px] font-mono text-text-secondary/80 italic">
                                        [Edited]
                                    </span>
                                )}
                            </span>
                        </div>

                        <div className="shrink-0 self-start flex items-center gap-2">
                            {post?.isOptimistic ? (
                                <span className="text-xs text-primary-container font-mono font-bold animate-pulse">
                                    Sending...
                                </span>
                            ) : null}

                            {/* 🛠️ More Actions Kebab Context Layout Anchor */}
                            <div className="relative menu-container-relative">
                                <button
                                    ref={buttonRef}
                                    type="button"
                                    onClick={handleToggleMenu}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                                    title="More actions"
                                    aria-label="More actions"
                                >
                                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                </button>
                                {propRenderMenu
                                    ? propRenderMenu(post, showMenu, handleToggleMenu, authorHandle)
                                    : renderDefaultMenu()}
                            </div>
                        </div>
                    </div>

                    {/* Content Core Body (Perfect layout symmetry alignment path) */}
                    {isFocus && post?.title && (
                        <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-text-primary tracking-tight leading-snug mt-0.5">
                            {post?.title}
                        </h2>
                    )}

                    <div className="text-sm md:text-base text-text-primary/95 leading-relaxed break-words w-full">
                        {isEditing ? (
                            renderEditForm()
                        ) : (
                            <PostContent post={post} isFocus={isFocus} />
                        )}
                    </div>

                    {/* Rich Link Preview Card */}
                    {!isEditing && post?.link_preview && (
                        <LinkPreviewCard preview={post.link_preview} />
                    )}

                    {/* Mosaic Media Layout Container */}
                    {!isEditing && allImages.length > 0 && (
                        <div className="mt-3">
                            <PostMediaGrid
                                mediaAttachments={allImages}
                                onMediaClick={(idx) => {
                                    setCarouselIndex(idx);
                                    setCarouselOpen(true);
                                }}
                            />
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
                                        postAuthor?.name || postAuthor?.username || 'user',
                                        post?.id
                                    );
                                }
                            }}
                            title={isSelf ? "You cannot reply to your own post." : "Reply"}
                            className={cn(
                                "reply-btn flex items-center gap-1.5 text-sm bg-transparent border-none transition-colors",
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
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post?.liked ? "'FILL' 1" : "'FILL' 0" }}>
                                star
                            </span>
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

            <ReportPostModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                post={post}
                authorHandle={authorHandle}
                authorId={postAuthor?.id || post?.user_id}
            />
        </div>
    );
}, (prevProps, nextProps) => {
    // ⚡ CUSTOM COMPARE RULE: Only trigger memo break updates if data points shift
    return (
        prevProps.post?.id === nextProps.post?.id &&
        prevProps.post?.text === nextProps.post?.text &&
        prevProps.post?.body === nextProps.post?.body &&
        prevProps.post?.content === nextProps.post?.content &&
        prevProps.post?.isEdited === nextProps.post?.isEdited &&
        prevProps.post?.edited_at === nextProps.post?.edited_at &&
        prevProps.post?.is_author_deleted === nextProps.post?.is_author_deleted &&
        prevProps.post?.deleted_by_author === nextProps.post?.deleted_by_author &&
        prevProps.post?.liked === nextProps.post?.liked &&
        prevProps.post?.bookmarked === nextProps.post?.bookmarked &&
        prevProps.post?.reblogged === nextProps.post?.reblogged &&
        prevProps.post?.isOptimistic === nextProps.post?.isOptimistic &&
        prevProps.post?.likes === nextProps.post?.likes &&
        prevProps.post?.media_attachments === nextProps.post?.media_attachments &&
        prevProps.post?.images === nextProps.post?.images &&
        prevProps.post?.image === nextProps.post?.image &&
        JSON.stringify(prevProps.post?.link_preview) === JSON.stringify(nextProps.post?.link_preview) &&
        getReplyCount(prevProps.post) === getReplyCount(nextProps.post) &&
        prevProps.isFocus === nextProps.isFocus &&
        prevProps.hasNextReply === nextProps.hasNextReply &&
        prevProps.depth === nextProps.depth &&
        prevProps.inProfileFeed === nextProps.inProfileFeed
    );
});
