import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";

export function VerifyPeerScanner({ userToken, onVouchSuccess }) {
    const [scanStatus, setScanStatus] = useState("Ready to Scan");
    const [errorMessage, setErrorMessage] = useState("");
    const scannerRef = useRef(null);

    const startScanning = () => {
        setErrorMessage("");
        setScanStatus("Camera Thread Spawning...");

        try {
            // Initializing custom HTML5 component parameters
            const scanner = new Html5QrcodeScanner("reader", {
                fps: 15,
                qrbox: { width: 220, height: 220 },
                aspectRatio: 1.0
            });

            scannerRef.current = scanner;

            scanner.render((decodedText) => {
                // Cleanly clear memory buffers to prevent runtime hardware lag
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(err => console.error("Scanner clear lag:", err));
                }

                setScanStatus("Transmitting Core Trust Packet...");

                fetch('/api/vouch/verify-peer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({ secure_token: decodedText })
                })
                    .then(async (res) => {
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Verification pipeline rejected.");
                        return data;
                    })
                    .then(data => {
                        setScanStatus(`✅ Trust Set! Current District Vouch Count: ${data.current_vouches}`);
                        if (onVouchSuccess) onVouchSuccess(data);
                    })
                    .catch((err) => {
                        setScanStatus("Ready to Scan");
                        setErrorMessage(err.message);
                    });
            }, (error) => { /* Suppress seeker diagnostics frames logs */ });
        } catch (e) {
            console.error("Camera setup failed:", e);
            setScanStatus("Ready to Scan");
            setErrorMessage("Webcam not accessible or blocked. Use manual simulation below.");
        }
    };

    const handleSimulation = () => {
        setErrorMessage("");
        setScanStatus("Transmitting Simulated Trust Packet...");

        fetch('/api/vouch/verify-peer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ secure_token: "vouch_tok_simulated" })
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error("Simulation failed");
                return data;
            })
            .then(data => {
                setScanStatus(`✅ Simulated Vouch Success! Current Vouches: ${data.current_vouches}`);
                if (onVouchSuccess) onVouchSuccess(data);
            })
            .catch((err) => {
                setScanStatus("Ready to Scan");
                setErrorMessage(err.message);
            });
    };

    // Automated clean up hook to drop hardware streams safely on close
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Hardware cleanup error:", err));
            }
        };
    }, []);

    return (
        <div className="w-full max-w-md border border-white/10 bg-surface-container p-6 font-mono text-text-primary glass-card">
            <h3 className="text-lg font-bold tracking-wider text-rose-500 uppercase mb-2">Verify a Local Peer</h3>
            <p className="text-md text-text-secondary mb-4 font-sans">Scan their temporary QR code only if you physically confirm they work or reside inside your legislative bracket zone.</p>

            <div id="reader" className="w-full bg-surface-container-low border border-white/5 overflow-hidden rounded-none"></div>

            <div className="text-center mt-6 space-y-4">
                <div className="text-md bg-surface-container-low p-3 border border-white/5">
                    <span className="text-text-secondary">STATUS:</span> <span className="font-bold text-text-primary">{scanStatus}</span>
                </div>

                {errorMessage && (
                    <div className="text-md font-bold border border-rose-900 bg-rose-950/20 p-3 text-rose-400">
                        ⚠️ EXCEPTION: {errorMessage}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <button
                        onClick={startScanning}
                        className="w-full p-3 font-bold text-md bg-surface-container-high border border-white/5 hover:border-white/10 text-text-primary uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Activate Camera Axis
                    </button>

                    <button
                        onClick={handleSimulation}
                        className="w-full p-3 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Simulate Scan Success
                    </button>
                </div>
            </div>
        </div>
    );
}
