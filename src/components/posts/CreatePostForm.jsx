// src/components/CreatePostForm.jsx
import { useState, useEffect } from 'react';
import { EmojiSelector } from '../EmojiSelector';
import { PollComposer } from '../../features/polls/PollComposer';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { extractAndMergeHashtags } from '../../utils/tagParser';
import { apiFetch } from '../../api/apiClient';
import { Globe, MapPin, Flag, Users, Image as ImageIcon, Smile, BarChart3, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '../ui/Dialog';
import { Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export function CreatePostForm({
    user,
    mutation,
    activeTab,
    queryClient,
    setCreatePostOpen,
    onOpenChange,
    showPollComposer,
    setShowPollComposer
}) {
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const currentOrg = (activeAccount?.type === 'organization') ? activeAccount : user?.memberships?.[0]?.organization;
    const initialIdentity = (activeAccount && activeAccount.type === 'organization') ? 'organization' : 'personal';

    const [audience, setAudience] = useState('World');
    const [postIdentity, setPostIdentity] = useState(initialIdentity);

    useEffect(() => {
        if (activeAccount?.type === 'organization') {
            setPostIdentity('organization');
        } else {
            setPostIdentity('personal');
        }
    }, [activeAccount]);
    const [showIdentityDropdown, setShowIdentityDropdown] = useState(false);
    const [contentType, setContentType] = useState('post');
    const [postTab, setPostTab] = useState('text');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [uploadedAttachments, setUploadedAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [editingAltIndex, setEditingAltIndex] = useState(null);
    const [altDraft, setAltDraft] = useState('');
    const [linkUrl, setLinkUrl] = useState('');

    const [cwText, setCwText] = useState('');
    const [showCwInput, setShowCwInput] = useState(false);
    const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
    const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
    const protocolSigned = true;
    const [feedbackModal, setFeedbackModal] = useState(null);

    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollExpires, setPollExpires] = useState('86400');

    const characterLimit = 500;
    const charsLeft = characterLimit - content.length;
    const hasContent = content.trim() || uploadedAttachments.length > 0 || linkUrl.trim();

    const isSubmitDisabled = contentType === 'voice'
        ? (!title.trim() && !hasContent) || charsLeft < 0 || !protocolSigned
        : !hasContent || charsLeft < 0 || !protocolSigned;

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const audiences = isAuthenticated ? [
        { label: 'World', value: 'World', icon: Globe },
        { label: 'Local', value: 'my_location', icon: MapPin },
        { label: 'State', value: 'State', icon: MapPin },
        { label: 'Country', value: 'Country', icon: Flag },
        { label: 'Followers Only', value: 'Followers Only', icon: Users }
    ] : [
        { label: 'World', value: 'World', icon: Globe },
        { label: 'Country', value: 'Country', icon: Flag }
    ];

    const handleClearPoll = () => {
        setPollOptions(['', '']);
        setPollExpires('86400');
        setShowPollComposer(false);
    };

    const handleFileChange = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files).slice(0, 4 - uploadedAttachments.length);
        console.log("[CreatePostForm] handleFileChange files count:", files.length);
        if (files.length === 0) return;

        setIsUploading(true);
        setPostTab('image');

        // Create local preview items immediately for snappy UX
        const initialPreviews = files.map((file) => ({
            id: null,
            preview: URL.createObjectURL(file),
            url: null,
            alt: '',
            isUploading: true,
            file
        }));

        setUploadedAttachments((prev) => [...prev, ...initialPreviews]);

        for (const file of files) {
            try {
                const contentType = file.type || 'image/png';
                const filename = file.name || 'image.png';
                console.log("[CreatePostForm] Requesting presign for:", filename, contentType);
                const presignRes = await apiFetch(`/media/presign?filename=${encodeURIComponent(filename)}&content_type=${encodeURIComponent(contentType)}`);
                console.log("[CreatePostForm] Presign response:", presignRes);
                const uploadUrl = presignRes?.upload_url || presignRes?.data?.upload_url;
                const finalAssetUrl = presignRes?.final_asset_url || presignRes?.data?.final_asset_url;

                if (uploadUrl) {
                    console.log("[CreatePostForm] Uploading to PUT:", uploadUrl);
                    const putRes = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': contentType,
                        },
                        body: file,
                    });
                    console.log("[CreatePostForm] PUT response status:", putRes.status);
                }

                console.log("[CreatePostForm] Registering media at POST /media");
                const mediaRes = await apiFetch('/media', {
                    method: 'POST',
                    body: JSON.stringify({
                        media: {
                            url: finalAssetUrl,
                            media_type: contentType
                        }
                    })
                });
                console.log("[CreatePostForm] POST /media response:", mediaRes);

                const mediaId = mediaRes?.data?.id || mediaRes?.id;

                setUploadedAttachments((prev) =>
                    prev.map((att) =>
                        att.file === file
                            ? {
                                ...att,
                                id: mediaId,
                                url: finalAssetUrl,
                                isUploading: false
                            }
                            : att
                    )
                );
            } catch (err) {
                console.error("[CreatePostForm] Failed to upload media:", file.name, err);
                setUploadedAttachments((prev) =>
                    prev.filter((att) => att.file !== file)
                );
            }
        }

        console.log("[CreatePostForm] All files processed. Setting isUploading false.");
        setIsUploading(false);
        e.target.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalTitle = contentType === 'voice' ? title.trim() : '';
        const finalContent = content.trim();

        const isPollActive = showPollComposer;
        const isPollIncomplete = isPollActive && pollOptions.some(opt => !opt.trim());
        if (isPollIncomplete) {
            alert("Please fill out all poll options before broadcasting.");
            return;
        }

        if (!finalTitle && !hasContent && !isPollActive) return;

        const isOrgMode = activeAccount?.type === 'organization' || postIdentity === 'organization';
        const activeOrg = activeAccount?.type === 'organization' ? activeAccount : currentOrg;

        const authorDetails = isOrgMode ? {
            name: activeOrg?.name || activeOrg?.display_name || 'Organization Node',
            handle: activeOrg?.handle || (activeOrg?.username ? `@${activeOrg.username}` : '@org'),
            role: activeOrg?.role || activeAccount?.role || 'Organization',
            verified: true,
            avatar: activeOrg?.avatar || activeOrg?.avatar_url || '/default-org.jpg',
            type: 'organization'
        } : undefined;

        const audienceLower = (audience || 'world').toLowerCase();
        const targetScope =
            audienceLower === 'local' || audienceLower === 'my_location' ? 'local' :
                audienceLower === 'state' ? 'state' :
                    audienceLower === 'country' || audienceLower === 'national' ? 'country' : 'world';

        const visibility = audience === 'Followers Only' ? 'private' : 'public';

        // Inside your handleSubmit method:
        const presetCategoryTags = contentType === 'voice' ? ['#SovereignVoice'] : ['#Kollective'];
        const completeTagsPayloadArray = extractAndMergeHashtags(content, presetCategoryTags);

        mutation.mutate({
            title: finalTitle,
            text: finalContent,
            content: finalContent,
            isVoice: contentType === 'voice',
            category: contentType === 'voice' ? 'voice' : 'post',
            target_scope: targetScope,
            visibility: visibility,
            organization_id: isOrgMode ? (activeOrg?.id || currentOrg?.id) : undefined,
            tags: completeTagsPayloadArray,
            community: 'General Feed',
            audience: audience,
            images: uploadedAttachments.map(a => a.url).filter(Boolean),
            imageAlts: uploadedAttachments.map(a => a.alt || ''),
            media_ids: uploadedAttachments.map(a => a.id).filter(Boolean),
            link: postTab === 'link' ? linkUrl.trim() : undefined,
            contentWarning: showCwInput && cwText.trim() ? cwText.trim() : undefined,
            poll: isPollActive ? {
                options: pollOptions.map(opt => opt.trim()),
                expires_in: parseInt(pollExpires, 10)
            } : undefined,
            ...(authorDetails ? {
                author: authorDetails,
                postedBy: { name: user?.name, handle: user?.handle, avatar: user?.avatar }
            } : {})
        }, {
            onSuccess: () => {
                // 1. Clear all post field elements on successful execution 
                setTitle('');
                setContent('');
                setUploadedAttachments([]);
                setLinkUrl('');
                setCwText('');
                setShowCwInput(false);
                handleClearPoll();

                // Flush the query engine pipeline cache to render the entry on screen immediately
                queryClient.invalidateQueries({ queryKey: ['timeline', 'home', activeTab] });
                queryClient.invalidateQueries({ queryKey: ['timeline'] });
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                queryClient.invalidateQueries({ queryKey: ['polls'] });

                // Close the composer modal immediately
                if (typeof setCreatePostOpen === 'function') setCreatePostOpen(false);
                if (typeof onOpenChange === 'function') onOpenChange(false);
            },
            onError: (err) => {
                console.error("Failed to create post:", err);
                const errorDetails = err?.data?.message || err?.message || err?.error || "Failed to broadcast post.";
                // Render error popup modal
                setFeedbackModal({
                    type: 'error',
                    title: 'Broadcast Failed',
                    message: errorDetails
                });
            }
        });
    };

    useEffect(() => {
        if (!showIdentityDropdown && !showAudienceDropdown && !showEmojiDropdown) return;

        const handleOutsideClick = (e) => {
            if (showIdentityDropdown && !e.target.closest('.identity-dropdown-container')) {
                setShowIdentityDropdown(false);
            }
            if (showAudienceDropdown && !e.target.closest('.audience-dropdown-container')) {
                setShowAudienceDropdown(false);
            }
            if (showEmojiDropdown && !e.target.closest('.emoji-dropdown-container') && !e.target.closest('.emoji-trigger-btn')) {
                setShowEmojiDropdown(false);
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [showIdentityDropdown, showAudienceDropdown, showEmojiDropdown]);
    const renderImageGrid = () => {
        if (uploadedAttachments.length === 0) return null;
        return (
            <div className={cn(
                "grid gap-2 aspect-[16/10] w-full max-h-64 rounded-xl overflow-hidden relative select-none",
                uploadedAttachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}>
                {uploadedAttachments.map((att, index) => (
                    <div
                        key={`img-grid-${index}`}
                        data-testid="media-preview"
                        className="w-full h-full relative group overflow-hidden bg-neutral-950 rounded-xl border border-black/5 dark:border-white/5"
                    >
                        <img
                            src={att.preview || att.url}
                            alt={att.alt || `Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => setUploadedAttachments(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white cursor-pointer border-none flex items-center justify-center font-sans font-bold text-xs shadow-md z-10 outline-none"
                            aria-label={`Remove image ${index + 1}`}
                        >
                            ✕
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingAltIndex(index);
                                setAltDraft(att.alt || '');
                            }}
                            className={cn(
                                "absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-black rounded-md flex items-center gap-1 uppercase tracking-wider text-white z-10 cursor-pointer border-none outline-none",
                                att.alt ? 'bg-emerald-600/90' : 'bg-amber-600/90'
                            )}
                            aria-label={`Describe image ${index + 1}`}
                        >
                            ALT
                        </button>
                    </div>
                ))}
            </div>
        );
    };
    return (
        <>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 relative flex flex-col font-sans">
                {/* 🛡️ Context Dropdowns Selector Strip */}
                <div className="flex gap-2 items-center flex-wrap z-30 select-none text-text-primary dark:text-white">
                    <div className="relative identity-dropdown-container">
                        <button
                            type="button"
                            onClick={() => setShowIdentityDropdown(!showIdentityDropdown)}
                            className="flex items-center gap-2 px-3 py-2 bg-black/[0.02] dark:bg-[#222] border border-black/10 dark:border-white/10 rounded-full text-text-primary dark:text-white text-xs font-bold cursor-pointer transition-colors outline-none"
                        >
                            <span>{postIdentity === 'personal' ? 'Post as Self' : `Post as ${currentOrg?.name || 'Organization'}`}</span>
                        </button>
                        {showIdentityDropdown && (
                            <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-xl py-1.5 shadow-2xl z-50 text-left font-semibold text-xs text-text-primary dark:text-white">
                                <button type="button" onClick={() => { setPostIdentity('personal'); setShowIdentityDropdown(false); }} className="w-full px-4 py-2.5 text-left bg-transparent border-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 outline-none font-bold text-text-primary dark:text-white">Personal Account</button>
                                <button type="button" onClick={() => { setPostIdentity('organization'); setShowIdentityDropdown(false); }} className="w-full px-4 py-2.5 text-left bg-transparent border-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 outline-none font-bold text-text-primary dark:text-white">Organization Workspace</button>
                            </div>
                        )}
                    </div>

                    <div className="relative audience-dropdown-container">
                        <button
                            type="button"
                            onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                            className="flex items-center gap-2 px-3 py-2 bg-black/[0.02] dark:bg-[#222] border border-black/10 dark:border-white/10 rounded-full text-text-primary dark:text-white text-xs font-bold cursor-pointer transition-colors outline-none"
                        >
                            <span>Audience: {audience}</span>
                        </button>
                        {showAudienceDropdown && (
                            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 rounded-xl py-1.5 shadow-2xl z-50 text-left font-semibold text-xs text-text-primary dark:text-white">
                                {audiences.map((aud) => {
                                    const AudienceIcon = aud.icon;
                                    return (
                                        <button
                                            key={`aud-opt-${aud.value}`}
                                            type="button"
                                            onClick={() => { setAudience(aud.label); setShowAudienceDropdown(false); }}
                                            className="w-full px-4 py-2.5 text-left bg-transparent border-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 outline-none flex items-center gap-2 font-bold text-text-primary dark:text-white"
                                        >
                                            <AudienceIcon className="w-3.5 h-3.5 opacity-60" />
                                            <span>{aud.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {!showPollComposer && (
                        <button
                            type="button"
                            onClick={() => setContentType(contentType === 'post' ? 'voice' : 'post')}
                            className="flex items-center gap-2 px-3 py-2 bg-black/[0.02] dark:bg-[#222] border border-black/10 dark:border-white/10 rounded-full text-text-primary dark:text-white text-xs font-bold cursor-pointer transition-colors outline-none"
                        >
                            <span className="capitalize">Type: {contentType}</span>
                        </button>
                    )}
                </div>

                {/* 📝 Content Editor Textarea Canvas Block */}
                <div className="space-y-4 pt-1 flex flex-col relative">
                    {contentType === 'voice' && (
                        <input
                            type="text"
                            placeholder="Title (optional)"
                            value={title}
                            onChange={(e) => e.target.value.length <= 150 && setTitle(e.target.value)}
                            className="w-full bg-white dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-text-primary dark:text-white focus:outline-none focus:border-primary-container transition-colors"
                        />
                    )}

                    <div className="relative w-full emoji-dropdown-container">
                        {/* 🚨 Content Warning Input Row Field Dropdown */}
                        {showCwInput && (
                            <div className="animate-in slide-in-from-top-2 duration-150 w-full">
                                <input
                                    type="text"
                                    placeholder="Content Warning description (e.g. Spoilers, sensitive data)..."
                                    value={cwText}
                                    onChange={(e) => setCwText(e.target.value)}
                                    className="w-full bg-white dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-text-primary dark:text-white focus:outline-none focus:border-primary-container transition-colors"
                                />
                            </div>
                        )}
                        <textarea
                            placeholder={showPollComposer ? 'What would you like to ask the kollective?' : "What's breaking across your local grid node?"}
                            rows={showPollComposer ? 3 : 5}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="post-composer-input w-full bg-white dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl p-4 text-base font-medium text-text-primary dark:text-white focus:outline-none focus:border-primary-container resize-none leading-relaxed transition-colors placeholder:text-text-secondary/30"
                        />
                        {showEmojiDropdown && (
                            <EmojiSelector
                                onSelect={(emoji) => setContent(prev => prev + emoji)}
                                onClose={() => setShowEmojiDropdown(false)}
                                className="bottom-16 left-2 z-50"
                            />
                        )}
                    </div>

                    {uploadedAttachments.length > 0 && <div className="pt-1">{renderImageGrid()}</div>}

                    {/* 📊 DYNAMIC INLINE POLL INJECTION PLATFORM */}
                    {showPollComposer && (
                        <div className="animate-in slide-in-from-top-3 duration-200">
                            <PollComposer
                                options={pollOptions}
                                setOptions={setPollOptions}
                                expiresValue={pollExpires}
                                setExpiresValue={setPollExpires}
                                onClose={handleClearPoll}
                            />
                        </div>
                    )}
                </div>

                {/* Toolbar Footer Toolbar Row Panel */}
                <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5 mt-2 select-none font-mono text-[10px] uppercase font-bold tracking-wider">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => { setPostTab('image'); setTimeout(() => document.getElementById('modal-img-upload')?.click(), 50); }}
                            className="p-2.5 bg-transparent text-text-secondary hover:text-text-primary border-none cursor-pointer outline-none transition-colors"
                            title="Attach Media"
                            aria-label="Attach Media"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            id="modal-img-upload"
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
                        <button
                            type="button"
                            onClick={() => setShowPollComposer(!showPollComposer)}
                            className={cn(
                                "p-2.5 rounded-xl flex items-center justify-center border-none transition-all cursor-pointer outline-none",
                                showPollComposer ? 'bg-primary-container/20 text-primary-container' : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 bg-transparent'
                            )}
                            title="Create Poll"
                        >
                            <BarChart3 className="w-4 h-4" />
                        </button>
                        {/* 🛡️ Content Warning (CW) Action Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setShowCwInput(!showCwInput)}
                            className={cn(
                                "p-2.5 rounded-xl flex items-center justify-center border-none transition-all cursor-pointer outline-none font-sans font-black text-[10px] tracking-wider",
                                showCwInput
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 bg-transparent'
                            )}
                            title="Toggle Content Warning"
                        >
                            CW
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={cn("text-xs font-mono font-bold select-none", charsLeft < 0 ? 'text-rose-500' : 'text-text-secondary/30')}>{charsLeft}</span>
                        <button
                            type="submit"
                            disabled={isSubmitDisabled || mutation.isPending || isUploading}
                            className="publish-btn px-5 py-2.5 bg-primary-container text-white font-black text-xs rounded-xl hover:brightness-105 active:scale-95 transition-all border-none uppercase tracking-wider disabled:opacity-40 outline-none select-none crimson-glow cursor-pointer"
                        >
                            {mutation.isPending ?
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Broadcasting...
                                </div>
                                :
                                'Broadcast'
                            }
                        </button>
                    </div>
                </div>
            </form>

            {/* 🖼️ ALT TEXT MODAL */}
            {editingAltIndex !== null && (
                <Dialog open={editingAltIndex !== null} onOpenChange={(open) => !open && setEditingAltIndex(null)}>
                    <DialogContent className="max-w-[420px] bg-white dark:bg-[#141414] text-text-primary dark:text-white border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-left font-sans animate-in fade-in duration-150">
                        <DialogHeader className="border-b border-black/5 dark:border-white/10 pb-4 p-0 bg-transparent flex flex-row items-center justify-between select-none">
                            <DialogTitle className="text-lg font-black text-text-primary dark:text-white flex items-center gap-2 tracking-tight uppercase text-sm">
                                Describe Image (Alt Text)
                            </DialogTitle>
                            <DialogClose onClick={() => setEditingAltIndex(null)} />
                        </DialogHeader>
                        <div className="py-4 space-y-3">
                            <p className="text-xs text-text-secondary">
                                Provide alternative text describing the image for accessibility.
                            </p>
                            <input
                                type="text"
                                placeholder="Describe image (alt text)..."
                                value={altDraft}
                                onChange={(e) => setAltDraft(e.target.value)}
                                className="w-full bg-black/5 dark:bg-[#1e1e1e] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary dark:text-white outline-none focus:border-primary-container"
                                autoFocus
                            />
                        </div>
                        <DialogFooter className="flex justify-end gap-2 pt-3 border-t-0 p-0 font-mono font-bold text-xs tracking-wider select-none">
                            <button
                                type="button"
                                onClick={async () => {
                                    const targetAttachment = uploadedAttachments[editingAltIndex];
                                    const newAlt = altDraft.trim();
                                    setUploadedAttachments((prev) =>
                                        prev.map((a, i) => i === editingAltIndex ? { ...a, alt: newAlt } : a)
                                    );
                                    setEditingAltIndex(null);

                                    if (targetAttachment?.id) {
                                        try {
                                            await apiFetch(`/media/${targetAttachment.id}`, {
                                                method: 'PUT',
                                                body: JSON.stringify({ description: newAlt })
                                            });
                                        } catch (e) {
                                            console.error("Failed to update attachment description:", e);
                                        }
                                    }
                                }}
                                className="px-5 py-2.5 bg-primary-container text-white font-black rounded-xl hover:brightness-105 active:scale-95 transition-all border-none uppercase tracking-wider outline-none cursor-pointer"
                            >
                                Save
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* 🚀 UPGRADED DYNAMIC TOAST FEEDBACK INTERCEPTOR */}
            {feedbackModal && (
                <Dialog open={!!feedbackModal} onOpenChange={() => {
                    const isSuccess = feedbackModal.type === 'success';
                    setFeedbackModal(null);
                    if (isSuccess) {
                        if (typeof setCreatePostOpen === 'function') setCreatePostOpen(false);
                        if (typeof onOpenChange === 'function') onOpenChange(false);
                    }
                }}>
                    <DialogContent className="max-w-[420px] bg-white dark:bg-[#141414] text-text-primary dark:text-white border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-left font-sans animate-in fade-in duration-150">
                        <DialogHeader className="border-b border-black/5 dark:border-white/10 pb-4 p-0 bg-transparent flex flex-row items-center justify-between select-none">
                            <DialogTitle className="text-lg font-black text-text-primary dark:text-white flex items-center gap-2 tracking-tight uppercase text-sm">
                                {feedbackModal.type === 'error'
                                    ? <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                                    : <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                }
                                <span>{feedbackModal.title}</span>
                            </DialogTitle>
                            <DialogClose onClick={() => {
                                const isSuccess = feedbackModal.type === 'success';
                                setFeedbackModal(null);
                                if (isSuccess) {
                                    if (typeof setCreatePostOpen === 'function') setCreatePostOpen(false);
                                    if (typeof onOpenChange === 'function') onOpenChange(false);
                                }
                            }} />
                        </DialogHeader>
                        <div className="py-4 space-y-1">
                            <p className="text-text-secondary font-medium text-sm leading-relaxed">
                                {feedbackModal.message}
                            </p>
                        </div>
                        <DialogFooter className="flex justify-end pt-3 border-t-0 p-0 uppercase font-mono font-bold text-xs tracking-wider select-none">
                            <button
                                type="button"
                                onClick={() => {
                                    const isSuccess = feedbackModal.type === 'success';
                                    setFeedbackModal(null);
                                    if (isSuccess) {
                                        if (typeof setCreatePostOpen === 'function') setCreatePostOpen(false);
                                        if (typeof onOpenChange === 'function') onOpenChange(false);
                                    }
                                }}
                                className={cn(
                                    "w-full py-3 font-black rounded-xl shadow-lg transition-all cursor-pointer border-none outline-none text-white",
                                    feedbackModal.type === 'error' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                )}
                            >
                                Dismiss
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
