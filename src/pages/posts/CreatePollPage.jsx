// src/pages/CreatePollPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePoll } from '../../features/polls/useCreatePoll';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { useAuthStore } from '../../store/auth/useAuthStore';

export function CreatePollPage() {
    const navigate = useNavigate();
    const createPollMutation = useCreatePoll();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // 🚀 THE TIMELINE FIX: Wrap navigation inside useEffect to prevent render-phase state bugs
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Form State parameters
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']); // Initial 2 required fields
    const [audience, setAudience] = useState('World');
    const [duration, setDuration] = useState('7 Days');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const maxOptions = 4;

    const handleAddOption = () => {
        if (options.length < maxOptions) {
            setOptions((prev) => [...prev, '']);
            setError(null);
        } else {
            setError(`Maximum of ${maxOptions} options reached.`);
        }
    };

    const handleRemoveOption = (indexToRemove) => {
        if (options.length > 2) {
            setOptions((prev) => prev.filter((_, idx) => idx !== indexToRemove));
            setError(null);
        }
    };

    const handleOptionChange = (index, value) => {
        setOptions((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!question.trim()) {
            setError('Please enter a poll question.');
            return;
        }

        // Unpack option parameters and discard blank padding entries safely
        const filteredOptions = options.map((opt) => opt.trim()).filter(Boolean);
        if (filteredOptions.length < 2) {
            setError('Please fill out at least two options.');
            return;
        }

        setIsSubmitting(true);

        const pollData = {
            question: question.trim(),
            options: filteredOptions,
            audience: audience,
            duration: duration,
        };

        // 🚀 EXECUTE COMPREHENSIVE BACKEND DATABASE MUTATION CONTRACT
        createPollMutation.mutate(pollData, {
            onSuccess: () => {
                setIsSubmitting(false);
                navigate('/polls');
            },
            onError: (err) => {
                setIsSubmitting(false);
                console.error('Error creating poll:', err);
                setError(err?.message || 'Failed to create the poll. Please try again.');
            }
        });
    };

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-[800px] pb-20 mx-auto px-4 bg-[#090d12]X">
            {/* Back Link Trigger */}
            <button
                type="button"
                onClick={() => navigate('/polls')}
                className="flex items-center gap-2 text-text-secondary hover:text-primary-container transition-colors mb-8 group w-fit bg-transparent border-none outline-none font-bold text-sm cursor-pointer"
            >
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1 select-none">
                    arrow_back
                </span>
                Back to Polls
            </button>

            {/* Profile/Page Deck Header Container */}
            <header className="glass-panel p-8 rounded-2xl mb-8 relative overflow-hidden border border-black/10 dark:border-white/5 bg-white dark:bg-[#141414]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-container/10 to-transparent blur-3xl -z-10 select-none"></div>
                <div className="flex items-center gap-4 mb-4 select-none">
                    <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center border border-primary-container/30">
                        <span className="material-symbols-outlined text-primary-container text-3xl">poll</span>
                    </div>
                    <h1 className="font-headline-lg text-2xl font-extrabold text-text-primary tracking-tight">Create a New Poll</h1>
                </div>
                <p className="font-body-md text-base text-text-secondary leading-relaxed max-w-2xl">
                    Engage the collective voice to drive democratic decision making within your local community and organizing committees.
                </p>
            </header>

            {/* Validation Overlay Banner */}
            {error && (
                <Alert variant="destructive" className="mb-8" onClose={() => setError(null)}>
                    <span className="material-symbols-outlined select-none">error</span>
                    <AlertTitle>Validation Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section: Question Setup */}
                <section className="glass-panel p-8 rounded-2xl border border-black/10 dark:border-white/5 relative bg-white dark:bg-[#141414]">
                    <div className="flex items-center gap-3 mb-6 select-none">
                        <span className="material-symbols-outlined text-primary-container">quiz</span>
                        <h2 className="font-headline-md text-lg font-bold text-text-primary">Poll Question</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">Question *</label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl p-4 font-body-md text-sm text-text-primary min-h-[100px] h-28 resize-none focus:border-primary-container focus:outline-none transition-all placeholder:text-text-secondary/50"
                            placeholder="What would you like to ask the kollective?"
                            required
                        ></textarea>
                        <p className="text-xs text-text-secondary/70 italic leading-snug font-sans select-none">
                            Be clear and specific to get the most accurate consensus from members.
                        </p>
                    </div>
                </section>

                {/* Section: Dynamic Choice Elements Stack */}
                <section className="glass-panel p-8 rounded-2xl border border-black/10 dark:border-white/5 bg-white dark:bg-[#141414]">
                    <div className="flex items-center gap-3 mb-6 select-none">
                        <span className="material-symbols-outlined text-primary-container">list_alt</span>
                        <h2 className="font-headline-md text-lg font-bold text-text-primary">Poll Options</h2>
                    </div>

                    <div className="space-y-5">
                        {options.map((option, idx) => (
                            <div key={idx} className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                    Option {idx + 1} {idx < 2 ? '*' : ''}
                                </label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        value={option}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        className="flex-1 bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-body-md text-sm text-text-primary focus:border-primary-container focus:outline-none transition-all placeholder:text-text-secondary/50"
                                        placeholder={`Enter choice ${idx + 1}...`}
                                        type="text"
                                        required={idx < 2}
                                    />
                                    {idx >= 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(idx)}
                                            className="p-2 text-text-secondary hover:text-red-400 transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer outline-none active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[20px] select-none">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Add Option Trigger Control Button */}
                    {maxOptions > options.length && (
                        <button
                            onClick={handleAddOption}
                            type="button"
                            className="mt-6 flex items-center gap-2 text-primary-container font-bold text-sm hover:bg-primary-container/10 px-4 py-2 rounded-lg border border-primary-container/20 transition-all active:scale-95 bg-transparent cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[16px] select-none">add_circle</span>
                            Add Option
                        </button>
                    )}
                    <div className="mt-6 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4 font-mono text-xs select-none">
                        <p className="text-text-secondary/60">Minimum 2 options, maximum 4 options</p>
                        <span className="font-bold text-primary-container">
                            {options.length}/{maxOptions} options
                        </span>
                    </div>
                </section>

                {/* Section: Poll Specific Scope Configurations */}
                <section className="glass-panel p-8 rounded-2xl border border-black/10 dark:border-white/5 bg-white dark:bg-[#141414]">
                    <div className="flex items-center gap-3 mb-6 select-none">
                        <span className="material-symbols-outlined text-primary-container">settings_applications</span>
                        <h2 className="font-headline-md text-lg font-bold text-text-primary">Poll Settings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Lifespan Configuration Dropdown Selector */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                Poll Duration *
                            </label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-body-md text-sm text-text-primary focus:border-primary-container transition-all cursor-pointer outline-none font-medium appearance-none"
                            >
                                <option value="24 Hours" className="bg-white dark:bg-[#0d1117] text-text-primary">24 Hours</option>
                                <option value="3 Days" className="bg-white dark:bg-[#0d1117] text-text-primary">3 Days</option>
                                <option value="7 Days" className="bg-white dark:bg-[#0d1117] text-text-primary">7 Days</option>
                                <option value="2 Weeks" className="bg-white dark:bg-[#0d1117] text-text-primary">2 Weeks</option>
                            </select>
                            <p className="text-xs text-text-secondary/60 leading-relaxed font-sans select-none">How long should the collection of votes remain active?</p>
                        </div>

                        {/* Target Scope Audience Configuration Dropdown Selector */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-text-secondary uppercase tracking-wider block font-mono select-none">
                                <span className="material-symbols-outlined text-[16px]">track_changes</span>
                                Target Audience *
                            </label>
                            <select
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                className="w-full bg-white dark:bg-[#0d1117] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-body-md text-sm text-text-primary focus:border-primary-container transition-all cursor-pointer outline-none font-medium appearance-none"
                            >
                                <option value="World" className="bg-white dark:bg-[#0d1117] text-text-primary">World (Global Network)</option>
                                <option value="Local" className="bg-white dark:bg-[#0d1117] text-text-primary">Local (Neighborhood-level)</option>
                                <option value="State" className="bg-white dark:bg-[#0d1117] text-text-primary">State-level Circle</option>
                                <option value="Country" className="bg-white dark:bg-[#0d1117] text-text-primary">Countrywide Stream</option>
                                <option value="Followers Only" className="bg-white dark:bg-[#0d1117] text-text-primary">Followers Only</option>
                            </select>
                            <p className="text-xs text-text-secondary/60 font-medium leading-relaxed font-sans select-none">Target audience visibility constraint tier for this poll.</p>
                        </div>
                    </div>
                </section>

                {/* Action Form Confirmation Submission Footer */}
                <footer className="flex flex-col sm:flex-row items-center gap-4 pt-4 select-none">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-12 py-4 bg-primary-container text-white rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl crimson-glow flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed border-none"
                    >
                        <span className="material-symbols-outlined text-[18px]">how_to_vote</span>
                        {isSubmitting ? 'Broadcasting...' : 'Create Poll'}
                    </button>

                    <button
                        onClick={() => navigate('/polls')}
                        type="button"
                        className="w-full sm:w-auto px-12 py-4 bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-[#1a1a1c] hover:text-text-primary dark:hover:text-white rounded-xl font-bold text-sm transition-all active:scale-95 text-text-secondary cursor-pointer"
                    >
                        Cancel
                    </button>
                </footer>
            </form>
        </div>
    );
}

