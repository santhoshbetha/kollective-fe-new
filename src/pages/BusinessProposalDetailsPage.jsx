import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useProposalsQuery, useVoteOnProposal } from '../features/businesses/useProposalsFeature';

export const BusinessProposalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { proposals, proposalsLoading, proposalsError } = useProposalsQuery();

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c-1',
      author: 'investor_jane',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      text: "This sounds like a great opportunity! I'm interested in learning more about the financial projections.",
      time: '2 days ago',
      verified: false
    },
    {
      id: 'c-2',
      author: 'BusinessConsultCo',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
      text: "We've worked on similar projects. Would love to discuss potential partnership opportunities. DM us!",
      time: '1 day ago',
      verified: true
    }
  ]);

  const [hasInterest, setHasInterest] = useState(false);
  const [interestCount, setInterestCount] = useState(23);

  // Find proposal in mock database
  const proposal = proposals.find(p => p.id === id);

  if (proposalsLoading) {
    return (
      <div className="pt-24 px-4 text-center flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-t-primary-container border-white/10 animate-spin"></div>
        <p className="text-text-secondary text-lg font-bold uppercase tracking-widest">
          Loading proposal details...
        </p>
      </div>
    );
  }

  if (!proposal) {
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
        return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80';
      case 'Agriculture':
        return 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80';
      case 'Technology':
        return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
      case 'Infrastructure':
      default:
        return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
    }
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: `c-${Date.now()}`,
      author: user.handle ? user.handle.replace('@', '') : 'julian_thorne',
      avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      text: newComment.trim(),
      time: 'Just now',
      verified: false
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
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

  return (
    <div className="max-w-[1280px] mx-auto pb-20">
      {/* Back Link */}
      <div className="sticky top-[80px] z-30 bg-background/90 backdrop-blur-md py-3 mb-6 border-b dark:border-white/5 border-black/5 flex items-center justify-between">
        <button
          onClick={() => navigate('/businesses')}
          className="flex items-center gap-2 text-primary-container hover:brightness-110 transition-all font-bold text-sm bg-transparent border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Businesses
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full h-[260px] md:h-[400px] rounded-3xl overflow-hidden mb-8 border border-white/10 group shadow-2xl bg-surface-container">
        <img
          alt={proposal.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
          src={getHeroImage(proposal.category)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20"></div>
        <div className="absolute top-6 left-6">
          <span className="bg-primary-container/95 backdrop-blur-md text-white font-bold text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-primary-container/20 uppercase tracking-wider">
            {proposal.status} Proposal
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
                {proposal.category}
              </span>
              <div className="flex items-center gap-1 text-text-secondary text-sm">
                <span className="material-symbols-outlined text-[16px] text-green-400">verified</span>
                <span>Active Coordinator</span>
              </div>
            </div>

            <h2 className="font-headline-lg text-3xl font-extrabold text-text-primary mb-4 leading-tight">
              {proposal.title}
            </h2>
            <p className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed max-w-4xl">
              {proposal.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[200px]">
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
              onClick={() => alert(`Starting channel with Proposer for: ${proposal.title}`)}
              className="border border-white/10 hover:border-primary-container/30 text-text-secondary hover:text-white px-6 py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 bg-transparent"
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
            <span className="text-xl font-bold text-text-primary">${proposal.fundingGoal.toLocaleString()}</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-lg text-text-secondary">location_on</span>
              <span className="font-label-sm text-sm uppercase tracking-wider font-bold">Target Area</span>
            </div>
            <span className="text-xl font-bold text-text-primary">{proposal.location || 'District 4'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-lg text-primary-container">schedule</span>
              <span className="font-label-sm text-sm uppercase tracking-wider font-bold">Timeline</span>
            </div>
            <span className="text-xl font-bold text-text-primary">{proposal.daysLeft} Days Left</span>
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
            <p className="font-body-md text-lg text-text-secondary leading-relaxed space-y-4">
              This initiative is structured as a member-owned cooperative node. Under local charter guidelines, all physical capital assets (such as equipment, software, solar arrays, etc.) will be held under joint ownership to prevent corporate speculation. We project localized deployment within the current quarter.
            </p>
          </div>

          {/* Business Model */}
          <div className="glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-surface-crimson-low/10 to-surface-ink">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="material-symbols-outlined text-text-secondary">trending_up</span>
              <h3 className="font-headline-md text-lg font-bold text-text-primary">Cooperative Model</h3>
            </div>
            <p className="font-body-md text-lg text-text-secondary leading-relaxed mb-6">
              Revenues generated by this node will be split according to member hours and reinvested into local storage systems, avoiding any transaction tax by credit processors.
            </p>
            <div className="p-4 rounded-2xl bg-surface-container-high border border-white/5 max-w-sm">
              <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">Target Project Valuation</span>
              <div className="text-2xl font-extrabold text-primary-container mt-1">
                ${(proposal.fundingGoal * 1.5).toLocaleString()} <span className="text-sm text-text-secondary font-bold">est. utility</span>
              </div>
            </div>
          </div>

          {/* Discussion */}
          <div className="glass-card p-8 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2.5 mb-8">
              <span className="material-symbols-outlined text-primary-container">forum</span>
              <h3 className="font-headline-md text-lg font-bold text-text-primary">Discussion</h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="flex gap-4 mb-8">
              <div className="w-9 h-9 rounded-full bg-surface-container flex-shrink-0 flex items-center justify-center text-sm font-bold border border-white/10 uppercase">
                {user?.name ? user?.name[0] : 'J'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl p-4 text-lg text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none resize-none min-h-[80px]"
                  placeholder="Ask questions or share your thoughts on backing this initiative..."
                  rows="3"
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary-container text-white px-5 py-2 rounded-xl font-bold text-lg hover:brightness-110 active:scale-95 transition-all crimson-glow"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <img
                    alt={comment.author}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/10"
                    src={comment.avatar}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-text-primary">@{comment.author}</span>
                      {comment.verified && (
                        <span className="material-symbols-outlined text-[14px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      )}
                      <span className="text-sm text-text-secondary opacity-65">{comment.time}</span>
                    </div>
                    <p className="text-lg text-text-secondary leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
              <span className="bg-primary-container/20 text-primary border border-primary-container/30 px-3.5 py-1.5 rounded-full text-lg font-bold">
                Co-founder
              </span>
              <span className="bg-primary-container/20 text-primary border border-primary-container/30 px-3.5 py-1.5 rounded-full text-lg font-bold">
                Tech Lead
              </span>
              <span className="bg-primary-container/20 text-primary border border-primary-container/30 px-3.5 py-1.5 rounded-full text-lg font-bold">
                Operations
              </span>
            </div>
          </div>

          {/* Project Milestones */}
          <div className="glass-card p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="material-symbols-outlined text-primary-container">assignment_turned_in</span>
              <h3 className="font-headline-md text-lg font-bold text-text-primary">Project Milestones</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5">
                <span className="material-symbols-outlined text-green-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span className="text-lg text-text-secondary">Q1 2026: Finalize specs</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5">
                <span className="material-symbols-outlined text-green-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span className="text-lg text-text-secondary">Q2 2026: Community approvals</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5">
                <span className="material-symbols-outlined text-text-secondary text-[18px]">
                  radio_button_unchecked
                </span>
                <span className="text-lg text-text-secondary">Q3 2026: Beta deployment</span>
              </div>
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
