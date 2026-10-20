// src/features/moderation/components/ModerationQueueDashboard.jsx
import ModerationDashboard from '../../../pages/admin/ModerationDashboard';

/**
 * ⚡ ModerationQueueDashboard
 * Unified wrapper forwarding directly to ModerationDashboard initialized on the live queue tab.
 */
export function ModerationQueueDashboard(props) {
    return <ModerationDashboard initialTab="queue" {...props} />;
}

export default ModerationQueueDashboard;
