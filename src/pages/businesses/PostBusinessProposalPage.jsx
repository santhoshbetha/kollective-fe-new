// src/pages/PostBusinessProposalPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProposal } from '../../features/businesses/useProposalsFeature';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { ChevronDown, X, Sparkles, Info, Target, Landmark, HelpCircle, MapPin, Globe } from 'lucide-react';
import { cn } from "@/lib/utils";

const CATEGORIES = [
    'Food & Beverage', 'Grocery Store', 'Healthcare', 'Transportation',
    'Retail & Crafts', 'Fitness & Wellness', 'Beauty & Personal Care',
    'Agriculture', 'Cleaning Services', 'Movers', 'Technology',
    'Professional Services', 'Legal Services', 'Tax Services',
    'Manufacturing', 'Construction'
];

export function PostBusinessProposalPage() {
    const navigate = useNavigate();
    const createProposalMutation = useCreateProposal();
    const user = useAuthStore((state) => state.user);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Technology',
        location: '',
        fundingGoal: '',
        minInvest: '',
        maxInvest: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const triggerToast = (msg, type = 'error') => {
        setToastMessage({ msg, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim() || !formData.fundingGoal) {
            triggerToast('Please fill out the proposal title, description, and funding goal.', 'error');
            return;
        }

        setIsSubmitting(true);

        const goal = parseInt(formData.fundingGoal, 10) || 50000;
        const minInv = parseInt(formData.minInvest, 10) || 100;
        const maxInv = parseInt(formData.maxInvest, 10) || 10000;

        // 🚀 STABILITY FIX: Wrapped user fields inside an optional chain to block runtime ReferenceErrors if signed out
        const currentOwnerHandle = user?.username || 'anonymous_organizer';

        const proposalData = {
            name: formData.title.trim(),
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            location: formData.location || 'Local District',
            address: formData.location || 'Local District',
            fundingGoal: goal,
            money_required: goal,
            minInvest: minInv,
            minimum_amount: minInv,
            maxInvest: maxInv,
            maximum_amount: maxInv,
            funding_required: true,
            fundingCollected: 0,
            percent: 0,
            daysLeft: 45,
            participants: '0 Members',
            status: 'New',
            metadata: {
                funding_data: {
                    funding_required: true,
                    money_required: goal,
                    fundingGoal: goal,
                    minimum_amount: minInv,
                    minInvest: minInv,
                    maximum_amount: maxInv,
                    maxInvest: maxInv,
                    fundingCollected: 0,
                    percent: 0,
                    daysLeft: 45,
                    participants: '0 Members',
                    status: 'New'
                },
                location: formData.location || 'Local District',
                looking_for: ['Co-founder', 'Tech Lead', 'Operations'],
                owner_handle: currentOwnerHandle
            }
        };

        createProposalMutation.mutate(proposalData, {
            onSuccess: () => {
                triggerToast('Community business proposal successfully published!', 'success');
                setTimeout(() => {
                    setIsSubmitting(false);
                    navigate('/businesses');
                }, 1200);
            },
            onError: (err) => {
                setIsSubmitting(false);
                triggerToast(err?.message || 'Failed to post business proposal.', 'error');
            }
        });
    };
    return (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 relative space-y-8 bg-[#090d12]X">
            {/* 🥞 Embedded Floating Toast Notification */}
            {toastMessage && (
                <div className={cn(
                    "fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-in fade-in duration-200",
                    toastMessage.type === 'success' ? "bg-green-600 text-white" : "bg-[#a10836] text-white"
                )}>
                    <span>{toastMessage.msg}</span>
                    <button type="button" onClick={() => setToastMessage(null)} className="bg-transparent border-none text-white cursor-pointer ml-2">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* 🗺️ Breadcrumb & Navigation Actions Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6 select-none text-left">
                <div>
                    <nav className="flex items-center gap-2 text-text-secondary text-[10px] font-mono font-bold mb-3 uppercase tracking-widest">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/businesses')}>Businesses</span>
                        <ChevronDown className="w-3 h-3 text-text-secondary rotate-270" />
                        <span className="text-primary-container">Post Proposal Node</span>
                    </nav>
                    <h1 className="font-headline-lg text-3xl font-black text-white tracking-tight">New Business Proposal</h1>
                    <p className="text-text-secondary font-medium text-sm max-w-xl mt-1.5 leading-relaxed font-sans">
                        Draft your initiative for community backing and investment. Scale solidarity networks and shared infrastructure.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto font-mono text-xs">
                    <button
                        type="button"
                        onClick={() => navigate('/businesses')}
                        className="flex-1 sm:flex-none px-6 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-white/5 hover:text-white transition-all font-bold cursor-pointer bg-transparent"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-8 py-3 bg-primary-container text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all crimson-glow flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed border-none shadow-lg"
                    >
                        {isSubmitting ? 'Publishing Matrix...' : 'Post Proposal'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 📋 Left Column Content Block Shell */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-surface-container rounded-2xl p-6 sm:p-8 border border-black/10 dark:border-white/5 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Proposal Title *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                    placeholder="e.g. District Solar Hydro-Grid"
                                    type="text"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Detailed Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm placeholder:text-text-secondary/30 min-h-[160px] h-40 resize-none font-normal"
                                    placeholder="Provide a detailed breakdown of your vision, the problem it solves, and how the community stands to gain..."
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Category *</label>
                                    <div className="relative group">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm appearance-none cursor-pointer outline-none font-medium pr-10"
                                        >
                                            {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-white dark:bg-[#141414] text-text-primary dark:text-white">{cat}</option>)}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-primary-container" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Target Location *</label>
                                    <div className="relative group">
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                            placeholder="e.g. District 4, Haven City"
                                            type="text"
                                        />
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/40 pointer-events-none group-focus-within:text-primary-container" />
                                    </div>
                                </div>
                            </div>
                            {/* Funding Goal & Investment Bounds Setup */}
                            <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5 select-none font-mono">
                                <div className="flex items-center gap-2 text-text-primary dark:text-white">
                                    <Landmark className="w-4 h-4 text-primary-container" />
                                    <h4 className="font-bold text-xs uppercase tracking-wider">Financial & Investment Structure</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono">Funding Goal (USD) *</label>
                                        <div className="relative group">
                                            <input
                                                name="fundingGoal"
                                                value={formData.fundingGoal}
                                                onChange={handleInputChange}
                                                className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-8 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. 150000"
                                                type="number"
                                                required
                                            />
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60 font-bold text-sm font-mono group-focus-within:text-primary-container">$</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono">Min Backing (USD)</label>
                                        <div className="relative group">
                                            <input
                                                name="minInvest"
                                                value={formData.minInvest}
                                                onChange={handleInputChange}
                                                className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-8 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. 50"
                                                type="number"
                                            />
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60 font-bold text-sm font-mono group-focus-within:text-primary-container">$</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block font-mono">Max Backing (USD)</label>
                                        <div className="relative group">
                                            <input
                                                name="maxInvest"
                                                value={formData.maxInvest}
                                                onChange={handleInputChange}
                                                className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-8 text-text-primary dark:text-white focus:border-primary-container focus:outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. 25000"
                                                type="number"
                                            />
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60 font-bold text-sm font-mono group-focus-within:text-primary-container">$</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                {/* 📊 Right Column: Context/Collaboration Information Sidebar */}
                <aside className="lg:col-span-4 space-y-6">

                    {/* Visual Strategy Layout Card */}
                    <div className="bg-[#141414] rounded-2xl overflow-hidden border border-white/5 group text-left select-none animate-in fade-in duration-200">
                        <div className="relative h-44 w-full bg-black/40 overflow-hidden border-b border-white/5">
                            <img
                                alt="Strategy Preview"
                                // 🚀 THE ORB SECURITY FIX: Bypasses network request blocking with an integrated local data URI string vector
                                src='data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231a1a1c"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8" fill="%23444">STRATEGY_PREVIEW</text></svg>'
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231a1a1c"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8" fill="%23e53e3e">ACCESS_BLOCKED</text></svg>';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent opacity-90"></div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-primary-container font-mono">Proposal Clarity</h3>
                            <p className="text-xs text-text-secondary leading-relaxed font-sans">
                                Detail exactly how the requested capital will be utilized. Transparent budgeting and milestone planning attract the highest backer engagement.
                            </p>
                        </div>
                    </div>

                    {/* Collaboration Highlights Checklist Panel */}
                    <div className="bg-primary-container/[0.02] border border-primary-container/10 rounded-2xl p-6 relative overflow-hidden text-left select-none">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container/5 blur-xl rounded-full pointer-events-none"></div>
                        <div className="flex items-center gap-2.5 mb-5 text-text-secondary font-mono">
                            <span className="material-symbols-outlined text-sm">hub</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Collaboration Features</h3>
                        </div>

                        <ul className="space-y-4 font-sans">
                            <li className="flex gap-3 items-start">
                                <span className="material-symbols-outlined text-primary-container text-base shrink-0 mt-0.5">visibility</span>
                                <div>
                                    <p className="font-bold text-xs text-text-primary uppercase tracking-wide font-mono">Global Visibility</p>
                                    <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                                        Your proposal is indexed across all Kollective nodes for maximized exposure.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="material-symbols-outlined text-primary-container text-base shrink-0 mt-0.5">groups</span>
                                <div>
                                    <p className="font-bold text-xs text-text-primary uppercase tracking-wide font-mono">Syndicate Matching</p>
                                    <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                                        Matches your proposal with active syndicates searching for matching categories.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="material-symbols-outlined text-primary-container text-base shrink-0 mt-0.5">contract</span>
                                <div>
                                    <p className="font-bold text-xs text-text-primary uppercase tracking-wide font-mono">Smart Backing</p>
                                    <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                                        Automated mechanisms secure transparent and verifiable capital backing.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Priority Idea Suggestions Card Module Banner */}
                    <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-primary-container/5 border border-amber-500/20 space-y-4 text-left select-none">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                            <span className="material-symbols-outlined text-base">rocket_launch</span>
                            <span>Priority Anti-Monopoly Ideas</span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Needed Community Proposals</h4>
                            <p className="text-xs text-text-secondary leading-relaxed font-sans">
                                We strongly encourage proposals that establish people-centered alternatives to corporate giants:
                            </p>
                        </div>
                        <ul className="space-y-2 text-xs text-text-secondary font-mono">
                            <li className="flex items-start gap-2.5 bg-[#0d1117] p-3 rounded-xl border border-white/5">
                                <span className="material-symbols-outlined text-primary-container text-sm shrink-0 mt-0.5">local_cafe</span>
                                <div className="font-sans text-left">
                                    <strong className="text-white block font-bold text-xs font-mono uppercase tracking-wide">Coffee Shops & Eateries</strong>
                                    <span className="text-text-secondary text-xs mt-0.5 block leading-relaxed">Displace corporate chains like Starbucks, McDonald's & Wendy's with local co-ops & fair-wage diners.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-2.5 bg-[#0d1117] p-3 rounded-xl border border-white/5">
                                <span className="material-symbols-outlined text-emerald-400 text-sm shrink-0 mt-0.5">medical_services</span>
                                <div className="font-sans text-left">
                                    <strong className="text-white block font-bold text-xs font-mono uppercase tracking-wide">Low-Cost Medical & Clinics</strong>
                                    <span className="text-text-secondary text-xs mt-0.5 block leading-relaxed">Create people-pro, low-margin health centers & pharmacies to beat monopolies like CVS & Walgreens.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Proposal Guidelines Checklist */}
                    <div className="bg-[#141414] rounded-2xl p-6 border border-white/5 space-y-4 text-left select-none font-sans">
                        <div className="flex items-center justify-between font-mono">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Proposal Guidelines</h4>
                            <span className="material-symbols-outlined text-text-secondary text-base">info</span>
                        </div>
                        <div className="space-y-2.5 text-xs text-text-secondary font-medium leading-relaxed">
                            <div className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0 mt-1.5"></span>
                                <span>Define target outcomes and timeline metrics clearly.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0 mt-1.5"></span>
                                <span>Specify transparent, peer-verifiable return mechanics.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0 mt-1.5"></span>
                                <span>Highlight eco-social community value and people-first democratic structure.</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
