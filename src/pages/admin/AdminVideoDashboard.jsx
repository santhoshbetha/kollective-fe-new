import { useState, useEffect } from 'react';

// Verify first 3 unsers in a constituency
// It allows an administrator to run the live video verification protocol, 
// inspect digital proof of residency, and hit Elixir /bootstrap-seed endpoint 
// to anchor a new legislative district once a candidate passes the check

const AdminVideoDashboard = ({ authToken: propAuthToken }) => {
    // Application Data States
    const [candidateList, setCandidateList] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [districtInput, setDistrictInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);

    const authToken = propAuthToken || 'mock-user-jwt';
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1/admin/civic';

    // Mock initial queue data representing users awaiting a remote video call
    useEffect(() => {
        setCandidateList([
            { id: 101, username: "labor_organizer_alpha", location_claimed: "District 12", proof_submitted: "Utility Bill / Union Badge" },
            { id: 102, username: "community_lead_beta", location_claimed: "District 45", proof_submitted: "Municipal Lease Record" },
        ]);
    }, []);

    const handleBootstrapSeedNode = async (e) => {
        e.preventDefault();
        if (!activeSession || !districtInput.trim()) return;

        setIsSubmitting(true);
        setApiResponse(null);

        try {
            const response = await fetch(`${API_BASE_URL}/bootstrap-seed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    user_id: activeSession.id,
                    constituency_id: districtInput.trim().toLowerCase().replace(/\s+/g, '_')
                })
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || "Bootstrap validation rejected by transaction pipeline.");
            }

            setApiResponse({ type: 'SUCCESS', message: resData.message });
            // Remove verified user from queue list
            setCandidateList(prev => prev.filter(c => c.id !== activeSession.id));
            setTimeout(() => {
                setActiveSession(null);
                setDistrictInput('');
                setApiResponse(null);
            }, 3000);

        } catch (err) {
            setApiResponse({ type: 'ERROR', message: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto bg-transparent text-text-primary font-mono p-6 min-h-[80vh] flex flex-col md:flex-row gap-6">
            {/* Left Column: Candidate Verification Queue */}
            <div className="w-full md:w-1/3 border border-white/10 bg-surface-container p-4 flex flex-col glass-card">
                <div className="text-rose-500 text-md font-bold tracking-wider mb-2">⚡ SEED ENTRY BOOTSTRAP PIPELINE</div>
                <h2 className="text-lg font-black uppercase mb-4 border-b border-white/5 pb-2 text-text-primary">Verification Queue</h2>

                {candidateList.length === 0 ? (
                    <p className="text-xs text-text-secondary/50 italic">No incoming remote stream requests pending audit logs.</p>
                ) : (
                    <div className="space-y-3 overflow-y-auto flex-1">
                        {candidateList.map(candidate => (
                            <div
                                key={candidate.id}
                                onClick={() => !isSubmitting && setActiveSession(candidate)}
                                className={`p-3 border cursor-pointer transition-colors rounded-none ${activeSession?.id === candidate.id
                                    ? 'border-rose-500 bg-rose-950/10'
                                    : 'border-white/5 bg-surface-container-low hover:border-white/20'
                                    }`}
                            >
                                <div className="text-lg font-bold text-text-primary">@{candidate.username}</div>
                                <div className="text-[16px] text-text-secondary mt-1">Claimed: {candidate.location_claimed}</div>
                                <div className="text-[15px] text-text-secondary/70 truncate mt-0.5 font-sans">Proof: {candidate.proof_submitted}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Live Audit Interactive Terminal Monitor */}
            <div className="w-full md:w-2/3 border border-white/10 bg-surface-container p-6 flex flex-col justify-between glass-card">
                {activeSession ? (
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            {/* Session Identification Meta Row */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4 text-md text-text-secondary">
                                <span>INCIDENT AUDIT: SECURE_VIDEO_SESSION_#{activeSession.id}</span>
                                <span className="text-emerald-500 dark:text-emerald-400 font-bold animate-pulse">● LIVE CONNECTION ACTIVE</span>
                            </div>

                            {/* Central Video Framework Layout Component Screen */}
                            <div className="w-full h-64 bg-surface-container-low border border-white/10 flex items-center justify-center relative mb-6">
                                <div className="text-center space-y-2">
                                    <div className="text-md text-text-secondary font-bold uppercase tracking-widest">[ USER FEED STREAM OVERLAY ]</div>
                                    <div className="text-lg text-text-secondary/60 italic font-sans">Inspecting profile documents: {activeSession.proof_submitted}</div>
                                </div>
                                {/* Embedded absolute admin pip indicator camera view */}
                                <div className="absolute bottom-3 right-3 w-24 h-16 bg-surface-container-high border border-white/5 flex items-center justify-center text-[14px] text-text-secondary font-bold">
                                    ADMIN_FEED
                                </div>
                            </div>

                            {/* User Claimed Residency Data Review */}
                            <div className="bg-surface-container-low border border-white/5 p-4 mb-6 text-md text-text-secondary space-y-1">
                                <div>TARGET IDENTITY USERNAME: <span className="text-text-primary font-bold">@{activeSession.username}</span></div>
                                <div>CLAIMED LEGISLATIVE ASSIGNMENT: <span className="text-text-primary font-bold">{activeSession.location_claimed}</span></div>
                                <div>SUBMITTED VERIFICATION METRIC: <span className="text-text-primary font-bold">{activeSession.proof_submitted}</span></div>
                            </div>
                        </div>

                        {/* Decision & Override Post Submission Interface Action Form */}
                        <form onSubmit={handleBootstrapSeedNode} className="border-t border-dashed border-white/5 pt-4">
                            <div className="mb-4">
                                <label className="block text-md text-text-secondary font-bold mb-2 uppercase">
                                    Assign Immutable Legislative Zone ID (Rule of 3 Limit Enforced):
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={isSubmitting}
                                    value={districtInput}
                                    onChange={(e) => setDistrictInput(e.target.value)}
                                    placeholder="e.g., assembly_district_12 or state_senate_4"
                                    className="w-full bg-surface-container-low border border-white/10 p-3 text-md focus:outline-none focus:border-rose-500 text-text-primary placeholder-text-text-secondary/30"
                                />
                            </div>

                            {apiResponse && (
                                <div className={`text-xs font-bold p-3 border mb-4 text-center ${apiResponse.type === 'SUCCESS'
                                    ? 'border-emerald-900 bg-emerald-950/20 text-emerald-400'
                                    : 'border-rose-900 bg-rose-950/20 text-rose-400'
                                    }`}>
                                    {apiResponse.type === 'SUCCESS' ? '✓' : '⚠️'} {apiResponse.message}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={!districtInput.trim() || isSubmitting}
                                    className={`flex-1 p-3 font-bold text-md bg-rose-600 text-white uppercase tracking-wider transition-opacity cursor-pointer ${(!districtInput.trim() || isSubmitting) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-rose-500'
                                        }`}
                                >
                                    {isSubmitting ? 'EXECUTING ATOMIC BOOTSTRAP OVERRIDE...' : 'AUTHORIZE ROOT SEED STATUS (TIER 1)'}
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => { setActiveSession(null); setDistrictInput(''); setApiResponse(null); }}
                                    className="p-3 font-bold text-md border border-white/5 bg-surface-container-high text-text-secondary hover:text-text-primary uppercase transition-colors cursor-pointer"
                                >
                                    CLOSE CALL
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary/40 p-12">
                        <div className="text-4xl mb-4">📺</div>
                        <div className="text-lg font-bold uppercase tracking-wider mb-1">No Active Audit Stream Selected</div>
                        <div className="text-md max-w-sm leading-normal font-sans">
                            Select an unverified observer applicant profile from the left queue index to launch a encrypted real-time video verification call session.
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminVideoDashboard;