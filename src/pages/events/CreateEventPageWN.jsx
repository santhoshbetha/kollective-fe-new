// src/pages/CreateEventPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../../features/events/useEventsFeature';
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
    Video
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

export function CreateEventPage() {
    const navigate = useNavigate();
    const createEventMutation = useCreateEvent();

    // UNIFIED COMPOSABLE STATE CORE
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

        if (!title.trim()) return triggerToast('Event title is required.');
        if (!description.trim()) return triggerToast('Event description is required.');
        if (!startDate || !startTime) return triggerToast('Start date and time are required.');
        if (!location.trim()) return triggerToast('Event location is required.');

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
                const finalEndDate = endDate || startDate;
                if (finalEndDate && endTime) {
                    end_time = new Date(`${finalEndDate}T${endTime}`).toISOString();
                }
            } catch { end_time = null; }

            const formatMapping = {
                'In-Person': 'in_person',
                'Online': 'online_virtual',
                'Hybrid': 'hybrid',
            };

            const newEvent = {
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

            createEventMutation.mutate(newEvent, {
                onSuccess: () => {
                    triggerToast('Event successfully launched!', 'success');
                    setTimeout(() => navigate('/events'), 1200);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative space-y-8 isolate font-sans bg-[#090d12]X">
            {/* Embedded Floating Toast Notification */}
            {toastMessage && (
                <div className={cn(
                    "fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in duration-200",
                    toastMessage.type === 'success' ? "bg-green-600 text-white" : "bg-[#a10836] text-white"
                )}>
                    <span>{toastMessage.msg}</span>
                    <button type="button" onClick={() => setToastMessage(null)} className="bg-transparent border-none text-white cursor-pointer ml-2">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Back Navigation Row */}
            <div className="flex items-center justify-between select-none">
                <button
                    type="button"
                    onClick={() => navigate('/events')}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-white transition-colors group cursor-pointer border-none bg-transparent font-mono outline-none"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Events</span>
                </button>
            </div>

            {/* Headline Header & Cover Image Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-white/5 pb-8">
                <div className="md:col-span-2 space-y-3 text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 border border-white/5 text-primary-container font-mono font-bold text-[10px] uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" /> Create New Node Manifest
                    </span>
                    <h2 className="text-3xl font-black tracking-tight text-white font-headline-lg">
                        Share Your Event
                    </h2>
                    <p className="text-sm text-text-secondary leading-relaxed max-w-xl font-medium">
                        Bring your community together for shared experiences, common causes, and revolutionary gatherings across the decentralized network feed.
                    </p>
                </div>

                <div className="w-full max-w-sm mx-auto bg-[#141414] border border-white/5 p-3 rounded-2xl shadow-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                        <span className="flex items-center gap-1"><UploadCloud className="w-3.5 h-3.5 text-primary-container" /> Aspect Preview</span>
                        <button
                            type="button"
                            onClick={() => setShowImagePicker(!showImagePicker)}
                            className="text-primary-container hover:underline bg-transparent border-none cursor-pointer"
                        >
                            {showImagePicker ? 'Close Presets' : 'Templates'}
                        </button>
                    </div>

                    <div className="aspect-video w-full relative rounded-xl overflow-hidden bg-black/40 border border-white/5 group">
                        <ImageUploader
                            mode="banner"
                            aspectRatio={16 / 9}
                            value={coverImage}
                            onChange={(newImage) => setCoverImage(newImage)}
                            onImageRemove={() => setCoverImage('')}
                            label="Upload Cover"
                        />
                    </div>

                    {showImagePicker && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                            {PRESET_COVERS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => setCoverImage(preset.url)}
                                    className={cn(
                                        "relative aspect-video rounded-lg overflow-hidden border transition-all cursor-pointer group p-0 bg-black/40",
                                        coverImage === preset.url ? "border-primary-container ring-1 ring-primary-container" : "border-white/10 hover:border-white/30"
                                    )}
                                >
                                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <span className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[9px] text-white truncate text-center font-mono">
                                        {preset.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Master Event Form */}
            <form onSubmit={handleCreate} className="space-y-6">
                {/* Event Details: Title & Description */}
                <section className="bg-[#141414] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5 text-left">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <div className="w-8 h-8 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0">
                            <Type className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono">Event Details</h4>
                    </div>

                    <div className="space-y-4">
                        {/* Title Input */}
                        <div className="space-y-1.5 font-mono">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                                    Event Title <span className="text-primary-container">*</span>
                                </label>
                            </div>
                            <div className="relative">
                                <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={100}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-primary-container focus:outline-none transition-all font-sans font-medium"
                                    placeholder="e.g. Climate Action Townhall 2026..."
                                    required
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px]">
                                <span className="font-bold text-text-secondary uppercase tracking-wider mr-1">Ideas:</span>
                                {['Community Workshop', 'Tech Summit', 'Townhall Gathering', 'Action Rally'].map((chip) => (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => !title && setTitle(chip)}
                                        className="font-bold px-2 py-0.5 rounded-full bg-white/[0.02] border border-white/5 text-text-secondary hover:text-white hover:border-primary-container cursor-pointer transition-all"
                                    >
                                        + {chip}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description Textarea */}
                        <div className="space-y-1.5 font-mono">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                                    Description <span className="text-primary-container">*</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    {[
                                        { label: '+ Agenda', text: '\n\n🗓️ AGENDA:\n• 10:00 AM - Opening Remarks\n• 11:00 AM - Keynote' },
                                        { label: '+ Speakers', text: '\n\n🎙️ SPEAKERS:\n• TBD' },
                                        { label: '+ FAQ', text: '\n\n❓ FAQ:\n• Parking available on-site' }
                                    ].map((tool) => (
                                        <button
                                            key={tool.label}
                                            type="button"
                                            onClick={() => setDescription((prev) => prev + tool.text)}
                                            className="font-bold px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] text-text-secondary hover:text-white hover:border-primary-container cursor-pointer text-[9px] transition-all"
                                        >
                                            {tool.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-text-secondary/50" />
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    maxLength={2000}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:border-primary-container focus:outline-none transition-all font-sans font-medium resize-none"
                                    placeholder="Describe your event parameters, agenda, topics, speakers, and instructions for attendees..."
                                    required
                                />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-mono text-text-secondary/60">
                                <span>Clear details improve attendee engagement</span>
                                <span className={cn(description.length > 1800 ? "text-amber-400 font-bold" : "")}>{description.length}/2000</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Classification & Schedule Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Classification Dropdowns */}
                    <section className="bg-[#141414] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                            <div className="w-8 h-8 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono text-left">Event Classification</h4>
                        </div>

                        <div className="space-y-4 text-left">
                            <div className="space-y-1.5 select-none font-mono">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Event Format</label>
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
                                                    "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer text-[10px] font-bold",
                                                    active
                                                        ? "bg-primary-container/15 border-primary-container text-primary-container shadow-sm"
                                                        : "bg-[#0d1117] border-white/5 text-text-secondary hover:text-text-primary hover:bg-white/[0.02]"
                                                )}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary font-mono select-none">Category</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:border-primary-container transition-all outline-none text-xs flex items-center justify-between cursor-pointer font-medium"
                                        >
                                            <span className="truncate flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-primary-container shrink-0" />
                                                <span>{category || "Select category"}</span>
                                            </span>
                                            <ChevronDown className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-1 border border-white/10 bg-[#141414] shadow-2xl rounded-2xl max-h-60 overflow-y-auto custom-scrollbar z-50" align="start">
                                        <div className="flex flex-col gap-0.5 p-1 select-none">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setCategory(cat)}
                                                    className={cn(
                                                        "w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer border-none flex items-center justify-between font-sans",
                                                        category === cat ? "bg-primary-container text-white" : "text-text-primary hover:bg-white/5"
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

                    {/* Timing Schedules */}
                    <section className="bg-[#141414] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                            <div className="w-8 h-8 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0">
                                <CalendarIcon className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono text-left">Timing Schedules</h4>
                        </div>

                        <div className="space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary font-mono select-none">Start Date *</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:border-primary-container transition-all outline-none text-xs flex items-center justify-between cursor-pointer font-medium",
                                                    !startDate && "text-text-secondary/40"
                                                )}
                                            >
                                                <span className="truncate">
                                                    {startDate ? format(parseDateString(startDate), "PPP") : "Pick start date"}
                                                </span>
                                                <CalendarIcon className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border border-white/10 bg-[#141414] shadow-2xl rounded-2xl z-50" align="start">
                                            <ShadcnCalendar
                                                mode="single"
                                                selected={parseDateString(startDate)}
                                                onSelect={(d) => d && setStartDate(formatDateString(d))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary font-mono select-none">Start Time *</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:border-primary-container transition-all outline-none text-xs flex items-center justify-between cursor-pointer font-medium",
                                                    !startTime && "text-text-secondary/40"
                                                )}
                                            >
                                                <span className="truncate">
                                                    {startTime ? formatTimeDisplay(startTime) : "Pick start time"}
                                                </span>
                                                <Clock className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-44 p-1 border border-white/10 bg-[#141414] shadow-2xl rounded-2xl max-h-60 overflow-y-auto custom-scrollbar z-50" align="start">
                                            <div className="flex flex-col gap-0.5 select-none font-mono">
                                                {TIME_OPTIONS.map((t) => (
                                                    <button
                                                        key={t.value}
                                                        type="button"
                                                        onClick={() => setStartTime(t.value)}
                                                        className={cn(
                                                            "w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer border-none font-sans",
                                                            startTime === t.value ? "bg-primary-container text-white" : "text-text-primary hover:bg-white/5"
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
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary font-mono select-none">End Date</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:border-primary-container transition-all outline-none text-xs flex items-center justify-between cursor-pointer font-medium",
                                                    !endDate && "text-text-secondary/40"
                                                )}
                                            >
                                                <span className="truncate">
                                                    {endDate ? format(parseDateString(endDate), "PPP") : "Pick end date"}
                                                </span>
                                                <CalendarIcon className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border border-white/10 bg-[#141414] shadow-2xl rounded-2xl z-50" align="start">
                                            <ShadcnCalendar
                                                mode="single"
                                                selected={parseDateString(endDate)}
                                                onSelect={(d) => setEndDate(d ? formatDateString(d) : '')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary font-mono select-none">End Time</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-text-primary focus:border-primary-container transition-all outline-none text-xs flex items-center justify-between cursor-pointer font-medium",
                                                    !endTime && "text-text-secondary/40"
                                                )}
                                            >
                                                <span className="truncate">
                                                    {endTime ? formatTimeDisplay(endTime) : "Pick end time"}
                                                </span>
                                                <Clock className="w-4 h-4 text-text-secondary shrink-0 ml-1" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-44 p-1 border border-white/10 bg-[#141414] shadow-2xl rounded-2xl max-h-60 overflow-y-auto custom-scrollbar z-50" align="start">
                                            <div className="flex flex-col gap-0.5 select-none font-mono">
                                                {TIME_OPTIONS.map((t) => (
                                                    <button
                                                        key={t.value}
                                                        type="button"
                                                        onClick={() => setEndTime(t.value)}
                                                        className={cn(
                                                            "w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer border-none font-sans",
                                                            endTime === t.value ? "bg-primary-container text-white" : "text-text-primary hover:bg-white/5"
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

                {/* Location & Capacity Fields */}
                <section className="bg-[#141414] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5 text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0 shadow-sm">
                                <Target className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono">Location & Capacity</h4>
                                <p className="text-xs text-text-secondary">Venue parameters and audience scaling strategy</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                        <div className="lg:col-span-2 space-y-2">
                            <div className="flex justify-between items-center select-none font-mono text-[10px] text-text-secondary">
                                <label className="font-bold uppercase tracking-wider">Venue Location / Virtual Link *</label>
                                <span className="font-bold uppercase tracking-wider">{formatType === 'Online' ? '🌐 Virtual Stream' : '📍 Physical Address'}</span>
                            </div>
                            <div className="relative">
                                {formatType === 'Online' ? <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" /> : <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />}
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary-container focus:outline-none transition-all font-medium"
                                    placeholder={formatType === 'Online' ? "https://google.com or Zoom Link..." : "e.g. 100 Freedom Way, Main Hall, City Center..."}
                                    required
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 select-none font-mono text-[9px]">
                                <span className="font-bold text-text-secondary uppercase tracking-wider mr-1">Quick Presets:</span>
                                {[
                                    { label: 'City Hall Auditorium', val: 'City Hall Main Auditorium, 100 Civic Center Plaza' },
                                    { label: 'Community Center', val: 'Community Center - Room 204' },
                                    { label: 'Google Meet', val: 'https://google.com' }
                                ].map((preset) => (
                                    <button key={preset.label} type="button" onClick={() => setLocation(preset.val)} className="font-bold px-2 py-0.5 rounded-full bg-white/[0.02] border border-white/5 text-text-secondary hover:text-white hover:border-primary-container cursor-pointer">+ {preset.label}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center select-none font-mono text-[10px] text-text-secondary">
                                <label className="font-bold uppercase tracking-wider">Capacity Strategy</label>
                                <span className="font-extrabold uppercase tracking-wider text-primary-container">{capacity ? `${capacity} RSVPs` : 'Unlimited'}</span>
                            </div>
                            <div className="relative">
                                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                                <input
                                    type="number"
                                    min="1"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary-container focus:outline-none transition-all font-mono font-medium"
                                    placeholder="Unlimited entries"
                                />
                            </div>
                            <div className="flex items-center gap-1 pt-1 select-none font-mono text-[9px]">
                                {[
                                    { label: 'Unlimited', val: '' },
                                    { label: '50 Seats', val: '50' },
                                    { label: '200 Seats', val: '200' },
                                    { label: '500+', val: '500' }
                                ].map((capOption) => (
                                    <button key={capOption.label} type="button" onClick={() => setCapacity(capOption.val)} className={cn("flex-1 font-bold py-1 rounded border transition-all cursor-pointer text-center", capacity === capOption.val ? "bg-primary-container text-white border-primary-container shadow-sm" : "bg-white/[0.02] border-white/5 text-text-secondary hover:text-white")}>{capOption.label}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Submission Action Bar Strip */}
                <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141414] border border-white/5 rounded-2xl shadow-sm">
                    <p className="text-text-secondary text-xs max-w-sm text-center sm:text-left leading-relaxed font-sans">
                        Please verify all required parameters marked with <span className="text-primary-container font-bold">*</span> are logged before deploying item manifest onto feed index tables.
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto font-mono select-none">
                        <button
                            type="button"
                            onClick={() => navigate('/events')}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer bg-transparent"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-primary-container hover:brightness-110 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-none crimson-glow",
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
            <footer className="pt-12 text-center text-[10px] font-bold uppercase tracking-widest text-text-secondary/30 pb-4 font-mono select-none">
                © {new Date().getFullYear()} Kollective. Built for revolutionary community leadership. All Rights Reserved.
            </footer>
        </div>
    );
}
