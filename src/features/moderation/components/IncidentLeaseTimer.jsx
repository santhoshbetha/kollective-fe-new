import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const getTimeRemaining = (expiresAtUnix) => {
    if (!expiresAtUnix) return 0;
    let expUnix = expiresAtUnix;
    if (typeof expiresAtUnix === 'string') {
        const parsed = Date.parse(expiresAtUnix);
        if (!isNaN(parsed)) {
            expUnix = Math.floor(parsed / 1000);
        } else {
            expUnix = Number(expiresAtUnix);
        }
    } else if (typeof expiresAtUnix === 'number' && expiresAtUnix > 10000000000) {
        expUnix = Math.floor(expiresAtUnix / 1000);
    }
    const nowUnix = Math.floor(Date.now() / 1000);
    return Math.max(0, expUnix - nowUnix);
};

export const IncidentLeaseTimer = ({ expiresAtUnix, onTimeout, className }) => {
    const [secondsLeft, setSecondsLeft] = useState(() => getTimeRemaining(expiresAtUnix));

    useEffect(() => {
        const timerInterval = setInterval(() => {
            const remaining = getTimeRemaining(expiresAtUnix);
            setSecondsLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerInterval);
                if (onTimeout) onTimeout();
            }
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [expiresAtUnix, onTimeout]);

    // Format integer seconds cleanly to mm:ss notation templates
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (secondsLeft <= 0) {
        return (
            <span className={cn(
                "inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border select-none",
                "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 animate-pulse",
                className
            )}>
                Lease Expired / Reaped
            </span>
        );
    }

    // Calculate danger boundary coloring states (Warn operator if under 2 minutes left)
    const isDangerZone = secondsLeft < 120;

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-xs font-bold border transition-colors select-none",
            isDangerZone
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
            className
        )}>
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
                Time Remaining: <strong>{formatTime(secondsLeft)}</strong>
            </span>
        </div>
    );
};

export default IncidentLeaseTimer;


