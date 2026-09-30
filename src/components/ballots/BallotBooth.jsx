import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BallotBooth = ({ applicationId, authToken: propAuthToken, onVoteSuccess, onCancel }) => {
    const navigate = useNavigate();
    const [selectedVote, setSelectedVote] = useState(''); // 'approve' or 'reject'
    const [evidenceData, setEvidenceData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [errorResponse, setErrorResponse] = useState(null); // Captures API contract codes

    const authToken = propAuthToken || 'mock-user-jwt';
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

    // 1. Fetch application details (Evidence statement & media attachments)
    useEffect(() => {
        const fetchApplicationDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/voting/applications/${applicationId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to load case files.');
                }

                const data = await response.json();
                setEvidenceData(data.data);
            } catch (err) {
                setErrorResponse({ message: err.message, code: 'FETCH_ERROR' });
            } finally {
                setFetchLoading(false);
            }
        };

        fetchApplicationDetails();
    }, [applicationId, authToken, API_BASE_URL]);

    // 2. Submit ballot data structure to backend endpoint
    const handleBallotSubmit = async (e) => {
        e.preventDefault();
        if (!selectedVote) return;

        setIsSubmitting(true);
        setErrorResponse(null);

        try {
            const response = await fetch(`${API_BASE_URL}/voting/applications/${applicationId}/votes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ vote: selectedVote })
            });

            const resData = await response.json();

            if (!response.ok) {
                setErrorResponse({
                    code: resData.code || 'UNKNOWN_ERROR',
                    message: resData.message || 'Transaction rejected by server.'
                });
                setIsSubmitting(false);
                return;
            }

            onVoteSuccess(resData);
        } catch (err) {
            setErrorResponse({
                code: 'NETWORK_FAILURE',
                message: 'Lost connection to decentralized validation protocol.'
            });
            setIsSubmitting(false);
        }
        navigate('/home')
    };

    if (fetchLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center text-rose-500 font-mono tracking-widest bg-transparent">
                DECRYPTING ENCRYPTED EVIDENCE PIECES...
            </div>
        );
    }

    // Error layout addressing lifecycle locks (Expired/Resolved early)
    if (errorResponse && ['APPLICATION_EXPIRED', 'APPLICATION_ALREADY_RESOLVED', 'DUPLICATE_BALLOT'].includes(errorResponse.code)) {
        return (
            <div className="flex p-4 items-center justify-center min-h-[70vh] font-mono text-text-primary">
                <div className="border border-rose-500/30 bg-rose-500/10 p-6 max-w-[500px] text-center glass-card">
                    <div className="text-rose-500 font-bold text-sm mb-3">⚠️ ACCESS RESTRICTED: VOTE CONCLUDED</div>
                    <p className="text-text-secondary text-sm leading-relaxed mb-5">{errorResponse.message}</p>
                    <button
                        className="bg-surface-container-high border border-white/5 hover:border-white/10 text-text-primary px-6 py-3 cursor-pointer font-mono text-sm tracking-wider uppercase"
                        onClick={onCancel}
                    >
                        RETURN TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex p-4 items-center justify-center min-h-[70vh] font-monoX text-text-primary">
            <div className="border border-white/10 bg-surface-container p-8 max-w-[650px] w-full glass-card">
                <div className="text-rose-500 text-lg font-bold tracking-wider mb-2">🔴 CITIZEN PEER REVIEW BOOTH</div>
                <h1 className="text-2xl font-black mb-4 uppercase tracking-tight text-text-primary">CASE FILE #{applicationId}</h1>
                <p className="text-lg text-text-secondary leading-relaxed mb-6 font-sans">
                    Review the operational evidence below. Cast your blind vote to authorize or deny the <b>Signal Red Frontline Activist Badge</b>.
                </p>

                {/* Evidence Content Section */}
                <div className="bg-surface-container-low border-l-4 border-rose-500 p-4 mb-6">
                    <h3 className="text-md text-text-secondary font-bold tracking-wider mb-2 uppercase">STATEMENT OF WORKPLACE / COMMUNITY ACTION:</h3>
                    <p className="text-lg text-text-primary leading-relaxed whitespace-pre-wrap font-sans">
                        {evidenceData?.evidence_text || "No accompanying statement found inside payload structure."}
                    </p>

                    {evidenceData?.evidence_media_urls && evidenceData.evidence_media_urls.length > 0 && (
                        <div className="mt-4 border-t border-dashed border-white/5 pt-3">
                            <h4 className="text-md text-text-secondary font-bold tracking-wider mb-2 uppercase">SECURED ATTACHMENTS (METADATA STRIPPED):</h4>
                            <ul className="m-0 pl-5 list-disc text-text-secondary space-y-1">
                                {evidenceData.evidence_media_urls.map((url, idx) => (
                                    <li key={idx}>
                                        <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline hover:text-blue-400 text-md">
                                            [View Evidence Leak Asset #{idx + 1}]
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Standard API Error Fallback Alert */}
                {errorResponse && (
                    <div className="text-rose-500 font-bold text-xs mb-4">
                        ERROR ({errorResponse.code}): {errorResponse.message}
                    </div>
                )}

                {/* Voting Form */}
                <form onSubmit={handleBallotSubmit}>
                    <div className="flex flex-col gap-3 mb-6">
                        <label className={`flex items-center p-4 border cursor-pointer bg-surface-container-low transition-all active:scale-[0.99] ${selectedVote === 'approve' ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/10'
                            }`}>
                            <input
                                type="radio"
                                name="ballot"
                                value="approve"
                                checked={selectedVote === 'approve'}
                                onChange={(e) => setSelectedVote(e.target.value)}
                                disabled={isSubmitting}
                                className="mr-3 cursor-pointer accent-teal-600 w-4 h-4"
                            />
                            <span className={`font-bold text-md tracking-wide ${selectedVote === 'approve' ? 'text-teal-400' : 'text-text-secondary'}`}>
                                ✊ VOTE: AUTHORIZE BADGE
                            </span>
                        </label>

                        <label className={`flex items-center p-4 border cursor-pointer bg-surface-container-low transition-all active:scale-[0.99] ${selectedVote === 'reject' ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10'
                            }`}>
                            <input
                                type="radio"
                                name="ballot"
                                value="reject"
                                checked={selectedVote === 'reject'}
                                onChange={(e) => setSelectedVote(e.target.value)}
                                disabled={isSubmitting}
                                className="mr-3 cursor-pointer accent-rose-600 w-4 h-4"
                            />
                            <span className={`font-bold text-md tracking-wide ${selectedVote === 'reject' ? 'text-rose-400' : 'text-text-secondary'}`}>
                                ❌ VOTE: DENY APPLICATION
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={!selectedVote || isSubmitting}
                            className={`flex-1 p-3 font-bold text-md bg-rose-600 text-white uppercase tracking-wider transition-opacity cursor-pointer ${(!selectedVote || isSubmitting) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-rose-500'
                                }`}
                        >
                            {isSubmitting ? 'TRANSMITTING ENCRYPTED BALLOT...' : 'SUBMIT SECURE BALLOT'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="bg-surface-container-high border border-white/5 text-text-secondary hover:text-text-primary px-6 py-3 cursor-pointer 
                            font-mono text-md tracking-wider uppercase"
                        >
                            ABSTAIN & EXIT
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BallotBooth;
