import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggleEventInterest, useEventsQuery } from '../features/events/useEventsFeature';
import { useStore } from '../store/useStore';
import { EventCard } from '../features/events/EventCard';

export const EventsPageO = () => {
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
  const [locationQuery, setLocationQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('All Events');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [toastMessage, setToastMessage] = useState('');
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const displayMonthName = monthNames[currentMonth];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];

    const firstDayIndex = date.getDay();
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDate - i,
        isCurrentMonth: false,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year
      });
    }

    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        month: month,
        year: year
      });
    }

    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year
      });
    }

    return days;
  };

  const getEventsForDay = (dayObj) => {
    const { day, isCurrentMonth, month, year } = dayObj;
    if (!isCurrentMonth) return [];

    return filteredEvents?.filter((event) => {
      try {
        const parsedDate = new Date(event?.date);
        if (!isNaN(parsedDate.getTime())) {
          if (
            parsedDate.getFullYear() === year &&
            parsedDate.getMonth() === month &&
            parsedDate.getDate() === day
          ) {
            return true;
          }
        }
      } catch (err) { }

      try {
        const parsedDate = new Date(event?.date);
        if (!isNaN(parsedDate.getTime())) {
          if (year === 2026 && month === 6) {
            return parsedDate.getDate() === day;
          }
        }
      } catch (e) { }

      return false;
    }) || [];
  };


  const categories = [
    'All',
    'Music',
    'Business & professional',
    'Food & drink',
    'Community & culture',
    'Performing & visual arts',
    'Film, media, & entertainment',
    'Health & wellness',
    'Sports & fitness',
    'Science & technology',
    'Travel & outdoor',
    'Charity & causes',
    'Religion & spirituality',
    'Family & education',
    'Seasonal & holiday'
  ];

  const filteredEvents = events?.filter((event) => {
    // Search query match
    const matchesSearch =
      event?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event?.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event?.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event?.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Location query match
    const matchesLocation =
      !locationQuery ||
      event?.location.toLowerCase().includes(locationQuery.toLowerCase());

    // Format filter match
    const matchesFormat =
      formatFilter === 'All Events' ||
      event?.format.toLowerCase() === formatFilter.toLowerCase();

    // Category filter match
    const matchesCategory =
      categoryFilter === 'All' ||
      event?.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesLocation && matchesFormat && matchesCategory;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-0 text-scale-large text-white">
      {/* Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3 text-[#F4F4F4] font-headline-lg">
            Discover Events <span className="text-2xl">🎉</span>
          </h1>
          <p className="text-[#A19B95] mt-2 font-semibold">Find your next adventure, connect with your community.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Switcher */}
          <div className="bg-[#141414] p-1 rounded-[8px] flex border border-[#262626]" data-purpose="view-switcher">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-1.5 text-xs font-bold rounded-[8px] flex items-center gap-2 border-none cursor-pointer ${viewMode === 'grid' ? 'bg-[#a10836] text-white' : 'text-gray-500 hover:text-white bg-transparent'
                }`}
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              Grid
            </button>
            <button
              onClick={() => {
                setViewMode('calendar');
                showToast('Calendar view is coming soon!');
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-[8px] flex items-center gap-2 border-none cursor-pointer ${viewMode === 'calendar' ? 'bg-[#a10836] text-white' : 'text-gray-500 hover:text-white bg-transparent'
                }`}
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              Calendar
            </button>
            <button
              onClick={() => {
                setViewMode('map');
                showToast('Map view is coming soon!');
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-[8px] flex items-center gap-2 border-none cursor-pointer ${viewMode === 'map' ? 'bg-[#a10836] text-white' : 'text-gray-500 hover:text-white bg-transparent'
                }`}
            >
              <span className="material-symbols-outlined text-sm">map</span>
              Map
            </button>
          </div>

          <button
            onClick={() => navigate('/events/create')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#a10836] hover:bg-red-700 text-white rounded-[8px] font-bold transition-all active:scale-95 text-xs uppercase tracking-widest cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-sm">event</span>
            Create Event
          </button>
        </div>
      </div>

      {/* Collapsible Search/Filter Card */}
      <section className="mb-12 bg-[#141414] border border-[#262626] rounded-[8px] shadow-2xl">
        <button
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          className="w-full flex items-center justify-between px-6 py-4 focus:outline-none bg-transparent border-none text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-[8px] flex items-center justify-center border border-zinc-800">
              <span className="material-symbols-outlined text-[#a10836] text-xl">filter_list</span>
            </div>
            <span className="text-lg font-bold text-white">Find Your Local Events</span>
          </div>
          <span
            className={`material-symbols-outlined text-gray-500 transition-transform duration-300 ${isSearchExpanded ? 'rotate-180' : ''
              }`}
          >
            expand_more
          </span>
        </button>

        <div className={`transition-all duration-300 ease-out overflow-hidden px-6 ${isSearchExpanded ? 'max-h-[2000px] opacity-100 pb-8 border-t border-[#262626]/50 pt-6' : 'max-h-0 opacity-0'
          }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Input */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-[#A19B95] uppercase tracking-widest">Search Events</label>
              <div className="relative">
                <input
                  className="w-full bg-[#0a0a0a] border border-[#262626] focus:border-[#a10836] focus:ring-1 focus:ring-[#a10836] text-sm rounded-[8px] pl-10 py-3 text-white placeholder:text-gray-600 outline-none"
                  placeholder="Find parties, meetups, conferences..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="material-symbols-outlined text-gray-500 absolute left-3 top-3 text-[20px]">search</span>
              </div>
              <p className="text-[11px] text-[#A19B95] italic">Search across event titles, descriptions, locations, and organizer names</p>
            </div>

            {/* Location Input */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-[#A19B95] uppercase tracking-widest">Filter by Location</label>
              <div className="relative">
                <input
                  className="w-full bg-[#0a0a0a] border border-[#262626] focus:border-[#a10836] focus:ring-1 focus:ring-[#a10836] text-sm rounded-[8px] pl-10 py-3 text-white placeholder:text-gray-600 outline-none"
                  placeholder="Search for a location..."
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
                <span className="material-symbols-outlined text-gray-500 absolute left-3 top-3 text-[20px]">location_on</span>
              </div>
            </div>
          </div>

          {/* Event Categories Tags */}
          <div className="mt-8">
            <label className="text-xs font-bold text-[#A19B95] uppercase tracking-widest block mb-4">Event Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = categoryFilter === cat;
                return (
                  <span
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`category-tag px-4 py-2 border rounded-full text-xs font-bold cursor-pointer transition-all ${isActive
                      ? 'bg-[#a10836] border-[#a10836] text-white'
                      : 'bg-[#0a0a0a] border-[#262626] text-[#A19B95] hover:border-[#a10836] hover:bg-zinc-900'
                      }`}
                  >
                    {cat}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => showToast('Date picker is coming soon!')}
                className="bg-[#0a0a0a] border border-[#262626] px-4 py-2 rounded-[8px] text-xs flex items-center gap-2 hover:bg-zinc-900 transition-colors text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-gray-500">calendar_today</span>
                Pick dates
              </button>
            </div>

            {/* Event Format */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#A19B95] uppercase tracking-widest">Event Type</label>
              <div className="flex bg-[#0a0a0a] p-1 rounded-[8px] border border-[#262626]">
                {['All Events', 'Online', 'In-Person'].map((opt) => {
                  const isChecked = formatFilter === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setFormatFilter(opt)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-[8px] transition-all cursor-pointer border-none ${isChecked
                        ? 'bg-zinc-800 text-white'
                        : 'text-[#A19B95] hover:text-white bg-transparent'
                        }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Stream / Calendar Section */}
      {viewMode === 'grid' && (
        <>
          {eventsLoading ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-t-[#a10836] border-white/10 animate-spin"></div>
              <p className="text-text-secondary text-sm font-bold uppercase tracking-widest animate-pulse">
                Loading events...
              </p>
            </div>
          ) : filteredEvents?.length === 0 ? (
            <div className="bg-[#141414] border border-[#262626] rounded-[8px] p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-[#A19B95] mb-4">
                calendar_today
              </span>
              <h3 className="font-bold text-white mb-2 text-lg">No events found</h3>
              <p className="text-[#A19B95] text-sm">
                We couldn't find any events matching your selected criteria. Start your own experience!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents?.map((event) => (
                <EventCard key={event?.id} event={event} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {filteredEvents && filteredEvents?.length > 0 && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => showToast('All adventures are loaded!')}
                className="flex items-center gap-3 px-8 py-4 border border-[#262626] rounded-[8px] text-sm font-bold text-[#A19B95] hover:text-white hover:border-[#a10836] transition-all cursor-pointer bg-transparent"
              >
                Load More Adventures
              </button>
            </div>
          )}
        </>
      )}

      {viewMode === 'calendar' && (
        <section className="bg-[#1A1616] rounded-2xl border border-white/5 shadow-2xl overflow-hidden animate-in fade-in duration-300">
          {/* Calendar Navigation */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-bold text-white">{displayMonthName} {currentYear}</h2>
              <button
                onClick={handleToday}
                className="px-4 py-1.5 border border-white/10 bg-transparent rounded-full text-xs font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Today
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-[#a10836]/50 hover:bg-[#a10836]/10 transition-all group bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-text-secondary group-hover:text-[#a10836]">chevron_left</span>
              </button>
              <button
                onClick={handleNextMonth}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-[#a10836]/50 hover:bg-[#a10836]/10 transition-all group bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-text-secondary group-hover:text-[#a10836]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Days Headers */}
          <div className="grid grid-cols-7 bg-[#1c1b1b] border-b border-white/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-4 text-center text-xs text-[#A19B95] uppercase tracking-widest font-bold">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-l border-t border-white/5">
            {getDaysInMonth(currentYear, currentMonth).map((dayObj, index) => {
              const dayEvents = getEventsForDay(dayObj);
              const isToday =
                dayObj.day === new Date().getDate() &&
                dayObj.month === new Date().getMonth() &&
                dayObj.year === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`min-h-[140px] p-4 border-r border-b border-white/5 transition-all duration-300 relative ${dayObj.isCurrentMonth ? 'text-white' : 'text-gray-600 opacity-30 font-bold'
                    } ${isToday ? 'ring-2 ring-[#a10836]/20 bg-[#a10836]/5' : 'hover:bg-white/[0.02]'
                    }`}
                >
                  <span className={`font-bold ${isToday ? 'text-[#a10836]' : ''}`}>
                    {dayObj.day}
                  </span>

                  <div className="mt-3 space-y-1">
                    {dayObj.isCurrentMonth && dayEvents?.map((event) => {
                      const isOnline = event?.format?.toLowerCase() === 'online';
                      return (
                        <span
                          key={event?.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event?.id}`);
                          }}
                          className={`text-[11px] px-1.5 py-0.5 rounded mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis block font-bold cursor-pointer transition-all hover:brightness-110 ${isOnline
                            ? 'bg-[#93000a]/30 text-white border border-[#93000a]/20'
                            : 'bg-[#0052f9]/30 text-[#b7c4ff] border border-[#0052f9]/20'
                            }`}
                          title={`${event?.time || ''} ${event?.title}`}
                        >
                          {event?.time ? `${event?.time} ` : ''}{event?.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Footer Legend */}
          <div className="bg-[#201f1f] px-8 py-4 border-t border-white/5 flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#93000a]"></span>
              <span className="text-xs text-[#A19B95] font-semibold">Online / Live events</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0052f9]"></span>
              <span className="text-xs text-[#A19B95] font-semibold">In-Person events</span>
            </div>
          </div>
        </section>
      )}


      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1A1616] text-[#F4F4F4] border border-primary-container/30 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="material-symbols-outlined text-primary-container text-sm">info</span>
          <span className="text-sm font-semibold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

