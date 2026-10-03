import { useState, useEffect } from 'react';

const RootAdminDashboard = () => {
    const [targetUsername, setTargetUsername] = useState("");
    const [auditLogs, setAuditLogs] = useState([]);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState("Staff & Permissions");

    useEffect(() => {
        // Fetches the secure system audit trail stream on mount
        fetch('/api/v1/admin/root/audit_logs', {
            headers: { "Authorization": `Bearer ${localStorage.getItem("user_token")}` }
        })
            .then(res => res.json())
            .then(json => setAuditLogs(json.data || []));
    }, [message]);

    const handleStaffPromotion = async (roleType) => {
        if (!targetUsername.trim()) return;
        setMessage(null);

        const endpoint = roleType === "admin"
            ? "/api/v1/admin/root/users/promote_admin"
            : "/api/v1/admin/root/users/promote_moderator";

        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("user_token")}`
            },
            body: JSON.stringify({ username: targetUsername.trim() })
        });

        const json = await res.json();
        if (res.ok) {
            setMessage({ type: "success", text: json.message });
            setTargetUsername("");
        } else {
            setMessage({ type: "error", text: json.error || "Promotion failed." });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 text-scale-large">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-2 text-primary-container mb-2">
                    <span className="material-symbols-outlined text-[24px]">shield_person</span>
                    <span className="text-xs font-mono uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 border border-primary-container/20">Root Operator Layer</span>
                </div>
                <h1 className="font-display-lg text-3xl font-extrabold text-text-primary mb-2">Root Admin Desk</h1>
                <p className="font-body-md text-xl font-semibold text-text-secondary">
                    Elevate profile privileges and view immutable platform audit trails.
                </p>
            </header>

            {/* Sub-navigation tabs */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-white/5 mb-8">
                {["Staff & Permissions", "System Configuration", "Security Blacklists"].map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 transition-all duration-200 whitespace-nowrap border text-label-sm cursor-pointer ${
                                isActive
                                    ? 'bg-primary-container text-white border-primary-container crimson-glow'
                                    : 'bg-surface-container-high text-text-secondary border-white/5 hover:border-white/10 hover:text-text-primary'
                            }`}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>

            {activeTab === "Staff & Permissions" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Action Form Block - Left Column (take 2 cols on desktop) */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="glass-card bg-surface-ink border border-white/10 p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <span className="material-symbols-outlined text-primary-container">arrow_upward_alt</span>
                                <h2 className="font-headline-md text-xl font-bold text-text-primary">Elevate Profile Privileges</h2>
                            </div>

                            <p className="text-sm text-text-secondary leading-relaxed">
                                Assign administrator or moderator clearance tags to active accounts. Promotions are logged instantly to the secure system ledger.
                            </p>

                            {message && (
                                <div className={`p-4 text-sm font-semibold border ${
                                    message.type === "success" 
                                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
                                        : "bg-primary/10 border-primary/20 text-primary"
                                }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="font-label-md text-sm font-bold text-text-secondary block">Account Username</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold font-mono">@</span>
                                        <input
                                            type="text"
                                            placeholder="enter exact handle (e.g. alice_w)"
                                            value={targetUsername}
                                            onChange={e => setTargetUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                                            className="w-full bg-surface-container-low border border-white/10 py-3 pl-9 pr-4 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-all placeholder:text-text-secondary/40 font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    <button 
                                        onClick={() => handleStaffPromotion("moderator")} 
                                        className="flex-1 bg-surface-container-high border border-white/5 hover:bg-surface-container-highest text-text-primary px-6 py-3.5 font-bold transition-all cursor-pointer"
                                    >
                                        Grant Moderator
                                    </button>
                                    <button 
                                        onClick={() => handleStaffPromotion("admin")} 
                                        className="flex-1 bg-primary-container text-white px-6 py-3.5 font-bold hover:brightness-110 transition-all crimson-glow cursor-pointer"
                                    >
                                        Grant Root Admin
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* System Audit Log Block - Right Column (takes 1 col) */}
                    <div className="lg:col-span-1">
                        <section className="glass-card bg-surface-ink border border-white/10 p-6 flex flex-col h-[500px]">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                                <span className="material-symbols-outlined text-primary-container">receipt_long</span>
                                <h2 className="font-headline-md text-lg font-bold text-text-primary">System Ledger</h2>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                {auditLogs.length > 0 ? (
                                    auditLogs.map(log => (
                                        <div key={log.id} className="border-b border-white/5 pb-3 text-xs leading-relaxed font-mono text-text-secondary">
                                            <div className="flex justify-between text-[10px] text-text-secondary font-mono mb-1">
                                                <span className="text-primary-container font-bold">[{log.inserted_at}]</span>
                                                <span>Log #{log.id}</span>
                                            </div>
                                            <div className="text-text-primary">
                                                Operator <span className="font-semibold text-text-primary">#99</span> executed{" "}
                                                <span className="text-gold-muted font-bold">{log.action}</span> on{" "}
                                                <span className="text-primary-container font-semibold">@{log.target_id}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-text-secondary text-center py-16 flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-3xl">verified_user</span>
                                        <p className="text-xs font-bold uppercase tracking-wider font-mono">Zero entries logged</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {activeTab === "System Configuration" && (
                <section className="glass-card bg-surface-ink border border-white/10 p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-text-secondary mb-4">tune</span>
                    <h3 className="font-bold text-text-primary text-xl mb-2">System Configurator</h3>
                    <p className="text-text-secondary max-w-md mx-auto text-sm">
                        Global feature flags, mesh network routing tables, and rate-limiting limits. Under construction.
                    </p>
                </section>
            )}

            {activeTab === "Security Blacklists" && (
                <section className="glass-card bg-surface-ink border border-white/10 p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-text-secondary mb-4">block</span>
                    <h3 className="font-bold text-text-primary text-xl mb-2">Security Blacklists</h3>
                    <p className="text-text-secondary max-w-md mx-auto text-sm">
                        IP address CIDR blacklists, shadow-ban filters, and bad-actor firewalls. Under construction.
                    </p>
                </section>
            )}
        </div>
    );
};

export default RootAdminDashboard;
