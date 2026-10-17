// src/features/notifications/utils/pushRegistration.js
import { apiFetch } from '../../../api/apiClient';

/**
 * 🕵️‍♂️ PUBLIC VAPID KEY INTERCEPT ROUTER
 * Converts your server application public key string to a raw format for WebPush subtle APIs
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * 📡 REGISTRATION GATEWAY:
 * Prompts user for system permissions and synchronizes VAPID credentials to the server.
 */
export async function initializeNotificationMatrix() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('⚠️ Web Push notifications are not supported on this browser architecture.');
        return;
    }

    try {
        // 1️⃣ Enforce user viewport permissions check prompt
        const permissionState = await Notification.requestPermission();
        if (permissionState !== 'granted') {
            console.warn('❌ Citizen revoked notification permission clearances.');
            return false;
        }

        // 2️⃣ Wait for service worker containers to mount completely
        const swRegistration = await navigator.serviceWorker.ready;

        // 3️⃣ Inject VAPID signing options. Replace string payload parameters with your actual VAPID key
        const applicationServerKey = urlBase64ToUint8Array('BEl627gZjmJWhgwywBu7XEqpNjN_V...YOUR_PUBLIC_VAPID_KEY_HERE...');

        const subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });

        // 4️⃣ Structuring payload base64 metrics elements for delivery to your Elixir schemas
        const subscriptionPayload = {
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
        };

        // Submit parameters straight up to your WebPushSubscriptions SQL backend tables
        await apiFetch('/api/v1/moderation/web_push_subscriptions', {
            method: 'POST',
            body: JSON.stringify({ subscription: subscriptionPayload })
        });

        console.log('✅ Zero-Knowledge Web Push sync complete.');
        return true;

    } catch (err) {
        console.error('❌ Failed to lock notification matrix lanes:', err);
        return false;
    }
}
