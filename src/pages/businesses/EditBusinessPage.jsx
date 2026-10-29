// src/pages/businesses/EditBusinessPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessDetailsQuery, useUpdateBusiness } from '../../features/businesses/useBusinessesFeature';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { ImageUploader } from '../../components/ImageUploader';
import { uploadProfileImageToR2 } from '../../utils/uploadMedia';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import {
    ArrowLeft, Loader2, AlertCircle, ChevronDown, Clock,
    Plus, X, Trash2, Upload, Image as ImageIcon,
    Building2, MapPin, CheckCircle2
} from 'lucide-react';
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

const parseTimeTo24 = (timeStr) => {
    if (!timeStr) return '09:00';
    const clean = timeStr.trim();
    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return '09:00';
    let h = parseInt(match[1], 10);
    const m = match[2];
    const period = match[3] ? match[3].toUpperCase() : null;
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
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

export function EditBusinessPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    const { business, businessLoading, businessError } = useBusinessDetailsQuery(id);
    const updateBusinessMutation = useUpdateBusiness(id);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Food & Beverage',
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
        image: '',
    });

    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    const [selectedTags, setSelectedTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([
        'Worker-Owned', 'Unionized Shop', 'Fair Wage Certified',
        'Local Sourcing', 'Eco-Friendly', 'Community Funded',
        'Democratic Governance', 'Open Book Management'
    ]);
    const [customTag, setCustomTag] = useState('');

    const [galleryImages, setGalleryImages] = useState([]);
    const [newGalleryUrl, setNewGalleryUrl] = useState('');
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const triggerToast = (msg, type = 'error') => {
        setToastMessage({ msg, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Pre-populate data when business record loads
    useEffect(() => {
        if (!business) return;

        // Parse hours string if available e.g. "9:00 AM - 5:00 PM"
        const hoursStr = business.hours || business.business_hours || '';
        if (hoursStr.includes('-')) {
            const [startPart, endPart] = hoursStr.split('-').map(s => s.trim());
            if (startPart) setStartTime(parseTimeTo24(startPart));
            if (endPart) setEndTime(parseTimeTo24(endPart));
        }

        // Parse address components
        const addr = business.address || business.contact?.address || '';
        const city = business.city || business.contact?.city || '';
        const state = business.state || business.contact?.state || '';
        const zip = business.zip || business.contact?.zip || '';

        setFormData({
            name: business.name || '',
            category: business.category || 'Food & Beverage',
            legalStructure: business.legal_structure || business.legalStructure || 'Cooperative (Recommended)',
            description: business.description || '',
            address: business.street || addr,
            city: city,
            state: state,
            zip: zip,
            email: business.email || business.contact?.email || '',
            phone: business.phone || business.contact?.phone || '',
            website: business.website || business.contact?.website || '',
            established: String(business.established || business.year_established || new Date().getFullYear()),
            employees: String(business.employees || business.number_of_employees || '1-5'),
            image: business.profile_image_url || business.image || '',
        });

        const initialServices = Array.isArray(business.services) && business.services.length > 0
            ? business.services
            : (Array.isArray(business.tags) ? business.tags : []);

        setSelectedTags(initialServices);
        setAvailableTags(prev => prev.filter(t => !initialServices.includes(t)));

        // Gallery images
        const imgs = business.images || business.gallery || [];
        setGalleryImages(Array.isArray(imgs) ? imgs : []);
    }, [business?.id]);

    if (businessLoading) {
        return (
            <div className="pt-32 px-4 text-center flex flex-col items-center justify-center gap-4 font-sans select-none animate-in fade-in duration-200">
                <Loader2 className="w-8 h-8 rounded-full text-primary-container animate-spin shrink-0" />
                <p className="text-text-secondary text-sm font-black uppercase tracking-widest font-mono opacity-60">
                    Loading enterprise specifications...
                </p>
            </div>
        );
    }

    if (businessError || !business) {
        return (
            <div className="pt-32 px-4 text-center font-sans max-w-md mx-auto animate-in zoom-in-95 duration-200">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-xl font-black text-text-primary dark:text-white tracking-tight mb-2">Business Node Empty</h2>
                <p className="text-text-secondary text-sm font-medium leading-relaxed mb-6">
                    The requested enterprise could not be located.
                </p>
                <button
                    onClick={() => navigate('/businesses')}
                    className="w-full py-3 bg-primary-container text-white font-black rounded-xl text-xs uppercase tracking-wider font-mono outline-none shadow-md border-none cursor-pointer hover:brightness-105 transition-all"
                >
                    Return to Directory
                </button>
            </div>
        );
    }

    // Owner authorization guard
    const ownerHandle = business.owner_name || (typeof business.owner === 'string' ? business.owner : business.owner?.username);
    const isOwner = currentUser && (
        String(currentUser.id) === String(business.user_id) ||
        currentUser.username === ownerHandle
    );

    if (!isOwner) {
        return (
            <div className="pt-32 px-4 text-center font-sans max-w-md mx-auto animate-in zoom-in-95 duration-200">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-black text-text-primary dark:text-white tracking-tight mb-2">Authorization Restricted</h2>
                <p className="text-text-secondary text-sm font-medium leading-relaxed mb-6">
                    You do not hold administrative operating permissions for this business profile.
                </p>
                <button
                    onClick={() => navigate(`/businesses/${id}`)}
                    className="w-full py-3 bg-primary-container text-white font-black rounded-xl text-xs uppercase tracking-wider font-mono outline-none shadow-md border-none cursor-pointer hover:brightness-105 transition-all"
                >
                    Return to Business Details
                </button>
            </div>
        );
    }

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

    // Gallery images handlers
    const handleGalleryFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploadingGallery(true);
        try {
            const uploadedUrls = [];
            for (const file of files) {
                const finalUrl = await uploadProfileImageToR2(file, 'business');
                if (finalUrl) {
                    uploadedUrls.push(finalUrl);
                }
            }
            if (uploadedUrls.length > 0) {
                setGalleryImages((prev) => [...prev, ...uploadedUrls]);
                triggerToast(`Uploaded ${uploadedUrls.length} image(s) to gallery!`, 'success');
            }
        } catch (err) {
            console.error('Gallery upload failed', err);
            triggerToast('Failed to upload some gallery photos.', 'error');
        } finally {
            setIsUploadingGallery(false);
            e.target.value = '';
        }
    };

    const handleAddGalleryUrl = (e) => {
        e.preventDefault();
        const cleanUrl = newGalleryUrl.trim();
        if (cleanUrl) {
            setGalleryImages((prev) => [...prev, cleanUrl]);
            setNewGalleryUrl('');
        }
    };

    const handleRemoveGalleryImage = (indexToRemove) => {
        setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData.name.trim() || !formData.description.trim()) {
            triggerToast('Please provide a business name and description.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = formData.image;
            if (formData.image && (formData.image.startsWith('data:') || formData.image instanceof File)) {
                finalImageUrl = await uploadProfileImageToR2(formData.image, 'business');
            }

            const computedHours = `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`;

            const updatePayload = {
                name: formData.name.trim(),
                category: formData.category,
                legal_structure: formData.legalStructure,
                description: formData.description.trim(),
                address: formData.address,
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
                images: galleryImages,
                gallery: galleryImages,
                services: selectedTags,
                tags: selectedTags,
                metadata: {
                    ...(business.metadata || {}),
                    business_hours: computedHours,
                    hours: computedHours,
                    services: selectedTags,
                    tags: selectedTags,
                    employee_range: formData.employees,
                    established: parseInt(formData.established, 10) || new Date().getFullYear(),
                    image_url: finalImageUrl,
                    images: galleryImages,
                    gallery: galleryImages
                }
            };

            updateBusinessMutation.mutate(updatePayload, {
                onSuccess: () => {
                    triggerToast('Business specifications successfully updated!', 'success');
                    setTimeout(() => {
                        setIsSubmitting(false);
                        navigate(`/businesses/${id}`);
                    }, 1000);
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    triggerToast(err?.message || 'Failed to update business specifications.', 'error');
                }
            });
        } catch (err) {
            setIsSubmitting(false);
            triggerToast(err?.message || 'Exception caught saving modifications.', 'error');
        }
    };

    return (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 font-sans">
            {/* Toast Feedback */}
            {toastMessage && (
                <div className={cn(
                    "fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-mono font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 border",
                    toastMessage.type === 'success'
                        ? "bg-emerald-950/95 text-emerald-200 border-emerald-500/30"
                        : "bg-rose-950/95 text-rose-200 border-rose-500/30"
                )}>
                    {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{toastMessage.msg}</span>
                </div>
            )}

            {/* Top Navigation & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate(`/businesses/${id}`)}
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary font-black text-xs font-mono uppercase tracking-wider transition-colors mb-2 bg-transparent border-none cursor-pointer outline-none select-none group"
                    >
                        <ArrowLeft className="w-4 h-4 stroke-[2.5px] transition-transform group-hover:-translate-x-1" />
                        <span>Cancel & Return</span>
                    </button>
                    <h1 className="text-3xl font-black text-text-primary dark:text-white tracking-tight">
                        Edit Business Details
                    </h1>
                    <p className="text-text-secondary text-sm font-medium mt-1">
                        Update enterprise contact, offerings, gallery images, and operational metadata.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/businesses/${id}`)}
                        className="px-5 py-3 rounded-xl border border-black/10 dark:border-white/10 text-text-secondary hover:text-text-primary font-bold text-xs uppercase font-mono tracking-wider transition-all cursor-pointer bg-transparent"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        data-testid="save-business-btn"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-primary-container text-white rounded-xl font-black text-xs uppercase font-mono tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        <span>{isSubmitting ? 'Saving Changes...' : 'Save Modifications'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Sections */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Section 1: Basic Information */}
                    <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/5 space-y-6 text-left shadow-sm">
                        <div className="flex items-center gap-3 font-mono">
                            <Building2 className="w-5 h-5 text-primary-container" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-text-primary dark:text-white">General Information</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Business Name *</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="Business name"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Category *</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm appearance-none cursor-pointer pr-10"
                                        >
                                            {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-white dark:bg-[#141414]">{cat}</option>)}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Legal Structure *</label>
                                    <div className="relative">
                                        <select
                                            name="legalStructure"
                                            value={formData.legalStructure}
                                            onChange={handleInputChange}
                                            className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm appearance-none cursor-pointer pr-10"
                                        >
                                            {LEGAL_STRUCTURES.map(leg => <option key={leg} value={leg} className="bg-white dark:bg-[#141414]">{leg}</option>)}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl p-4 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium leading-relaxed resize-y"
                                    placeholder="Describe your enterprise, values, and community offerings..."
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Contact & Location */}
                    <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/5 space-y-6 text-left shadow-sm">
                        <div className="flex items-center gap-3 font-mono">
                            <MapPin className="w-5 h-5 text-primary-container" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-text-primary dark:text-white">Contact &amp; Location</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Street Address</label>
                                <input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="e.g. 123 Community St"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">City</label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="City"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">State</label>
                                    <input
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                        placeholder="TX"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">ZIP</label>
                                    <input
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                        placeholder="78701"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Phone</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="512-555-0100"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="contact@enterprise.coop"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Website</label>
                                <input
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Hours & Operations */}
                    <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/5 space-y-6 text-left shadow-sm">
                        <div className="flex items-center gap-3 font-mono">
                            <Clock className="w-5 h-5 text-primary-container" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-text-primary dark:text-white">Operating Hours &amp; Team</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-1">Opening Time</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button type="button" className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white text-xs flex items-center justify-between cursor-pointer outline-none font-medium">
                                            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-container" /> {formatTimeDisplay(startTime)}</span>
                                            <ChevronDown className="w-4 h-4 text-text-secondary" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-44 p-1 border border-black/10 dark:border-white/10 bg-white dark:bg-[#141414] shadow-2xl rounded-2xl max-h-56 overflow-y-auto z-50">
                                        {TIME_OPTIONS.map(t => (
                                            <button key={`start-${t.value}`} type="button" onClick={() => setStartTime(t.value)} className={cn("w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer font-sans border-none", startTime === t.value ? "bg-primary-container text-white" : "text-text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/5")}>
                                                {t.label}
                                            </button>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-1">Closing Time</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button type="button" className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white text-xs flex items-center justify-between cursor-pointer outline-none font-medium">
                                            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-container" /> {formatTimeDisplay(endTime)}</span>
                                            <ChevronDown className="w-4 h-4 text-text-secondary" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-44 p-1 border border-black/10 dark:border-white/10 bg-white dark:bg-[#141414] shadow-2xl rounded-2xl max-h-56 overflow-y-auto z-50">
                                        {TIME_OPTIONS.map(t => (
                                            <button key={`end-${t.value}`} type="button" onClick={() => setEndTime(t.value)} className={cn("w-full px-3 py-2 text-xs font-bold text-left rounded-xl transition-all cursor-pointer font-sans border-none", endTime === t.value ? "bg-primary-container text-white" : "text-text-primary dark:text-white hover:bg-black/5 dark:hover:bg-white/5")}>
                                                {t.label}
                                            </button>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Year Established</label>
                                <input
                                    name="established"
                                    type="number"
                                    value={formData.established}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono mb-2">Employees</label>
                                <select
                                    name="employees"
                                    value={formData.employees}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="1-5">1-5 Employees</option>
                                    <option value="6-20">6-20 Employees</option>
                                    <option value="21-50">21-50 Employees</option>
                                    <option value="50+">50+ Employees</option>
                                </select>
                            </div>
                        </div>

                        {/* Services & Offerings Tags */}
                        <div className="space-y-3 pt-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono">Services &amp; Offerings Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {selectedTags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag, true)}
                                        className="px-3.5 py-1.5 bg-primary-container/10 text-primary-container border border-primary-container/20 rounded-full flex items-center gap-1.5 text-xs cursor-pointer font-bold transition-all shadow-sm"
                                    >
                                        <span>{tag}</span>
                                        <X className="w-3 h-3" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag, false)}
                                        className="px-3 py-1 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-full flex items-center gap-1.5 text-xs cursor-pointer text-text-secondary hover:text-text-primary transition-all font-medium"
                                    >
                                        <span>{tag}</span>
                                        <Plus className="w-3 h-3" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 max-w-sm pt-1">
                                <input
                                    value={customTag}
                                    onChange={(e) => setCustomTag(e.target.value)}
                                    placeholder="Enter custom service tag..."
                                    className="flex-1 bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all font-medium"
                                    type="text"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustomTag}
                                    className="px-4 py-2 bg-black/10 dark:bg-white/10 rounded-xl text-xs font-mono font-bold text-text-primary dark:text-white hover:bg-black/20 dark:hover:bg-white/20 transition-all cursor-pointer border-none"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Business Images & Gallery */}
                    <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/5 space-y-6 text-left shadow-sm">
                        <div className="flex items-center justify-between font-mono">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="w-5 h-5 text-primary-container" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-text-primary dark:text-white">Business Gallery Photos</h3>
                            </div>
                            <span className="text-xs text-text-secondary font-bold">
                                {galleryImages.length} image{galleryImages.length === 1 ? '' : 's'}
                            </span>
                        </div>

                        <p className="text-sm text-text-secondary font-medium">
                            Upload photos showcasing your workplace, team, products, or storefront to display on the Business Details page.
                        </p>

                        {/* Existing Gallery Photos Grid */}
                        {galleryImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {galleryImages.map((imgUrl, idx) => (
                                    <div
                                        key={`gallery-item-${idx}`}
                                        className="relative group rounded-2xl overflow-hidden aspect-square border border-black/10 dark:border-white/10 shadow-md bg-black/5 dark:bg-white/5"
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={`Gallery photo ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGalleryImage(idx)}
                                                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg border-none cursor-pointer transition-transform active:scale-90"
                                                title="Remove photo"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl text-center space-y-2">
                                <ImageIcon className="w-8 h-8 text-text-secondary/40 mx-auto" />
                                <p className="text-xs text-text-secondary font-semibold font-mono uppercase tracking-wider">
                                    No gallery images added yet
                                </p>
                            </div>
                        )}

                        {/* Add Gallery Photos Dropzone / Controls */}
                        <div className="space-y-3 pt-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono">
                                Upload New Gallery Photos
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <label className={cn(
                                    "flex-1 px-4 py-3 rounded-xl border border-dashed border-primary-container/40 hover:border-primary-container bg-primary-container/5 hover:bg-primary-container/10 text-primary-container font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all",
                                    isUploadingGallery && "opacity-50 cursor-not-allowed"
                                )}>
                                    {isUploadingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    <span>{isUploadingGallery ? 'Uploading to R2 Storage...' : 'Browse / Select Photos to Upload'}</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        disabled={isUploadingGallery}
                                        onChange={handleGalleryFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div className="flex gap-2 max-w-lg pt-1">
                                <input
                                    value={newGalleryUrl}
                                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                                    placeholder="Or paste direct image URL to add..."
                                    className="flex-1 bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all font-medium"
                                    type="text"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddGalleryUrl}
                                    className="px-4 py-2 bg-black/10 dark:bg-white/10 rounded-xl text-xs font-mono font-bold text-text-primary dark:text-white hover:bg-black/20 dark:hover:bg-white/20 transition-all cursor-pointer border-none"
                                >
                                    Add Photo
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Cover Image & Preview Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-white dark:bg-[#141414] p-6 rounded-3xl border border-black/10 dark:border-white/5 space-y-4 text-left shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-wider text-text-primary dark:text-white font-mono">
                            Main Cover Image
                        </h3>

                        <div className="aspect-video w-full relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10">
                            <ImageUploader
                                inputTestId="edit-business-image-input"
                                mode="banner"
                                aspectRatio={16 / 9}
                                value={formData.image}
                                onChange={(newImage) => setFormData((prev) => ({ ...prev, image: newImage }))}
                                onImageRemove={() => setFormData((prev) => ({ ...prev, image: '' }))}
                                label="Upload Cover Image"
                                description="Recommended 16:9 format. Drag & drop or crop your main banner photo."
                            />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono">
                                Or enter Cover Image URL
                            </label>
                            <input
                                name="image"
                                value={formData.image?.startsWith('data:') ? '[New Cropped Upload Image]' : (formData.image || '')}
                                onChange={handleInputChange}
                                className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-text-primary dark:text-white text-xs focus:border-primary-container focus:outline-none transition-all font-medium"
                                placeholder="https://..."
                                type="text"
                            />
                        </div>
                    </section>

                    {/* Information summary card */}
                    <div className="bg-primary-container/5 border border-primary-container/20 p-5 rounded-3xl space-y-3 text-left">
                        <div className="flex items-center gap-2 text-primary-container font-mono text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Owner Operations Mode</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed font-medium">
                            Modifications made to this business entity will be updated immediately across the Kollective directory.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditBusinessPage;
