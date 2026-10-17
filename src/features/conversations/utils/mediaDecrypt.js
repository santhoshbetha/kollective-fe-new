// src/features/conversations/utils/mediaDecrypt.js

/**
 * 🔒 ZERO-KNOWLEDGE MEDIA DECRYPTION FILTER
 * Unpacks encrypted ciphertext binary blobs locally in browser RAM isolation space.
 */
export async function decryptMediaAttachment(mediaPayload, base64PrivateKey) {
    try {
        const { file_url, file_iv, encrypted_file_key } = mediaPayload;
        if (!file_url || !file_iv || !encrypted_file_key) {
            throw new Error("Missing structural cryptographic metadata metrics properties.");
        }

        // 1️⃣ Convert base64 data strings back into raw binary buffers
        const ivBuffer = Uint8Array.from(atob(file_iv), c => c.charCodeAt(0));
        const encryptedKeyBuffer = Uint8Array.from(atob(encrypted_file_key), c => c.charCodeAt(0));
        const privateKeyBuffer = Uint8Array.from(atob(base64PrivateKey), c => c.charCodeAt(0));

        // 2️⃣ Import the user's localized RSA Private Key into WebCrypto subtle arrays
        const rsaPrivateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            privateKeyBuffer.buffer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["decrypt"]
        );

        // 3️⃣ RSA-Decrypt the symmetric AES key content
        const rawAesKeyBytes = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            rsaPrivateKey,
            encryptedKeyBuffer
        );

        // 4️⃣ Fetch the raw encrypted ciphertext binary blob directly from Cloudflare R2 / S3 Storage
        const cdnResponse = await fetch(file_url);
        const encryptedCipherBuffer = await cdnResponse.arrayBuffer();

        // 5️⃣ Reconstruct the symmetric AES-GCM key definition context mapping
        const aesKey = await window.crypto.subtle.importKey(
            "raw",
            rawAesKeyBytes,
            { name: "AES-GCM", length: 256 },
            false,
            ["decrypt"]
        );

        // 6️⃣ Execute localized symmetric AES-GCM decryption
        const decryptedFileBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivBuffer },
            aesKey,
            encryptedCipherBuffer
        );

        // 7️⃣ Bundle raw output bytes inside an anonymous transient object URL link
        const clearBlob = new Blob([decryptedFileBuffer], { type: "image/jpeg" }); // Standardizes image viewport layers mapping
        return URL.createObjectURL(clearBlob); // Generates a safe blob:http://... stream reference pointer

    } catch (err) {
        console.error("❌ [CRYPTO DECRYPT ERROR]: Failed to unpack encrypted binary frame asset:", err);
        throw new Error("decryption_failed_key_mismatch");
    }
}
