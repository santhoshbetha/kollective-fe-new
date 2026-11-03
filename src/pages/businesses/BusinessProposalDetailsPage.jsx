import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/useAuthStore';
import {
  useProposalDetailsQuery,
  useProposalCommentsQuery,
  useAddProposalComment,
  uploadProposalCommentImage,
} from '../../features/businesses/useProposalsFeature';
import { UserHoverCard } from '../../components/accounts/UserHoverCard';
import { getItemState } from '../../utils/geoUtils';

export const BusinessProposalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { proposal: proposalPayload, proposalLoading, proposalError } = useProposalDetailsQuery(id);
  const proposal = proposalPayload?.proposal || proposalPayload;

  // 💬 THREADED DISCUSSION ENGINE (mirrors the Event Details comment pipeline)
  const [newComment, setNewComment] = useState('');
  const [commentImage, setCommentImage] = useState(null);
  const [replyParentId, setReplyParentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const commentFileInputRef = useRef(null);
  const replyFileInputRef = useRef(null);

  const triggerToast = (msg, type = 'error') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 🔒 STATE-LEVEL GEOFENCE: discussion belongs to the proposal's physical state.
  const proposalState = getItemState(proposal);
  const currentUserState = user?.state || user?.origin_state || user?.political_location?.state || null;
  const normalizedUserState = currentUserState ? String(currentUserState).trim().toUpperCase() : null;
  const isDiscussionLocked = Boolean(proposalState) && normalizedUserState !== proposalState;

  const { comments, commentsLoading } = useProposalCommentsQuery(id, {
    // Never issue the network read until the proposal has resolved AND the
    // state boundary has been cleared (prevents a wasted 403 round-trip).
    enabled: Boolean(proposal) && !isDiscussionLocked,
  });
  const addCommentMutation = useAddProposalComment(id);

  const [hasInterest, setHasInterest] = useState(false);
  const [interestCount, setInterestCount] = useState(23);

  if (proposalLoading) {
    return (
      <div className="pt-24 px-4 text-center flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-t-primary-container border-white/10 animate-spin"></div>
        <p className="text-text-secondary text-lg font-bold uppercase tracking-widest">
          Loading proposal details...
        </p>
      </div>
    );
  }

  if (proposalError || !proposal) {
    return (
      <div className="pt-24 px-4 text-center">
        <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
          error
        </span>
        <h2 className="text-xl font-bold text-white mb-2">Proposal Not Found</h2>
        <p className="text-text-secondary text-lg mb-6">
          The requested business proposal could not be found.
        </p>
        <button
          onClick={() => navigate('/businesses')}
          className="px-6 py-2.5 bg-primary-container text-white font-bold rounded-lg text-sm transition-all active:scale-95"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  // Category specific premium hero images
  const getHeroImage = (cat) => {
    switch (cat) {
      case 'Sustainable Energy':
      case 'sustainable_energy':
        return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80';
      case 'Agriculture':
      case 'agriculture':
        return 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80';
      case 'Technology':
      case 'technology':
        return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
      case 'Infrastructure':
      case 'infrastructure':
      default:
        return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
    }
  };

  // 💬 DISCUSSION PIPELINE (state-gated)
  const readFileAsDataUrl = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const submitComment = async ({ text, image, parentId, reset }) => {
    if (isDiscussionLocked) return;
    if (!String(text || '').trim() && !image) return;

    setIsSubmitting(true);
    try {
      const uploadedImageUrl = image ? await uploadProposalCommentImage(image) : null;

      addCommentMutation.mutate(
        { content: String(text || '').trim(), imageUrl: uploadedImageUrl, parentId },
        {
          onSuccess: () => {
            reset();
            setIsSubmitting(false);
            triggerToast(parentId ? 'Reply posted!' : 'Comment posted successfully!', 'success');
          },
          onError: (err) => {
            setIsSubmitting(false);
            triggerToast(err?.message || 'Failed to post comment.', 'error');
          },
        }
      );
    } catch (err) {
      setIsSubmitting(false);
      triggerToast(err?.message || 'Failed to upload attachment.', 'error');
    }
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    submitComment({
      text: newComment,
      image: commentImage,
      parentId: null,
      reset: () => {
        setNewComment('');
        setCommentImage(null);
      },
    });
  };

  const handlePostReply = (parentId) => {
    submitComment({
      text: replyText,
      image: replyImage,
      parentId,
      reset: () => {
        setReplyText('');
        setReplyImage(null);
        setReplyParentId(null);
      },
    });
  };

  // 💬 CONTACT PROPOSER (Phase 4): deep-link into the private message module.
  const proposalHandle =
    proposal.user?.handle ||
    proposal.user?.username ||
    (typeof proposal.owner === 'object' ? (proposal.owner?.handle || proposal.owner?.username) : null) ||
    (typeof proposal.owner === 'string' ? proposal.owner : null) ||
    proposal.owner_name ||
    null;

  const handleContactProposerClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const targetHandle = String(proposalHandle || '').replace(/^@/, '').trim();
    if (targetHandle) {
      navigate(`/messages?user=${encodeURIComponent(targetHandle)}`);
    }
  };

  const handleToggleInterest = () => {
    if (hasInterest) {
      setInterestCount(prev => prev - 1);
      setHasInterest(false);
    } else {
      setInterestCount(prev => prev + 1);
      setHasInterest(true);
    }
  };

  const proposalTitle = proposal.title || proposal.name || 'Untitled Proposal';
  const fundingGoalVal = proposal.fundingGoal ?? proposal.money_required ?? 0;
  const daysLeftVal = proposal.daysLeft ?? 45;
  const locationText = proposal.location || proposal.district_l1 || proposal.address || 'Local District';
  const categoryText = proposal.category || 'General';
  const statusText = proposal.status || 'Active';
  const ownerHandle = proposal.owner_name || (typeof proposal.owner === 'string' ? proposal.owner : proposal.owner?.username) || 'proposer';
  const ownerAvatar = proposal.ownerAvatar || proposal.owner_avatar || (typeof proposal.owner === 'object' ? proposal.owner?.avatar_url : null);

  const meta = proposal.metadata || {};
  const strategyText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);
  const implementationStrategyText =
    strategyText(proposal.implementation_strategy) || strategyText(meta.implementation_strategy);
  const cooperativeModelText =
    strategyText(proposal.cooperative_model) || strategyText(meta.cooperative_model);
  const projectMilestonesText =
    strategyText(proposal.project_milestones) || strategyText(meta.project_milestones);
  const lookingForText =
    strategyText(proposal.looking_for_text) ||
    strategyText(meta.looking_for_text) ||
    strategyText(proposal.looking_for) ||
    strategyText(meta.looking_for);

  const splitStrategyLines = (text) => (typeof text === 'string'
    ? text.split(/[\n,]+/).map((line) => line.trim()).filter(Boolean)
    : []);

  const rawLookingFor = Array.isArray(proposal.tags) && proposal.tags.length > 0
    ? proposal.tags
    : ((Array.isArray(proposal.looking_for) && proposal.looking_for.length > 0)
      ? proposal.looking_for
      : splitStrategyLines(lookingForText));

  const lookingForTags = rawLookingFor.length > 0
    ? rawLookingFor
    : ['Co-founder', 'Tech Lead', 'Operations'];

  const milestoneLines = splitStrategyLines(projectMilestonesText);
  const projectMilestones = milestoneLines.length > 0
    ? milestoneLines
    : ['Q1 2026: Finalize specs', 'Q2 2026: Community approvals', 'Q3 2026: Beta deployment'];

  const isOwner = Boolean(
    user && proposal && (
      (proposal.user_id && String(proposal.user_id) === String(user.id)) ||
      (proposal.owner_info?.id && String(proposal.owner_info.id) === String(user.id)) ||
      (proposal.owner_name && (proposal.owner_name === user.username || proposal.owner_name === user.handle?.replace('@', ''))) ||
      (typeof proposal.owner === 'string' && (proposal.owner === user.username || proposal.owner === user.handle?.replace('@', ''))) ||
      user.is_admin ||
      user.is_moderator
    )
  );

  return (
    <div className="max-w-[1280px] mx-auto pb-20">
      {/* Back Link & Edit Header */}
      <div className="sticky top-[80px] z-30 bg-background/90 backdrop-blur-md py-3 mb-6 border-b dark:border-white/5 border-black/5 flex items-center justify-between">
        <button
          onClick={() => navigate('/businesses', { state: { returnTab: 'proposals' } })}
          data-testid="back-to-businesses-btn"
          className="back-navigation-btn flex items-center gap-2 text-primary-container hover:brightness-110 transition-all font-bold text-sm bg-transparent border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Businesses
        </button>

        {isOwner && (
          <button
            onClick={() => navigate(`/proposals/${id}/edit`)}
            data-testid="edit-proposal-btn"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary-container/10 hover:bg-primary-container/20 text-primary-container font-mono text-xs font-bold transition-all border border-primary-container/30 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span>Edit Proposal</span>
          </button>
        )}
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full h-[260px] md:h-[400px] rounded-3xl overflow-hidden mb-8 border border-white/10 group shadow-2xl bg-surface-container">
        <img
          alt={proposalTitle}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
          src={proposal.image || proposal.profile_image_url || getHeroImage(proposal.category)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20"></div>
        <div className="absolute top-6 left-6">
          <span className="bg-primary-container/95 backdrop-blur-md text-white font-bold text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-primary-container/20 uppercase tracking-wider">
            {statusText} Proposal
          </span>
        </div>
      </div>

      {/* Main Info Box */}
      <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary-container/20 text-primary-container text-sm uppercase font-bold tracking-widest px-2.5 py-1 rounded border border-primary-container/20">
                {categoryText}
              </span>
              <UserHoverCard author={proposal.proposer || proposal.owner || proposal.user || proposal.author || { name: ownerHandle, username: ownerHandle, avatar: ownerAvatar }}>
                <div className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer">
                  {ownerAvatar ? (
                    <img src={ownerAvatar} alt={ownerHandle} className="w-5 h-5 rounded-full object-cover border border-primary/20 shrink-0" />
                  ) : (
                    <span className="material-symbols-outlined text-[16px] text-green-400">verified</span>
                  )}
                  <span className="hover:underline">Active Coordinator @{ownerHandle}</span>
                </div>
              </UserHoverCard>
            </div>

            <h2 data-testid="proposal-details-title" className="font-headline-lg text-3xl font-extrabold text-text-primary mb-4 leading-tight">
              {proposalTitle}
            </h2>
            <p className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed max-w-4xl">
              {proposal.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[200px]">
            {isOwner && (
              <button
                onClick={() => navigate(`/proposals/${id}/edit`)}
                data-testid="edit-proposal-action-btn"
                className="border border-primary-container/30 bg-primary-container/10 hover:bg-primary-container/20 text-primary-container px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Proposal
              </button>
            )}
            <button
              onClick={handleToggleInterest}
              className={`px-6 py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 border-none shadow-lg ${hasInterest
                ? 'bg-green-600 text-white shadow-green-600/10'
                : 'bg-primary-container text-white shadow-primary-container/10 hover:brightness-110'
                }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {hasInterest ? 'check_circle' : 'favorite'}
              </span>
              {hasInterest ? 'Backing Registered' : 'Back this Proposal'}
            </button>
            <button
              onClick={handleContactProposerClick}
              data-testid="contact-proposer-btn"
              disabled={!proposalHandle}
              className="border border-white/10 hover:border-primary-container/30 text-text-secondary hover:text-white px-6 py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">mail</span>
              Contact Proposer
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t border-white/5 pt-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-lg text-primary-container">payments</span>
              <span className="font-label-sm text-sm uppercase tracking-wider font-bold">Funding Goal</span>
            </div>
            <span className="text-xl font-bold text-text-primary">${fundingGoalVal.toLocaleString()}</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-lg text-text-secondary">location_on</span>
              <span className="font-label-sm text-sm uppercase tracking-wider font-bold">Target Area</span>
            </div>
            <span className="text-xl font-bold text-text-primary">{locationText}</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-lg text-primary-container">schedule</span>
              <span className="font-label-sm text-sm uppercase tracking-wider font-bold">Timeline</span>
            </div>
            <span className="text-xl font-bold text-text-primary">{daysLeftVal} Days Left</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-lg text-text-secondary">groups</span>
              <span className="font-label-sm text-sm uppercase tracking-wider font-bold">Backers</span>
            </div>
            <span className="text-xl font-bold text-text-primary">{interestCount} Members</span>
          </div>
        </div>
      </div>

      {/* Content Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Columns (Description, Business Model, Target Market, Discussions) */}
        <div className="md:col-span-2 space-y-6">

          {/* Detailed Strategy */}
          <div className="glass-card p-8 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="material-symbols-outlined text-primary-container">description</span>
              <h3 className="font-headline-md text-lg font-bold text-text-primary">Implementation Strategy</h3>
            </div>
            <p className="font-body-md text-lg text-text-secondary leading-relaxed whitespace-pre-line">
              {implementationStrategyText ||
                'This initiative is structured as a member-owned cooperative node. Under local charter guidelines, all physical capital assets (such as equipment, software, solar arrays, etc.) will be held under joint ownership to prevent corporate speculation. We project localized deployment within the current quarter.'}
            </p>
          </div>

          {/* Business Model */}
          <div className="glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-surface-crimson-low/10 to-surface-ink">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="material-symbols-outlined text-text-secondary">trending_up</span>
              <h3 className="font-headline-md text-lg font-bold text-text-primary">Cooperative Model</h3>
            </div>
            <p className="font-body-md text-lg text-text-secondary leading-relaxed mb-6 whitespace-pre-line">
              {cooperativeModelText ||
                'Revenues generated by this node will be split according to member hours and reinvested into local storage systems, avoiding any transaction tax by credit processors.'}
            </p>
            <div className="p-4 rounded-2xl bg-surface-container-high border border-white/5 max-w-sm">
              <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">Target Project Valuation</span>
              <div className="text-2xl font-extrabold text-primary-container mt-1">
                ${(fundingGoalVal * 1.5).toLocaleString()} <span className="text-sm text-text-secondary font-bold">est. utility</span>
              </div>
            </div>
          </div>

          {/* Discussion */}
          <div className="glass-card p-8 rounded-3xl border border-white/5" data-testid="proposal-discussion">
            <div className="flex items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary-container">forum</span>
                <h3 className="font-headline-md text-lg font-bold text-text-primary">Discussion</h3>
              </div>
              {!isDiscussionLocked && (
                <span
                  data-testid="proposal-comment-count"
                  className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-primary-container/10 border border-primary-container/20 text-primary-container"
                >
                  {comments.length} {comments.length === 1 ? 'Thread' : 'Threads'}
                </span>
              )}
            </div>

            {isDiscussionLocked ? (
              <div
                data-testid="discussion-locked-banner"
                className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 flex items-start gap-4 text-left"
              >
                <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-2xl shrink-0">lock</span>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider font-mono">
                    Discussion locked
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Discussion locked. This workspace conversation channel is restricted to verified residents of this state.
                  </p>
                  <p className="text-[11px] font-mono text-text-secondary/60 uppercase tracking-wider">
                    Channel state: {proposalState}
                    {normalizedUserState ? ` • Your state: ${normalizedUserState}` : ' • Your state is not verified'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Composer */}
                <form onSubmit={handlePostComment} className="flex gap-4 mb-8" data-testid="proposal-comment-form">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex-shrink-0 flex items-center justify-center text-sm font-bold border border-white/10 uppercase">
                    {user?.name ? user?.name[0] : (user?.username ? user?.username[0] : 'J')}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      data-testid="proposal-comment-input"
                      className="reply-composer-textarea w-full bg-surface-ink border border-white/10 rounded-xl p-4 text-lg text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none resize-none min-h-[80px]"
                      placeholder="Ask questions or share your thoughts on backing this initiative..."
                      rows="3"
                    ></textarea>

                    {commentImage && (
                      <div className="relative mt-3 w-40 aspect-video rounded-xl overflow-hidden border border-white/10">
                        <img src={commentImage} alt="Attachment preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCommentImage(null)}
                          className="absolute top-1 right-1 p-1 rounded-lg bg-black/70 text-white border-none cursor-pointer"
                          aria-label="Remove attachment"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <input
                          ref={commentFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          data-testid="proposal-comment-file-input"
                          onChange={(e) => readFileAsDataUrl(e.target.files?.[0], setCommentImage)}
                        />
                        <button
                          type="button"
                          onClick={() => commentFileInputRef.current?.click()}
                          data-testid="proposal-comment-attach-btn"
                          className="p-2 rounded-xl bg-transparent border border-white/10 text-text-secondary hover:text-primary-container hover:border-primary-container/30 transition-all cursor-pointer"
                          title="Attach an image"
                        >
                          <span className="material-symbols-outlined text-lg">image</span>
                        </button>
                      </div>
                      <button
                        type="submit"
                        data-testid="proposal-comment-submit"
                        disabled={isSubmitting || (!newComment.trim() && !commentImage)}
                        className="bg-primary-container text-white px-5 py-2 rounded-xl font-bold text-lg hover:brightness-110 active:scale-95 transition-all crimson-glow disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Threaded list */}
                <div className="space-y-4 discussion-session" data-testid="proposal-comment-thread">
                  {commentsLoading && (
                    <p className="text-sm font-mono uppercase tracking-wider text-text-secondary/60">
                      Loading discussion thread...
                    </p>
                  )}

                  {!commentsLoading && comments.length === 0 && (
                    <div className="p-6 rounded-xl border border-dashed border-white/10 text-center space-y-1">
                      <span className="material-symbols-outlined text-text-secondary/40 text-2xl">forum</span>
                      <p className="text-sm text-text-secondary font-mono uppercase tracking-wider">
                        No discussion yet. Start the conversation!
                      </p>
                    </div>
                  )}

                  {!commentsLoading && comments.map((comment) => {
                    const authorObj = comment.author || comment.user || {};
                    const authorName = authorObj.name || authorObj.username || 'Citizen';
                    const authorUsername = authorObj.username || authorName;
                    const authorAvatar = authorObj.avatar_url || authorObj.avatar;
                    const body = comment.content || comment.text || '';
                    const imageUrl = comment.image_url || comment.imageUrl;
                    const replyList = Array.isArray(comment.replies) ? comment.replies : [];
                    const isReplying = replyParentId === comment.id;

                    return (
                      <div
                        key={comment.id}
                        data-testid="proposal-comment-row"
                        className="comment-row p-4 rounded-xl bg-white/5 border border-white/5 space-y-3"
                      >
                        <div className="flex gap-4">
                          <UserHoverCard author={{ ...authorObj, name: authorName, username: authorUsername }}>
                            <img
                              alt={authorName}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/10 cursor-pointer"
                              src={authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            />
                          </UserHoverCard>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <UserHoverCard author={{ ...authorObj, name: authorName, username: authorUsername }}>
                                <span className="text-lg font-bold text-text-primary hover:underline cursor-pointer">
                                  {authorName}
                                </span>
                              </UserHoverCard>
                              <span className="text-xs font-mono text-text-secondary">@{String(authorUsername).replace(/^@/, '')}</span>
                              <span className="text-sm text-text-secondary opacity-65">
                                {comment.inserted_at ? new Date(comment.inserted_at).toLocaleString() : (comment.time || 'Just now')}
                              </span>
                            </div>

                            {body && (
                              <p className="text-lg text-text-secondary leading-relaxed whitespace-pre-line">{body}</p>
                            )}

                            {imageUrl && (
                              <div className="mt-3 rounded-xl overflow-hidden border border-white/10 max-w-sm">
                                <img src={imageUrl} alt="Comment attachment" className="w-full h-auto object-cover" />
                              </div>
                            )}

                            <div className="mt-2">
                              <button
                                type="button"
                                data-testid="proposal-comment-reply-btn"
                                onClick={() => {
                                  setReplyParentId(isReplying ? null : comment.id);
                                  setReplyText('');
                                  setReplyImage(null);
                                }}
                                className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary hover:text-primary-container bg-transparent border-none cursor-pointer"
                              >
                                {isReplying ? 'Cancel' : 'Reply'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {isReplying && (
                          <div className="ml-12 pl-4 border-l border-white/10 space-y-3">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              data-testid="proposal-reply-input"
                              className="reply-composer-textarea w-full bg-surface-ink border border-white/10 rounded-xl p-3 text-base text-text-primary focus:border-primary-container outline-none resize-none min-h-[64px]"
                              placeholder={`Reply to @${String(authorUsername).replace(/^@/, '')}...`}
                              rows="2"
                            ></textarea>
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <input
                                  ref={replyFileInputRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => readFileAsDataUrl(e.target.files?.[0], setReplyImage)}
                                />
                                <button
                                  type="button"
                                  onClick={() => replyFileInputRef.current?.click()}
                                  className="p-2 rounded-xl bg-transparent border border-white/10 text-text-secondary hover:text-primary-container transition-all cursor-pointer"
                                  title="Attach an image"
                                >
                                  <span className="material-symbols-outlined text-lg">image</span>
                                </button>
                                {replyImage && (
                                  <span className="text-[11px] font-mono text-primary-container ml-2 uppercase">Attached</span>
                                )}
                              </div>
                              <button
                                type="button"
                                data-testid="proposal-reply-submit"
                                disabled={isSubmitting || (!replyText.trim() && !replyImage)}
                                onClick={() => handlePostReply(comment.id)}
                                className="bg-primary-container text-white px-4 py-2 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Post Reply
                              </button>
                            </div>
                          </div>
                        )}

                        {replyList.length > 0 && (
                          <div className="ml-12 pl-4 border-l border-white/10 space-y-3" data-testid="proposal-comment-replies">
                            {replyList.map((reply) => {
                              const replyAuthor = reply.author || reply.user || {};
                              const replyName = replyAuthor.name || replyAuthor.username || 'Citizen';
                              const replyHandle = replyAuthor.username || replyName;
                              return (
                                <div key={reply.id} className="flex gap-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-white/5">
                                  <img
                                    alt={replyName}
                                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white/10"
                                    src={replyAuthor.avatar_url || replyAuthor.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-bold text-text-primary">{replyName}</span>
                                      <span className="text-[11px] font-mono text-text-secondary">@{String(replyHandle).replace(/^@/, '')}</span>
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                                      {reply.content || reply.text}
                                    </p>
                                    {(reply.image_url || reply.imageUrl) && (
                                      <div className="mt-2 rounded-lg overflow-hidden border border-white/10 max-w-xs">
                                        <img src={reply.image_url || reply.imageUrl} alt="Reply attachment" className="w-full h-auto object-cover" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column (Partners, Milestones, Location Map Preview) */}
        <div className="space-y-6">
          {/* Backing Needs */}
          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="material-symbols-outlined text-text-secondary">handshake</span>
              <h3 className="font-headline-md text-lg font-bold text-text-primary">Looking For</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lookingForTags.map((tag, idx) => (
                <span key={idx} className="bg-primary-container/20 text-primary border border-primary-container/30 px-3.5 py-1.5 rounded-full text-lg font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Project Milestones */}
          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="material-symbols-outlined text-primary-container">assignment_turned_in</span>
              <h3 className="font-headline-md text-lg font-bold text-text-primary">Project Milestones</h3>
            </div>
            <div className="space-y-3" data-testid="proposal-milestones-list">
              {projectMilestones.map((milestone, idx) => (
                <div key={`proposal-milestone-${idx}`} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5">
                  <span className="material-symbols-outlined text-green-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {idx === projectMilestones.length - 1 && milestoneLines.length > 0 ? 'radio_button_unchecked' : 'check_circle'}
                  </span>
                  <span className="text-lg text-text-secondary">{milestone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Styled Map Preview */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 h-64 flex flex-col justify-between overflow-hidden shadow-lg">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="material-symbols-outlined text-text-secondary">map</span>
              <h3 className="font-headline-md text-lg font-bold text-text-primary">District Bounds</h3>
            </div>
            <div className="flex-1 bg-surface-container-high rounded-2xl relative overflow-hidden">
              <img
                alt="District Map"
                className="w-full h-full object-cover grayscale opacity-80"
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=300&q=80"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-primary-container p-2.5 rounded-full shadow-lg shadow-primary-container/40 animate-bounce">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                    location_on
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
