// src/features/conversations/utils/mediaCrypto.js
import { apiFetch } from '../../../api/apiClient';

/**
 * Encrypts a file locally in-browser using AES-GCM 256-bit keys before storage streaming [1.4].
 */
export async function encryptAndUploadAttachment(file, targetPublicKeyPem) {
    try {
        // 1️⃣ Generate a temporary single-use symmetric key and random initialization vector (IV)
        const aesKey = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // 2️⃣ Convert the raw file into an ArrayBuffer and encrypt it locally in RAM
        const fileBuffer = await file.arrayBuffer();
        const encryptedFileBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            fileBuffer
        );

        // 3️⃣ Export the raw AES key material so we can protect it via asymmetric encryption
        const rawAesKeyBytes = await window.crypto.subtle.exportKey("raw", aesKey);

        // 4️⃣ Encrypt the filename locally to maintain metadata privacy parameters
        const encoder = new TextEncoder();
        const encFileNameBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            encoder.encode(file.name)
        );

        // 5️⃣ Request a secure pre-signed upload URL from your backend for Cloudflare R2
        const { upload_url, public_file_url } = await apiFetch('/api/v1/storage/presign', {
            method: 'POST',
            body: JSON.stringify({
                content_type: "application/octet-stream",
                file_size: encryptedFileBuffer.byteLength
            })
        });

        // 6️⃣ Stream the raw cipher text blob straight to your bucket via standard binary PUT
        await fetch(upload_url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: encryptedFileBuffer
        });

        // 7️⃣ RSA-Encrypt the AES symmetric key bytes using the recipient's public key
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
        console.error("Local file cryptographic pipeline failure:", err);
        throw new Error("Failed to secure file attachment parameters.");
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
