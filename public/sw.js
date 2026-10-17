// public/sw.js

/**
 * 🕵️‍♂️ BACKGROUND WEB PUSH EVENT RECEIVER
 * Listens directly to Google FCM / Apple APNS operating system notifications.
 */
self.addEventListener('push', (event) => {
    if (!event.data) {
        console.warn('⚠️ [SERVICE WORKER]: Incoming push event contains empty data payload.');
        return;
    }

    try {
        // Parse the decrypted JSON string block delivered by the server
        const payload = event.data.json();

        const title = payload.title || 'System Notification Matrix';
        const options = {
            body: payload.body || 'Secure network ledger update synchronized.',
            icon: payload.icon || '/logo192.png',
            badge: '/badge.png',
            tag: payload.tag || 'kollective-generic-alert',
            data: {
                url: payload.url || '/feed'
            },
            // Enforces high-contrast haptic vibrations for urgent governance alerts
            vibrate:,
            actions: [
                { action: 'open_url', title: 'Launch Console' }
            ]
        };

        // Instruct the operating system frame to display the notification card
        event.waitUntil(self.registration.showNotification(title, options));

    } catch (err) {
        console.error('❌ [SERVICE WORKER]: Failed to format push notification envelope:', err);
    }
});

/**
 * Handles desktop alert banner clicks to refocus or launch the React tab window
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Instantly dismiss banner elements

    const targetUrl = event.notification.data?.url || '/feed';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If an active app window is already running, focus it and redirect the route
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.postMessage({ type: 'NAVIGATE', url: targetUrl });
                    return client.focus();
                }
            }
            // Fallback: If no tab is open, launch a brand new window instance
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
