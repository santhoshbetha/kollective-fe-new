// src/features/events/EventsFeed.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useEventsQuery, useToggleEventInterest, useFilterEvents } from './useEventsFeature';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { EventCard } from '../../components/events/EventCard';
import { getDisplayLocation, isEventInState, normalizeState, getEventState } from '../../utils/eventUtils';
import { Filter, ChevronDown, Search, MapPin, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as DayCalendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { VirtuosoGrid } from 'react-virtuoso';

const DISTANCE_OPTIONS = [
    { label: '5 miles', value: '5' },
    { label: '10 miles', value: '10' },
    { label: '25 miles', value: '25' },
    { label: '40 miles', value: '40' },
    { label: '100 miles', value: '100' },
];

const EVENT_CATEGORIES = [
    'All', 'Music', 'Business & professional', 'Food & drink', 'Community & culture',
    'Performing & visual arts', 'Film, media, & entertainment', 'Fitness & Wellness',
    'Technology', 'Travel & outdoor', 'Charity & causes', 'Religion & spirituality',
    'Family & education', 'Seasonal & holiday'
];

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function EventsFeed({ navigate }) {
    const { events, eventsLoading } = useEventsQuery();
    const interestMutation = useToggleEventInterest();
    const filterEventsMutation = useFilterEvents();

    // 🗺️ Location & Settings Selectors
    const userState = useStore((state) => state.userState);
    const streetAddress = useStore((state) => state.streetAddress);
    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    const detectedUserState = (
        currentUser?.state?.trim() ||
        currentUser?.origin_state?.trim() ||
        currentUser?.political_location?.state?.trim() ||
        userState?.trim() ||
        (currentUser?.location ? getEventState({ location: currentUser.location }) : null) ||
        ''
    );

    const userLocationCoords = currentUser?.location && typeof currentUser.location === 'string'
        ? (() => {
            const match = currentUser.location.match(/POINT\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/i);
            return match ? { longitude: parseFloat(match[1]), latitude: parseFloat(match[2]) } : null;
        })()
        : null;

    const [browserCoords, setBrowserCoords] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (pos?.coords) {
                        setBrowserCoords({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude
                        });
                    }
                },
                () => {},
                { timeout: 5000 }
            );
        }
    }, []);

    const userLatitude = currentUser?.latitude ?? userLocationCoords?.latitude ?? browserCoords?.latitude;
    const userLongitude = currentUser?.longitude ?? userLocationCoords?.longitude ?? browserCoords?.longitude;

    const hasAddressOrCoords = Boolean(
        (streetAddress && streetAddress.trim()) ||
        currentUser?.street_address ||
        (userLatitude !== undefined && userLatitude !== null)
    );
    const hasState = Boolean(detectedUserState);
    const canAccessLocalizedFeatures = hasAddressOrCoords || hasState;

    const effectiveUserState = detectedUserState;
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const searchContainerRef = useRef(null);

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

    const categories = EVENT_CATEGORIES;
    const displayMonthName = MONTH_NAMES[currentMonth];

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
            latitude: userLatitude,
            longitude: userLongitude
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

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setIsSearchDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 🔍 Dropdown Quick-Results (like GlobalSearchBar, but strictly limited to user's geographical state)
    const dropdownSearchResults = useMemo(() => {
        if (!searchQuery || !searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase().trim();
        const activeEventsList = Array.isArray(events) ? events : [];

        return activeEventsList.filter((event) => {
            // 🚨 STRICT GEOGRAPHICAL BOUNDARY: Search should not show events outside user's state
            if (effectiveUserState && !isEventInState(event, effectiveUserState)) {
                return false;
            }

            const locStr = getDisplayLocation(event?.location, event) || '';
            const matchesTitle = (event?.title || '').toLowerCase().includes(query);
            const matchesDesc = (event?.description || '').toLowerCase().includes(query);
            const matchesOrg = String(event?.organizer || event?.organizerName || '').toLowerCase().includes(query);
            const matchesLoc = locStr.toLowerCase().includes(query);
            const matchesCategory = String(event?.category || '').toLowerCase().includes(query);
            const matchesTags = Array.isArray(event?.tags) && event.tags.some(t => String(t).toLowerCase().includes(query));

            return matchesTitle || matchesDesc || matchesOrg || matchesLoc || matchesCategory || matchesTags;
        }).slice(0, 8);
    }, [events, searchQuery, effectiveUserState]);

    // 🚀 PERFORMANCE OPTIMIZATION: Memoize filtration process to eliminate lagging frames
    const filteredEvents = useMemo(() => {
        const activeEventsList = Array.isArray(filteredEventsData) ? filteredEventsData : events;
        if (!activeEventsList) return [];
        const cleanQuery = searchQuery.toLowerCase().trim();
        const isOrg = activeAccount?.type === 'organization';

        return activeEventsList.filter((event) => {
            const locStr = getDisplayLocation(event?.location, event) || '';

            // 🏛️ CONTEXT-SCOPED EVENTS ISOLATION
            const titleLower = String(event?.title || '').toLowerCase();
            const descLower = String(event?.description || '').toLowerCase();
            const isPersonalEvent = (
                titleLower.includes('personal') ||
                descLower.includes('personal') ||
                event?.scope === 'personal' ||
                event?.is_personal === true ||
                event?.category === 'Personal'
            );

            if (isOrg) {
                // Personal-only events must be completely absent when organization context is active
                if (isPersonalEvent) {
                    return false;
                }
            }

            // 🎯 STRICT GEOGRAPHICAL BOUNDARY: Search should not show events outside user's state
            if (effectiveUserState && (cleanQuery || !hasAddressOrCoords)) {
                if (!isEventInState(event, effectiveUserState)) {
                    return false;
                }
            }

            const matchesSearch = !cleanQuery ||
                (event?.title || '').toLowerCase().includes(cleanQuery) ||
                (event?.description || '').toLowerCase().includes(cleanQuery) ||
                String(event?.organizer || event?.organizerName || '').toLowerCase().includes(cleanQuery) ||
                locStr.toLowerCase().includes(cleanQuery) ||
                String(event?.category || '').toLowerCase().includes(cleanQuery) ||
                (Array.isArray(event?.tags) && event.tags.some(t => String(t).toLowerCase().includes(cleanQuery)));

            const matchesLocation = !locationQuery || (locStr && locStr.toLowerCase().includes(locationQuery.toLowerCase()));

            const matchesFormat = formatFilter === 'All Events' ||
                String(event?.format || event?.participation_format || '').toLowerCase() === formatFilter.toLowerCase();

            const matchesCategory = categoryFilter === 'All' ||
                String(event?.category || '').toLowerCase() === categoryFilter.toLowerCase();

            return matchesSearch && matchesLocation && matchesFormat && matchesCategory;
        });
    }, [events, filteredEventsData, searchQuery, locationQuery, formatFilter, categoryFilter, effectiveUserState, hasAddressOrCoords, activeAccount]);

    const calendarDays = useMemo(() => {
        const date = new Date(currentYear, currentMonth, 1);
        const days = [];
        const firstDayIndex = date.getDay();
        const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();

        for (let i = firstDayIndex - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDate - i, isCurrentMonth: false, month: currentMonth === 0 ? 11 : currentMonth - 1, year: currentMonth === 0 ? currentYear - 1 : currentYear });
        }
        const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let i = 1; i <= lastDate; i++) {
            days.push({ day: i, isCurrentMonth: true, month: currentMonth, year: currentYear });
        }
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({ day: i, isCurrentMonth: false, month: currentMonth === 11 ? 0 : currentMonth + 1, year: currentMonth === 11 ? currentYear + 1 : currentYear });
        }
        return days;
    }, [currentYear, currentMonth]);

    const todayDate = useMemo(() => {
        const now = new Date();
        return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
    }, []);

    const handleInterestToggle = useCallback((id) => {
        setFilteredEventsData((prev) => {
            if (!prev) return prev;
            return prev.map((item) => {
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
            });
        });
        interestMutation.mutate(id);
    }, [interestMutation]);

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
    const toastTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        };
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
    };

    if (!canAccessLocalizedFeatures) {
        return (
            <div className="max-w-[700px] mx-auto my-16 p-8 bg-surface-container border border-black/10 dark:border-white/10 rounded-2xl text-center space-y-6">
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
        <div className="p-4 bg-transparent">
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
                    <h1 className="text-4xl font-extrabold flex items-center gap-3 text-text-primary font-headline-lg">
                        Discover Events <span className="text-2xl">🎉</span>
                    </h1>
                    <p className="text-text-secondary mt-2 font-semibold text-lg">
                        Find your next adventure, connect with your community.
                    </p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    {/* View Switcher Controls */}
                    <div className="bg-surface-container-low p-1 rounded-xl flex border border-black/10 dark:border-white/10">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 border-none cursor-pointer",
                                viewMode === 'grid' ? "bg-primary-container text-white" : "text-text-secondary hover:text-text-primary bg-transparent"
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
                                viewMode === 'calendar' ? "bg-primary-container text-white" : "text-text-secondary hover:text-text-primary bg-transparent"
                            )}
                        >
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            Calendar
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/calendar')}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-surface-container-low border border-black/10 dark:border-white/10 hover:bg-surface-container-high text-text-primary rounded-lg font-bold transition-all active:scale-95 text-xs uppercase tracking-widest cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-sm text-primary-container">event_available</span>
                        My Schedule
                    </button>

                    <button
                        type="button"
                        data-testid="create-event-btn"
                        onClick={() => navigate('/events/create')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-container hover:bg-red-700 text-white rounded-lg font-bold transition-all active:scale-95 text-xs uppercase tracking-widest cursor-pointer border-none"
                    >
                        <span className="material-symbols-outlined text-sm">event</span>
                        Create Event
                    </button>
                </div>
            </div>

            {/* Collapsible Search/Filter Card Accordion Container */}
            <section className={cn("mb-12 bg-surface-container border border-black/10 dark:border-white/10 rounded-2xl shadow-sm font-sans", isSearchExpanded ? "overflow-visible" : "overflow-hidden")}>
                <button
                    type="button"
                    data-testid="find-events-accordion"
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none bg-transparent border-none text-left cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center border border-black/10 dark:border-white/10 shrink-0">
                            <Filter className="w-5 h-5 text-primary-container" />
                        </div>
                        <span className="text-lg font-bold text-text-primary">Find Your Local Events</span>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-text-secondary transition-transform duration-300", isSearchExpanded && "rotate-180")} />
                </button>
                {/* Expandable Inner Filter Content Box Grid */}
                <div className={cn("transition-all duration-300 ease-out px-6", isSearchExpanded ? "max-h-[2000px] opacity-100 pb-8 border-t border-black/10 dark:border-white/10 pt-6 overflow-visible" : "max-h-0 opacity-0 py-0 border-t-0 overflow-hidden")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Search Input Box with State-Scoped Dropdown */}
                        <div ref={searchContainerRef} className="space-y-2 flex flex-col relative z-20">
                            <div className="flex items-center justify-between select-none">
                                <label className="text-sm font-bold text-text-secondary uppercase tracking-widest font-mono">Search Events</label>
                                {effectiveUserState && (
                                    <span className="text-[11px] text-primary-container font-mono flex items-center gap-1 font-bold">
                                        <MapPin className="w-3 h-3 text-primary-container" />
                                        <span>Scope: {effectiveUserState}</span>
                                    </span>
                                )}
                            </div>
                            <div className="relative group">
                                <Search className={cn(
                                    "w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
                                    isSearchDropdownOpen ? "text-primary-container" : "text-text-secondary group-focus-within:text-primary-container"
                                )} />
                                <input
                                    data-testid="event-search-input"
                                    className="w-full bg-surface-container-low border border-black/10 dark:border-white/10 focus:border-primary-container text-sm rounded-xl pl-10 pr-9 py-3 text-text-primary placeholder:text-text-secondary/50 outline-none transition-all shadow-sm"
                                    placeholder={effectiveUserState ? `Search events in ${effectiveUserState}...` : "Find parties, meetups, conferences..."}
                                    type="text"
                                    value={searchQuery}
                                    onFocus={() => setIsSearchDropdownOpen(true)}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setIsSearchDropdownOpen(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsSearchDropdownOpen(false);
                                        }
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setIsSearchDropdownOpen(false);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded bg-transparent border-none cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Floating Dropdown System Results Portal (like GlobalSearchBar, limited to user's state) */}
                            {isSearchDropdownOpen && searchQuery.trim().length > 0 && (
                                <div className="absolute top-[calc(100%+6px)] inset-x-0 bg-surface-container border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl max-h-[440px] overflow-y-auto custom-scrollbar p-2 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-2 z-50 text-text-primary">
                                    {/* Scoped State Header Bar */}
                                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/10 dark:border-white/10 font-mono text-[11px] text-text-secondary select-none">
                                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary-container">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{effectiveUserState ? `Events in ${effectiveUserState}` : 'Local Event Search'}</span>
                                        </div>
                                        <span className="text-[10px] text-text-secondary/60">
                                            {dropdownSearchResults.length} {dropdownSearchResults.length === 1 ? 'match' : 'matches'}
                                        </span>
                                    </div>

                                    {/* Results List */}
                                    {dropdownSearchResults.length > 0 ? (
                                        <div className="space-y-1">
                                            {dropdownSearchResults.map((event) => {
                                                const isOnline = String(event?.format || event?.participation_format).toLowerCase() === 'online';
                                                const displayLoc = getDisplayLocation(event?.location, event);
                                                return (
                                                    <div
                                                        key={`event-dropdown-${event.id}`}
                                                        onClick={() => {
                                                            navigate(`/events/${event.id}`);
                                                            setIsSearchDropdownOpen(false);
                                                        }}
                                                        className="w-full px-3 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer transition-colors group flex items-start gap-3 text-left border border-transparent hover:border-black/5 dark:hover:border-white/5"
                                                    >
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container-high border border-black/10 dark:border-white/10 relative">
                                                            <img
                                                                src={event.image || event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=120&q=80'}
                                                                alt={event.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=120&q=80'; }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary-container/10 text-primary-container border border-primary-container/20 font-bold">
                                                                    {event.category || 'Event'}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border",
                                                                    isOnline
                                                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                                )}>
                                                                    {event.format || (isOnline ? 'Online' : 'In-Person')}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-xs font-bold text-text-primary group-hover:text-primary-container transition-colors truncate">
                                                                {event.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary truncate font-mono">
                                                                <span className="flex items-center gap-1 text-text-secondary/80">
                                                                    <CalendarIcon className="w-3 h-3 text-text-secondary/60 shrink-0" />
                                                                    <span className="truncate">{event.date || event.displayDate || event.time}</span>
                                                                </span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1 truncate text-text-secondary/80">
                                                                    <MapPin className="w-3 h-3 text-text-secondary/60 shrink-0" />
                                                                    <span className="truncate">{displayLoc}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-8 px-4 text-center font-mono text-xs text-text-secondary/60 select-none flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-3xl text-text-secondary/40">event_busy</span>
                                            <p className="uppercase tracking-widest text-[11px] font-bold text-text-secondary">
                                                No events found in {effectiveUserState || 'your state'} matching "{searchQuery}"
                                            </p>
                                            <p className="text-[10px] text-text-secondary/40 normal-case">
                                                Search is strictly limited to events located within {effectiveUserState || 'your state'}. Events outside your state are not shown.
                                            </p>
                                        </div>
                                    )}

                                    {/* Status footer anchor */}
                                    <div className="p-2 text-center border-t border-black/10 dark:border-white/5 font-mono text-[9px] text-text-secondary/30 select-none uppercase tracking-widest mt-1">
                                        // state_scoped_events_index_active
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Location Context Filter Input Box */}
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-bold text-text-secondary uppercase tracking-widest font-mono select-none">Filter by Location</label>
                            <div className="relative group">
                                <MapPin className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary-container" />
                                <input
                                    className="w-full bg-surface-container-low border border-black/10 dark:border-white/10 focus:border-primary-container text-sm rounded-xl pl-10 pr-9 py-3 text-text-primary placeholder:text-text-secondary/50 outline-none transition-all shadow-sm"
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
                                                : "bg-surface-container-low border border-black/10 dark:border-white/10 text-text-secondary hover:border-primary-container hover:text-text-primary"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date Picker Popovers & Distance Dropdown Filters Controls Area */}
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-black/10 dark:border-white/5">
                        <div className="flex flex-wrap items-center gap-4 select-none">
                            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        data-testid="date-picker-trigger"
                                        className={cn(
                                            "bg-surface-container-low border border-black/10 dark:border-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer text-text-primary",
                                            selectedDate && "border-primary-container text-primary-container bg-primary-container/10"
                                        )}
                                    >
                                        <CalendarIcon className="w-4 h-4 text-text-secondary" />
                                        <span>{selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Pick dates'}</span>
                                        {selectedDate && (
                                            <X
                                                className="w-3.5 h-3.5 ml-1 text-primary-container hover:text-text-primary cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); setSelectedDate(null); handleApplyFilter(null, selectedDistance); }}
                                            />
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-surface-container border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 text-text-primary" align="start">
                                    <DayCalendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => { setSelectedDate(d); setIsPopoverOpen(false); handleApplyFilter(d, selectedDistance); }}
                                        defaultMonth={selectedDate || new Date()}
                                    />
                                </PopoverContent>
                            </Popover>

                            {hasAddressOrCoords ? (
                                <div className="flex items-center gap-2 bg-surface-container-low border border-black/10 dark:border-white/10 px-3 py-2 rounded-xl text-xs font-bold text-text-primary">
                                    <MapPin className="w-4 h-4 text-primary-container" />
                                    <span className="text-text-secondary font-mono">Distance:</span>
                                    <select
                                        data-testid="distance-select"
                                        value={selectedDistance}
                                        onChange={(e) => { const val = e.target.value; setSelectedDistance(val); handleApplyFilter(selectedDate, val); }}
                                        className="bg-transparent text-text-primary font-bold focus:outline-none cursor-pointer font-mono outline-none border-none"
                                    >
                                        <option value="" className="bg-surface text-text-primary">All Distances</option>
                                        {DISTANCE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value} className="bg-surface text-text-primary">{opt.label}</option>
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
                                <button type="button" data-testid="reset-filters-btn" onClick={handleClearFilters} className="text-xs text-text-secondary hover:text-text-primary underline font-bold bg-transparent border-none cursor-pointer font-mono">Reset filters</button>
                            )}
                        </div>
                        {/* Event Format Selection Capsule */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto select-none font-mono">
                            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">
                                Event Type
                            </label>
                            <div className="flex bg-surface-container-low p-1 rounded-xl border border-black/10 dark:border-white/10">
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
                                                    ? "bg-surface-container-high text-text-primary shadow-sm"
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
                            <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-black/10 dark:border-white/10 animate-spin"></div>
                            <p className="text-text-secondary uppercase tracking-widest animate-pulse"> LOADING_ADVENTURES...</p>
                        </div>
                    ) : filteredEvents?.length === 0 ? (
                        /* 🌌 Empty State Results Panel Layout */
                        <div className="bg-surface-container border border-black/10 dark:border-white/10 rounded-2xl p-12 text-center shadow-sm font-mono text-xs text-text-secondary/60">
                            NO_EVENTS_FOUND_MATCHING_CRITERIA
                        </div>
                    ) : (
                        /* 🎨 RESPONSIVE GRID PLATFORM: Integrates VirtuosoGrid for 2D multi-column virtualization */
                        <div className="w-full relative">
                            <VirtuosoGrid
                                useWindowScroll
                                overscan={8000}
                                data={filteredEvents}
                                computeItemKey={(_index, event) => event?.id || event?.title}
                                listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full"
                                itemClassName="h-full flex flex-col"
                                itemContent={(index, event) => (
                                    <div className="h-full animate-in fade-in duration-150">
                                        <EventCard
                                            event={event}
                                            onInterestToggle={handleInterestToggle}
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
                                className="flex items-center gap-3 px-8 py-4 border border-black/10 dark:border-[#262626] rounded-xl text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-primary-container transition-all cursor-pointer bg-surface-container-low active:scale-95"
                            >
                                Load More Adventures
                            </button>
                        </div>
                    )}
                </>
            )}
            {viewMode === 'calendar' && (
                /* 📅 Localized Interactive Month Calendar Display Grid Matrix */
                <section className="bg-surface-container rounded-2xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden animate-in fade-in duration-300">

                    {/* Calendar Navigation Panel Header */}
                    <div className="px-8 py-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between select-none">
                        <div className="flex items-center gap-6">
                            <h2 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">{displayMonthName} {currentYear}</h2>
                            <button
                                type="button"
                                onClick={handleToday}
                                className="px-4 py-1.5 border border-black/10 dark:border-white/10 bg-transparent rounded-full text-xs font-bold font-mono text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                            >
                                Today
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 hover:border-primary-container hover:bg-primary-container/5 transition-all text-text-secondary hover:text-text-primary bg-transparent cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">chevron_left</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 hover:border-primary-container hover:bg-primary-container/5 transition-all text-text-secondary hover:text-text-primary bg-transparent cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Days Name Row Headers Array */}
                    <div className="grid grid-cols-7 bg-black/[0.02] dark:bg-white/[0.005] border-b border-black/10 dark:border-white/5 select-none font-mono">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} className="py-4 text-center text-[10px] text-text-secondary uppercase tracking-widest font-black">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Main Calendar Month Sub-Blocks Grid Array */}
                    <div className="grid grid-cols-7 border-l border-t border-black/10 dark:border-white/5">
                        {calendarDays.map((dayObj) => {
                            const dayEvents = getEventsForDay(dayObj);
                            const isToday =
                                dayObj.day === todayDate.day &&
                                dayObj.month === todayDate.month &&
                                dayObj.year === todayDate.year;

                            return (
                                <div
                                    key={`${dayObj.year}-${dayObj.month}-${dayObj.day}`}
                                    className={cn(
                                        "min-h-[140px] p-3 border-r border-b border-black/10 dark:border-white/5 transition-all duration-300 relative flex flex-col justify-between",
                                        dayObj.isCurrentMonth ? "text-text-primary" : "text-text-secondary/40 font-bold",
                                        isToday ? "bg-primary-container/[0.03] ring-1 ring-primary-container/20" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.01]"
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
                    <div className="bg-surface-container-low px-8 py-4 border-t border-black/10 dark:border-white/5 flex items-center gap-8 select-none font-mono text-[10px] text-text-secondary font-bold uppercase tracking-wider">
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
