// src/components/UserAvatar.jsx
import React from 'react';
import { usePresenceStore } from '../store/usePresenceStore';

export function UserAvatar({ user, className = 'w-10 h-10', showStatus = true, indicatorClassName = '' }) {
    const userId = user?.id || user?.userId;
    // ⚡ ATOMIC SELECTOR: This component ONLY re-renders if THIS specific 
    // user shifts between online and offline statuses.
    const isOnline = usePresenceStore((state) => userId ? !!state.activeList[String(userId)] : false);

    const userName = user?.name || user?.username || '';
    const avatarUrl = user?.avatar;

    return (
        <div className={`relative shrink-0 ${className}`}>
            {avatarUrl ? (
                <img src={avatarUrl} alt={userName || 'User'} className="w-full h-full rounded-full object-cover" />
            ) : (
                <div className="w-full h-full rounded-full bg-primary-container flex items-center justify-center font-bold text-white uppercase text-xs">
                    {userName ? userName[0] : '?'}
                </div>
            )}

            {showStatus && isOnline && (
                <span
                    className={`absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface shadow-sm animate-in fade-in duration-300 z-10 ${indicatorClassName}`}
                    title="Online now"
                />
            )}
        </div>
    );
}
