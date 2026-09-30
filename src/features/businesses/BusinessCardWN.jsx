import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryGraphic } from '../../components/CategoryGraphic';

const BUSINESS_CATEGORY_GRAPHICS = {
    'Food & Beverage': {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
        icon: 'restaurant',
        color: 'from-amber-950/80 via-black/40 to-black/80',
    },
    'Grocery Store': {
        url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        icon: 'local_grocery_store',
        color: 'from-emerald-950/80 via-black/40 to-black/80',
    },
    'Healthcare': {
        url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
        icon: 'medical_services',
        color: 'from-blue-950/80 via-black/40 to-black/80',
    },
    'Transportation': {
        url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        icon: 'directions_bus',
        color: 'from-sky-950/80 via-black/40 to-black/80',
    },
    'Retail & Crafts': {
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
        icon: 'shopping_bag',
        color: 'from-purple-950/80 via-black/40 to-black/80',
    },
    'Fitness & Wellness': {
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
        icon: 'fitness_center',
        color: 'from-rose-950/80 via-black/40 to-black/80',
    },
    'Beauty & Personal Care': {
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
        icon: 'content_cut',
        color: 'from-pink-950/80 via-black/40 to-black/80',
    },
    'Agriculture': {
        url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
        icon: 'agriculture',
        color: 'from-green-950/80 via-black/40 to-black/80',
    },
    'Cleaning Services': {
        url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
        icon: 'cleaning_services',
        color: 'from-teal-950/80 via-black/40 to-black/80',
    },
    'Movers': {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        icon: 'local_shipping',
        color: 'from-amber-950/80 via-black/40 to-black/80',
    },
    'Technology': {
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        icon: 'memory',
        color: 'from-indigo-950/80 via-black/40 to-black/80',
    },
    'Professional Services': {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
        icon: 'work',
        color: 'from-slate-950/80 via-black/40 to-black/80',
    },
    'Legal Services': {
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
        icon: 'gavel',
        color: 'from-stone-950/80 via-black/40 to-black/80',
    },
    'Tax Services': {
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        icon: 'calculate',
        color: 'from-emerald-950/80 via-black/40 to-black/80',
    },
    'Manufacturing': {
        url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
        icon: 'precision_manufacturing',
        color: 'from-red-950/80 via-black/40 to-black/80',
    },
    'Construction': {
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        icon: 'construction',
        color: 'from-orange-950/80 via-black/40 to-black/80',
    },
};

const DEFAULT_CATEGORY_GRAPHIC = {
    url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&q=80',
    icon: 'storefront',
    color: 'from-red-950/80 via-black/40 to-black/80',
};

export const BusinessCard = ({ biz }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    const categoryGraphic = BUSINESS_CATEGORY_GRAPHICS[biz.category] || DEFAULT_CATEGORY_GRAPHIC;
    const hasValidImage = biz.image && !imgError;

    const renderStars = (rating) => {
        const stars = [];
        const floor = Math.floor(rating || 0);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span
                    key={i}
                    className="material-symbols-outlined text-[14px] text-amber-400"
                    style={{ fontVariationSettings: `'FILL' ${i < floor ? 1 : 0}` }}
                >
                    star
                </span>
            );
        }
        return stars;
    };

    const handleCardClick = (bizId, e) => {
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        navigate(`/businesses/${bizId}`);
    };

    return (
        <article
            key={biz.id}
            onClick={(e) => handleCardClick(biz.id, e)}
            className="glass-card rounded-2xl p-4 overflow-hidden flex flex-col sm:flex-row gap-4 border border-white/10 hover:border-primary-container/30 bg-surface-container-low/90 hover:bg-surface-container-low transition-all shadow-md hover:shadow-xl group cursor-pointer"
        >
            {/* Image Thumbnail Section */}
            <div className="w-full sm:w-44 h-36 sm:h-auto rounded-xl relative bg-surface-container-high overflow-hidden shrink-0">
                {hasValidImage ? (
                    <img
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={biz.image}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <CategoryGraphic category={biz.category} title={biz.name} />
                )}

                {/* Status Badges Overlay */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                    {biz.verified && (
                        <span className="bg-green-500/80 text-white backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                            <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                            </span>
                            Verified
                        </span>
                    )}
                    <span className={`backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 border shadow-sm ${biz.open
                        ? 'bg-black/60 text-green-400 border-green-500/40'
                        : 'bg-black/60 text-red-400 border-red-500/40'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${biz.open ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                        {biz.open ? 'Open' : 'Closed'}
                    </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10 text-xs">
                    <div className="flex gap-0.2">
                        {renderStars(biz.rating)}
                    </div>
                    <span className="text-white font-bold text-[11px] ml-0.5">{biz.rating}</span>
                </div>
            </div>

            {/* Main Details Section */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-headline-sm text-xl font-bold text-text-primary tracking-tight group-hover:text-primary-container transition-colors truncate">
                            {biz.name}
                        </h3>
                        <span className="shrink-0 px-2 py-0.5 bg-primary-container/10 border border-primary-container/20 text-primary-container text-[14px] font-extrabold uppercase rounded tracking-wider">
                            {biz.category}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-[18px] text-text-secondary leading-snug line-clamp-2 mt-1">
                        {biz.description}
                    </p>

                    {/* Info Metadata Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-white/5 text-[16px] text-text-secondary">
                        {biz.address && (
                            <div className="flex items-center gap-1.5 truncate">
                                <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">location_on</span>
                                <span className="truncate">{biz.address}</span>
                            </div>
                        )}
                        {biz.hours && (
                            <div className="flex items-center gap-1.5 truncate">
                                <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">schedule</span>
                                <span className="truncate">{biz.hours}</span>
                            </div>
                        )}
                        {biz.phone && (
                            <div className="flex items-center gap-1.5 truncate">
                                <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">call</span>
                                <span className="truncate">{biz.phone}</span>
                            </div>
                        )}
                        {biz.website && (
                            <div className="flex items-center gap-1.5 truncate">
                                <span className="material-symbols-outlined text-primary-container text-[15px] shrink-0">language</span>
                                <a
                                    href={`https://${biz.website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline text-primary-container truncate"
                                >
                                    {biz.website}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Owner & Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 min-w-0">
                        {biz.ownerAvatar ? (
                            <img
                                alt="Owner"
                                className="w-6 h-6 rounded-full object-cover border border-white/10 shrink-0"
                                src={biz.ownerAvatar}
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-[16px] text-white shrink-0">
                                {biz.owner ? biz.owner[0] : 'B'}
                            </div>
                        )}
                        <span className="text-[16px] text-text-secondary font-medium truncate">@{biz.owner}</span>
                        <span className="text-[14px] text-text-secondary/50 font-mono shrink-0">({biz.reviewsCount || 0} reviews)</span>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => alert(`Sharing business: ${biz.name}`)}
                            className="p-1.5 rounded-lg border border-white/10 text-text-secondary hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                            title="Share"
                        >
                            <span className="material-symbols-outlined text-[15px]">share</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => alert(`Starting discussion with: @${biz.owner}`)}
                            className="px-3 py-1 rounded-lg border border-primary-container/30 text-primary-container hover:bg-primary-container hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                            <span>Contact</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};



