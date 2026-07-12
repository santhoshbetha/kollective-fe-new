import { useState, useEffect } from 'react';
import VerificationBadge from '../../components/VerificationBadge';

const UnifiedAdminDashboard = ({ authToken }) => {
    // Metric States
    const [pipelineStats, setPipelineStats] = useState({
        active_citizens_p2p: 0,
        pending_activist_juries: 0,
        flagged_scholars_audit: 0,
        dead_journalist_links: 0,
        warned_organizations: 0
    });

    const [activeIncidents, setActiveIncidents] = useState([]);
    const [filterType, setFilterType] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch system metrics across all 5 verification pipelines on component mount
    useEffect(() => {
        const fetchDashboardMatrix = async () => {
            try {
                // Mocking server pipeline aggregate queries from Ecto database metrics
                setPipelineStats({
                    active_citizens_p2p: 1420,
                    pending_activist_juries: 4,
                    flagged_scholars_audit: 2,
                    dead_journalist_links: 3,
                    warned_organizations: 1
                });

                setActiveIncidents([
                    { id: "inc_101", target: "@strike_coordinator_99", type: "ACTIVIST_JURY", detail: "Jury pool formed (8/12 ballots recorded). 14h remaining.", level: "NORMAL", color: "text-rose-500" },
                    { id: "inc_102", target: "@scholar_proof_1", type: "SCHOLAR_AUDIT", detail: "ORCID works dropped from 42 to 3. Automated freeze applied.", level: "CRITICAL", color: "text-emerald-500" },
                    { id: "inc_103", target: "@field_news_4", type: "JOURNALIST_404", detail: "MuckRack link returned 404 status check. Badge paused.", level: "HIGH", color: "text-teal-500" },
                    { id: "inc_104", target: "@the_peoples_dispatch", type: "ORGANIZATION_STRIKE", detail: "Serving day 12 of a 30-day propaganda probation penalty.", level: "CRITICAL", color: "text-yellow-500" }
                ]);

                setIsLoading(false);
            } catch (err) {
                console.error("Dashboard ingestion pipeline error:", err);
                setIsLoading(false);
            }
        };

        fetchDashboardMatrix();
    }, [authToken]);

    if (isLoading) {
        return <div className="text-text-primary text-center p-24 font-mono text-md tracking-widest bg-transparent min-h-screen">LOADING SYSTEM MONITOR MATRIX...</div>;
    }

    const filteredIncidents = filterType === 'ALL'
        ? activeIncidents
        : activeIncidents.filter(inc => inc.type.startsWith(filterType));

    return (
        <div className="w-full min-h-screen bg-transparent text-text-primary font-mono p-6 space-y-6">

            {/* 📊 Upper Section: Real-Time Pipeline Metric Cards (The 5 Tiers) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* Tier 1: Citizens */}
                <div className="border border-white/10 bg-surface-container p-4 flex flex-col justify-between glass-card">
                    <div className="flex justify-between items-center text-[14px] text-text-secondary font-bold uppercase tracking-wider">
                        <span>P2P Citizens</span>
                        <VerificationBadge type="citizen" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-text-primary">{pipelineStats.active_citizens_p2p}</div>
                        <p className="text-[14px] text-text-secondary/90 mt-1">ACTIVE DISTRICT NODES</p>
                    </div>
                </div>

                {/* Tier 2: Activists */}
                <div className="border border-white/10 bg-surface-container p-4 flex flex-col justify-between glass-card">
                    <div className="flex justify-between items-center text-[14px] text-text-secondary font-bold uppercase tracking-wider">
                        <span>Activist Juries</span>
                        <VerificationBadge type="activist" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-rose-500">{pipelineStats.pending_activist_juries}</div>
                        <p className="text-[14px] text-text-secondary/90 mt-1">ACTIVE BLIND JURIES</p>
                    </div>
                </div>

                {/* Tier 3: Journalists */}
                <div className="border border-white/10 bg-surface-container p-4 flex flex-col justify-between glass-card">
                    <div className="flex justify-between items-center text-[14px] text-text-secondary font-bold uppercase tracking-wider">
                        <span>Journalist Links</span>
                        <VerificationBadge type="journalist" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-teal-500">{pipelineStats.dead_journalist_links}</div>
                        <p className="text-[14px] text-text-secondary/90 mt-1">BROKEN 404 TIMEOUTS</p>
                    </div>
                </div>

                {/* Tier 4: Scholars */}
                <div className="border border-white/10 bg-surface-container p-4 flex flex-col justify-between glass-card">
                    <div className="flex justify-between items-center text-[14px] text-text-secondary font-bold uppercase tracking-wider">
                        <span>Scholar Audits</span>
                        <VerificationBadge type="scholar" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-emerald-500">{pipelineStats.flagged_scholars_audit}</div>
                        <p className="text-[14px] text-text-secondary/90 mt-1">ORCID DATA CONFLICTS</p>
                    </div>
                </div>

                {/* Tier 5: Organizations */}
                <div className="border border-white/10 bg-surface-container p-4 flex flex-col justify-between glass-card">
                    <div className="flex justify-between items-center text-[14px] text-text-secondary font-bold uppercase tracking-wider">
                        <span>Media Houses</span>
                        <VerificationBadge type="warned" />
                    </div>
                    <div className="mt-4">
                        <div className="text-2xl font-black text-yellow-500">{pipelineStats.warned_organizations}</div>
                        <p className="text-[14px] text-text-secondary/90 mt-1">PROBATION RETRACTIONS</p>
                    </div>
                </div>

            </div>

            {/* 🧭 Filtering Navigation Operations Toolbelt */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
                <div className="flex flex-wrap gap-2 bg-surface-container-low p-1 border border-white/5">
                    {['ALL', 'ACTIVIST', 'JOURNALIST', 'SCHOLAR', 'ORGANIZATION'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 text-md font-bold uppercase transition-all bg-transparent cursor-pointer ${filterType === type
                                ? 'bg-surface-container-high text-text-primary font-black border border-white/5'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="text-right text-[14px] text-text-secondary font-bold">
                    SYSTEM HEALTH: 100% OPERATIONAL • TIME SERVER: 2026-06-28
                </div>
            </div>

            {/* 🛠️ Lower Section: Active Operational Incident Stream Log */}
            <div className="border border-white/10 bg-surface-container p-6 glass-card">
                <div className="text-md font-bold text-text-secondary tracking-wider mb-4 uppercase">
                    Live Compliance & Integrity Activity Stream ({filteredIncidents.length})
                </div>

                {filteredIncidents.length === 0 ? (
                    <p className="text-md text-text-secondary/50 italic py-4">No active incident parameters match the selected filtering tier query.</p>
                ) : (
                    <div className="divide-y divide-white/5 border-t border-white/5">
                        {filteredIncidents.map((incident) => (
                            <div key={incident.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-md">
                                        <span className={`font-bold ${incident.color}`}>[{incident.type}]</span>
                                        <span className="text-text-primary font-bold">{incident.target}</span>
                                        <span className="text-[14px] font-bold px-1.5 py-0.5 bg-surface-container-low border border-white/5 text-text-secondary">
                                            ID: {incident.id}
                                        </span>
                                    </div>
                                    <p className="text-md text-text-secondary leading-normal font-sans">{incident.detail}</p>
                                </div>

                                <div className="flex items-center gap-4 justify-between sm:justify-end">
                                    <span className={`text-[14px] font-bold px-2 py-0.5 border ${incident.level === 'CRITICAL'
                                        ? 'bg-rose-950 border-rose-900/50 text-rose-400'
                                        : incident.level === 'HIGH'
                                            ? 'bg-yellow-950 border-yellow-900/50 text-yellow-400'
                                            : 'bg-surface-container-low border-white/5 text-text-secondary'
                                        }`}>
                                        {incident.level}
                                    </span>

                                    <button className="text-md font-bold border border-white/5 hover:border-white/10 px-3 py-1 bg-surface-container-high text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                                        LAUNCH INSPECTION TERMINAL
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default UnifiedAdminDashboard;
