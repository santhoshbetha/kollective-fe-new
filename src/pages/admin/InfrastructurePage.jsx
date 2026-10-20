// src/pages/admin/InfrastructurePage.jsx
import { useNavigate } from 'react-router-dom';
import { InfrastructureCenter } from '../../features/moderation/components/InfrastructureCenter';
import { ArrowLeft, Shield, Gavel, ShieldCheck } from 'lucide-react';

export const InfrastructurePage = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 px-4 font-sans text-left text-neutral-800 dark:text-neutral-100 transition-colors animate-in fade-in duration-200">
            {/* Top Navigation & Fast Switcher Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-2 border-b border-neutral-200 dark:border-zinc-800 select-none">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/root')}
                        className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                        <span>/</span>
                        <span className="text-primary-container font-bold">Infrastructure Center</span>
                    </div>
                </div>

                {/* Quick Cross-Deck Navigation Links */}
                <div className="flex items-center gap-2 font-mono text-xs">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/moderation')}
                        className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                        <Gavel className="w-3.5 h-3.5 text-primary-container" />
                        <span>Moderation Desk</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin/root')}
                        className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        <span>Root Desk</span>
                    </button>

                    <span className="px-2.5 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Sovereign Clear</span>
                    </span>
                </div>
            </div>

            {/* Main Infrastructure Center Component */}
            <main>
                <InfrastructureCenter />
            </main>
        </div>
    );
};

export default InfrastructurePage;
