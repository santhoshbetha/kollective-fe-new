// src/pages/PostBusinessPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBusiness } from '../features/businesses/useBusinessesFeature';
import { useAuthStore } from '../store/auth/useAuthStore';
import { ImageUploader } from '../components/ImageUploader';
import { uploadProfileImageToR2 } from '../utils/uploadMedia';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { ChevronDown, Check, Info, MapPin, Clock, Plus, X, Sparkles, Building, Briefcase, Globe } from 'lucide-react';
import { cn } from "@/lib/utils";

const CATEGORIES = [
    'Food & Beverage', 'Grocery Store', 'Healthcare', 'Transportation',
    'Retail & Crafts', 'Fitness & Wellness', 'Beauty & Personal Care',
    'Agriculture', 'Cleaning Services', 'Movers', 'Technology',
    'Professional Services', 'Legal Services', 'Tax Services',
    'Manufacturing', 'Construction'
];

const LEGAL_STRUCTURES = [
    'Cooperative (Recommended)', 'Worker-Owned Co-op', 'Community Land Trust',
    'Non-Profit', 'Mutual Aid', 'LLC', 'Sole Proprietorship'
];

const formatTimeDisplay = (time24) => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    if (!hStr || !mStr) return time24;
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${period}`;
};

const TIME_OPTIONS = (() => {
    const options = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            options.push({ value: `${hh}:${mm}`, label: formatTimeDisplay(`${hh}:${mm}`) });
        }
    }
    return options;
})();

export function PostBusinessPage() {
    const navigate = useNavigate();
    const createBusinessMutation = useCreateBusiness();
    const user = useAuthStore((state) => state.user);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Manufacturing',
        legalStructure: 'Cooperative (Recommended)',
        description: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        email: '',
        phone: '',
        website: '',
        established: new Date().getFullYear().toString(),
        employees: '1-5',
        // 🚀 THE ORB SECURITY FIX: Swapped out network request with an open base64 image vector data string
        image: 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231a1a1c"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="10" fill="%23555">NO_IMAGE_UPLOADED</text></svg>',
    });

    // 🚀 REFACTOR FIX: State fields replacing old string hours block
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    const [selectedTags, setSelectedTags] = useState(['Worker-Owned', 'Unionized Shop']);
    const [availableTags, setAvailableTags] = useState([
        'Fair Wage Certified', 'Local Sourcing', 'Eco-Friendly',
        'Community Funded', 'Democratic Governance', 'Open Book Management'
    ]);
    const [customTag, setCustomTag] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const triggerToast = (msg, type = 'error') => {
        setToastMessage({ msg, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleTag = (tag, isSelected) => {
        if (isSelected) {
            setSelectedTags((prev) => prev.filter((t) => t !== tag));
            setAvailableTags((prev) => [...prev, tag]);
        } else {
            setAvailableTags((prev) => prev.filter((t) => t !== tag));
            setSelectedTags((prev) => [...prev, tag]);
        }
    };

    const handleAddCustomTag = (e) => {
        e.preventDefault();
        const cleanTag = customTag.trim();
        if (cleanTag && !selectedTags.includes(cleanTag)) {
            setSelectedTags((prev) => [...prev, cleanTag]);
            setCustomTag('');
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData.name.trim() || !formData.description.trim()) {
            triggerToast('Please fill out the business name and description.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = formData.image;
            if (formData.image && (formData.image.startsWith('data:') || formData.image instanceof File)) {
                finalImageUrl = await uploadProfileImageToR2(formData.image, 'business');
            }

            // Compute formatting values dynamically 
            const computedHours = `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`;

            const businessData = {
                name: formData.name.trim(),
                category: formData.category,
                legalStructure: formData.legalStructure,
                legal_structure: formData.legalStructure,
                description: formData.description.trim(),
                address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                email: formData.email,
                phone: formData.phone,
                website: formData.website || 'kollective.social',
                established: parseInt(formData.established, 10) || new Date().getFullYear(),
                year_established: parseInt(formData.established, 10) || new Date().getFullYear(),
                employees: formData.employees,
                number_of_employees: parseInt(formData.employees, 10) || 5,
                hours: computedHours,
                business_hours: computedHours,
                image: finalImageUrl,
                profile_image_url: finalImageUrl,
                services: selectedTags,
                tags: selectedTags,
                owner: user?.username || 'anonymous',
                ownerAvatar: user?.avatar_url || '',
                rating: 5.0,
                reviewsCount: 0,
                verified: false,
                open: true,
                metadata: {
                    business_hours: computedHours,
                    hours: computedHours,
                    services: selectedTags,
                    tags: selectedTags,
                    employee_range: formData.employees,
                    established: parseInt(formData.established, 10) || new Date().getFullYear(),
                    rating: 5.0,
                    reviews_count: 0,
                    owner_handle: user?.username || 'anonymous',
                    owner_avatar: user?.avatar_url || '',
                    image_url: finalImageUrl
                }
            };

            createBusinessMutation.mutate(businessData, {
                onSuccess: () => {
                    triggerToast('Enterprise successfully registered!', 'success');
                    setTimeout(() => {
                        setIsSubmitting(false);
                        navigate('/businesses');
                    }, 1200);
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    triggerToast(err?.message || 'Failed to register business.', 'error');
                }
            });
        } catch (err) {
            triggerToast('Failed to upload business image. Please try again.', 'error');
            setIsSubmitting(false);
        }
    };
    return (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 relative space-y-8 bg-[#090d12]X">
            {/* 🥞 Embedded Floating Toast Notification */}
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

            {/* 🗺️ Breadcrumb & Navigation Actions Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6 select-none text-left">
                <div>
                    <nav className="flex items-center gap-2 text-text-secondary text-[14px] font-mono font-bold mb-3 uppercase tracking-widest">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/businesses')}>Businesses</span>
                        <ChevronDown className="w-3 h-3 text-text-secondary rotate-270" />
                        <span className="text-primary-container">Post Business Node</span>
                    </nav>
                    <h1 className="font-headline-lg text-3xl font-black text-white tracking-tight">List Your Enterprise</h1>
                    <p className="text-text-secondary font-medium text-lg max-w-xl mt-1.5 leading-relaxed font-sans">
                        Scale the collective economy by sharing your local business with the community. Let's build systemic resilience together.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto font-mono text-xs">
                    <button
                        type="button"
                        onClick={() => navigate('/businesses')}
                        className="flex-1 sm:flex-none px-6 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 hover:text-white transition-all font-bold cursor-pointer bg-transparent"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-8 py-3 bg-primary-container text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all crimson-glow flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed border-none shadow-lg"
                    >
                        {isSubmitting ? 'Publishing Matrix...' : 'Publish Enterprise'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 📋 Left Column Content Block Shell */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Section Matrix: Basic Information */}
                    <section className="bg-[#141414] p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="flex items-center gap-3 mb-6 select-none font-mono">
                            <span className="material-symbols-outlined text-primary-container">info</span>
                            <h3 className="font-headline-md text-sm font-bold uppercase tracking-wider text-white">Basic Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Business Name *</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="e.g. Iron & Grain Cooperative"
                                    type="text"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Category *</label>
                                <div className="relative group">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm appearance-none cursor-pointer outline-none font-medium pr-10"
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#141414] text-white">{cat}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary-container" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Legal Structure *</label>
                                <div className="relative group">
                                    <select
                                        name="legalStructure"
                                        value={formData.legalStructure}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm appearance-none cursor-pointer outline-none font-medium pr-10"
                                    >
                                        {LEGAL_STRUCTURES.map(struct => <option key={struct} value={struct} className="bg-[#141414] text-white">{struct}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary-container" />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Business Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm placeholder:text-text-secondary/30 min-h-[120px] h-32 resize-none font-normal"
                                    placeholder="Tell the community about your mission, values, and what makes your business unique..."
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </section>
                    {/* Section Matrix: Contact & Location */}
                    <section className="bg-[#141414] p-6 sm:p-8 rounded-2xl border border-white/5 text-left">
                        <div className="flex items-center gap-3 mb-6 select-none font-mono">
                            <span className="material-symbols-outlined text-primary-container">location_on</span>
                            <h3 className="font-headline-md text-sm font-bold uppercase tracking-wider text-white">Contact & Location</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <div className="md:col-span-2 lg:col-span-3 space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Street Address</label>
                                <input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="e.g. 542 Syndicate Blvd"
                                    type="text"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">City</label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="New Haven"
                                    type="text"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">State/Province</label>
                                <input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="Connecticut"
                                    type="text"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Postal Code</label>
                                <input
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="06511"
                                    type="text"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Business Email</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="contact@enterprise.coop"
                                    type="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Phone Number</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="+1 (555) 000-0000"
                                    type="tel"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Website</label>
                                <input
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="https://enterprise.coop"
                                    type="url"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section Matrix: Additional Details Layout */}
                    <section className="bg-[#141414] p-6 sm:p-8 rounded-2xl border border-white/5 text-left">
                        <div className="flex items-center gap-3 mb-6 select-none font-mono">
                            <span className="material-symbols-outlined text-primary-container">add_chart</span>
                            <h3 className="font-headline-md text-sm font-bold uppercase tracking-wider text-white">Additional Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Year Established</label>
                                <input
                                    name="established"
                                    value={formData.established}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="2026"
                                    type="number"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Number of Employees</label>
                                <div className="relative group">
                                    <select
                                        name="employees"
                                        value={formData.employees}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-container focus:outline-none transition-all text-sm appearance-none cursor-pointer outline-none font-medium pr-10"
                                    >
                                        <option value="1-5">1-5 Employees</option>
                                        <option value="6-20">6-20 Employees</option>
                                        <option value="21-50">21-50 Employees</option>
                                        <option value="50+">50+ Employees</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary-container" />
                                </div>
                            </div>
                            {/* 🚀 REFACTOR LOCK: Replaced raw text hours box with dual precise time dropdown panels */}
                            <div className="md:col-span-2 space-y-2 select-none font-mono">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">Operational Business Hours *</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Start Opening Time Picker */}
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-text-secondary/60 uppercase tracking-widest block">Opening Hours</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button type="button" className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-primary-container transition-all text-xs flex items-center justify-between cursor-pointer font-sans font-medium outline-none">
                                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-container" /> {formatTimeDisplay(startTime)}</span>
                                                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-44 p-1 border border-white/10 bg-[#141414] shadow-2xl rounded-2xl max-h-56 overflow-y-auto custom-scrollbar z-50 animate-in fade-in slide-in-from-top-1 duration-150" align="start">
                                                {TIME_OPTIONS.map(t => (
                                                    <button key={`start-${t.value}`} type="button" onClick={() => setStartTime(t.value)} className={cn("w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer font-sans border-none", startTime === t.value ? "bg-primary-container text-white" : "text-white hover:bg-white/5")}>
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* End Closing Time Picker */}
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-text-secondary/60 uppercase tracking-widest block">Closing Hours</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button type="button" className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-primary-container transition-all text-xs flex items-center justify-between cursor-pointer font-sans font-medium outline-none">
                                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-container" /> {formatTimeDisplay(endTime)}</span>
                                                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-44 p-1 border border-white/10 bg-[#141414] shadow-2xl rounded-2xl max-h-56 overflow-y-auto custom-scrollbar z-50 animate-in fade-in slide-in-from-top-1 duration-150" align="start">
                                                {TIME_OPTIONS.map(t => (
                                                    <button key={`end-${t.value}`} type="button" onClick={() => setEndTime(t.value)} className={cn("w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer font-sans border-none", endTime === t.value ? "bg-primary-container text-white" : "text-white hover:bg-white/5")}>
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>

                            {/* Tag Selection Taxonomies Array Layout */}
                            <div className="md:col-span-2 space-y-4 pt-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Services & Offerings (Tags)</label>
                                <div className="flex flex-wrap gap-2 mb-2 select-none">
                                    {selectedTags.map((tag) => (
                                        <button key={tag} type="button" onClick={() => toggleTag(tag, true)} className="px-3.5 py-1.5 bg-primary-container/10 text-primary-container border border-primary-container/20 rounded-full flex items-center gap-2 text-xs cursor-pointer font-bold transition-all shadow-sm">
                                            <span>{tag}</span>
                                            <X className="w-3 h-3" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 select-none">
                                    {availableTags.map((tag) => (
                                        <button key={tag} type="button" onClick={() => toggleTag(tag, false)} className="px-3.5 py-1.5 bg-[#0d1117] border border-white/5 rounded-full flex items-center gap-2 text-xs cursor-pointer text-text-secondary hover:text-white hover:border-white/10 transition-all font-medium">
                                            <span>{tag}</span>
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 max-w-sm">
                                    <input value={customTag} onChange={(e) => setCustomTag(e.target.value)} placeholder="Enter custom service..." className="flex-1 bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:border-primary-container focus:outline-none transition-all font-medium" type="text" />
                                    <button type="button" onClick={handleAddCustomTag} className="px-4 py-2 bg-[#262626] border border-white/5 rounded-xl text-xs text-white hover:text-primary-container hover:bg-white/5 transition-all font-mono font-bold cursor-pointer">Add</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                {/* 📊 Right Column: Image Configuration & Live Preview Sidebar */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Section Matrix: Image Upload & Preview */}
                    <section className="bg-[#141414] p-6 rounded-2xl border border-white/5 space-y-4 text-left">
                        <h3 className="font-headline-md text-sm font-bold uppercase tracking-wider text-white font-mono select-none">
                            Business Profile Image
                        </h3>

                        <div className="aspect-video w-full relative rounded-xl overflow-hidden bg-black/40 border border-white/5">
                            <ImageUploader
                                mode="banner"
                                aspectRatio={16 / 9}
                                value={formData.image}
                                onChange={(newImage) => setFormData((prev) => ({ ...prev, image: newImage }))}
                                onImageRemove={() => setFormData((prev) => ({ ...prev, image: '' }))}
                                label="Upload Business Image"
                                description="Recommended 16:9 format. Drag & drop, crop, and position your photo."
                            />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                Or enter Image URL directly
                            </label>
                            <input
                                name="image"
                                value={formData.image.startsWith('data:') ? '[Cropped Upload Image]' : formData.image}
                                onChange={handleInputChange}
                                className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-primary-container focus:outline-none transition-all font-medium"
                                placeholder="Enter image URL..."
                                type="text"
                            />
                        </div>
                    </section>

                    {/* 🌟 Redesigned Live Preview Card Module */}
                    <section className="bg-primary-container/[0.02] border border-primary-container/10 p-6 rounded-2xl relative overflow-hidden text-left flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-primary-container font-mono font-bold text-[10px] uppercase tracking-widest select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                            Live Registry Preview Status
                        </div>

                        <div className="space-y-3">
                            {formData.image && (
                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 relative select-none pointer-events-none">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        // 🚀 THE ORB SECURITY FIX: Forces standard anonymous cross-origin layout permissions
                                        crossOrigin="anonymous"
                                        className="w-full h-full object-cover animate-in fade-in duration-200"
                                        // 🎯 Secure production error handler to safely catch and prevent unhandled ORB crashes
                                        onError={(e) => {
                                            e.target.onerror = null; // Prevents error cycle loops
                                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231a1a1c"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8" fill="%23e53e3e">IMAGE_ACCESS_BLOCKED</text></svg>';
                                        }}
                                    />
                                </div>
                            )}

                            <h4 className="font-headline-md text-base font-black text-white truncate tracking-tight pt-1">
                                {formData.name || 'Your Enterprise Name'}
                            </h4>
                            <p className="text-xs text-text-secondary leading-relaxed line-clamp-4 font-normal min-h-[4rem]">
                                {formData.description || 'Provide an enterprise description on the left column panels to view it updated here in real time...'}
                            </p>

                            {/* Dynamic Metadata Attributes Row */}
                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 font-sans">
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary/50 font-mono select-none">Category</p>
                                    <p className="text-white font-bold text-xs truncate mt-0.5">{formData.category}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary/50 font-mono select-none">Location</p>
                                    <p className="text-white font-bold text-xs truncate mt-0.5">
                                        {formData.city || 'City'}{formData.state ? `, ${formData.state}` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Dynamic Hours Selector Reflection */}
                            <div className="pt-2 font-mono text-[10px] text-text-secondary/60 flex items-center gap-1.5 select-none">
                                <span className="material-symbols-outlined text-sm text-primary-container">schedule</span>
                                <span>Hours: {formatTimeDisplay(startTime)} - {formatTimeDisplay(endTime)}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
