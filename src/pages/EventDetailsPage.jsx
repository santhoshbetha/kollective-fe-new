import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventsQuery, useToggleEventInterest, useToggleEventAttendance, useAddEventComment, useEventCommentsQuery, useLikeEventComment } from '../features/events/useEventsFeature';
import { EventDateBadge, AttendeeStack } from '../features/events/EventComponents';
import { getDisplayLocation, getOrganizerName } from '../utils/eventUtils';
import { CategoryGraphic } from '../components/CategoryGraphic';
import { EmojiSelector } from '../components/EmojiSelector';
import { useAuthStore } from '../store/auth/useAuthStore';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = useAuthStore((state) => state.user);
  const activeAccount = useAuthStore((state) => state.activeAccount);

  const isSelfComment = (c) => {
    if (!c) return false;
    const currentUserId = currentUser?.id || activeAccount?.id;
    const currentUsername = currentUser?.username || activeAccount?.username;
    const currentName = currentUser?.name || activeAccount?.name;

    const commentUserId = c.user_id || c.user?.id || c.author?.id;
    const commentUsername = c.author?.username || c.authorUsername;
    const commentAuthorName = c.author?.name || c.authorName || c.userName;

    if (currentUserId && commentUserId && String(currentUserId) === String(commentUserId)) {
      return true;
    }
    if (currentUsername && commentUsername && currentUsername.toLowerCase() === commentUsername.toLowerCase()) {
      return true;
    }
    if (currentName && commentAuthorName && currentName.toLowerCase() === commentAuthorName.toLowerCase()) {
      return true;
    }
    return false;
  };

  const toggleEventAttendanceMutation = useToggleEventAttendance(id);
  const commentMutation = useAddEventComment(id);
  const likeCommentMutation = useLikeEventComment(id);
  const { data: fetchedComments } = useEventCommentsQuery(id);

  const { events, eventsLoading } = useEventsQuery();
  const toggleEventInterestMutation = useToggleEventInterest();

  const [activeTab, setActiveTab] = useState('discussion'); // 'info' or 'discussion'
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState(null);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const commentFileInputRef = useRef(null);

  const [replyParentId, setReplyParentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [showReplyEmoji, setShowReplyEmoji] = useState(false);
  const replyFileInputRef = useRef(null);

  const [toastMessage, setToastMessage] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [imgError, setImgError] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const event = events?.find((e) => e.id === id);

  const allComments = (fetchedComments && Array.isArray(fetchedComments) && fetchedComments.length > 0)
    ? fetchedComments
    : (event?.comments || []);

  if (eventsLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary-container border-white/10 animate-spin"></div>
        <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
          Loading event details...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-0 py-12 text-center">
        <span className="material-symbols-outlined text-5xl text-primary-container mb-4">
          warning
        </span>
        <h3 className="font-bold text-text-primary text-xl mb-2">Event Not Found</h3>
        <p className="text-text-secondary text-sm mb-6">
          The event you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/events')}
          className="px-6 py-2.5 bg-primary-container text-white font-bold rounded-xl text-sm md:text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
        >
          Return to Events
        </button>
      </div>
    );
  }

  const organizerName = getOrganizerName(event?.organizerName || event?.organizer);
  const organizerAvatar = event?.organizerAvatar || (typeof event?.organizer === 'object' ? (event?.organizer?.avatar_url || event?.organizer?.avatar) : '');
  const eventImageUrl = event?.image || event?.cover_image_url || event?.banner_url;

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

  const handleReplyFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage) return;

    setIsSubmittingComment(true);
    commentMutation.mutate({ eventId: id, commentText: commentText.trim(), imageUrl: commentImage }, {
      onSuccess: () => {
        setCommentText('');
        setCommentImage(null);
        setShowCommentEmoji(false);
        setIsSubmittingComment(false);
        triggerToast('Comment posted successfully!');
      },
      onError: (err) => {
        setIsSubmittingComment(false);
        triggerToast(err?.message || 'Failed to post comment.');
      }
    });
  };

  const handlePostReply = (parentId) => {
    if (!replyText.trim() && !replyImage) return;

    commentMutation.mutate({ eventId: id, commentText: replyText.trim(), parentId, imageUrl: replyImage }, {
      onSuccess: () => {
        setReplyText('');
        setReplyImage(null);
        setShowReplyEmoji(false);
        setReplyParentId(null);
        triggerToast('Reply posted!');
      },
      onError: (err) => {
        triggerToast(err?.message || 'Failed to post reply.');
      }
    });
  };

  const handleLikeComment = (commentId) => {
    likeCommentMutation.mutate(commentId, {
      onSuccess: () => {
        triggerToast('Liked comment!');
      },
      onError: () => {
        triggerToast('Failed to like comment.');
      }
    });
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => triggerToast('Event details link copied to clipboard!'))
      .catch(() => triggerToast('Failed to copy link.'));
  };

  const handleAddToCalendar = () => {
    triggerToast('Event added to your local calendar!');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-0 relative text-scale-large">
      {/* Back Navigation */}
      <div className="sticky top-[60px] z-30 bg-surface backdrop-blur-md py-3 mb-6 border-b dark:border-white/5 
                      border-black/5 flex items-center justify-between">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-bold text-sm md:text-sm group cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          Back to Events
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Main Content (Left Column) */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* Cover and header card */}
          <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant shadow-xl">
            {/* Cinematic banner with background blur and main image */}
            {eventImageUrl && !imgError ? (
              <div className="relative h-56 md:h-80 overflow-hidden bg-black/40">
                <img
                  alt={`${event?.title} banner background`}
                  className="w-full h-full object-cover object-center scale-110 blur-[4px] brightness-[0.4]"
                  src={eventImageUrl}
                />
                <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
                  <img
                    alt={event?.title}
                    className="max-h-full rounded-2xl shadow-2xl border border-outline-variant object-cover aspect-[16/9]"
                    src={eventImageUrl}
                    onError={() => setImgError(true)}
                  />
                </div>
              </div>
            ) : (
              <div className="relative h-56 md:h-80 overflow-hidden">
                <CategoryGraphic category={event?.category} title={event?.title} className="w-full h-full" />
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                    {event?.title}
                  </h2>
                  <div className="flex items-center gap-2.5 text-text-secondary">
                    {organizerAvatar ? (
                      <img
                        alt={organizerName}
                        className="w-6 h-6 rounded-full object-cover border border-primary-container/20"
                        src={organizerAvatar}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container font-black text-sm">
                        {organizerName.charAt(0)}
                      </div>
                    )}
                    <span className="text-md md:text-lg">
                      Organized by <strong className="text-text-primary font-medium">{organizerName}</strong>
                    </span>
                    <span className="material-symbols-outlined text-blue-400 text-sm">verified</span>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-surface-container-high/60 transition-colors cursor-pointer text-text-secondary hover:text-text-primary bg-transparent border-none flex-shrink-0"
                >
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>

              {/* Logistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
                <div className="flex items-center gap-3 text-text-secondary">
                  <span className="material-symbols-outlined text-primary-container text-xl">calendar_today</span>
                  <span className="text-sm md:text-lg font-semibold">{event?.date}</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <span className="material-symbols-outlined text-primary-container text-xl">schedule</span>
                  <span className="text-sm md:text-lg font-semibold">{event?.time}</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <span className="material-symbols-outlined text-primary-container text-xl">location_on</span>
                  <span className="text-sm md:text-lg font-semibold text-wrap" title={getDisplayLocation(event?.location, event)}>
                    {getDisplayLocation(event?.location, event)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <span className="material-symbols-outlined text-primary-container text-xl">group</span>
                  <span className="text-sm md:text-lg font-semibold">
                    {event?.attendeesCount} attending • {event?.interestedCount} interested
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-outline-variant">
                <button
                  disabled={toggleEventAttendanceMutation.isPending}
                  onClick={() => {
                    toggleEventAttendanceMutation.mutate(event?.id, {
                      onSuccess: (updated) => {
                        triggerToast(updated?.isAttending ? 'Marked as Attending!' : 'Removed from Attending');
                      },
                      onError: () => {
                        triggerToast('Failed to update attendance.');
                      }
                    });
                  }}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 font-bold py-3 rounded-xl border transition-all cursor-pointer ${event?.isAttending
                    ? 'bg-primary-container/20 text-primary-container border-primary-container/30'
                    : 'bg-surface-container-high/20 hover:bg-surface-container-high/50 text-text-primary border-outline-variant'
                    } ${toggleEventAttendanceMutation.isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: event?.isAttending ? "'FILL' 1" : "'FILL' 0" }}>
                    check_circle
                  </span>
                  {toggleEventAttendanceMutation.isPending ? 'Updating...' : (event?.isAttending ? 'Attending' : 'Attend Event')}
                </button>

                <button
                  disabled={toggleEventInterestMutation.isPending}
                  onClick={() => {
                    toggleEventInterestMutation.mutate(event?.id, {
                      onSuccess: (updated) => {
                        triggerToast(updated?.isInterested ? 'Marked as Interested!' : 'Removed Interest');
                      },
                      onError: () => {
                        triggerToast('Failed to update interest.');
                      }
                    });
                  }}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 font-bold py-3 rounded-xl border transition-all cursor-pointer ${event?.isInterested
                    ? 'bg-primary-container text-white border-primary-container shadow-lg shadow-primary-container/10'
                    : 'bg-surface-container-high/20 hover:bg-surface-container-high/50 text-text-primary border-outline-variant'
                    } ${toggleEventInterestMutation.isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: event?.isInterested ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                  {toggleEventInterestMutation.isPending ? 'Updating...' : (event?.isInterested ? 'Interested' : 'Mark Interested')}
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 bg-surface-container-high/20 hover:bg-surface-container-high/50 text-text-secondary hover:text-text-primary rounded-xl border border-outline-variant transition-all cursor-pointer"
                  title="Share Event"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
              </div>

            </div>
          </div>

          {/* Details Content Tabs */}
          <div className="mb-2 border-b border-outline-variant">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-4 text-sm md:text-sm font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none ${activeTab === 'info'
                  ? 'text-primary-container border-b-2 border-primary-container'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Information
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`pb-4 text-sm md:text-sm font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none ${activeTab === 'discussion'
                  ? 'text-primary-container border-b-2 border-primary-container'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Discussion ({allComments?.length || 0})
              </button>
            </nav>
          </div>

          {/* Tab Panes */}
          <div className="space-y-6">
            {activeTab === 'info' ? (
              <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 space-y-4">
                <h4 className="font-bold text-white text-sm md:text-base">About this Gathering</h4>
                <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-line">
                  {event?.description}
                </p>
                <div className="pt-4 border-t border-white/5 text-[14px] text-text-secondary">
                  Format: <span className="text-white font-bold uppercase">{event?.format}</span> • Category: <span className="text-white font-bold uppercase">{event?.category}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Comment Input */}
                <form onSubmit={handlePostComment} className="bg-surface-container rounded-2xl border border-white/5 p-4 space-y-4 relative">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment, coordination note, or feedback..."
                    rows="3"
                    className="w-full bg-surface-ink border border-white/5 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none rounded-xl p-3 text-md md:text-lg text-text-primary resize-none placeholder:text-text-secondary/30"
                  ></textarea>

                  {commentImage && (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10 group">
                      <img src={commentImage} alt="Attachment Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCommentImage(null)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center border-none cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={commentFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleCommentFileChange}
                  />

                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-3 text-text-secondary relative">
                      <button
                        type="button"
                        onClick={() => commentFileInputRef.current?.click()}
                        className="p-1.5 rounded-full hover:bg-white/5 text-base cursor-pointer bg-transparent border-none text-text-secondary hover:text-primary-container transition-colors"
                        title="Attach Image"
                      >
                        <span className="material-symbols-outlined text-sm">attachment</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCommentEmoji(!showCommentEmoji)}
                        className="p-1.5 rounded-full hover:bg-white/5 text-base cursor-pointer bg-transparent border-none text-text-secondary hover:text-primary-container transition-colors"
                        title="Add Emoji"
                      >
                        <span className="material-symbols-outlined text-sm">sentiment_satisfied</span>
                      </button>

                      {showCommentEmoji && (
                        <EmojiSelector
                          onSelect={(emoji) => setCommentText((prev) => prev + emoji)}
                          onClose={() => setShowCommentEmoji(false)}
                        />
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingComment || (!commentText.trim() && !commentImage)}
                      className="bg-primary-container hover:brightness-110 text-white font-bold text-sm md:text-sm py-2 px-6 rounded-xl transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>

                {/* Comment Feed */}
                <div className="space-y-4">
                  {allComments?.length === 0 ? (
                    <div className="text-center py-10 bg-surface-container/20 rounded-2xl border border-dashed border-white/5">
                      <span className="material-symbols-outlined text-3xl text-text-secondary/50 mb-2">
                        forum
                      </span>
                      <p className="text-text-secondary text-sm">No discussion yet. Start the conversation!</p>
                    </div>
                  ) : (
                    allComments?.map((comment) => {
                      const authorName = comment.author?.username || comment.author?.name || comment.authorName || 'Citizen';
                      const authorAvatar = comment.author?.avatar_url || comment.author?.avatar || comment.authorAvatar;
                      const commentTextDisplay = comment.content || comment.text || '';
                      const commentImageUrl = comment.image_url || comment.imageUrl || comment.image;
                      const likesCount = comment.likes_count ?? comment.likes ?? 0;
                      const isReplying = replyParentId === comment.id;
                      const isSelf = isSelfComment(comment);

                      return (
                        <div key={comment.id} className="bg-surface-container rounded-2xl border border-white/5 p-5 space-y-4">
                          <div className="flex gap-4">
                            {authorAvatar ? (
                              <img
                                alt={authorName}
                                className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
                                src={authorAvatar}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-surface-bright flex items-center justify-center text-text-secondary font-black text-sm flex-shrink-0">
                                {authorName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm md:text-base font-bold text-text-primary truncate">
                                  {authorName}
                                </span>
                                {authorName === organizerName && (
                                  <span className="bg-primary-container/20 text-primary-container text-[12px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                    Organizer
                                  </span>
                                )}
                                <span className="text-[14px] text-text-secondary font-medium">
                                  • {comment.inserted_at ? new Date(comment.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (comment.time || 'Just now')}
                                </span>
                              </div>
                              {commentTextDisplay && (
                                <p className="font-body-md text-base md:text-lg text-text-secondary leading-relaxed">
                                  {commentTextDisplay}
                                </p>
                              )}
                              {commentImageUrl && (
                                <div className="mt-3 rounded-2xl overflow-hidden max-h-72 max-w-md border border-white/10 shadow-lg">
                                  <img
                                    src={commentImageUrl}
                                    alt="Comment Attachment"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-4 mt-3 text-[14px] text-text-secondary/70">
                                <button
                                  disabled={isSelf}
                                  onClick={() => !isSelf && handleLikeComment(comment.id)}
                                  title={isSelf ? "You cannot like your own comment" : "Like comment"}
                                  className={`flex items-center gap-1 transition-colors bg-transparent border-none ${isSelf
                                    ? 'opacity-40 cursor-not-allowed text-text-secondary/50'
                                    : comment.has_liked
                                      ? 'text-primary-container font-bold cursor-pointer'
                                      : 'hover:text-primary-container cursor-pointer'
                                    }`}
                                >
                                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: comment.has_liked ? "'FILL' 1" : "'FILL' 0" }}>
                                    favorite
                                  </span>
                                  {likesCount}
                                </button>
                                <button
                                  disabled={isSelf}
                                  onClick={() => {
                                    if (isSelf) return;
                                    setReplyParentId(isReplying ? null : comment.id);
                                    setReplyText('');
                                    setReplyImage(null);
                                    setShowReplyEmoji(false);
                                  }}
                                  title={isSelf ? "You cannot reply to your own comment" : "Reply"}
                                  className={`transition-colors bg-transparent border-none font-semibold ${isSelf
                                    ? 'opacity-40 cursor-not-allowed text-text-secondary/50'
                                    : 'hover:text-primary-container cursor-pointer'
                                    }`}
                                >
                                  {isReplying ? 'Cancel' : 'Reply'}
                                </button>
                              </div>

                              {/* Inline Reply Input Box */}
                              {isReplying && (
                                <div className="mt-4 pt-3 border-t border-white/5 space-y-3 relative">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Reply to ${authorName}...`}
                                    rows="2"
                                    className="w-full bg-surface-ink border border-white/10 focus:border-primary-container transition-all outline-none rounded-xl p-2.5 text-sm text-text-primary resize-none"
                                  ></textarea>

                                  {replyImage && (
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 group">
                                      <img src={replyImage} alt="Reply Attachment Preview" className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => setReplyImage(null)}
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black text-white text-[10px] flex items-center justify-center border-none cursor-pointer"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  )}

                                  <input
                                    type="file"
                                    ref={replyFileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleReplyFileChange}
                                  />

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-text-secondary relative">
                                      <button
                                        type="button"
                                        onClick={() => replyFileInputRef.current?.click()}
                                        className="p-1 rounded-full hover:bg-white/5 text-xs cursor-pointer bg-transparent border-none text-text-secondary hover:text-primary-container transition-colors"
                                        title="Attach Image"
                                      >
                                        <span className="material-symbols-outlined text-sm">attachment</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setShowReplyEmoji(!showReplyEmoji)}
                                        className="p-1 rounded-full hover:bg-white/5 text-xs cursor-pointer bg-transparent border-none text-text-secondary hover:text-primary-container transition-colors"
                                        title="Add Emoji"
                                      >
                                        <span className="material-symbols-outlined text-sm">sentiment_satisfied</span>
                                      </button>

                                      {showReplyEmoji && (
                                        <EmojiSelector
                                          onSelect={(emoji) => setReplyText((prev) => prev + emoji)}
                                          onClose={() => setShowReplyEmoji(false)}
                                        />
                                      )}
                                    </div>

                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyParentId(null);
                                          setReplyImage(null);
                                          setShowReplyEmoji(false);
                                        }}
                                        className="px-3 py-1.5 bg-transparent hover:bg-white/5 text-text-secondary font-bold text-xs rounded-lg transition-colors cursor-pointer border-none"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        disabled={!replyText.trim() && !replyImage}
                                        onClick={() => handlePostReply(comment.id)}
                                        className="px-4 py-1.5 bg-primary-container text-white font-bold text-xs rounded-lg hover:brightness-110 transition-all cursor-pointer border-none disabled:opacity-40"
                                      >
                                        Post Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 pl-4 border-l-2 border-white/5 space-y-4 pt-2">
                              {comment.replies.map((reply) => {
                                const replyAuthor = reply.author?.username || reply.author?.name || reply.authorName || 'Citizen';
                                const replyAvatar = reply.author?.avatar_url || reply.author?.avatar || reply.authorAvatar;
                                const replyTextDisplay = reply.content || reply.text || '';
                                const replyImageUrl = reply.image_url || reply.imageUrl || reply.image;
                                const replyLikes = reply.likes_count ?? reply.likes ?? 0;
                                const isReplySelf = isSelfComment(reply);

                                return (
                                  <div key={reply.id} className="flex gap-3">
                                    {replyAvatar ? (
                                      <img
                                        alt={replyAuthor}
                                        className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0"
                                        src={replyAvatar}
                                      />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center text-text-secondary font-black text-[14px] flex-shrink-0">
                                        {replyAuthor.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-sm md:text-base font-bold text-text-primary truncate">
                                          {replyAuthor}
                                        </span>
                                        {(replyAuthor === organizerName || reply.role === 'Organizer') && (
                                          <span className="bg-primary-container/20 text-primary-container text-[12px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                            Organizer
                                          </span>
                                        )}
                                        <span className="text-[14px] text-text-secondary font-medium">
                                          • {reply.inserted_at ? new Date(reply.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (reply.time || 'Just now')}
                                        </span>
                                      </div>
                                      {replyTextDisplay && (
                                        <p className="font-body-md text-base md:text-lg text-text-secondary leading-relaxed">
                                          {replyTextDisplay}
                                        </p>
                                      )}
                                      {replyImageUrl && (
                                        <div className="mt-2 rounded-xl overflow-hidden max-h-56 max-w-sm border border-white/10 shadow-md">
                                          <img
                                            src={replyImageUrl}
                                            alt="Reply Attachment"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <div className="flex items-center gap-4 mt-2 text-[14px] text-text-secondary/70">
                                        <button
                                          disabled={isReplySelf}
                                          onClick={() => !isReplySelf && handleLikeComment(reply.id)}
                                          title={isReplySelf ? "You cannot like your own reply" : "Like reply"}
                                          className={`flex items-center gap-1 transition-colors bg-transparent border-none ${isReplySelf
                                            ? 'opacity-40 cursor-not-allowed text-text-secondary/50'
                                            : reply.has_liked
                                              ? 'text-primary-container font-bold cursor-pointer'
                                              : 'hover:text-primary-container cursor-pointer'
                                            }`}
                                        >
                                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: reply.has_liked ? "'FILL' 1" : "'FILL' 0" }}>
                                            favorite
                                          </span>
                                          {replyLikes}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Sidebar widgets (Right Column) */}
        <aside className="w-full lg:w-80 space-y-6 shrink-0 h-fit lg:sticky lg:top-20">

          {/* Organizer Card */}
          <div className="bg-surface-container rounded-3xl border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">
              Organizer
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center border border-primary-container/25 text-primary-container">
                <span className="material-symbols-outlined text-2xl">
                  corporate_fare
                </span>
              </div>
              <div className="overflow-hidden">
                <h4 className="text-text-primary font-bold text-sm truncate">
                  {organizerName}
                </h4>
                <p className="text-[14px] text-text-secondary uppercase tracking-wider font-semibold">
                  Verified Hub
                </p>
              </div>
            </div>
          </div>

          {/* Event Stats */}
          <div className="bg-surface-container rounded-3xl border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">
              Event Logistics
            </h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-lg">
                <span className="text-text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-text-secondary/40">groups</span>
                  Attendees
                </span>
                <span className="font-bold text-white text-lg">{event?.attendeesCount}</span>
              </div>

              <div className="flex justify-between items-center text-lg">
                <span className="text-text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-text-secondary/40">favorite</span>
                  Interested
                </span>
                <span className="font-bold text-white text-lg">{event?.interestedCount}</span>
              </div>

              <div className="flex justify-between items-center text-lg">
                <span className="text-text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-text-secondary/40">category</span>
                  Category
                </span>
                <span className="bg-surface-bright text-[14px] text-text-primary px-3 py-1 rounded-full uppercase tracking-wider font-bold border border-white/5">
                  {event?.category}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container rounded-3xl border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleAddToCalendar}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm md:text-sm text-text-secondary hover:text-text-primary hover:bg-surface-container-high/30 rounded-xl border border-outline-variant transition-all text-left cursor-pointer bg-transparent"
              >
                <span className="material-symbols-outlined text-primary-container text-base">calendar_add_on</span>
                Add to Calendar
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm md:text-sm text-text-secondary hover:text-text-primary hover:bg-surface-container-high/30 rounded-xl border border-outline-variant transition-all text-left cursor-pointer bg-transparent"
              >
                <span className="material-symbols-outlined text-primary-container text-base">link</span>
                Copy Event Link
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm md:text-sm text-text-secondary hover:text-text-primary hover:bg-surface-container-high/30 rounded-xl border border-outline-variant transition-all text-left cursor-pointer bg-transparent"
              >
                <span className="material-symbols-outlined text-primary-container text-base">share</span>
                Share Event
              </button>
            </div>
          </div>

        </aside>
      </div>

      {/* Toast Overlay */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-surface-ink text-[#F4F4F4] border border-primary-container/30 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="material-symbols-outlined text-primary-container text-sm">info</span>
          <span className="text-sm font-semibold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-text-secondary/30 text-sm pb-12">
        © {new Date().getFullYear()} Kollective. Built for revolutionary community leadership. All Rights Reserved.
      </footer>

    </div>
  );
};
