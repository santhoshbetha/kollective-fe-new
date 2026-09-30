// src/components/CreatePostForm.jsx
import { useState, useEffect } from 'react';
import { EmojiSelector } from '../EmojiSelector';
import { PollComposer } from '../../features/polls/PollComposer';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { extractAndMergeHashtags } from '../../utils/tagParser';
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
    const [showIdentityDropdown, setShowIdentityDropdown] = useState(false);
    const [contentType, setContentType] = useState('post');
    const [postTab, setPostTab] = useState('text');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [images, setImages] = useState([]);
    const [imageAlts, setImageAlts] = useState([]);
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
    const hasContent = content.trim() || images.length > 0 || linkUrl.trim();

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

    const handleFileChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const urls = files.map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...urls].slice(0, 4));
            setImageAlts(prev => [...prev, ...urls.map(() => '')].slice(0, 4));
            setPostTab('image');
        }
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

        const authorDetails = postIdentity === 'organization' ? {
            name: currentOrg?.name || 'Organization Node',
            handle: currentOrg?.handle || (currentOrg?.username ? `@${currentOrg.username}` : '@org'),
            role: currentOrg?.role || activeAccount?.role || 'Organization',
            verified: true,
            avatar: currentOrg?.avatar || '/default-org.jpg',
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
            organization_id: postIdentity === 'organization' ? currentOrg?.id : undefined,
            tags: completeTagsPayloadArray,
            community: 'General Feed',
            audience: audience,
            images: postTab === 'image' && images.length > 0 ? images : undefined,
            imageAlts: postTab === 'image' && images.length > 0 ? imageAlts : undefined,
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
                setImages([]);
                setImageAlts([]);
                setLinkUrl('');
                setCwText('');
                setShowCwInput(false);
                handleClearPoll();

                // Flush the query engine pipeline cache to render the entry on screen immediately
                queryClient.invalidateQueries({ queryKey: ['timeline', 'home', activeTab] });
                queryClient.invalidateQueries({ queryKey: ['timeline'] });
                queryClient.invalidateQueries({ queryKey: ['profile'] });

                // 2. Render success popup modal
                setFeedbackModal({
                    type: 'success',
                    title: 'Broadcast Successful',
                    message: 'Your post has been published to the feed successfully!'
                });
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
        if (images.length === 0) return null;
        return (
            <div className={cn(
                "grid gap-2 aspect-[16/10] w-full max-h-64 rounded-xl overflow-hidden relative select-none",
                images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}>
                {images.map((src, index) => (
                    <div key={`img-grid-${index}`} className="w-full h-full relative group overflow-hidden bg-neutral-950 rounded-xl border border-black/5 dark:border-white/5">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white cursor-pointer border-none flex items-center justify-center font-sans font-bold text-xs shadow-md z-10 outline-none"
                        >
                            ✕
                        </button>
                        <div className={cn(
                            "absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-black rounded-md flex items-center gap-1 uppercase tracking-wider text-white z-10",
                            imageAlts[index] ? 'bg-emerald-600/90' : 'bg-amber-600/90'
                        )}>
                            ALT
                        </div>
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
                            className="w-full bg-white dark:bg-[#111111] border border-black/10 dark:border-white/5 rounded-xl p-4 text-base font-medium text-text-primary dark:text-white focus:outline-none focus:border-primary-container resize-none leading-relaxed transition-colors placeholder:text-text-secondary/30"
                        />
                        {showEmojiDropdown && (
                            <EmojiSelector
                                onSelect={(emoji) => setContent(prev => prev + emoji)}
                                onClose={() => setShowEmojiDropdown(false)}
                                className="bottom-16 left-2 z-50"
                            />
                        )}
                    </div>

                    {postTab === 'image' && images.length > 0 && <div className="pt-1">{renderImageGrid()}</div>}

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
                            disabled={isSubmitDisabled || mutation.isPending}
                            className="px-5 py-2.5 bg-primary-container text-white font-black text-xs rounded-xl hover:brightness-105 active:scale-95 transition-all border-none uppercase tracking-wider disabled:opacity-40 outline-none select-none crimson-glow"
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
