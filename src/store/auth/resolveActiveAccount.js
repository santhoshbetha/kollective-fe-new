// src/store/auth/resolveActiveAccount.js

/**
 * Least-privileged organization role. Used when the switch_profile response
 * does not tell us the member's actual role, so the UI never unlocks
 * admin-only controls on an unverified assumption.
 */
export const FALLBACK_ORG_ROLE = 'contributor';

/**
 * Builds the activeAccount object from a POST /api/v1/session/switch_profile
 * response. Prefers the server-provided `active_account`; otherwise derives a
 * minimal account from `user` / `organization` without granting elevated roles.
 */
export function resolveActiveAccount(data, targetAccountId) {
    const { active_account, user, organization } = data || {};

    if (active_account) return active_account;

    if (targetAccountId === 'personal') {
        return {
            id: user?.id ? String(user.id) : 'personal',
            type: 'personal',
            name: user?.name || user?.username || 'Personal Account',
            username: user?.username || 'user',
            handle: user?.handle || `@${user?.username || 'user'}`,
            avatar: user?.avatar || '/default-avatar.jpg',
            role: user?.role || 'citizen'
        };
    }

    if (organization) {
        return {
            id: String(organization.id),
            type: 'organization',
            name: organization.name || organization.display_name || organization.username,
            username: organization.username,
            handle: organization.handle || `@${organization.username}`,
            avatar: organization.avatar || organization.avatar_url || '/default-avatar.jpg',
            role: FALLBACK_ORG_ROLE
        };
    }

    return null;
}
