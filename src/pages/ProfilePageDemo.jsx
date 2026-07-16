import { useState } from 'react';
import ScholarProfileCard from '../components/ScholarProfileCard';

const ProfilePageDemo = () => {
    const [disputeMode, setDisputeMode] = useState(false);

    // Mock data structure modeled precisely to match your Elixir Seeds script outputs
    const mockScholarUser = {
        username: "scholar_proof_1",
        bio: "Professor of Political Economy specializing in labor strike macro-trends and union density datasets.",
        badge_type: disputeMode ? "citizen" : "Scholar",
        metadata: {
            orcid_id: "0000-0002-1825-0001",
            under_investigation: disputeMode,
            dispute_token: "mock-dispute-jwt",
            publication_count: 14,
            recent_publications: [
                "Union Density and Automation Offsets in Heavy Manufacturing (2025)",
                "Comparative Strike Tariffs: A Multi-district Longitudinal Survey (2026)"
            ]
        }
    };

    return (
        <div className="min-h-[70vh] bg-transparent flex flex-col items-center justify-center p-4 gap-6">
            <div className="flex gap-4">
                <button
                    onClick={() => setDisputeMode(false)}
                    className={`px-4 py-2 text-xs font-mono font-bold transition-all border cursor-pointer ${!disputeMode
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-surface-container text-text-secondary border-white/5 hover:text-text-primary"
                        }`}
                >
                    Verified Scholar View
                </button>
                <button
                    onClick={() => setDisputeMode(true)}
                    className={`px-4 py-2 text-xs font-mono font-bold transition-all border cursor-pointer ${disputeMode
                            ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                            : "bg-surface-container text-text-secondary border-white/5 hover:text-text-primary"
                        }`}
                >
                    Disputed / Downgraded View
                </button>
            </div>
            <ScholarProfileCard profileData={mockScholarUser} />
        </div>
    );
};

export default ProfilePageDemo;
