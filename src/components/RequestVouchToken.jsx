import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function RequestVouchToken({ userToken }) {
    const [vouchToken, setVouchToken] = useState("");
    const [countdown, setCountdown] = useState(60);
    const countdownIntervalRef = useRef(null);

    const generateNewToken = async () => {
        try {
            const response = await fetch('/api/vouch/generate-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error("Network authentication rejected.");
            const data = await response.json();

            setVouchToken(data.secure_token);
            setCountdown(60);
        } catch (err) {
            console.error("Token generation failure:", err);
        }
    };

    useEffect(() => {
        generateNewToken();

        countdownIntervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    generateNewToken(); // Single-use cycle rotation hook
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [userToken]);

    return (
        <div className="w-full max-w-md border border-white/10 bg-surface-container p-6 font-mono text-text-primary text-center glass-card">
            <h3 className="text-lg font-bold tracking-wider text-blue-500 uppercase mb-2">Show QR to a Verified Worker</h3>
            <p className="text-md text-text-secondary mb-6 font-sans">
                This token expires automatically every 60 seconds to secure your identity mapping from recording vectors.
            </p>

            {vouchToken ? (
                <div className="inline-block p-4 bg-white rounded-none border border-white/10 mb-6">
                    <QRCodeSVG value={vouchToken} size={220} fgColor="#000000" bgColor="#ffffff" includeMargin={false} />
                </div>
            ) : (
                <div className="w-[220px] h-[220px] mx-auto flex items-center justify-center border border-dashed border-white/10 text-xs text-text-secondary mb-6 bg-surface-container-low">
                    GENERATING CRYPTO NODE...
                </div>
            )}

            <div className="text-md font-bold text-text-secondary bg-surface-container-low p-2 border border-white/5 inline-block">
                🔄 ROTATING IN: <span className="text-blue-500">{countdown}s</span>
            </div>
        </div>
    );
}
