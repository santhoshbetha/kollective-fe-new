import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//import { useEventsQuery } from '../features/events/useEventsQuery';
import { useEventsQuery } from '../features/events/useEventsFeature';
import { useToggleEventInterest, useToggleEventAttendance, useAddEventComment } from '../features/events/useEventsFeature';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const toggleEventAttendanceMutation = useToggleEventAttendance(id);
  const commentMutation = useAddEventComment(id);

  const { events, eventsLoading } = useEventsQuery();
  const toggleEventInterestMutation = useToggleEventInterest();

  const [activeTab, setActiveTab] = useState('discussion'); // 'info' or 'discussion'
  const [commentText, setCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const event = events?.find((e) => e.id === id);

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

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    commentMutation.mutate(commentText, {
      onSuccess: () => {
        setCommentText('');
        setIsSubmittingComment(false);
        triggerToast('Comment posted successfully!');
      },
      onError: (err) => {
        setIsSubmittingComment(false);
        triggerToast(err?.message || 'Failed to post comment.');
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
      <div className="sticky top-[80px] z-30 bg-background/90 backdrop-blur-md py-3 mb-6 border-b dark:border-white/5 border-black/5 flex items-center justify-between">
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
            <div className="relative h-56 md:h-80 overflow-hidden bg-black/40">
              <img
                alt={`${event?.title} banner background`}
                className="w-full h-full object-cover object-center scale-110 blur-[4px] brightness-[0.4]"
                src={event?.image}
              />
              <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
                <img
                  alt={event?.title}
                  className="max-h-full rounded-2xl shadow-2xl border border-outline-variant object-cover aspect-[16/9]"
                  src={event?.image}
                />
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                    {event?.title}
                  </h2>
                  <div className="flex items-center gap-2.5 text-text-secondary">
                    {event?.organizerAvatar ? (
                      <img
                        alt={event?.organizer}
                        className="w-6 h-6 rounded-full object-cover border border-primary-container/20"
                        src={event?.organizerAvatar}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container font-black text-sm">
                        {event?.organizer.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm md:text-sm">
                      Organized by <strong className="text-text-primary font-medium">{event?.organizer}</strong>
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
                  <span className="text- sm md:text-lg font-semibold truncate" title={event?.location}>{event?.location}</span>
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
                  onClick={() => toggleEventAttendanceMutation.mutate(event?.id)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 font-bold py-3 rounded-xl border transition-all cursor-pointer ${event?.isAttending
                    ? 'bg-primary-container/20 text-primary-container border-primary-container/30'
                    : 'bg-surface-container-high/20 hover:bg-surface-container-high/50 text-text-primary border-outline-variant'
                    }`}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: event?.isAttending ? "'FILL' 1" : "'FILL' 0" }}>
                    check_circle
                  </span>
                  {event?.isAttending ? 'Attending' : 'Attend Event'}
                </button>

                <button
                  onClick={() => toggleEventInterestMutation.mutate(event?.id)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 font-bold py-3 rounded-xl border transition-all cursor-pointer ${event?.isInterested
                    ? 'bg-primary-container text-white border-primary-container shadow-lg shadow-primary-container/10'
                    : 'bg-surface-container-high/20 hover:bg-surface-container-high/50 text-text-primary border-outline-variant'
                    }`}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: event?.isInterested ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                  {event?.isInterested ? 'Interested' : 'Mark Interested'}
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
                Discussion ({event?.comments?.length || 0})
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
                <form onSubmit={handlePostComment} className="bg-surface-container rounded-2xl border border-white/5 p-4 space-y-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment, coordination note, or feedback..."
                    rows="3"
                    className="w-full bg-surface-ink border border-white/5 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none rounded-xl p-3 text-sm md:text-sm text-text-primary resize-none placeholder:text-text-secondary/30"
                  ></textarea>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-text-secondary">
                      <button type="button" className="p-1.5 rounded-full hover:bg-white/5 text-base cursor-pointer bg-transparent border-none">
                        <span className="material-symbols-outlined text-sm">attachment</span>
                      </button>
                      <button type="button" className="p-1.5 rounded-full hover:bg-white/5 text-base cursor-pointer bg-transparent border-none">
                        <span className="material-symbols-outlined text-sm">sentiment_satisfied</span>
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="bg-primary-container hover:brightness-110 text-white font-bold text-sm md:text-sm py-2 px-6 rounded-xl transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>

                {/* Comment Feed */}
                <div className="space-y-4">
                  {event?.comments?.length === 0 ? (
                    <div className="text-center py-10 bg-surface-container/20 rounded-2xl border border-dashed border-white/5">
                      <span className="material-symbols-outlined text-3xl text-text-secondary/50 mb-2">
                        forum
                      </span>
                      <p className="text-text-secondary text-sm">No discussion yet. Start the conversation!</p>
                    </div>
                  ) : (
                    event?.comments?.map((comment) => (
                      <div key={comment.id} className="bg-surface-container rounded-2xl border border-white/5 p-5 space-y-4">
                        <div className="flex gap-4">
                          {comment.author?.avatar ? (
                            <img
                              alt={comment.author.name}
                              className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
                              src={comment.author.avatar}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-surface-bright flex items-center justify-center text-text-secondary font-black text-sm flex-shrink-0">
                              {comment.author?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm md:text-base font-bold text-text-primary truncate">
                                {comment.author?.name}
                              </span>
                              {comment.author?.name === event?.organizer && (
                                <span className="bg-primary-container/20 text-primary-container text-[12px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                  Organizer
                                </span>
                              )}
                              <span className="text-[14px] text-text-secondary font-medium">
                                • {comment.time || 'Just now'}
                              </span>
                            </div>
                            <p className="font-body-md text-base md:text-lg text-text-secondary leading-relaxed">
                              {comment.text}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-[14px] text-text-secondary/70">
                              <button className="flex items-center gap-1 hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer">
                                <span className="material-symbols-outlined text-sm">favorite</span>
                                {comment.likes || 0}
                              </button>
                              <button className="hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-8 pl-4 border-l-2 border-white/5 space-y-4 pt-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                {reply.author?.avatar ? (
                                  <img
                                    alt={reply.author.name}
                                    className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0"
                                    src={reply.author.avatar}
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center text-text-secondary font-black text-[14px] flex-shrink-0">
                                    {reply.author?.name?.charAt(0) || 'U'}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-sm md:text-base font-bold text-text-primary truncate">
                                      {reply.author?.name}
                                    </span>
                                    {(reply.author?.name === event?.organizer || reply.role === 'Organizer') && (
                                      <span className="bg-primary-container/20 text-primary-container text-[12px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                        Organizer
                                      </span>
                                    )}
                                    <span className="text-[14px] text-text-secondary font-medium">
                                      • {reply.time || 'Just now'}
                                    </span>
                                  </div>
                                  <p className="font-body-md text-base md:text-lg text-text-secondary leading-relaxed">
                                    {reply.text}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-[14px] text-text-secondary/70">
                                    <button className="flex items-center gap-1 hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer">
                                      <span className="material-symbols-outlined text-sm">favorite</span>
                                      {reply.likes || 0}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    ))
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
                  {event?.organizer}
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
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-text-secondary/40">groups</span>
                  Attendees
                </span>
                <span className="font-bold text-white text-sm">{event?.attendeesCount}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-text-secondary/40">favorite</span>
                  Interested
                </span>
                <span className="font-bold text-white text-sm">{event?.interestedCount}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
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
        © 2024 Kollective. Built for revolutionary community leadership. All Rights Reserved.
      </footer>

    </div>
  );
};
