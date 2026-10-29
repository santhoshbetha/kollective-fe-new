// src/pages/LocalBusinessesPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { LocalBusinessesFeed } from '../../features/businesses/LocalBusinessesFeed';
import { ProposalsFeed } from '../../features/businesses/ProposalsFeed';
import { useBusinessesQuery } from '../../features/businesses/useBusinessesFeature';
import { useProposalsQuery } from '../../features/businesses/useProposalsFeature';
import { isItemInScope } from '../../utils/geoUtils';
import { PostAdModal } from '../../components/modals/PostAdModal';
import { Filter, ChevronDown, Search, X, MapPin, Star, CheckCircle2, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISTANCE_OPTIONS = [
    { label: '5 miles', value: '5' },
    { label: '10 miles', value: '10' },
    { label: '25 miles', value: '25' },
    { label: '40 miles', value: '40' },
    { label: '100 miles', value: '100' },
];

const BUSINESS_CATEGORIES = [
    'All',
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
    'Manufacturing'
];

export const LocalBusinessesPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('businesses'); // 'businesses' | 'proposals'
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistance, setSelectedDistance] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // 🗺️ Location Selectors
    const userState = useStore((state) => state.userState);
    const setUserState = useStore((state) => state.setUserState);
    const streetAddress = useStore((state) => state.streetAddress);
    const currentUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const isOrg = activeAccount?.type === 'organization';

    // Browser geolocation fallback
    const [browserCoords, setBrowserCoords] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (pos?.coords) {
                        setBrowserCoords({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude
                        });
                    }
                },
                () => { },
                { timeout: 5000 }
            );
        }
    }, []);

    // Normalized effective state (e.g., 'TX')
    const effectiveUserState = useMemo(() => {
        const raw = currentUser?.state || currentUser?.origin_state || currentUser?.political_location?.state || userState || '';
        return String(raw).toUpperCase().trim();
    }, [userState, currentUser]);

    // Keep store synced with authenticated user state if available
    useEffect(() => {
        if (effectiveUserState && userState !== effectiveUserState && typeof setUserState === 'function') {
            setUserState(effectiveUserState);
        }
    }, [effectiveUserState, userState, setUserState]);

    // User coordinates
    const userCoords = useMemo(() => {
        if (browserCoords?.latitude && browserCoords?.longitude) {
            return browserCoords;
        }
        if (currentUser?.latitude && currentUser?.longitude) {
            return { latitude: currentUser.latitude, longitude: currentUser.longitude };
        }
        if (currentUser?.location && typeof currentUser.location === 'string') {
            const match = currentUser.location.match(/POINT\(\s*([-\d\.]+)\s+([-\d\.]+)\s*\)/i);
            if (match) {
                return { longitude: parseFloat(match[1]), latitude: parseFloat(match[2]) };
            }
        }
        return null;
    }, [browserCoords, currentUser]);

    const hasAddressOrCoords = Boolean((streetAddress && streetAddress.trim()) || currentUser?.street_address || userCoords?.latitude);
    const hasState = Boolean(effectiveUserState);
    const canAccessBusinesses = hasAddressOrCoords || hasState;

    // 🎯 Scope Mode: '100_miles' vs 'state' (User toggleable)
    const [scopeMode, setScopeMode] = useState(hasAddressOrCoords ? '100_miles' : 'state');

    useEffect(() => {
        setScopeMode((prev) => {
            if (!hasAddressOrCoords && prev === '100_miles' && hasState) {
                return 'state';
            }
            if (hasAddressOrCoords && prev === 'state') {
                return '100_miles';
            }
            return prev;
        });
    }, [hasAddressOrCoords, hasState]);

    const [isPostAdOpen, setIsPostAdOpen] = useState(false);
    const [isClassifiedsOpen, setIsClassifiedsOpen] = useState(false);

    // Live search query data hooks
    const { businesses = [] } = useBusinessesQuery();
    const { proposals = [] } = useProposalsQuery();
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const searchContainerRef = useRef(null);

    // Close search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setIsSearchDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 🔍 Dropdown Quick-Results (like GlobalSearchBar, strictly respecting 100 miles or State toggle)
    const dropdownSearchResults = useMemo(() => {
        if (!searchQuery || !searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase().trim();
        const maxDist = selectedDistance ? parseFloat(selectedDistance) : 100;

        if (activeTab === 'businesses') {
            const list = Array.isArray(businesses) ? businesses : [];
            return list.filter((biz) => {
                if (!isItemInScope(biz, scopeMode, effectiveUserState, maxDist, userCoords)) {
                    return false;
                }

                const matchesName = (biz.name || '').toLowerCase().includes(query);
                const matchesDesc = (biz.description || '').toLowerCase().includes(query);
                const matchesCat = (biz.category || '').toLowerCase().includes(query);
                const matchesAddr = (biz.address || '').toLowerCase().includes(query);
                const matchesCity = (biz.city || '').toLowerCase().includes(query);
                const matchesServices = Array.isArray(biz.services) && biz.services.some(s => String(s).toLowerCase().includes(query));

                return matchesName || matchesDesc || matchesCat || matchesAddr || matchesCity || matchesServices;
            }).slice(0, 8);
        } else {
            const list = Array.isArray(proposals) ? proposals : [];
            return list.filter((prop) => {
                if (!isItemInScope(prop, scopeMode, effectiveUserState, 100, userCoords)) {
                    return false;
                }

                const matchesTitle = (prop.title || '').toLowerCase().includes(query);
                const matchesDesc = (prop.description || '').toLowerCase().includes(query);
                const matchesCat = (prop.category || '').toLowerCase().includes(query);
                const matchesLoc = (prop.location || '').toLowerCase().includes(query);
                const matchesCity = (prop.city || '').toLowerCase().includes(query);

                return matchesTitle || matchesDesc || matchesCat || matchesLoc || matchesCity;
            }).slice(0, 8);
        }
    }, [activeTab, businesses, proposals, searchQuery, scopeMode, effectiveUserState, selectedDistance, userCoords]);

    const categories = BUSINESS_CATEGORIES;

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

    const hasActiveFilters = Boolean(searchQuery.trim() || activeCategory !== 'All' || selectedDistance || scopeMode !== (hasAddressOrCoords ? '100_miles' : 'state'));

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
                        {isOrg && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-left text-sm shadow-sm text-amber-500">
                                <span className="material-symbols-outlined text-2xl shrink-0 mt-0.5">lock</span>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Restricted to Personal Accounts</h4>
                                    <p className="text-text-secondary text-[15px] leading-normal">
                                        Local Businesses and Business Proposals are restricted to personal user profiles. Organizations are not permitted to register businesses or post proposals. Please switch back to your personal profile to manage businesses or proposals.
                                    </p>
                                </div>
                            </div>
                        )}
                    </p>
                    {/* Community Principles Banner */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-black/10 dark:border-white/10 flex items-start gap-3.5 text-left text-sm shadow-inner">
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
                        <div className="flex p-1 bg-surface-container-low rounded-xl border border-black/10 dark:border-white/10 w-full lg:w-auto">
                            <button
                                data-testid="tab-businesses-btn"
                                onClick={() => { setActiveTab('businesses'); setActiveCategory('All'); }}
                                className={`px-6 py-2 rounded-lg font-label-md text-sm font-bold transition-all flex-1 lg:flex-none cursor-pointer ${activeTab === 'businesses' ? 'bg-surface-container-high text-text-primary shadow-sm font-bold' : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                Businesses
                            </button>
                            <button
                                data-testid="tab-proposals-btn"
                                onClick={() => { setActiveTab('proposals'); setActiveCategory('All'); }}
                                className={`px-6 py-2 rounded-lg font-label-md text-sm font-bold transition-all flex-1 lg:flex-none cursor-pointer ${activeTab === 'proposals' ? 'bg-surface-container-high text-text-primary shadow-sm font-bold' : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                Business Proposals
                            </button>
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <button
                                onClick={() => setIsClassifiedsOpen(!isClassifiedsOpen)}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-surface-container-low border border-black/10 dark:border-white/10 text-text-primary px-5 py-3 rounded-xl font-bold text-sm hover:bg-surface-container-high transition-all cursor-pointer shadow-sm shrink-0"
                            >
                                <span className="material-symbols-outlined text-[18px] text-primary-container">newspaper</span>
                                <span>{isClassifiedsOpen ? 'Hide Classifieds' : 'Local Classifieds'}</span>
                            </button>

                            <button
                                data-testid="post-entity-btn"
                                disabled={isOrg}
                                title={isOrg ? "Organizations cannot register businesses or submit proposals." : ""}
                                onClick={() => !isOrg && navigate(activeTab === 'businesses' ? '/businesses/register' : '/businesses/propose')}
                                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm transition-all crimson-glow ${isOrg ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:brightness-110 active:scale-95 cursor-pointer'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{isOrg ? 'lock' : 'add'}</span>
                                {isOrg ? 'Restricted to Personal' : (activeTab === 'businesses' ? 'Post Business' : 'Post Proposal')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Collapsible Search & Filter Accordion Card */}
                <section className={cn("mb-8 bg-surface-container border border-black/10 dark:border-white/10 rounded-2xl shadow-sm font-sans transition-all", isSearchExpanded ? "overflow-visible" : "overflow-hidden")}>
                    {/* Accordion Trigger Header */}
                    <button
                        type="button"
                        data-testid="find-businesses-accordion"
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        className="w-full flex items-center justify-between px-6 py-4 focus:outline-none bg-transparent border-none text-left cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center border border-black/10 dark:border-white/10 shrink-0">
                                <Filter className="w-5 h-5 text-primary-container" />
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
                            "transition-all duration-300 ease-out px-6",
                            isSearchExpanded
                                ? "max-h-[2000px] opacity-100 pb-8 border-t border-black/10 dark:border-white/10 pt-6 overflow-visible"
                                : "max-h-0 opacity-0 py-0 border-t-0 overflow-hidden"
                        )}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Search Input Box with Scope Switcher & Live Dropdown (like GlobalSearchBar) */}
                            <div ref={searchContainerRef} className="space-y-2 flex flex-col relative z-20">
                                <div className="flex items-center justify-between flex-wrap gap-2 select-none">
                                    <label className="text-sm font-bold text-text-secondary uppercase tracking-widest font-mono">
                                        {activeTab === 'businesses' ? 'Search Businesses' : 'Search Proposals'}
                                    </label>

                                    {/* 🎛️ Scope Switcher Pill: Within 100 Miles vs Entire State */}
                                    <div className="inline-flex items-center bg-surface-container-low p-0.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-mono font-bold select-none">
                                        <button
                                            type="button"
                                            onClick={() => setScopeMode('100_miles')}
                                            className={cn(
                                                "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-none text-[11px]",
                                                scopeMode === '100_miles'
                                                    ? "bg-primary-container text-white shadow-sm font-extrabold"
                                                    : "text-text-secondary hover:text-text-primary bg-transparent"
                                            )}
                                            title="Limit results to 100 miles radius"
                                        >
                                            <Compass className="w-3.5 h-3.5" />
                                            <span>Within 100 Miles</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setScopeMode('state')}
                                            className={cn(
                                                "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-none text-[11px]",
                                                scopeMode === 'state'
                                                    ? "bg-primary-container text-white shadow-sm font-extrabold"
                                                    : "text-text-secondary hover:text-text-primary bg-transparent"
                                            )}
                                            title="Limit results to your entire state"
                                        >
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>Entire State {effectiveUserState ? `(${effectiveUserState})` : ''}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <Search className={cn(
                                        "w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
                                        isSearchDropdownOpen ? "text-primary-container" : "text-text-secondary group-focus-within:text-primary-container"
                                    )} />
                                    <input
                                        data-testid="business-search-input"
                                        className="w-full bg-surface-container-low border border-black/10 dark:border-white/10 focus:border-primary-container text-sm rounded-xl pl-10 pr-9 py-3 text-text-primary placeholder:text-text-secondary/50 outline-none transition-all shadow-sm"
                                        placeholder={
                                            activeTab === 'businesses'
                                                ? (scopeMode === '100_miles' ? 'Search local businesses within 100 miles...' : `Search businesses in ${effectiveUserState || 'state'}...`)
                                                : (scopeMode === '100_miles' ? 'Search community proposals within 100 miles...' : `Search proposals in ${effectiveUserState || 'state'}...`)
                                        }
                                        type="text"
                                        value={searchQuery}
                                        onFocus={() => setIsSearchDropdownOpen(true)}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setIsSearchDropdownOpen(true);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setIsSearchDropdownOpen(false);
                                            }
                                        }}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setIsSearchDropdownOpen(false);
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded bg-transparent border-none cursor-pointer"
                                            aria-label="Clear search text"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Floating Dropdown System Results Portal (GlobalSearchBar styled, scoped) */}
                                {isSearchDropdownOpen && searchQuery.trim().length > 0 && (
                                    <div className="absolute top-[calc(100%+6px)] inset-x-0 bg-surface-container border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl max-h-[440px] overflow-y-auto custom-scrollbar p-2 animate-in fade-in slide-from-top-2 duration-150 flex flex-col gap-2 z-50 text-text-primary">
                                        {/* Header Bar */}
                                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/10 dark:border-white/10 font-mono text-[11px] text-text-secondary select-none">
                                            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary-container">
                                                {scopeMode === '100_miles' ? <Compass className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                <span>
                                                    {scopeMode === '100_miles'
                                                        ? `Within 100 Miles Radius`
                                                        : `State Scope: ${effectiveUserState || 'Local State'}`}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-text-secondary/60 font-mono">
                                                {dropdownSearchResults.length} {dropdownSearchResults.length === 1 ? 'match' : 'matches'}
                                            </span>
                                        </div>

                                        {/* Results List */}
                                        {dropdownSearchResults.length > 0 ? (
                                            <div className="space-y-1">
                                                {dropdownSearchResults.map((item) => {
                                                    if (activeTab === 'businesses') {
                                                        const distLabel = typeof item.distanceMiles === 'number'
                                                            ? `${item.distanceMiles} mi away`
                                                            : (item.city || item.address || 'Local');
                                                        return (
                                                            <div
                                                                key={`biz-dropdown-${item.id}`}
                                                                onClick={() => {
                                                                    navigate(`/businesses/${item.id}`);
                                                                    setIsSearchDropdownOpen(false);
                                                                }}
                                                                className="w-full px-3 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer transition-colors group flex items-start gap-3 text-left border border-transparent hover:border-black/5 dark:hover:border-white/5"
                                                            >
                                                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container-high border border-black/10 dark:border-white/10 relative">
                                                                    <img
                                                                        src={item.image || item.profile_image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80'}
                                                                        alt={item.name}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80'; }}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary-container/10 text-primary-container border border-primary-container/20 font-bold truncate">
                                                                            {item.category || 'Business'}
                                                                        </span>
                                                                        {item.verified && (
                                                                            <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                                                                                <CheckCircle2 className="w-2.5 h-2.5" />
                                                                                Verified
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h4 className="text-xs font-bold text-text-primary group-hover:text-primary-container transition-colors truncate">
                                                                        {item.name}
                                                                    </h4>
                                                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary truncate font-mono">
                                                                        <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                                                                            <Star className="w-3 h-3 fill-amber-500 dark:fill-amber-400 shrink-0" />
                                                                            <span>{item.rating || 5.0}</span>
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1 truncate text-text-secondary/80">
                                                                            <MapPin className="w-3 h-3 text-text-secondary/60 shrink-0" />
                                                                            <span className="truncate">{distLabel}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    } else {
                                                        const percent = item.percent || 0;
                                                        const distLabel = typeof item.distanceMiles === 'number'
                                                            ? `${item.distanceMiles} mi away`
                                                            : (item.city || item.location || 'Local');
                                                        return (
                                                            <div
                                                                key={`prop-dropdown-${item.id}`}
                                                                onClick={() => {
                                                                    navigate(`/proposals/${item.id}`);
                                                                    setIsSearchDropdownOpen(false);
                                                                }}
                                                                className="w-full px-3 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer transition-colors group flex items-start gap-3 text-left border border-transparent hover:border-black/5 dark:hover:border-white/5"
                                                            >
                                                                <div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shrink-0">
                                                                    <span className="material-symbols-outlined text-2xl">
                                                                        {item.category === 'Infrastructure' ? 'deck' : item.category === 'Agriculture' ? 'agriculture' : 'electric_bolt'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary-container/10 text-primary-container border border-primary-container/20 font-bold truncate">
                                                                            {item.category || 'Proposal'}
                                                                        </span>
                                                                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                                            {item.status || 'Active'}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="text-xs font-bold text-text-primary group-hover:text-primary-container transition-colors truncate">
                                                                        {item.title}
                                                                    </h4>
                                                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary truncate font-mono">
                                                                        <span className="text-primary-container font-bold">{percent}% funded</span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1 truncate text-text-secondary/80">
                                                                            <MapPin className="w-3 h-3 text-text-secondary/60 shrink-0" />
                                                                            <span className="truncate">{distLabel}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-8 px-4 text-center font-mono text-xs text-text-secondary/60 select-none flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-3xl text-text-secondary/40">
                                                    {activeTab === 'businesses' ? 'storefront' : 'deck'}
                                                </span>
                                                <p className="uppercase tracking-widest text-[11px] font-bold text-text-secondary">
                                                    No {activeTab} found {scopeMode === '100_miles' ? 'within 100 miles' : `in ${effectiveUserState || 'your state'}`} matching "{searchQuery}"
                                                </p>
                                                <p className="text-[10px] text-text-secondary/60 normal-case">
                                                    {scopeMode === '100_miles'
                                                        ? 'Search is currently confined to a 100-mile commutable regional radius.'
                                                        : `Search is strictly limited to enterprises located within ${effectiveUserState || 'your state'}.`}
                                                </p>
                                                {scopeMode === '100_miles' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setScopeMode('state')}
                                                        className="mt-2 px-3 py-1.5 rounded-lg bg-primary-container/20 border border-primary-container/40 text-primary-container hover:bg-primary-container hover:text-white text-xs font-bold font-mono transition-all cursor-pointer"
                                                    >
                                                        Switch to Entire State Scope
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Status footer anchor */}
                                        <div className="p-2 text-center border-t border-black/10 dark:border-white/5 font-mono text-[9px] text-text-secondary/30 select-none uppercase tracking-widest mt-1">
                                            // local_enterprise_index_active
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Distance Filter Panel */}
                            {scopeMode === '100_miles' ? (
                                <div className="space-y-2 flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-text-secondary uppercase tracking-widest font-mono">
                                            Filter by Distance
                                        </label>
                                        <span className="text-[14px] font-mono text-primary-container font-bold">
                                            Max: {selectedDistance ? `${selectedDistance} mi` : '100 mi'}
                                        </span>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            data-testid="distance-select"
                                            value={selectedDistance}
                                            onChange={(e) => setSelectedDistance(e.target.value)}
                                            className="w-full bg-surface-container-low border border-black/10 dark:border-white/10 focus:border-primary-container text-sm rounded-xl px-4 py-3 text-text-primary outline-none transition-all cursor-pointer shadow-sm"
                                        >
                                            <option value="" className="bg-surface text-text-primary">Within 100 miles (Default)</option>
                                            {DISTANCE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value} className="bg-surface text-text-primary">
                                                    Within {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-[12px] text-text-secondary/60 italic font-mono">
                                        Commutable regional perimeter centered on your neighborhood
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-bold text-text-secondary uppercase tracking-widest font-mono">
                                        Geographical Scope
                                    </label>
                                    <div className="flex items-center justify-between bg-primary-container/10 border border-primary-container/20 px-4 py-2.5 rounded-xl text-sm font-bold text-primary-container font-mono">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary-container shrink-0" />
                                            <span>Statewide: {effectiveUserState || 'Your State'}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setScopeMode('100_miles')}
                                            className="text-[11px] uppercase tracking-wider text-primary-container hover:underline bg-transparent border-none cursor-pointer font-bold"
                                        >
                                            Switch to 100mi
                                        </button>
                                    </div>
                                    <p className="text-[12px] text-text-secondary/60 italic font-mono">
                                        Showing all verified enterprises across {effectiveUserState || 'your entire state'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Categories Selection */}
                        <div className="mt-8">
                            <label className="text-sm font-bold text-text-secondary uppercase tracking-widest font-mono block mb-3">
                                Filter by Category
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
                                                "px-3.5 py-1.5 border rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 font-mono",
                                                isActive
                                                    ? "bg-primary-container border-primary-container text-white crimson-glow"
                                                    : "bg-surface-container-low border-black/10 dark:border-white/10 text-text-secondary hover:border-primary-container hover:bg-surface-container-high hover:text-text-primary"
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
                        scopeMode={scopeMode}
                        effectiveUserState={effectiveUserState}
                        userCoords={userCoords}
                    />
                ) : (
                    <ProposalsFeed
                        searchQuery={searchQuery}
                        activeCategory={activeCategory}
                        scopeMode={scopeMode}
                        effectiveUserState={effectiveUserState}
                        userCoords={userCoords}
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
                    <aside className="relative w-full sm:w-[400px] h-full bg-surface border-l border-black/10 dark:border-white/10 shadow-2xl p-6 overflow-y-auto flex flex-col gap-6 z-10 animate-in slide-in-from-right duration-300">
                        <div className="glass-panel rounded-xl p-6 bg-surface-container-low border border-black/10 dark:border-white/5 flex flex-col gap-6">
                            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                                <div className="flex flex-col">
                                    <h4 className="text-lg font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary-container">newspaper</span>
                                        Local Classifieds
                                    </h4>
                                    <span className="text-[11px] text-text-secondary/60 font-mono">Time-sensitive community ads</span>
                                </div>
                                <button
                                    onClick={() => setIsClassifiedsOpen(false)}
                                    className="p-1.5 text-text-secondary hover:text-text-primary rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
                onAdCreated={() => setIsPostAdOpen(false)}
            />

        </div>
    );
};
