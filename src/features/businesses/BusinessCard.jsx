// src/components/BusinessCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryGraphic } from '../../components/CategoryGraphic';
import { Star, MapPin, Clock, Phone, Globe, Share2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export const BusinessCard = ({ biz }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    // 🚀 PROCESSING CHECKPOINT: Safely verifies the async background worker has committed the asset
    const hasValidImage = biz.profile_image_url && biz.is_image_processed && !imgError;

    const renderStars = (rating) => {
        const stars = [];
        const floor = Math.floor(rating || 5.0);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={`star-card-${biz.id}-${i}`}
                    className={cn(
                        "w-3.5 h-3.5 shrink-0",
                        i < floor ? "text-amber-400 fill-amber-400" : "text-text-secondary/20"
                    )}
                />
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
            key={`biz-card-node-${biz.id}`}
            onClick={(e) => handleCardClick(biz.id, e)}
            className="w-full bg-white dark:bg-[#141414] border border-black/10 dark:border-white/5 rounded-2xl p-4 overflow-hidden flex flex-col sm:flex-row gap-4 hover:bg-black/[0.005] dark:hover:bg-white/[0.005] transition-all shadow-md hover:shadow-xl group cursor-pointer text-left font-sans"
        >
            {/* Image Thumbnail Canvas Stage Area Box */}
            <div className="w-full sm:w-44 h-36 sm:h-auto rounded-xl relative bg-black/[0.02] dark:bg-[#0d1117] overflow-hidden shrink-0 select-none">
                {hasValidImage ? (
                    <img
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        src={biz.profile_image_url}
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <CategoryGraphic category={biz.category} title={biz.name} />
                )}

                {/* Status Badges Overlay System */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10 text-[9px] font-black uppercase tracking-wider font-mono">
                    {biz.verified && (
                        <span className="bg-emerald-600/90 text-white backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                            <CheckCircle2 className="w-3 h-3 stroke-[2.5px]" />
                            <span>Verified</span>
                        </span>
                    )}
                    <span className={cn(
                        "backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border shadow-md bg-black/60",
                        biz.open ? 'text-emerald-400 border-emerald-500/20' : 'text-rose-400 border-rose-500/20'
                    )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", biz.open ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400')} />
                        <span>{biz.open ? 'Open' : 'Closed'}</span>
                    </span>
                </div>

                {/* Star Ratings Float Badge overlay */}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1.5 border border-white/10 text-xs shadow-xl">
                    <div className="flex gap-0.5">
                        {renderStars(biz.rating)}
                    </div>
                    <span className="text-white font-mono font-black text-[11px] ml-0.5">{biz.rating || "5.0"}</span>
                </div>
            </div>
            {/* Main Details Metadata Section Container */}
            <div className="flex-1 flex flex-col justify-between min-w-0 font-sans">
                <div>
                    <div className="flex items-start justify-between gap-4 select-none">
                        <h3 className="text-xl font-black text-text-primary dark:text-white tracking-tight group-hover:text-primary-container transition-colors truncate">
                            {biz.name}
                        </h3>
                        <span className="shrink-0 px-2 py-0.5 bg-primary-container/10 border border-primary-container/20 text-primary-container text-xs font-black uppercase rounded tracking-wider font-mono">
                            {biz.category}
                        </span>
                    </div>

                    <p className="text-sm text-text-secondary font-medium leading-snug line-clamp-2 mt-1.5">
                        {biz.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-xs font-semibold text-text-secondary select-none">
                        {biz.address && (
                            <div className="flex items-center gap-2 truncate" title={biz.address}>
                                <MapPin className="w-4 h-4 text-primary-container shrink-0" />
                                <span className="truncate">{biz.address}</span>
                            </div>
                        )}
                        {biz.hours && (
                            <div className="flex items-center gap-2 truncate" title={biz.hours}>
                                <Clock className="w-4 h-4 text-primary-container shrink-0" />
                                <span className="truncate">{biz.hours}</span>
                            </div>
                        )}
                        {biz.phone && (
                            <div className="flex items-center gap-2 truncate" title={biz.phone}>
                                <Phone className="w-4 h-4 text-primary-container shrink-0" />
                                <span className="truncate font-mono">{biz.phone}</span>
                            </div>
                        )}
                        {biz.website && (
                            <div className="flex items-center gap-2 truncate">
                                <Globe className="w-4 h-4 text-primary-container shrink-0" />
                                <a
                                    href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline text-primary-container truncate font-mono font-bold"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {biz.website}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Owner Profile Node & Sharing Actions Row */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2 min-w-0 select-none">
                        {biz.ownerAvatar ? (
                            <img
                                alt="Owner"
                                className="w-6 h-6 rounded-full object-cover border border-black/10 dark:border-white/10 shrink-0"
                                src={biz.ownerAvatar}
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center justify-center text-xs font-black uppercase text-text-primary dark:text-white shrink-0 font-mono">
                                {biz.owner ? biz.owner[0] : 'B'}
                            </div>
                        )}
                        <span className="text-xs font-bold text-text-secondary truncate">@{biz.owner || "merchant"}</span>
                        <span className="text-[10px] text-text-secondary/40 font-mono font-bold shrink-0">({biz.reviewsCount || 0} reviews)</span>
                    </div>

                    <div className="flex gap-2 shrink-0 font-mono text-[10px] uppercase font-black tracking-wider select-none">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert(`Sharing business profile: ${biz.name}`); }}
                            className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/5 text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors cursor-pointer outline-none flex items-center justify-center"
                            title="Share Enterprise node"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); alert(`Starting secure workspace discussion stream with: @${biz.owner}`); }}
                            className="px-3 py-1.5 rounded-xl border border-primary-container/30 text-primary-container hover:bg-primary-container hover:text-white font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1.5 outline-none font-sans uppercase tracking-normal"
                        >
                            <MessageSquare className="w-3.5 h-3.5 stroke-[2.5px]" />
                            <span>Contact</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};
