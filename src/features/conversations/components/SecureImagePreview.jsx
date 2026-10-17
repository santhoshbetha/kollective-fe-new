// src/features/conversations/components/SecureImagePreview.jsx
import React, { useState, useEffect } from 'react';
import { decryptMediaAttachment } from '../utils/mediaDecrypt';
import { Loader2, ShieldX, Image, Eye } from 'lucide-react';

export function SecureImagePreview({ mediaPayload, base64PrivateKey }) {
    const [decryptedUrl, setDecryptedUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        let objectUrlToCleanup = null;

        async function processSecureAsset() {
            if (!mediaPayload || !base64PrivateKey) return;
            try {
                setIsProcessing(true);
                setError(false);

                // Run WebCrypto subtle decryption pass over background arrays
                const blobUrl = await decryptMediaAttachment(mediaPayload, base64PrivateKey);

                if (mounted) {
                    objectUrlToCleanup = blobUrl;
                    setDecryptedUrl(blobUrl);
                }
            } catch (err) {
                if (mounted) setError(true);
            } finally {
                if (mounted) setIsProcessing(false);
            }
        }

        processSecureAsset();

        // 🧹 RAM LEAK PREVENTION SANITIZATION GUARD:
        // Automatically flushes transient blobs out of browser memory when message cards roll off-screen
        return () => {
            mounted = false;
            if (objectUrlToCleanup) {
                URL.revokeObjectURL(objectUrlToCleanup);
            }
        };
    }, [mediaPayload, base64PrivateKey]);

    if (isProcessing) {
        return (
            <div className="w-full h-44 rounded-xl border border-white/5 bg-black/20 flex flex-col items-center justify-center font-mono text-[10px] text-neutral-500 select-none gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                <span>DECRYPTING BINARY CIPHER PIPELINE...</span>
            </div>
        );
    }

    /*if (error) {
        return (
            <div className="w-full p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 text-center font-mono text-[10px] text-rose-400 select-none space-y-1">
                <ShieldX className="w-5 h-5 mx-auto text-rose-500 stroke-[2px]" />
                <p className="font-black uppercase tracking-wider">Decryption Blocked</p>
                <p className="text-neutral-500 font-sans font-medium text-[11px] leading-normal">
                    Private cryptographic identity signature mismatch. Cannot read asset array keys.
                </p>
            </div>
        );
    }*/

    // Update your component's error checking block to capture expired files:
    if (error) {
        return (
            <div className="w-full p-4 rounded-xl border border-white/5 bg-neutral-900/40 text-center font-mono text-[10px] text-neutral-500 select-none space-y-1">
                <ShieldX className="w-4 h-4 mx-auto text-neutral-600 stroke-[2px]" />
                <p className="font-black uppercase tracking-wider">Asset Unavailable</p>
                <p className="font-sans font-medium text-[11px] leading-normal text-neutral-600">
                    This secure transmission container has passed its 30-day node retention policy threshold and was purged.
                </p>
            </div>
        );
    }


    return (
        <div className="space-y-1 relative group font-sans">
            <div className="rounded-xl overflow-hidden border border-white/5 bg-black/20 shadow-inner relative max-h-56">
                <img
                    src={decryptedUrl || "/placeholder.svg"}
                    alt="Decrypted content stream"
                    className="max-w-full h-auto object-cover mx-auto select-none"
                    loading="lazy"
                />

                {/* Visual Security Overlay Anchor */}
                <div className="absolute inset-0 bg-primary-container/10 pointer-events-none mix-blend-overlay" />
            </div>

            <p className="text-[10px] font-mono text-neutral-500 font-bold mt-1 select-none flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400 shrink-0 stroke-[2.5px]" />
                <span>Locked RAM sandbox payload container active (Zero-Knowledge)</span>
            </p>
        </div>
    );
}
