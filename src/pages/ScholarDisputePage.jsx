import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScholarDisputePortal from '../components/ScholarDisputePortal';
import { ModerationAppealForm } from '../features/moderation/components/ModerationAppealForm';
import { useAuthStore } from '../store/auth/useAuthStore';
import { Scale } from 'lucide-react';

const ScholarDisputePage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [isAppealFormOpen, setIsAppealFormOpen] = useState(false);

    // Check if user has active dispute context
    const hasDispute = user && (user.badge_type === 'scholar' || user.badge_type === 'citizen');

    // Simulate dispute token (fallback to user jwt)
    const disputeToken = localStorage.getItem("user_token") || "mock-dispute-jwt";

    const handleDisputeSubmitted = () => {
        alert("Your reinstatement petition has been successfully logged to the system stream.");
        navigate(`/profile/${user.handle?.replace('@', '') || 'scholar_proof_1'}`);
    };

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col gap-6 text-left">
            <div className="flex justify-start">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back
                </button>
            </div>

            {/* General Content Soft-Delete Dispute Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#141414] shadow-xl space-y-4 font-sans">
                <div className="flex items-center gap-2.5 text-primary-container">
                    <Scale className="w-5 h-5 stroke-[2.5px]" />
                    <h3 className="text-base font-bold text-white tracking-tight">Content Soft-Delete & Governance Dispute</h3>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    If your publication, statement, or comment was soft-deleted or removed by regional or automated moderation, you can submit a formal dispute signature to the Sovereign Governance matrix.
                </p>
                <div className="pt-1">
                    <button
                        type="button"
                        onClick={() => setIsAppealFormOpen(true)}
                        className="px-5 py-2.5 bg-primary-container text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none shadow-md flex items-center gap-2"
                    >
                        <Scale className="w-4 h-4 stroke-[2.5px]" />
                        <span>Open Dispute Appeal Form</span>
                    </button>
                </div>
            </div>

            {/* Scholar Status Dispute Portal */}
            {hasDispute && (
                <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                        Academic / ORCID Reinstatement Portal
                    </div>
                    <ScholarDisputePortal
                        disputeToken={disputeToken}
                        onDisputeSubmitted={handleDisputeSubmitted}
                    />
                </div>
            )}

            <ModerationAppealForm
                isOpen={isAppealFormOpen}
                onClose={() => setIsAppealFormOpen(false)}
            />
        </div>
    );
};

export default ScholarDisputePage;
