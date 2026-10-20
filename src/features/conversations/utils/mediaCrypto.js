// src/features/conversations/utils/mediaCrypto.js
import { apiFetch } from '../../../api/apiClient';

/**
 * 🔒 MULTI-REGIONAL SECURE UPLOADER:
 * Encrypts a file locally in-browser using AES-GCM 256-bit keys,
 * requests a geographic presigned URL, and streams it to the closest region server [1].
 */
export async function encryptAndUploadAttachment(file, targetPublicKeyPem) {
    try {
        // 1️⃣ Generate single-use symmetric key parameters locally in browser RAM
        const aesKey = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // 2️⃣ Convert the raw file asset structure to ArrayBuffer and encrypt locally
        const fileBuffer = await file.arrayBuffer();
        const encryptedFileBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            fileBuffer
        );

        const rawAesKeyBytes = await window.crypto.subtle.exportKey("raw", aesKey);

        // 3️⃣ Secure the filename metadata locally to protect privacy variables
        const encoder = new TextEncoder();
        const encFileNameBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            encoder.encode(file.name)
        );

        // 4️⃣ 📡 FETCH GEOGRAPHICALLY OPTIMIZED PRESIGNED TARGET URL
        // Your Elixir node evaluates network latency metrics to assign the closest bucket
        const response = await apiFetch('/api/v1/storage/presign', {
            method: 'POST',
            body: JSON.stringify({
                content_type: "application/octet-stream",
                file_size: encryptedFileBuffer.byteLength
            })
        });

        const { upload_url, public_file_url } = response?.data || response;
        if (!upload_url) throw new Error("Storage target allocation rejected by cluster nodes.");

        // 5️⃣ Stream raw binary ciphertext straight to the regional storage bucket bucket partition
        await fetch(upload_url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: encryptedFileBuffer
        });

        // 6️⃣ RSA-Encrypt the symmetric AES key using the recipient's public key string
        // This ensures ONLY the recipient can decrypt the key required to unpack the file later [1.4]!
        const rsaKeyBuffer = convertPemToArrayBuffer(targetPublicKeyPem);
        const rsaPublicKey = await window.crypto.subtle.importKey(
            "spki",
            rsaKeyBuffer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["encrypt"]
        );

        const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            rsaPublicKey,
            rawAesKeyBytes
        );

        // Convert tracking arrays to base64 strings safe for JSON network transmission
        return {
            file_url: public_file_url,
            file_iv: btoa(String.fromCharCode(...iv)),
            file_name: btoa(String.fromCharCode(...new Uint8Array(encFileNameBuffer))),
            encrypted_file_key: btoa(String.fromCharCode(...new Uint8Array(encryptedKeyBuffer)))
        };

    } catch (err) {
        console.error("❌ [REGIONAL MEDIA CRYPTO FATAL]:", err);
        throw new Error("Failed to secure and route file attachment across regional data centers.");
    }
}

// Minimal helper to strip text PEM boundaries out of stored database strings
function convertPemToArrayBuffer(pem) {
    const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g, "");
    const byteString = window.atob(b64);
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }
    return byteArray.buffer;
}
