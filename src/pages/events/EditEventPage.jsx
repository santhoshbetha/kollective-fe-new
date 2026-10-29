// src/pages/events/EditEventPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventDetailsQuery, useUpdateEvent } from '../../features/events/useEventsFeature';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { ImageUploader } from '../../components/ImageUploader';
import { uploadProfileImageToR2 } from '../../utils/uploadMedia';
import { Calendar as ShadcnCalendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Sparkles,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Users,
    UploadCloud,
    X,
    ChevronDown,
    Check,
    Globe,
    Layers,
    Tag,
    Type,
    FileText,
    Video,
    AlertCircle,
    Loader2,
    Save
} from 'lucide-react';
import { cn } from "@/lib/utils";

const CATEGORIES = [
    'Music',
    'Business & professional',
    'Community & culture',
    'Performing & visual arts',
    'Film, media, & entertainment',
    'Fitness & Wellness',
    'Technology',
    'Travel & outdoor',
    'Charity & causes',
    'Religion & spirituality',
    'Family & education',
    'Seasonal & holiday',
    "Other"
];

const parseDateString = (str) => {
    if (!str) return undefined;
    const parts = str.split('-');
    if (parts.length !== 3) return undefined;
    const [y, m, d] = parts.map(Number);
    return new Date(y, m - 1, d);
};

const formatDateString = (selectedDate) => {
    if (!selectedDate) return '';
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatTimeDisplay = (time24) => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    if (hStr === undefined || mStr === undefined) return time24;
    let h = parseInt(hStr, 10);
    const m = mStr;
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
};

const TIME_OPTIONS = (() => {
    const options = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            const time24 = `${hh}:${mm}`;
            options.push({ value: time24, label: formatTimeDisplay(time24) });
        }
    }
    return options;
})();

const PRESET_COVERS = [
    {
        id: 'cover-1',
        name: 'Tech Auditorium',
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'
    },
    {
        id: 'cover-2',
        name: 'Climate Action',
        url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&q=80'
    },
    {
        id: 'cover-3',
        name: 'Workshop & Collaboration',
        url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80'
    },
    {
        id: 'cover-4',
        name: 'Technology Lab',
        url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80'
    }
];

export function EditEventPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    const { event, eventLoading, eventError } = useEventDetailsQuery(id);
    const updateEventMutation = useUpdateEvent(id);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [formatType, setFormatType] = useState('In-Person');
    const [category, setCategory] = useState('Technology');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState('');
    const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
    const [bannerError, setBannerError] = useState(null);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const triggerToast = (msg, type = 'error') => {
        setToastMessage({ msg, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Pre-populate form state from event details
    useEffect(() => {
        if (!event) return;

        setTitle(event.title || '');
        setDescription(event.description || '');

        // Participation format
        const formatMap = {
            in_person: 'In-Person',
            online_virtual: 'Online',
            hybrid: 'Hybrid'
        };
        setFormatType(formatMap[event.participation_format] || event.format || 'In-Person');

        // Category
        if (event.category) {
            setCategory(event.category);
        }

        // Location
        const loc = event.location_name || event.street || (typeof event.location === 'string' ? event.location : (event.location?.name || event.location?.address || ''));
        setLocation(loc || '');

        // Capacity
        if (event.capacity) {
            setCapacity(String(event.capacity));
        }

        // Banner Image
        const img = event.image || event.banner_url || event.cover_image_url;
        if (img) {
            setCoverImage(img);
        }

        // Parse Start Time and Date
        if (event.start_time) {
            try {
                const sDt = new Date(event.start_time);
                if (!isNaN(sDt.getTime())) {
                    setStartDate(format(sDt, 'yyyy-MM-dd'));
                    setStartTime(format(sDt, 'HH:mm'));
                }
            } catch (e) {
                console.warn('Could not parse start_time:', e);
            }
        }

        // Parse End Time and Date
        if (event.end_time) {
            try {
                const eDt = new Date(event.end_time);
                if (!isNaN(eDt.getTime())) {
                    setEndDate(format(eDt, 'yyyy-MM-dd'));
                    setEndTime(format(eDt, 'HH:mm'));
                }
            } catch (e) {
                console.warn('Could not parse end_time:', e);
            }
        }
    }, [event?.id]);

    if (eventLoading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 rounded-full text-primary-container animate-spin" />
                <p className="text-text-secondary text-sm font-bold uppercase tracking-widest font-mono">
                    Loading event details...
                </p>
            </div>
        );
    }

    if (eventError || !event) {
        return (
            <div className="max-w-md mx-auto py-24 px-4 text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="font-bold text-text-primary text-xl mb-2">Event Not Found</h3>
                <p className="text-text-secondary text-sm mb-6">
                    The event you are attempting to edit does not exist or has been removed.
                </p>
                <button
                    onClick={() => navigate('/events')}
                    className="px-6 py-2.5 bg-primary-container text-white font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
                >
                    Return to Events
                </button>
            </div>
        );
    }

    // Authorization check: Only organizer or admin/moderator can edit
    const currentUserId = currentUser?.id || activeAccount?.id;
    const currentUsername = (currentUser?.username || activeAccount?.username || '').toLowerCase();
    const isOrganizer = Boolean(
        (currentUserId && (event.created_by === currentUserId || event.user_id === currentUserId || event.organizer?.id === currentUserId)) ||
        (currentUsername && (
            (typeof event.organizer === 'string' && event.organizer.toLowerCase() === currentUsername) ||
            (event.organizer?.username && event.organizer.username.toLowerCase() === currentUsername) ||
            (event.organizerName && event.organizerName.toLowerCase() === currentUsername)
        )) ||
        currentUser?.is_admin ||
        currentUser?.is_moderator
    );

    if (!isOrganizer) {
        return (
            <div className="max-w-md mx-auto py-24 px-4 text-center animate-in zoom-in-95 duration-200">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-bold text-text-primary text-xl mb-2">Authorization Restricted</h3>
                <p className="text-text-secondary text-sm mb-6">
                    Only the event organizer or a platform moderator can modify this event.
                </p>
                <button
                    onClick={() => navigate(`/events/${id}`)}
                    className="px-6 py-2.5 bg-primary-container text-white font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
                >
                    View Event Details
                </button>
            </div>
        );
    }

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (bannerError) return triggerToast(bannerError);
        if (!title.trim()) return triggerToast('Event title is required.');
        if (!description.trim()) return triggerToast('Event description is required.');
        if (!startDate || !startTime) return triggerToast('Start date and time are required.');
        if (!location.trim()) return triggerToast('Event location is required.');

        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const finalEndDate = endDate || startDate;

        if (startDate < todayStr || (endDate && endDate < todayStr)) {
            return triggerToast('Event date cannot be in the past.');
        }

        if (finalEndDate < startDate) {
            return triggerToast('End date cannot be before start date.');
        }

        if (finalEndDate === startDate && endTime && endTime <= startTime) {
            return triggerToast('End time must be after start time.');
        }

        setIsSubmitting(true);

        try {
            let finalCoverUrl = coverImage;
            if (coverImage && (coverImage.startsWith('data:') || coverImage instanceof File)) {
                finalCoverUrl = await uploadProfileImageToR2(coverImage, 'event');
            }

            const formattedDate = new Date(startDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
            });

            const displayDate = `${new Date(startDate).toLocaleDateString('en-US', {
                weekday: 'long', month: 'short', day: 'numeric',
            })} • ${startTime} ${endTime ? `- ${endTime}` : ''}`;

            let start_time = null;
            try {
                if (startDate && startTime) {
                    start_time = new Date(`${startDate}T${startTime}`).toISOString();
                }
            } catch { start_time = null; }

            let end_time = null;
            try {
                const finalEnd = endDate || startDate;
                if (finalEnd && endTime) {
                    end_time = new Date(`${finalEnd}T${endTime}`).toISOString();
                }
            } catch { end_time = null; }

            const formatMapping = {
                'In-Person': 'in_person',
                'Online': 'online_virtual',
                'Hybrid': 'hybrid',
            };

            const updatedEvent = {
                id,
                title: title.trim(),
                description: description.trim(),
                format: formatType,
                participation_format: formatMapping[formatType] || 'in_person',
                category,
                start_time,
                end_time,
                date: formattedDate,
                displayDate,
                time: `${startTime} ${endTime ? `- ${endTime}` : ''}`,
                location: location.trim(),
                location_name: location.trim(),
                street: location.trim(),
                capacity: capacity ? parseInt(capacity, 10) : null,
                max_participants: capacity ? parseInt(capacity, 10) : null,
                image: finalCoverUrl,
                banner_url: finalCoverUrl,
                cover_image_url: finalCoverUrl,
                image_url: finalCoverUrl,
            };

            updateEventMutation.mutate(updatedEvent, {
                onSuccess: () => {
                    triggerToast('Event successfully updated!', 'success');
                    setTimeout(() => navigate(`/events/${id}`), 1000);
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    triggerToast(err?.message || 'Error occurred while updating event.', 'error');
                }
            });
        } catch (err) {
            console.error('Error during image upload:', err);
            triggerToast('Failed to upload event cover image. Please try again.', 'error');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative space-y-8 isolate font-sans transition-colors">
            {/* Embedded Floating Toast Notification */}
            {toastMessage && (
                <div className={cn(
                    "fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in duration-200",
                    toastMessage.type === 'success' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                )}>
                    <span>{toastMessage.msg}</span>
                    <button type="button" onClick={() => setToastMessage(null)} className="bg-transparent border-none text-white cursor-pointer ml-2 outline-none">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Back Navigation Row */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <button
                    type="button"
                    onClick={() => navigate(`/events/${id}`)}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-bold text-sm group cursor-pointer border-none bg-transparent"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Event Details</span>
                </button>
                <span className="text-xs font-mono uppercase tracking-widest text-text-secondary/60">
                    EVENT_MODIFICATION_PROTOCOL
                </span>
            </div>

            {/* Header Title Section */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                    Edit Event Details
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                    Update logistics, schedule, and information for your community event.
                </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Form Controls */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Event Title */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 bg-surface-container-low">
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                                <Type className="w-4 h-4 text-primary-container" />
                                <span>Event Title</span>
                            </label>
                            <input
                                type="text"
                                data-testid="event-title-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Give your event a clear, descriptive title..."
                                className="w-full bg-surface-container-high/50 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/40 text-sm font-medium focus:outline-none focus:border-primary-container transition-all"
                            />
                        </div>

                        {/* Format & Category Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Format Selector */}
                            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 bg-surface-container-low">
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary-container" />
                                    <span>Participation Format</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['In-Person', 'Online', 'Hybrid'].map((fmt) => (
                                        <button
                                            key={fmt}
                                            type="button"
                                            onClick={() => setFormatType(fmt)}
                                            className={cn(
                                                "py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                                                formatType === fmt
                                                    ? "bg-primary-container text-white border-primary-container shadow-md shadow-primary-container/20"
                                                    : "bg-surface-container-high/30 hover:bg-surface-container-high/60 text-text-secondary border-white/5"
                                            )}
                                        >
                                            {fmt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Selector */}
                            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 bg-surface-container-low">
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-primary-container" />
                                    <span>Category</span>
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            data-testid="category-trigger"
                                            className="w-full flex items-center justify-between bg-surface-container-high/50 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-sm font-medium hover:border-white/20 transition-all cursor-pointer"
                                        >
                                            <span className="truncate">{category}</span>
                                            <ChevronDown className="w-4 h-4 text-text-secondary shrink-0" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 max-h-60 overflow-y-auto p-1 bg-surface-container-high border border-white/10 rounded-xl shadow-xl z-50">
                                        <div className="space-y-0.5">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setCategory(cat)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer",
                                                        category === cat
                                                            ? "bg-primary-container text-white"
                                                            : "text-text-primary hover:bg-white/5"
                                                    )}
                                                >
                                                    <span>{cat}</span>
                                                    {category === cat && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Timing Matrix (Start & End) */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 bg-surface-container-low">
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary-container" />
                                <span>Date & Time Scheduling</span>
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/70">Start Date</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                data-testid="start-date-trigger"
                                                className="w-full flex items-center justify-between bg-surface-container-high/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-text-primary text-xs font-medium hover:border-white/20 transition-all cursor-pointer"
                                            >
                                                <span>{startDate ? format(parseDateString(startDate), 'PPP') : 'Select Date'}</span>
                                                <CalendarIcon className="w-4 h-4 text-text-secondary shrink-0" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-surface-container border border-white/10 rounded-xl shadow-xl z-50" align="start">
                                            <ShadcnCalendar
                                                mode="single"
                                                selected={parseDateString(startDate)}
                                                onSelect={(d) => setStartDate(formatDateString(d))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Start Time */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/70">Start Time</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                data-testid="start-time-trigger"
                                                className="w-full flex items-center justify-between bg-surface-container-high/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-text-primary text-xs font-medium hover:border-white/20 transition-all cursor-pointer"
                                            >
                                                <span>{startTime ? formatTimeDisplay(startTime) : 'Select Time'}</span>
                                                <Clock className="w-4 h-4 text-text-secondary shrink-0" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 max-h-60 overflow-y-auto p-1 bg-surface-container-high border border-white/10 rounded-xl shadow-xl z-50">
                                            <div className="space-y-0.5">
                                                {TIME_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setStartTime(opt.value)}
                                                        className={cn(
                                                            "w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer",
                                                            startTime === opt.value
                                                                ? "bg-primary-container text-white"
                                                                : "text-text-primary hover:bg-white/5"
                                                        )}
                                                    >
                                                        <span>{opt.label}</span>
                                                        {startTime === opt.value && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* End Date */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/70">End Date (Optional)</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                data-testid="end-date-trigger"
                                                className="w-full flex items-center justify-between bg-surface-container-high/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-text-primary text-xs font-medium hover:border-white/20 transition-all cursor-pointer"
                                            >
                                                <span>{endDate ? format(parseDateString(endDate), 'PPP') : 'Same as Start'}</span>
                                                <CalendarIcon className="w-4 h-4 text-text-secondary shrink-0" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-surface-container border border-white/10 rounded-xl shadow-xl z-50" align="start">
                                            <ShadcnCalendar
                                                mode="single"
                                                selected={parseDateString(endDate)}
                                                onSelect={(d) => setEndDate(formatDateString(d))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* End Time */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/70">End Time (Optional)</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                data-testid="end-time-trigger"
                                                className="w-full flex items-center justify-between bg-surface-container-high/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-text-primary text-xs font-medium hover:border-white/20 transition-all cursor-pointer"
                                            >
                                                <span>{endTime ? formatTimeDisplay(endTime) : 'None'}</span>
                                                <Clock className="w-4 h-4 text-text-secondary shrink-0" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 max-h-60 overflow-y-auto p-1 bg-surface-container-high border border-white/10 rounded-xl shadow-xl z-50">
                                            <div className="space-y-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setEndTime('')}
                                                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                                                >
                                                    Clear End Time
                                                </button>
                                                {TIME_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setEndTime(opt.value)}
                                                        className={cn(
                                                            "w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer",
                                                            endTime === opt.value
                                                                ? "bg-primary-container text-white"
                                                                : "text-text-primary hover:bg-white/5"
                                                        )}
                                                    >
                                                        <span>{opt.label}</span>
                                                        {endTime === opt.value && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        {/* Location and Capacity */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-3 bg-surface-container-low">
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary-container" />
                                    <span>Location / Address</span>
                                </label>
                                <input
                                    type="text"
                                    data-testid="event-location-input"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Austin Public Library or Online URL"
                                    className="w-full bg-surface-container-high/50 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-secondary/40 text-sm font-medium focus:outline-none focus:border-primary-container transition-all"
                                />
                            </div>

                            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 bg-surface-container-low">
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary-container" />
                                    <span>Max Capacity</span>
                                </label>
                                <input
                                    type="number"
                                    data-testid="event-capacity-input"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    placeholder="Optional"
                                    min="1"
                                    className="w-full bg-surface-container-high/50 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-secondary/40 text-sm font-medium focus:outline-none focus:border-primary-container transition-all"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 bg-surface-container-low">
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary-container" />
                                <span>Event Description</span>
                            </label>
                            <textarea
                                data-testid="event-description-input"
                                rows={6}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what attendees can expect, what to bring, and key agenda items..."
                                className="w-full bg-surface-container-high/50 border border-white/10 rounded-xl p-4 text-text-primary placeholder:text-text-secondary/40 text-sm font-medium focus:outline-none focus:border-primary-container transition-all resize-y"
                            />
                        </div>
                    </div>

                    {/* Right Column: Visuals & Cover */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 bg-surface-container-low">
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary-container" />
                                <span>Event Banner Graphic</span>
                            </label>

                            {/* Banner Image Preview */}
                            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner group">
                                {coverImage ? (
                                    <img
                                        src={coverImage}
                                        alt="Event Cover Preview"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs font-mono">
                                        NO_BANNER_ATTACHED
                                    </div>
                                )}
                            </div>

                            {/* Image Uploader */}
                            <div className="pt-2">
                                <ImageUploader
                                    onImageReady={(croppedDataUrl) => {
                                        setCoverImage(croppedDataUrl);
                                        setBannerError(null);
                                    }}
                                    onError={(err) => setBannerError(err)}
                                    aspectRatio={16 / 9}
                                    uploadText="Upload New Banner (16:9)"
                                />
                            </div>

                            {/* Preset Covers Toggle */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowImagePicker(!showImagePicker)}
                                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-surface-container-high/40 hover:bg-surface-container-high/70 text-text-secondary hover:text-text-primary border border-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>{showImagePicker ? 'Hide Preset Covers' : 'Choose from Presets'}</span>
                                </button>

                                {showImagePicker && (
                                    <div className="grid grid-cols-2 gap-2 mt-3 animate-in fade-in duration-200">
                                        {PRESET_COVERS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => {
                                                    setCoverImage(preset.url);
                                                    setBannerError(null);
                                                }}
                                                className={cn(
                                                    "relative rounded-xl overflow-hidden border aspect-[16/9] group cursor-pointer transition-all",
                                                    coverImage === preset.url
                                                        ? "border-primary-container ring-2 ring-primary-container"
                                                        : "border-white/10 hover:border-white/30"
                                                )}
                                            >
                                                <img
                                                    src={preset.url}
                                                    alt={preset.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Action Card */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 bg-surface-container-low">
                            <button
                                type="submit"
                                data-testid="event-submit-btn"
                                disabled={isSubmitting || updateEventMutation.isPending}
                                className="w-full py-3.5 px-6 rounded-xl bg-primary-container hover:brightness-110 active:scale-95 text-white font-black text-sm tracking-wide uppercase transition-all shadow-xl shadow-primary-container/20 flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting || updateEventMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Event Updates</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(`/events/${id}`)}
                                className="w-full py-2.5 px-6 rounded-xl bg-transparent hover:bg-white/5 text-text-secondary hover:text-text-primary font-bold text-xs tracking-wider uppercase transition-all border border-white/10 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditEventPage;
