// src/features/settings/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AuditLogs({ activeOrgId }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/org-settings/audit-logs');
            setLogs(response.data?.data || response.data || []);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to load audit logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeOrgId) fetchLogs();
    }, [activeOrgId]);

    // Helper to safely format action strings into readable text
    const formatAction = (action) => {
        return (action || '').replace(/_/g, ' ').toUpperCase();
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-text-secondary">
                <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold">Loading audit trails...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-text-primary tracking-tight">Organization Audit Trail</h2>
                <p className="text-xs text-text-secondary mt-0.5">Review security, moderation, and team adjustments across your community node.</p>
            </div>

            <div className="bg-surface-container-low border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <ul className="divide-y divide-white/5">
                    {logs.length === 0 ? (
                        <li className="p-8 text-center text-xs text-text-secondary/60 italic">No actions recorded in the active audit window.</li>
                    ) : (
                        logs.map((log) => {
                            const isOverride = log.metadata?.is_admin_override;

                            return (
                                <li key={log.id} className={`p-4 hover:bg-surface-container-high/30 transition ${isOverride ? 'bg-amber-500/5' : ''}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-text-primary">
                                                    {log.actor?.name || (log.actor?.username ? `@${log.actor.username}` : (log.performed_by || '@system'))}
                                                </span>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                                                    String(log.action).toLowerCase().includes('delete')
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : String(log.action).toLowerCase().includes('invite')
                                                        ? 'bg-primary-container/20 text-primary-container'
                                                        : 'bg-surface-container-highest text-text-secondary'
                                                }`}>
                                                    {formatAction(log.action)}
                                                </span>

                                                {isOverride && (
                                                    <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold rounded uppercase">
                                                        Admin Moderation
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-text-secondary mt-1">
                                                {log.details ? (
                                                    <span>{log.details}</span>
                                                ) : (
                                                    <span>
                                                        Targeted {log.target_user || log.target_type || 'entity'} {log.target_id ? `(ID: ${log.target_id})` : ''}
                                                    </span>
                                                )}
                                                {log.metadata?.deleted_post_body_preview && (
                                                    <span className="italic text-text-secondary/70 block mt-1 bg-surface-container-lowest/60 p-2 rounded-lg border border-white/5 text-[11px]">
                                                        "{log.metadata.deleted_post_body_preview}..."
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                                            <span className="text-[11px] text-text-secondary/60">
                                                {new Date(log.inserted_at).toLocaleString()}
                                            </span>
                                            {(log.action === 'post_deleted' || log.metadata?.can_restore) && (
                                                <RestoreButton postId={log.target_id || log.metadata?.post_id} onRestoreSuccess={fetchLogs} />
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
        </div>
    );
}

// Inline Sub-component for triggering Restoration
function RestoreButton({ postId, onRestoreSuccess }) {
    const [restoring, setRestoring] = useState(false);

    const handleRestore = async () => {
        if (!window.confirm("Are you sure you want to restore this post to the public feed?")) return;
        try {
            setRestoring(true);
            await api.post(`/posts/${postId}/restore`);
            alert("Post restored successfully!");
            if (onRestoreSuccess) onRestoreSuccess();
        } catch (err) {
            alert(err.response?.data?.error || err.message || "Error restoring item.");
        } finally {
            setRestoring(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleRestore}
            disabled={restoring}
            className="text-xs bg-surface-container-high hover:bg-surface-container-highest text-text-primary font-bold py-1 px-2.5 border border-white/10 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1"
        >
            <span className="material-symbols-outlined text-[14px]">restore</span>
            {restoring ? 'Restoring...' : 'Undelete'}
        </button>
    );
}

