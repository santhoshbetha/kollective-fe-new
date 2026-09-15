import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessDetailsQuery } from '../features/businesses/useBusinessesFeature';

export const BusinessDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { business, businessLoading, businessError } = useBusinessDetailsQuery(id);

  const [activeSubTab, setActiveSubTab] = useState('about'); // 'about', 'services', 'reviews'

  if (businessLoading) {
    return (
      <div className="pt-24 px-4 text-center flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-t-primary-container border-white/10 animate-spin"></div>
        <p className="text-text-secondary text-lg font-bold uppercase tracking-widest">
          Loading business details...
        </p>
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="pt-24 px-4 text-center">
        <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
          error
        </span>
        <h2 className="text-xl font-bold text-white mb-2">Business Not Found</h2>
        <p className="text-text-secondary text-lg mb-6">
          The requested local business could not be found or has been unregistered.
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

  const renderStars = (rating = 5.0) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span
          key={i}
          className="material-symbols-outlined text-[16px] text-text-secondary"
          style={{ fontVariationSettings: `'FILL' ${i < floor ? 1 : 0}` }}
        >
          star
        </span>
      );
    }
    return stars;
  };

  const ownerHandle = business.owner_name || (typeof business.owner === 'string' ? business.owner : business.owner?.username) || 'community_member';
  const ownerAvatar = business.ownerAvatar || (typeof business.owner === 'object' ? business.owner?.avatar_url : null);
  const servicesList = Array.isArray(business.services) ? business.services : [];
  const reviewsCount = business.reviewsCount ?? business.reviews_count ?? 0;
  const ratingValue = business.rating ?? 5.0;
  const addressText = business.address || business.contact?.address || 'Local District';
  const phoneText = business.phone || business.contact?.phone || 'N/A';
  const emailText = business.email || business.contact?.email || 'N/A';
  const websiteText = business.website || business.contact?.website || 'N/A';
  const hoursText = business.hours || business.business_hours || '9:00 AM - 5:00 PM';
  const establishedYear = business.established || business.year_established || 'N/A';
  const employeesCount = business.employees || business.number_of_employees || '1-5';

  return (
    <div className="max-w-[1280px] mx-auto pb-20">
      {/* Back Link */}
      <button
        onClick={() => navigate('/businesses')}
        className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:-translate-x-1 transition-transform mb-6 bg-transparent border-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Businesses
      </button>

      {/* Hero Section */}
      <div className="relative w-full h-[260px] md:h-[400px] rounded-3xl overflow-hidden mb-8 border border-white/10 group shadow-2xl bg-surface-container">
        {business.image || business.profile_image_url ? (
          <img
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={business.image || business.profile_image_url}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-text-secondary">
            <span className="material-symbols-outlined text-7xl">storefront</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20"></div>
        <div className="absolute top-6 left-6">
          {business.verified && (
            <span className="bg-primary-container/95 backdrop-blur-md text-white font-bold text-[14px] px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-primary-container/20 uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              Verified Business
            </span>
          )}
        </div>
        <div className="absolute bottom-6 right-6 flex gap-3">
          <button
            onClick={() => alert('Added to bookmarks!')}
            className="bg-black/60 backdrop-blur-md hover:bg-black/80 p-3 rounded-full transition-all border border-white/10 shadow-lg text-white"
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
          </button>
          <button
            onClick={() => alert('Link copied to clipboard!')}
            className="bg-black/60 backdrop-blur-md hover:bg-black/80 p-3 rounded-full transition-all border border-white/10 shadow-lg text-white"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Info Card */}
          <div className="bg-surface-ink rounded-3xl p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h1 className="font-headline-lg text-3xl font-extrabold text-text-primary mb-2">
              {business.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {renderStars(ratingValue)}
                <span className="font-bold text-text-secondary text-lg ml-1">{ratingValue}</span>
                <span className="text-text-secondary text-sm">({reviewsCount} reviews)</span>
              </div>
              <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
              <div className="flex items-center gap-2 cursor-pointer group">
                {ownerAvatar ? (
                  <img
                    className="w-7 h-7 rounded-full object-cover border border-primary/20"
                    src={ownerAvatar}
                    alt="Owner"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-surface-variant flex items-center justify-center border border-primary/20 text-lg uppercase font-bold text-text-primary">
                    {ownerHandle ? ownerHandle[0] : 'O'}
                  </div>
                )}
                <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">
                  Owned by <span className="text-text-primary font-bold">@{ownerHandle}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-dark dark:text-white text-lg">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                <span>{addressText}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">call</span>
                <span>{phoneText}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
                <a className="hover:text-primary transition-colors" href={`mailto:${emailText}`}>
                  {emailText}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">language</span>
                <a className="hover:text-primary transition-colors" href={websiteText.startsWith('http') ? websiteText : `https://${websiteText}`} target="_blank" rel="noreferrer">
                  {websiteText}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                <span>{hoursText}</span>
              </div>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="border-b border-white/10 flex gap-8">
            <button
              onClick={() => setActiveSubTab('about')}
              className={`pb-4 font-bold text-lg bg-transparent border-none cursor-pointer transition-all ${activeSubTab === 'about'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-text-secondary hover:text-on-surface'
                }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveSubTab('services')}
              className={`pb-4 font-bold text-lg bg-transparent border-none cursor-pointer transition-all ${activeSubTab === 'services'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-text-secondary hover:text-on-surface'
                }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveSubTab('reviews')}
              className={`pb-4 font-bold text-lg bg-transparent border-none cursor-pointer transition-all ${activeSubTab === 'reviews'
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-text-secondary hover:text-on-surface'
                }`}
            >
              Reviews ({reviewsCount})
            </button>
          </div>

          {/* Tab Contents */}
          <div className="space-y-8 pt-2">
            {activeSubTab === 'about' && (
              <section className="space-y-6">
                <h3 className="font-headline-md text-xl font-bold text-text-primary">About this business</h3>
                <p className="font-body-lg text-lg text-dark dark:text-white leading-relaxed">
                  {business.description || 'Verified local business inside the Kollective Directory.'}
                </p>

                {/* Gallery Section */}
                <div className="pt-6">
                  <h3 className="font-headline-md text-xl font-bold text-text-primary mb-6">Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group relative rounded-2xl overflow-hidden aspect-square cursor-zoom-in bg-surface-container border border-white/5">
                      <img
                        alt="Workspace view"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
                      />
                      <div className="absolute inset-0 bg-primary-container/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl">zoom_in</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSubTab === 'services' && (
              <section className="space-y-4">
                <h3 className="font-headline-md text-xl font-bold text-text-primary">Services & Offerings</h3>
                {servicesList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicesList.map((svc, i) => (
                      <div key={i} className="bg-surface-container-low border border-white/5 p-4 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        <span className="text-lg font-bold text-text-primary">{svc}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-base">No specific services listed yet.</p>
                )}
              </section>
            )}

            {activeSubTab === 'reviews' && (
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-md text-xl font-bold text-text-primary">Customer Feedback</h3>
                  <button
                    onClick={() => alert('Review feature coming soon!')}
                    className="px-4 py-2 border border-primary-container/30 text-primary-container text-sm font-bold rounded-xl hover:bg-primary-container/10 transition-all"
                  >
                    Add Review
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="bg-surface-container-low border border-white/5 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-text-secondary">{renderStars(5)}</div>
                      <span className="text-md font-bold text-text-primary">Marcus Chen</span>
                      <span className="text-[14px] text-text-secondary ml-auto">1 week ago</span>
                    </div>
                    <p className="text-lg text-text-secondary leading-relaxed">
                      Excellent service! Highly recommended community vendor.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right Column: Stats & Bento Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <div className="bg-surface-ink border border-white/5 p-6 rounded-3xl flex flex-col gap-1 hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">calendar_today</span>
                <span className="text-[14px] text-text-secondary uppercase tracking-widest font-bold">Since</span>
              </div>
              <span className="text-3xl font-bold text-text-primary">{establishedYear}</span>
              <span className="text-sm text-text-secondary">Established Year</span>
            </div>

            <div className="bg-surface-ink border border-white/5 p-6 rounded-3xl flex flex-col gap-1 hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">groups</span>
                <span className="text-[14px] text-text-secondary uppercase tracking-widest font-bold">Team</span>
              </div>
              <span className="text-3xl font-bold text-text-primary">{employeesCount}</span>
              <span className="text-sm text-text-secondary">Employees</span>
            </div>

            <div className="bg-surface-ink border border-white/5 p-6 rounded-3xl flex flex-col gap-1 hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">reviews</span>
                <span className="text-[14px] text-text-secondary uppercase tracking-widest font-bold">Feedback</span>
              </div>
              <span className="text-3xl font-bold text-text-primary">{reviewsCount}</span>
              <span className="text-sm text-text-secondary">Total Reviews</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-surface-ink border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl">
            <h4 className="font-headline-md text-lg font-bold text-text-primary">Quick Actions</h4>
            <button
              onClick={() => alert(`Calling business: ${phoneText}`)}
              className="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary-container/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border-none"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              Contact Business
            </button>
            <button
              onClick={() => alert(`Opening chat channel with @${ownerHandle}`)}
              className="w-full bg-surface-variant border border-white/10 text-on-surface py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95 border-none cursor-pointer text-text-primary"
            >
              Send Message
            </button>
          </div>

          {/* Map Location Widget */}
          <div className="rounded-3xl overflow-hidden h-48 border border-white/5 relative group cursor-pointer shadow-lg">
            <img
              alt="Map Location"
              className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-750"
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
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
  );
};
