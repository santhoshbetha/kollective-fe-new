import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggleEventInterest, useEventsQuery } from '../features/events/useEventsFeature';
import { useStore } from '../store/useStore';

export const EventsPageX = () => {
  const navigate = useNavigate();
  const { events, eventsLoading } = useEventsQuery();
  const toggleEventInterest = useToggleEventInterest();

  const eventsScroll = useStore((state) => state.eventsScroll);
  const setEventsScroll = useStore((state) => state.setEventsScroll);

  useEffect(() => {
    if (!eventsLoading && eventsScroll > 0) {
      const timer = setTimeout(() => {
        window.scrollTo(0, eventsScroll);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [eventsLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (!eventsLoading) {
        setEventsScroll(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [eventsLoading, setEventsScroll]);

  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('All Events');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const categories = ['All', 'Politics', 'Technology', 'Education', 'Arts', 'Climate', 'Environment'];

  const trendingHashtags = [
    { tag: '#quantumcomputing', count: '12.4k posts', percent: '75%' },
    { tag: '#webdevelopment', count: '8.9k posts', percent: '50%' },
    { tag: '#artificialintelligence', count: '15.2k posts', percent: '100%' },
    { tag: '#climatechange', count: '6.7k posts', percent: '33%' }
  ];

  const popularCommunities = [
    { id: 'comm-tech', name: 'r/technology', members: '2.4M members', icon: 'memory' },
    { id: 'comm-prog', name: 'r/programming', members: '1.8M members', icon: 'code' },
    { id: 'comm-sci', name: 'r/science', members: '3.1M members', icon: 'science' }
  ];

  const handleCommunityJoin = (id) => {
    setJoinedCommunities((prev) =>
      prev.includes(id) ? prev?.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const filteredEvents = events?.filter((event) => {
    // Search query match
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Format filter match
    const matchesFormat =
      formatFilter === 'All Events' ||
      event.format.toLowerCase() === formatFilter.toLowerCase();

    // Category filter match
    const matchesCategory =
      categoryFilter === 'All' ||
      event.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesFormat && matchesCategory;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-0 text-scale-large">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Events Feed (Left Column) */}
        <div className="flex-1 max-w-[800px]">

          {/* Header section */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="font-display-lg text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
                Discover Events
              </h1>
              <p className="text-text-secondary mt-1 font-body-md text-lg font-semibold">
                Join the movement at upcoming gatherings, protests, and workshops.
              </p>
            </div>

            <button
              onClick={() => navigate('/events/create')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-container text-white rounded-full font-bold shadow-xl hover:shadow-primary-container/20 transition-all active:scale-95 text-sm md:text-sm cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-sm">event</span>
              Create Event
            </button>
          </div>

          {/* Filters card */}
          <div className="glass-panel p-4 rounded-2xl space-y-4 mb-8">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[22px]">
                search
              </span>
              <input
                className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/40 transition-all text-sm md:text-base placeholder:text-text-secondary/40"
                placeholder="Search for events by name, organizer, or location..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 justify-between">
              {/* Format selection */}
              <div className="flex bg-surface-container-low p-1 rounded-full border border-white/5 w-fit">
                {['All Events', 'Online', 'In-Person'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormatFilter(f)}
                    className={`px-5 py-1.5 rounded-full font-bold text-sm transition-all cursor-pointer ${formatFilter === f
                      ? 'bg-primary-container text-white shadow-md'
                      : 'text-text-secondary hover:text-text-primary'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Categories list */}
              <div className="flex flex-wrap gap-2 items-center">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all border ${categoryFilter === cat
                      ? 'bg-primary-container/20 text-primary-container border-primary-container/30'
                      : 'bg-surface-container-high text-text-secondary border-white/5 hover:bg-surface-bright'
                      }`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Events Card Feed */}
          <div className="space-y-6">
            {eventsLoading ? (
              <div className="py-12 flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
                  Loading events list...
                </p>
              </div>
            ) : filteredEvents?.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center border border-white/5">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
                  calendar_today
                </span>
                <h3 className="font-bold text-text-primary mb-2 text-lg">No events found</h3>
                <p className="text-text-secondary text-sm">
                  We couldn't find any events matching your selected criteria. Start your own experience!
                </p>
              </div>
            ) : (
              filteredEvents?.map((event) => (
                <div
                  key={event.id}
                  className="glass-card rounded-3xl overflow-hidden crimson-gradient-glow hover:shadow-2xl transition-all group border border-white/5 flex flex-col md:flex-row"
                >
                  <div
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="relative md:w-5/12 h-56 md:h-auto overflow-hidden cursor-pointer flex-shrink-0"
                  >
                    <img
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      src={event.image}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-primary-container text-white text-sm uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-lg">
                        {event.format}
                      </span>
                      <span className="bg-black/60 backdrop-blur-md text-white text-sm uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-white/10">
                        {event.date}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h2
                          onClick={() => navigate(`/events/${event.id}`)}
                          className="font-headline-md text-xl md:text-2xl font-extrabold text-text-primary group-hover:text-primary-container transition-colors leading-tight cursor-pointer"
                        >
                          {event.title}
                        </h2>
                        <button
                          onClick={() => showToast(`Sharing link copied for ${event.title}`)}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer text-text-secondary bg-transparent border-none flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-base">share</span>
                        </button>
                      </div>

                      <p className="text-text-primary/80 text-sm md:text-lg line-clamp-2 mb-5 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-3 text-text-secondary">
                          <span className="material-symbols-outlined text-primary-container text-base md:text-lg">
                            calendar_today
                          </span>
                          <span className="text-sm md:text-base font-semibold">{event.displayDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-text-secondary font-semibold">
                          <span className="material-symbols-outlined text-primary-container text-base md:text-lg">
                            location_on
                          </span>
                          <span className="text-sm md:text-base truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gold-muted/20 border border-gold-muted/40 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-gold-muted text-sm">
                              shield
                            </span>
                          </div>
                          <span className="text-sm md:text-base text-text-secondary">
                            Organized by <strong className="text-text-primary font-medium">{event.organizer}</strong> • <span className="text-primary-container font-semibold">{event.category}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-surface-ink bg-gray-800"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-surface-ink bg-gray-700"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-surface-ink bg-primary-container flex items-center justify-center text-sm font-bold text-white">
                          +{event.attendeesCount}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleEventInterest(event.id)}
                        className={`flex items-center gap-2 px-5 py-2 border rounded-full text-sm md:text-sm font-bold hover:bg-primary-container hover:text-white transition-all cursor-pointer ${event.isInterested
                          ? 'bg-primary-container text-white border-primary-container'
                          : 'border-primary-container text-primary-container bg-transparent'
                          }`}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: event.isInterested ? "'FILL' 1" : "'FILL' 0" }}>
                          favorite
                        </span>
                        Interested
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <aside className="w-full lg:w-80 space-y-6 shrink-0 lg:sticky lg:top-20 h-fit">

          {/* Trending Hashtags */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 mb-6 text-primary-container">
              <span className="material-symbols-outlined font-bold">trending_up</span>
              <h3 className="font-bold uppercase tracking-widest text-[15px] md:text-md">
                Trending Hashtags
              </h3>
            </div>
            <div className="space-y-6">
              {trendingHashtags.map((hash) => (
                <div key={hash.tag} className="group cursor-pointer">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm md:text-lg font-bold text-text-primary group-hover:text-primary-container transition-colors">
                      {hash.tag}
                    </span>
                    <span className="text-[16px] text-text-secondary font-medium">
                      {hash.count}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full"
                      style={{ width: hash.percent }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Communities */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 mb-6 text-gold-muted">
              <span className="material-symbols-outlined font-bold">groups</span>
              <h3 className="font-bold uppercase tracking-widest text-[15px] md:text-md">
                Popular Communities
              </h3>
            </div>
            <div className="space-y-4">
              {popularCommunities.map((comm) => {
                const isJoined = joinedCommunities.includes(comm.id);
                return (
                  <div key={comm.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center border border-primary-container/20">
                        <span className="material-symbols-outlined text-primary-container text-base">
                          {comm.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm md:text-lg font-bold text-text-primary">
                          {comm.name}
                        </h4>
                        <p className="text-[16px] text-text-secondary">{comm.members}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCommunityJoin(comm.id)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors cursor-pointer ${isJoined
                        ? 'bg-primary-container text-white border-primary-container'
                        : 'bg-surface-container-high border-white/10 hover:bg-white/10 text-text-primary'
                        }`}
                    >
                      {isJoined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Premium Spotlight Ad */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-primary-container to-[#690000] border border-white/10 shadow-2xl">
            <div className="relative z-10 flex flex-col gap-4">
              <h3 className="text-white font-bold text-base md:text-xl leading-tight">
                Elevate Your Presence
              </h3>
              <p className="text-white/80 text-sm md:text-md leading-relaxed">
                Join Kollective Premium to host unlimited events and get verified status.
              </p>
              <button
                onClick={() => setIsPremiumOpen(true)}
                className="w-full py-3 bg-white text-primary-container font-black rounded-xl text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
              >
                Get Started
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 pointer-events-none">
              <span className="material-symbols-outlined text-[100px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                stars
              </span>
            </div>
          </div>

        </aside>
      </div>

      {/* Premium Spotlight Modal */}
      {isPremiumOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface-ink border border-white/10 rounded-2xl p-8 max-w-sm w-full relative crimson-glow animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsPremiumOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex flex-col gap-4 text-center">
              <span className="material-symbols-outlined text-text-secondary text-5xl">stars</span>
              <h4 className="font-headline-lg text-lg font-bold text-white">Kollective Premium</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                You are about to unlock elite features! Premium subscriptions are currently in private invitation beta. We will alert you when registration opens.
              </p>
              <button
                onClick={() => setIsPremiumOpen(false)}
                className="mt-2 w-full py-3 bg-primary-container text-white font-bold rounded-xl hover:brightness-110 transition-all text-sm md:text-sm cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-surface-ink text-[#F4F4F4] border border-primary-container/30 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="material-symbols-outlined text-primary-container text-sm">info</span>
          <span className="text-sm font-semibold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
