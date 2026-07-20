// src/components/CreatePostForm.jsx
import React, { useState } from 'react';
import { EmojiSelector } from './EmojiSelector';
import { PollComposer } from '../features/polls/PollComposer';

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
    const [audience, setAudience] = useState('World');
    const [postIdentity, setPostIdentity] = useState('personal'); // 'personal' | 'organization'
    const [showIdentityDropdown, setShowIdentityDropdown] = useState(false);
    const [contentType, setContentType] = useState('post'); // 'post' | 'voice'
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

    const audiences = [
        { label: 'World', value: 'World', icon: 'public' },
        { label: 'Local', value: 'my_location', icon: 'my_location' },
        { label: 'State', value: 'State', icon: 'map' },
        { label: 'Country', value: 'Country', icon: 'flag' },
        { label: 'Followers Only', value: 'Followers Only', icon: 'group' }
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

        const authorDetails = postIdentity === 'organization' ? {
            name: 'New York Magazine',
            handle: '@nymag@threads.net',
            role: 'Publisher',
            verified: true,
            avatar: 'https://unsplash.com',
            type: 'organization'
        } : undefined;

        // 🚀 UNIFIED NETWORK BODY PAYLOAD DISPATCH MATRICES
        mutation.mutate({
            title: finalTitle,
            text: finalContent,
            isVoice: contentType === 'voice',
            category: contentType === 'voice' ? 'Voices' : 'All Activity',
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
                // 🧼 Clear all post field elements on successful execution 
                setCreatePostOpen(false);
                onOpenChange(false);

                // 🧼 New: Reset poll composer variables completely to protect subsequent drafts
                handleClearPoll();

                // Flush the query engine pipeline cache to render the entry on screen immediately
                queryClient.invalidateQueries({ queryKey: ['timeline', 'home', activeTab] });
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 relative flex flex-col">
            <div className="flex gap-2 items-center flex-wrap z-30">
                <div className="relative identity-dropdown-container">
                    <button type="button" onClick={() => setShowIdentityDropdown(!showIdentityDropdown)} className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary hover:bg-surface-container-high text-xs font-bold cursor-pointer">
                        <span>{postIdentity === 'personal' ? 'Post as Self' : 'Post as NYMag'}</span>
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
                        className="w-full bg-[#111111] border border-white/10 rounded-xl p-4 text-sm text-text-primary focus:outline-none resize-none leading-relaxed"
                    />
                    {showEmojiDropdown && <EmojiSelector onSelect={(emoji) => setContent(prev => prev + emoji)} onClose={() => setShowEmojiDropdown(false)} className="bottom-16 left-2" />}
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
                    <button type="submit" disabled={isSubmitDisabled || mutation.isPending} className="px-5 py-2 bg-primary-container text-white font-bold text-xs rounded-xl hover:brightness-110 cursor-pointer border-none uppercase disabled:opacity-40">{mutation.isPending ? 'Broadcasting...' : 'Broadcast'}</button>
                </div>
            </div>

        </form>
    );
}
