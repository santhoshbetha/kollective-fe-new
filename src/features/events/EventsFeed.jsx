// src/features/events/EventsFeed.jsx (Part 1 of 2)
import React, { useState, useEffect } from 'react';
import { useEventsQuery, useToggleEventInterest } from './useEventsFeature';
import { useStore } from '../../store/useStore';
import { EventCard } from './EventCard';
import { EventDateBadge, AttendeeStack } from './EventComponents';
import {
    Filter,
    ChevronDown,
    Search,
    MapPin,
    Calendar,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Assuming you have an EventCard presentation sub-component imported or defined
function EventCardX({ event, onInterestToggle, isPending }) {
    return (
        <article className="bg-surface-container-low border border-white/5 p-6 rounded-2xl shadow-sm hover:bg-surface-container-high/40 transition-all flex flex-col justify-between gap-4">
            <EventDateBadge dateString={event.date} />
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-mono font-bold text-primary-container tracking-wider uppercase bg-primary-container/10 border border-primary-container/20 px-2.5 py-0.5 rounded-md">
                        {event.category} · {event.format}
                    </span>
                    <span className="text-xs text-text-secondary font-medium">{event.organizer}</span>
                </div>
                <h3 className="text-xl font-extrabold text-text-primary tracking-tight mt-1">{event.title}</h3>
                <p className="text-text-secondary text-body-md line-clamp-3 leading-relaxed">{event.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-label-sm text-text-secondary mt-1">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary-container">calendar_today</span>
                        <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 max-w-[180px]">
                        <span className="material-symbols-outlined text-[16px] text-primary-container">location_on</span>
                        <span className="truncate">{event.location}</span>
                    </div>
                </div>
                <AttendeeStack
                    attendees={event.organizers}
                    totalCount={event.organizerCount || event.organizers?.length || 0}
                />
                <button
                    onClick={() => onInterestToggle(event.id)}
                    disabled={isPending}
                    className={`px-4 py-2 rounded-xl text-label-sm font-bold transition-all active:scale-95 cursor-pointer ${event.isInterested
                        ? 'bg-primary-container text-white'
                        : 'bg-surface-container-highest border border-white/10 text-text-secondary hover:text-text-primary'
                        }`}
                >
                    {event.isInterested ? 'Interested ✓' : 'Star Event'}
                </button>
            </div>
        </article>
    );
}

export function EventsFeed({
    navigate
}) {
    const { events, eventsLoading } = useEventsQuery();
    const interestMutation = useToggleEventInterest();

    // 🎛️ Zustand Position Cache Synchronization
    const eventsScroll = useStore((state) => state.eventsScroll);
    const setEventsScroll = useStore((state) => state.setEventsScroll);

    const [toastMessage, setToastMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Restores position offset values once the dataset finishes mounting
    useEffect(() => {
        if (!eventsLoading && eventsScroll > 0) {
            const timer = setTimeout(() => {
                window.scrollTo(0, eventsScroll);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [eventsLoading]);

    // Track window view heights inside memory caches flatly
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
    const [currentYear, setCurrentYear] = useState(2026);
    const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)

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

    // Execute structural filtration matrix criteria on the query data cache
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
        <div className="">
            {/* 🥞 Toast Notice Banner Indicator Popup Overlay */}
            {toastMessage && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-surface-container-high 
                  border border-primary-container text-text-primary px-6 py-3.5 rounded-xl font-bold text-label-md 
                  shadow-2xl animate-in fade-in slide-in-from-bottom duration-200 z-[9999] crimson-glow">
                    {toastMessage}
                </div>
            )}

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
                                //showToast('Calendar view is coming soon!');
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
            <section className="mb-12 bg-surface-container border border-outline-variant rounded-card shadow-2xl overflow-hidden font-sans transition-all">
                {/* Accordion Trigger Header */}
                <button
                    type="button"
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none bg-transparent border-none text-left cursor-pointer hover:bg-surface-container-high/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-low rounded-card flex items-center justify-center border border-outline-variant/60 shrink-0">
                            <Filter className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-lg font-bold text-text-primary">Find Your Local Events</span>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-5 h-5 text-text-secondary transition-transform duration-300",
                            isSearchExpanded && "rotate-180"
                        )}
                    />
                </button>

                {/* Expandable Filter Panel */}
                <div
                    className={cn(
                        "transition-all duration-300 ease-out overflow-hidden px-6",
                        isSearchExpanded
                            ? "max-h-[2000px] opacity-100 pb-8 border-t border-outline-variant/40 pt-6"
                            : "max-h-0 opacity-0 py-0 border-t-0"
                    )}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Search Input */}
                        <div className="space-y-2 flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                                Search Events
                            </label>
                            <div className="relative group">
                                <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-primary" />
                                <input
                                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 text-xs sm:text-sm rounded-card pl-10 pr-9 py-3 text-text-primary placeholder:text-text-secondary/40 outline-none transition-all"
                                    placeholder="Find parties, meetups, conferences..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded-md bg-transparent border-none cursor-pointer"
                                        aria-label="Clear event search text"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-[11px] text-text-secondary/60 italic">
                                Search across event titles, descriptions, locations, and organizer names
                            </p>
                        </div>

                        {/* Location Input */}
                        <div className="space-y-2 flex flex-col">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                                Filter by Location
                            </label>
                            <div className="relative group">
                                <MapPin className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-primary" />
                                <input
                                    className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 text-xs sm:text-sm rounded-card pl-10 pr-9 py-3 text-text-primary placeholder:text-text-secondary/40 outline-none transition-all"
                                    placeholder="Search for a location..."
                                    type="text"
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                />
                                {locationQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setLocationQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded-md bg-transparent border-none cursor-pointer"
                                        aria-label="Clear location text"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Event Categories Tag Bar */}
                    <div className="mt-8">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-4">
                            Event Categories
                        </label>
                        <div className="flex flex-wrap items-center gap-2 w-full">
                            {categories.map((cat) => {
                                const isActive = categoryFilter === cat;
                                return (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={cn(
                                            "px-4 py-2 border rounded-full text-xs font-bold cursor-pointer transition-all shrink-0",
                                            isActive
                                                ? "bg-primary border-primary text-on-primary shadow-xs"
                                                : "bg-surface-container-low border-outline-variant text-text-secondary hover:border-primary hover:bg-surface-container-high hover:text-text-primary"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Options Row */}
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-outline-variant/30">

                        {/* Date Picker Button */}
                        <div className="flex items-center gap-6">
                            <button
                                type="button"
                                onClick={() => showToast('Date picker is coming soon!')}
                                className="bg-surface-container-low border border-outline-variant px-4 py-2 rounded-card text-xs font-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors text-text-primary cursor-pointer"
                            >
                                <Calendar className="w-4 h-4 text-text-secondary" />
                                <span>Pick dates</span>
                            </button>
                        </div>

                        {/* Event Format Selection Capsule */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Event Type
                            </label>
                            <div className="flex bg-surface-container-low p-1 rounded-card border border-outline-variant">
                                {['All Events', 'Online', 'In-Person'].map((opt) => {
                                    const isChecked = formatFilter === opt;
                                    return (
                                        <button
                                            type="button"
                                            key={opt}
                                            onClick={() => setFormatFilter(opt)}
                                            className={cn(
                                                "flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-card transition-all cursor-pointer border-none",
                                                isChecked
                                                    ? "bg-surface-container-high text-text-primary shadow-xs"
                                                    : "text-text-secondary hover:text-text-primary bg-transparent"
                                            )}
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
                        /* ⏰ Custom Sync Status Spinner Loader */
                        <div className="py-12 flex flex-col items-center gap-4">
                            <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                            <p className="text-text-secondary text-sm font-bold uppercase tracking-widest animate-pulse">
                                Loading events...
                            </p>
                        </div>
                    ) : filteredEvents?.length === 0 ? (
                        /* 🌌 Empty State Results Panel Layout */
                        <div className="bg-[#141414] border border-[#262626] rounded-[16px] p-12 text-center shadow-2xl">
                            <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
                                calendar_today
                            </span>
                            <h3 className="font-bold text-white mb-2 text-lg">No events found</h3>
                            <p className="text-text-secondary text-sm">
                                We couldn't find any events matching your selected criteria. Start your own experience!
                            </p>
                        </div>
                    ) : (
                        /* 🎨 Clean Finite Grid Stream Render Frame */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents?.map((event) => (
                                <EventCard
                                    key={event?.id}
                                    event={event}
                                    onInterestToggle={(id) => interestMutation.mutate(id)}
                                    isPending={interestMutation.isPending}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load More Button Array Panel */}
                    {filteredEvents && filteredEvents?.length > 0 && (
                        <div className="mt-16 flex justify-center">
                            <button
                                onClick={() => showToast('All adventures are loaded!')}
                                className="flex items-center gap-3 px-8 py-4 border border-[#262626] rounded-[8px] text-sm font-bold text-text-secondary hover:text-white hover:border-primary-container transition-all cursor-pointer bg-transparent active:scale-95"
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
        </div>
    );
}
