import React, { useState } from 'react';
import { useAuthStore } from '../store/auth/useAuthStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from './ui/Dialog';
import { useStore } from '../store/useStore';
import { useCreatePost } from '../features/timeline/useCreatePost';

export const CreatePostModal = ({ open, onOpenChange }) => {
    const user = useAuthStore((state) => state.user);
    // TanStack handles the network lifecycle states
    const createPostMutation = useCreatePost();
    const [audience, setAudience] = useState('World');
    const [postIdentity, setPostIdentity] = useState('personal'); // 'personal' or 'organization'
    const [showIdentityDropdown, setShowIdentityDropdown] = useState(false);
    const [contentType, setContentType] = useState('post'); // 'post' or 'voice'
    const [postTab, setPostTab] = useState('text'); // 'text', 'image', 'link'
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [imageAlts, setImageAlts] = useState([]);
    const [tempImageUrl, setTempImageUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [cwText, setCwText] = useState('');
    const [showCwInput, setShowCwInput] = useState(false);
    const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
    const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
    const [protocolSigned, setProtocolSigned] = useState(true);

    // Zustand handles the visual modal open/close actions
    const isCreateOpen = useStore((state) => state.compose.isOpen);
    const setCreatePostOpen = useStore((state) => state.setCreatePostOpen);

    const characterLimit = 500;
    const charsLeft = characterLimit - content.length;

    const hasContent = content.trim() || images.length > 0 || linkUrl.trim();
    const isSubmitDisabled = contentType === 'voice'
        ? (!title.trim() && !hasContent) || charsLeft < 0 || !protocolSigned
        : !hasContent || charsLeft < 0 || !protocolSigned;

    const timestamp = Date.now(); // This would be the timestamp you want to format
    //console.log(new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timestamp));

    const audiences = [
        { label: 'World', value: 'World', icon: 'public' },
        { label: 'Local', value: 'my_location', icon: 'my_location' },
        { label: 'State', value: 'State', icon: 'map' },
        { label: 'Country', value: 'Country', icon: 'flag' },
        { label: 'Followers Only', value: 'Followers Only', icon: 'group' }
    ];

    const handleInsertEmoji = (emoji) => {
        setContent((prev) => prev + emoji);
        setShowEmojiDropdown(false);
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
        const hasContent = finalContent || images.length > 0 || linkUrl.trim();
        if (!finalTitle && !hasContent) return;

        const authorDetails = postIdentity === 'organization' ? {
            name: 'New York Magazine',
            handle: '@nymag@threads.net',
            role: 'Publisher',
            verified: true,
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYIcLHxbcrouUkl8jiAso6nVAcQtR8x3Oq9gyuXmoxZbjPuS6iM4Gz7INuNhk8zIk125rQjbBO2U5_KP-sfpRV05uaWtTAKUy0iOdZ9yPetghCRjvFz7luny9PzV_NWzWqRUZGQIN61LrzwL8ufhHdsg-1-cmyKYI21dj9Ad3EcRIo53jlaSq5mVOV1wpwSo-a-9RbjfVX81EkrIVoDemafpo_rYC1swAQHuGCfeO4HzUi6D_X33r_a6LjQZzLIcXhmECGbjCOnHI',
            type: 'organization'
        } : undefined;

        createPostMutation.mutate({
            title: finalTitle,
            text: finalContent,
            isVoice: contentType === 'voice',
            category: contentType === 'voice' ? 'Voices' : 'All Activity',
            tags: contentType === 'voice' ? ['#SovereignVoice'] : ['#Kollective'],
            community: 'General Feed',
            audience: audience,
            image: postTab === 'image' && images.length === 1 ? images[0] : undefined,
            images: postTab === 'image' && images.length > 0 ? images : undefined,
            imageAlts: postTab === 'image' && images.length > 0 ? imageAlts : undefined,
            link: postTab === 'link' ? linkUrl.trim() : undefined,
            contentWarning: cwText.trim() || undefined,
            ...(authorDetails ? {
                author: authorDetails,
                postedBy: {
                    name: user.name,
                    handle: user.handle,
                    avatar: user.avatar
                }
            } : {})
        }, {
            onSuccess: () => {
                // Close the modal via Zustand (syncs the UI state)
                setCreatePostOpen(false);

                // **Critical: Invalidate the cache so the new post appears immediately.**
                // This forces TanStack Query to refetch the timeline.
                queryClient.invalidateQueries({
                    queryKey: ['timeline', 'home', activeTab], // Use 'homeFeedTab' if that's your key
                });
            }
        });

        // Reset fields
        setTitle('');
        setContent('');
        setImages([]);
        setImageAlts([]);
        setTempImageUrl('');
        setLinkUrl('');
        setCwText('');
        setShowCwInput(false);
        setContentType('post');
        setPostTab('text');
        setPostIdentity('personal');
        onOpenChange(false);
    };

    const renderImageGrid = () => {
        if (images.length === 0) return null;

        const ImagePreviewItem = ({ src, index }) => (
            <div className="w-full h-full relative group overflow-hidden bg-[#15131a] rounded-xl border border-white/5 shadow-md">
                <img src={src} alt={imageAlts[index] || `Preview ${index}`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />

                {/* Delete Button (top-left) */}
                <button
                    type="button"
                    onClick={() => {
                        setImages(prev => prev.filter((_, i) => i !== index));
                        setImageAlts(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer border-none transition-all active:scale-90 flex items-center justify-center backdrop-blur-sm z-10"
                    title="Remove Image"
                >
                    <span className="material-symbols-outlined text-[16px] font-bold">close</span>
                </button>

                {/* Edit Button (top-right) */}
                <button
                    type="button"
                    onClick={() => {
                        const desc = prompt("Enter description (alt text) for this image:", imageAlts[index] || "");
                        if (desc !== null) {
                            setImageAlts(prev => prev.map((alt, i) => i === index ? desc : alt));
                        }
                    }}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white text-[14px] font-bold rounded-full flex items-center gap-1 cursor-pointer border-none transition-all active:scale-95 backdrop-blur-sm z-10"
                >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit</span>
                </button>

                {/* ALT Badge (bottom-left) */}
                {imageAlts[index] ? (
                    <div
                        className="absolute bottom-2 left-2 px-2 py-1 bg-green-600/90 text-white text-[14px] font-black rounded-lg flex items-center gap-1 uppercase tracking-wider z-10 select-none cursor-help"
                        title={imageAlts[index]}
                    >
                        <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span>ALT</span>
                    </div>
                ) : (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#a34b07] text-white text-[14px] font-black rounded-lg flex items-center gap-1 uppercase tracking-wider z-10 select-none">
                        <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                        <span>ALT</span>
                    </div>
                )}
            </div>
        );

        if (images.length === 1) {
            return (
                <div className="w-full h-56 rounded-xl overflow-hidden relative">
                    <ImagePreviewItem src={images[0]} index={0} />
                </div>
            );
        }

        if (images.length === 2) {
            return (
                <div className="grid grid-cols-2 gap-2 h-56 rounded-xl overflow-hidden relative">
                    <ImagePreviewItem src={images[0]} index={0} />
                    <ImagePreviewItem src={images[1]} index={1} />
                </div>
            );
        }

        if (images.length === 3) {
            return (
                <div className="grid grid-cols-2 gap-2 h-64 rounded-xl overflow-hidden relative">
                    <div className="h-full relative">
                        <ImagePreviewItem src={images[0]} index={0} />
                    </div>
                    <div className="flex flex-col gap-2 h-full">
                        <div className="flex-1 min-h-0 relative flex">
                            <ImagePreviewItem src={images[1]} index={1} />
                        </div>
                        <div className="flex-1 min-h-0 relative flex">
                            <ImagePreviewItem src={images[2]} index={2} />
                        </div>
                    </div>
                </div>
            );
        }

        if (images.length === 4) {
            return (
                <div className="grid grid-cols-2 grid-rows-2 gap-2 h-64 rounded-xl overflow-hidden relative">
                    <ImagePreviewItem src={images[0]} index={0} />
                    <ImagePreviewItem src={images[1]} index={1} />
                    <ImagePreviewItem src={images[2]} index={2} />
                    <ImagePreviewItem src={images[3]} index={3} />
                </div>
            );
        }

        return null;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[560px]">
                {/* Header */}
                <DialogHeader className="border-b border-white/5 pb-4">
                    <DialogTitle className="text-xl font-bold">Create post</DialogTitle>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors group mr-1">
                            <span className="material-symbols-outlined text-text-secondary group-hover:text-text-primary">drafts</span>
                        </button>
                        <DialogClose />
                    </div>
                </DialogHeader>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 relative">
                    {/* Decorative stats */}
                    <div className="absolute top-2 left-4 flex gap-4 pointer-events-none text-text-secondary/40 text-[14px] font-bold uppercase tracking-wider">
                        <span>Timestamp: {Date.now()}</span>
                    </div>

                    {/* Top Pill Selectors (Audience & Content Type) */}
                    <div className="flex gap-3 items-center pt-2 flex-wrap">
                        {/* Identity Selector dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowIdentityDropdown(!showIdentityDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary hover:bg-surface-container-high transition-all text-sm font-bold"
                            >
                                <span className="material-symbols-outlined text-[16px] text-primary-container">
                                    {postIdentity === 'personal' ? 'person' : 'corporate_fare'}
                                </span>
                                <span>{postIdentity === 'personal' ? 'Post as Self' : 'Post as NYMag'}</span>
                                <span className="material-symbols-outlined text-[14px]">expand_more</span>
                            </button>

                            {showIdentityDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowIdentityDropdown(false)} />
                                    <div className="absolute left-0 mt-2 w-56 bg-surface-container-lowest border border-white/10 rounded-xl py-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPostIdentity('personal');
                                                setShowIdentityDropdown(false);
                                            }}
                                            className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm transition-colors font-bold ${postIdentity === 'personal' ? 'text-primary-container bg-white/5' : 'text-text-primary hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">person</span>
                                            <div className="flex flex-col">
                                                <span>Julian Thorne</span>
                                                <span className="text-[14px] text-text-secondary font-normal">@j_thorne</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPostIdentity('organization');
                                                setShowIdentityDropdown(false);
                                            }}
                                            className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm transition-colors font-bold ${postIdentity === 'organization' ? 'text-primary-container bg-white/5' : 'text-text-primary hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                                            <div className="flex flex-col">
                                                <span>New York Magazine</span>
                                                <span className="text-[14px] text-text-secondary font-normal">@nymag@threads.net</span>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Target Audience Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary hover:bg-surface-container-high transition-all text-sm font-bold"
                            >
                                <span className="material-symbols-outlined text-[16px] text-primary-container">
                                    {audiences.find((a) => a.value === audience || a.label === audience)?.icon || 'public'}
                                </span>
                                <span>{audience}</span>
                                <span className="material-symbols-outlined text-[14px]">expand_more</span>
                            </button>

                            {showAudienceDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowAudienceDropdown(false)} />
                                    <div className="absolute left-0 mt-2 w-48 bg-surface-container-lowest border border-white/10 rounded-xl py-1 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {audiences.map((aud) => (
                                            <button
                                                key={aud.value}
                                                type="button"
                                                onClick={() => {
                                                    setAudience(aud.label);
                                                    setShowAudienceDropdown(false);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-white/5 transition-colors font-bold"
                                            >
                                                <span className="material-symbols-outlined text-[16px] text-text-secondary">
                                                    {aud.icon}
                                                </span>
                                                {aud.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Content Type Selector (Post/Voice) */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setContentType(contentType === 'post' ? 'voice' : 'post')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary hover:bg-surface-container-high transition-all text-sm font-bold"
                            >
                                <span className="material-symbols-outlined text-[16px] text-primary-container">
                                    {contentType === 'post' ? 'description' : 'campaign'}
                                </span>
                                <span className="capitalize">{contentType}</span>
                                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                            </button>
                        </div>

                        {/* Type/Tabs badges */}
                        <div className="flex gap-1 p-0.5 bg-surface-container rounded-lg border border-white/5">
                            {['text', 'image', 'link'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setPostTab(t)}
                                    className={`px-3 py-1 rounded-md text-[14px] font-bold uppercase tracking-wider transition-all ${postTab === t
                                        ? 'bg-primary-container text-white shadow-sm'
                                        : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Fields Area */}
                    <div className="space-y-4 pt-2">
                        {/* Title Input */}
                        {contentType === 'voice' && (
                            <div className="relative animate-in slide-in-from-top-1 duration-200">
                                <input
                                    type="text"
                                    placeholder="Title (optional)"
                                    value={title}
                                    onChange={(e) => e.target.value.length <= 150 && setTitle(e.target.value)}
                                    className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm font-bold"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-text-secondary/50 font-bold">
                                    {title.length}/150
                                </span>
                            </div>
                        )}

                        {/* Content Warning Input Box */}
                        {showCwInput && (
                            <div className="relative animate-in slide-in-from-top-2 duration-200">
                                <input
                                    type="text"
                                    placeholder="Content Warning label (e.g. Spoilers, sensitive topic...)"
                                    value={cwText}
                                    onChange={(e) => setCwText(e.target.value)}
                                    className="w-full bg-surface-crimson-low/10 border border-primary-container/20 rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm font-bold"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCwText('');
                                        setShowCwInput(false);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                                >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </div>
                        )}

                        {/* URL fields based on tab type */}
                        {postTab === 'image' && images.length < 4 && (
                            <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                                <input
                                    type="text"
                                    placeholder="Paste Image URL and click Add (max 4)"
                                    value={tempImageUrl}
                                    onChange={(e) => setTempImageUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (tempImageUrl.trim()) {
                                                setImages(prev => [...prev, tempImageUrl.trim()]);
                                                setImageAlts(prev => [...prev, '']);
                                                setTempImageUrl('');
                                            }
                                        }
                                    }}
                                    className="flex-1 bg-surface-ink border border-white/10 rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm font-bold"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (tempImageUrl.trim()) {
                                            setImages(prev => [...prev, tempImageUrl.trim()]);
                                            setImageAlts(prev => [...prev, '']);
                                            setTempImageUrl('');
                                        }
                                    }}
                                    className="px-4 py-2 bg-primary-container text-white text-sm font-bold rounded-xl hover:brightness-110 cursor-pointer border-none"
                                >
                                    Add
                                </button>
                            </div>
                        )}

                        {postTab === 'link' && (
                            <div className="relative animate-in slide-in-from-top-1 duration-200">
                                <input
                                    type="text"
                                    placeholder="Link URL (e.g. https://example.com)"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>
                        )}

                        {/* Description Textarea */}
                        <div className="relative">
                            <textarea
                                placeholder="What's on your mind?"
                                rows="6"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-4 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary-container focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
                            ></textarea>

                            {/* Inline Emoji Selector Popup */}
                            {showEmojiDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowEmojiDropdown(false)} />
                                    <div className="absolute bottom-16 left-4 bg-surface-container-lowest border border-white/10 rounded-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 w-56">
                                        <div className="grid grid-cols-5 gap-2 justify-items-center">
                                            {['😀', '😂', '😍', '👍', '🔥', '🎉', '🚀', '💡', '🚨', '👥', '💯', '🤔', '👀', '✨', '👏'].map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => handleInsertEmoji(emoji)}
                                                    className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-white/5 active:scale-95 cursor-pointer"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Image Preview Grid */}
                        {postTab === 'image' && images.length > 0 && (
                            <div className="pt-2 animate-in fade-in duration-200">
                                {renderImageGrid()}
                            </div>
                        )}
                    </div>

                    {/* Action Footer Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        {/* Toolbar Buttons */}
                        <div className="flex items-center gap-3">
                            {/* Media Attachment Icon */}
                            <button
                                type="button"
                                disabled={images.length >= 4}
                                onClick={() => {
                                    setPostTab('image');
                                    setTimeout(() => {
                                        const input = document.getElementById('post-image-upload');
                                        if (input) input.click();
                                    }, 50);
                                }}
                                title={images.length >= 4 ? "Maximum 4 images allowed" : "Attach Image"}
                                className={`p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center border-none disabled:opacity-40 disabled:cursor-not-allowed ${images.length >= 4
                                    ? 'text-text-secondary bg-transparent'
                                    : postTab === 'image'
                                        ? 'text-primary bg-primary/10 border border-primary/20 cursor-pointer'
                                        : 'text-text-secondary bg-transparent cursor-pointer'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">image</span>
                            </button>
                            <input
                                type="file"
                                id="post-image-upload"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {/* Link Attachment Icon */}
                            <button
                                type="button"
                                onClick={() => setPostTab('link')}
                                title="Attach Link"
                                className={`p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer ${postTab === 'link' ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text-secondary'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">link</span>
                            </button>

                            {/* Content Warning Option Toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCwInput(!showCwInput);
                                    if (showCwInput) setCwText('');
                                }}
                                title="Content Warning"
                                className={`p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer ${showCwInput ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text-secondary'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">warning</span>
                            </button>

                            {/* Emoji Selector smile face */}
                            <button
                                type="button"
                                onClick={() => setShowEmojiDropdown(!showEmojiDropdown)}
                                title="Add Emoji"
                                className={`p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer ${showEmojiDropdown ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text-secondary'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                            </button>
                        </div>

                        {/* Right-aligned details and submit */}
                        <div className="flex items-center gap-4">
                            {/* Character Limit Indicator */}
                            <span className={`text-sm font-bold ${charsLeft < 0 ? 'text-red-500 font-extrabold animate-pulse' : 'text-text-secondary/50'}`}>
                                {charsLeft}
                            </span>

                            {/* Protocol Sign toggle */}
                            <div className="flex items-center gap-2 mr-2 border-r border-white/5 pr-4">
                                <input
                                    type="checkbox"
                                    id="protocolSigned"
                                    checked={protocolSigned}
                                    onChange={(e) => setProtocolSigned(e.target.checked)}
                                    className="rounded border-white/10 text-primary-container focus:ring-0 w-3.5 h-3.5 bg-surface-ink cursor-pointer"
                                />
                                <label htmlFor="protocolSigned" className="text-[12px] text-text-secondary uppercase tracking-wider select-none cursor-pointer font-bold">
                                    Signed
                                </label>
                            </div>

                            {/* Publish button */}
                            <button
                                type="submit"
                                disabled={isSubmitDisabled || createPostMutation.isPending}
                                className="px-6 py-2 bg-primary-container text-white font-bold text-sm rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary-container/25 disabled:opacity-40 disabled:pointer-events-none crimson-glow uppercase tracking-wider cursor-pointer"
                            >
                                {createPostMutation.isPending ? (
                                    <>
                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                        Broadcasting...
                                    </>
                                ) : (
                                    contentType === 'voice' ? 'Post as Voice' : 'Post as Post'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};