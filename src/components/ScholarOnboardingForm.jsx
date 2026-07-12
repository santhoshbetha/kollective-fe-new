import { useState } from 'react';

const ScholarOnboardingForm = ({ authToken, onVerificationComplete, onSkip }) => {
    const [orcidInput, setOrcidInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [successText, setSuccessText] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

    // Automatically add dashes formatting as the user types (XXXX-XXXX-XXXX-XXXX)
    const handleInputChange = (e) => {
        let value = e.target.value.replace(/[^0-9X]/gi, '').toUpperCase();
        if (value.length > 16) value = value.slice(0, 16);

        const parts = [];
        for (let i = 0; i < value.length; i += 4) {
            parts.push(value.slice(i, i + 4));
        }

        setOrcidInput(parts.join('-'));
        setErrorText('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Strict format pattern validation check
        const orcidPattern = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
        if (!orcidPattern.test(orcidInput)) {
            setErrorText('Invalid structure format. Must match layout: XXXX-XXXX-XXXX-XXXX');
            return;
        }

        setIsSubmitting(true);
        setErrorText('');

        try {
            const response = await fetch(`${API_BASE_URL}/voting/scholar-verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ orcid_id: orcidInput })
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || 'Academic validation rejected.');
            }

            setSuccessText(resData.message);
            setTimeout(() => {
                onVerificationComplete(resData.badge_type);
            }, 2000);

        } catch (err) {
            setErrorText(err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md border border-white/10 bg-surface-container p-8 font-mono text-text-primary glass-card">
            <div className="text-emerald-500 dark:text-emerald-400 text-md font-bold tracking-wider mb-2">🔬 ACADEMIC CREDENTIALING</div>
            <h2 className="text-2xl font-black mb-4 uppercase">Verify Scholar Status</h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-6">
                Connect your profile to the global open-access academic index. Providing an authentic
                ORCID ID instantly activates your <b>Emerald Green Shield Badge</b>.
            </p>

            {successText ? (
                <div className="border border-emerald-500 bg-emerald-950/20 p-4 text-emerald-400 text-sm text-center font-bold">
                    ✊ {successText}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-md text-text-secondary font-bold mb-2 uppercase">
                            Your Public ORCID iD Number:
                        </label>
                        <input
                            type="text"
                            placeholder="0000-0002-1825-0001"
                            value={orcidInput}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            className="w-full bg-surface-container-low border border-white/10 p-3 text-center text-lg font-bold tracking-widest uppercase focus:outline-none focus:border-emerald-500 text-text-primary placeholder-text-text-secondary/30"
                        />
                    </div>

                    {errorText && (
                        <div className="text-xs text-rose-500 font-bold bg-rose-950/10 border border-rose-900/50 p-2 text-center">
                            ⚠️ ERROR: {errorText}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={orcidInput.length < 19 || isSubmitting}
                            className={`w-full p-3 font-bold text-md bg-emerald-600 text-white uppercase tracking-wider transition-opacity cursor-pointer ${(orcidInput.length < 19 || isSubmitting) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-500'
                                }`}
                        >
                            {isSubmitting ? 'Querying Open Registers...' : 'Submit Academic Verification'}
                        </button>

                        <button
                            type="button"
                            onClick={onSkip}
                            disabled={isSubmitting}
                            className="w-full p-3 font-bold text-md border border-white/5 text-text-secondary hover:text-text-primary uppercase transition-colors cursor-pointer bg-surface-container-high"
                        >
                            Skip Onboarding Step
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ScholarOnboardingForm;
