// src/pages/AdminDashboardPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ApprovalIndex,
    ReportsIndex,
    ModerationLog,
    UserIndex,
    Rules
} from '../features/admin/AdminSubComponents';

export const AdminDashboardPage = () => {
    const navigate = useNavigate();
    // 🎛️ Switchboard state matrix tracker: 'approvals' | 'reports' | 'logs' | 'users' | 'rules'
    const [activeAdminTab, setActiveAdminTab] = useState('approvals');

    const adminMenu = [
        { id: 'approvals', label: 'Pending Approvals', icon: 'how_to_reg', desc: 'Verify incoming profile sign-ups' },
        { id: 'reports', label: 'Abuse Reports', icon: 'report', desc: 'Resolve citizen moderation flags' },
        { id: 'users', label: 'Identity Registry', icon: 'manage_accounts', desc: 'Manage global user directories' },
        { id: 'logs', label: 'Moderation Audit Trail', icon: 'gavel', desc: 'Immutable action histories' },
        { id: 'rules', label: 'Collective Bylaws', icon: 'gavel', desc: 'Configure instance guidelines' }
    ];

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 LEFT COLUMN: CONTROLS SIDEBAR MATRIX */}
            <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 select-none">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-text-primary tracking-tight">Admin Console</h1>
                        <p className="text-xs text-text-secondary mt-0.5">Instance moderation and governance</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/home')}
                        className="px-3 py-1.5 bg-surface-container border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                        Exit
                    </button>
                </div>

                <div className="flex flex-col gap-1.5 bg-[#141414] border border-[#262626] p-2 rounded-2xl shadow-xl">
                    {adminMenu.map((item) => {
                        const isTabActive = activeAdminTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveAdminTab(item.id)}
                                className={`flex items-center gap-4 w-full p-4 text-left rounded-xl transition-all border border-transparent cursor-pointer bg-transparent group ${isTabActive
                                        ? 'bg-surface-container-high border-white/5 text-text-primary shadow-md'
                                        : 'text-text-secondary hover:bg-white/[0.01] hover:text-text-primary'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${isTabActive ? 'bg-primary-container/20 border-primary-container/20 text-primary-container' : 'bg-surface-container border-white/5 text-text-secondary group-hover:text-text-primary'
                                    }`}>
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-black tracking-tight">{item.label}</span>
                                    <span className="text-[11px] text-text-secondary/50 font-medium truncate mt-0.5">{item.desc}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 🖥️ RIGHT COLUMN: MODULAR WORKSPACE STAGE CANVAS */}
            <div className="flex-1 min-w-0 bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-2xl min-h-[600px] relative">
                {activeAdminTab === 'approvals' && <ApprovalIndex />}
                {activeAdminTab === 'reports' && <ReportsIndex />}
                {activeAdminTab === 'users' && <UserIndex />}
                {activeAdminTab === 'logs' && <ModerationLog />}
                {activeAdminTab === 'rules' && <Rules />}
            </div>

        </div>
    );
};
