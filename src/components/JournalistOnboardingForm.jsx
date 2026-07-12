import { useState } from 'react';

const JournalistOnboardingForm = ({ authToken, onVerificationComplete, onSkip }) => {
    const [urlInput, setUrlInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [successText, setSuccessText] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

    const handleInputChange = (e) => {
        setUrlInput(e.target.value);
        setErrorText('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Enforce basic URL formatting check before firing network requests
        if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
            setErrorText('Malformed media URL structure. Must include standard http:// or https:// prefixes.');
            return;
        }

        setIsSubmitting(true);
        setErrorText('');
        setSuccessText('');

        try {
            const response = await fetch(`${API_BASE_URL}/voting/journalist-verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ portfolio_url: urlInput.trim() })
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || 'Press credential validation rejected.');
            }

            setSuccessText(resData.message);

            // Delay transition briefly so user can read the success notification state
            setTimeout(() => {
                onVerificationComplete(resData.badge_type);
            }, 2200);

        } catch (err) {
            setErrorText(err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md border border-white/10 bg-surface-container p-8 font-mono text-text-primary glass-card">
            <div className="text-teal-500 dark:text-teal-400 text-md font-bold tracking-wider mb-2">📰 MEDIA CREDENTIALING</div>
            <h2 className="text-2xl font-black mb-4 uppercase">Verify Journalist Status</h2>
            <p className="text-md text-text-secondary leading-relaxed mb-6">
                Connect your profile to an active digital news portfolio (e.g., Muck Rack or Pressfolios).
                Providing a verified byline repository instantly activates your <b>Professional Teal Shield Badge</b>.
            </p>

            {successText ? (
                <div className="border border-teal-500 bg-teal-950/20 p-4 text-teal-400 text-sm text-center font-bold">
                    ✊ {successText}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-text-secondary font-bold mb-2 uppercase">
                            Your Public Portfolio or Registry URL:
                        </label>
                        <input
                            type="url"
                            required
                            disabled={isSubmitting}
                            placeholder="https://muckrack.com"
                            value={urlInput}
                            onChange={handleInputChange}
                            className="w-full bg-surface-container-low border border-white/10 p-3 text-md focus:outline-none focus:border-teal-500 text-text-primary placeholder-text-text-secondary/30"
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
                            disabled={!urlInput.trim() || isSubmitting}
                            className={`w-full p-3 font-bold text-md bg-teal-600 text-white uppercase tracking-wider transition-opacity cursor-pointer ${(!urlInput.trim() || isSubmitting) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-teal-500'
                                }`}
                        >
                            {isSubmitting ? 'Auditing Media Registers...' : 'Submit Press Credentials'}
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

export default JournalistOnboardingForm;
