import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessesQuery } from '../features/businesses/useBusinessesFeature';
import { useProposalsQuery } from '../features/businesses/useProposalsFeature';

export const LocalBusinessesPage = () => {
  const navigate = useNavigate();
  const { businesses: businessesData, businessesLoading } = useBusinessesQuery();
  const { proposals: proposalsData, proposalsLoading } = useProposalsQuery();

  const [activeTab, setActiveTab] = useState('businesses'); // 'businesses' or 'proposals'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [businessPage, setBusinessPage] = useState(1);
  const [proposalPage, setProposalPage] = useState(1);
  const itemsPerPage = 2; // Show 2 items per page for visual pagination checks

  // Reset pagination on category or query changes
  useEffect(() => {
    setBusinessPage(1);
    setProposalPage(1);
  }, [activeCategory, searchQuery]);

  const categories = [
    'All', 'Technology', 'Food & Beverage', 'Health & Fitness',
    'Retail', 'Services', 'Manufacturing'
  ];

  // Filtering Logic
  const filteredBusinesses = businessesData.filter(biz => {
    const matchesCategory = activeCategory === 'All' || biz.category === activeCategory;
    const matchesSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredProposals = proposalsData.filter(prop => {
    const matchesCategory = activeCategory === 'All' ||
      prop.category.toLowerCase().includes(activeCategory.split(' ')[0].toLowerCase());
    const matchesSearch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Paginated Slices
  const totalBusinessPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const totalProposalPages = Math.ceil(filteredProposals.length / itemsPerPage);

  const paginatedBusinesses = filteredBusinesses.slice(
    (businessPage - 1) * itemsPerPage,
    businessPage * itemsPerPage
  );

  const paginatedProposals = filteredProposals.slice(
    (proposalPage - 1) * itemsPerPage,
    proposalPage * itemsPerPage
  );

  const renderPagination = (currentPage, totalPages, onPageChange) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-8 pb-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-high border border-white/5 text-text-secondary hover:text-white disabled:opacity-40 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        {Array.from({ length: totalPages }, (_, idx) => {
          const page = idx + 1;
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all border ${isActive
                ? 'bg-primary-container text-white border-primary-container crimson-glow font-bold'
                : 'bg-surface-container-high border-white/5 text-text-secondary hover:text-white'
                }`}
            >
              {page}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-high border border-white/5 text-text-secondary hover:text-white disabled:opacity-40 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span
          key={i}
          className="material-symbols-outlined text-[16px]"
          style={{ fontVariationSettings: `'FILL' ${i < floor ? 1 : 0}` }}
        >
          star
        </span>
      );
    }
    return stars;
  };

  const BusinessSkeleton = () => (
    <div className="glass-card rounded-[24px] overflow-hidden flex flex-col lg:flex-row border border-white/5 animate-pulse">
      <div className="lg:w-[420px] h-[300px] lg:h-auto bg-surface-container-highest/20"></div>
      <div className="flex-1 p-8 space-y-4">
        <div className="h-6 bg-surface-container-highest/20 rounded w-1/3"></div>
        <div className="h-4 bg-surface-container-highest/10 rounded w-full"></div>
        <div className="h-4 bg-surface-container-highest/10 rounded w-5/6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="h-10 bg-surface-container-highest/15 rounded-xl w-full"></div>
          <div className="h-10 bg-surface-container-highest/15 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  );

  const ProposalSkeleton = () => (
    <div className="glass-card p-6 rounded-2xl border border-white/5 animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-12 h-12 bg-surface-container-highest/20 rounded-xl"></div>
        <div className="h-6 bg-surface-container-highest/20 rounded w-16"></div>
      </div>
      <div className="h-6 bg-surface-container-highest/20 rounded w-2/3"></div>
      <div className="h-4 bg-surface-container-highest/10 rounded w-full"></div>
      <div className="space-y-2 pt-4">
        <div className="h-2 bg-surface-container-highest/20 rounded w-full"></div>
        <div className="h-3 bg-surface-container-highest/15 rounded w-1/4"></div>
      </div>
    </div>
  );

  const handleCardClick = (bizId, e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/businesses/${bizId}`);
  };

  return (
    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 pb-20">
      {/* Left Column: Businesses / Proposals Content */}
      <div className="flex-1 flex flex-col gap-6 max-w-3xl">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-headline-lg text-3xl font-extrabold text-text-primary mb-2">
            {activeTab === 'businesses' ? 'Local Businesses' : 'Business Proposals'}
          </h1>
          <p className="font-body-md text-xl font-semibold text-text-secondary">
            {activeTab === 'businesses'
              ? 'Discover and support professional services and shops in your local community.'
              : 'Review and back innovative community-led ventures designed to build local wealth.'}
          </p>
        </div>

        {/* Controls & Filters */}
        <div className="mb-12 space-y-6">
          {/* Search & Action Toggles */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex p-1 bg-surface-container-low rounded-xl border border-white/5 w-full lg:w-auto">
              <button
                onClick={() => {
                  setActiveTab('businesses');
                  setActiveCategory('All');
                }}
                className={`px-6 py-2 rounded-lg font-label-md text-sm font-bold transition-all flex-1 lg:flex-none ${activeTab === 'businesses'
                  ? 'bg-surface-container-high text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-white'
                  }`}
              >
                Businesses
              </button>
              <button
                onClick={() => {
                  setActiveTab('proposals');
                  setActiveCategory('All');
                }}
                className={`px-6 py-2 rounded-lg font-label-md text-sm font-bold transition-all flex-1 lg:flex-none ${activeTab === 'proposals'
                  ? 'bg-surface-container-high text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-white'
                  }`}
              >
                Business Proposals
              </button>
            </div>

            {activeTab === 'businesses' ? (
              <button
                onClick={() => navigate('/businesses/register')}
                className="flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all w-full lg:w-auto justify-center crimson-glow"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Post Business
              </button>
            ) : (
              <button
                onClick={() => navigate('/businesses/propose')}
                className="flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all w-full lg:w-auto justify-center crimson-glow"
              >
                <span className="material-symbols-outlined text-[18px]">add_business</span>
                Post Proposal
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[22px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-ink border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-text-secondary/50 text-text-primary text-lg"
              placeholder={activeTab === 'businesses' ? 'Search businesses...' : 'Search proposals...'}
              type="text"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isCatActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${isCatActive
                    ? 'bg-primary-container text-white border-primary-container crimson-glow'
                    : 'bg-surface-container-high border-white/5 hover:bg-surface-variant text-text-secondary hover:text-text-primary'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Rendering */}
        {activeTab === 'businesses' ? (
          <div className="space-y-8 pb-20">
            {businessesLoading ? (
              <>
                <BusinessSkeleton />
                <BusinessSkeleton />
              </>
            ) : filteredBusinesses.length === 0 ? (
              <div className="glass-card rounded-[24px] p-12 text-center border border-white/5">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">storefront</span>
                <h3 className="font-bold text-text-primary mb-2 text-lg">No businesses found</h3>
                <p className="text-text-secondary text-lg">Be the first to list a local business in this category!</p>
              </div>
            ) : (
              paginatedBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  onClick={(e) => handleCardClick(biz.id, e)}
                  className="glass-card rounded-[24px] overflow-hidden flex flex-col lg:flex-row shadow-2xl transition-all border border-white/5 hover:border-primary-container/20 group cursor-pointer"
                >
                  {/* Image Section */}
                  <div className="lg:w-[280px] h-[260px] lg:h-auto relative bg-surface-container-high overflow-hidden flex-shrink-0">
                    {biz.image ? (
                      <img
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                        src={biz.image}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-text-secondary">
                        <span className="material-symbols-outlined text-5xl">storefront</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {biz.verified && (
                        <span className="bg-green-500/20 text-green-400 backdrop-blur-md px-3 py-1 rounded-full text-[14px] font-bold border border-green-500/30 flex items-center gap-1 uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                          Verified
                        </span>
                      )}
                      <span className={`backdrop-blur-md px-3 py-1 rounded-full text-[14px] font-bold border flex items-center gap-1 uppercase tracking-wider ${biz.open
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                        {biz.open ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Open Now
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Closed
                          </>
                        )}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                      <div className="flex text-text-secondary gap-0.5">
                        {renderStars(biz.rating)}
                      </div>
                      <span className="text-white font-bold text-sm">{biz.rating}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="font-headline-md text-2xl font-bold text-text-primary mb-2 group-hover:text-primary-container transition-colors">
                            {biz.name}
                          </h2>
                          <p className="font-body-md text-lg text-text-secondary leading-relaxed">
                            {biz.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        <div className="flex items-center gap-2 text-text-secondary text-lg">
                          <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                          <span className="truncate">{biz.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-lg">
                          <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                          <span>{biz.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-lg">
                          <span className="material-symbols-outlined text-primary text-[18px]">language</span>
                          <a
                            href={`https://${biz.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline text-primary"
                          >
                            {biz.website}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-lg">
                          <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                          <span>{biz.hours}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        {biz.ownerAvatar ? (
                          <div className="relative w-10 h-10 rounded-full border-2 border-primary-container p-[1px]">
                            <img
                              alt="Owner"
                              className="w-full h-full rounded-full object-cover"
                              src={biz.ownerAvatar}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-sm text-white">
                            {biz.owner[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-on-surface">@{biz.owner}</p>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[12px] rounded-full border border-primary/20 uppercase font-extrabold tracking-wider">
                            {biz.category}
                          </span>
                        </div>
                        <div className="h-6 w-px bg-white/10 mx-1"></div>
                        <span className="text-[14px] text-text-secondary">{biz.reviewsCount} reviews</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => alert(`Sharing business: ${biz.name}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-text-primary text-sm font-bold hover:bg-white/5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">share</span>
                          Share
                        </button>
                        <button
                          onClick={() => alert(`Starting discussion with: @${biz.owner}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary-container/30 text-primary-container text-sm font-bold hover:bg-primary-container/10 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {filteredBusinesses.length > itemsPerPage && renderPagination(businessPage, totalBusinessPages, setBusinessPage)}
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proposalsLoading ? (
                <>
                  <ProposalSkeleton />
                  <ProposalSkeleton />
                  <ProposalSkeleton />
                </>
              ) : filteredProposals.length === 0 ? (
                <div className="col-span-full glass-card rounded-[24px] p-12 text-center border border-white/5">
                  <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">deck</span>
                  <h3 className="font-bold text-text-primary mb-2 text-lg">No proposals found</h3>
                  <p className="text-text-secondary text-lg">Be the first to draft a collective proposal in this category!</p>
                </div>
              ) : (
                paginatedProposals.map((prop) => {
                  const statusColors = prop.status === 'Hot'
                    ? 'bg-primary-container/20 text-primary border-primary-container/30'
                    : prop.status === 'Active'
                      ? 'bg-green-900/20 text-green-400 border-green-500/20'
                      : 'bg-surface-container-high text-on-surface-variant border-white/5';
                  return (
                    <div
                      key={prop.id}
                      onClick={() => navigate(`/proposals/${prop.id}`)}
                      className="glass-card border border-white/5 p-6 rounded-2xl group cursor-pointer transition-all hover:scale-[1.01] hover:border-primary-container/20 crimson-glow relative overflow-hidden flex flex-col justify-between min-h-[360px]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>

                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 bg-surface-container-highest/30 rounded-xl flex items-center justify-center text-primary border border-white/5">
                            <span className="material-symbols-outlined">
                              {prop.category === 'Infrastructure' ? 'deck' : prop.category === 'Agriculture' ? 'agriculture' : 'electric_bolt'}
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[14px] font-bold border uppercase tracking-wider ${statusColors}`}>
                            {prop.status}
                          </span>
                        </div>

                        <h3 className="font-headline-md text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                          {prop.title}
                        </h3>

                        <p className="font-body-md text-lg text-on-surface-variant mb-6 line-clamp-3">
                          {prop.description}
                        </p>
                      </div>

                      <div>
                        {/* Progress Bar */}
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-[14px] font-bold">
                            <span className="text-on-surface-variant">Funding Goal</span>
                            <span className="text-text-primary">${prop.fundingGoal.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-primary-container" style={{ width: `${prop.percent}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[14px] font-bold">
                            <span className="text-primary">{prop.percent}% funded</span>
                            <span className="text-on-surface-variant">{prop.daysLeft} days left</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                          <div>
                            <p className="text-on-surface-variant text-[14px] uppercase font-bold tracking-wider opacity-60">Investment</p>
                            <p className="text-text-primary font-bold text-sm">${prop.minInvest} - ${prop.maxInvest >= 1000 ? `${prop.maxInvest / 1000}k` : prop.maxInvest}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-on-surface-variant text-[14px] uppercase font-bold tracking-wider opacity-60">Participants</p>
                            <p className="text-text-primary font-bold text-sm">{prop.participants}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {filteredProposals.length > itemsPerPage && renderPagination(proposalPage, totalProposalPages, setProposalPage)}
          </div>
        )}
      </div>

      {/* Right Column: Local Ads Sidebar */}
      <aside className="w-full lg:w-80 flex flex-col gap-6">
        <div className="glass-panel rounded-xl p-6 bg-surface-container-low border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-text-primary uppercase tracking-wider">Local Classifieds</h4>
            <button
              onClick={() => alert('Feature coming soon: Post your local ad on the bulletin board!')}
              className="text-primary hover:text-primary-container text-[15px] font-bold"
            >
              + Post Ad
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-text-secondary text-[12px] font-bold uppercase tracking-widest">For Sale</span>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[14px] rounded-full font-bold">$4/doz</span>
              </div>
              <h5 className="text-text-primary font-bold text-base group-hover:text-primary-container transition-colors mb-1">Co-op Fresh Eggs</h5>
              <p className="text-text-secondary text-lg leading-relaxed mb-2">Fresh organic eggs from our cage-free backyard coop. Pick up on Elm Street.</p>
              <p className="text-sm text-text-secondary font-mono">Posted by @organic_farm</p>
            </div>

            <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-text-secondary text-[12px] font-bold uppercase tracking-widest">Services</span>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[14px] rounded-full font-bold">$25/hr</span>
              </div>
              <h5 className="text-text-primary font-bold text-base group-hover:text-primary-container transition-colors mb-1">Math & Science Tutor</h5>
              <p className="text-text-secondary text-lg leading-relaxed mb-2">High school & early college tutoring. 5 years experience. First session free.</p>
              <p className="text-sm text-text-secondary font-mono">Posted by @edu_support</p>
            </div>

            <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-text-secondary text-[12px] font-bold uppercase tracking-widest">Handmade</span>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[14px] rounded-full font-bold">$15+</span>
              </div>
              <h5 className="text-text-primary font-bold text-base group-hover:text-primary-container transition-colors mb-1">Ceramic Mugs & Bowls</h5>
              <p className="text-text-secondary text-lg leading-relaxed mb-2">Locally spun stoneware mugs and nesting bowls. Dishwasher and microwave safe.</p>
              <p className="text-sm text-text-secondary font-mono">Posted by @mud_and_fire</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
