// src/features/admin/AdminSubComponents.jsx (Part 3A of 2)
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

// Helper: Loading Spinner Frame
const AdminSpinner = () => (
    <div className="py-12 flex justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" />
    </div>
);

// 🟢 1. ACCOUNT REGISTRATION APPROVAL INDEX
export function ApprovalIndex() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAdminApprovalQuery();
    const mutation = useAdminActionMutation('approvals');
    const items = data?.pages.flatMap((p) => p.accounts || p || []) || [];

    if (status === 'pending') return <AdminSpinner />;
    if (items.length === 0) return <div className="text-center py-12 text-sm text-text-secondary">No pending account approvals found.</div>;

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-3 select-none">
                <h2 className="text-lg font-bold text-white">Pending Registrations</h2>
                <p className="text-xs text-text-secondary mt-0.5">Verify incoming node sign-up profiles before network broadcast access</p>
            </div>
            <div className="flex flex-col border border-[#262626] rounded-xl overflow-hidden bg-[#111111]">
                <Virtuoso
                    useWindowScroll
                    data={items}
                    endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                    itemContent={(idx, account) => (
                        <div className="flex items-center justify-between p-4 border-b border-[#262626] last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#1A1616] border border-white/5">
                                    <img src={account.avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">{account.username}</span>
                                    <span className="text-xs text-text-secondary font-mono">{account.email}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => mutation.mutate({ id: account.id, action: 'approve' })} className="px-3 py-1.5 bg-primary-container text-white text-xs font-bold rounded-lg cursor-pointer border-none shadow-md">Approve</button>
                                <button type="button" onClick={() => mutation.mutate({ id: account.id, action: 'reject' })} className="px-3 py-1.5 bg-surface-container-high text-text-secondary text-xs font-bold rounded-lg cursor-pointer border-none">Deny</button>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

// 🔴 2. CITIZEN ABUSE TICKET REPORTS INDEX
export function ReportsIndex() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAdminReportsQuery();
    const mutation = useAdminActionMutation('reports');
    const items = data?.pages.flatMap((p) => p.reports || p || []) || [];

    if (status === 'pending') return <AdminSpinner />;
    if (items.length === 0) return <div className="text-center py-12 text-sm text-text-secondary">No active abuse tickets pending resolution.</div>;

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-3 select-none">
                <h2 className="text-lg font-bold text-white">Abuse Reports</h2>
                <p className="text-xs text-text-secondary mt-0.5">Audit and resolve community flag notifications</p>
            </div>
            <div className="flex flex-col border border-[#262626] rounded-xl overflow-hidden bg-[#111111]">
                <Virtuoso
                    useWindowScroll
                    data={items}
                    endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                    itemContent={(idx, report) => (
                        <div className="p-4 border-b border-[#262626] last:border-0 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div className="text-xs text-text-secondary font-medium">
                                    Reported: <span className="text-white font-bold">@{report.target_account?.username}</span> by <span className="text-primary-container font-mono font-bold">@{report.account?.username}</span>
                                </div>
                                <button type="button" onClick={() => mutation.mutate({ id: report.id, action: 'resolve_report' })} className="px-3 py-1 bg-surface-container border border-white/10 hover:border-white/20 text-xs font-bold rounded-lg text-white cursor-pointer">Resolve</button>
                            </div>
                            <p className="text-xs bg-[#141414] p-3 rounded-lg border border-white/5 text-text-secondary leading-relaxed font-medium">
                                <span className="text-[10px] font-mono font-black uppercase text-rose-400 block mb-1">Violation parameters:</span>
                                "{report.comment || 'No contextual statement attached'}"
                            </p>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

// 🔵 3. IDENTITY REGISTRY INDEX (USER INDEX)
export function UserIndex() {
    const [search, setSearch] = useState('');
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAdminUsersQuery(search);
    const mutation = useAdminActionMutation('users');
    const items = data?.pages.flatMap((p) => p.accounts || p || []) || [];

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                <div>
                    <h2 className="text-lg font-bold text-white">Identity Registry</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Audit profile states and manage account restrictions</p>
                </div>
                <input
                    type="text"
                    placeholder="Search handles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-[#111111] border border-white/10 rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-primary-container w-full md:w-48 font-bold"
                />
            </div>

            {status === 'pending' ? <AdminSpinner /> : items.length === 0 ? <div className="text-center py-12 text-sm text-text-secondary">No matching accounts found.</div> : (
                <div className="flex flex-col border border-[#262626] rounded-xl overflow-hidden bg-[#111111]">
                    <Virtuoso
                        useWindowScroll
                        data={items}
                        endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                        itemContent={(idx, user) => (
                            <div className="flex items-center justify-between p-4 border-b border-[#262626] last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#1A1616] border border-white/5">
                                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">{user.username}</span>
                                        <span className="text-[10px] font-mono text-text-secondary/40 font-bold uppercase tracking-wider">{user.suspended ? '⚠️ Suspended' : '✓ Active'}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => mutation.mutate({ id: user.id, action: user.suspended ? 'unsuspend' : 'suspend_user' })}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer border ${user.suspended ? 'bg-primary-container text-white border-primary-container' : 'bg-surface-container border-white/5 text-rose-400 hover:bg-rose-500/10'}`}
                                >
                                    {user.suspended ? 'Reactivate' : 'Suspend'}
                                </button>
                            </div>
                        )}
                    />
                </div>
            )}
        </div>
    );
}

// src/features/admin/AdminSubComponents.jsx (Part 3B of 2)

// 🔏 4. IMMUTABLE MODERATION AUDIT TRAIL LOG
export function ModerationLog() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useAdminLogQuery();
    const items = data?.pages.flatMap((p) => p.action_logs || p || []) || [];

    if (status === 'pending') return <div className="py-12 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" /></div>;
    if (items.length === 0) return <div className="text-center py-12 text-sm text-text-secondary">No audit logs recorded across the sequence matrix.</div>;

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-3 select-none">
                <h2 className="text-lg font-bold text-white">Moderation Audit Trail</h2>
                <p className="text-xs text-text-secondary mt-0.5">Immutable record timeline tracking panel operations</p>
            </div>
            <div className="flex flex-col border border-[#262626] rounded-xl overflow-hidden bg-[#111111]">
                <Virtuoso
                    useWindowScroll
                    data={items}
                    endReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
                    itemContent={(idx, log) => (
                        <div className="p-4 border-b border-[#262626] last:border-0 flex items-start justify-between gap-4 font-mono text-xs">
                            <div className="flex flex-col gap-1">
                                <div className="text-text-primary font-bold">
                                    <span className="text-primary-container">@{log.account?.username}</span> executed <span className="text-amber-400">[{log.action}]</span>
                                </div>
                                <span className="text-[11px] text-text-secondary/50 font-normal leading-relaxed">Target parameter: {log.target?.type || 'Record'} ID {log.target?.id}</span>
                            </div>
                            <span className="text-[10px] text-text-secondary/40 shrink-0 font-bold">{log.created_at || 'Just now'}</span>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

// 📜 5. COLLECTIVE BYLAWS (RULES) EDITOR
export function Rules() {
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

    if (isPending) return <div className="py-12 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-3 select-none">
                <h2 className="text-lg font-bold text-white">Collective Bylaws</h2>
                <p className="text-xs text-text-secondary mt-0.5">Configure instance terms, governance statutes, and system guidelines</p>
            </div>

            {/* Creation form */}
            <form onSubmit={handleAddRule} className="flex gap-2 w-full">
                <input
                    type="text"
                    required
                    placeholder="Formulate fresh directive rule text..."
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    className="flex-1 bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary-container"
                />
                <button type="submit" disabled={mutation.isPending || !newRuleText.trim()} className="px-4 py-2 bg-primary-container text-white text-xs font-bold rounded-xl cursor-pointer border-none shadow-md uppercase tracking-wider">{mutation.isPending ? 'Writing...' : 'Publish'}</button>
            </form>

            {/* Rules list stack */}
            {!rules || rules.length === 0 ? <div className="text-center py-6 text-xs text-text-secondary select-none">No custom instance guidelines defined yet.</div> : (
                <div className="flex flex-col border border-[#262626] rounded-xl overflow-hidden bg-[#111111]">
                    {rules.map((rule, idx) => (
                        <div key={rule.id || idx} className="flex items-start justify-between p-4 border-b border-[#262626] last:border-0 gap-4">
                            <div className="flex gap-3">
                                <span className="font-mono text-xs font-black text-primary-container bg-primary-container/10 w-6 h-6 rounded-md flex items-center justify-center shrink-0 border border-primary-container/10">{idx + 1}</span>
                                <p className="text-sm font-medium text-text-secondary leading-relaxed pt-0.5">{rule.text}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => mutation.mutate({ id: rule.id, action: 'delete_rule' })}
                                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-text-secondary hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

