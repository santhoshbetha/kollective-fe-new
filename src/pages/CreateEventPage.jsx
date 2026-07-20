import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../features/events/useCreateEvent';
import {
    ArrowLeft,
    Sparkles,
    Info,
    Calendar,
    MapPin,
    Users,
    Rocket,
    UploadCloud,
    X
} from 'lucide-react';
import { cn } from "@/lib/utils";
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

    const handleCreate = (e) => {
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

        const newEvent = {
            title,
            description,
            format: formatType,
            category,
            date: formattedDate,
            displayDate,
            time: `${startTime} ${endTime ? `- ${endTime}` : ''}`,
            location,
            capacity: capacity ? parseInt(capacity, 10) : null,
            image: coverImage,
        };

        createEventMutation.mutate(newEvent, {
            onSuccess: () => {
                toast.success('Event successfully launched!');
                setTimeout(() => {
                    navigate('/events');
                }, 1200);
            },
            onError: (err) => {
                setIsSubmitting(false);
                triggerToast(err?.message || 'Error occurred while creating event.');
            }
        });
    };

    return (
        <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-gutter)] relative space-y-8 isolate font-sans">

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
                <section className="bg-surface-container border border-outline-variant rounded-card p-5 relative overflow-hidden">
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-outline-variant/60 rounded-card bg-surface-container-low hover:bg-surface-container-high transition-all group relative min-h-64">
                        {coverImage ? (
                            <div className="w-full max-h-72 overflow-hidden rounded-card relative">
                                <img
                                    src={coverImage}
                                    alt="Selected Manifest Cover Node Preview"
                                    className="w-full h-full object-cover object-center max-h-72"
                                />
                                <div className="absolute inset-0 bg-inverse-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    <button
                                        type="button"
                                        onClick={() => setShowImagePicker(true)}
                                        className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-card text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-98 transition-all border-none cursor-pointer"
                                    >
                                        Change Cover Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 px-4">
                                <div className="w-12 h-12 rounded-card bg-primary-container/10 text-primary flex items-center justify-center mx-auto transition-transform group-hover:scale-105">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-sm sm:text-base">Event Cover Image</h3>
                                    <p className="text-xs text-text-secondary max-w-xs mx-auto mt-1 leading-relaxed">
                                        Select a stunning template to customize your event blueprint interface.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowImagePicker(true)}
                                    className="px-4 py-2 bg-surface-container border border-outline-variant rounded-card text-xs font-bold text-text-primary hover:bg-surface-container-high transition-all cursor-pointer"
                                >
                                    Choose Template Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Inline Preset template image collection portal context */}
                    {showImagePicker && (
                        <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center p-4 z-20 animate-fadeIn">
                            <div className="max-w-xl w-full bg-surface border border-outline-variant p-5 rounded-card shadow-2xl space-y-4">
                                <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
                                    <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">Select Event Cover</h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowImagePicker(false)}
                                        className="p-1.5 rounded-card hover:bg-surface-container-high text-text-secondary hover:text-text-primary cursor-pointer bg-transparent border-none"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
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
                                            <div className="absolute inset-x-0 bottom-0 bg-inverse-surface/70 p-1.5 text-center truncate">
                                                <span className="text-[11px] font-bold text-white uppercase tracking-wider">{preset.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-center text-xs text-text-secondary">Click a cover design block layout slot above to load state configurations.</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Form Fields split grid matrix rows */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left Column: Basic Information and Copy Block Context inputs */}
                    <section className="bg-surface-container border border-outline-variant rounded-card p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/40">
                            <div className="w-8 h-8 rounded-card bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                                <Info className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">Basic Information</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                                    Event Title <span className="text-primary">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary placeholder:text-text-secondary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm"
                                    placeholder="Enter a descriptive event title..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="desc" className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                                    Description <span className="text-primary">*</span>
                                </label>
                                <textarea
                                    id="desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="6"
                                    maxLength="2000"
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary placeholder:text-text-secondary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm resize-none"
                                    placeholder="Describe your event parameters..."
                                />
                                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-text-secondary/60 px-0.5">
                                    <span>Schedules, panel tracking lists, coordination points.</span>
                                    <span>{description.length}/2000</span>
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
                                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">Event Classification</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Event Format</label>
                                    <select
                                        value={formatType}
                                        onChange={(e) => setFormatType(e.target.value)}
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm cursor-pointer appearance-none"
                                    >
                                        <option value="In-Person">In-Person</option>
                                        <option value="Online">Online/Virtual</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm cursor-pointer appearance-none"
                                    >
                                        <option value="Technology">Technology</option>
                                        <option value="Politics">Politics</option>
                                        <option value="Education">Education</option>
                                        <option value="Arts">Arts</option>
                                        <option value="Climate">Climate</option>
                                        <option value="Environment">Environment</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Box: Timing Schedules & Native Calendar Input Nodes */}
                        <section className="bg-surface-container border border-outline-variant rounded-card p-5 sm:p-6 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/40">
                                <div className="w-8 h-8 rounded-card bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">Timing Schedules</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Start Date *</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="custom-date-input w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Start Time *</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="custom-date-input w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">End Time</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>

                {/* Section Block: Location & Limits */}
                <section className="bg-surface-container border border-outline-variant rounded-card p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/40">
                        <div className="w-8 h-8 rounded-card bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">Location & Capacity</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Venue Location *</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-card px-4 py-2.5 text-text-primary placeholder:text-text-secondary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm"
                                placeholder="Enter physical address string coordinates or stream hyperlinks..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Maximum Attendees</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50 pointer-events-none" />
                                <input
                                    type="number"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-card pl-9 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-xs sm:text-sm"
                                    placeholder="Unlimited entries"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Submission Action Bar Strip */}
                <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container border border-outline-variant rounded-card shadow-xs">
                    <p className="text-text-secondary text-xs font-bold max-w-sm text-center sm:text-left leading-relaxed">
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