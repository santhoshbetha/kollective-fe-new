// src/components/AccountSwitcher.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useSwitchAccount } from '../store/auth/useSwitchAccount';

export default function AccountSwitcher({
    user: propUser,
    activeProfile: propActiveProfile,
    setActiveProfile: propSetActiveProfile,
    className = '',
    compact = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Store state
    const storeUser = useAuthStore((state) => state.user);
    const activeAccount = useAuthStore((state) => state.activeAccount);

    // Resolved user & active identity
    const currentUser = propUser || storeUser;
    const currentAccount = activeAccount || (currentUser ? {
        id: currentUser.id || 'personal',
        type: 'personal',
        name: currentUser.name || 'Personal Account',
        username: currentUser.username || currentUser.handle?.replace('@', '') || 'user',
        handle: currentUser.handle || `@${currentUser.username || 'user'}`,
        avatar: currentUser.avatar || '/default-avatar.jpg',
        role: currentUser.role || 'citizen',
    } : null);

    const switchAccount = useSwitchAccount();
    const isSwitching = switchAccount.isPending;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close on Esc key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleSwitch = (targetAccountId) => {
        if (isSwitching) return;

        // Prop compatibility
        if (propSetActiveProfile && currentUser) {
            if (targetAccountId === 'personal') {
                propSetActiveProfile({ type: 'personal', id: null, name: currentUser.name });
            } else {
                const org = currentUser.memberships?.find(m => m.organization?.id === targetAccountId);
                if (org) {
                    propSetActiveProfile({ type: 'org', id: org.organization.id, name: org.organization.name });
                }
            }
        }

        switchAccount.mutate(targetAccountId, {
            onSettled: () => {
                setIsOpen(false);
            }
        });
    };

    if (!currentUser && !currentAccount) {
        return null;
    }

    const memberships = currentUser?.memberships?.filter(m => m.status === 'active') || [];
    const isPersonalActive = !currentAccount || currentAccount.type === 'personal';

    return (
        <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
            {/* Active Account Pill Trigger */}
            <button
                type="button"
                disabled={isSwitching}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer select-none text-left ${
                    isOpen
                        ? 'bg-surface-container-high border-primary-container shadow-md ring-2 ring-primary-container/20'
                        : 'bg-surface-container-lowest/60 hover:bg-surface-container border-white/10 hover:border-white/20'
                } ${isSwitching ? 'opacity-70 cursor-wait' : ''}`}
                title={`Current Account: ${currentAccount?.name || 'Personal'}`}
            >
                {/* Avatar with status / role dot */}
                <div className="relative flex-shrink-0">
                    <img
                        src={currentAccount?.avatar || currentUser?.avatar || '/default-avatar.jpg'}
                        alt={currentAccount?.name || 'Avatar'}
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                    />
                    <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-surface ${
                            isPersonalActive ? 'bg-primary-container' : 'bg-amber-400'
                        }`}
                    />
                </div>

                {/* Account Details */}
                {!compact && (
                    <div className="flex flex-col min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-text-primary truncate max-w-[120px] sm:max-w-[150px]">
                                {currentAccount?.name || currentUser?.name}
                            </span>
                            <span
                                className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded tracking-wider ${
                                    isPersonalActive
                                        ? 'bg-primary-container/20 text-primary-container'
                                        : 'bg-amber-400/20 text-amber-300'
                                }`}
                            >
                                {isPersonalActive ? 'Personal' : 'Org'}
                            </span>
                        </div>
                        <span className="text-[11px] text-text-secondary truncate max-w-[120px] sm:max-w-[150px]">
                            {currentAccount?.handle || (currentAccount?.username ? `@${currentAccount.username}` : currentUser?.handle)}
                        </span>
                    </div>
                )}

                {/* Status Indicator or Chevron */}
                {isSwitching ? (
                    <div className="w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full animate-spin ml-1" />
                ) : (
                    <span
                        className={`material-symbols-outlined text-[18px] text-text-secondary transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-text-primary' : ''
                        }`}
                    >
                        expand_more
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-surface-container border border-white/10 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/5 bg-surface-container-low flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                                Switch Account
                            </p>
                            <p className="text-[11px] text-text-secondary/70">
                                Select personal or organization context
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary text-[18px]">
                            swap_horiz
                        </span>
                    </div>

                    <div className="p-2 space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                        {/* 1. Personal Account Row */}
                        <button
                            type="button"
                            disabled={isSwitching}
                            onClick={() => handleSwitch('personal')}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                isPersonalActive
                                    ? 'bg-primary-container/15 border border-primary-container/30 text-text-primary'
                                    : 'hover:bg-surface-container-high/60 border border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <img
                                src={currentUser?.avatar || '/default-avatar.jpg'}
                                alt="Personal avatar"
                                className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold truncate text-text-primary">
                                        {currentUser?.name || 'Personal Account'}
                                    </p>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-container-highest text-text-secondary uppercase">
                                        You
                                    </span>
                                </div>
                                <p className="text-[11px] text-text-secondary truncate">
                                    {currentUser?.handle || (currentUser?.username ? `@${currentUser.username}` : '@user')}
                                </p>
                            </div>
                            {isPersonalActive && (
                                <span className="material-symbols-outlined text-primary-container text-[20px]">
                                    check_circle
                                </span>
                            )}
                        </button>

                        {/* 2. Organization Memberships Section */}
                        <div className="pt-2 pb-1 px-2.5 flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary/80">
                                Your Organizations
                            </span>
                            <span className="text-[10px] text-text-secondary/60">
                                {memberships.length} linked
                            </span>
                        </div>

                        {memberships.length === 0 ? (
                            <div className="px-3 py-3 text-center rounded-xl bg-surface-container-low/50 border border-white/5">
                                <p className="text-xs text-text-secondary/70">
                                    No organization memberships linked to this account.
                                </p>
                            </div>
                        ) : (
                            memberships.map((m) => {
                                const org = m.organization;
                                const isOrgActive = !isPersonalActive && String(currentAccount?.id) === String(org.id);
                                return (
                                    <button
                                        key={org.id}
                                        type="button"
                                        disabled={isSwitching}
                                        onClick={() => handleSwitch(org.id)}
                                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                            isOrgActive
                                                ? 'bg-amber-400/15 border border-amber-400/30 text-text-primary'
                                                : 'hover:bg-surface-container-high/60 border border-transparent text-text-secondary hover:text-text-primary'
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={org.avatar || '/default-org.jpg'}
                                                alt={org.name}
                                                className="w-9 h-9 rounded-lg object-cover border border-white/10"
                                            />
                                            <span className="absolute -bottom-1 -right-1 material-symbols-outlined text-[12px] bg-surface-container p-0.5 rounded text-amber-400">
                                                corporate_fare
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-xs font-bold truncate text-text-primary">
                                                    {org.name}
                                                </p>
                                                {m.role && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 uppercase truncate">
                                                        {m.role}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-text-secondary truncate">
                                                {org.handle || `@${org.username}`}
                                            </p>
                                        </div>
                                        {isOrgActive && (
                                            <span className="material-symbols-outlined text-amber-400 text-[20px]">
                                                check_circle
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

