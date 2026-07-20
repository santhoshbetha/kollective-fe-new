import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '../components/VerificationBadge';
import JournalistOnboardingForm from '../components/JournalistOnboardingForm';
import ScholarOnboardingForm from '../components/ScholarOnboardingForm';
import { useUpdateUser } from '../features/profile/useProfileFeature';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

// Shared container layout wrapper for sub-flow views
const FlowLayout = ({ onBack, backLabel = "Back to Role Selection", children, maxWidth = "max-w-md" }) => (
    <div className="flex flex-col justify-center items-center min-h-[70vh] p-4 gap-4 font-sans">
        <div className={cn("w-full flex justify-start", maxWidth)}>
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none outline-none"
            >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>{backLabel}</span>
            </button>
        </div>
        {children}
    </div>
);

const UnifiedOnboardingOrchestrator = ({ authToken: propAuthToken, onFlowComplete }) => {
    const navigate = useNavigate();
    const updateUserMutation = useUpdateUser();
    const authToken = propAuthToken || 'mock-user-jwt';

    // Available steps: 'SELECTION' | 'JOURNALIST_FLOW' | 'SCHOLAR_FLOW' | 'ACTIVIST_INFO' | 'ORG_INFO'
    const [currentStep, setCurrentStep] = useState('SELECTION');

    const handleVerificationComplete = (finalBadgeType) => {
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

    // --- SUB-FLOW: JOURNALIST ---
    if (currentStep === 'JOURNALIST_FLOW') {
        return (
            <FlowLayout onBack={() => setCurrentStep('SELECTION')}>
                <JournalistOnboardingForm
                    authToken={authToken}
                    onVerificationComplete={handleVerificationComplete}
                    onSkip={handleSkip}
                />
            </FlowLayout>
        );
    }

    // --- SUB-FLOW: SCHOLAR ---
    if (currentStep === 'SCHOLAR_FLOW') {
        return (
            <FlowLayout onBack={() => setCurrentStep('SELECTION')}>
                <ScholarOnboardingForm
                    authToken={authToken}
                    onVerificationComplete={handleVerificationComplete}
                    onSkip={handleSkip}
                />
            </FlowLayout>
        );
    }

    // --- SUB-FLOW: ACTIVIST ---
    if (currentStep === 'ACTIVIST_INFO') {
        return (
            <FlowLayout onBack={() => setCurrentStep('SELECTION')}>
                <div className="w-full max-w-md border border-error/40 bg-surface-container p-6 sm:p-8 rounded-card shadow-2xl font-sans text-text-primary">
                    <div className="text-error text-lg font-bold tracking-wider uppercase mb-2">
                        🔴 Grassroots Rebel Action
                    </div>
                    <h2 className="text-xl font-black mb-3 uppercase tracking-tight text-text-primary">
                        Frontline Verification
                    </h2>
                    <p className="text-lg text-text-secondary leading-relaxed mb-6">
                        Frontline badges cannot be bought or auto-verified via institutional logins.
                        To earn your red shield, you must submit proof of action inside the app dashboard
                        to be evaluated by a randomized, blind community jury of 12 peers.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            updateUserMutation.mutate({ badge_type: 'activist' });
                            if (onFlowComplete) onFlowComplete('activist');
                            navigate(-1);
                        }}
                        className="w-full p-3 font-bold text-lg bg-error hover:brightness-110 text-on-error uppercase tracking-wider rounded-card cursor-pointer transition-all active:scale-98 border-none"
                    >
                        Request Activist Status & Return
                    </button>
                </div>
            </FlowLayout>
        );
    }

    // --- SUB-FLOW: ORGANIZATION ---
    if (currentStep === 'ORG_INFO') {
        return (
            <FlowLayout onBack={() => setCurrentStep('SELECTION')}>
                <div className="w-full max-w-md border border-secondary/40 bg-surface-container p-6 sm:p-8 rounded-card shadow-2xl font-sans text-text-primary">
                    <div className="text-secondary text-lg font-bold tracking-wider uppercase mb-2">
                        🏢 Institutional Press
                    </div>
                    <h2 className="text-xl font-black mb-3 uppercase tracking-tight text-text-primary">
                        News Outlets
                    </h2>
                    <p className="text-lg text-text-secondary leading-relaxed mb-6">
                        Premium Gold badges are strictly reserved for verified public newsrooms, worker-led presses, and media houses.
                        Verification requires compliance tracking logs and direct coordination with our Legal Operations team.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            updateUserMutation.mutate({ badge_type: 'organization' });
                            if (onFlowComplete) onFlowComplete('organization');
                            navigate(-1);
                        }}
                        className="w-full p-3 font-bold text-lg bg-secondary hover:brightness-110 text-on-secondary-fixed uppercase tracking-wider rounded-card cursor-pointer transition-all active:scale-98 border-none"
                    >
                        Verify Organization & Return
                    </button>
                </div>
            </FlowLayout>
        );
    }

    // --- MAIN STEP: ROLE SELECTION ---
    const roles = [
        {
            id: 'CITIZEN',
            title: 'Citizen / Worker',
            type: 'citizen',
            description: 'Standard profile for everyday feed reading and community participation.',
            hoverBorder: 'hover:border-primary',
            onClick: handleSkip
        },
        {
            id: 'JOURNALIST',
            title: 'Independent Journalist',
            type: 'journalist',
            description: 'Field correspondents, independent reporters, and camera crews.',
            hoverBorder: 'hover:border-tertiary',
            onClick: () => setCurrentStep('JOURNALIST_FLOW')
        },
        {
            id: 'SCHOLAR',
            title: 'Scholar / Researcher',
            type: 'scholar',
            description: 'Professors, researchers, data analysts, and economists.',
            hoverBorder: 'hover:border-emerald-500',
            onClick: () => setCurrentStep('SCHOLAR_FLOW')
        },
        {
            id: 'ACTIVIST',
            title: 'Frontline Activist',
            type: 'activist',
            description: 'Union coordinators, strike leads, and grassroots organizers.',
            hoverBorder: 'hover:border-error',
            onClick: () => setCurrentStep('ACTIVIST_INFO')
        },
        {
            id: 'ORGANIZATION',
            title: 'News Organization',
            type: 'organization',
            description: 'Official institutional accounts for newsrooms and publishing collectives.',
            hoverBorder: 'hover:border-secondary',
            onClick: () => setCurrentStep('ORG_INFO')
        }
    ];

    return (
        <FlowLayout onBack={() => navigate('/settings')} backLabel="Back to Settings" maxWidth="max-w-lg">
            <div className="w-full max-w-lg border border-outline-variant bg-surface-container p-6 sm:p-8 rounded-card shadow-2xl font-sans text-text-primary">
                <div className="text-text-secondary text-lg font-bold tracking-wider uppercase mb-1">
                    Account Classification
                </div>
                <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-text-primary">
                    Choose Your Role
                </h2>

                <div className="flex flex-col gap-3">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            onClick={role.onClick}
                            className={cn(
                                "border border-outline-variant/60 bg-surface-container-low p-4 rounded-card flex items-center justify-between cursor-pointer transition-all hover:bg-surface-container-high group",
                                role.hoverBorder
                            )}
                        >
                            <div className="space-y-1 min-w-0 pr-2">
                                <div className="text-lg sm:text-base font-bold flex items-center gap-2 text-text-primary">
                                    <span>{role.title}</span>
                                    <VerificationBadge type={role.type} />
                                </div>
                                <p className="text-lg text-text-secondary leading-relaxed">
                                    {role.description}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </FlowLayout>
    );
};

export default UnifiedOnboardingOrchestrator;