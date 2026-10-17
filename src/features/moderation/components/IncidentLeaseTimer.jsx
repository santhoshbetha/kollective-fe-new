import React, { useState, useEffect } from 'react';

export const IncidentLeaseTimer = ({ expiresAtUnix, onTimeout }) => {
    const calculateTimeRemaining = () => {
        const nowUnix = Math.floor(Date.now() / 1000);
        const totalDifferenceSeconds = expiresAtUnix - nowUnix;
        return Math.max(0, totalDifferenceSeconds);
    };

    const [secondsLeft, setSecondsLeft] = useState(calculateTimeRemaining());

    useEffect(() => {
        // Recalculate immediately whenever the backend lease stamp changes
        setSecondsLeft(calculateTimeRemaining());

        const timerInterval = setInterval(() => {
            const remaining = calculateTimeRemaining();
            setSecondsLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerInterval);
                if (onTimeout) onTimeout();
            }
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [expiresAtUnix]);

    // Format integer seconds cleanly to mm:ss notation templates
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (secondsLeft <= 0) {
        return <span className="text-red-600 font-bold uppercase animate-pulse text-xs">Lease Expired / Reaped</span>;
    }

    // Calculate danger boundary coloring states (Warn operator if under 2 minutes left)
    const isDangerZone = secondsLeft < 120;

    return (
        <div className={`flex items-center gap-1.5 p-1 rounded font-mono text-xs border ${isDangerZone
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
                Time Remaining: <strong>{formatTime(secondsLeft)}</strong>
            </span>
        </div>
    );
};
