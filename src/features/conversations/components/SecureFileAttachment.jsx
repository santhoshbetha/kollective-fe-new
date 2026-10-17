// src/features/conversations/components/SecureFileAttachment.jsx
import React, { useState } from 'react';
import { decryptMediaAttachment } from '../utils/mediaDecrypt';
import { FileText, Download, Loader2, ShieldX, CheckCircle, FileUp } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function SecureFileAttachment({ mediaPayload, base64PrivateKey, fallbackName }) {
    const [decryptedUrl, setDecryptedUrl] = useState(null);
    const [status, setStatus] = useState("idle"); // "idle" | "decrypting" | "ready" | "failed"
    const [fileName, setFileName] = useState(fallbackName || "secure-document.dat");

    const handleDocumentUnlocking = async () => {
        if (!mediaPayload || !base64PrivateKey || status === "decrypting") return;

        setStatus("decrypting");
        try {
            // 1️⃣ Run WebCrypto subtle decryption over background arrays inside RAM
            const blobUrl = await decryptMediaAttachment(mediaPayload, base64PrivateKey);

            // 2️⃣ Decode custom metadata filename properties if supplied by your uploader
            if (mediaPayload.file_name) {
                try {
                    const cleanName = atob(mediaPayload.file_name);
                    if (cleanName) setFileName(cleanName);
                } catch (e) {
                    console.warn("Filename meta extraction bypassed. Using fallback descriptor.");
                }
            }

            setDecryptedUrl(blobUrl);
            setStatus("ready");

            // 🚀 AUTOMATED DOWNLOAD TRIGGER:
            // Programmatically click a transient download element anchor to deliver the asset straight to the local OS filesystem disk
            const dummyAnchor = document.createElement('a');
            dummyAnchor.href = blobUrl;
            dummyAnchor.download = fileName;
            document.body.appendChild(dummyAnchor);
            dummyAnchor.click();
            document.body.removeChild(dummyAnchor);

        } catch (err) {
            console.error("Document decryption array breakdown:", err);
            setStatus("failed");
        }
    };

    return (
        <div className="w-full max-w-sm mt-1 p-3.5 bg-[#181818] border border-white/5 rounded-2xl flex items-center justify-between gap-4 font-mono text-[11px] antialiased select-none shadow-md">
            <div className="min-w-0 flex items-center gap-3">
                <div className={cn(
                    "p-2.5 rounded-xl border shrink-0 transition-colors duration-150",
                    status === "failed" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                    status === "ready" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    status !== "failed" && status !== "ready" && "bg-white/5 text-primary-container border-white/10"
                )}>
                    {status === "failed" ? (
                        <ShieldX className="w-4 h-4 stroke-[2px]" />
                    ) : status === "ready" ? (
                        <CheckCircle className="w-4 h-4 stroke-[2px]" />
                    ) : (
                        <FileText className="w-4 h-4 stroke-[2px]" />
                    )}
                </div>

                <div className="min-w-0 flex-1 text-left font-sans">
                    <p className="text-xs font-black text-white truncate leading-snug" title={fileName}>
                        {fileName}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                        {status === "decrypting" ? (
                            <span className="text-primary-container animate-pulse">Decrypting Binary...</span>
                        ) : status === "ready" ? (
                            <span className="text-emerald-500">Decrypted Sandbox</span>
                        ) : status === "failed" ? (
                            <span className="text-neutral-600">Expired / Purged from Node</span>
                        ) : (
                            "Locked Zero-Knowledge Document"
                        )}
                    </p>
                </div>
            </div>

            {/* 🛠️ Action Trigger Button Control Node */}
            <button
                type="button"
                disabled={status === "decrypting"}
                onClick={handleDocumentUnlocking}
                className={cn(
                    "p-2.5 rounded-xl border shrink-0 cursor-pointer flex items-center justify-center transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-95",
                    status === "ready"
                        ? "bg-emerald-600 border-emerald-600 text-white hover:brightness-105"
                        : status === "failed"
                            ? "bg-zinc-800 border-white/10 text-rose-400 hover:text-rose-300"
                            : "bg-[#141414] border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                )}
                title={status === "ready" ? "Download file again" : "Unlock encrypted document file payload"}
            >
                {status === "decrypting" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-container" />
                ) : status === "ready" ? (
                    <Download className="w-3.5 h-3.5 stroke-[2.5px]" />
                ) : (
                    <FileUp className="w-3.5 h-3.5 stroke-[2.5px]" />
                )}
            </button>
        </div>
    );
}
