// src/pages/BusinessDetailsPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessDetailsQuery } from '../../features/businesses/useBusinessesFeature';
import {
    ArrowLeft, Loader2, AlertCircle, Star, CheckCircle2,
    Heart, Share2, MapPin, Phone, Mail, Globe, Clock,
    Calendar, Users, MessageSquare
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const BusinessDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { business, businessLoading, businessError } = useBusinessDetailsQuery(id);

    const [activeSubTab, setActiveSubTab] = useState('about');
    const [imgError, setImgError] = useState(false);

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
                    The requested local enterprise registry map could not be verified or has been safely un-listed from the network.
                </p>
                <button
                    onClick={() => navigate('/businesses')}
                    className="w-full py-3 bg-primary-container text-white font-black rounded-xl text-xs uppercase tracking-wider font-mono outline-none shadow-md border-none cursor-pointer hover:brightness-105 transition-all active:scale-95"
                >
                    Return to Directory
                </button>
            </div>
        );
    }

    const renderStars = (rating = 5.0) => {
        const stars = [];
        const floor = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={`detail-star-${i}`}
                    className={cn(
                        "w-4 h-4 shrink-0",
                        i < floor ? "text-amber-400 fill-amber-400" : "text-text-secondary/20"
                    )}
                />
            );
        }
        return stars;
    };

    // Safe Fallback Extraction Gate mappings for incoming database object parameters
    const ownerHandle = business.owner_name || (typeof business.owner === 'string' ? business.owner : business.owner?.username) || 'community_member';
    const ownerAvatar = business.ownerAvatar || (typeof business.owner === 'object' ? business.owner?.avatar_url : null);
    const servicesList = Array.isArray(business.services) ? business.services : [];
    const reviewsCount = business.reviewsCount ?? business.reviews_count ?? 0;
    const ratingValue = business.rating ?? 5.0;
    const addressText = business.address || business.contact?.address || 'Local District Coordinates TBA';
    const phoneText = business.phone || business.contact?.phone || 'N/A';
    const emailText = business.email || business.contact?.email || 'N/A';
    const websiteText = business.website || business.contact?.website || 'kollective.social';
    const hoursText = business.hours || business.business_hours || '9:00 AM - 5:00 PM';
    const establishedYear = business.established || business.year_established || 'N/A';
    const employeesCount = business.employees || business.number_of_employees || '1-5';

    // 🚀 PROCESSING CHECKPOINT: Shield the UI from displaying broken raw paths while processing image payloads
    const isCoverValid = business.profile_image_url && business.is_image_processed && !imgError;

    return (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 font-sans">

            {/* Back Link Router Toggle Row */}
            <button
                onClick={() => navigate('/businesses')}
                className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary font-black text-xs font-mono uppercase tracking-wider transition-colors mb-6 bg-transparent border-none cursor-pointer outline-none select-none group"
            >
                <ArrowLeft className="w-4 h-4 stroke-[2.5px] transition-transform group-hover:-translate-x-1" />
                <span>Back to Businesses</span>
            </button>

            {/* Hero Section Banner Layout Block */}
            <div className="relative w-full h-[260px] md:h-[400px] rounded-3xl overflow-hidden mb-8 border border-black/10 dark:border-white/10 group shadow-2xl bg-black/[0.02] dark:bg-surface-container select-none">
                {isCoverValid ? (
                    <img
                        alt={business.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.015]"
                        src={business.profile_image_url || business.image}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/[0.01] dark:bg-surface-container-low text-text-secondary">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-container opacity-40 mb-2" />
                        <span className="font-mono text-[10px] font-black uppercase tracking-widest opacity-60">Syncing Media Assets...</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

                <div className="absolute top-6 left-6 font-mono text-xs uppercase font-black tracking-widest shadow-2xl">
                    {business.verified && (
                        <span className="bg-primary-container text-white px-4 py-2 rounded-full flex items-center gap-1.5 border border-white/10 shadow-lg">
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5px]" />
                            <span>Verified Business</span>
                        </span>
                    )}
                </div>

                <div className="absolute bottom-6 right-6 flex gap-3 shadow-2xl">
                    <button
                        onClick={() => alert('Added enterprise node to system bookmarks!')}
                        className="bg-black/60 backdrop-blur-md hover:bg-neutral-900 border border-white/10 p-3 rounded-full transition-colors shadow-xl text-white outline-none cursor-pointer"
                        title="Bookmark Enterprise Node"
                    >
                        <Heart className="w-5 h-5 fill-current" />
                    </button>
                    <button
                        onClick={() => alert('Secure permalink copied to clipboard registry!')}
                        className="bg-black/60 backdrop-blur-md hover:bg-neutral-900 border border-white/10 p-3 rounded-full transition-colors shadow-xl text-white outline-none cursor-pointer"
                        title="Share Node Directory"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column Description Details */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-[#141414] rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/5 relative overflow-hidden text-left">
                        <h1 className="text-3xl font-black text-text-primary dark:text-white mb-2 tracking-tight">
                            {business.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="flex items-center gap-1">
                                {renderStars(ratingValue)}
                                <span className="font-bold text-text-primary dark:text-white text-base ml-1">{ratingValue}</span>
                                <span className="text-text-secondary text-xs font-semibold font-mono">({reviewsCount} reviews)</span>
                            </div>
                            <div className="w-1.5 h-1.5 bg-black/10 dark:bg-white/10 rounded-full" />
                            <div className="flex items-center gap-2 cursor-pointer group select-none">
                                {ownerAvatar ? (
                                    <img className="w-7 h-7 rounded-full object-cover border border-primary/20" src={ownerAvatar} alt="Owner" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center border border-black/10 dark:border-white/10 text-xs uppercase font-black font-mono">
                                        {ownerHandle ? ownerHandle[0] : 'O'}
                                    </div>
                                )}
                                <span className="text-xs font-bold text-text-secondary group-hover:text-primary transition-colors">
                                    Owned by <span className="text-text-primary dark:text-white font-black">@{ownerHandle}</span>
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-text-secondary text-sm font-semibold select-none">
                            <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-primary-container shrink-0 mt-0.5" /><span>{addressText}</span></div>
                            <div className="flex items-start gap-3"><Phone className="w-4 h-4 text-primary-container shrink-0 mt-0.5" /><span className="font-mono">{phoneText}</span></div>
                            <div className="flex items-start gap-3"><Mail className="w-4 h-4 text-primary-container shrink-0 mt-0.5" /><a className="hover:text-primary font-mono transition-colors" href={`mailto:${emailText}`}>{emailText}</a></div>
                            <div className="flex items-start gap-3"><Globe className="w-4 h-4 text-primary-container shrink-0 mt-0.5" /><a className="hover:text-primary font-mono transition-colors" href={websiteText.startsWith('http') ? websiteText : `https://${websiteText}`} target="_blank" rel="noreferrer">{websiteText}</a></div>
                            <div className="flex items-start gap-3"><Clock className="w-4 h-4 text-primary-container shrink-0 mt-0.5" /><span>{hoursText}</span></div>
                        </div>
                    </div>

                    {/* Sub Tabs Selection Controls Strip Row */}
                    <div className="border-b border-black/10 dark:border-white/10 flex gap-8 select-none font-sans font-bold text-base uppercase tracking-wider">
                        {['about', 'services', 'reviews'].map((tab) => (
                            <button
                                key={`sub-tab-btn-${tab}`}
                                onClick={() => setActiveSubTab(tab)}
                                className={cn(
                                    "pb-4 bg-transparent border-none cursor-pointer transition-all outline-none text-xs font-black tracking-widest font-mono",
                                    activeSubTab === tab ? 'text-primary-container border-b-2 border-primary-container' : 'text-text-secondary hover:text-text-primary'
                                )}
                            >
                                {tab === 'reviews' ? `Reviews (${reviewsCount})` : tab}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-8 pt-2 text-left">
                        {activeSubTab === 'about' && (
                            <section className="space-y-4">
                                <h3 className="text-lg font-black text-text-primary dark:text-white tracking-tight">About this business</h3>
                                <p className="text-sm text-text-secondary font-medium leading-relaxed">{business.description || 'Verified local business inside the Kollective Directory.'}</p>
                                <div className="pt-4 select-none">
                                    <h3 className="text-lg font-black text-text-primary dark:text-white tracking-tight mb-4">Gallery</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="group relative rounded-2xl overflow-hidden aspect-square cursor-zoom-in bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 shadow-md">
                                            <img alt="Workspace view" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" src="https://unsplash.com" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeSubTab === 'services' && (
                            <section className="space-y-4">
                                <h3 className="text-lg font-black text-text-primary dark:text-white tracking-tight">Services &amp; Offerings</h3>
                                {servicesList.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {servicesList.map((svc, i) => (
                                            <div key={`svc-opt-${i}`} className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 p-4 rounded-xl flex items-center gap-3 font-semibold text-sm text-text-primary dark:text-white shadow-inner">
                                                <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0 stroke-[2.5px]" />
                                                <span>{svc}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-text-secondary text-sm font-medium">No specific services listed yet.</p>
                                )}
                            </section>
                        )}

                        {activeSubTab === 'reviews' && (
                            <section className="space-y-6">
                                <div className="flex justify-between items-center select-none font-mono text-[10px] uppercase font-bold tracking-wider">
                                    <h3 className="text-lg font-black text-text-primary dark:text-white tracking-tight font-sans normal-case">Customer Feedback</h3>
                                    <button onClick={() => alert('Review feature coming soon!')} className="px-4 py-2 border border-primary-container/30 text-primary-container rounded-xl hover:bg-primary-container/10 font-bold text-xs transition-colors cursor-pointer outline-none uppercase font-mono tracking-wider bg-transparent">Add Review</button>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-surface-ink border border-black/10 dark:border-white/10 p-5 rounded-2xl shadow-md">
                                        <div className="flex items-center gap-2 mb-3 select-none">
                                            <div className="flex gap-0.5">{renderStars(5)}</div>
                                            <span className="text-sm font-black text-text-primary dark:text-white tracking-tight ml-1">Marcus Chen</span>
                                            <span className="text-[11px] font-mono font-bold text-text-secondary/40 ml-auto">1 week ago</span>
                                        </div>
                                        <p className="text-sm text-text-secondary leading-relaxed font-medium">Excellent service! Highly recommended community vendor.</p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Right Column Bento Widgets Stats Sidebar Panel */}
                <div className="lg:col-span-4 space-y-6 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 text-left select-none font-mono uppercase tracking-wider font-bold">
                        <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 p-5 rounded-3xl flex flex-col gap-1 shadow-md transition-colors">
                            <div className="flex justify-between items-start mb-2"><Calendar className="w-5 h-5 text-primary-container shrink-0" /><span className="text-[10px] text-text-secondary font-black tracking-widest">Since</span></div>
                            <span className="text-2xl font-black text-text-primary dark:text-white font-sans normal-case tracking-tight">{establishedYear}</span>
                            <span className="text-[10px] text-text-secondary/60 mt-1 font-bold">Established Year</span>
                        </div>
                        <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 p-5 rounded-3xl flex flex-col gap-1 shadow-md transition-colors">
                            <div className="flex justify-between items-start mb-2"><Users className="w-5 h-5 text-primary-container shrink-0" /><span className="text-[10px] text-text-secondary font-black tracking-widest">Team</span></div>
                            <span className="text-2xl font-black text-text-primary dark:text-white font-sans normal-case tracking-tight">{employeesCount}</span>
                            <span className="text-[10px] text-text-secondary/60 mt-1 font-bold">Employees range</span>
                        </div>
                        <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 p-5 rounded-3xl flex flex-col gap-1 shadow-md transition-colors">
                            <div className="flex justify-between items-start mb-2"><MessageSquare className="w-5 h-5 text-primary-container shrink-0" /><span className="text-[10px] text-text-secondary font-black tracking-widest">Feedback</span></div>
                            <span className="text-2xl font-black text-text-primary dark:text-white font-sans normal-case tracking-tight">{reviewsCount}</span>
                            <span className="text-[10px] text-text-secondary/60 mt-1 font-bold">Total Reviews</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 p-5 rounded-3xl space-y-4 shadow-xl text-left select-none uppercase font-mono font-bold text-xs tracking-wider">
                        <h4 className="text-sm font-black text-text-primary dark:text-white font-sans normal-case tracking-tight">Quick Actions</h4>
                        <button onClick={() => alert(`Calling business line: ${phoneText}`)} className="w-full bg-primary-container text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 border-none outline-none font-mono cursor-pointer crimson-glow"><Phone className="w-4 h-4 shrink-0" /><span>Contact Business</span></button>
                        <button onClick={() => alert(`Opening secure chat stream with @${ownerHandle}`)} className="w-full bg-black/[0.02] dark:bg-[#222] border border-black/10 dark:border-white/10 text-text-primary dark:text-white py-3.5 rounded-2xl font-black text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 border-none cursor-pointer outline-none font-mono">Send Message</button>
                    </div>

                    <div className="rounded-3xl overflow-hidden h-48 border border-black/10 dark:border-white/5 relative group cursor-pointer shadow-lg select-none">
                        <img alt="Map Location placeholder layout" className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-[1.015] transition-all duration-500" src="https://unsplash.com" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none shadow-inner"><div className="bg-primary-container p-2.5 rounded-full shadow-lg animate-bounce"><MapPin className="w-5 h-5 text-white stroke-[2.5px]" /></div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
