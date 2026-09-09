// src/features/classifieds/PostAdModal.jsx
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

export const PostAdModal = ({ isOpen, onClose, onAdCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'For Sale',
        price: '',
        neighborhood: '',
        description: '',
        duration_days: '7'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const categories = ['For Sale', 'Services', 'Handmade', 'Housing', 'Gigs', 'Community'];
    const neighborhoods = ['Downtown', 'East End', 'Heights', 'Midtown', 'North Side', 'West Hills'];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (formData.title.length > 50) newErrors.title = 'Title must be under 50 characters';
        if (!formData.price.trim()) newErrors.price = 'Price or "Free" is required';
        if (!formData.neighborhood) newErrors.neighborhood = 'Please select your neighborhood';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.length < 10) newErrors.description = 'Provide a bit more detail (min 10 chars)';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Elixir API endpoint route destination placeholder
            const response = await fetch('/api/classifieds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classified: formData }),
            });

            if (response.ok) {
                const newAd = await response.json();
                onAdCreated(newAd);
                onClose();
                setFormData({ title: '', category: 'For Sale', price: '', neighborhood: '', description: '', duration_days: '7' });
            } else {
                setErrors({ server: 'Failed to broadcast ad. Ensure residency token is active.' });
            }
        } catch (err) {
            setErrors({ server: 'Network communication bottleneck encountered.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Box */}
            <div className="w-full max-w-lg overflow-hidden border border-outline-variant rounded-2xl bg-surface-container/95 backdrop-blur-md shadow-2xl transition-all relative">
                {/* Decorative atmospheric background detail */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>

                {/* Modal Header */}
                <div className="p-6 border-b border-outline-variant bg-surface-container-high/30 relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-on-surface tracking-tight font-serif italic">Pin to the Town Bulletin</h3>
                            <p className="text-xs text-on-surface-variant font-mono mt-0.5 uppercase tracking-wider">Time-limited neighborhood dispatch</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer material-symbols-outlined text-[20px] bg-transparent border-none"
                        >
                            close
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs relative z-10">
                    {errors.server && (
                        <div className="p-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl font-mono text-xs">
                            {errors.server}
                        </div>
                    )}

                    {/* Title input fields wrapper */}
                    <div className="space-y-1.5">
                        <label className="text-on-surface-variant uppercase tracking-wider font-bold">Listing / Action Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Backyard Rhubarb Harvest"
                            className={cn(
                                "w-full bg-surface-container-lowest border rounded-xl py-3 px-4 text-sm font-sans text-on-surface focus:outline-none transition-all",
                                errors.title ? 'border-red-500/50 focus:border-red-500' : 'border-outline-variant focus:border-primary-container'
                            )}
                        />
                        {errors.title && <p className="text-red-400 text-[11px] mt-1">{errors.title}</p>}
                    </div>

                    {/* Category & Price Split Grid Row layout */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-on-surface-variant uppercase tracking-wider font-bold">Category</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-3 text-sm font-sans text-on-surface focus:outline-none focus:border-primary-container appearance-none cursor-pointer"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-on-surface-variant uppercase tracking-wider font-bold">Ask Price / Rate</label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g., $5/lb or Free"
                                className={cn(
                                    "w-full bg-surface-container-lowest border rounded-xl py-3 px-4 text-sm font-sans text-on-surface focus:outline-none transition-all",
                                    errors.price ? 'border-red-500/50 focus:border-red-500' : 'border-outline-variant focus:border-primary-container'
                                )}
                            />
                            {errors.price && <p className="text-red-400 text-[11px] mt-1">{errors.price}</p>}
                        </div>
                    </div>

                    {/* Neighborhood & Timeline parameters */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-on-surface-variant uppercase tracking-wider font-bold">Local Quarter</label>
                            <div className="relative">
                                <select
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                    className={cn(
                                        "w-full bg-surface-container-lowest border rounded-xl py-3 px-3 text-sm font-sans text-on-surface focus:outline-none appearance-none cursor-pointer transition-all",
                                        errors.neighborhood ? 'border-red-500/50 focus:border-red-500' : 'border-outline-variant focus:border-primary-container'
                                    )}
                                >
                                    <option value="">Select Anchor...</option>
                                    {neighborhoods.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
                            </div>
                            {errors.neighborhood && <p className="text-red-400 text-[11px] mt-1">{errors.neighborhood}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-on-surface-variant uppercase tracking-wider font-bold">Board Lifespan</label>
                            <div className="relative">
                                <select
                                    name="duration_days"
                                    value={formData.duration_days}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-3 text-sm font-sans text-on-surface focus:outline-none focus:border-primary-container appearance-none cursor-pointer"
                                >
                                    <option value="1">24 Hours (Flash Offer)</option>
                                    <option value="3">3 Days (Weekend Cycle)</option>
                                    <option value="7">7 Days (Standard Index)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Description Textarea Field markup */}
                    <div className="space-y-1.5">
                        <label className="text-on-surface-variant uppercase tracking-wider font-bold">Bulletin Content Box</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Detail what you are offering, item conditions, or immediate community needs..."
                            className={cn(
                                "w-full bg-surface-container-lowest border rounded-xl py-3 px-4 text-sm font-serif italic text-on-surface focus:outline-none transition-all resize-none",
                                errors.description ? 'border-red-500/50 focus:border-red-500' : 'border-outline-variant focus:border-primary-container'
                            )}
                        />
                        {errors.description && <p className="text-red-400 text-[11px] mt-1">{errors.description}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-on-surface-variant hover:text-on-surface px-4 py-2 font-mono text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer bg-transparent border-none"
                        >
                            Cancel & Return
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 ml-4 bg-primary-container text-white px-6 py-2 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed crimson-glow font-serif italic cursor-pointer border-none"
                        >
                            {isSubmitting ? 'Pinning...' : 'Pin to Board'}
                            <span className="material-symbols-outlined text-[16px]">
                                push_pin
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
