// src/utils/cryptoEngine.js

/**
 * 🚀 LOCAL CRYPTOGRAPHIC KEY GENERATOR
 * Generates an RSA-OAEP 2048-bit key pair locally inside browser RAM space [1.4].
 */
export async function generateUserKeyPair() {
    try {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]), // 65537 standard exponent
                hash: "SHA-256"
            },
            true, // Allows keys export out of RAM arrays
            ["encrypt", "decrypt"]
        );

        // 1️⃣ Convert the Public Key to an exportable SPKI ArrayBuffer format
        const exportedPublicBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        const publicKeyPem = convertArrayBufferToPem(exportedPublicBuffer, "PUBLIC KEY");

        // 2️⃣ Convert the Private Key to a PKCS8 ArrayBuffer format
        const exportedPrivateBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        const privateKeyB64 = btoa(String.fromCharCode(...new Uint8Array(exportedPrivateBuffer)));

        return {
            publicKeyPem, // Sent to Elixir database registers openly [1.4]
            privateKeyB64 // Kept strictly local on user hardware storage [1.4]
        };
    } catch (err) {
        console.error("Critical failure during WebCrypto array initialization:", err);
        throw new Error("Local cryptographic handshake generation failed.");
    }
}

/**
 * Encodes binary ArrayBuffers into valid text cryptographic PEM strings
 */
function convertArrayBufferToPem(buffer, label) {
    const binaryString = String.fromCharCode(...new Uint8Array(buffer));
    const base64String = btoa(binaryString);

    // Split the base64 string into 64-character blocks for perfect standard formatting compatibility
    const chunked = base64String.match(/.{1,64}/g).join("\n");

    return `-----BEGIN ${label}-----\n${chunked}\n-----END ${label}-----`;
}
