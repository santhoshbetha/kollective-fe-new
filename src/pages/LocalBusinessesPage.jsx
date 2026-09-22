// src/pages/LocalBusinessesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/auth/useAuthStore';
import { LocalBusinessesFeed } from '../features/businesses/LocalBusinessesFeed';
import { ProposalsFeed } from '../features/businesses/ProposalsFeed';
import { PostAdModal } from '../features/classifieds/PostAdModal';
import { Filter, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LocalBusinessesPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('businesses'); // 'businesses' | 'proposals'
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistance, setSelectedDistance] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // 🗺️ Location Selectors
    const userState = useStore((state) => state.userState);
    const streetAddress = useStore((state) => state.streetAddress);
    const currentUser = useAuthStore((state) => state.user);

    const hasAddressOrCoords = Boolean((streetAddress && streetAddress.trim()) || currentUser?.street_address || currentUser?.latitude);
    const hasState = Boolean((userState && userState.trim()) || currentUser?.state || currentUser?.origin_state);
    const canAccessBusinesses = hasAddressOrCoords || hasState;

    const DISTANCE_OPTIONS = [
        { label: '5 miles', value: '5' },
        { label: '10 miles', value: '10' },
        { label: '25 miles', value: '25' },
        { label: '40 miles', value: '40' },
        { label: '100 miles', value: '100' },
    ];

    const [businessPage, setBusinessPage] = useState(1);
    const [proposalPage, setProposalPage] = useState(1);
    const itemsPerPage = 6;
    const [isPostAdOpen, setIsPostAdOpen] = useState(false);
    const [isClassifiedsOpen, setIsClassifiedsOpen] = useState(false);

    useEffect(() => {
        setBusinessPage(1);
        setProposalPage(1);
    }, [activeCategory, searchQuery]);

    const categories = ['All',
        'Food & Beverage',
        'Grocery Store',
        'Healthcare',
        'Legal Services',
        'Tax Services',
        'Retail & Crafts',
        'Transportation',
        'Fitness & Wellness',
        'Beauty & Personal Care',
        'Agriculture',
        'Professional Services',
        'Cleaning Services',
        'Movers',
        'Technology',
        'Construction',
        'Manufacturing'];

    const renderPagination = (currentPage, totalPages, onPageChange) => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-high border border-white/5 text-text-secondary hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, idx) => {
                    const page = idx + 1;
                    const isActive = currentPage === page;
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all border ${isActive ? 'bg-primary-container text-white border-primary-container crimson-glow font-bold' : 'bg-surface-container-high border-white/5 text-text-secondary'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-high border border-white/5 text-text-secondary hover:text-white disabled:opacity-40 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
            </div>
        );
    };

    if (!canAccessBusinesses) {
        return (
            <div className="max-w-[700px] mx-auto my-16 p-8 bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mx-auto text-primary-container">
                    <span className="material-symbols-outlined text-3xl">location_off</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">Local Businesses Access Restricted</h2>
                    <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
                        To discover local businesses and proposals in your neighborhood, please opt-in and provide either your <span className="font-bold text-text-primary">State / Province</span> or <span className="font-bold text-text-primary">Street Address</span> in your Account Settings.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/settings?tab=index')}
                    className="px-6 py-3 bg-primary-container hover:bg-primary-container/90 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">settings</span>
                    Go to Settings
                </button>
            </div>
        );
    }

    const hasActiveFilters = Boolean(searchQuery || activeCategory !== 'All' || selectedDistance);

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col gap-12 pb-20 w-full relative">
            <div className="w-full flex flex-col gap-6">
                {/* Header Block */}
                <div className="mb-8 text-center md:text-left space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/15 border border-primary-container/30 text-primary-container text-xs font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">groups</span>
                        Community-Oriented & People-Centered Only
                    </div>
                    <h1 className="font-headline-lg text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
                        {activeTab === 'businesses' ? 'Local Businesses' : 'Business Proposals'}
                    </h1>
                    <p className="font-body-md text-xl text-text-secondary leading-relaxed">
                        {activeTab === 'businesses'
                            ? 'Discover and support strictly community-oriented and people-centered local businesses that keep wealth and vitality within our neighborhoods.'
                            : 'Review, vote on, and back community-led venture proposals designed to challenge corporate monopolies and build shared local prosperity.'}
                    </p>

                    {/* Community Principles Banner */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 flex items-start gap-3.5 text-left text-sm shadow-inner">
                        <span className="material-symbols-outlined text-primary-container text-2xl shrink-0 mt-0.5">volunteer_activism</span>
                        <div>
                            <h4 className="font-bold text-text-primary text-xl mb-1">Empowering Local & Ethical Ventures</h4>
                            <p className="text-text-secondary text-[16px] leading-normal">
                                This space is explicitly reserved for independent, grassroots, and people-centered enterprises. We stand against extractive corporate monopolies and prioritize neighborhood sustainability, fair wages, and ethical service.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls & Action Buttons */}
                <div className="mb-6 space-y-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex p-1 bg-surface-container-low rounded-xl border border-white/5 w-full lg:w-auto">
                            <button
                                onClick={() => { setActiveTab('businesses'); setActiveCategory('All'); }}
                                className={`px-6 py-2 rounded-lg font-label-md text-sm font-bold transition-all flex-1 lg:flex-none cursor-pointer ${activeTab === 'businesses' ? 'bg-surface-container-high text-text-primary shadow-sm font-bold' : 'text-text-secondary hover:text-white'
                                    }`}
                            >
                                Businesses
                            </button>
                            <button
                                onClick={() => { setActiveTab('proposals'); setActiveCategory('All'); }}
                                className={`px-6 py-2 rounded-lg font-label-md text-sm font-bold transition-all flex-1 lg:flex-none cursor-pointer ${activeTab === 'proposals' ? 'bg-surface-container-high text-text-primary shadow-sm font-bold' : 'text-text-secondary hover:text-white'
                                    }`}
                            >
                                Business Proposals
                            </button>
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <button
                                onClick={() => setIsClassifiedsOpen(!isClassifiedsOpen)}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-surface-container-low border border-white/10 text-text-primary px-5 py-3 rounded-xl font-bold text-sm hover:bg-surface-container-high transition-all cursor-pointer shadow-sm shrink-0"
                            >
                                <span className="material-symbols-outlined text-[18px] text-primary-container">newspaper</span>
                                <span>{isClassifiedsOpen ? 'Hide Classifieds' : 'Local Classifieds'}</span>
                            </button>

                            <button
                                onClick={() => navigate(activeTab === 'businesses' ? '/businesses/register' : '/businesses/propose')}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all crimson-glow cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                {activeTab === 'businesses' ? 'Post Business' : 'Post Proposal'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Collapsible Search & Filter Accordion Card */}
                <section className="mb-8 bg-surface-container border border-outline-variant rounded-card shadow-2xl overflow-hidden font-sans transition-all">
                    {/* Accordion Trigger Header */}
                    <button
                        type="button"
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        className="w-full flex items-center justify-between px-6 py-4 focus:outline-none bg-transparent border-none text-left cursor-pointer hover:bg-surface-container-high/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface-container-low rounded-card flex items-center justify-center border border-outline-variant/60 shrink-0">
                                <Filter className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-lg font-bold text-text-primary">
                                    {activeTab === 'businesses' ? 'Find Local Businesses' : 'Find Business Proposals'}
                                </span>
                                {hasActiveFilters && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                                        Filters Active
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronDown
                            className={cn(
                                "w-5 h-5 text-text-secondary transition-transform duration-300",
                                isSearchExpanded && "rotate-180"
                            )}
                        />
                    </button>

                    {/* Expandable Filter Panel */}
                    <div
                        className={cn(
                            "transition-all duration-300 ease-out overflow-hidden px-6",
                            isSearchExpanded
                                ? "max-h-[2000px] opacity-100 pb-8 border-t border-outline-variant/40 pt-6"
                                : "max-h-0 opacity-0 py-0 border-t-0"
                        )}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Search Input */}
                            <div className="space-y-2 flex flex-col">
                                <label className="text-lg font-bold text-text-secondary uppercase tracking-widest">
                                    {activeTab === 'businesses' ? 'Search Businesses' : 'Search Proposals'}
                                </label>
                                <div className="relative group">
                                    <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-primary" />
                                    <input
                                        className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 text-[16px] rounded-card pl-10 pr-9 py-3 text-text-primary placeholder:text-text-secondary/40 outline-none transition-all"
                                        placeholder={activeTab === 'businesses' ? 'Search businesses by name, description...' : 'Search proposals...'}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded-md bg-transparent border-none cursor-pointer"
                                            aria-label="Clear search text"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[14px] text-text-secondary/60 italic">
                                    Search across business names, services, and descriptions
                                </p>
                            </div>

                            {/* Distance Filter */}
                            {hasAddressOrCoords ? (
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-lg font-bold text-text-secondary uppercase tracking-widest">
                                        Filter by Distance
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={selectedDistance}
                                            onChange={(e) => setSelectedDistance(e.target.value)}
                                            className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 text-[16px] rounded-card px-4 py-3 text-text-primary outline-none transition-all cursor-pointer"
                                        >
                                            <option value="" className="bg-[#18181b] text-text-primary">All Distances</option>
                                            {DISTANCE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value} className="bg-[#18181b] text-text-primary">
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-[14px] text-text-secondary/60 italic">
                                        Radius based on your address location
                                    </p>
                                </div>
                            ) : hasState ? (
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-lg font-bold text-text-secondary uppercase tracking-widest">
                                        Location Scope
                                    </label>
                                    <div className="flex items-center gap-2 bg-primary-container/10 border border-primary-container/20 px-4 py-3 rounded-card text-sm font-bold text-primary-container">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        <span>Showing in {userState || currentUser?.state || currentUser?.origin_state}</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Categories Selection */}
                        <div className="mt-8">
                            <label className="text-lg font-bold text-text-secondary uppercase tracking-widest block mb-4">
                                Categories
                            </label>
                            <div className="flex flex-wrap items-center gap-2 w-full">
                                {categories.map((cat) => {
                                    const isActive = activeCategory === cat;
                                    return (
                                        <button
                                            type="button"
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={cn(
                                                "px-4 py-2 border rounded-full text-xs font-bold cursor-pointer transition-all shrink-0",
                                                isActive
                                                    ? "bg-primary-container border-primary-container text-white crimson-glow"
                                                    : "bg-surface-container-low border-outline-variant text-text-secondary hover:border-primary-container hover:bg-surface-container-high hover:text-text-primary"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Local Target Component Injection Layer */}
                {activeTab === 'businesses' ? (
                    <LocalBusinessesFeed
                        searchQuery={searchQuery}
                        activeCategory={activeCategory}
                        selectedDistance={selectedDistance}
                        renderPagination={renderPagination}
                        itemsPerPage={itemsPerPage}
                        currentPage={businessPage}
                        onPageChange={setBusinessPage}
                    />
                ) : (
                    <ProposalsFeed
                        searchQuery={searchQuery}
                        activeCategory={activeCategory}
                        renderPagination={renderPagination}
                        itemsPerPage={itemsPerPage}
                        currentPage={proposalPage}
                        onPageChange={setProposalPage}
                    />
                )}
            </div>

            {/* Collapsible Overlapping Local Classifieds Slide-Over Panel */}
            {isClassifiedsOpen && (
                <div className="fixed inset-0 z-[9999] flex justify-end">
                    {/* Backdrop Overlay */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
                        onClick={() => setIsClassifiedsOpen(false)}
                    />

                    {/* Floating Slide-over Drawer Panel */}
                    <aside className="relative w-full sm:w-[400px] h-full bg-[#141414] border-l border-white/10 shadow-2xl p-6 overflow-y-auto flex flex-col gap-6 z-10 animate-in slide-in-from-right duration-300">
                        <div className="glass-panel rounded-xl p-6 bg-surface-container-low border border-white/5 flex flex-col gap-6">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <div className="flex flex-col">
                                    <h4 className="text-lg font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary-container">newspaper</span>
                                        Local Classifieds
                                    </h4>
                                    <span className="text-[11px] text-text-secondary/60 font-mono">Time-sensitive community ads</span>
                                </div>
                                <button
                                    onClick={() => setIsClassifiedsOpen(false)}
                                    className="p-1.5 text-text-secondary hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setIsPostAdOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-primary-container/20 border border-primary-container/40 text-primary-container hover:bg-primary-container hover:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Post New Classified Ad
                            </button>

                            <div className="space-y-4">
                                {/* Ad Card 1 */}
                                <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-white/5 rounded">For Sale</span>
                                            <span className="text-[10px] font-mono text-amber-500/90 flex items-center gap-0.5">
                                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse inline-block" /> 2d left
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[13px] rounded-full font-bold">$4/doz</span>
                                    </div>
                                    <h5 className="text-text-primary font-bold text-base group-hover:text-primary-container transition-colors mb-1">Co-op Fresh Eggs</h5>
                                    <p className="text-text-secondary text-sm leading-relaxed mb-3">Fresh organic eggs from our cage-free backyard coop.</p>
                                    <div className="flex items-center justify-between text-xs text-text-secondary/70 font-mono border-t border-white/5 pt-2">
                                        <span>@organic_farm</span>
                                        <span className="flex items-center gap-0.5 text-[11px] text-text-secondary/50">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span> East End
                                        </span>
                                    </div>
                                </div>

                                {/* Ad Card 2 */}
                                <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-white/5 rounded">Services</span>
                                            <span className="text-[10px] font-mono text-red-400/90 flex items-center gap-0.5">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" /> 8h left
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[13px] rounded-full font-bold">$25/hr</span>
                                    </div>
                                    <h5 className="text-text-primary font-bold text-base group-hover:text-primary-container transition-colors mb-1">Math & Science Tutor</h5>
                                    <p className="text-text-secondary text-sm leading-relaxed mb-3">High school & early college tutoring. 5 years experience.</p>
                                    <div className="flex items-center justify-between text-xs text-text-secondary/70 font-mono border-t border-white/5 pt-2">
                                        <span>@edu_support</span>
                                        <span className="flex items-center gap-0.5 text-[11px] text-text-secondary/50">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span> Heights
                                        </span>
                                    </div>
                                </div>

                                {/* Ad Card 3 */}
                                <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group relative overflow-hidden">
                                    <div className="flex gap-3">
                                        <div className="w-16 h-16 shrink-0 rounded-lg bg-surface-container-high border border-white/10 flex items-center justify-center overflow-hidden text-text-secondary/40">
                                            <span className="material-symbols-outlined text-[24px]">image</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1 gap-1">
                                                <span className="text-[10px] font-mono text-amber-500/90 flex items-center gap-0.5">
                                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse inline-block" /> 4d left
                                                </span>
                                                <span className="text-green-400 text-[13px] font-bold shrink-0">$15+</span>
                                            </div>
                                            <h5 className="text-text-primary font-bold text-sm truncate group-hover:text-primary-container transition-colors">Ceramic Mugs & Bowls</h5>
                                            <p className="text-text-secondary text-xs line-clamp-2 mt-0.5">Locally spun stoneware mugs and nesting bowls.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-text-secondary/70 font-mono border-t border-white/5 pt-2 mt-3">
                                        <span className="truncate max-w-[120px]">@mud_and_fire</span>
                                        <span className="flex items-center gap-0.5 text-[11px] text-text-secondary/50 shrink-0">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span> Downtown
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setIsClassifiedsOpen(false); navigate('/classifieds'); }}
                                className="w-full text-center mt-5 pt-3 border-t border-white/5 text-xs text-text-secondary hover:text-primary-container font-mono tracking-wide flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                                <span>VIEW BOARD DIRECTORY</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            <PostAdModal
                isOpen={isPostAdOpen}
                onClose={() => setIsPostAdOpen(false)}
                onAdCreated={(newAd) => {
                    console.log('Ad successfully broadcasted:', newAd);
                }}
            />

        </div>
    );
};
