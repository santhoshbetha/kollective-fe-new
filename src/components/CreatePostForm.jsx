// src/components/CreatePostForm.jsx
import React, { useState } from 'react';
import { EmojiSelector } from './EmojiSelector';
import { PollComposer } from '../features/polls/PollComposer';
import { useAuthStore } from '../store/auth/useAuthStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from './ui/Dialog';

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
    const [postIdentity, setPostIdentity] = useState(initialIdentity); // 'personal' | 'organization'
    const [showIdentityDropdown, setShowIdentityDropdown] = useState(false);
    const [contentType, setContentType] = useState('post'); // 'post' | 'voice'
    const [postTab, setPostTab] = useState('text'); // 'text', 'image', 'link'
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [images, setImages] = useState([]);
    const [imageAlts, setImageAlts] = useState([]);
    const [linkUrl, setLinkUrl] = useState('');

    const [cwText, setCwText] = useState('');
    const [showCwInput, setShowCwInput] = useState(false);
    const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
    const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
    const [protocolSigned, setProtocolSigned] = useState(true);
    const [feedbackModal, setFeedbackModal] = useState(null);

    // 🎛️ local controlled states for poll configurations
    // const [showPollComposer, setShowPollComposer] = useState(false);
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
        { label: 'World', value: 'World', icon: 'public' },
        { label: 'Local', value: 'my_location', icon: 'my_location' },
        { label: 'State', value: 'State', icon: 'map' },
        { label: 'Country', value: 'Country', icon: 'flag' },
        { label: 'Followers Only', value: 'Followers Only', icon: 'group' }
    ] : [
        { label: 'World', value: 'World', icon: 'public' },
        { label: 'Country', value: 'Country', icon: 'flag' }
    ];

    const handleClearPoll = () => {
        setPollOptions(['', '']);
        setPollExpires('86400');
        setShowPollComposer(false);
    };

    // Enforce validation constraints inside your parent submission pipeline
    const isPollValid = !showPollComposer || pollOptions.every(opt => opt.trim().length > 0);

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

        // 📊 Enhanced Structural Guard: Ensure all opened poll inputs are not blank
        const isPollActive = showPollComposer;
        const isPollIncomplete = isPollActive && pollOptions.some(opt => !opt.trim());
        if (isPollIncomplete) {
            alert("Please fill out all poll options before broadcasting.");
            return;
        }

        // Baseline validation fallback check
        if (!finalTitle && !hasContent && !isPollActive) return;

        const currentOrg = (activeAccount?.type === 'organization') ? activeAccount : user?.memberships?.[0]?.organization;
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

        // 🚀 UNIFIED NETWORK BODY PAYLOAD DISPATCH MATRICES
        mutation.mutate({
            title: finalTitle,
            text: finalContent,
            content: finalContent,
            isVoice: contentType === 'voice',
            category: contentType === 'voice' ? 'voice' : 'post',
            target_scope: targetScope,
            visibility: visibility,
            organization_id: postIdentity === 'organization' ? currentOrg?.id : undefined,
            tags: contentType === 'voice' ? ['#SovereignVoice'] : ['#Kollective'],
            community: 'General Feed',
            audience: audience,
            images: postTab === 'image' && images.length > 0 ? images : undefined,
            imageAlts: postTab === 'image' && images.length > 0 ? imageAlts : undefined,
            link: postTab === 'link' ? linkUrl.trim() : undefined,
            contentWarning: showCwInput && cwText.trim() ? cwText.trim() : undefined,

            // =========================================================================
            // 🏆 NEW: EXTEND MATRIX TO SUPPORT DYNAMIC INLINE POLL COMPOSITIONS
            // =========================================================================
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
                const errorDetails = err?.data?.message || err?.message || err?.error || "Failed to broadcast post. Please check your network connection or try again.";

                // 1. Alert notification popup
                alert(`Failed to broadcast post: ${errorDetails}`);

                // 2. Render error popup modal
                setFeedbackModal({
                    type: 'error',
                    title: 'Broadcast Failed',
                    message: errorDetails
                });
            }
        });
    };

    React.useEffect(() => {
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
            <div className={`grid gap-2 aspect-[16/10] w-full max-h-64 rounded-xl overflow-hidden relative ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
                }`}>
                {images.map((src, index) => (
                    <div key={index} className="w-full h-full relative group overflow-hidden bg-[#15131a] rounded-xl border border-white/5">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== index))} className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer border-none flex items-center justify-center backdrop-blur-sm z-10">✕</button>
                        <div className={`absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-black rounded-md flex items-center gap-1 uppercase tracking-wider z-10 ${imageAlts[index] ? 'bg-emerald-600/90' : 'bg-amber-600/90'}`}>ALT</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 relative flex flex-col">
                <div className="flex gap-2 items-center flex-wrap z-30">
                    <div className="relative identity-dropdown-container">
                        <button type="button" onClick={() => setShowIdentityDropdown(!showIdentityDropdown)} className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary hover:bg-surface-container-high text-xs font-bold cursor-pointer">
                            <span>{postIdentity === 'personal' ? 'Post as Self' : `Post as ${currentOrg?.name || 'Organization'}`}</span>
                        </button>
                        {showIdentityDropdown && (
                            <div className="absolute left-0 mt-2 w-56 bg-[#111111] border border-white/10 rounded-xl py-1.5 shadow-2xl z-50">
                                <button type="button" onClick={() => { setPostIdentity('personal'); setShowIdentityDropdown(false); }} className="w-full px-4 py-2 text-left text-xs text-white bg-transparent border-none cursor-pointer">Personal</button>
                                <button type="button" onClick={() => { setPostIdentity('organization'); setShowIdentityDropdown(false); }} className="w-full px-4 py-2 text-left text-xs text-white bg-transparent border-none cursor-pointer">Organization</button>
                            </div>
                        )}
                    </div>

                    <div className="relative audience-dropdown-container">
                        <button type="button" onClick={() => setShowAudienceDropdown(!showAudienceDropdown)} className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary text-xs font-bold cursor-pointer">
                            <span>{audience}</span>
                        </button>
                        {showAudienceDropdown && (
                            <div className="absolute left-0 mt-2 w-48 bg-[#111111] border border-white/10 rounded-xl py-1 shadow-2xl z-50">
                                {audiences.map((aud) => (
                                    <button key={aud.value} type="button" onClick={() => { setAudience(aud.label); setShowAudienceDropdown(false); }} className="w-full px-4 py-2 text-left text-xs text-white bg-transparent border-none cursor-pointer">{aud.label}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {!showPollComposer && (
                        <button
                            type="button"
                            onClick={() => setContentType(contentType === 'post' ? 'voice' : 'post')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary text-xs 
                                    font-bold cursor-pointer">
                            <span className="capitalize">{contentType}</span>
                        </button>
                    )}
                </div>

                <div className="space-y-4 pt-1 flex flex-col">
                    {contentType === 'voice' && (
                        <input type="text" placeholder="Title (optional)" value={title} onChange={(e) => e.target.value.length <= 150 && setTitle(e.target.value)} className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none" />
                    )}
                    <div className="relative w-full emoji-dropdown-container">
                        <textarea
                            placeholder={showPollComposer ? 'What would you like to ask the kollective?' : 'What\'s breaking across your local grid node?'}
                            rows={showPollComposer ? 2 : 5}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 rounded-xl p-4 text-lg text-text-primary focus:outline-none resize-none leading-relaxed"
                        />
                        {showEmojiDropdown &&
                            <EmojiSelector
                                onSelect={(emoji) => setContent(prev => prev + emoji)}
                                onClose={() => setShowEmojiDropdown(false)}
                                className="bottom-16 left-2"
                            />
                        }
                    </div>
                    {postTab === 'image' && images.length > 0 && <div className="pt-1">{renderImageGrid()}</div>}

                    {/* 🏆 DYNAMIC POLL COMPOSER ROW INJECTION */}
                    {showPollComposer && (
                        <PollComposer
                            options={pollOptions}
                            setOptions={setPollOptions}
                            expiresValue={pollExpires}
                            setExpiresValue={setPollExpires}
                            onClose={handleClearPoll}
                        />
                    )}
                </div>

                {/* Toolbar Options Footer Panel Row */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2 select-none">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => { setPostTab('image'); setTimeout(() => document.getElementById('modal-img-upload')?.click(), 50); }}
                            className="p-2 bg-transparent text-text-secondary border-none cursor-pointer"><span className="material-symbols-outlined text-[20px]">image</span>
                        </button>
                        <input
                            type="file"
                            id="modal-img-upload"
                            accept="image/*"
                            multiple className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowEmojiDropdown(!showEmojiDropdown)}
                            className="p-2 bg-transparent text-text-secondary border-none cursor-pointer emoji-trigger-btn"><span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                        </button>
                        {/* 📊 Add custom icon to trigger Poll Composer Box options inline */}
                        <button
                            type="button"
                            onClick={() => setShowPollComposer(!showPollComposer)}
                            className={`p-2 rounded-xl flex items-center justify-center border-none transition-all cursor-pointer ${showPollComposer ? 'bg-primary-container/20 text-primary-container' : 'text-text-secondary hover:bg-white/5 bg-transparent'
                                }`}
                            title="Create Poll"
                        >
                            <span className="material-symbols-outlined text-[20px]">ballot</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`text-xs font-mono ${charsLeft < 0 ? 'text-rose-500 font-bold' : 'text-text-secondary/40'}`}>{charsLeft}</span>
                        <button
                            type="submit"
                            disabled={isSubmitDisabled || mutation.isPending}
                            className="px-5 py-2 bg-primary-container text-white font-bold text-xs rounded-xl hover:brightness-110 cursor-pointer border-none uppercase disabled:opacity-40"
                        >
                            {mutation.isPending ? 'Broadcasting...' : 'Broadcast'}
                        </button>
                    </div>
                </div>

            </form>

            {feedbackModal && (
                <Dialog open={!!feedbackModal} onOpenChange={() => {
                    const isSuccess = feedbackModal.type === 'success';
                    setFeedbackModal(null);
                    if (isSuccess) {
                        setCreatePostOpen(false);
                        onOpenChange(false);
                    }
                }}>
                    <DialogContent className="max-w-[420px] bg-[#141414] text-white border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <DialogHeader className="border-b border-white/10 pb-4 p-0 bg-transparent flex flex-row items-center justify-between">
                            <DialogTitle className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                                <span className={`material-symbols-outlined text-2xl ${feedbackModal.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {feedbackModal.type === 'error' ? 'error' : 'check_circle'}
                                </span>
                                {feedbackModal.title}
                            </DialogTitle>
                            <DialogClose onClick={() => {
                                const isSuccess = feedbackModal.type === 'success';
                                setFeedbackModal(null);
                                if (isSuccess) {
                                    setCreatePostOpen(false);
                                    onOpenChange(false);
                                }
                            }} />
                        </DialogHeader>
                        <div className="py-4 space-y-3">
                            <p className="text-text-secondary text-sm leading-relaxed font-bold">
                                {feedbackModal.message}
                            </p>
                        </div>
                        <DialogFooter className="flex justify-end pt-2 border-t-0 p-0">
                            <button
                                type="button"
                                onClick={() => {
                                    const isSuccess = feedbackModal.type === 'success';
                                    setFeedbackModal(null);
                                    if (isSuccess) {
                                        setCreatePostOpen(false);
                                        onOpenChange(false);
                                    }
                                }}
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
        </>
    );
}
