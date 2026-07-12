import { useNavigate } from 'react-router-dom';
import ScholarDisputePortal from '../components/ScholarDisputePortal';
import { useAuthStore } from '../store/auth/useAuthStore';

const ScholarDisputePage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    // Check if user has active dispute context
    const hasDispute = user && (user.badge_type === 'scholar' || user.badge_type === 'citizen');

    // Simulate dispute token (fallback to user jwt)
    const disputeToken = localStorage.getItem("user_token") || "mock-dispute-jwt";

    const handleDisputeSubmitted = () => {
        alert("Your reinstatement petition has been successfully logged to the system stream.");
        navigate(`/profile/${user.handle?.replace('@', '') || 'scholar_proof_1'}`);
    };

    if (!hasDispute) {
        return (
            <div className="max-w-xl mx-auto p-12 text-center font-mono border border-white/5 bg-surface-container glass-card">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">gavel</span>
                <h2 className="text-xl font-bold text-text-primary mb-2 uppercase">Access Restricted</h2>
                <p className="text-sm text-text-secondary leading-relaxed mb-6 font-sans">
                    No active compliance dispute parameters match your account profile connection records.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2.5 bg-surface-container-high border border-white/5 text-text-primary text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                    Return to Feed
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
            <div className="flex justify-start">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Profile
                </button>
            </div>

            <ScholarDisputePortal
                disputeToken={disputeToken}
                onDisputeSubmitted={handleDisputeSubmitted}
            />
        </div>
    );
};

export default ScholarDisputePage;
