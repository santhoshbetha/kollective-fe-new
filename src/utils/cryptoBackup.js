// src/utils/cryptoBackup.js
import { apiFetch } from "../api/apiClient";

/**
 * 🔒 ZERO-KNOWLEDGE SERVER BACKUP:
 * Encrypts the raw base64 Private Key using a user Chat PIN locally in browser RAM [1.4].
 */
export async function backupPrivateKeyToServer(userUuid, rawPrivateKeyB64, pinString, publicKeyPem = null) {
    try {
        const encoder = new TextEncoder();

        // 1️⃣ Generate a random 16-byte salt to defend against rainbow table lookups
        const salt = window.crypto.getRandomValues(new Uint8Array(16));

        // 2️⃣ Derive an AES key matrix from the raw text PIN using PBKDF2 derivation rules
        const baseKey = await window.crypto.subtle.importKey(
            "raw",
            encoder.encode(pinString),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const aesKey = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000, // Enforces high cryptographic compute cost
                hash: "SHA-256"
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt"]
        );

        // 3️⃣ Encrypt the Private Key string using AES-GCM
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedDataBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            encoder.encode(rawPrivateKeyB64)
        );

        // 4️⃣ Structuring payload base64 elements safe for text database storage fields
        const backupBlob = {
            ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedDataBuffer))),
            iv: btoa(String.fromCharCode(...iv))
        };

        const payload = {
            encrypted_private_key_backup: JSON.stringify(backupBlob),
            backup_salt: btoa(String.fromCharCode(...salt)),
            ...(publicKeyPem ? { public_key: publicKeyPem } : {})
        };

        // 5️⃣ Push the sealed matrix bundle up to your Elixir user accounts contexts route [1.4]
        return await apiFetch(`/api/v1/auth/backup_key`, {
            method: 'POST',
            body: JSON.stringify({ backup: payload })
        });

    } catch (err) {
        console.error("Failed to compile secure zero-knowledge backup payload:", err);
        throw new Error("Local crypto backup initialization aborted.");
    }
}

/**
 * 🔑 DEVICE RECOVERY DECRYPTION DE-SERIALIZER:
 * Pulls down the backup string block and rebuilds the Private Key using the Chat PIN locally [1.4].
 */
export async function recoverPrivateKeyFromServer(encryptedJsonBlob, base64Salt, pinString) {
    try {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const backupBlob = JSON.parse(encryptedJsonBlob);
        const salt = Uint8Array.from(atob(base64Salt), c => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(backupBlob.iv), c => c.charCodeAt(0));
        const ciphertext = Uint8Array.from(atob(backupBlob.ciphertext), c => c.charCodeAt(0));

        // Re-derive the identical AES key locally on the new browser container layer using the PIN [1.4]
        const baseKey = await window.crypto.subtle.importKey(
            "raw",
            encoder.encode(pinString),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const aesKey = await window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
            baseKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["decrypt"]
        );

        // Decrypt the raw private key material right back inside local memory bounds [1.4]
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            ciphertext
        );

        return decoder.decode(decryptedBuffer); // Returns raw original base64 private key string
    } catch (err) {
        console.warn("Decryption failed. Invalid Chat Recovery PIN provided.");
        throw new Error("invalid_pin_key_mismatch");
    }
}
