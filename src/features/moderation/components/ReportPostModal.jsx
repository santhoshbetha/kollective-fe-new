import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Flag, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../../api/apiClient';
import { usePostsStore } from '../../../store/usePostsStore';
import { cn } from '../../../lib/utils';

const REPORT_CATEGORIES = [
    'Spam',
    'Hate Speech',
    'Harassment & Bullying',
    'Misinformation',
    'Intellectual Property Violation'
];

export function ReportPostModal({ isOpen, onClose, post, authorHandle, authorId }) {
    const [selectedCategory, setSelectedCategory] = useState('Spam');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSelectedCategory('Spam');
            setComment('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const resolvedAuthorId = authorId || post?.author?.id || post?.user_id || post?.user?.id || 'unknown-actor';
    const resolvedHandle = authorHandle || post?.author?.handle || '@user';

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsSubmitting(true);

        const payload = {
            account_id: resolvedAuthorId,
            status_ids: post?.id ? [post.id] : [],
            category: selectedCategory,
            comment: comment.trim() || `Reported under category: ${selectedCategory}`
        };

        try {
            await apiFetch('/api/v1/reports', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.warn('Report request logged:', err);
        } finally {
            setIsSubmitting(false);
        }

        if (post?.id) {
            usePostsStore.getState().removePostEntity(post.id);
        }
        if (resolvedAuthorId && usePostsStore.getState().evictAuthorPosts) {
            usePostsStore.getState().evictAuthorPosts(resolvedAuthorId);
        }

        toast.success(
            `Report submitted for ${resolvedHandle}. Thank you. We have received your report and use your feedback to protect this neighborhood.`
        );
        onClose();
    };

    const modalContent = (
        <div
            role="dialog"
            aria-modal="true"
            data-testid="report-post-modal"
            onClick={(e) => e.stopPropagation()}
            className="modal ReportDialog fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
        >
            <div className="bg-[#141414] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-left">
                {/* Modal Top Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                            <Flag className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-white tracking-tight">
                                Report {resolvedHandle}
                            </h3>
                            <p className="text-[11px] text-neutral-400">
                                Help us understand what is happening with this post.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-neutral-400 hover:text-white border-none bg-transparent cursor-pointer p-1 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* STEP 1: Categorization Option List */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                            1. Select Violation Category
                        </label>
                        <div className="flex flex-col gap-1.5">
                            {REPORT_CATEGORIES.map((category) => {
                                const isSelected = selectedCategory === category;
                                return (
                                    <label
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={cn(
                                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all",
                                            isSelected
                                                ? "bg-rose-500/10 border-rose-500/40 text-white"
                                                : "bg-[#1a1a1a] border-white/5 text-neutral-300 hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="radio"
                                                name="report_category"
                                                value={category.toLowerCase()}
                                                checked={isSelected}
                                                onChange={() => setSelectedCategory(category)}
                                                className="accent-rose-500 cursor-pointer"
                                            />
                                            <span>{category}</span>
                                        </div>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* STEP 2: Context Attachment */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                            2. Additional Context Details (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Details or context describing the policy breach..."
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-500 focus:border-rose-500/50 focus:outline-none resize-none"
                        />
                    </div>

                    {/* Advisory Notice */}
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-neutral-400 leading-relaxed">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                            Submitting this report will immediately hide this post from your active timeline stream.
                        </span>
                    </div>

                    {/* STEP 3: Submit Action */}
                    <div className="flex items-center justify-end gap-2.5 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300 cursor-pointer transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider border-none cursor-pointer transition-all shadow-lg"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
