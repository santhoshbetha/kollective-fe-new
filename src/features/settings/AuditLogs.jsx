// src/features/settings/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, RefreshCw, CheckCircle2, Trash2, UserPlus, History } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to your layout utility helper directory path

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

    const formatAction = (action) => {
        return (action || '').replace(/_/g, ' ').toUpperCase();
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-text-secondary max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 font-sans">
                <RefreshCw className="w-7 h-7 text-primary-container animate-spin" />
                <p className="text-sm font-bold uppercase tracking-wider animate-pulse">Syncing organizational records...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl flex items-center gap-2.5 max-w-4xl mx-auto animate-in slide-in-from-top-2 duration-150 font-sans">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Error: {error}</span>
            </div>
        );
    }
    return (
        <div className="space-y-6 text-left font-sans animate-in fade-in duration-200 w-full">
            {/* Expanded Content Headers */}
            <div className="border-b dark:border-white/5 border-black/5 pb-4 select-none">
                <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    Organization Audit Trail
                </h2>
                <p className="text-lg text-text-secondary mt-0.5 font-medium">
                    Review security, moderation, and team adjustments across your community node.
                </p>
            </div>

            <div className="bg-surface-container-low border dark:border-white/10 border-black/5 rounded-2xl overflow-hidden shadow-xl">
                <ul className="divide-y dark:divide-white/5 divide-black/5">
                    {logs.length === 0 ? (
                        <li className="p-12 text-center text-sm font-medium text-text-secondary/50 italic flex flex-col items-center justify-center gap-2 select-none">
                            <History className="w-8 h-8 opacity-40 mb-1" />
                            <span>No actions recorded in the active audit window bounds.</span>
                        </li>
                    ) : (
                        logs.map((log) => {
                            const isOverride = log.metadata?.is_admin_override;
                            const isDelete = String(log.action).toLowerCase().includes('delete');
                            const isInvite = String(log.action).toLowerCase().includes('invite');

                            return (
                                <li key={log.id} className={cn(
                                    "p-5 hover:bg-white/[0.005] transition-all duration-150",
                                    isOverride ? 'bg-amber-500/[0.02] border-l-2 border-l-amber-500/40' : ''
                                )}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-extrabold text-base text-text-primary tracking-tight">
                                                    {log.actor?.name || (log.actor?.username ? `@${log.actor.username}` : (log.performed_by || '@system'))}
                                                </span>

                                                <span className={cn(
                                                    "px-2.5 py-0.5 text-[14px] font-bold rounded-md uppercase tracking-wider font-mono border flex items-center gap-1 select-none",
                                                    isDelete
                                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                        : isInvite
                                                            ? 'bg-primary-container/10 border-primary-container/20 text-primary-container'
                                                            : 'bg-surface-container border-white/5 text-text-secondary'
                                                )}>
                                                    {isDelete && <Trash2 className="w-3 h-3" />}
                                                    {isInvite && <UserPlus className="w-3 h-3" />}
                                                    <span>{formatAction(log.action)}</span>
                                                </span>

                                                {isOverride && (
                                                    <span className="bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider font-mono select-none">
                                                        Admin Moderation
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-lg text-text-secondary font-medium leading-relaxed mt-2">
                                                {log.details ? (
                                                    <span>{log.details}</span>
                                                ) : (
                                                    <span>
                                                        Targeted {log.target_user || log.target_type || 'entity'} {log.target_id ? `(ID: ${log.target_id})` : ''}
                                                    </span>
                                                )}
                                                {log.metadata?.deleted_post_body_preview && (
                                                    <blockquote className="italic text-text-secondary/70 block mt-2 bg-[#1b1b1b] p-3 rounded-xl border dark:border-white/5 border-black/5 text-sm font-serif">
                                                        "{log.metadata.deleted_post_body_preview}..."
                                                    </blockquote>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0">
                                            <span className="text-md font-mono font-medium text-text-secondary/50 select-none">
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

/**
 * 🔄 UPGRADED RECOVERY ELEMENT MODULE: Handles non-blocking execution inline safely
 */
function RestoreButton({ postId, onRestoreSuccess }) {
    const [restoring, setRestoring] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleRestore = async () => {
        try {
            setRestoring(true);
            setFeedback(null);
            await api.post(`/posts/${postId}/restore`);
            setFeedback({ type: 'success', text: 'Post recovered.' });
            setTimeout(() => {
                if (onRestoreSuccess) onRestoreSuccess();
            }, 1500);
        } catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.error || 'Recovery dropped.' });
            setTimeout(() => setFeedback(null), 3000);
        } finally {
            setRestoring(false);
            setShowConfirm(false);
        }
    };

    if (feedback) {
        return (
            <span className={cn(
                "text-xs font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-lg animate-in fade-in duration-100",
                feedback.type === 'success' ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
            )}>
                {feedback.text}
            </span>
        );
    }

    if (showConfirm) {
        return (
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider select-none animate-in slide-in-from-right-2 duration-150">
                <button
                    type="button"
                    onClick={handleRestore}
                    disabled={restoring}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border-none cursor-pointer"
                >
                    Confirm
                </button>
                <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={restoring}
                    className="px-2.5 py-1.5 bg-[#222] border border-white/5 text-text-secondary hover:text-white rounded-lg cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={restoring}
            className="text-xs bg-surface-container-high hover:bg-surface-container-highest text-text-primary font-bold py-1.5 px-3 border dark:border-white/10 border-black/5 rounded-xl shadow-md disabled:opacity-40 cursor-pointer flex items-center gap-1.5 transition-all select-none outline-none font-sans font-extrabold uppercase tracking-wide text-[10px]"
        >
            <RefreshCw className="w-3.5 h-3.5 text-primary-container" />
            <span>Undelete</span>
        </button>
    );
}

