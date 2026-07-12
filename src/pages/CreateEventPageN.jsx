// src/pages/CreateEventPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../features/events/useCreateEvent';

export function CreateEventPage() {
    const navigate = useNavigate();
    const createEventMutation = useCreateEvent();

    // Local Form Controlled States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !date.trim() || !location.trim()) return;

        // Trigger the mutation pipeline payload
        createEventMutation.mutate(
            { title, description, date, location },
            {
                onSuccess: () => {
                    // Send the user cleanly back to the main updated events grid stream view
                    navigate('/events');
                },
            }
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
            <div>
                <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">Organize Event</h2>
                <p className="text-text-secondary text-body-sm">Schedule a brand new action, assembly, or collective calendar gathering.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface-container-low border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-5">

                {/* Error Boundary Guard */}
                {createEventMutation.isError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl font-medium">
                        Failed to establish event: {createEventMutation.error.message}
                    </div>
                )}

                {/* Title Input */}
                <div className="form-group flex flex-col gap-2">
                    <label htmlFor="title" className="text-label-md font-bold text-text-primary">Event Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="E.g., Community Mutual Aid Drive"
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-3.5 text-body-md focus:outline-none focus:border-primary-container transition-colors placeholder-text-text-secondary/30 text-text-primary"
                        disabled={createEventMutation.isPending}
                        required
                    />
                </div>

                {/* Date Input */}
                <div className="form-group flex flex-col gap-2">
                    <label htmlFor="date" className="text-label-md font-bold text-text-primary">Date & Time</label>
                    <input
                        id="date"
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-3.5 text-body-md focus:outline-none focus:border-primary-container transition-colors text-text-primary uppercase"
                        disabled={createEventMutation.isPending}
                        required
                    />
                </div>

                {/* Location Input */}
                <div className="form-group flex flex-col gap-2">
                    <label htmlFor="location" className="text-label-md font-bold text-text-primary">Venue / Location</label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Physical address or secure access coordinates"
                        className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-3.5 text-body-md focus:outline-none focus:border-primary-container transition-colors placeholder-text-text-secondary/30 text-text-primary"
                        disabled={createEventMutation.isPending}
                        required
                    />
                </div>

                {/* Description Textarea */}
                <div className="form-group flex flex-col gap-2">
                    <label htmlFor="description" className="text-label-md font-bold text-text-primary">Event Objectives</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Outline coordination parameters, requirements, and logistics detail schedules..."
                        className="w-full h-36 bg-surface-container-lowest border border-white/10 rounded-xl p-4 text-body-md focus:outline-none focus:border-primary-container transition-colors resize-none placeholder-text-text-secondary/30 text-text-primary leading-relaxed"
                        disabled={createEventMutation.isPending}
                        maxLength={1000}
                        required
                    />
                </div>

                {/* Interactive Control Panel Footer */}
                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                    <button
                        type="button"
                        onClick={() => navigate('/events')}
                        className="px-6 py-3 font-bold text-label-md text-text-secondary hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                        disabled={createEventMutation.isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createEventMutation.isPending || !title.trim() || !description.trim()}
                        className="bg-primary-container text-white font-bold text-label-md px-8 py-3 rounded-xl crimson-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                        {createEventMutation.isPending ? (
                            <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Scheduling Action...
                            </>
                        ) : (
                            'Schedule Event'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
