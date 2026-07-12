import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserHoverCard } from '../../components/UserHoverCard';
import { ImageCarouselModal } from '../../components/ImageCarouselModal';
import VerificationBadge from '../../components/VerificationBadge';
import { useLikePost } from '../../features/timeline/useLikePost';
import { useBookmarkPost } from '../../features/timeline/useBookmarkPost';
import { usePostActions } from '../../features/timeline/usePostActions';
import { useRsvpToAction } from '../../features/organize/useOrganizeFeature';

const renderMenu = (post, showMenu, setShowMenu, authorHandle, domain, navigate) => {
  if (!showMenu) return null;
  return (
    <div
      className="absolute right-0 top-8 z-50 w-72 bg-[#1a1822] border border-white/10 rounded-lg shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => { setShowMenu(false); navigate(`/post/${post.id}`); }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#e0deeb] hover:bg-[#2b2640] transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
        Expand this post
      </button>
      <button
        onClick={() => { setShowMenu(false); alert("Opening original post page..."); }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#e0deeb] hover:bg-[#2b2640] transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">link</span>
        Open original page
      </button>
      <button
        onClick={() => {
          setShowMenu(false);
          const linkText = `${window.location.origin}/post/${post.id}`;
          navigator.clipboard.writeText(linkText);
          alert("Link copied to clipboard!");
        }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#e0deeb] hover:bg-[#2b2640] transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">content_copy</span>
        Copy link to post
      </button>

      <div className="border-t border-white/5 my-1" />

      <button
        onClick={() => { setShowMenu(false); alert(`Drafting a mention to ${authorHandle}...`); }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#e0deeb] hover:bg-[#2b2640] transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">alternate_email</span>
        Mention {authorHandle}
      </button>
      <button
        onClick={() => { setShowMenu(false); alert(`Drafting a private mention to ${authorHandle}...`); }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#e0deeb] hover:bg-[#2b2640] transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">mail</span>
        Privately mention {authorHandle}
      </button>

      <div className="border-t border-white/5 my-1" />

      <button
        onClick={() => { setShowMenu(false); alert(`You have muted ${authorHandle}.`); }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#ff7f6f] hover:bg-[#3d1c1c]/50 transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">volume_off</span>
        Mute {authorHandle}
      </button>
      <button
        onClick={() => { setShowMenu(false); alert(`You have blocked ${authorHandle}.`); }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#ff7f6f] hover:bg-[#3d1c1c]/50 transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">block</span>
        Block {authorHandle}
      </button>

      <div className="border-t border-white/5 my-1" />

      <button
        onClick={() => { setShowMenu(false); alert("This post has been filtered from your timeline."); }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#ff7f6f] hover:bg-[#3d1c1c]/50 transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">filter_list</span>
        Filter this post
      </button>

      <div className="border-t border-white/5 my-1" />

      <button
        onClick={() => { setShowMenu(false); alert(`Report submitted for ${authorHandle}.`); }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#ff7f6f] hover:bg-[#3d1c1c]/50 transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">flag</span>
        Report {authorHandle}
      </button>

      <div className="border-t border-white/5 my-1" />

      <button
        onClick={() => { setShowMenu(false); alert(`Domain ${domain} has been blocked.`); }}
        className="w-full text-left px-5 py-2.5 text-sm font-semibold text-[#ff7f6f] hover:bg-[#3d1c1c]/50 transition-colors flex items-center gap-3 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[18px]">domain_disabled</span>
        Block domain {domain}
      </button>
    </div>
  );
};

export const PostCard = ({ post }) => {
  const rsvpMutation = useRsvpToAction();
  const { toggleLike, toggleReblog, toggleBookmark, isActionPending } = usePostActions();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const likeMutation = useLikePost();
  const bookmarkMutation = useBookmarkPost();

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (post.liked) {
      // Optimistic UI update is handled inside useLikePost mutation
      likeMutation.mutate(post.id);
    } else {
      // Optimistic UI update is handled inside useLikePost mutation
      likeMutation.mutate(post.id);
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    // Fire the optimistic bookmark state mutation instantly
    bookmarkMutation.mutate(post.id);
  };

  useEffect(() => {
    if (!showMenu) return;
    const handleOutsideClick = () => {
      setShowMenu(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showMenu]);

  const authorHandle = post.author.handle || ('@' + post.author.name.toLowerCase().replace(/\s+/g, ''));
  const domain = post.domain || 'universeodon.com';

  const handleCardClick = (e) => {
    // Avoid navigating if clicking interactive buttons/links
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  // SYSTEM AI POST STYLE
  if (post.isSystem) {
    return (
      <article className="bg-surface-crimson-low/20 rounded-[16px] p-6 border border-primary-container/20 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white crimson-glow">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <div>
            <h4 className="font-bold text-text-primary">{post.title}</h4>
            <p className="text-sm text-text-secondary">{post.author.role} • {post.time}</p>
          </div>
        </div>
        <p className="font-body-md text-text-primary/90">
          Trend Alert: Community discussions around <span className="text-primary-container font-bold">"Digital Autonomy"</span> have increased by 140% in the last 24 hours. The Collective is polarizing around Clause 14.
        </p>
        <div className="bg-surface-ink rounded-xl p-4 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container">trending_up</span>
            <span className="text-sm font-bold">New Policy Draft Available</span>
          </div>
          <button
            onClick={() => alert('Opening policy draft...')}
            className="text-primary-container font-bold text-sm hover:underline"
          >
            {post.actionText}
          </button>
        </div>
      </article>
    );
  }

  if (post.isVoice) {
    return (
      <>
        <article
          onClick={handleCardClick}
          className={`relative glass-card rounded-[16px] border-2 border-primary-container/40 crimson-glow overflow-hidden group cursor-pointer ${showMenu ? 'z-30' : 'z-10'
            }`}
        >
          {/* Voice Badge */}
          <div className="absolute top-0 left-0 bg-primary-container text-white px-4 py-1.5 flex items-center gap-2 rounded-br-xl z-20">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              campaign
            </span>
            <span className="font-bold text-[15px] uppercase tracking-widest">VOICE</span>
          </div>

          {/* Top Right Actions */}
          <div className="absolute top-3 right-4 flex items-center gap-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(post.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md border border-white/10 z-20 focus:outline-none transition-all cursor-pointer ${post.bookmarked ? 'bg-primary-container/20 text-primary-container border-primary-container/40' : 'bg-black/40 text-text-secondary hover:text-white'
                }`}
              title={post.bookmarked ? 'Remove Bookmark' : 'Bookmark Pulse'}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: post.bookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                bookmark
              </span>
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 rounded-full backdrop-blur-md text-text-secondary hover:text-white focus:outline-none transition-all cursor-pointer flex items-center justify-center"
                title="More actions"
              >
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
              {renderMenu(post, showMenu, setShowMenu, authorHandle, domain, navigate)}
            </div>
          </div>

          <div className="p-8 flex flex-col gap-6">
            <div>
              <UserHoverCard author={post.author}>
                <div className="flex items-center gap-4 hover:opacity-85 transition-opacity">
                  <div className="w-12 h-12 rounded-full border-2 border-primary-container p-0.5">
                    <img alt="Author" className="w-full h-full rounded-full object-cover" src={post.author.avatar} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-text-primary leading-tight">{post.author.name}</h3>
                      <span className="material-symbols-outlined text-[#008080] text-[18px]" hidden
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <VerificationBadge type="journalist" size='lg' />
                    </div>

                    <p className="font-label-sm text-text-secondary">{post.author.role} • {post.time}</p>
                  </div>
                </div>
              </UserHoverCard>
              {post.postedBy && (
                <div className="mt-3 ml-16 flex items-center gap-1.5 text-sm text-text-secondary">
                  <span>posted by</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      const username = post.postedBy.handle.replace('@', '');
                      navigate(`/profile/${username}`, { state: { fromCard: true } });
                    }}
                    className="font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <img src={post.postedBy.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                    {post.postedBy.name}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-extrabold text-text-primary tracking-tight leading-tight group-hover:text-primary-container transition-colors duration-300">
                {post.title}
              </h2>
              {post.contentWarning ? (
                <ContentWarningWrapper warning={post.contentWarning}>
                  <p className="font-body-lg text-xl text-text-primary/90 leading-relaxed">
                    {post.text}
                  </p>
                </ContentWarningWrapper>
              ) : (
                <p className="font-body-lg text-xl text-text-primary/90 leading-relaxed">
                  {post.text}
                </p>
              )}
            </div>

            {post.image && (
              <div
                className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/5 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }}
              >
                <img
                  alt="Strike Visual"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  src={post.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full border-2 border-surface-ink bg-gray-500"></div>
                    <div className="w-7 h-7 rounded-full border-2 border-surface-ink bg-gray-600"></div>
                    <div className="w-7 h-7 rounded-full border-2 border-surface-ink bg-gray-700"></div>
                  </div>
                  <span className="text-[12px] font-bold text-white shadow-sm">{post.imageMeta}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLikeClick(post.id)} // togglelike
                  disabled={likeMutation.isPending}
                  className={`flex items-center gap-2 font-bold hover:brightness-125 transition-all ${post.liked ? 'text-primary-container' : 'text-text-secondary hover:text-white'
                    }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: post.liked ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                  <span className="text-sm">{post.liked ? !likeMutation.isPending ? post.likes - 1 : 'Liking...' : !likeMutation.isPending ? 'Liking...' : post.likes}</span>
                </button>
                <button
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="flex items-center gap-2 text-text-secondary font-bold hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                  <span className="text-sm">1.2k</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReblog(post.id);
                  }}
                  className={`flex items-center gap-2 font-bold transition-all ${post.reblogged ? 'text-green-500 hover:brightness-110' : 'text-text-secondary hover:text-white'
                    }`}
                  title="Boost Voice"
                >
                  <span className="material-symbols-outlined text-[20px]">repeat</span>
                  <span className="text-sm">{post.shares || 0}</span>
                </button>
              </div>

              {post.id === 'strike-post-1' && (
                <button
                  onClick={() => {
                    rsvpMutation.mutate({ actionId: 'action-1', status: 'Attending' });
                    alert('You have RSVP\'d to this strike. It has been added to your schedule!');
                  }}
                  className="bg-primary-container text-white px-8 py-3 rounded-xl font-bold text-sm crimson-glow active:scale-95 transition-transform"
                >
                  Join the Action
                </button>
              )}
            </div>
          </div>
        </article>
        <ImageCarouselModal
          isOpen={carouselOpen}
          onClose={() => setCarouselOpen(false)}
          images={post.image ? [post.image] : []}
          imageAlts={post.image ? [post.imageMeta || ""] : []}
          initialIndex={carouselIndex}
          post={post}
        />
      </>
    );
  }

  // STANDARD / CAROUSEL POSTS
  return (
    <article
      onClick={handleCardClick}
      className={`glass-card rounded-[16px] p-6 hover:bg-surface-container-low transition-all border border-white/5 group cursor-pointer relative ${showMenu ? 'z-30' : 'z-10'
        }`}
    >
      <div className="flex gap-4">
        <UserHoverCard author={post.author}>
          {post.author.avatar ? (
            <img
              alt="User"
              className="w-12 h-12 rounded-full object-cover border border-white/10"
              src={post.author.avatar}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-orange-600 flex items-center justify-center text-on-secondary font-bold">
              {post.author.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
        </UserHoverCard>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <UserHoverCard author={post.author}>
                <div className="hover:opacity-85 transition-opacity">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-text-primary">{post.author.name}</span>
                    {post.author.role && (
                      <span className="text-[12px] px-1.5 py-0.5 bg-surface-container-highest rounded text-text-secondary">
                        {post.author.role}
                      </span>
                    )}
                  </div>
                  <span className="font-label-sm text-text-secondary">
                    {post.author.handle || '@circle'} • {post.time}
                  </span>
                </div>
              </UserHoverCard>
              {post.postedBy && (
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-text-secondary">
                  <span>posted by</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      const username = post.postedBy.handle.replace('@', '');
                      navigate(`/profile/${username}`, { state: { fromCard: true } });
                    }}
                    className="font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <img src={post.postedBy.avatar} className="w-4 h-4 rounded-full object-cover" alt="" />
                    {post.postedBy.name}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleBookmarkClick(e)} // toggleBookmark(post.id);
                disabled={bookmarkMutation.isPending}
                className={`p-1.5 hover:bg-white/5 rounded-full transition-colors focus:outline-none cursor-pointer ${post.bookmarked ? 'text-primary-container' : 'text-text-secondary hover:text-white'
                  }`}
                title={post.bookmarked ? 'Remove Bookmark' : 'Bookmark Pulse'}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: bookmarkMutation.isPending ? "'FILL' 1" : "'FILL' 0" }}>
                  bookmark
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 hover:bg-white/5 rounded-full transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                  title="More actions"
                >
                  <span className="material-symbols-outlined text-text-secondary">more_horiz</span>
                </button>
                {renderMenu(post, showMenu, setShowMenu, authorHandle, domain, navigate)}
              </div>
            </div>
          </div>

          {post.contentWarning ? (
            <ContentWarningWrapper warning={post.contentWarning}>
              <p className="mt-3 font-body-md text-text-primary/90 leading-relaxed text-lg">
                {post.text}
              </p>
            </ContentWarningWrapper>
          ) : (
            <p className="mt-3 font-body-md text-text-primary/90 leading-relaxed text-lg">
              {post.text}
            </p>
          )}

          {/* Carousel Images Layout */}
          {post.images && post.images.length > 0 && (
            <div className="mt-4 rounded-xl overflow-hidden border border-white/5 shadow-inner">
              {post.images.length === 1 ? (
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img src={post.images[0]} alt={post.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                </div>
              ) : post.images.length === 2 ? (
                <div className="grid grid-cols-2 gap-2 aspect-[16/9] w-full overflow-hidden">
                  <img src={post.images[0]} alt={post.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                  <img src={post.images[1]} alt={post.imageAlts?.[1] || "Attached image 1"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(1); setCarouselOpen(true); }} />
                </div>
              ) : post.images.length === 3 ? (
                <div className="grid grid-cols-2 gap-2 aspect-[16/9] w-full overflow-hidden">
                  <div className="h-full w-full relative overflow-hidden">
                    <img src={post.images[0]} alt={post.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                  </div>
                  <div className="flex flex-col gap-2 h-full overflow-hidden">
                    <div className="flex-1 min-h-0 overflow-hidden flex">
                      <img src={post.images[1]} alt={post.imageAlts?.[1] || "Attached image 1"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(1); setCarouselOpen(true); }} />
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden flex">
                      <img src={post.images[2]} alt={post.imageAlts?.[2] || "Attached image 2"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(2); setCarouselOpen(true); }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-[16/9] w-full overflow-hidden">
                  <img src={post.images[0]} alt={post.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(0); setCarouselOpen(true); }} />
                  <img src={post.images[1]} alt={post.imageAlts?.[1] || "Attached image 1"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(1); setCarouselOpen(true); }} />
                  <img src={post.images[2]} alt={post.imageAlts?.[2] || "Attached image 2"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(2); setCarouselOpen(true); }} />
                  <img src={post.images[3]} alt={post.imageAlts?.[3] || "Attached image 3"} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCarouselIndex(3); setCarouselOpen(true); }} />
                </div>
              )}
            </div>
          )}

          {/* Tag Chips */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex gap-2">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-surface-container-highest/50 text-primary-container font-bold text-[15px] border border-primary-container/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex items-center gap-8 border-t border-white/5 pt-4">
            <button
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-2 hover:text-primary-container transition-colors ${post.liked ? 'text-primary-container' : 'text-text-secondary'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: post.liked ? "'FILL' 1" : "'FILL' 0" }}>
                thumb_up
              </span>
              <span className="font-bold text-sm">{post.likes}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleReblog(post.id);
              }}
              className={`flex items-center gap-2 hover:text-green-500 transition-colors ${post.reblogged ? 'text-green-500 font-bold' : 'text-text-secondary'
                }`}
              title="Boost Post"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: post.reblogged ? "'wght' 700" : "'wght' 400" }}>
                repeat
              </span>
              <span className="font-bold text-sm">{post.shares || 0}</span>
            </button>

            <button
              onClick={() => navigate(`/post/${post.id}`)}
              className="flex items-center gap-2 text-text-secondary hover:text-primary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">mode_comment</span>
              <span className="font-bold text-sm">{post.commentsCount}</span>
            </button>

            {post.communityJoinable ? (
              <button
                onClick={() => alert('Joined planning circle!')}
                className="ml-auto px-4 py-1.5 rounded-full border border-primary-container/30 text-primary-container font-bold text-[12px] hover:bg-primary-container hover:text-white transition-all"
              >
                Join Circle
              </button>
            ) : (
              <button className="flex items-center gap-2 text-text-secondary hover:text-primary-container transition-colors ml-auto">
                <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ImageCarouselModal
        isOpen={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        images={post.images && post.images.length > 0 ? post.images : post.image ? [post.image] : []}
        imageAlts={post.images && post.images.length > 0 ? post.imageAlts : post.image ? [post.imageMeta || ""] : []}
        initialIndex={carouselIndex}
        post={post}
      />
    </article>
  );
};

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
          onClick={(e) => {
            e.stopPropagation();
            setShow(!show);
          }}
          className="px-3.5 py-1.5 bg-surface-container text-text-primary rounded-lg text-sm font-bold hover:bg-primary-container hover:text-white transition-all cursor-pointer"
        >
          {show ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      {show && <div className="pt-3 border-t border-white/5">{children}</div>}
    </div>
  );
};

