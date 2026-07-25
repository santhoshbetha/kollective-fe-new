// src/pages/AdminDashboardPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ApprovalIndex,
    ModerationLog,
    ReportsIndex,
    Rules,
    UserIndex
} from '../../features/admin/AdminSubComponents';
import {
    UserCheck,
    Flag,
    Users,
    Gavel,
    BookOpen,
    ArrowLeft
} from 'lucide-react';
import { cn } from "@/lib/utils";

const AdminDashboardPage = () => {
    const navigate = useNavigate();

    // Switchboard state matrix tracker: 'approvals' | 'reports' | 'users' | 'logs' | 'rules'
    const [activeAdminTab, setActiveAdminTab] = useState('approvals');

    const adminMenu = [
        {
            id: 'approvals',
            label: 'Pending Approvals',
            icon: UserCheck,
            desc: 'Verify incoming profile sign-ups'
        },
        {
            id: 'reports',
            label: 'Abuse Reports',
            icon: Flag,
            desc: 'Resolve citizen moderation flags'
        },
        {
            id: 'users',
            label: 'Identity Registry',
            icon: Users,
            desc: 'Manage global user directories'
        },
        {
            id: 'logs',
            label: 'Moderation Audit Trail',
            icon: Gavel,
            desc: 'Immutable action histories'
        },
        {
            id: 'rules',
            label: 'Collective Bylaws',
            icon: BookOpen,
            desc: 'Configure instance guidelines'
        }
    ];

    return (
        <div className="w-full max-w-[var(--spacing-container-max)] mx-auto flex flex-col lg:flex-row gap-8 pb-20 font-sans animate-in fade-in duration-200">

            {/* 🧭 LEFT COLUMN: CONTROLS SIDEBAR MATRIX */}
            <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 select-none">

                {/* Header Title Row */}
                <div className="flex justify-between items-center border-b border-outline-variant/40 pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                            Admin Console
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-text-secondary mt-0.5">
                            Instance moderation and governance
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/home')}
                        className="px-3.5 py-2 bg-surface-container-low border border-outline-variant rounded-card text-xs font-bold text-text-primary hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Exit</span>
                    </button>
                </div>

                {/* Sidebar Navigation Items (Stacked on Desktop, Horizontal Scroll on Mobile) */}
                <div className="flex flex-row lg:flex-col gap-2 bg-surface-container border border-outline-variant p-2 rounded-card shadow-2xl overflow-x-auto lg:overflow-y-auto no-scrollbar">
                    {adminMenu.map((item) => {
                        const isTabActive = activeAdminTab === item.id;
                        const IconComponent = item.icon;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveAdminTab(item.id)}
                                className={cn(
                                    "flex items-center gap-3.5 min-w-[240px] lg:min-w-0 w-full p-3.5 sm:p-4 text-left rounded-card transition-all cursor-pointer border bg-transparent shrink-0 group",
                                    isTabActive
                                        ? "bg-surface-container-high border-outline-variant/80 text-text-primary shadow-xs font-bold"
                                        : "border-transparent text-text-secondary hover:bg-surface-container-low hover:text-text-primary"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-card flex items-center justify-center border shrink-0 transition-colors",
                                        isTabActive
                                            ? "bg-primary/20 border-primary/30 text-primary"
                                            : "bg-surface-container-low border-outline-variant/60 text-text-secondary group-hover:text-text-primary group-hover:border-outline-variant"
                                    )}
                                >
                                    <IconComponent className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm sm:text-base font-bold tracking-tight text-text-primary">
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-text-secondary/70 font-medium truncate mt-0.5">
                                        {item.desc}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 🖥️ RIGHT COLUMN: MODULAR WORKSPACE STAGE CANVAS */}
            <div className="flex-1 min-w-0 bg-surface-container border border-outline-variant rounded-card p-5 sm:p-8 shadow-2xl min-h-[600px] relative">
                {activeAdminTab === 'approvals' && <ApprovalIndex />}
                {activeAdminTab === 'reports' && <ReportsIndex />}
                {activeAdminTab === 'users' && <UserIndex />}
                {activeAdminTab === 'logs' && <ModerationLog />}
                {activeAdminTab === 'rules' && <Rules />}
            </div>

        </div>
    );
};

export default AdminDashboardPage;