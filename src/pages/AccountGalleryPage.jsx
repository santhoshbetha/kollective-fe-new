// src/pages/AccountGalleryPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccountGalleryQuery } from '../features/profile/useGalleryFeature';
import { ImageLightbox } from '../features/timeline/ImageLightbox';

export const AccountGalleryPage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAccountGalleryQuery(username);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Extract all individual image links sequentially out of the timeline status nodes block array maps
    const mediaStatuses = data?.pages.flatMap((page) => page.statuses || page || []) || [];
    const allImages = mediaStatuses.flatMap((status) => status.images || (status.image ? [status.image] : []));

    if (status === 'pending') {
        return (
            <div className="pt-32 text-center flex flex-col items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 select-none">
                <div>
                    <h1 className="text-2xl font-black text-text-primary tracking-tight">Media Vault</h1>
                    <p className="text-xs text-text-secondary mt-0.5">Visual records and cryptographic graphic assets catalogued by @{username}.</p>
                </div>
                <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-surface-container border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer select-none">Back</button>
            </div>

            {allImages.length === 0 ? (
                <div className="p-12 text-center border border-white/5 bg-surface-container-low/40 rounded-2xl">
                    <span className="material-symbols-outlined text-3xl text-text-secondary/40 mb-2">photo_library</span>
                    <p className="text-sm text-text-secondary">No media files deposited by this node account.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2 w-full select-none">
                    {allImages.map((src, index) => (
                        <div
                            key={index}
                            onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                            className="aspect-square bg-[#111111] border border-white/5 rounded-xl overflow-hidden cursor-pointer relative group shadow-sm"
                        >
                            <img
                                src={src}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-md">fullscreen</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Fullscreen Lightbox Integration Hook Module */}
            <ImageLightbox
                isOpen={lightboxOpen}
                images={allImages}
                activeIndex={lightboxIndex}
                setActiveIndex={setLightboxIndex}
                onClose={() => setLightboxOpen(false)}
            />
        </div>
    );
};
