// src/features/admin/AdminSubComponents.jsx
import React, { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import {
    useAdminApprovalQuery,
    useAdminReportsQuery,
    useAdminLogQuery,
    useAdminUsersQuery,
    useAdminRulesQuery,
    useAdminActionMutation
} from './useAdminFeature';
import {
    Loader2,
    Search,
    Check,
    X,
    UserX,
    UserCheck,
    Trash2,
    Plus
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Helper: Loading Spinner Frame
const AdminSpinner = () => (
    <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
            Syncing administrative records...
        </span>
    </div>
);

// 🟢 1. ACCOUNT REGISTRATION APPROVAL INDEX
function ApprovalIndex() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAdminApprovalQuery();
    const mutation = useAdminActionMutation('approvals');
    const items = data?.pages.flatMap((p) => p.accounts || p || []) || [];

    if (status === 'pending') return <AdminSpinner />;
    if (items.length === 0) {
        return (
            <div className="text-center py-16 text-sm sm:text-base font-medium text-text-secondary bg-surface-container-low/40 rounded-card border border-dashed border-outline-variant">
                No pending account approvals found.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-200 font-sans">
            <div className="border-b border-outline-variant/40 pb-4 select-none">
                <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                    Pending Registrations
                </h2>
                <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
                    Verify incoming node sign-up profiles before network broadcast access
                </p>
            </div>

            <div className="flex flex-col border border-outline-variant rounded-card overflow-hidden bg-surface-container-low">
                <Virtuoso
                    useWindowScroll
                    data={items}
                    endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                    itemContent={(idx, account) => (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-outline-variant/40 last:border-0 gap-4 hover:bg-surface-container-high/30 transition-colors">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-11 h-11 rounded-card overflow-hidden bg-surface-container-high border border-outline-variant shrink-0">
                                    <img
                                        src={account.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                                        alt={account.username}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm sm:text-base font-bold text-text-primary truncate">
                                        @{account.username}
                                    </span>
                                    <span className="text-xs font-mono text-text-secondary truncate">
                                        {account.email}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                <button
                                    type="button"
                                    onClick={() => mutation.mutate({ id: account.id, action: 'approve' })}
                                    className="px-4 py-2 bg-primary hover:brightness-110 text-on-primary text-xs sm:text-sm font-bold rounded-card cursor-pointer border-none shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Approve</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => mutation.mutate({ id: account.id, action: 'reject' })}
                                    className="px-4 py-2 bg-surface-container border border-outline-variant text-text-secondary hover:text-text-primary text-xs sm:text-sm font-bold rounded-card cursor-pointer hover:bg-surface-container-high transition-all"
                                >
                                    Deny
                                </button>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

// 🔴 2. CITIZEN ABUSE TICKET REPORTS INDEX
function ReportsIndex() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAdminReportsQuery();
    const mutation = useAdminActionMutation('reports');
    const items = data?.pages.flatMap((p) => p.reports || p || []) || [];

    if (status === 'pending') return <AdminSpinner />;
    if (items.length === 0) {
        return (
            <div className="text-center py-16 text-sm sm:text-base font-medium text-text-secondary bg-surface-container-low/40 rounded-card border border-dashed border-outline-variant">
                No active abuse tickets pending resolution.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-200 font-sans">
            <div className="border-b border-outline-variant/40 pb-4 select-none">
                <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                    Abuse Reports
                </h2>
                <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
                    Audit and resolve community flag notifications
                </p>
            </div>

            <div className="flex flex-col border border-outline-variant rounded-card overflow-hidden bg-surface-container-low">
                <Virtuoso
                    useWindowScroll
                    data={items}
                    endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                    itemContent={(idx, report) => (
                        <div className="p-5 border-b border-outline-variant/40 last:border-0 flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="text-xs sm:text-sm text-text-secondary font-medium">
                                    Reported: <span className="text-text-primary font-bold">@{report.target_account?.username}</span> by <span className="text-primary font-mono font-bold">@{report.account?.username}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => mutation.mutate({ id: report.id, action: 'resolve_report' })}
                                    className="px-4 py-2 bg-surface-container border border-outline-variant hover:bg-surface-container-high text-xs sm:text-sm font-bold rounded-card text-text-primary cursor-pointer transition-all shrink-0"
                                >
                                    Resolve
                                </button>
                            </div>

                            <div className="text-xs sm:text-sm bg-surface-container p-4 rounded-card border border-outline-variant/60 text-text-secondary leading-relaxed font-medium">
                                <span className="text-xs font-mono font-bold uppercase text-error block mb-1">
                                    Violation parameters:
                                </span>
                                "{report.comment || 'No contextual statement attached'}"
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

// 🔵 3. IDENTITY REGISTRY INDEX (USER INDEX)
function UserIndex() {
    const [search, setSearch] = useState('');
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAdminUsersQuery(search);
    const mutation = useAdminActionMutation('users');
    const items = data?.pages.flatMap((p) => p.accounts || p || []) || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-200 font-sans">
            <div className="border-b border-outline-variant/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                        Identity Registry
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
                        Audit profile states and manage account restrictions
                    </p>
                </div>

                {/* Search Bar Input */}
                <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search handles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-surface-container-low border border-outline-variant rounded-card pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold text-text-primary focus:outline-none focus:border-primary w-full transition-all"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {status === 'pending' ? (
                <AdminSpinner />
            ) : items.length === 0 ? (
                <div className="text-center py-16 text-sm sm:text-base font-medium text-text-secondary bg-surface-container-low/40 rounded-card border border-dashed border-outline-variant">
                    No matching accounts found.
                </div>
            ) : (
                <div className="flex flex-col border border-outline-variant rounded-card overflow-hidden bg-surface-container-low">
                    <Virtuoso
                        useWindowScroll
                        data={items}
                        endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                        itemContent={(idx, user) => (
                            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-outline-variant/40 last:border-0 hover:bg-surface-container-high/30 transition-colors">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-card overflow-hidden bg-surface-container-high border border-outline-variant shrink-0">
                                        <img
                                            src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                                            alt={user.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm sm:text-base font-bold text-text-primary truncate">
                                            @{user.username}
                                        </span>
                                        <span className="text-xs font-mono font-bold uppercase tracking-wider mt-0.5">
                                            {user.suspended ? (
                                                <span className="text-error flex items-center gap-1">
                                                    ⚠️ Suspended
                                                </span>
                                            ) : (
                                                <span className="text-emerald-500 flex items-center gap-1">
                                                    ✓ Active
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => mutation.mutate({ id: user.id, action: user.suspended ? 'unsuspend' : 'suspend_user' })}
                                    className={cn(
                                        "px-4 py-2 rounded-card text-xs sm:text-sm font-bold cursor-pointer border transition-all flex items-center gap-1.5 shrink-0",
                                        user.suspended
                                            ? "bg-primary text-on-primary border-primary hover:brightness-110 shadow-xs"
                                            : "bg-surface-container border-outline-variant text-error hover:bg-error/10 hover:border-error/30"
                                    )}
                                >
                                    {user.suspended ? (
                                        <>
                                            <UserCheck className="w-4 h-4" />
                                            <span>Reactivate</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserX className="w-4 h-4" />
                                            <span>Suspend</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    />
                </div>
            )}
        </div>
    );
}

// 🔏 4. IMMUTABLE MODERATION AUDIT TRAIL LOG
function ModerationLog() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAdminLogQuery();
    const items = data?.pages.flatMap((p) => p.action_logs || p || []) || [];

    if (status === 'pending') return <AdminSpinner />;
    if (items.length === 0) {
        return (
            <div className="text-center py-16 text-sm sm:text-base font-medium text-text-secondary bg-surface-container-low/40 rounded-card border border-dashed border-outline-variant">
                No audit logs recorded across the sequence matrix.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-200 font-sans">
            <div className="border-b border-outline-variant/40 pb-4 select-none">
                <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                    Moderation Audit Trail
                </h2>
                <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
                    Immutable record timeline tracking panel operations
                </p>
            </div>

            <div className="flex flex-col border border-outline-variant rounded-card overflow-hidden bg-surface-container-low">
                <Virtuoso
                    useWindowScroll
                    data={items}
                    endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                    itemContent={(idx, log) => (
                        <div className="p-4 sm:p-5 border-b border-outline-variant/40 last:border-0 flex items-start justify-between gap-4 font-mono text-xs sm:text-sm">
                            <div className="flex flex-col gap-1">
                                <div className="text-text-primary font-bold">
                                    <span className="text-primary">@{log.account?.username}</span> executed <span className="text-gold-muted">[{log.action}]</span>
                                </div>
                                <span className="text-xs text-text-secondary/70 font-normal leading-relaxed">
                                    Target parameter: {log.target?.type || 'Record'} ID {log.target?.id}
                                </span>
                            </div>
                            <span className="text-xs text-text-secondary/60 shrink-0 font-bold">
                                {log.created_at || 'Just now'}
                            </span>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

// 📜 5. COLLECTIVE BYLAWS (RULES) EDITOR
function Rules() {
    const { data: rules, isPending } = useAdminRulesQuery();
    const mutation = useAdminActionMutation('rules');
    const [newRuleText, setNewRuleText] = useState('');

    const handleAddRule = (e) => {
        e.preventDefault();
        if (!newRuleText.trim()) return;
        mutation.mutate({ action: 'create_rule', payload: { text: newRuleText.trim() } }, {
            onSuccess: () => setNewRuleText('')
        });
    };

    if (isPending) return <AdminSpinner />;

    return (
        <div className="space-y-6 animate-in fade-in duration-200 font-sans">
            <div className="border-b border-outline-variant/40 pb-4 select-none">
                <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                    Collective Bylaws
                </h2>
                <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1">
                    Configure instance terms, governance statutes, and system guidelines
                </p>
            </div>

            {/* Creation form */}
            <form onSubmit={handleAddRule} className="flex gap-3 w-full">
                <input
                    type="text"
                    required
                    placeholder="Formulate fresh directive rule text..."
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-card px-4 py-3 text-xs sm:text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-all"
                />
                <button
                    type="submit"
                    disabled={mutation.isPending || !newRuleText.trim()}
                    className="px-5 py-3 bg-primary hover:brightness-110 text-on-primary text-xs sm:text-sm font-bold rounded-card cursor-pointer border-none shadow-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-98 shrink-0 disabled:opacity-40"
                >
                    <Plus className="w-4 h-4" />
                    <span>{mutation.isPending ? 'Writing...' : 'Publish'}</span>
                </button>
            </form>

            {/* Rules list stack */}
            {!rules || rules.length === 0 ? (
                <div className="text-center py-16 text-sm sm:text-base font-medium text-text-secondary bg-surface-container-low/40 rounded-card border border-dashed border-outline-variant select-none">
                    No custom instance guidelines defined yet.
                </div>
            ) : (
                <div className="flex flex-col border border-outline-variant rounded-card overflow-hidden bg-surface-container-low divide-y divide-outline-variant/40">
                    {rules.map((rule, idx) => (
                        <div key={rule.id || idx} className="flex items-start justify-between p-4 sm:p-5 gap-4">
                            <div className="flex gap-3.5 items-start">
                                <span className="font-mono text-xs sm:text-sm font-black text-primary bg-primary/10 w-7 h-7 rounded-card flex items-center justify-center shrink-0 border border-primary/20">
                                    {idx + 1}
                                </span>
                                <p className="text-xs sm:text-sm font-medium text-text-primary leading-relaxed pt-0.5">
                                    {rule.text}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => mutation.mutate({ id: rule.id, action: 'delete_rule' })}
                                className="w-8 h-8 rounded-card bg-surface-container hover:bg-error/10 border border-outline-variant hover:border-error/30 text-text-secondary hover:text-error flex items-center justify-center transition-all cursor-pointer shrink-0"
                                title="Delete Rule"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export { ApprovalIndex, ModerationLog, ReportsIndex, Rules, UserIndex };