import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggleEventInterest, useEventsQuery } from '../features/events/useEventsFeature';
import { useStore } from '../store/useStore';
import { EventCard } from '../features/events/EventCard';

export const EventsPage = () => {
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
        </div>
    );
};

