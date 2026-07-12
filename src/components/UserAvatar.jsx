// src/components/UserAvatar.jsx
import React from 'react';
import { usePresenceStore } from '../store/usePresenceStore';

export function UserAvatar({ user }) {
    // ⚡ ATOMIC SELECTOR: This component ONLY re-renders if THIS specific 
    // user shifts between online and offline statuses.
    const isOnline = usePresenceStore((state) => state.activeList[String(user.id)]);

    return (
        <div className="relative w-10 h-10">
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />

            {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface shadow-sm animate-in fade-in duration-300" />
            )}
        </div>
    );
}
