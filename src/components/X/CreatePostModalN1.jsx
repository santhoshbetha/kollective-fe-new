// src/components/CreatePostModal.jsx (Part 1 of 3)
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useStore } from '../store/useStore';
import { useCreatePost } from '../features/timeline/useCreatePost';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from './ui/Dialog';
import { EmojiSelector } from '../components/EmojiSelector';

export const CreatePostModalN1 = ({ open, onOpenChange }) => {
  // 1. ALL HOOK DECLARATIONS GROUPED AT ABSOLUTE TOP LEVEL
  const user = useAuthStore((state) => state.user);
  const createPostMutation = useCreatePost();
  const queryClient = useQueryClient();

  // Zustand State hooks
  const activeTab = useStore((state) => state.homeFeedTab);
  const setCreatePostOpen = useStore((state) => state.setCreatePostOpen);

  // Core Composer Configuration State Fields
  const [audience, setAudience] = useState('World');
  const [postIdentity, setPostIdentity] = useState('personal'); // 'personal' | 'organization'
  const [showIdentityDropdown, setShowIdentityDropdown] = useState(false);
  const [contentType, setContentType] = useState('post'); // 'post' | 'voice'
  const [postTab, setPostTab] = useState('text'); // 'text', 'image', 'link'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Media Array Matrix States
  const [images, setImages] = useState([]);
  const [imageAlts, setImageAlts] = useState([]);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Accessory Dialog Panel Toggles
  const [cwText, setCwText] = useState('');
  const [showCwInput, setShowCwInput] = useState(false);
  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [protocolSigned, setProtocolSigned] = useState(true);

  // 📐 Constants & Validation Layout Equations
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

  // 🛠️ Local Callback Management Utilities
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
  // src/components/CreatePostModal.jsx (Part 2 of 3)
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
      avatar: 'https://unsplash.com',
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
          name: user?.name,
          handle: user?.handle,
          avatar: user?.avatar
        }
      } : {})
    }, {
      onSuccess: () => {
        // Sync our local state counters
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

        // Close modal interfaces concurrently across state providers
        setCreatePostOpen(false);
        onOpenChange(false);

        // Force a query cache flush to refresh lists immediately
        queryClient.invalidateQueries({
          queryKey: ['timeline', 'home', activeTab],
        });
      }
    });
  };

  const renderImageGrid = () => {
    if (images.length === 0) return null;

    const ImagePreviewItem = ({ src, index }) => (
      <div className="w-full h-full relative group overflow-hidden bg-[#15131a] rounded-xl border border-white/5 shadow-md">
        <img src={src} alt={imageAlts[index] || `Preview ${index}`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />

        {/* Delete Overlay Action Button */}
        <button
          type="button"
          onClick={() => {
            setImages(prev => prev.filter((_, i) => i !== index));
            setImageAlts(prev => prev.filter((_, i) => i !== index));
          }}
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white cursor-pointer border-none flex items-center justify-center backdrop-blur-sm z-10"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>

        {/* Edit Accessibility Alt Tag Descriptor Prompt */}
        <button
          type="button"
          onClick={() => {
            const desc = prompt("Enter description (alt text) for this image:", imageAlts[index] || "");
            if (desc !== null) {
              setImageAlts(prev => prev.map((alt, i) => i === index ? desc : alt));
            }
          }}
          className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold rounded-full flex items-center gap-1 cursor-pointer border-none backdrop-blur-sm z-10"
        >
          <span className="material-symbols-outlined text-xs">edit</span>
          <span>Edit</span>
        </button>

        {/* Alt Tag Presence Status Badges */}
        <div className={`absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-black rounded-md flex items-center gap-1 uppercase tracking-wider z-10 shadow-md ${imageAlts[index] ? 'bg-emerald-600/90' : 'bg-amber-600/90'
          }`}>
          <span className="material-symbols-outlined text-[12px]">{imageAlts[index] ? 'check_circle' : 'warning'}</span>
          <span>ALT</span>
        </div>
      </div>
    );

    return (
      <div className={`grid gap-2 aspect-[16/10] w-full max-h-64 rounded-xl overflow-hidden relative ${images.length === 1 ? 'grid-cols-1' :
        images.length === 2 ? 'grid-cols-2' :
          images.length === 3 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'
        }`}>
        {images.map((src, index) => {
          const isThreeImageFirst = images.length === 3 && index === 0;
          return (
            <div key={index} className={`relative ${isThreeImageFirst ? 'row-span-2' : ''}`}>
              <ImagePreviewItem src={src} index={index} />
            </div>
          );
        })}
      </div>
    );
  };
  // src/components/CreatePostModal.jsx (Part 3 of 3)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] bg-[#141414] text-white border border-white/5 rounded-2xl overflow-hidden p-0 shadow-2xl">
        {/* Header toolbar navigation anchor */}
        <DialogHeader className="border-b border-white/5 pb-4 p-6 flex flex-row justify-between items-center bg-surface-container-lowest/50">
          <DialogTitle className="text-xl font-extrabold text-text-primary tracking-tight">Create post</DialogTitle>
          <div className="flex items-center gap-2">
            <button type="button" className="p-2 hover:bg-white/5 rounded-full transition-colors group mr-1 cursor-pointer bg-transparent border-none text-text-secondary">
              <span className="material-symbols-outlined group-hover:text-text-primary">drafts</span>
            </button>
            <DialogClose />
          </div>
        </DialogHeader>

        {/* Dynamic Form Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 relative flex flex-col">
          {/* Identity & Scope Targeting Option Row */}
          <div className="flex gap-2 items-center flex-wrap z-30">
            {/* Identity Selector Dropdown Container */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIdentityDropdown(!showIdentityDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary hover:bg-surface-container-high transition-all text-xs font-bold cursor-pointer"
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
                      onClick={() => { setPostIdentity('personal'); setShowIdentityDropdown(false); }}
                      className={`flex items-center gap-3 w-full px-4 py-2 text-left text-xs transition-colors font-bold border-none cursor-pointer bg-transparent ${postIdentity === 'personal' ? 'text-primary-container bg-white/5' : 'text-text-primary hover:bg-white/5'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      <div className="flex flex-col"><span className="truncate">{user?.name || 'Julian Thorne'}</span><span className="text-xs text-text-secondary font-normal font-mono">{user?.handle || '@j_thorne'}</span></div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPostIdentity('organization'); setShowIdentityDropdown(false); }}
                      className={`flex items-center gap-3 w-full px-4 py-2 text-left text-xs transition-colors font-bold border-none cursor-pointer bg-transparent ${postIdentity === 'organization' ? 'text-primary-container bg-white/5' : 'text-text-primary hover:bg-white/5'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                      <div className="flex flex-col"><span>New York Magazine</span><span className="text-xs text-text-secondary font-normal font-mono">@nymag</span></div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Target Audience Dropdown Selector Component */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary hover:bg-surface-container-high transition-all text-xs font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-primary-container">
                  {audiences.find((a) => a.label === audience)?.icon || 'public'}
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
                        onClick={() => { setAudience(aud.label); setShowAudienceDropdown(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-xs text-text-primary hover:bg-white/5 border-none cursor-pointer bg-transparent transition-colors font-bold"
                      >
                        <span className="material-symbols-outlined text-[16px] text-text-secondary">{aud.icon}</span>
                        {aud.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Content Broadcaster Type Selection Button (Post vs Voice) */}
            <button
              type="button"
              onClick={() => setContentType(contentType === 'post' ? 'voice' : 'post')}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-white/10 rounded-full text-text-primary hover:bg-surface-container-high transition-all text-xs font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary-container">
                {contentType === 'post' ? 'description' : 'campaign'}
              </span>
              <span className="capitalize">{contentType}</span>
              <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
            </button>
          </div>

          {/* Core Structured Field Input Stack Canvas Area */}
          <div className="space-y-4 pt-1 flex flex-col">
            {contentType === 'voice' && (
              <input
                type="text"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => e.target.value.length <= 150 && setTitle(e.target.value)}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-primary-container transition-colors"
              />
            )}

            {showCwInput && (
              <div className="relative animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  placeholder="Content Warning label..."
                  value={cwText}
                  onChange={(e) => setCwText(e.target.value)}
                  className="w-full bg-surface-crimson-low/10 border border-primary-container/20 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary focus:outline-none placeholder:text-text-secondary/30"
                />
                <button type="button" onClick={() => { setCwText(''); setShowCwInput(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined text-[14px]">close</span></button>
              </div>
            )}

            {/* Quick URL Input Attachment Fields rows */}
            {postTab === 'image' && images.length < 4 && (
              <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  placeholder="Paste Image URL and hit Add (max 4)"
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-primary-container text-text-primary"
                />
                <button type="button" onClick={() => { if (tempImageUrl.trim()) { setImages(prev => [...prev, tempImageUrl.trim()]); setImageAlts(prev => [...prev, '']); setTempImageUrl(''); } }} className="px-4 py-2 bg-primary-container text-white text-xs font-bold rounded-xl cursor-pointer hover:brightness-110 border-none">Add</button>
              </div>
            )}

            {postTab === 'link' && (
              <input
                type="text"
                placeholder="Link URL (https://...)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-primary-container transition-colors"
              />
            )}

            {/* Primary Content Rich Textarea Canvas */}
            <div className="relative">
              <textarea
                placeholder="What's breaking across your local grid node?"
                rows="5"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-4 text-sm text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-primary-container resize-none leading-relaxed transition-colors"
              ></textarea>

              {/* Inline Emoji Selector Popup */}
              {/*{showEmojiDropdown && (
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
              */}
              {/* ⚡ DROPIN THE CATEGORIZED POPUP SELECTOR */}
              {showEmojiDropdown && (
                <EmojiSelector
                  onSelect={(emoji) => setContent((prev) => prev + emoji)}
                  onClose={() => setShowEmojiDropdown(false)}
                />
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
    </Dialog >
  );
};