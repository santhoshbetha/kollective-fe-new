// src/utils/uploadMedia.js
import { apiFetch } from '../api/apiClient';

/**
 * Converts a data URL (base64 string) to a Blob object.
 */
export function dataURLtoBlob(dataurl) {
    if (!dataurl || typeof dataurl !== 'string') return null;
    const parts = dataurl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

/**
 * Uploads a profile graphic (avatar or banner/header) to Cloudflare R2 bucket
 * using presigned URLs provided by the Elixir backend.
 * Returns the final asset URL stored in Cloudflare R2.
 */
export async function uploadProfileImageToR2(imageSource, type = 'avatar') {
    if (!imageSource) return '';

    // If it's already a hosted URL (http:// or https://), return directly
    if (typeof imageSource === 'string' && (imageSource.startsWith('http://') || imageSource.startsWith('https://'))) {
        return imageSource;
    }

    try {
        let blob = null;
        let contentType = 'image/jpeg';
        let extension = 'jpg';

        if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
            blob = dataURLtoBlob(imageSource);
            if (blob) {
                contentType = blob.type || 'image/jpeg';
                extension = contentType.split('/')[1] || 'jpg';
            }
        } else if (imageSource instanceof File || imageSource instanceof Blob) {
            blob = imageSource;
            contentType = imageSource.type || 'image/jpeg';
            extension = contentType.split('/')[1] || 'jpg';
        }

        if (!blob) {
            return imageSource;
        }

        const filename = `${type}_${Date.now()}.${extension}`;

        // 1. Request presigned upload URL from Elixir backend (/api/v1/profile/media/presign)
        const presignRes = await apiFetch(
            `/profile/media/presign?filename=${encodeURIComponent(filename)}&type=${encodeURIComponent(type)}&content_type=${encodeURIComponent(contentType)}`
        );

        if (presignRes && presignRes.upload_url && presignRes.final_asset_url) {
            const { upload_url, final_asset_url } = presignRes;

            // If backend returned presigned URL, upload binary data to R2 S3 bucket
            if (upload_url.startsWith('http://') || upload_url.startsWith('https://')) {
                const uploadRes = await fetch(upload_url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': contentType,
                    },
                    body: blob,
                });

                if (uploadRes.ok) {
                    return final_asset_url;
                } else {
                    console.warn('R2 PUT upload returned non-OK status', uploadRes.status);
                    return final_asset_url;
                }
            } else {
                return final_asset_url;
            }
        }
    } catch (err) {
        console.warn('Failed to upload image to R2 storage, returning original imageSource:', err);
    }

    return imageSource;
}
