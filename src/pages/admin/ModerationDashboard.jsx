import { useState, useEffect } from 'react';
import AdminIncidentPanel from './AdminIncidentPanel';

const ModerationDashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filter, setFilter] = useState("open"); // "open", "resolved", "firewall", "scholars"

    // Scholar integrity incident states
    const [scholarIncidents, setScholarIncidents] = useState([]);
    const [selectedScholarIncident, setSelectedScholarIncident] = useState(null);

    useEffect(() => {
        if (filter === "firewall") return;

        if (filter === "scholars") {
            fetch('/api/v1/admin/incidents', {
                headers: { "Authorization": `Bearer ${localStorage.getItem("user_token")}` }
            })
                .then(res => res.json())
                .then(json => {
                    const list = json.data || [];
                    setScholarIncidents(list);
                    if (list.length > 0) {
                        setSelectedScholarIncident(list[0]);
                    } else {
                        setSelectedScholarIncident(null);
                    }
                });
            return;
        }

        fetch(`/api/v1/admin/reports?status=${filter}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("user_token")}` }
        })
            .then(res => res.json())
            .then(json => {
                const list = json.data || [];
                setIncidents(list);
                if (list.length > 0) {
                    setSelectedTicket(list[0]);
                } else {
                    setSelectedTicket(null);
                }
            });
    }, [filter]);

    const handleAction = async (actionType) => {
        if (!selectedTicket) return;

        const res = await fetch(`/api/v1/admin/reports/${selectedTicket.id}/resolve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("user_token")}`
            },
            body: JSON.stringify({ action: actionType, notes: "Processed via Operations Desk UI Dashboard." })
        });

        if (res.ok) {
            // Evict the ticket immediately out of local memory state
            const updated = incidents.filter(i => i.id !== selectedTicket.id);
            setIncidents(updated);
            setSelectedTicket(updated[0] || null);
        }
    };

    const handleScholarActionComplete = (incidentId, actionType) => {
        // Evict the scholar incident immediately out of local memory state
        const updated = scholarIncidents.filter(i => i.incident_id !== incidentId);
        setScholarIncidents(updated);
        setSelectedScholarIncident(updated[0] || null);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 text-scale-large">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-2 text-primary-container mb-2">
                    <span className="material-symbols-outlined text-[24px]">gavel</span>
                    <span className="text-xs font-mono uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 border border-primary-container/20">Operations Clearance</span>
                </div>
                <h1 className="font-display-lg text-3xl font-extrabold text-text-primary mb-2">Operations Desk</h1>
                <p className="font-body-md text-xl font-semibold text-text-secondary">
                    Monitor compliance alerts, investigate reports, and execute mitigation policies.
                </p>
            </header>

            {/* Sub-navigation tabs */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-white/5 mb-8">
                {[
                    { label: "🚨 Active Incidents", value: "open" },
                    { label: "✅ Audit Trail History", value: "resolved" },
                    { label: "🔬 Scholar Audits", value: "scholars" },
                    { label: "🔥 In-Memory Firewall", value: "firewall" }
                ].map((tab) => {
                    const isActive = filter === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-6 py-2 transition-all duration-200 whitespace-nowrap border text-label-sm cursor-pointer ${
                                isActive
                                    ? 'bg-primary-container text-white border-primary-container crimson-glow'
                                    : 'bg-surface-container-high text-text-secondary border-white/5 hover:border-white/10 hover:text-text-primary'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {filter !== "firewall" && filter !== "scholars" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Tickets list (takes 2/3 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4">
                            <h3 className="font-label-md text-sm font-bold text-text-secondary uppercase tracking-wider">
                                Ticket Queue ({incidents.length} Pending)
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {incidents.length > 0 ? (
                                incidents.map(ticket => {
                                    const isSelected = selectedTicket?.id === ticket.id;
                                    return (
                                        <div
                                            key={ticket.id}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className={`glass-card p-6 border cursor-pointer transition-all ${
                                                isSelected 
                                                    ? "border-primary-container/80 bg-surface-container-high/40 shadow-md" 
                                                    : "border-white/10 bg-surface-ink hover:border-white/20"
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm font-bold font-mono text-primary-container tracking-wider uppercase bg-primary-container/5 px-2 py-0.5 border border-primary-container/10">
                                                    ⚠️ {ticket.category}
                                                </span>
                                                <span className="text-xs text-text-secondary font-mono">ID: {ticket.id}</span>
                                            </div>

                                            <p className="text-lg font-semibold text-text-primary leading-snug line-clamp-2 mb-4">
                                                "{ticket.preview_text}"
                                            </p>

                                            <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3 text-text-secondary">
                                                <div>
                                                    Reporter: <span className="text-text-primary font-bold font-mono">@{ticket.reporter}</span>
                                                </div>
                                                <div>
                                                    Target: <span className="text-primary-container font-bold font-mono">@{ticket.target_account}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="glass-card bg-surface-ink border border-white/10 p-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-text-secondary mb-3">verified</span>
                                    <h4 className="font-bold text-text-primary mb-1">Queue Clear</h4>
                                    <p className="text-sm text-text-secondary">No tickets matched this filter status. Operations optimal.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Administrative Actions Panel */}
                    <div className="lg:col-span-1">
                        <section className="glass-card bg-surface-ink border border-white/10 p-6 space-y-6 flex flex-col justify-between min-h-[400px]">
                            {selectedTicket ? (
                                <div className="space-y-6 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                                            <h3 className="font-label-md text-sm font-bold text-text-secondary uppercase tracking-wider">
                                                Incident Content
                                            </h3>
                                            <span className="text-xs font-mono bg-primary-container/5 text-primary-container px-2 py-0.5 border border-primary-container/10">
                                                {selectedTicket.id}
                                            </span>
                                        </div>
                                        
                                        <div className="p-4 bg-surface-container-low border border-white/5 rounded-xl font-mono text-sm leading-relaxed text-text-primary">
                                            "{selectedTicket.preview_text}"
                                        </div>

                                        <div className="text-xs text-text-secondary space-y-1 bg-surface-container-low/30 p-3 rounded-lg border border-white/5">
                                            <div>Reporter: <span className="text-text-primary font-bold">@{selectedTicket.reporter}</span></div>
                                            <div>Target Account: <span className="text-primary-container font-bold">@{selectedTicket.target_account}</span></div>
                                            <div>Category: <span className="text-text-primary font-semibold">{selectedTicket.category}</span></div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <h4 className="font-label-md text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                                            Mitigation Protocol
                                        </h4>
                                        <button 
                                            onClick={() => handleAction("soft_delete")} 
                                            className="w-full py-3 bg-surface-container-high border border-white/10 hover:bg-surface-container-highest text-text-primary font-bold transition-all cursor-pointer text-center block"
                                        >
                                            Hide Content (Soft Delete)
                                        </button>
                                        <button 
                                            onClick={() => handleAction("shadow_ban")} 
                                            className="w-full py-3 bg-surface-container-high border border-gold-muted/40 hover:border-gold-muted/80 text-gold-muted font-bold transition-all cursor-pointer text-center block"
                                        >
                                            Quarantine Actor (Shadow-ban)
                                        </button>
                                        <button 
                                            onClick={() => handleAction("hard_ban")} 
                                            className="w-full py-3 bg-primary-container hover:brightness-110 text-white font-bold transition-all crimson-glow cursor-pointer text-center block"
                                        >
                                            Terminate Account (Hard Ban)
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleAction("dismiss")} 
                                            className="w-full py-2.5 bg-surface-container-low hover:bg-surface-container-high text-text-secondary font-bold border border-white/5 transition-all mt-4 cursor-pointer text-center block"
                                        >
                                            Dismiss False Flag
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-text-secondary gap-3">
                                    <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wider font-mono">No incident selected</p>
                                        <p className="text-xs max-w-[200px] mt-1 text-text-secondary font-sans">Select an active ticket from the queue list to trigger mitigations.</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}

            {filter === "scholars" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Scholar Integrity Queue */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4">
                            <h3 className="font-label-md text-sm font-bold text-text-secondary uppercase tracking-wider">
                                Scholar Integrity Queue ({scholarIncidents.length} Pending)
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {scholarIncidents.length > 0 ? (
                                scholarIncidents.map(incident => {
                                    const isSelected = selectedScholarIncident?.incident_id === incident.incident_id;
                                    return (
                                        <div
                                            key={incident.incident_id}
                                            onClick={() => setSelectedScholarIncident(incident)}
                                            className={`glass-card p-6 border cursor-pointer transition-all ${
                                                isSelected 
                                                    ? "border-emerald-500/80 bg-surface-container-high/40 shadow-md" 
                                                    : "border-white/10 bg-surface-ink hover:border-white/20"
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm font-bold font-mono text-emerald-500 tracking-wider uppercase bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10">
                                                    🔬 {incident.security_flag.type}
                                                </span>
                                                <span className="text-xs text-text-secondary font-mono">ID: {incident.incident_id}</span>
                                            </div>

                                            <p className="text-lg font-semibold text-text-primary leading-snug line-clamp-2 mb-4">
                                                "{incident.security_flag.description}"
                                            </p>

                                            <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3 text-text-secondary">
                                                <div>
                                                    Account Profile: <span className="text-text-primary font-bold font-mono">@{incident.target_user.username}</span>
                                                </div>
                                                <div>
                                                    ORCID Index: <span className="text-emerald-500 font-bold font-mono">{incident.audit_payload.orcid_id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="glass-card bg-surface-ink border border-white/10 p-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-text-secondary mb-3">verified</span>
                                    <h4 className="font-bold text-text-primary mb-1">Queue Clear</h4>
                                    <p className="text-sm text-text-secondary">No scholar integrity audits flagged. Operations optimal.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: AdminIncidentPanel Container */}
                    <div className="lg:col-span-1">
                        {selectedScholarIncident ? (
                            <AdminIncidentPanel
                                incidentPayload={selectedScholarIncident}
                                onActionComplete={handleScholarActionComplete}
                            />
                        ) : (
                            <div className="glass-card bg-surface-ink border border-white/10 p-6 flex flex-col items-center justify-center text-center min-h-[400px] text-text-secondary gap-3">
                                <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wider font-mono">No incident selected</p>
                                    <p className="text-xs max-w-[200px] mt-1 text-text-secondary font-sans">Select an active scholar incident to review the integrity data manifest.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {filter === "firewall" && (
                <section className="glass-card bg-surface-ink border border-white/10 p-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-text-secondary mb-4">detector_status</span>
                    <h3 className="font-bold text-text-primary text-xl mb-2">In-Memory Firewall</h3>
                    <p className="text-text-secondary max-w-md mx-auto text-sm">
                        Real-time request analyzer, dynamic rate limiters, and malicious packet drops. Under construction.
                    </p>
                </section>
            )}
        </div>
    );
};

export default ModerationDashboard;
