// src/pages/CreateActionPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAction } from '../features/organize/useOrganizeFeature';
import { DatePicker } from '../components/ui/date-picker';
import { cn } from "@/lib/utils"; // Adjust to your project utility directory location

export function CreateActionPage() {
    const navigate = useNavigate();
    const createActionMutation = useCreateAction();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        type: 'Protest',
        title: '',
        description: '',
        format: 'In-Person',
        venue: '',
        address: '',
        meetingLink: '',
        date: '',
        time: '',
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleNextStep = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Action title is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Core objective is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setStep(2);
    };

    const handlePrevStep = () => {
        setStep(1);
    };

    const handleLaunch = () => {
        const newErrors = {};
        if (formData.format === 'In-Person') {
            if (!formData.venue.trim()) {
                newErrors.venue = 'Venue name is required';
            }
        } else {
            if (!formData.meetingLink.trim()) {
                newErrors.meetingLink = 'Meeting link is required';
            }
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }
        if (!formData.time) {
            newErrors.time = 'Start time is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 🚀 STABILITY FIX: Safe fallback data computation matrix to shield against cross-browser ISO crashes
        let formattedTime = 'TBD';
        if (formData.date && formData.time) {
            try {
                const dateObj = new Date(`${formData.date}T${formData.time}`);
                if (!isNaN(dateObj.getTime())) {
                    const options = { month: 'short', day: 'numeric' };
                    const dateStr = dateObj.toLocaleDateString('en-US', options);
                    const timeStr = dateObj.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    });
                    formattedTime = `${dateStr.toUpperCase()} • ${timeStr}`;
                }
            } catch (e) {
                console.error("Failed to compile date time snapshot string parameters:", e);
                formattedTime = `${formData.date} @ ${formData.time}`;
            }
        }

        const actionLocation =
            formData.format === 'In-Person'
                ? `${formData.venue}, ${formData.address || ''}`.trim().replace(/,\$/, '')
                : 'Virtual Meeting Space';

        createActionMutation.mutate({
            type: formData.type,
            title: formData.title.trim(),
            description: formData.description.trim(),
            time: formattedTime,
            location: actionLocation,
            meetingLink: formData.meetingLink.trim(),
        }, {
            onSuccess: () => {
                navigate('/organize');
            }
        });
    };
    return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-0 text-left">
            {/* Navigation Breadcrumb / Back button */}
            <div className="mb-6 flex items-center justify-between select-none">
                <button
                    type="button"
                    onClick={() => navigate('/organize')}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-all text-sm font-semibold bg-transparent border-none cursor-pointer outline-none font-sans"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Organize
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column */}
                <div className="lg:col-span-8 flex flex-col gap-8">

                    {/* Step Progress Header Layout Panel */}
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6 select-none">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono transition-all text-sm",
                            step === 1 ? "bg-primary-container text-white crimson-glow" : "bg-white/[0.04] text-text-secondary"
                        )}>
                            1
                        </div>
                        <div className="h-[2px] w-12 bg-white/5"></div>
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono transition-all text-sm",
                            step === 2 ? "bg-primary-container text-white crimson-glow" : "bg-white/[0.04] text-text-secondary"
                        )}>
                            2
                        </div>

                        <div className="ml-auto text-right">
                            <h1 className="font-headline-md text-xl md:text-2xl font-black text-white tracking-tight">
                                Initiate New Action
                            </h1>
                            <p className="text-text-secondary text-xs font-mono uppercase tracking-wider mt-0.5">
                                Step {step} of 2: {step === 1 ? 'Defining the Mission' : 'Location & Logistics'}
                            </p>
                        </div>
                    </div>

                    {/* Form Panel Wrapper Card */}
                    <div className="bg-[#141414] p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

                        {/* Step 1 Core Metadata Selection Fields */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="font-headline-md text-lg md:text-xl font-bold text-white mb-6 uppercase tracking-wider font-mono select-none">
                                        Select Action Type
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                                        {[
                                            { type: 'Protest', icon: 'campaign', desc: 'Direct mobilization in public spaces to demand systemic change.' },
                                            { type: 'Town Hall', icon: 'groups', desc: 'Open forum for community discussion and direct representative engagement.' },
                                            { type: 'Rally', icon: 'diversity_3', desc: 'A mass gathering to build momentum and show solidarity for a cause.' },
                                            { type: 'Meeting', icon: 'handshake', desc: 'Strategic coordination or policy discussion among coalition members.' }
                                        ].map((item) => (
                                            <label key={item.type} className="relative group cursor-pointer block">
                                                <input
                                                    checked={formData.type === item.type}
                                                    onChange={() => handleInputChange('type', item.type)}
                                                    className="peer sr-only"
                                                    name="action_type"
                                                    type="radio"
                                                />
                                                <div className="p-5 rounded-xl border border-white/5 bg-[#0d1117] hover:bg-white/[0.01] transition-all group-hover:border-primary-container/30 peer-checked:border-primary-container peer-checked:bg-primary-container/10 h-full">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="material-symbols-outlined text-primary-container">{item.icon}</span>
                                                        <h3 className="font-black text-white text-base tracking-tight font-mono">{item.type}</h3>
                                                    </div>
                                                    <p className="text-xs text-text-secondary leading-relaxed font-sans font-normal">{item.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 font-mono select-none">Action Title</label>
                                        <input
                                            className={cn(
                                                "w-full bg-[#0d1117] border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-sans text-sm md:text-base font-medium",
                                                errors.title ? 'border-red-500' : 'border-white/10'
                                            )}
                                            placeholder="e.g. Climate Justice Mobilization"
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                        />
                                        {errors.title && <p className="text-red-400 text-xs font-mono font-bold mt-1.5 uppercase tracking-wide select-none"> {errors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 font-mono select-none">Core Objective</label>
                                        <textarea
                                            className={cn(
                                                "w-full bg-[#0d1117] border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-sans text-sm md:text-base font-normal min-h-[120px] h-32 resize-none",
                                                errors.description ? 'border-red-500' : 'border-white/10'
                                            )}
                                            placeholder="Describe the primary goal of this collective action?..."
                                            rows="4"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                        />
                                        {errors.description && <p className="text-red-400 text-xs font-mono font-bold mt-1.5 uppercase tracking-wide select-none"> {errors.description}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2 Content Layout */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="font-headline-md text-lg md:text-xl font-bold text-white mb-6 uppercase tracking-wider font-mono select-none">Location & Logistics</h2>

                                    {/* Format Toggle Switch */}
                                    <div className="mb-6 select-none font-mono">
                                        <label className="block font-bold text-xs text-text-secondary uppercase tracking-wider mb-3">Participation Format</label>
                                        <div className="flex p-1 bg-[#0d1117] rounded-xl border border-white/10 w-fit">
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange('format', 'In-Person')}
                                                className={cn("px-6 py-2 rounded-lg font-bold text-xs transition-all border-none cursor-pointer outline-none", formData.format === 'In-Person' ? "bg-primary-container text-white crimson-glow" : "text-text-secondary hover:text-white")}
                                            >
                                                In-Person
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange('format', 'Online')}
                                                className={cn("px-6 py-2 rounded-lg font-bold text-xs transition-all border-none cursor-pointer outline-none", formData.format === 'Online' ? "bg-primary-container text-white crimson-glow" : "text-text-secondary hover:text-white")}
                                            >
                                                Online/Virtual
                                            </button>
                                        </div>
                                    </div>

                                    {/* Format Conditional Inputs */}
                                    {formData.format === 'In-Person' ? (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                            <div>
                                                <label className="block font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 font-mono">Venue Name</label>
                                                <input
                                                    className={cn("w-full bg-[#0d1117] border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-sans text-sm md:text-base font-medium", errors.venue ? 'border-red-500' : 'border-white/10')}
                                                    placeholder="e.g. City Hall Plaza"
                                                    type="text"
                                                    value={formData.venue}
                                                    onChange={(e) => handleInputChange('venue', e.target.value)}
                                                />
                                                {errors.venue && <p className="text-red-400 text-xs font-mono font-bold mt-1.5 uppercase tracking-wide select-none"> {errors.venue}</p>}
                                            </div>
                                            <div>
                                                <label className="block font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 font-mono">Full Address</label>
                                                <input
                                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-sans text-sm md:text-base font-medium"
                                                    placeholder="Street, City, State, ZIP"
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                            <div>
                                                <label className="block font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 font-mono">Meeting Link (Secure)</label>
                                                <input
                                                    className={cn("w-full bg-[#0d1117] border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-sans text-sm md:text-base font-medium", errors.meetingLink ? 'border-red-500' : 'border-white/10')}
                                                    placeholder="https://zoom.us..."
                                                    type="url"
                                                    value={formData.meetingLink}
                                                    onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                                                />
                                                {errors.meetingLink && <p className="text-red-400 text-xs font-mono font-bold mt-1.5 uppercase tracking-wide select-none"> {errors.meetingLink}</p>}
                                            </div>
                                            <div className="p-4 rounded-xl bg-primary-container/[0.02] border border-primary-container/20 flex gap-3 text-xs select-none">
                                                <span className="material-symbols-outlined text-primary-container text-base">shield_person</span>
                                                <p className="text-text-secondary leading-relaxed font-sans font-medium">Links are only shared securely with verified coalition members after RSVP action confirmation.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Date & Time shared fields block */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                        <div>
                                            <label className="block font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 font-mono">Date</label>
                                            <DatePicker
                                                value={formData.date}
                                                onChange={(val) => handleInputChange('date', val)}
                                                className={errors.date ? 'border-red-500' : 'border-white/10'}
                                                placeholder="Select date"
                                            />
                                            {errors.date && <p className="text-red-400 text-xs font-mono font-bold mt-1.5 uppercase tracking-wide select-none"> {errors.date}</p>}
                                        </div>
                                        <div>
                                            <label className="block font-bold text-xs text-text-secondary uppercase tracking-wider mb-2 font-mono">Start Time</label>
                                            <input
                                                className={cn("w-full bg-[#0d1117] border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all font-sans text-sm md:text-base font-mono font-medium", errors.time ? 'border-red-500' : 'border-white/10')}
                                                type="time"
                                                value={formData.time}
                                                onChange={(e) => handleInputChange('time', e.target.value)}
                                            />
                                            {errors.time && <p className="text-red-400 text-xs font-mono font-bold mt-1.5 uppercase tracking-wide select-none"> {errors.time}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Navigation buttons */}
                        <div className="mt-12 flex justify-between items-center border-t border-white/10 pt-8 select-none font-mono text-xs">
                            {step === 2 ? (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="flex items-center gap-2 text-text-secondary hover:text-white font-bold bg-transparent border-none cursor-pointer transition-all outline-none font-sans"
                                >
                                    <span className="material-symbols-outlined text-base">arrow_back</span>
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {step === 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="flex items-center gap-2 bg-primary-container text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary-container/20 hover:scale-102 active:scale-95 transition-all cursor-pointer border-none font-sans"
                                >
                                    Next Step
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleLaunch}
                                    className="flex items-center gap-2 bg-secondary text-black px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-102 active:scale-95 transition-all cursor-pointer border-none font-sans"
                                >
                                    Launch Action
                                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* Live Preview Sidebar Sidebar Column Area */}
                <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 text-left font-sans">
                    <h3 className="font-bold text-sm md:text-sm text-text-secondary uppercase tracking-widest font-mono select-none">
                        Live Preview
                    </h3>

                    <div className="relative overflow-hidden rounded-2xl bg-[#141414] border border-white/10 shadow-2xl transition-all hover:shadow-primary-container/10">
                        <div className="h-44 relative overflow-hidden bg-black/40 border-b border-white/5 select-none">
                            <img
                                alt="Action Preview"
                                src='data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231a1a1c"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8" fill="%23444">MOBILIZATION_PREVIEW</text></svg>'
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover opacity-50 grayscale transition-all duration-300"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231a1a1c"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8" fill="%23e53e3e">ACCESS_BLOCKED</text></svg>';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
                            <div className="absolute top-4 left-4 font-mono select-none">
                                <span className="bg-primary-container text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 shadow-sm crimson-glow">
                                    {formData.type}
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4 gap-4">
                                <h4 className="font-headline-md text-base md:text-lg font-black text-white leading-snug break-words tracking-tight">
                                    {formData.title.trim() || 'Untitled Action'}
                                </h4>
                                <div className="flex items-center gap-1 text-amber-400 flex-shrink-0 font-mono text-[10px] font-bold uppercase select-none">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    <span>Official</span>
                                </div>
                            </div>

                            <p className="text-sm md:text-sm text-text-secondary line-clamp-3 mb-6 leading-relaxed font-normal min-h-[3rem]">
                                {formData.description.trim() || "Your action's core objective will appear here as you define the mission in step 1."}
                            </p>

                            <div className="space-y-3 pt-4 border-t border-white/5 font-mono text-xs text-text-secondary select-none">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-base text-primary-container">calendar_today</span>
                                    <span className="font-semibold uppercase tracking-wide">
                                        {formData.date && formData.time ? (
                                            (() => {
                                                try {
                                                    return new Date(`${formData.date}T${formData.time}`).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
                                                    }).toUpperCase();
                                                } catch { return 'INVALID_DATETIME_FORMAT'; }
                                            })()
                                        ) : 'TBD'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-base text-primary-container">location_on</span>
                                    <span className="font-semibold uppercase tracking-wide truncate max-w-[180px]">
                                        {formData.format === 'In-Person'
                                            ? formData.venue.trim() || 'Location not set'
                                            : 'Virtual Meeting Space'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between font-mono text-xs">
                                <div className="flex -space-x-2 select-none font-sans">
                                    <div className="w-8 h-8 rounded-full border-2 border-[#141414] bg-[#262626] flex items-center justify-center text-[11px] font-bold text-white uppercase tracking-wider">
                                        JD
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-[#141414] bg-[#1a1a1a] flex items-center justify-center text-[11px] font-bold text-text-secondary">
                                        +0
                                    </div>
                                </div>
                                <span className="font-bold uppercase text-primary-container tracking-wider text-[11px]">
                                    Initiated by Julian T.
                                </span>
                            </div>
                        </div>

                        <div className="h-1.5 w-full bg-[#262626] overflow-hidden select-none">
                            <div className="h-full bg-primary-container w-1/3 animate-pulse"></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#141414] border border-white/5 flex gap-3 text-left">
                        <span className="material-symbols-outlined text-amber-400 text-xl flex-shrink-0 select-none">
                            info
                        </span>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans font-medium">
                            <strong className="text-amber-400 block mb-0.5 font-mono uppercase tracking-wider text-[10px]">Impact Estimation</strong>
                            This action type typically attracts <span className="text-primary-container font-extrabold font-mono">200-500</span> participants within this coalition's regional reach grid.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
