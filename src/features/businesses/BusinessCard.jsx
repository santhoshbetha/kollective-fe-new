import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggleEventInterest } from '../../features/events/useEventsFeature';

export const BusinessCard = ({ biz }) => {
    const toggleEventInterest = useToggleEventInterest();
    const navigate = useNavigate();

    const isLive = biz?.format?.toLowerCase() === 'online' || biz?.format?.toLowerCase() === 'live' || biz?.isLive;

    const renderStars = (rating) => {
        const stars = [];
        const floor = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span
                    key={i}
                    className="material-symbols-outlined text-[16px]"
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
        <div
            key={biz.id}
            onClick={(e) => handleCardClick(biz.id, e)}
            className="glass-card rounded-[24px] overflow-hidden flex flex-col lg:flex-row shadow-2xl transition-all border border-white/5 hover:border-primary-container/20 group cursor-pointer"
        >
            {/* Image Section */}
            <div className="lg:w-[280px] h-[260px] lg:h-auto relative bg-surface-container-high overflow-hidden flex-shrink-0">
                {biz.image ? (
                    <img
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                        src={biz.image}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-text-secondary">
                        <span className="material-symbols-outlined text-5xl">storefront</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {biz.verified && (
                        <span className="bg-green-500/20 text-green-400 backdrop-blur-md px-3 py-1 rounded-full text-[14px] font-bold border border-green-500/30 flex items-center gap-1 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                            </span>
                            Verified
                        </span>
                    )}
                    <span className={`backdrop-blur-md px-3 py-1 rounded-full text-[14px] font-bold border flex items-center gap-1 uppercase tracking-wider ${biz.open
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                        {biz.open ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Open Now
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Closed
                            </>
                        )}
                    </span>
                </div>

                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                    <div className="flex text-text-secondary gap-0.5">
                        {renderStars(biz.rating)}
                    </div>
                    <span className="text-white font-bold text-sm">{biz.rating}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="font-headline-md text-2xl font-bold text-text-primary mb-2 group-hover:text-primary-container transition-colors">
                                {biz.name}
                            </h2>
                            <p className="font-body-md text-lg text-text-secondary leading-relaxed">
                                {biz.description}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        <div className="flex items-center gap-2 text-text-secondary text-lg">
                            <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                            <span className="truncate">{biz.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-lg">
                            <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                            <span>{biz.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-lg">
                            <span className="material-symbols-outlined text-primary text-[18px]">language</span>
                            <a
                                href={`https://${biz.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline text-primary"
                            >
                                {biz.website}
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-lg">
                            <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                            <span>{biz.hours}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        {biz.ownerAvatar ? (
                            <div className="relative w-10 h-10 rounded-full border-2 border-primary-container p-[1px]">
                                <img
                                    alt="Owner"
                                    className="w-full h-full rounded-full object-cover"
                                    src={biz.ownerAvatar}
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-sm text-white">
                                {biz.owner[0]}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-bold text-on-surface">@{biz.owner}</p>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[12px] rounded-full border border-primary/20 uppercase font-extrabold tracking-wider">
                                {biz.category}
                            </span>
                        </div>
                        <div className="h-6 w-px bg-white/10 mx-1"></div>
                        <span className="text-[14px] text-text-secondary">{biz.reviewsCount} reviews</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => alert(`Sharing business: ${biz.name}`)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-text-primary text-sm font-bold hover:bg-white/5 transition-all"
                        >
                            <span className="material-symbols-outlined text-[16px]">share</span>
                            Share
                        </button>
                        <button
                            onClick={() => alert(`Starting discussion with: @${biz.owner}`)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary-container/30 text-primary-container text-sm font-bold hover:bg-primary-container/10 transition-all"
                        >
                            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                            Contact
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};



