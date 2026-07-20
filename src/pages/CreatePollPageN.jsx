// src/pages/CreatePollPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePoll } from '../features/polls/useCreatePoll';

export function CreatePollPage() {
    const navigate = useNavigate();
    const createPollMutation = useCreatePoll();

    // Controlled states for the core question and variable option fields
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']); // Initializes with 2 blank fields

    // Handle updates to individual option inputs by index (Immer-free shallow update)
    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
    };

    // Dynamic Array Modifier: Add an additional blank input choice field
    const addOptionField = () => {
        if (options.length >= 4) return; // Defensive constraint: Maximum 6 options per poll
        setOptions([...options, '']);
    };

    // Dynamic Array Modifier: Remove a field slice safely by index
    const removeOptionField = (index) => {
        if (options.length <= 2) return; // Defensive constraint: Minimum 2 options required
        setOptions(options.filter((_, idx) => idx !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clean and filter out blank whitespace choices
        const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);

        if (!question.trim() || cleanOptions.length < 2) return;

        // Dispatch payload directly to the network pipeline
        createPollMutation.mutate(
            { question: question.trim(), options: cleanOptions },
            {
                onSuccess: () => {
                    // Send the user cleanly back to the main updated consensus polls view stream
                    navigate('/polls');
                },
            }
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
            <div>
                <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">Create Consensus Poll</h2>
                <p className="text-text-secondary text-body-sm">Initiate a collective ballot box to measure alignment, gather metrics, and coordinate proposals.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface-container-low border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-5">

                {/* API Error Boundary Guard Banner */}
                {createPollMutation.isError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl font-medium">
                        Failed to deploy consensus ballot: {createPollMutation.error.message}
                    </div>
                )}

                {/* Question Text Input */}
                <div className="form-group flex flex-col gap-2">
                    <label htmlFor="question" className="text-label-md font-bold text-text-primary">Core Question / Proposal</label>
                    <input
                        id="question"
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What should the collective measure consensus on?"
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-3.5 text-body-md focus:outline-none focus:border-primary-container transition-colors placeholder-text-text-secondary/30 text-text-primary"
                        disabled={createPollMutation.isPending}
                        required
                    />
                </div>

                {/* Dynamic Options Stack */}
                <div className="form-group flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <label className="text-label-md font-bold text-text-primary">Ballot Choices</label>
                        <span className="text-xs text-text-secondary/60">Min 2, Max 6</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 w-full">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Choice #${index + 1}`}
                                    className="flex-1 bg-surface-container-lowest border border-white/10 rounded-xl p-3.5 text-body-md focus:outline-none focus:border-primary-container transition-colors placeholder-text-text-secondary/30 text-text-primary"
                                    disabled={createPollMutation.isPending}
                                    required
                                />

                                {/* Remove Field Button Option (Visible only if structural length constraints are satisfied) */}
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOptionField(index)}
                                        className="p-3 text-text-secondary hover:text-rose-500 transition-colors cursor-pointer"
                                        disabled={createPollMutation.isPending}
                                        title="Remove choice"
                                    >
                                        <span className="material-symbols-outlined text-[22px]">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Option Button Control Trigger */}
                    {options.length < 6 && (
                        <button
                            type="button"
                            onClick={addOptionField}
                            className="mt-1 w-fit flex items-center gap-1.5 text-label-md font-bold text-primary-container hover:underline cursor-pointer bg-transparent border-none"
                            disabled={createPollMutation.isPending}
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Add choices
                        </button>
                    )}
                </div>

                {/* Form Interactive Footer Control Panel */}
                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                    <button
                        type="button"
                        onClick={() => navigate('/polls')}
                        className="px-6 py-3 font-bold text-label-md text-text-secondary hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                        disabled={createPollMutation.isPending}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={createPollMutation.isPending || !question.trim() || options.filter(o => o.trim()).length < 2}
                        className="bg-primary-container text-white font-bold text-label-md px-8 py-3 rounded-xl crimson-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                        {createPollMutation.isPending ? (
                            <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Deploying Ballot...
                            </>
                        ) : (
                            'Deploy Poll'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
