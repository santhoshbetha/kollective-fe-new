import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../features/events/useCreateEvent';
import { ImageUploader } from '../components/ImageUploader';
import { uploadProfileImageToR2 } from '../utils/uploadMedia';
import { Calendar as ShadcnCalendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Sparkles,
    Info,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Users,
    Rocket,
    UploadCloud,
    X,
    ChevronDown,
    Check,
    Globe,
    Layers,
    Tag,
    Type,
    FileText,
    Target,
    Compass,
    Video,
    Building,
    CheckCircle2,
    Zap,
    Plus
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


//import { toast } from "sonner";

const PRESET_COVERS = [
    {
        id: 'cover-1',
        name: 'Tech Auditorium',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9ksWN3ffoNOR2pmCU_J77IFwl9hhLOut8yg3EmzQpTlaR5Hf8lFAohQKRwGxjmEQU1EKOa2K3LriDOS9oQyNxNVoc9fBlxrHJmS23dwNWndRQdmB6jLXkCmKGDmuLsDbriLsLAeKPungn6DgAECaGiUWeOIz8mWO3TUXt5UuNnBt5w-2cE_lc8WMx7-4pgWo4xVvMSn333iHXJItCRu5mD0sd1nXkN3S91vFY5dHZqL0pLaArDYKZSqzoXh6-1wbf6PDmZ5om9FY'
    },
    {
        id: 'cover-2',
        name: 'Climate Action',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmM1MOsrx_Oxh9mLlPIv9wjEUWU4Nkq0oMUmGWV--VNEjchJsUZuthMCzgMcfXQ435-Sfs9WizGdYZzXkW0AKbb11mdu2GFrz_sPS_Xg7tRdE3BFS6AD8G1S1vo7lexQqVY_rSdz844c5nlF1LWqRLHasAPetQ3FnuGO0W6Xu2MihFdRY4E9lQZDfiBQZCsqcVebZUjV2Xk5WIM8QzVeG9txnaZaBXdNthJD9-0Fi65BZ7pxeiBj_cduG-ortRW5FZCr5CCqkpcEo'
    },
    {
        id: 'cover-3',
        name: 'Workshop & Collaboration',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2JfPGX2MT2E3ylEeai5oLuJkwxmkqMqJG3FhPL0ZQ1A2FW9BkD0ctB7TyI9T2ns_dsUbSAZ75DOMtA2DxClR5vgb2PdXrzMzakrUyyC-rvSZUPYz89QXtX-QGUWvjpsqozHYKi_bmuMVdL2fR59DJ3MGocXAw8zanwRecd24pYGIFWFWao1cwI7ZxClcJWqzigvQAxR3-zmQzsdMnav4rAsFr0idFMBvSCkGBGZVW9Hazghyg1deYQzv0nVkLXnWI1Cy-uyTNxdo'
    },
    {
        id: 'cover-4',
        name: 'Technology Lab',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLyIUm-ffCTttHnuM7rD5R7cEVQwQZwSvj1Z5OAaqLt0klmRC4Pd5B7RpDg5uhfR3V5AkJhs5x_JZtkJtbKBBQ7YMzTYCFvgZ9H4nTT0dSRsyTtMY0Aps1bHurYbf6_9hjpP2_kRTdJjnowvPXIGVVCx8M4nyWg8Zqxo4qrqmJ1D-JMsX7AQvJAy3OlWlRDfIzZKZsfD0VUBrktjTpkaWlwt-MWHcU15-2BsvJoumYTTHgqWHhbdqwCRM3b0oMEMbX6iwlkVnlM74'
    }
];

export const CreateEventPage = () => {
    const navigate = useNavigate();
    const createEventMutation = useCreateEvent();

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
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const triggerToast = (msg, type = 'error') => {
        setToastMessage({ msg, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            triggerToast('Event title is required.');
            return;
        }
        if (!description.trim()) {
            triggerToast('Event description is required.');
            return;
        }
        if (!startDate || !startTime) {
            triggerToast('Start date and time are required.');
            return;
        }
        if (!location.trim()) {
            triggerToast('Event location is required.');
            return;
        }

        setIsSubmitting(true);

        try {
            let finalCoverUrl = coverImage;
            if (coverImage && (coverImage.startsWith('data:') || coverImage instanceof File)) {
                finalCoverUrl = await uploadProfileImageToR2(coverImage, 'event');
            }

            const formattedDate = new Date(startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });

            const displayDate = `${new Date(startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
            })} • ${startTime} ${endTime ? `- ${endTime}` : ''}`;

            let start_time = null;
            try {
                if (startDate && startTime) {
                    start_time = new Date(`${startDate}T${startTime}`).toISOString();
                }
            } catch {
                start_time = null;
            }

            let end_time = null;
            try {
                const finalEndDate = endDate || startDate;
                if (finalEndDate && endTime) {
                    end_time = new Date(`${finalEndDate}T${endTime}`).toISOString();
                }
            } catch {
                end_time = null;
            }

            const formatMapping = {
                'In-Person': 'in_person',
                'Online': 'online_virtual',
                'Hybrid': 'hybrid',
            };

            const newEvent = {
                title,
                description,
                format: formatType,
                participation_format: formatMapping[formatType] || 'in_person',
                category,
                start_time,
                end_time,
                date: formattedDate,
                displayDate,
                time: `${startTime} ${endTime ? `- ${endTime}` : ''}`,
                location,
                location_name: location,
                street: location,
                capacity: capacity ? parseInt(capacity, 10) : null,
                max_participants: capacity ? parseInt(capacity, 10) : null,
                image: finalCoverUrl,
                banner_url: finalCoverUrl,
                cover_image_url: finalCoverUrl,
                image_url: finalCoverUrl,
            };

            createEventMutation.mutate(newEvent, {
                onSuccess: () => {
                    triggerToast('Event successfully launched!', 'success');
                    setTimeout(() => {
                        navigate('/events');
                    }, 1200);
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    triggerToast(err?.message || 'Error occurred while creating event.', 'error');
                }
            });
        } catch (err) {
            console.error('Error during image upload:', err);
            triggerToast('Failed to upload event cover image. Please try again.', 'error');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-gutter)] relative space-y-8 isolate font-sans">


            {/* Embedded Floating Toast Notification */}
            {toastMessage && (
                <div className={cn(
                    "fixed top-6 right-6 z-50 px-5 py-3 rounded-card shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-fadeIn transition-all",
                    toastMessage.type === 'success'
                        ? "bg-green-600 text-white border border-green-500 shadow-green-900/30"
                        : "bg-[#a10836] text-white border border-red-500 shadow-red-900/30"
                )}>
                    <span>{toastMessage.msg}</span>
                    <button
                        type="button"
                        onClick={() => setToastMessage(null)}
                        className="bg-transparent border-none text-white cursor-pointer ml-2 hover:opacity-80"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
            {/* Dynamic Background Blurs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 blur-[120px] -z-10 rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-tertiary-container/5 blur-[100px] -z-10 rounded-full pointer-events-none" />

            {/* Back Navigation Row */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/events')}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-primary transition-colors group cursor-pointer border-none bg-transparent"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Events</span>
                </button>
            </div>

            {/* Hero Header Context Banner Block */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-container/10 border border-outline-variant text-primary font-bold text-xs uppercase tracking-widest animate-fadeIn">
                    <Sparkles className="w-4 h-4" /> CREATE NEW EVENT
                </span>
                <h2 className="text-headline-lg font-black tracking-tight text-text-primary">
                    Share Your Event
                </h2>
                <p className="text-body-md text-text-secondary leading-relaxed">
                    Bring your community together for shared experiences, common causes, and revolutionary gatherings.
                </p>
            </div>

            {/* Master Event Form Configuration Layout Container */}
            <form onSubmit={handleCreate} className="space-y-6">

                {/* Section Block: Cover Display Element */}
                <section className="bg-surface-container border border-outline-variant rounded-card p-5 relative overflow-hidden space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
                        <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-primary" />
                            <span>Event Cover Image</span>
                        </h4>
                        <button
                            type="button"
                            onClick={() => setShowImagePicker(!showImagePicker)}
                            className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded-card text-xs font-bold text-text-primary hover:bg-surface-container-high transition-all cursor-pointer"
                        >
                            {showImagePicker ? 'Hide Presets' : 'Choose Preset Template'}
                        </button>
                    </div>

                    <ImageUploader
                        mode="banner"
                        aspectRatio={16 / 9}
                        value={coverImage}
                        onChange={(newImage) => setCoverImage(newImage)}
                        onImageRemove={() => setCoverImage('')}
                        label="Upload Event Cover"
                        description="Recommended 16:9 format. Drag & drop, crop, and position your cover image."
                    />

                    {/* Inline Preset template image collection portal context */}
                    {showImagePicker && (
                        <div className="pt-2 border-t border-outline-variant/40 space-y-2">
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Preset Templates</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {PRESET_COVERS.map((preset) => (
                                    <div
                                        key={preset.id}
                                        onClick={() => {
                                            setCoverImage(preset.url);
                                            setShowImagePicker(false);
                                        }}
                                        className={cn(
                                            "relative rounded-card overflow-hidden cursor-pointer border-2 transition-all group",
                                            coverImage === preset.url ? 'border-primary shadow-xs' : 'border-transparent hover:border-outline-variant'
                                        )}
                                    >
                                        <img src={preset.url} alt={preset.name} className="w-full h-20 object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-inverse-surface/70 p-1 text-center truncate">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{preset.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Form Fields split grid matrix rows */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left Column: Basic Information section */}
                    <section className="bg-surface-container border border-outline-variant rounded-card p-5 sm:p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-card bg-primary-container/15 text-primary flex items-center justify-center shrink-0 shadow-xs">
                                    <Info className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-primary text-[16px] uppercase tracking-wider">Basic Information</h4>
                                    <p className="text-[14px] text-text-secondary">Core identity and overview of your event</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-surface-container-high text-primary border border-outline-variant">
                                Step 01
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Event Title */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="title" className="text-[14px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                                        Event Title <span className="text-primary">*</span>
                                    </label>
                                </div>
                                <div className="relative">
                                    <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50 pointer-events-none" />
                                    <input
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-card pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[14px] sm:text-[16px] font-medium"
                                        placeholder="e.g. Climate Action Townhall 2026..."
                                    />
                                </div>
                                {/* Quick Title Suggestion Chips */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[14px] font-bold text-text-secondary uppercase tracking-wider mr-1">Ideas:</span>
                                    {['Community Workshop', 'Tech Summit', 'Townhall Gathering', 'Action Rally'].map((chip) => (
                                        <button
                                            key={chip}
                                            type="button"
                                            onClick={() => !title && setTitle(chip)}
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-text-secondary hover:text-primary hover:bg-primary-container/20 border border-outline-variant transition-all cursor-pointer"
                                        >
                                            + {chip}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="desc" className="text-[14px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                                        Description <span className="text-primary">*</span>
                                    </label>
                                    {/* Quick Format Append Buttons */}
                                    <div className="flex items-center gap-1">
                                        {[
                                            { label: '+ Agenda', text: '\n\n🗓️ AGENDA:\n• 10:00 AM - Opening Remarks\n• 11:00 AM - Panel Discussion' },
                                            { label: '+ Speakers', text: '\n\n🎙️ KEYNOTE SPEAKERS:\n• TBD' },
                                            { label: '+ FAQ', text: '\n\n❓ FAQ:\n• Parking available on-site' }
                                        ].map((tool) => (
                                            <button
                                                key={tool.label}
                                                type="button"
                                                onClick={() => setDescription((prev) => prev + tool.text)}
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-container-high text-text-secondary hover:text-primary border border-outline-variant transition-all cursor-pointer"
                                            >
                                                {tool.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative">
                                    <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-text-secondary/50 pointer-events-none" />
                                    <textarea
                                        id="desc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="6"
                                        maxLength="2000"
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-card pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[14px] sm:text-[16px] resize-none font-normal"
                                        placeholder="Describe your event parameters, agenda, topics, speakers, and instructions for attendees..."
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[14px] font-bold uppercase tracking-wider text-text-secondary/60 px-0.5">
                                    <span>Clear details improve attendee engagement</span>
                                    <span className={cn(description.length > 1800 ? "text-amber-500 font-black" : "")}>{description.length}/2000</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right Column: Dynamic Form Select Dropdowns and Calendar inputs */}
                    <div className="space-y-6">

                        {/* Box: Classification Dropdowns */}
                        <section className="bg-surface-container border border-outline-variant rounded-card p-5 sm:p-6 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/40">
                                <div className="w-8 h-8 rounded-card bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <h4 className="font-bold text-text-primary text-[16px] uppercase tracking-wider">Event Classification</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Event Format</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'In-Person', label: 'In-Person', icon: MapPin },
                                            { id: 'Online', label: 'Online', icon: Globe },
                                            { id: 'Hybrid', label: 'Hybrid', icon: Layers }
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            const active = formatType === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setFormatType(item.id)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-card border transition-all cursor-pointer text-xs font-bold",
                                                        active
                                                            ? "bg-primary-container/15 border-primary text-primary shadow-xs"
                                                            : "bg-surface-container-low border-outline-variant text-text-secondary hover:text-text-primary hover:bg-surface-container-high"
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span>{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[14px] font-bold uppercase tracking-wider text-text-secondary">Category</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary transition-all outline-none text-xs sm:text-sm flex items-center justify-between cursor-pointer"
                                            >
                                                <span className="font-medium truncate flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-primary shrink-0" />
                                                    <span>{category || "Select category"}</span>
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-1 border border-outline-variant bg-surface-container shadow-2xl rounded-2xl max-h-60 overflow-y-auto custom-scrollbar" align="start">
                                            <div className="flex flex-col gap-0.5 p-1">
                                                {CATEGORIES.map((cat) => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => setCategory(cat)}
                                                        className={cn(
                                                            "w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer border-none flex items-center justify-between",
                                                            category === cat
                                                                ? "bg-primary-container text-white"
                                                                : "text-text-primary hover:bg-surface-container-high"
                                                        )}
                                                    >
                                                        <span className="truncate">{cat}</span>
                                                        {category === cat && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </section>

                        {/* Box: Timing Schedules & Native Calendar Input Nodes */}
                        <section className="bg-surface-container border border-outline-variant rounded-card p-5 sm:p-6 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/40">
                                <div className="w-8 h-8 rounded-card bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                                    <CalendarIcon className="w-4 h-4" />
                                </div>
                                <h4 className="font-bold text-text-primary text-[16px] uppercase tracking-wider">
                                    Timing Schedules
                                </h4>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-bold uppercase tracking-wider text-text-secondary">Start Date *</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary transition-all outline-none text-xs sm:text-sm flex items-center justify-between cursor-pointer",
                                                        !startDate && "text-text-secondary/50"
                                                    )}
                                                >
                                                    <span className="truncate">
                                                        {startDate
                                                            ? format(parseDateString(startDate), "PPP")
                                                            : "Select start date"}
                                                    </span>
                                                    <CalendarIcon className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border border-outline-variant bg-surface-container shadow-2xl rounded-2xl" align="start">
                                                <ShadcnCalendar
                                                    mode="single"
                                                    selected={parseDateString(startDate)}
                                                    onSelect={(selectedDate) => {
                                                        if (selectedDate) {
                                                            setStartDate(formatDateString(selectedDate));
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-bold uppercase tracking-wider text-text-secondary">Start Time *</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary transition-all outline-none text-xs sm:text-sm flex items-center justify-between cursor-pointer",
                                                        !startTime && "text-text-secondary/50"
                                                    )}
                                                >
                                                    <span className="truncate">
                                                        {startTime ? formatTimeDisplay(startTime) : "Select start time"}
                                                    </span>
                                                    <Clock className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-44 p-1 border border-outline-variant bg-surface-container shadow-2xl rounded-2xl max-h-60 overflow-y-auto custom-scrollbar" align="start">
                                                <div className="flex flex-col gap-0.5">
                                                    {TIME_OPTIONS.map((t) => (
                                                        <button
                                                            key={t.value}
                                                            type="button"
                                                            onClick={() => setStartTime(t.value)}
                                                            className={cn(
                                                                "w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer border-none",
                                                                startTime === t.value
                                                                    ? "bg-primary-container text-white"
                                                                    : "text-text-primary hover:bg-surface-container-high"
                                                            )}
                                                        >
                                                            {t.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-bold uppercase tracking-wider text-text-secondary">End Date</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary transition-all outline-none text-xs sm:text-sm flex items-center justify-between cursor-pointer",
                                                        !endDate && "text-text-secondary/50"
                                                    )}
                                                >
                                                    <span className="truncate">
                                                        {endDate
                                                            ? format(parseDateString(endDate), "PPP")
                                                            : "Select end date"}
                                                    </span>
                                                    <CalendarIcon className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border border-outline-variant bg-surface-container shadow-2xl rounded-2xl" align="start">
                                                <ShadcnCalendar
                                                    mode="single"
                                                    selected={parseDateString(endDate)}
                                                    onSelect={(selectedDate) => {
                                                        if (selectedDate) {
                                                            setEndDate(formatDateString(selectedDate));
                                                        } else {
                                                            setEndDate('');
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-bold uppercase tracking-wider text-text-secondary">End Time</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary transition-all outline-none text-xs sm:text-sm flex items-center justify-between cursor-pointer",
                                                        !endTime && "text-text-secondary/50"
                                                    )}
                                                >
                                                    <span className="truncate">
                                                        {endTime ? formatTimeDisplay(endTime) : "Select end time"}
                                                    </span>
                                                    <Clock className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-44 p-1 border border-outline-variant bg-surface-container shadow-2xl rounded-2xl max-h-60 overflow-y-auto custom-scrollbar" align="start">
                                                <div className="flex flex-col gap-0.5">
                                                    {TIME_OPTIONS.map((t) => (
                                                        <button
                                                            key={t.value}
                                                            type="button"
                                                            onClick={() => setEndTime(t.value)}
                                                            className={cn(
                                                                "w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer border-none",
                                                                endTime === t.value
                                                                    ? "bg-primary-container text-white"
                                                                    : "text-text-primary hover:bg-surface-container-high"
                                                            )}
                                                        >
                                                            {t.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                        </section>


                    </div>
                </div>

                {/* Section Block: Location & Strategy */}
                <section className="bg-surface-container border border-outline-variant rounded-card p-5 sm:p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-card bg-primary-container/15 text-primary flex items-center justify-center shrink-0 shadow-xs">
                                <Target className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary text-[16px] uppercase tracking-wider">Location & Strategy</h4>
                                <p className="text-[14px] text-text-secondary">Venue parameters and audience scaling strategy</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-surface-container-high text-primary border border-outline-variant">
                            Step 03
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                        {/* Venue Location Field */}
                        <div className="lg:col-span-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[14px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                                    Venue Location / Virtual Link <span className="text-primary">*</span>
                                </label>
                                <span className="text-[14px] font-bold text-text-secondary uppercase tracking-wider">
                                    {formatType === 'Online' ? '🌐 Virtual Stream' : '📍 Physical Address'}
                                </span>
                            </div>
                            <div className="relative">
                                {formatType === 'Online' ? (
                                    <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50 pointer-events-none" />
                                ) : (
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50 pointer-events-none" />
                                )}
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-card pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-[14px] sm:text-[16px] font-medium"
                                    placeholder={formatType === 'Online' ? "https://meet.google.com/xyz or Zoom Link..." : "e.g. 100 Freedom Way, Main Hall, City Center..."}
                                />
                            </div>
                            {/* Quick Location Suggestion Presets */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[14px] font-bold text-text-secondary uppercase tracking-wider mr-1">Quick Presets:</span>
                                {[
                                    { label: 'City Hall Auditorium', val: 'City Hall Main Auditorium, 100 Civic Center Plaza' },
                                    { label: 'Community Center', val: 'Community Center - Room 204' },
                                    { label: 'Google Meet', val: 'https://meet.google.com/' }
                                ].map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => setLocation(preset.val)}
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-text-secondary hover:text-primary hover:bg-primary-container/20 border border-outline-variant transition-all cursor-pointer"
                                    >
                                        + {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Audience Capacity & Strategy Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[14px] font-bold uppercase tracking-wider text-text-secondary">Capacity Strategy</label>
                                <span className="text-[14px] font-extrabold uppercase tracking-wider text-primary">
                                    {capacity ? `${capacity} RSVPs` : 'Unlimited'}
                                </span>
                            </div>
                            <div className="relative">
                                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50 pointer-events-none" />
                                <input
                                    type="number"
                                    min="1"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-card pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm font-medium"
                                    placeholder="Unlimited entries"
                                />
                            </div>
                            {/* Capacity Strategy Preset Chips */}
                            <div className="flex items-center gap-1 pt-1">
                                {[
                                    { label: 'Unlimited', val: '' },
                                    { label: '50 Seats', val: '50' },
                                    { label: '200 Seats', val: '200' },
                                    { label: '500+', val: '500' }
                                ].map((capOption) => (
                                    <button
                                        key={capOption.label}
                                        type="button"
                                        onClick={() => setCapacity(capOption.val)}
                                        className={cn(
                                            "flex-1 text-[10px] font-bold py-1 rounded-md border transition-all cursor-pointer text-center",
                                            capacity === capOption.val
                                                ? "bg-primary-container text-white border-primary"
                                                : "bg-surface-container-high text-text-secondary hover:text-text-primary border-outline-variant"
                                        )}
                                    >
                                        {capOption.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Submission Action Bar Strip */}
                <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container border border-outline-variant rounded-card shadow-xs">
                    <p className="text-text-secondary text-[16px] font-bold max-w-sm text-center sm:text-left leading-relaxed">
                        Please verify all required parameters marked with <span className="text-primary font-bold">*</span> are logged before deploying item manifest onto feed index tables.
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => navigate('/events')}
                            className="flex-1 sm:flex-none px-5 py-2 rounded-card border border-outline-variant text-xs font-bold text-text-primary hover:bg-surface-container-high transition-all cursor-pointer bg-transparent"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "flex-1 sm:flex-none px-5 py-2 rounded-card bg-primary hover:brightness-110 text-on-primary font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer",
                                isSubmitting && "opacity-40 cursor-not-allowed"
                            )}
                        >
                            <span>{isSubmitting ? 'Launching Node...' : 'Launch Event'}</span>
                            <Rocket className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

            </form>

            {/* Global Theme Footer element */}
            <footer className="pt-12 text-center text-[11px] font-bold uppercase tracking-widest text-text-secondary/40 pb-4">
                © {new Date().getFullYear()} Kollective. Built for revolutionary community leadership. All Rights Reserved.
            </footer>
        </div>
    );
};