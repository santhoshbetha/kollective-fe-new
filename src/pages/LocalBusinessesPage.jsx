// src/pages/LocalBusinessesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalBusinessesFeed } from '../features/businesses/LocalBusinessesFeed';
import { ProposalsFeed } from '../features/businesses/ProposalsFeed';
import { PostAdModal } from '../features/classifieds/PostAdModal';

export const LocalBusinessesPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('businesses'); // 'businesses' | 'proposals'
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const [businessPage, setBusinessPage] = useState(1);
    const [proposalPage, setProposalPage] = useState(1);
    const itemsPerPage = 2;
    const [isPostAdOpen, setIsPostAdOpen] = useState(false);

    useEffect(() => {
        setBusinessPage(1);
        setProposalPage(1);
    }, [activeCategory, searchQuery]);

    const categories = ['All', 'Food & Beverage', 'Healthcare', 'Infrastructure', 'Technology', 'Health & Fitness', 'Sustainable Energy', 'Agriculture', 'Retail', 'Services'];

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

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 pb-20">
            <div className="flex-1 flex flex-col gap-6 max-w-3xl">
                {/* Header Block */}
                <div className="mb-8 text-center md:text-left space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/15 border border-primary-container/30 text-primary-container text-xs font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">groups</span>
                        Community-Oriented & People-Centered Only
                    </div>
                    <h1 className="font-headline-lg text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
                        {activeTab === 'businesses' ? 'Local Businesses' : 'Business Proposals'}
                    </h1>
                    <p className="font-body-md text-lg text-text-secondary leading-relaxed">
                        {activeTab === 'businesses'
                            ? 'Discover and support strictly community-oriented and people-centered local businesses that keep wealth and vitality within our neighborhoods.'
                            : 'Review, vote on, and back community-led venture proposals designed to challenge corporate monopolies and build shared local prosperity.'}
                    </p>

                    {/* Community Principles Banner */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 flex items-start gap-3.5 text-left text-sm shadow-inner">
                        <span className="material-symbols-outlined text-primary-container text-2xl shrink-0 mt-0.5">volunteer_activism</span>
                        <div>
                            <h4 className="font-bold text-text-primary text-md mb-1">Empowering Local & Ethical Ventures</h4>
                            <p className="text-text-secondary text-sm leading-normal">
                                This space is explicitly reserved for independent, grassroots, and people-centered enterprises. We stand against extractive corporate monopolies and prioritize neighborhood sustainability, fair wages, and ethical service.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls, Filters & Toggles */}
                <div className="mb-12 space-y-6">
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

                        <button
                            onClick={() => navigate(activeTab === 'businesses' ? '/businesses/register' : '/businesses/propose')}
                            className="flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all w-full lg:w-auto justify-center crimson-glow cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            {activeTab === 'businesses' ? 'Post Business' : 'Post Proposal'}
                        </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[22px]">search</span>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-container-low border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-primary-container transition-all placeholder:text-text-text-secondary/40 text-text-primary text-lg"
                            placeholder={activeTab === 'businesses' ? 'Search businesses...' : 'Search proposals...'}
                            type="text"
                        />
                    </div>

                    {/* Categories Grid Selection */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all border cursor-pointer ${activeCategory === cat
                                    ? 'bg-primary-container text-white border-primary-container crimson-glow'
                                    : 'bg-surface-container-high border-white/5 hover:bg-surface-variant text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Local Target Component Injection Layer */}
                {activeTab === 'businesses' ? (
                    <LocalBusinessesFeed
                        searchQuery={searchQuery}
                        activeCategory={activeCategory}
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

            {/* Classified Bulletin Sidebar Layout */}
            <aside className="w-full lg:w-80 flex flex-col gap-6" hidden>
                <div className="glass-panel rounded-xl p-6 bg-surface-container-low border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-text-primary uppercase tracking-wider">Local Classifieds</h4>
                        <button
                            onClick={() => setIsPostAdOpen(true)}
                            className="text-primary-container hover:underline text-[15px] font-bold cursor-pointer bg-transparent border-none"
                        >
                            + Post Ad
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-text-secondary text-[12px] font-bold uppercase tracking-widest">For Sale</span>
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[14px] rounded-full font-bold">$4/doz</span>
                            </div>
                            <h5 className="text-text-primary font-bold text-base group-hover:text-primary-container transition-colors mb-1">Co-op Fresh Eggs</h5>
                            <p className="text-text-secondary text-md leading-relaxed mb-2">Fresh organic eggs from our cage-free backyard coop.</p>
                            <p className="text-xs text-text-secondary font-mono">Posted by @organic_farm</p>
                        </div>

                        <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-text-secondary text-[12px] font-bold uppercase tracking-widest">Services</span>
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[14px] rounded-full font-bold">$25/hr</span>
                            </div>
                            <h5 className="text-text-primary font-bold text-base group-hover:text-primary-container transition-colors mb-1">Math & Science Tutor</h5>
                            <p className="text-text-secondary text-lg leading-relaxed mb-2">High school & early college tutoring. 5 years experience. First session free.</p>
                            <p className="text-sm text-text-secondary font-mono">Posted by @edu_support</p>
                        </div>

                        <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-text-secondary text-[12px] font-bold uppercase tracking-widest">Handmade</span>
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[14px] rounded-full font-bold">$15+</span>
                            </div>
                            <h5 className="text-text-primary font-bold text-base group-hover:text-primary-container transition-colors mb-1">Ceramic Mugs & Bowls</h5>
                            <p className="text-text-secondary text-lg leading-relaxed mb-2">Locally spun stoneware mugs and nesting bowls. Dishwasher and microwave safe.</p>
                            <p className="text-sm text-text-secondary font-mono">Posted by @mud_and_fire</p>
                        </div>
                    </div>
                </div>
            </aside>

            <aside className="w-full lg:w-80 flex flex-col gap-6">
                <div className="glass-panel rounded-xl p-6 bg-surface-container-low border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <h4 className="text-lg font-bold text-text-primary uppercase tracking-wider">Local Classifieds</h4>
                            <span className="text-[11px] text-text-secondary/60 font-mono">Time-sensitive community ads</span>
                        </div>
                        <button
                            onClick={() => setIsPostAdOpen(true)}
                            className="text-primary-container hover:underline text-[14px] font-bold cursor-pointer bg-transparent border-none"
                        >
                            + Post Ad
                        </button>
                    </div>

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

                        {/* Ad Card 3 (With Thumbnail Layout Integration) */}
                        <div className="p-4 bg-surface-container-lowest/50 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all cursor-pointer group relative overflow-hidden">
                            <div className="flex gap-3">
                                {/* Visual Thumbnail Placeholder */}
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

                    {/* View All Redirect Anchor */}
                    <button
                        onClick={() => navigate('/classifieds')}
                        className="w-full text-center mt-5 pt-3 border-t border-white/5 text-xs text-text-secondary hover:text-primary-container font-mono tracking-wide flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                        <span>VIEW BOARD DIRECTORY</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </button>
                </div>
            </aside>

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
