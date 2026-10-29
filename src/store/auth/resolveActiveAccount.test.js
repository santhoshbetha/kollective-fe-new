import { describe, it, expect } from 'vitest';
import { resolveActiveAccount, FALLBACK_ORG_ROLE } from './resolveActiveAccount';

const ADMIN_ROLES = ['admin', 'owner', 'lead_organizer'];

describe('resolveActiveAccount', () => {
    it('prefers the server-provided active_account (including its real role)', () => {
        const active_account = { id: 'org-1', type: 'organization', name: 'The Daily Chronicle', role: 'contributor' };
        const result = resolveActiveAccount({ active_account, organization: { id: 'org-1' } }, 'org-1');
        expect(result).toBe(active_account);
    });

    // Regression: the organization fallback used to hardcode role: 'admin',
    // which unlocked admin-only UI for non-admin members.
    it('never grants an admin role when active_account is missing from an org switch response', () => {
        const result = resolveActiveAccount(
            { organization: { id: 42, display_name: 'The Daily Chronicle', username: 'daily_chronicle' } },
            '42'
        );

        expect(result.type).toBe('organization');
        expect(result.id).toBe('42');
        expect(result.role).toBe(FALLBACK_ORG_ROLE);
        expect(ADMIN_ROLES).not.toContain(result.role);
    });

    it('builds a personal account when switching back to personal without active_account', () => {
        const result = resolveActiveAccount({ user: { id: 7, username: 'editor' } }, 'personal');
        expect(result).toMatchObject({ id: '7', type: 'personal', username: 'editor', role: 'citizen' });
    });

    it('returns null when there is nothing to resolve', () => {
        expect(resolveActiveAccount({}, 'org-1')).toBeNull();
        expect(resolveActiveAccount(undefined, 'org-1')).toBeNull();
    });
});
