import { useState, useEffect } from 'react';

const ScholarDisputePortal = ({ disputeToken, onDisputeSubmitted }) => {
    const [incidentData, setIncidentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appealText, setAppealText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uiError, setUiError] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

    // 1. Authenticate token and extract target incident logs on mount
    useEffect(() => {
        const fetchIncidentContext = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/compliance/my-incident`, {
                    headers: { 'Authorization': `Bearer ${disputeToken}` }
                });
                if (!response.ok) throw new Error('Compliance token expired or invalid.');

                const resData = await response.json();
                setIncidentData(resData.data);
            } catch (err) {
                setUiError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchIncidentContext();
    }, [disputeToken, API_BASE_URL]);

    // 2. Submit formal dispute text package
    const handleDisputeSubmit = async (e) => {
        e.preventDefault();
        if (!appealText.trim()) return;

        setIsSubmitting(true);
        setUiError('');

        try {
            const response = await fetch(`${API_BASE_URL}/compliance/incidents/${incidentData.id}/dispute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${disputeToken}`
                },
                body: JSON.stringify({ statement: appealText })
            });

            if (!response.ok) throw new Error('Failed to transmit statement to the board.');

            onDisputeSubmitted();
        } catch (err) {
            setUiError(err.message);
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-text-primary text-center p-12 font-mono">DECRYPTING SECURITY NOTICE WRAPPERS...</div>;
    if (uiError) return <div className="text-rose-500 text-center p-12 font-mono">⚠️ INVALID TOKEN: {uiError}</div>;

    return (
        <div className="w-full max-w-xl border border-yellow-600/30 bg-surface-container p-8 font-mono text-text-primary glass-card">
            <div className="text-yellow-500 text-xs font-bold tracking-wider mb-2">⚖️ COMPLIANCE APPEAL WORKSPACE</div>
            <h2 className="text-2xl font-black mb-4 uppercase">Dispute System Freeze</h2>

            {/* Informative Warning Banner */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 mb-6 text-xs leading-relaxed text-yellow-600 dark:text-yellow-400">
                <b>INCIDENT DETECTED:</b> {incidentData?.flag_reason || "Publication drop discrepancy."}
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs text-text-secondary font-bold mb-2 uppercase">
                        Provide Written Statement or Institutional Proof Link:
                    </label>
                    <textarea
                        required
                        rows="6"
                        value={appealText}
                        onChange={(e) => setAppealText(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Explain the public registry data changes (e.g., repository migration, profile merger, or visibility adjustments)..."
                        className="w-full bg-surface-container-low border border-white/10 p-3 text-sm focus:outline-none focus:border-yellow-500 text-text-primary placeholder-text-text-secondary/30 font-sans"
                    />
                </div>

                <div className="text-[10px] text-text-secondary leading-normal">
                    By submitting this document, you petition the randomized community moderation panel to execute a manual override audit of your ORCID metadata configuration layer.
                </div>

                <button
                    type="submit"
                    disabled={!appealText.trim() || isSubmitting}
                    className={`w-full p-3 font-bold text-sm bg-yellow-600 text-black uppercase tracking-wider transition-opacity cursor-pointer ${(!appealText.trim() || isSubmitting) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-yellow-500'
                        }`}
                >
                    {isSubmitting ? 'TRANSMITTING APPEAL PACKAGE...' : 'SUBMIT REINSTATEMENT PETITION'}
                </button>
            </form>
        </div>
    );
};

export default ScholarDisputePortal;
