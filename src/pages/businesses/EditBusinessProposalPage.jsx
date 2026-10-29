// src/pages/businesses/EditBusinessProposalPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProposalDetailsQuery, useUpdateProposal } from '../../features/businesses/useProposalsFeature';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { ImageUploader } from '../../components/ImageUploader';
import { uploadProfileImageToR2 } from '../../utils/uploadMedia';
import {
    ArrowLeft, Loader2, AlertCircle, ChevronDown, Check,
    Plus, X, Trash2, Upload, MapPin, Landmark, Sparkles, CheckCircle2
} from 'lucide-react';
import { cn } from "@/lib/utils";

const CATEGORIES = [
    'Food & Beverage', 'Grocery Store', 'Healthcare', 'Transportation',
    'Retail & Crafts', 'Fitness & Wellness', 'Beauty & Personal Care',
    'Agriculture', 'Cleaning Services', 'Movers', 'Technology',
    'Professional Services', 'Legal Services', 'Tax Services',
    'Manufacturing', 'Construction'
];

const STATUS_OPTIONS = ['New', 'Active', 'Hot'];

export function EditBusinessProposalPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);

    const { proposal, proposalLoading, proposalError } = useProposalDetailsQuery(id);
    const updateProposalMutation = useUpdateProposal(id);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Technology',
        description: '',
        location: '',
        fundingGoal: '',
        minInvest: '',
        maxInvest: '',
        status: 'Active',
        daysLeft: 45,
        image: '',
    });

    const [selectedTags, setSelectedTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([
        'Co-founder', 'Tech Lead', 'Operations', 'Marketing',
        'Lead Designer', 'Community Organizer', 'Legal Advisor', 'Domain Specialist'
    ]);
    const [customTag, setCustomTag] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const triggerToast = (msg, type = 'error') => {
        setToastMessage({ msg, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Pre-populate fields once proposal details load
    useEffect(() => {
        if (!proposal) return;

        const meta = proposal.metadata || {};
        const funding = meta.funding_data || proposal.funding_details || proposal.funding_data || {};

        const initialGoal = proposal.fundingGoal ?? funding.fundingGoal ?? funding.money_required ?? '';
        const initialMin = proposal.minInvest ?? funding.minInvest ?? funding.minimum_amount ?? '';
        const initialMax = proposal.maxInvest ?? funding.maxInvest ?? funding.maximum_amount ?? '';
        const initialStatus = proposal.status || funding.status || 'Active';
        const initialDays = proposal.daysLeft ?? funding.daysLeft ?? 45;

        const rawTags = proposal.tags || meta.tags || meta.looking_for || proposal.looking_for || [];
        const initialTags = Array.isArray(rawTags) ? rawTags : [];

        setFormData({
            title: proposal.title || proposal.name || '',
            category: proposal.category || 'Technology',
            description: proposal.description || '',
            location: proposal.location || proposal.address || proposal.city || '',
            fundingGoal: String(initialGoal),
            minInvest: String(initialMin),
            maxInvest: String(initialMax),
            status: initialStatus,
            daysLeft: initialDays,
            image: proposal.image || proposal.profile_image_url || '',
        });

        setSelectedTags(initialTags);
        setAvailableTags(prev => prev.filter(t => !initialTags.includes(t)));
    }, [proposal?.id]);

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
        if (!formData.title.trim() || !formData.description.trim() || !formData.fundingGoal) {
            triggerToast('Please provide a title, description, and funding goal.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = formData.image;
            if (formData.image && (formData.image.startsWith('data:') || formData.image instanceof File)) {
                finalImageUrl = await uploadProfileImageToR2(formData.image, 'proposal');
            }

            const goal = parseInt(formData.fundingGoal, 10) || 50000;
            const minInv = parseInt(formData.minInvest, 10) || 100;
            const maxInv = parseInt(formData.maxInvest, 10) || 10000;
            const days = parseInt(formData.daysLeft, 10) || 45;

            const existingMeta = proposal?.metadata || {};
            const existingFunding = existingMeta.funding_data || {};

            const updatedFunding = {
                ...existingFunding,
                funding_required: true,
                money_required: goal,
                fundingGoal: goal,
                minimum_amount: minInv,
                minInvest: minInv,
                maximum_amount: maxInv,
                maxInvest: maxInv,
                daysLeft: days,
                status: formData.status
            };

            const payload = {
                name: formData.title.trim(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                location: formData.location.trim() || 'Local District',
                address: formData.location.trim() || 'Local District',
                profile_image_url: finalImageUrl || null,
                image: finalImageUrl || null,
                fundingGoal: goal,
                money_required: goal,
                minInvest: minInv,
                minimum_amount: minInv,
                maxInvest: maxInv,
                maximum_amount: maxInv,
                status: formData.status,
                daysLeft: days,
                tags: selectedTags,
                looking_for: selectedTags,
                funding_data: updatedFunding,
                metadata: {
                    ...existingMeta,
                    funding_data: updatedFunding,
                    location: formData.location.trim() || 'Local District',
                    looking_for: selectedTags,
                    tags: selectedTags,
                    image: finalImageUrl || null,
                    profile_image_url: finalImageUrl || null
                }
            };

            updateProposalMutation.mutate(payload, {
                onSuccess: () => {
                    triggerToast('Proposal updated successfully!', 'success');
                    setTimeout(() => {
                        setIsSubmitting(false);
                        navigate(`/proposals/${id}`);
                    }, 1000);
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    triggerToast(err?.message || 'Failed to update proposal.', 'error');
                }
            });
        } catch (error) {
            setIsSubmitting(false);
            triggerToast(error?.message || 'An unexpected error occurred.', 'error');
        }
    };

    // Loading State
    if (proposalLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary-container animate-spin" />
                <p className="text-text-secondary font-mono text-sm uppercase tracking-wider">
                    Loading Proposal Parameters...
                </p>
            </div>
        );
    }

    // Error / Not Found State
    if (proposalError || !proposal) {
        return (
            <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-text-primary dark:text-white">
                    Proposal Not Found
                </h2>
                <p className="text-text-secondary text-sm">
                    The requested business proposal does not exist or has been removed.
                </p>
                <button
                    onClick={() => navigate('/businesses')}
                    className="px-6 py-2.5 rounded-xl bg-primary-container text-white font-bold text-sm cursor-pointer border-none"
                >
                    Return to Directory
                </button>
            </div>
        );
    }

    // Ownership Verification
    const isOwner = Boolean(
        currentUser && proposal && (
            (proposal.user_id && String(proposal.user_id) === String(currentUser.id)) ||
            (proposal.owner_info?.id && String(proposal.owner_info.id) === String(currentUser.id)) ||
            (proposal.owner_name && (proposal.owner_name === currentUser.username || proposal.owner_name === currentUser.handle?.replace('@', ''))) ||
            (typeof proposal.owner === 'string' && (proposal.owner === currentUser.username || proposal.owner === currentUser.handle?.replace('@', ''))) ||
            currentUser.is_admin ||
            currentUser.is_moderator
        )
    );

    return (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 relative space-y-8">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={cn(
                    "fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in duration-200",
                    toastMessage.type === 'success' ? "bg-green-600 text-white" : "bg-[#a10836] text-white"
                )}>
                    {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{toastMessage.msg}</span>
                    <button type="button" onClick={() => setToastMessage(null)} className="bg-transparent border-none text-white cursor-pointer ml-2">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Ownership Warning Notice */}
            {!isOwner && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-5 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-sans text-left">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                    <span>
                        <strong>Notice:</strong> You are editing this proposal with administrative or coordinator privileges. Changes will update the live public initiative.
                    </span>
                </div>
            )}

            {/* Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 dark:border-white/5 pb-6 select-none text-left">
                <div>
                    <nav className="flex items-center gap-2 text-text-secondary text-xs font-mono font-bold mb-3 uppercase tracking-widest">
                        <span className="hover:text-text-primary dark:hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/businesses')}>Businesses</span>
                        <ChevronDown className="w-3 h-3 text-text-secondary rotate-270" />
                        <span className="hover:text-text-primary dark:hover:text-white cursor-pointer transition-colors" onClick={() => navigate(`/proposals/${id}`)}>Proposal</span>
                        <ChevronDown className="w-3 h-3 text-text-secondary rotate-270" />
                        <span className="text-primary-container">Edit Proposal</span>
                    </nav>
                    <h1 className="font-headline-lg text-3xl font-black text-text-primary dark:text-white tracking-tight">
                        Edit Business Proposal
                    </h1>
                    <p className="text-text-secondary font-medium text-sm max-w-xl mt-1.5 leading-relaxed font-sans">
                        Update funding targets, collaboration milestones, and the public presentation of this community initiative.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto font-mono text-xs">
                    <button
                        type="button"
                        onClick={() => navigate(`/proposals/${id}`)}
                        className="flex-1 sm:flex-none px-6 py-3 border border-black/10 dark:border-white/10 rounded-xl text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white transition-all font-bold cursor-pointer bg-transparent"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        data-testid="submit-proposal-btn"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-8 py-3 bg-primary-container text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all crimson-glow flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed border-none shadow-lg cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <span>Save Changes</span>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Proposal Details Form */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/5 space-y-6 text-left shadow-sm">
                        <div className="flex items-center gap-3 mb-2 font-mono">
                            <span className="material-symbols-outlined text-primary-container">edit_document</span>
                            <h3 className="font-headline-md text-sm font-bold uppercase tracking-wider text-text-primary dark:text-white">
                                Proposal Information
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                    Proposal Title *
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="e.g. Austin Clean Energy Cooperative"
                                    type="text"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                    Detailed Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm placeholder:text-text-secondary/30 min-h-[160px] h-40 resize-none font-normal"
                                    placeholder="Describe your vision, community impact, budget plans, and timeline..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                        Category *
                                    </label>
                                    <div className="relative group">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm appearance-none cursor-pointer outline-none font-medium pr-10"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat} className="bg-white dark:bg-[#141414] text-text-primary dark:text-white">
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary-container" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                        Target Location *
                                    </label>
                                    <div className="relative group">
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                            placeholder="e.g. Austin, TX"
                                            type="text"
                                        />
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/40 pointer-events-none group-focus-within:text-primary-container" />
                                    </div>
                                </div>
                            </div>

                            {/* Financial Parameters */}
                            <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5 select-none font-mono">
                                <div className="flex items-center gap-2 text-text-primary dark:text-white">
                                    <Landmark className="w-4 h-4 text-primary-container" />
                                    <h4 className="font-bold text-xs uppercase tracking-wider">
                                        Financial & Investment Structure
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono">
                                            Funding Goal (USD) *
                                        </label>
                                        <div className="relative group">
                                            <input
                                                name="fundingGoal"
                                                value={formData.fundingGoal}
                                                onChange={handleInputChange}
                                                className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-8 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. 50000"
                                                type="number"
                                                required
                                            />
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60 font-bold text-sm font-mono group-focus-within:text-primary-container">$</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono">
                                            Min Backing (USD)
                                        </label>
                                        <div className="relative group">
                                            <input
                                                name="minInvest"
                                                value={formData.minInvest}
                                                onChange={handleInputChange}
                                                className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-8 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. 50"
                                                type="number"
                                            />
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60 font-bold text-sm font-mono group-focus-within:text-primary-container">$</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono">
                                            Max Backing (USD)
                                        </label>
                                        <div className="relative group">
                                            <input
                                                name="maxInvest"
                                                value={formData.maxInvest}
                                                onChange={handleInputChange}
                                                className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-8 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. 10000"
                                                type="number"
                                            />
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60 font-bold text-sm font-mono group-focus-within:text-primary-container">$</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Timeline Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-black/5 dark:border-white/5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                        Initiative Status
                                    </label>
                                    <div className="relative group">
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm appearance-none cursor-pointer outline-none font-medium pr-10"
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s} className="bg-white dark:bg-[#141414] text-text-primary dark:text-white">
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary-container" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                        Days Remaining
                                    </label>
                                    <input
                                        name="daysLeft"
                                        value={formData.daysLeft}
                                        onChange={handleInputChange}
                                        className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                        type="number"
                                        min="1"
                                        max="365"
                                    />
                                </div>
                            </div>

                            {/* Looking For / Skill Requirements Tags */}
                            <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                    Collaborator Roles & Looking For Tags
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2 select-none">
                                    {selectedTags.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag, true)}
                                            className="px-3.5 py-1.5 bg-primary-container/10 text-primary-container border border-primary-container/20 rounded-full flex items-center gap-2 text-xs cursor-pointer font-bold transition-all shadow-sm"
                                        >
                                            <span>{tag}</span>
                                            <X className="w-3 h-3" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 select-none">
                                    {availableTags.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag, false)}
                                            className="px-3.5 py-1.5 bg-black/[0.03] dark:bg-[#0d1117] border border-black/10 dark:border-white/5 rounded-full flex items-center gap-2 text-xs cursor-pointer text-text-secondary hover:text-text-primary dark:hover:text-white transition-all font-medium"
                                        >
                                            <span>{tag}</span>
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 max-w-sm">
                                    <input
                                        value={customTag}
                                        onChange={(e) => setCustomTag(e.target.value)}
                                        placeholder="Add custom role/skill..."
                                        className="flex-1 bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-text-primary dark:text-white text-xs focus:border-primary-container focus:outline-none transition-all font-medium"
                                        type="text"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCustomTag}
                                        className="px-4 py-2 bg-black/[0.05] dark:bg-[#262626] border border-black/10 dark:border-white/5 rounded-xl text-xs text-text-primary dark:text-white hover:text-primary-container transition-all font-mono font-bold cursor-pointer"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Proposal Image & Preview */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-black/10 dark:border-white/5 space-y-4 text-left shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="font-headline-md text-sm font-bold uppercase tracking-wider text-text-primary dark:text-white font-mono select-none">
                                Proposal Image
                            </h3>
                            <span className="text-[11px] font-mono font-bold text-primary-container uppercase px-2 py-0.5 rounded bg-primary-container/10 border border-primary-container/20">
                                16:9 Banner
                            </span>
                        </div>

                        <div className="aspect-video w-full relative rounded-xl overflow-hidden bg-black/40 border border-black/10 dark:border-white/5">
                            <ImageUploader
                                inputTestId="proposal-image-input"
                                mode="banner"
                                aspectRatio={16 / 9}
                                value={formData.image}
                                onChange={(newImage) => setFormData((prev) => ({ ...prev, image: newImage }))}
                                onImageRemove={() => setFormData((prev) => ({ ...prev, image: '' }))}
                                label="Upload Proposal Image"
                                description="Recommended 16:9 banner. Drag & drop or browse image."
                            />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                Or enter Image URL directly
                            </label>
                            <input
                                name="image"
                                value={formData.image && formData.image.startsWith('data:') ? '[Cropped Upload Image]' : (formData.image || '')}
                                onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                                placeholder="https://example.com/proposal-photo.jpg"
                                type="text"
                                className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-text-primary dark:text-white text-xs focus:border-primary-container focus:outline-none transition-all font-mono"
                            />
                        </div>
                    </section>

                    {/* Quick Guidance Box */}
                    <div className="p-5 rounded-2xl bg-primary-container/[0.04] border border-primary-container/15 space-y-3 text-left select-none">
                        <div className="flex items-center gap-2 text-primary-container font-bold text-xs uppercase tracking-wider font-mono">
                            <Sparkles className="w-4 h-4" />
                            <span>Proposal Optimization</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans">
                            High-quality banner graphics and specific role requests (like Lead Developer or Operations) increase community engagement by over 60%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditBusinessProposalPage;
