// src/features/events/EventsFeed.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useEventsQuery, useToggleEventInterest, useFilterEvents } from './useEventsFeature';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { EventCard } from '../../components/events/EventCard';
import { getDisplayLocation } from '../../utils/eventUtils';
import { Filter, ChevronDown, Search, MapPin, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as DayCalendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Virtuoso } from 'react-virtuoso';

export function EventsFeed({ navigate }) {
    const { events, eventsLoading } = useEventsQuery();
    const interestMutation = useToggleEventInterest();
    const filterEventsMutation = useFilterEvents();

    // 🗺️ Location & Settings Selectors
    const userState = useStore((state) => state.userState);
    const streetAddress = useStore((state) => state.streetAddress);
    const currentUser = useAuthStore((state) => state.user);

    const hasAddressOrCoords = Boolean((streetAddress && streetAddress.trim()) || currentUser?.street_address || currentUser?.latitude);
    const hasState = Boolean((userState && userState.trim()) || currentUser?.state || currentUser?.origin_state);
    const canAccessLocalizedFeatures = hasAddressOrCoords || hasState;

    // 🎛️ Filter & Search Control States
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDistance, setSelectedDistance] = useState('');
    const [filteredEventsData, setFilteredEventsData] = useState(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [formatFilter, setFormatFilter] = useState('All Events');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [currentYear, setCurrentYear] = useState(2026);
    const [currentMonth, setCurrentMonth] = useState(6); // July

    const DISTANCE_OPTIONS = [
        { label: '5 miles', value: '5' },
        { label: '10 miles', value: '10' },
        { label: '25 miles', value: '25' },
        { label: '40 miles', value: '40' },
        { label: '100 miles', value: '100' },
    ];

    const categories = [
        'All', 'Music', 'Business & professional', 'Food & drink', 'Community & culture',
        'Performing & visual arts', 'Film, media, & entertainment', 'Fitness & Wellness',
        'Technology', 'Travel & outdoor', 'Charity & causes', 'Religion & spirituality',
        'Family & education', 'Seasonal & holiday'
    ];

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

    const handleApplyFilter = (newDate, newDistance) => {
        const dateStr = newDate ? format(newDate, 'yyyy-MM-dd') : null;
        const distVal = hasAddressOrCoords ? (newDistance !== undefined ? newDistance : selectedDistance) : null;
        const stateVal = (!hasAddressOrCoords && hasState) ? (userState || currentUser?.state || currentUser?.origin_state) : null;

        if (!dateStr && !distVal && !stateVal) {
            setFilteredEventsData(null);
            return;
        }

        filterEventsMutation.mutate({
            date: dateStr,
            distance: distVal,
            state: stateVal,
            latitude: currentUser?.latitude,
            longitude: currentUser?.longitude
        }, {
            onSuccess: (data) => {
                const list = Array.isArray(data) ? data : (data?.events || data?.data || []);
                setFilteredEventsData(list);
            }
        });
    };

    const handleClearFilters = () => {
        setSelectedDate(null);
        setSelectedDistance('');
        setFilteredEventsData(null);
    };

    // 🚀 PERFORMANCE OPTIMIZATION: Memoize filtration process to eliminate lagging frames
    const filteredEvents = useMemo(() => {
        const activeEventsList = Array.isArray(filteredEventsData) ? filteredEventsData : events;
        if (!activeEventsList) return [];

        return activeEventsList.filter((event) => {
            const locStr = getDisplayLocation(event?.location, event);

            const matchesSearch = !searchQuery ||
                (event?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event?.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(event?.organizer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (locStr && locStr.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesLocation = !locationQuery || (locStr && locStr.toLowerCase().includes(locationQuery.toLowerCase()));

            const matchesFormat = formatFilter === 'All Events' ||
                String(event?.format || event?.participation_format || '').toLowerCase() === formatFilter.toLowerCase();

            const matchesCategory = categoryFilter === 'All' ||
                String(event?.category || '').toLowerCase() === categoryFilter.toLowerCase();

            return matchesSearch && matchesLocation && matchesFormat && matchesCategory;
        });
    }, [events, filteredEventsData, searchQuery, locationQuery, formatFilter, categoryFilter]);

    const getDaysInMonth = (year, month) => {
        const date = new Date(year, month, 1);
        const days = [];
        const firstDayIndex = date.getDay();
        const prevMonthLastDate = new Date(year, month, 0).getDate();

        for (let i = firstDayIndex - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDate - i, isCurrentMonth: false, month: month === 0 ? 11 : month - 1, year: month === 0 ? year - 1 : year });
        }
        const lastDate = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDate; i++) {
            days.push({ day: i, isCurrentMonth: true, month, year });
        }
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({ day: i, isCurrentMonth: false, month: month === 11 ? 0 : month + 1, year: month === 11 ? year + 1 : year });
        }
        return days;
    };

    const getEventsForDay = (dayObj) => {
        const { day, isCurrentMonth, month, year } = dayObj;
        if (!isCurrentMonth) return [];

        return filteredEvents.filter((event) => {
            try {
                const parsedDate = new Date(event?.date);
                if (!isNaN(parsedDate.getTime())) {
                    return parsedDate.getFullYear() === year && parsedDate.getMonth() === month && parsedDate.getDate() === day;
                }
            } catch (err) { }
            return false;
        });
    };

    const [toastMessage, setToastMessage] = useState('');
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    if (!canAccessLocalizedFeatures) {
        return (
            <div className="max-w-[700px] mx-auto my-16 p-8 bg-[#141414] border border-[#262626] rounded-2xl text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mx-auto text-primary-container">
                    <span className="material-symbols-outlined text-3xl">location_off</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">Events Access Restricted</h2>
                    <p className="text-text-secondary text-sm">Please provide your State or Street Address in settings to unlock local event discovery.</p>
                </div>
                <button type="button" onClick={() => navigate('/settings?tab=index')} className="px-6 py-3 bg-primary-container text-white font-bold rounded-xl cursor-pointer border-none">
                    Go to Settings
                </button>
            </div>
        );
    }
    return (
        <div className="p-4 bg-[#090d12]X">
            {/* 🥞 Toast Notice Banner Indicator Popup Overlay */}
            {toastMessage && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-surface-container-high 
                  border border-primary-container text-text-primary px-6 py-3.5 rounded-xl font-bold text-sm 
                  shadow-2xl animate-in fade-in slide-in-from-bottom duration-200 z-[9999] crimson-glow">
                    {toastMessage}
                </div>
            )}

            {/* Title Area Row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4 select-none">
                <div>
                    <h1 className="text-4xl font-extrabold flex items-center gap-3 text-[#F4F4F4] font-headline-lg">
                        Discover Events <span className="text-2xl">🎉</span>
                    </h1>
                    <p className="text-[#A19B95] mt-2 font-semibold text-lg">
                        Find your next adventure, connect with your community.
                    </p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    {/* View Switcher Controls */}
                    <div className="bg-[#141414] p-1 rounded-xl flex border border-[#262626]">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 border-none cursor-pointer",
                                viewMode === 'grid' ? "bg-primary-container text-white" : "text-gray-500 hover:text-white bg-transparent"
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">grid_view</span>
                            Grid
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('calendar')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 border-none cursor-pointer",
                                viewMode === 'calendar' ? "bg-primary-container text-white" : "text-gray-500 hover:text-white bg-transparent"
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            Calendar
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/calendar')}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-surface-container-low border border-white/10 hover:bg-surface-container-high text-text-primary rounded-lg font-bold transition-all active:scale-95 text-xs uppercase tracking-widest cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-sm text-primary-container">event_available</span>
                        My Schedule
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/events/create')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-container hover:bg-red-700 text-white rounded-lg font-bold transition-all active:scale-95 text-xs uppercase tracking-widest cursor-pointer border-none"
                    >
                        <span className="material-symbols-outlined text-sm">event</span>
                        Create Event
                    </button>
                </div>
            </div>

            {/* Collapsible Search/Filter Card Accordion Container */}
            <section className="mb-12 bg-surface-container border border-white/5 rounded-2xl shadow-2xl overflow-hidden font-sans bg-[#141414]">
                <button
                    type="button"
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none bg-transparent border-none text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center border border-white/5 shrink-0">
                            <Filter className="w-5 h-5 text-primary-container" />
                        </div>
                        <span className="text-lg font-bold text-text-primary">Find Your Local Events</span>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-text-secondary transition-transform duration-300", isSearchExpanded && "rotate-180")} />
                </button>
                {/* Expandable Inner Filter Content Box Grid */}
                <div className={cn("transition-all duration-300 ease-out overflow-hidden px-6", isSearchExpanded ? "max-h-[2000px] opacity-100 pb-8 border-t border-white/5 pt-6" : "max-h-0 opacity-0 py-0 border-t-0")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Search Input Box */}
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-bold text-text-secondary uppercase tracking-widest font-mono select-none">Search Events</label>
                            <div className="relative group">
                                <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary-container" />
                                <input
                                    className="w-full bg-[#0d1117] border border-white/10 focus:border-primary-container text-sm rounded-xl pl-10 pr-9 py-3 text-text-primary placeholder:text-text-secondary/30 outline-none transition-all"
                                    placeholder="Find parties, meetups, conferences..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded bg-transparent border-none cursor-pointer">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Location Context Filter Input Box */}
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-bold text-text-secondary uppercase tracking-widest font-mono select-none">Filter by Location</label>
                            <div className="relative group">
                                <MapPin className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary-container" />
                                <input
                                    className="w-full bg-[#0d1117] border border-white/10 focus:border-primary-container text-sm rounded-xl pl-10 pr-9 py-3 text-text-primary placeholder:text-text-secondary/30 outline-none transition-all"
                                    placeholder="Search for a location..."
                                    type="text"
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                />
                                {locationQuery && (
                                    <button type="button" onClick={() => setLocationQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded bg-transparent border-none cursor-pointer">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Taxonomy Category Tag Badges Selection Node */}
                    <div className="mt-8 select-none">
                        <label className="text-sm font-bold text-text-secondary uppercase tracking-widest block mb-4 font-mono">Event Categories</label>
                        <div className="flex flex-wrap items-center gap-2 w-full">
                            {categories.map((cat) => {
                                const isCatActive = categoryFilter === cat;
                                return (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={cn(
                                            "px-4 py-2 border rounded-full text-xs font-bold cursor-pointer transition-all shrink-0",
                                            isCatActive
                                                ? "bg-primary-container border-primary-container text-white crimson-glow"
                                                : "bg-[#0d1117] border-white/5 text-text-secondary hover:border-primary-container hover:text-text-primary"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date Picker Popovers & Distance Dropdown Filters Controls Area */}
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/5">
                        <div className="flex flex-wrap items-center gap-4 select-none">
                            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "bg-[#0d1117] border border-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/5 transition-colors cursor-pointer text-text-primary",
                                            selectedDate && "border-primary-container text-primary-container bg-primary-container/10"
                                        )}
                                    >
                                        <CalendarIcon className="w-4 h-4 text-text-secondary" />
                                        <span>{selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Pick dates'}</span>
                                        {selectedDate && (
                                            <X
                                                className="w-3.5 h-3.5 ml-1 text-primary-container hover:text-white cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); setSelectedDate(null); handleApplyFilter(null, selectedDistance); }}
                                            />
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl z-50" align="start">
                                    <DayCalendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => { setSelectedDate(d); setIsPopoverOpen(false); handleApplyFilter(d, selectedDistance); }}
                                        defaultMonth={selectedDate || new Date()}
                                    />
                                </PopoverContent>
                            </Popover>

                            {hasAddressOrCoords ? (
                                <div className="flex items-center gap-2 bg-[#0d1117] border border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-text-primary">
                                    <MapPin className="w-4 h-4 text-primary-container" />
                                    <span className="text-text-secondary font-mono">Distance:</span>
                                    <select
                                        value={selectedDistance}
                                        onChange={(e) => { const val = e.target.value; setSelectedDistance(val); handleApplyFilter(selectedDate, val); }}
                                        className="bg-transparent text-text-primary font-bold focus:outline-none cursor-pointer font-mono outline-none border-none"
                                    >
                                        <option value="" className="bg-[#18181b] text-text-primary">All Distances</option>
                                        {DISTANCE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value} className="bg-[#18181b] text-text-primary">{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : hasState ? (
                                <div className="flex items-center gap-1.5 bg-primary-container/5 border border-primary-container/10 px-3 py-2 rounded-xl text-xs font-bold text-primary-container font-mono">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Regional Feed: {userState || currentUser?.state || currentUser?.origin_state}</span>
                                </div>
                            ) : null}

                            {(selectedDate || selectedDistance) && (
                                <button type="button" onClick={handleClearFilters} className="text-xs text-text-secondary hover:text-white underline font-bold bg-transparent border-none cursor-pointer font-mono">Reset filters</button>
                            )}
                        </div>
                        {/* Event Format Selection Capsule */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto select-none font-mono">
                            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">
                                Event Type
                            </label>
                            <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/5">
                                {['All Events', 'Online', 'In-Person'].map((opt) => {
                                    const isChecked = formatFilter === opt;
                                    return (
                                        <button
                                            type="button"
                                            key={opt}
                                            onClick={() => setFormatFilter(opt)}
                                            className={cn(
                                                "flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none outline-none",
                                                isChecked
                                                    ? "bg-white/5 text-text-primary shadow-sm"
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
            {/* Events Grid Stream / Calendar Switching Section */}
            {viewMode === 'grid' && (
                <>
                    {eventsLoading ? (
                        /* ⏰ Custom Sync Status Spinner Loader */
                        <div className="py-12 flex flex-col items-center gap-4 select-none font-mono text-xs">
                            <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
                            <p className="text-text-secondary uppercase tracking-widest animate-pulse"> LOADING_ADVENTURES...</p>
                        </div>
                    ) : filteredEvents?.length === 0 ? (
                        /* 🌌 Empty State Results Panel Layout */
                        <div className="bg-[#141414] border border-white/5 rounded-2xl p-12 text-center shadow-2xl font-mono text-xs text-text-secondary/40">
                            NO_EVENTS_FOUND_MATCHING_CRITERIA
                        </div>
                    ) : (
                        /* 🎨 RESPONSIVE GRID PLATFORM: Integrates Virtuoso List with custom grid items mapping */
                        <div className="w-full relative">
                            <Virtuoso
                                useWindowScroll
                                data={filteredEvents}
                                computeItemKey={(index, event) => event?.id || index}
                                initialItemCount={Math.min(filteredEvents.length, 6)}
                                increaseViewportBy={400}
                                overscan={200}

                                // 🚀 THE GRID FIX: Reconfigure Virtuoso markup tags into an un-padded wrap row
                                components={{
                                    List: React.forwardRef(({ children, style, ...props }, ref) => (
                                        <div
                                            {...props}
                                            ref={ref}
                                            style={{ ...style }}
                                            // 🎯 Tailor 1 column on mobile, 2 columns on tablets/MD, and 3 columns on large desktop viewports
                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full"
                                        >
                                            {children}
                                        </div>
                                    )),
                                    Item: React.forwardRef(({ children, ...props }, ref) => (
                                        <div {...props} ref={ref} className="h-full flex flex-col">
                                            {children}
                                        </div>
                                    ))
                                }}

                                itemContent={(index, event) => (
                                    <div className="h-full animate-in fade-in duration-150">
                                        <EventCard
                                            event={event}
                                            onInterestToggle={(id) => {
                                                if (filteredEventsData) {
                                                    setFilteredEventsData((prev) =>
                                                        prev?.map((item) => {
                                                            if (item.id === id) {
                                                                const nextInterested = !item.isInterested;
                                                                return {
                                                                    ...item,
                                                                    isInterested: nextInterested,
                                                                    interestedCount: nextInterested
                                                                        ? (item.interestedCount || 0) + 1
                                                                        : Math.max(0, (item.interestedCount || 1) - 1)
                                                                };
                                                            }
                                                            return item;
                                                        })
                                                    );
                                                }
                                                interestMutation.mutate(id);
                                            }}
                                            isPending={interestMutation.isPending}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    )}
                    {/* Load More Button Array Panel Shortcut Mock */}
                    {filteredEvents && filteredEvents?.length > 0 && (
                        <div className="mt-16 flex justify-center select-none font-mono">
                            <button
                                type="button"
                                onClick={() => showToast('All adventures are loaded!')}
                                className="flex items-center gap-3 px-8 py-4 border border-[#262626] rounded-xl text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-white hover:border-primary-container transition-all cursor-pointer bg-transparent active:scale-95"
                            >
                                Load More Adventures
                            </button>
                        </div>
                    )}
                </>
            )}
            {viewMode === 'calendar' && (
                /* 📅 Localized Interactive Month Calendar Display Grid Matrix */
                <section className="bg-[#141414] rounded-2xl border border-white/5 shadow-2xl overflow-hidden animate-in fade-in duration-300">

                    {/* Calendar Navigation Panel Header */}
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between select-none">
                        <div className="flex items-center gap-6">
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{displayMonthName} {currentYear}</h2>
                            <button
                                type="button"
                                onClick={handleToday}
                                className="px-4 py-1.5 border border-white/10 bg-transparent rounded-full text-xs font-bold font-mono text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                            >
                                Today
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-primary-container hover:bg-primary-container/5 transition-all text-text-secondary hover:text-white bg-transparent cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">chevron_left</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-primary-container hover:bg-primary-container/5 transition-all text-text-secondary hover:text-white bg-transparent cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Days Name Row Headers Array */}
                    <div className="grid grid-cols-7 bg-white/[0.005] border-b border-white/5 select-none font-mono">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} className="py-4 text-center text-[10px] text-[#A19B95] uppercase tracking-widest font-black">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Main Calendar Month Sub-Blocks Grid Array */}
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
                                    className={cn(
                                        "min-h-[140px] p-3 border-r border-b border-white/5 transition-all duration-300 relative flex flex-col justify-between",
                                        dayObj.isCurrentMonth ? "text-white" : "text-gray-600 opacity-20 font-bold",
                                        isToday ? "bg-primary-container/[0.03] ring-1 ring-primary-container/20" : "hover:bg-white/[0.01]"
                                    )}
                                >
                                    <span className={cn("text-xs font-mono font-bold select-none", isToday ? "text-primary-container" : "")}>
                                        {dayObj.day}
                                    </span>

                                    <div className="mt-2 flex-1 space-y-1 overflow-hidden">
                                        {dayObj.isCurrentMonth && dayEvents?.map((event) => {
                                            const isOnline = String(event?.format || event?.participation_format).toLowerCase() === 'online';
                                            return (
                                                <span
                                                    key={event?.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/events/${event?.id}`);
                                                    }}
                                                    className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded truncate block font-bold cursor-pointer transition-all hover:brightness-110 font-mono tracking-wide border",
                                                        isOnline
                                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                    )}
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

                    {/* Calendar Footer Color Guide Legends */}
                    <div className="bg-[#111] px-8 py-4 border-t border-white/5 flex items-center gap-8 select-none font-mono text-[10px] text-[#A19B95] font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"></span>
                            <span>Online / Live Events</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]"></span>
                            <span>In-Person Events</span>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
