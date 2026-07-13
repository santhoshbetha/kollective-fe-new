import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingWidget } from '../components/TrendingWidget';
import { UserHoverCard } from '../components/UserHoverCard';
import { ImageCarouselModal } from '../components/ImageCarouselModal';
import { usePostsQuery } from '../features/timeline/usePostsQuery';
import { usePostActions } from '../features/timeline/usePostActions';

export const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleLike, toggleReblog } = usePostActions();
  const { posts, postsLoading } = usePostsQuery();

  const [commentText, setCommentText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentTab, setCommentTab] = useState('text'); // 'text', 'image', 'link'
  const [commentImageUrl, setCommentImageUrl] = useState('');
  const [commentLinkUrl, setCommentLinkUrl] = useState('');
  const [commentCwText, setCommentCwText] = useState('');
  const [showCommentCwInput, setShowCommentCwInput] = useState(false);
  const [showCommentEmojiDropdown, setShowCommentEmojiDropdown] = useState(false);

  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Find post in app state
  const post = posts?.find(p => p.id === id);

  // Scroll to top on page enter / ID change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Show a trending toast simulation on page open
  useEffect(() => {
    if (post && post?.id === 'renaissance-post') {
      const timer = setTimeout(() => {
        setShowToast(true);
        const hideTimer = setTimeout(() => {
          setShowToast(false);
        }, 5000);
        return () => clearTimeout(hideTimer);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [post]);

  if (postsLoading) {
    return (
      <div className="pt-24 px-4 text-center flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-t-primary-container border-white/10 animate-spin"></div>
        <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
          Loading Pulse Details...
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-24 px-4 text-center">
        <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
          error
        </span>
        <h2 className="text-xl font-bold text-white mb-2">Pulse Not Found</h2>
        <p className="text-text-secondary text-sm mb-6">
          The requested voice or post could not be loaded.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-2.5 bg-primary-container text-white font-bold rounded-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const cleanText = commentText.trim();
    if (!cleanText && !commentImageUrl.trim() && !commentLinkUrl.trim()) return;

    //  addComment(post?.id, cleanText, {
    //   image: commentTab === 'image' ? commentImageUrl.trim() : undefined,
    ////    link: commentTab === 'link' ? commentLinkUrl.trim() : undefined,
    // contentWarning: commentCwText.trim() || undefined
    // });

    setCommentText('');
    setCommentImageUrl('');
    setCommentLinkUrl('');
    setCommentCwText('');
    setShowCommentCwInput(false);
    setShowCommentEmojiDropdown(false);
    setCommentTab('text');
    setShowCommentForm(false);
    alert('Perspective added to discussion!');
  };

  const handleReplyClick = (authorName) => {
    setShowCommentForm(true);
    setTimeout(() => {
      const ta = document.getElementById('comment-textarea') || document.querySelector('textarea');
      if (ta) {
        ta.focus();
        const rawHandle = '@' + authorName.toLowerCase().replace(/\s+/g, '');
        setCommentText(prev => {
          if (prev.includes(rawHandle)) return prev;
          return `${rawHandle} ${prev}`;
        });
        ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };


  return (
    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 pb-20">
      {/* Left Column: Post content and discussion comments */}
      <div className="flex-1 flex flex-col gap-6 max-w-3xl">
        {/* Top back banner */}
        <div className="sticky top-[80px] z-30 bg-background/90 backdrop-blur-md py-3 border-b dark:border-white/5 border-black/5 flex justify-between items-center">
          <button
            className="flex items-center gap-2 text-text-secondary hover:text-primary-container transition-colors font-bold text-sm cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back</span>
          </button>
          <h4 className="text-sm uppercase tracking-widest text-text-secondary font-mono">Pulse Detail</h4>
        </div>

        {/* Featured Post Card */}
        <article className="bg-surface-container-low rounded-xl p-6 md:p-8 relative overflow-hidden border border-primary-container/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-container/10 to-transparent"></div>

          {/* Post Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <UserHoverCard author={post?.author}>
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-gold-muted to-primary-container hover:opacity-85 transition-opacity">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-surface-ink">
                    {post?.author.avatar ? (
                      <img alt="Author avatar" className="w-full h-full object-cover" src={post?.author.avatar} />
                    ) : (
                      <div className="w-full h-full bg-primary-container flex items-center justify-center text-white font-bold text-lg">
                        {post?.author.name[0]}
                      </div>
                    )}
                  </div>
                </div>
              </UserHoverCard>
              <div>
                <UserHoverCard author={post?.author}>
                  <div className="hover:opacity-85 transition-opacity">
                    <div className="flex items-center gap-1">
                      <h3 className="font-label-md text-sm text-text-primary font-bold">{post?.author.name}</h3>
                      {post?.author.verified && (
                        <span className="material-symbols-outlined text-[16px] text-text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      )}
                      {post?.isVoice && (
                        <span className="bg-secondary/10 text-text-secondary text-[14px] px-2 py-0.5 rounded-full font-bold tracking-wider ml-1">
                          VOICE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">{post?.author.role} • {post?.time}</p>
                  </div>
                </UserHoverCard>
                {post?.postedBy && (
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                    <span>posted by</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        const username = post?.postedBy.handle.replace('@', '');
                        navigate(`/profile/${username}`, { state: { fromCard: true } });
                      }}
                      className="font-bold text-primary-container hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <img src={post?.postedBy.avatar} className="w-4 h-4 rounded-full object-cover" alt="" />
                      {post?.postedBy.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button className="text-text-secondary hover:text-white transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          {/* Post Content */}
          <div className="mb-8">
            {post?.title && (
              <h2 className="font-headline-lg text-2xl font-bold mb-4 text-text-primary tracking-tight leading-snug">
                {post?.title}
              </h2>
            )}
            {post?.contentWarning ? (
              <ContentWarningWrapper warning={post?.contentWarning}>
                <p className="font-body-lg text-text-secondary leading-relaxed mb-6 text-md">
                  {post?.text}
                </p>
              </ContentWarningWrapper>
            ) : (
              <p className="font-body-lg text-text-secondary leading-relaxed mb-6 text-md">
                {post?.text}
              </p>
            )}

            {post?.images && post?.images.length > 0 ? (
              <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl mb-6">
                {post?.images.length === 1 ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <img src={post?.images[0]} alt={post?.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(0); setCarouselOpen(true); }} />
                  </div>
                ) : post?.images.length === 2 ? (
                  <div className="grid grid-cols-2 gap-2 aspect-video w-full overflow-hidden">
                    <img src={post?.images[0]} alt={post?.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(0); setCarouselOpen(true); }} />
                    <img src={post?.images[1]} alt={post?.imageAlts?.[1] || "Attached image 1"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(1); setCarouselOpen(true); }} />
                  </div>
                ) : post?.images.length === 3 ? (
                  <div className="grid grid-cols-2 gap-2 aspect-video w-full overflow-hidden">
                    <div className="h-full w-full relative overflow-hidden">
                      <img src={post?.images[0]} alt={post?.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(0); setCarouselOpen(true); }} />
                    </div>
                    <div className="flex flex-col gap-2 h-full overflow-hidden">
                      <div className="flex-1 min-h-0 overflow-hidden flex">
                        <img src={post?.images[1]} alt={post?.imageAlts?.[1] || "Attached image 1"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(1); setCarouselOpen(true); }} />
                      </div>
                      <div className="flex-1 min-h-0 overflow-hidden flex">
                        <img src={post?.images[2]} alt={post?.imageAlts?.[2] || "Attached image 2"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(2); setCarouselOpen(true); }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 grid-rows-2 gap-2 aspect-video w-full overflow-hidden">
                    <img src={post?.images[0]} alt={post?.imageAlts?.[0] || "Attached image 0"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(0); setCarouselOpen(true); }} />
                    <img src={post?.images[1]} alt={post?.imageAlts?.[1] || "Attached image 1"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(1); setCarouselOpen(true); }} />
                    <img src={post?.images[2]} alt={post?.imageAlts?.[2] || "Attached image 2"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(2); setCarouselOpen(true); }} />
                    <img src={post?.images[3]} alt={post?.imageAlts?.[3] || "Attached image 3"} className="w-full h-full object-cover cursor-pointer" onClick={() => { setCarouselIndex(3); setCarouselOpen(true); }} />
                  </div>
                )}
              </div>
            ) : post?.image ? (
              <div
                className="rounded-2xl overflow-hidden aspect-video relative group border border-white/5 mb-6 cursor-pointer"
                onClick={() => { setCarouselIndex(0); setCarouselOpen(true); }}
              >
                <img alt="Article graphic" className="w-full h-full object-cover" src={post?.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {post?.imageMeta && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span className="text-sm font-medium text-white/70 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                      {post?.imageMeta}
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {post?.tags && post?.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post?.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-surface-container-high rounded-full text-sm font-medium text-primary hover:bg-primary-container/20 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactions Row */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-6">
              <button
                onClick={() => toggleLike(post?.id)}
                className={`flex items-center gap-2 group transition-all ${post?.liked ? 'text-primary-container' : 'text-text-secondary hover:text-white'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${post?.liked ? 'bg-primary-container/20 text-primary-container' : 'bg-surface-container-highest/50 group-hover:bg-surface-container-highest'
                  }`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: post?.liked ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                </div>
                <span className="font-label-md text-sm">{post?.likes.toLocaleString()}</span>
              </button>

              <div className="flex items-center gap-2 text-text-secondary">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-highest/50 text-text-secondary">
                  <span className="material-symbols-outlined">mode_comment</span>
                </div>
                <span className="font-label-md text-sm">{post?.commentsCount}</span>
              </div>

              <button
                onClick={() => {
                  setShowCommentForm(true);
                  setTimeout(() => {
                    const ta = document.getElementById('comment-textarea');
                    if (ta) {
                      ta.focus();
                      ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }}
                className="flex items-center gap-2 group transition-all text-text-secondary hover:text-primary-container bg-transparent border-none cursor-pointer"
                title="Reply to Post"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-highest/50 group-hover:bg-primary-container/20 group-hover:text-primary-container transition-all">
                  <span className="material-symbols-outlined">reply</span>
                </div>
                <span className="font-label-md text-sm font-semibold">Reply</span>
              </button>

              <button
                onClick={() => toggleReblog(post?.id)}
                className={`flex items-center gap-2 group transition-all ${post?.reblogged ? 'text-green-500' : 'text-text-secondary hover:text-white'
                  }`}
                title="Boost Post"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${post?.reblogged ? 'bg-green-500/20 text-green-500' : 'bg-surface-container-highest/50 group-hover:bg-surface-container-highest'
                  }`}>
                  <span className="material-symbols-outlined">repeat</span>
                </div>
                <span className="font-label-md text-sm">{post?.shares || 0}</span>
              </button>
            </div>
            <button className="flex items-center gap-2 text-text-secondary hover:text-gold-muted transition-colors">
              <span className="material-symbols-outlined">bookmark_add</span>
            </button>
          </div>
        </article>

        {/* Comment section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-headline-md text-xl font-bold">Conversation</h4>
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <span>Sort by:</span>
              <button className="flex items-center gap-1 text-text-primary font-bold">
                Impact
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            </div>
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <form onSubmit={handleCommentSubmit} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 mb-10 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    alt="Current user avatar"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8-iwKS5zctDdKXq3FFtjDqWrrumipiXdM8XN48eXtwvhH4xsrBkANOeuEsaigHy79poprm1CflB16viwYBsR2nYAgpvhWzw3KVgKXqFzZUW15zUK99kWw-Qgd_8tERuV7d_4KT9whJYB8qCThIAYSvp9RTBmBRYEjUUUkOdMhMgyFj74s1mZ568mpEAbIhNN2nksTtXPh7rGVXB3Q8GcD1BrxYyQF5SrN-4fPdQ2mzZ2qRy0vaYxgs8WWSKvzW57KG_dipnqTZ-E"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  {/* Content Warning Input Box */}
                  {showCommentCwInput && (
                    <div className="relative animate-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        placeholder="Content Warning label (e.g. Spoilers, sensitive topic...)"
                        value={commentCwText}
                        onChange={(e) => setCommentCwText(e.target.value)}
                        className="w-full bg-surface-crimson-low/10 border border-primary-container/20 rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCommentCwText('');
                          setShowCommentCwInput(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white bg-transparent border-none cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  )}

                  {/* Attachment Inputs */}
                  {commentTab === 'image' && (
                    <div className="relative animate-in slide-in-from-top-1 duration-200">
                      <input
                        type="text"
                        placeholder="Image URL (e.g. https://example.com/photo.jpg)"
                        value={commentImageUrl}
                        onChange={(e) => setCommentImageUrl(e.target.value)}
                        className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm"
                      />
                    </div>
                  )}

                  {commentTab === 'link' && (
                    <div className="relative animate-in slide-in-from-top-1 duration-200">
                      <input
                        type="text"
                        placeholder="Link URL (e.g. https://example.com)"
                        value={commentLinkUrl}
                        onChange={(e) => setCommentLinkUrl(e.target.value)}
                        className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:ring-1 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm"
                      />
                    </div>
                  )}

                  {/* Textarea */}
                  <div className="relative">
                    <textarea
                      id="comment-textarea"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full bg-surface-ink border border-white/10 p-4 focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all min-h-[100px] text-text-primary placeholder:text-text-secondary/50 resize-none rounded-lg text-sm"
                      placeholder="Add your perspective..."
                    ></textarea>

                    {/* Emoji dropdown inside comment */}
                    {showCommentEmojiDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowCommentEmojiDropdown(false)} />
                        <div className="absolute bottom-16 left-4 bg-surface-container-lowest border border-white/10 rounded-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 w-56">
                          <div className="grid grid-cols-5 gap-2 justify-items-center">
                            {['😀', '😂', '😍', '👍', '🔥', '🎉', '🚀', '💡', '🚨', '👥', '🤔', '👀', '✨', '👏'].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setCommentText(prev => prev + emoji);
                                  setShowCommentEmojiDropdown(false);
                                }}
                                className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-white/5 active:scale-95 cursor-pointer bg-transparent border-none text-text-primary"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar Row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  {/* Image Attachment Button */}
                  <button
                    type="button"
                    onClick={() => setCommentTab(commentTab === 'image' ? 'text' : 'image')}
                    title="Attach Image"
                    className={`p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer border-none ${commentTab === 'image' ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text-secondary bg-transparent'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">image</span>
                  </button>

                  {/* Link Attachment Button */}
                  <button
                    type="button"
                    onClick={() => setCommentTab(commentTab === 'link' ? 'text' : 'link')}
                    title="Attach Link"
                    className={`p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer border-none ${commentTab === 'link' ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text-secondary bg-transparent'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">link</span>
                  </button>

                  {/* Content Warning Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommentCwInput(!showCommentCwInput);
                      if (showCommentCwInput) setCommentCwText('');
                    }}
                    title="Content Warning"
                    className={`p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer border-none ${showCommentCwInput ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text-secondary bg-transparent'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </button>

                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => setShowCommentEmojiDropdown(!showCommentEmojiDropdown)}
                    title="Add Emoji"
                    className={`p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer border-none ${showCommentEmojiDropdown ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text-secondary bg-transparent'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommentForm(false);
                      setCommentText('');
                      setCommentImageUrl('');
                      setCommentLinkUrl('');
                      setCommentCwText('');
                      setShowCommentCwInput(false);
                      setShowCommentEmojiDropdown(false);
                      setCommentTab('text');
                    }}
                    className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!commentText.trim() && !commentImageUrl.trim() && !commentLinkUrl.trim()}
                    className="bg-primary-container text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-inverse-primary transition-colors active:scale-95 shadow-md shadow-primary-container/10 disabled:opacity-50 cursor-pointer border-none"
                  >
                    Post
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Comment Thread */}
          <div className="flex flex-col">
            {post?.comments.length === 0 ? (
              <p className="text-text-secondary text-sm italic text-center py-6">
                No perspectives shared yet. Join the conversation!
              </p>
            ) : (
              post?.comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onReplyClick={handleReplyClick}
                />
              ))
            )}
          </div>
        </section>
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

      {post && (
        <ImageCarouselModal
          isOpen={carouselOpen}
          onClose={() => setCarouselOpen(false)}
          images={post?.images && post?.images.length > 0 ? post?.images : post?.image ? [post?.image] : []}
          imageAlts={post?.images && post?.images.length > 0 ? post?.imageAlts : post?.image ? [post?.imageMeta || ""] : []}
          initialIndex={carouselIndex}
          post={post}
        />
      )}
    </div>
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

const CommentCard = ({ comment, isReply = false, onReplyClick }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes || 0);
  const [boosted, setBoosted] = useState(false);
  const [boostsCount, setBoostsCount] = useState(comment.boosts || Math.floor((comment.likes || 10) * 0.25));
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const handleBoost = () => {
    if (boosted) {
      setBoosted(false);
      setBoostsCount(prev => prev - 1);
    } else {
      setBoosted(true);
      setBoostsCount(prev => prev + 1);
    }
  };

  const authorHandle = comment.author.handle || `@${comment.author.name.toLowerCase().replace(/\s+/g, '')}@kollective.social`;

  const renderText = (text) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((word, idx) => {
      if (word.startsWith('@')) {
        return (
          <span
            key={idx}
            className="text-primary-container font-bold hover:underline cursor-pointer"
            onClick={() => alert(`Viewing profile for mention: ${word}`)}
          >
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <div className={`flex flex-col ${isReply ? 'mt-4 ml-14 pl-6 border-l border-white/10' : 'py-6 border-b border-white/5'}`}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <UserHoverCard author={comment.author}>
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 hover:opacity-85 transition-opacity">
              {comment.author.avatar ? (
                <img alt={comment.author.name} className="w-full h-full object-cover" src={comment.author.avatar} />
              ) : (
                <div className="w-full h-full bg-surface-container flex items-center justify-center text-white text-sm font-bold uppercase">
                  {comment.author.name[0]}
                </div>
              )}
            </div>
          </UserHoverCard>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <UserHoverCard author={comment.author}>
                <span className="font-bold text-text-primary text-sm md:text-base hover:underline cursor-pointer truncate">
                  {comment.author.name}
                </span>
              </UserHoverCard>
              {comment.author.verified && (
                <span className="material-symbols-outlined text-[16px] text-text-secondary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              )}
              <span className="text-sm md:text-sm text-text-secondary font-mono truncate">{authorHandle}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 text-text-secondary text-[11px]">
              <span className="material-symbols-outlined text-[12px]">public</span>
              <span>{comment.time}</span>
            </div>
          </div>

          {/* Body */}
          {comment.contentWarning ? (
            <ContentWarningWrapper warning={comment.contentWarning}>
              <p className="font-body-md text-base md:text-lg text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap">
                {renderText(comment.text)}
              </p>
            </ContentWarningWrapper>
          ) : (
            <p className="font-body-md text-base md:text-lg text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap">
              {renderText(comment.text)}
            </p>
          )}

          {/* Image attachment if present */}
          {comment.image && (
            <div className="rounded-xl overflow-hidden aspect-video relative group border border-white/5 mb-4 max-h-64">
              <img alt="Attachment" className="w-full h-full object-cover" src={comment.image} />
            </div>
          )}

          {/* Link attachment if present */}
          {comment.link && (
            <div className="mb-4">
              <a
                href={comment.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-container hover:underline text-sm font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"
              >
                <span className="material-symbols-outlined text-[16px]">link</span>
                <span className="truncate max-w-xs">{comment.link}</span>
              </a>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex items-center gap-8 text-text-secondary">
            <button
              onClick={() => onReplyClick(comment.author.name)}
              className="flex items-center gap-1.5 text-sm hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
              title="Reply"
            >
              <span className="material-symbols-outlined text-[18px]">reply</span>
              <span>{comment.replies ? comment.replies.length : 0}</span>
            </button>

            <button
              onClick={handleBoost}
              className={`flex items-center gap-1.5 text-sm transition-colors bg-transparent border-none cursor-pointer ${boosted ? 'text-green-500' : 'hover:text-green-500'
                }`}
              title="Boost"
            >
              <span className="material-symbols-outlined text-[18px]">repeat</span>
              <span>{boostsCount}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors bg-transparent border-none cursor-pointer ${liked ? 'text-yellow-500' : 'hover:text-yellow-500'
                }`}
              title="Favorite"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                star
              </span>
              <span>{likesCount}</span>
            </button>

            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex items-center gap-1.5 text-sm transition-colors bg-transparent border-none cursor-pointer ${bookmarked ? 'text-blue-400' : 'hover:text-blue-400'
                }`}
              title="Bookmark"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                bookmark
              </span>
            </button>

            <button
              onClick={() => alert('Options: Copy link, Mute user, Report comment')}
              className="flex items-center text-sm hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              title="More"
            >
              <span className="material-symbols-outlined text-[18px]">more_horiz</span>
            </button>

            {comment.highImpact && (
              <span className="text-[14px] bg-secondary/10 text-text-secondary px-2 py-0.5 rounded-full font-bold border border-secondary/20 ml-auto">
                HIGH IMPACT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recursive replies render */}
      {!isReply && comment.replies && comment.replies.map(reply => (
        <CommentCard
          key={reply.id}
          comment={reply}
          isReply={true}
          onReplyClick={onReplyClick}
        />
      ))}
    </div>
  );
};


