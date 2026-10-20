import { useState } from 'react';
import { apiFetch } from '../../../api/apiClient';
import { useAuthStore } from '../../../store/auth/useAuthStore';
import { useIncidentCluster } from '../../../context/IncidentClusterContext';
import { IncidentLeaseTimer } from './IncidentLeaseTimer';
import {
    Shield,
    ShieldAlert,
    Lock,
    Unlock,
    Globe,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    RotateCcw,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 🛡️ IncidentRowItem
 * Adaptive, high-performance incident card and row component for moderation queues.
 * Supports Mnesia work-stealing locks, real-time lease countdown clocks, and instant adjudication dispatch.
 */
export const IncidentRowItem = ({
    incident,
    isSelected = false,
    onSelect,
    currentUserId,
    onClaim,
    onRelease,
    onResolve,
    variant = 'default', // 'default' | 'compact'
    className
}) => {
    const authUser = useAuthStore((state) => state.user);
    const clusterContext = useIncidentCluster?.() || {};
    const clusterIncidents = clusterContext?.incidents || [];

    const [isClaiming, setIsClaiming] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);
    const [localLeaseState, setLocalLeaseState] = useState({
        leased_by_id: undefined,
        leased_until: undefined
    });

    if (!incident) return null;

    // 1️⃣ Normalize entity attributes across report tickets, scholar audits, and cluster mesh items
    const id = String(incident.id || incident.incident_id || '0');
    const category = incident.category || incident.security_flag?.type || incident.type || 'REPORT';
    const previewText =
        incident.preview_text ||
        incident.description ||
        incident.security_flag?.description ||
        incident.detail ||
        'Flagged moderation incident narrative.';
    const reporter = incident.reporter || incident.reported_by || null;
    const targetAccount =
        incident.target_account ||
        incident.target_user?.username ||
        incident.target_username ||
        incident.target ||
        null;
    const countryCode = incident.country_code || null;
    const orcidId = incident.audit_payload?.orcid_id || null;

    // 2️⃣ Cluster and real-time lease synchronization
    const clusterItem = clusterIncidents.find((ci) => String(ci.id || ci.incident_id) === id);
    const effectiveUserId = String(currentUserId || authUser?.id || '');

    const leasedById =
        localLeaseState.leased_by_id !== undefined
            ? localLeaseState.leased_by_id
            : clusterItem?.leased_by_id !== undefined
                ? clusterItem.leased_by_id
                : incident.leased_by_id;

    const leasedUntil =
        localLeaseState.leased_until !== undefined
            ? localLeaseState.leased_until
            : clusterItem?.leased_until !== undefined
                ? clusterItem.leased_until
                : incident.leased_until;

    const isLockedByMe = Boolean(
        leasedById && effectiveUserId && String(leasedById) === String(effectiveUserId)
    );
    const isLockedBySomeoneElse = Boolean(
        leasedById && (!effectiveUserId || String(leasedById) !== String(effectiveUserId))
    );

    // 3️⃣ Work-stealing lock claim handler
    const handleClaim = async (e) => {
        e?.stopPropagation?.();
        if (isClaiming || isLockedBySomeoneElse) return;
        setIsClaiming(true);

        try {
            await apiFetch(`/api/v1/admin/incidents/${id}/claim`, { method: 'POST' });

            const nowUnix = Math.floor(Date.now() / 1000);
            setLocalLeaseState({
                leased_by_id: effectiveUserId,
                leased_until: nowUnix + 900 // Default 15 minute lease window
            });

            if (onClaim) onClaim(id, incident);
        } catch (err) {
            console.error('Failed to claim incident lease:', err);
            alert(err.message || 'Failed to claim ticket lease.');
        } finally {
            setIsClaiming(false);
        }
    };

    // 4️⃣ Voluntary lease release handler
    const handleRelease = async (e) => {
        e?.stopPropagation?.();
        if (isReleasing) return;
        setIsReleasing(true);

        try {
            await apiFetch(`/api/v1/admin/incidents/${id}/release`, { method: 'POST' });

            setLocalLeaseState({
                leased_by_id: null,
                leased_until: null
            });

            if (onRelease) onRelease(id, incident);
        } catch (err) {
            console.error('Failed to drop ticket lease:', err);
            alert(err.message || 'Failed to drop ticket lease.');
        } finally {
            setIsReleasing(false);
        }
    };

    // 5️⃣ Quick adjudication trigger handler
    const handleResolve = (e) => {
        e?.stopPropagation?.();
        if (onResolve) onResolve(id, incident);
    };

    // 6️⃣ Click on row surface to select for side-panel inspection
    const handleRowClick = () => {
        if (onSelect) onSelect(incident);
    };

    // ==========================================
    // 🅰️ COMPACT VARIANT (FOR SIDEBAR QUEUES)
    // ==========================================
    if (variant === 'compact') {
        return (
            <div
                onClick={handleRowClick}
                className={cn(
                    "p-4 sm:p-5 rounded-2xl cursor-pointer transition-all border text-left flex flex-col gap-2.5 select-none group",
                    isSelected
                        ? "bg-primary-container/10 border-primary-container/60 shadow-md ring-1 ring-primary-container/20"
                        : "bg-white/5 border-transparent hover:bg-white/[0.08] hover:border-white/10",
                    isLockedBySomeoneElse && "opacity-60 grayscale-[30%]",
                    className
                )}
            >
                <div className="flex justify-between items-baseline font-mono text-xs sm:text-sm text-neutral-400 font-bold">
                    <span className="text-white font-sans font-black flex items-center gap-2 truncate text-sm sm:text-base">
                        {category === 'AUDIT' || category.includes('ORCID') ? (
                            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                            <Shield className="w-4 h-4 text-primary-container shrink-0" />
                        )}
                        <span>{targetAccount ? `@${targetAccount}` : `Incident #${id}`}</span>
                    </span>
                    <span className="shrink-0 font-bold">#{id}</span>
                </div>

                <p className="text-sm sm:text-base text-neutral-300 font-medium truncate pr-2 leading-relaxed">
                    {previewText}
                </p>

                {/* Sub-strip with status and lease countdown */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5 text-xs sm:text-sm font-mono">
                    <div className="flex items-center gap-1.5">
                        {countryCode && (
                            <span className="text-primary-container font-black uppercase tracking-wider bg-primary-container/10 px-2 py-0.5 rounded-lg border border-primary-container/20 flex items-center gap-1 text-xs">
                                <Globe className="w-3 h-3" />
                                <span>{countryCode}</span>
                            </span>
                        )}
                        <span className="text-neutral-400 font-bold uppercase truncate max-w-[120px] text-xs">
                            {category}
                        </span>
                    </div>

                    {isLockedByMe && leasedUntil ? (
                        <IncidentLeaseTimer expiresAtUnix={leasedUntil} className="py-0 px-2 text-xs sm:text-sm" />
                    ) : isLockedBySomeoneElse ? (
                        <span className="text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1 text-xs">
                            <Lock className="w-3 h-3" />
                            <span>Op #{leasedById}</span>
                        </span>
                    ) : null}
                </div>
            </div>
        );
    }

    // ==========================================
    // 🅱️ DEFAULT RICH CARD VARIANT (FOR DASHBOARDS)
    // ==========================================
    return (
        <div
            onClick={handleRowClick}
            className={cn(
                "p-6 sm:p-7 border rounded-3xl cursor-pointer transition-all text-left relative overflow-hidden group shadow-sm",
                isSelected
                    ? "border-primary-container/80 bg-primary-container/[0.04] dark:bg-primary-container/[0.08] shadow-lg ring-1 ring-primary-container/30"
                    : "border-neutral-200 dark:border-zinc-800 bg-neutral-50/60 dark:bg-zinc-900/40 hover:border-neutral-300 dark:hover:border-zinc-700 hover:shadow-md",
                isLockedBySomeoneElse && "opacity-65 border-dashed",
                className
            )}
        >
            {/* Top Status & Category Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 select-none">
                <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black font-mono text-primary-container tracking-wider uppercase bg-primary-container/10 px-3 py-1 border border-primary-container/20 rounded-lg flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2.5px]" />
                        <span>{category}</span>
                    </span>

                    {/* Active Lease Status Pill */}
                    {isLockedByMe && (
                        <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20 rounded-lg flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                            <span>You Hold the Lease</span>
                        </span>
                    )}

                    {isLockedBySomeoneElse && (
                        <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 border border-amber-500/20 rounded-lg flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 stroke-[2.5px]" />
                            <span>Locked: Op #{leasedById}</span>
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 font-mono font-bold">
                        ID: {id}
                    </span>
                </div>
            </div>

            {/* Incident Narrative Content */}
            <p className="text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-100 leading-relaxed line-clamp-2 mb-4 font-sans">
                "{previewText}"
            </p>

            {/* Timer Strip (when locked by current user) */}
            {isLockedByMe && leasedUntil && (
                <div className="mb-4 p-3 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.1] border border-emerald-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-2 select-none">
                    <IncidentLeaseTimer
                        expiresAtUnix={leasedUntil}
                        onTimeout={() => {
                            console.warn(`Operator lease window expired for ticket #${id}.`);
                            setLocalLeaseState({ leased_by_id: null, leased_until: null });
                        }}
                    />
                    <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 italic font-medium">
                        Your lease will release automatically on timeout.
                    </span>
                </div>
            )}

            {/* Footer Metadata & Action Buttons Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm border-t border-neutral-200 dark:border-zinc-800 pt-4 text-neutral-500 font-mono font-bold select-none">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {reporter && (
                        <div>
                            Reporter: <span className="text-neutral-800 dark:text-neutral-200 font-bold">@{reporter}</span>
                        </div>
                    )}
                    {targetAccount && (
                        <div>
                            Target: <span className="text-primary-container font-black">@{targetAccount}</span>
                        </div>
                    )}
                    {orcidId && (
                        <div className="text-emerald-600 dark:text-emerald-400">
                            ORCID: <span className="underline">{orcidId}</span>
                        </div>
                    )}
                    {countryCode && (
                        <div className="flex items-center gap-1.5 text-neutral-400">
                            <Globe className="w-3.5 h-3.5" />
                            <span>{countryCode}</span>
                        </div>
                    )}
                </div>

                {/* Right-aligned Interactive Action Buttons */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    {/* Unassigned -> CLAIM BUTTON */}
                    {!leasedById && (
                        <button
                            type="button"
                            disabled={isClaiming}
                            onClick={handleClaim}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-white text-xs sm:text-sm font-mono font-black uppercase tracking-wider rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-sm border-none cursor-pointer outline-none disabled:opacity-50"
                        >
                            {isClaiming ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Unlock className="w-4 h-4 stroke-[2.5px]" />
                            )}
                            <span>Claim Ticket</span>
                        </button>
                    )}

                    {/* Locked by current operator -> RELEASE / RESOLVE BUTTONS */}
                    {isLockedByMe && (
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                disabled={isReleasing}
                                onClick={handleRelease}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 text-xs sm:text-sm font-mono font-bold rounded-xl transition-all cursor-pointer border-none outline-none disabled:opacity-50"
                                title="Voluntarily release ticket back to pool"
                            >
                                {isReleasing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RotateCcw className="w-4 h-4" />
                                )}
                                <span>Drop Ticket</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleResolve}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-white text-xs sm:text-sm font-mono font-black uppercase tracking-wider rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-sm border-none cursor-pointer outline-none"
                            >
                                <ShieldAlert className="w-4 h-4 stroke-[2.5px]" />
                                <span>Resolve Infraction</span>
                            </button>
                        </div>
                    )}

                    {/* Locked by someone else notice */}
                    {isLockedBySomeoneElse && (
                        <span className="text-xs sm:text-sm font-mono italic text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked by Operator #{leasedById}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncidentRowItem;
