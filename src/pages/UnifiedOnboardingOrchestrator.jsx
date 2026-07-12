import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '../components/VerificationBadge';
import JournalistOnboardingForm from '../components/JournalistOnboardingForm';
import ScholarOnboardingForm from '../components/ScholarOnboardingForm';
import { useUpdateUser } from '../features/profile/useProfileFeature';

const UnifiedOnboardingOrchestrator = ({ authToken: propAuthToken, onFlowComplete }) => {
    const navigate = useNavigate();
    const updateUserMutation = useUpdateUser();
    const authToken = propAuthToken || 'mock-user-jwt';

    // States: 'SELECTION', 'JOURNALIST_FLOW', 'SCHOLAR_FLOW', 'ACTIVIST_INFO', 'ORG_INFO'
    const [currentStep, setCurrentStep] = useState('SELECTION');

    const handleVerificationComplete = (finalBadgeType) => {
        // Map final badge type to badge_type schema keys
        const mappedBadge = finalBadgeType === 'ProfessionalTeal' ? 'journalist' : finalBadgeType.toLowerCase();
        updateUserMutation.mutate({ badge_type: mappedBadge });
        if (onFlowComplete) onFlowComplete(mappedBadge);
        navigate(-1);
    };

    const handleSkip = () => {
        updateUserMutation.mutate({ badge_type: 'citizen' });
        if (onFlowComplete) onFlowComplete('citizen');
        navigate(-1);
    };

    if (currentStep === 'JOURNALIST_FLOW') {
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh] p-4 gap-4">
                <div className="w-full max-w-md flex justify-start">
                    <button
                        onClick={() => setCurrentStep('SELECTION')}
                        className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Role Selection
                    </button>
                </div>
                <JournalistOnboardingForm
                    authToken={authToken}
                    onVerificationComplete={handleVerificationComplete}
                    onSkip={handleSkip}
                />
            </div>
        );
    }

    if (currentStep === 'SCHOLAR_FLOW') {
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh] p-4 gap-4">
                <div className="w-full max-w-md flex justify-start">
                    <button
                        onClick={() => setCurrentStep('SELECTION')}
                        className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Role Selection
                    </button>
                </div>
                <ScholarOnboardingForm
                    authToken={authToken}
                    onVerificationComplete={handleVerificationComplete}
                    onSkip={handleSkip}
                />
            </div>
        );
    }

    if (currentStep === 'ACTIVIST_INFO') {
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh] p-4 gap-4">
                <div className="w-full max-w-md flex justify-start">
                    <button
                        onClick={() => setCurrentStep('SELECTION')}
                        className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Role Selection
                    </button>
                </div>
                <div className="w-full max-w-md border border-rose-500/30 bg-surface-container p-8 font-mono text-text-primary glass-card">
                    <div className="text-rose-500 text-md font-bold tracking-wider mb-2">🔴 GRASSROOTS REBEL ACTION</div>
                    <h2 className="text-2xl font-black mb-4 uppercase text-text-primary">Frontline Verification</h2>
                    <p className="text-lg text-text-secondary leading-relaxed mb-6 font-sans">
                        Frontline badges cannot be bought or auto-verified via institutional logins.
                        To earn your red shield, you must submit proof of action inside the app dashboard
                        to be evaluated by a randomized, blind community jury of 12 peers.
                    </p>
                    <button
                        onClick={() => {
                            updateUser({ badge_type: 'activist' });
                            navigate(-1);
                        }}
                        className="w-full p-3 font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white uppercase tracking-wider cursor-pointer"
                    >
                        Request Activist Status & Return
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 'ORG_INFO') {
        return (
            <div className="flex flex-col justify-center items-center min-h-[70vh] p-4 gap-4">
                <div className="w-full max-w-md flex justify-start">
                    <button
                        onClick={() => setCurrentStep('SELECTION')}
                        className="flex items-center gap-2 text-md font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Role Selection
                    </button>
                </div>
                <div className="w-full max-w-md border border-amber-500/30 bg-surface-container p-8 font-mono text-text-primary glass-card">
                    <div className="text-amber-500 textmd font-bold tracking-wider mb-2">🏢 INSTITUTIONAL PRESS</div>
                    <h2 className="text-2xl font-black mb-4 uppercase text-text-primary">News Outlets</h2>
                    <p className="text-lg text-text-secondary leading-relaxed mb-6 font-sans">
                        Premium Gold badges are strictly reserved for verified public newsrooms, worker-led presses, and media houses.
                        Verification requires compliance tracking logs and direct coordination with our Legal Operations team.
                    </p>
                    <button
                        onClick={() => {
                            updateUser({ badge_type: 'organization' });
                            navigate(-1);
                        }}
                        className="w-full p-3 font-bold text-md bg-amber-600 hover:bg-amber-500 text-black uppercase tracking-wider cursor-pointer"
                    >
                        Mock Verify Organization & Return
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-[80vh] p-4 gap-4">
            <div className="w-full max-w-lg flex justify-start">
                <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Settings
                </button>
            </div>

            <div className="w-full max-w-lg border border-white/10 bg-surface-container p-8 font-mono text-text-primary glass-card">
                <div className="text-text-secondary text-md font-bold tracking-wider mb-2">ACCOUNT CLASSIFICATION</div>
                <h2 className="text-2xl font-black mb-6 uppercase text-text-primary">Choose Your Role</h2>

                <div className="flex flex-col gap-4">
                    {/* Choice 1: Standard Worker / Citizen */}
                    <div
                        onClick={handleSkip}
                        className="border border-white/5 bg-surface-container-low p-4 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors"
                    >
                        <div>
                            <div className="text-lg font-bold flex items-center gap-2 text-text-primary">
                                Citizen / Worker <VerificationBadge type="citizen" />
                            </div>
                            <p className="text-[16px] text-text-secondary mt-1 font-sans">Standard profile for everyday feed reading and community participation.</p>
                        </div>
                        <span className="text-text-secondary text-sm">➔</span>
                    </div>

                    {/* Choice 2: Field Journalist */}
                    <div
                        onClick={() => setCurrentStep('JOURNALIST_FLOW')}
                        className="border border-white/5 bg-surface-container-low p-4 flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors"
                    >
                        <div>
                            <div className="text-lg font-bold flex items-center gap-2 text-text-primary">
                                Independent Journalist <VerificationBadge type="journalist" />
                            </div>
                            <p className="text-[16px] text-text-secondary mt-1 font-sans">Field correspondents, independent reporters, and camera crews.</p>
                        </div>
                        <span className="text-text-secondary text-sm">➔</span>
                    </div>

                    {/* Choice 3: Academic Scholar */}
                    <div
                        onClick={() => setCurrentStep('SCHOLAR_FLOW')}
                        className="border border-white/5 bg-surface-container-low p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors"
                    >
                        <div>
                            <div className="text-lg font-bold flex items-center gap-2 text-text-primary">
                                Scholar / Researcher <VerificationBadge type="scholar" />
                            </div>
                            <p className="text-[16px] text-text-secondary mt-1 font-sans">Professors, researchers, data analysts, and economists.</p>
                        </div>
                        <span className="text-text-secondary text-sm">➔</span>
                    </div>

                    {/* Choice 4: Frontline Activist */}
                    <div
                        onClick={() => setCurrentStep('ACTIVIST_INFO')}
                        className="border border-white/5 bg-surface-container-low p-4 flex items-center justify-between cursor-pointer hover:border-rose-500 transition-colors"
                    >
                        <div>
                            <div className="text-lg font-bold flex items-center gap-2 text-text-primary">
                                Frontline Activist <VerificationBadge type="activist" />
                            </div>
                            <p className="text-[16px] text-text-secondary mt-1 font-sans">Union coordinators, strike leads, and grassroots organizers.</p>
                        </div>
                        <span className="text-text-secondary text-sm">➔</span>
                    </div>

                    {/* Choice 5: News Organization */}
                    <div
                        onClick={() => setCurrentStep('ORG_INFO')}
                        className="border border-white/5 bg-surface-container-low p-4 flex items-center justify-between cursor-pointer hover:border-amber-500 transition-colors"
                    >
                        <div>
                            <div className="text-lg font-bold flex items-center gap-2 text-text-primary">
                                News Organization <VerificationBadge type="organization" />
                            </div>
                            <p className="text-[16px] text-text-secondary mt-1 font-sans">Official institutional accounts for newsrooms and media houses.</p>
                        </div>
                        <span className="text-text-secondary text-sm">➔</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedOnboardingOrchestrator;
