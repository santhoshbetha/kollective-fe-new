/**
 * 🎨 Microsoft Teams Default Avatar Color Palette
 * Consistent, accessible background colors paired with crisp white text.
 */
export const TEAMS_AVATAR_PALETTE = [
    '#5b5fc7', // Teams Signature Purple
    '#00838f', // Deep Cyan / Teal
    '#106ebe', // Microsoft Royal Blue
    '#ca5010', // Rich Orange / Rust
    '#881798', // Plum / Magenta
    '#107c41', // Emerald Green
    '#a10836', // Crimson Red
    '#b45309', // Dark Amber
    '#3f51b5', // Indigo
    '#4a148c', // Deep Violet
    '#00695c', // Pine Teal
    '#ad1457', // Berry Pink
];

/**
 * 🔤 Returns 1-2 letter uppercase initials based on user display name:
 * - More than 1 word: First letter of first word + First letter of last word (e.g., "Julian Thorne" -> "JT")
 * - 1 word: First 2 letters of single word (e.g., "Julian" -> "JU", "Admin" -> "AD")
 */
export function getAvatarInitials(nameStr = '') {
    if (!nameStr) return '?';
    const cleanName = String(nameStr).trim().replace(/^@/, '');
    if (!cleanName) return '?';

    const words = cleanName.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
        const firstLetter = words[0][0] || '';
        const lastLetter = words[words.length - 1][0] || '';
        return (firstLetter + lastLetter).toUpperCase();
    }

    if (cleanName.length >= 2) {
        return cleanName.slice(0, 2).toUpperCase();
    }

    return cleanName.slice(0, 1).toUpperCase();
}

/**
 * 🎨 Deterministically returns a Microsoft Teams style background color based on name or ID hash.
 */
export function getTeamsBackgroundColor(nameOrId = '') {
    if (!nameOrId) return TEAMS_AVATAR_PALETTE[0];
    const str = String(nameOrId).trim();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % TEAMS_AVATAR_PALETTE.length;
    return TEAMS_AVATAR_PALETTE[index];
}
