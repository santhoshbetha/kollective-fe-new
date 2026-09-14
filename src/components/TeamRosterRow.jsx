// components/TeamRosterRow.jsx
import React, { useState } from 'react';
import api from '../services/api';

export default function TeamRosterRow({ member, onRemoved }) {
    const [loading, setLoading] = useState(false);

    const handleKick = async () => {
        const userName = member.user?.name || member.user?.username || 'this user';
        if (!window.confirm(`Are you sure you want to revoke organizational access for ${userName}?`)) return;

        setLoading(true);
        try {
            await api.delete(`/org-settings/members/${member.user.id}`);
            onRemoved(member.user.id);
        } catch (err) {
            alert(err.response?.data?.error || err.message || "Error processing removal.");
        } finally {
            setLoading(false);
        }
    };

    const roleBadgeStyles = {
        owner: 'bg-crimson-500/20 text-crimson-400 border-crimson-500/30',
        admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        editor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        contributor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };

    const roleStyle = roleBadgeStyles[member.role] || 'bg-white/10 text-gray-300 border-white/10';

    return (
        <div className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-surface-lighter border border-white/10 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                    {member.user?.avatar ? (
                        <img src={member.user.avatar} alt={member.user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{(member.user?.name || member.user?.username || 'U')[0].toUpperCase()}</span>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">
                            {member.user?.name || member.user?.username || 'Team Member'}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider text-[10px] ${roleStyle}`}>
                            {member.role}
                        </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                        {member.user?.email || member.user?.username ? `@${member.user.username || member.user.email}` : `ID: ${member.user?.id || member.id}`}
                    </p>
                </div>
            </div>

            {member.role !== 'owner' ? (
                <button
                    onClick={handleKick}
                    disabled={loading}
                    className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all rounded-lg px-3 py-1.5 font-medium disabled:opacity-50"
                >
                    {loading ? 'Revoking...' : 'Revoke Access'}
                </button>
            ) : (
                <span className="text-xs text-text-muted px-2 py-1 font-medium">
                    Owner
                </span>
            )}
        </div>
    );
}

