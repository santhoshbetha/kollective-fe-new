// src/features/events/EventDetailsView.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';
import { EventCommentBox } from './EventCommentBox';
import { useEventChannel } from './hooks/useEventChannel';
import { CalendarDays, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

export function EventDetailsView() {
    const { id: eventId } = useParams();
    const [liveComments, setLiveComments] = useState([]);

    // 1️⃣ Fetch the detailed static parameters for this unique event entity
    const { data: event, status: queryStatus } = useQuery({
        queryKey: ['event', eventId, 'details'],
        queryFn: () => apiFetch(`/api/v1/events/${eventId}`),
        staleTime: 30000
    });

    // 2️⃣ 📡 WIRE REAL-TIME WEBSOCKET PIPELINE: Connects directly to the Phoenix feed channel room
    const { comments: socketComments, joinError, isJoining } = useEventChannel(eventId);

    // 3️⃣ STATE BRIDGE RECONCILIATION:
    // Merges static server database fallback comments with incoming live socket messages
    useEffect(() => {
        const initialRestComments = event?.comments || [];

        setLiveComments(() => {
            // Use a Map Set to prevent row items from compounding or duplicating key references
            const seenIds = new Set();
            const unifiedList = [];

            // Prioritize live socket comments if they have already accumulated in memory
            const primarySource = socketComments.length > 0 ? socketComments : initialRestComments;

            primarySource.forEach(comment => {
                if (comment && comment.id && !seenIds.has(comment.id)) {
                    seenIds.add(comment.id);
                    unifiedList.push(comment);
                }
            });

            return unifiedList;
        });
    }, [event?.comments, socketComments]);

    // Handle initial asynchronous query hydration states
    if (queryStatus === 'pending') {
        return (
            <div className="py-24 text-center text-neutral-400 font-mono text-xs select-none flex flex-col items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                <span>LOADING CALENDAR COORDINATES...</span>
            </div>
        );
    }

    if (queryStatus === 'error' || joinError) {
        return (
            <div className="max-w-md mx-auto my-16 p-6 border border-rose-200 bg-rose-50/50 rounded-2xl text-center select-none animate-in zoom-in-95">
                <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2 stroke-[2px]" />
                <h4 className="text-xs font-black font-mono text-rose-800 uppercase tracking-wider mb-1">Matrix Error</h4>
                <p className="text-xs text-rose-600 font-medium leading-relaxed">
                    {joinError || "Failed to pull calendar coordinates. Access parameters expired."}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 text-left font-sans bg-transparent transition-colors">

            {/* 🏙️ Master Header Card Block Component */}
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-widest text-primary-container select-none">
                    <CalendarDays className="w-4 h-4 stroke-[2.5px]" />
                    <span>Active Coordination Matrix</span>
                </div>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">
                    {event?.title}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium leading-relaxed mt-1">
                    {event?.description}
                </p>
            </div>

            {/* 💬 Live WebSocket Conversation Section */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-2 select-none">
                    <h3 className="text-sm font-black font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary-container" />
                        <span>Coordination Thread</span>
                    </h3>
                    {isJoining && (
                        <span className="text-[9px] font-mono font-bold text-primary-container bg-primary-container/5 px-2 py-0.5 border border-primary-container/10 rounded animate-pulse">
                            STREAM_SYNC_ACTIVE
                        </span>
                    )}
                </div>

                {/* Local isolated context response controller block */}
                <EventCommentBox eventId={eventId} />

                {/* Dynamic Comment Log Feed list wrapper stack */}
                <div className="comments-stack flex flex-col gap-3 mt-1">
                    {liveComments.length === 0 ? (
                        <div className="py-12 border border-dashed border-neutral-200 dark:border-zinc-800 rounded-2xl text-center select-none font-mono text-xs text-neutral-400 opacity-60 bg-neutral-50/20 dark:bg-transparent">
                            // NO_COORDINATION_UPDATES_POSTED_YET
                        </div>
                    ) : (
                        liveComments.map((comment, index) => {
                            // Support diverse BE field naming keys variations cleanly
                            const authorName = comment?.userName || comment?.userName || comment?.author?.username || "user";
                            const timestampStr = comment?.timeAgo || comment?.time_ago || (comment?.inserted_at ? new Date(comment.inserted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "just now");
                            const bodyContent = comment?.content || comment?.text || comment?.preview_text || "";

                            return (
                                <div
                                    key={comment.id || `live-cmt-${index}`}
                                    className="bg-white dark:bg-zinc-900/60 border border-neutral-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm hover:border-neutral-300 dark:hover:border-zinc-700 transition-all animate-in slide-in-from-bottom-2 duration-200"
                                >
                                    <div className="flex justify-between items-center font-mono text-xs text-neutral-400 select-none font-bold">
                                        <span className="text-neutral-800 dark:text-neutral-200 font-black">
                                            @{authorName}
                                        </span>
                                        <span className="text-[11px] opacity-70">
                                            {timestampStr}
                                        </span>
                                    </div>
                                    <p className="text-neutral-600 dark:text-neutral-300 text-sm font-medium leading-relaxed">
                                        {bodyContent}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
