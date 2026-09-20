// src/components/UserAvatar.jsx
import React, { useState } from 'react';
import { usePresenceStore } from '../store/usePresenceStore';
import { getAvatarInitials, getTeamsBackgroundColor } from '../utils/avatarUtils';

export function UserAvatar({
    user,
    name,
    avatar,
    className = 'w-10 h-10',
    showStatus = true,
    indicatorClassName = '',
    roundedClassName = 'rounded-full',
    style = {}
}) {
    const [imgFailed, setImgFailed] = useState(false);

    const userId = user?.id || user?.userId;
    const isOnline = usePresenceStore((state) => (userId ? !!state.activeList[String(userId)] : false));

    const userName = name || user?.name || user?.username || user?.handle || '';
    const avatarUrl = (avatar !== undefined && avatar !== '') ? avatar : (user?.avatar || user?.avatar_url);
    const isDefaultAvatarUrl = !avatarUrl || avatarUrl === '/default-avatar.jpg';

    const initials = getAvatarInitials(userName);
    const bgColor = getTeamsBackgroundColor(userName || userId || 'user');

    return (
        <div className={`relative shrink-0 ${className}`} style={style}>
            {!isDefaultAvatarUrl && !imgFailed ? (
                <img
                    src={avatarUrl}
                    alt={userName || 'User'}
                    className={`w-full h-full ${roundedClassName} object-cover`}
                    onError={() => setImgFailed(true)}
                />
            ) : (
                <div
                    style={{ backgroundColor: bgColor }}
                    className={`w-full h-full ${roundedClassName} flex items-center justify-center font-bold text-white uppercase select-none shadow-sm font-sans text-[0.45em] tracking-wider leading-none`}
                >
                    <span className="transform scale-[2.2] font-semibold">{initials}</span>
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

export { getAvatarInitials, getTeamsBackgroundColor };
export default UserAvatar;
