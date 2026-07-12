// src/features/events/EventDetailsView.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { EventCommentBox } from './EventCommentBox';

export function EventDetailsView() {
    const { id: eventId } = useParams();

    // Fetch the detailed parameters and message logs for this unique entity
    const { data: event, status } = useQuery({
        queryKey: ['event', eventId, 'details'],
        queryFn: () => apiFetch(`/events/${eventId}`),
    });

    if (status === 'pending') return <div className="py-12 text-center text-text-secondary">Loading details...</div>;
    if (status === 'error') return <div className="py-12 text-center text-rose-500">Failed to pull calendar coordinates.</div>;

    const comments = event?.comments || [];

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
            {/* 🏙️ Header Card Block */}
            <div className="bg-surface-container-low border border-white/5 p-6 rounded-2xl flex flex-col gap-3">
                <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">{event.title}</h2>
                <p className="text-text-secondary text-body-md leading-relaxed">{event.description}</p>
            </div>

            {/* 💬 Conversation Section Header */}
            <div className="flex flex-col gap-4 mt-4">
                <h3 className="text-xl font-extrabold text-text-primary tracking-tight">Coordination Thread</h3>

                {/* Render the local isolated context input container directly block */}
                <EventCommentBox eventId={eventId} />

                {/* Dynamic Comment Log Feed list */}
                <div className="comments-stack flex flex-col gap-3 mt-2">
                    {comments.length === 0 ? (
                        <p className="text-sm text-text-secondary/50 italic py-4 text-center">No coordination updates posted yet.</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-surface-container-lowest border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                                <div className="flex justify-between items-center text-xs text-text-secondary/70">
                                    <span className="font-bold text-text-primary">{comment.userName}</span>
                                    <span>{comment.timeAgo}</span>
                                </div>
                                <p className="text-text-secondary text-body-md leading-relaxed">{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
