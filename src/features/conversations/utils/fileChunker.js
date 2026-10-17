// src/features/conversations/utils/fileChunker.js
import { apiFetch } from '../../../api/apiClient';

const CHUNK_SIZE = 1024 * 1024; // Strict 1MB fragmentation slices

/**
 * 🔒 ZERO-KNOWLEDGE MULTI-REGION SLICER
 * Slices, encrypts, and uploads file blocks asynchronously across continental buckets.
 */
export async function fragmentAndUploadFile(file, recipientPublicKeyPem, onProgress) {
    try {
        const fileBuffer = await file.arrayBuffer();
        const totalBytes = fileBuffer.byteLength;
        const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);

        // 1️⃣ Generate single-use symmetric key matrices in browser RAM space
        const aesKey = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        const rawAesKeyBytes = await window.crypto.subtle.exportKey("raw", aesKey);

        const manifestChunks = [];

        // 2️⃣ Iterate over structural fragments
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const startByte = chunkIndex * CHUNK_SIZE;
            const endByte = Math.min(startByte + CHUNK_SIZE, totalBytes);
            const chunkSlice = fileBuffer.slice(startByte, endByte);

            // Generate an isolated IV signature for every distinct block segment
            const chunkIv = window.crypto.getRandomValues(new Uint8Array(12));

            // Encrypt the isolated segment array
            const encryptedChunkBuffer = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: chunkIv },
                aesKey,
                chunkSlice
            );

            // 3️⃣ 📡 Request a regional presigned path for this distinct fragment block index
            const presignRes = await apiFetch('/api/v1/storage/presign', {
                method: 'POST',
                body: JSON.stringify({
                    content_type: "application/octet-stream",
                    file_size: encryptedChunkBuffer.byteLength
                })
            });

            const { upload_url, public_file_url } = presignRes?.data || presignRes;

            // Stream chunk payload binary directly to the nearest regional bucket partition
            await fetch(upload_url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/octet-stream' },
                body: encryptedChunkBuffer
            });

            manifestChunks.push({
                index: chunkIndex,
                url: public_file_url,
                iv: btoa(String.fromCharCode(...chunkIv))
            });

            if (onProgress) {
                onProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
            }
        }

        // 4️⃣ RSA-Encrypt the master symmetric AES key using the recipient's public key string
        const rsaKeyBuffer = convertPemToArrayBuffer(recipientPublicKeyPem);
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

        // Return a complete distributed cryptographic structural tracking manifest
        return {
            is_fragmented: true,
            total_size: totalBytes,
            file_name: file.name,
            encrypted_file_key: btoa(String.fromCharCode(...new Uint8Array(encryptedKeyBuffer))),
            fragments: manifestChunks
        };

    } catch (err) {
        console.error("❌ [FRAGMENTATION UPLOADER FATAL]:", err);
        throw new Error("Multi-region asymmetric fragmentation streaming failed.");
    }
}

function convertPemToArrayBuffer(pem) {
    const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g, "");
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
}
