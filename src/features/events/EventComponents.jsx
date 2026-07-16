// src/features/events/EventComponents.jsx
import React from 'react';

// 📅 Component A: Clean Dual-Layer Calendar Badge Overlay
export function EventDateBadge({ dateString }) {
    // Gracefully parse basic date text parameters ("2026-07-15" or similar) safely
    const dateObj = new Date(dateString || Date.now());
    const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = dateObj.getDate();

    return (
        <div className="flex flex-col items-center justify-center w-14 h-14 bg-surface-container-high border border-white/10 rounded-xl overflow-hidden shadow-inner shrink-0 select-none">
            <div className="w-full bg-primary-container text-white text-[10px] font-mono font-black py-0.5 text-center tracking-wider">
                {month || 'JUL'}
            </div>
            <div className="flex-1 flex items-center justify-center font-mono font-black text-xl text-text-primary bg-surface-container-lowest w-full">
                {day || '15'}
            </div>
        </div>
    );
}

// 👥 Component B: Overlapping Attendee Face-Pile Stack
export function AttendeeStack({ attendees = [], totalCount = 0 }) {
    const displayLimit = 4;
    const standardAttendees = attendees.slice(0, displayLimit);
    const remainingCount = totalCount - displayLimit;

    return (
        <div className="flex items-center gap-2 select-none">
            {/* Overlapping Absolute Matrix Grid Loops */}
            <div className="flex -space-x-2.5 overflow-hidden">
                {standardAttendees.map((user, idx) => (
                    <div
                        key={user.id || idx}
                        className="w-7 h-7 rounded-full border-2 border-[#141414] overflow-hidden bg-[#1A1616] shrink-0 shadow-sm"
                        title={user.name}
                    >
                        {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary-container/20 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                {user.name?.[0]}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Numerical Counter Remaining Trackers Flag Indicator */}
            {totalCount > 0 && (
                <span className="text-xs font-semibold text-text-secondary">
                    {totalCount.toLocaleString()} {totalCount === 1 ? 'organizer' : 'organizers'} joining
                </span>
            )}
        </div>
    );
}
