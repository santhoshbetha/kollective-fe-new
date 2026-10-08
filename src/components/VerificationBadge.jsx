import React from 'react';

/**
 * Reusable Unified Network Identity Verification Badge
 * @param {string} type - Options: 'activist', 'scholar', 'journalist', 'voice', 'organization', 'citizen', 'warned'
 * @param {string} size - Options: 'dynamic', 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Additional Tailwind utility class layout overrides
 */
export const VerificationBadge = ({ type = 'citizen', size = 'sm', className = '' }) => {

    // 🎨 SYNCED THEME MATRIX: Matches the exact branding palettes of your attentive ThreadLines
    const typeColorsX = {
        // Activist: Grassroots high-urgency bright amber/orange
        activist: '#f59e0b',
        // Scholar: Prestigious academic violet/indigo
        scholar: '#818cf8',
        // Journalist / Voice: Core Kollective primary brand alert crimson
        journalist: '#d32f2f',
        voice: '#d32f2f',
        // Organization: Premium high-contrast clean cyan/teal
        organization: '#06b6d4',
        // Citizen / Standard: Balanced classic blue structure
        citizen: '#1d9bf0',
        // Warning: Moderation yellow flag alert boundaries
        warned: '#eab308',
    };

    // 🎨 SYNCED THEME MATRIX: Matches the exact branding palettes of your attentive ThreadLines
    const typeColors = {
        // Activist: Grassroots high-urgency bright amber/orange
        activist: '#E32636',
        // Scholar: Prestigious academic violet/indigo
        scholar: '#008080',
        // Journalist / Voice: Core Kollective primary brand alert crimson
        journalist: '#008080',
        voice: '#d32f2f',
        // Organization: Premium high-contrast clean cyan/teal
        organization: '#DAA520',
        // Citizen / Standard: Balanced classic blue structure
        citizen: '#1D9BF0',
        // Warning: Moderation yellow flag alert boundaries
        warned: '#f4711d',
    };

    // 🛡️ FIX: Safe extraction ensuring all valid keys match correctly
    const normalizedType = type?.toLowerCase() || 'citizen';
    const selectedColor = typeColors[normalizedType] || typeColors.citizen;

    const sizeClasses = {
        // ⬇️ DYNAMIC MATRIX: Scaled seamlessly inside header fonts
        dynamic: 'w-[1em] h-[1em]',
        sm: 'w-3.5 h-3.5',       // 14px static footprint
        md: 'w-4 h-4',           // 16px static footprint
        lg: 'w-5 h-5',           // 20px static headline footprint
        xl: 'w-6 h-6',           // 24px maximum profile scale footprint
    };

    const selectedSize = sizeClasses[size] || sizeClasses.dynamic;

    return (
        <span
            className={`
                inline-flex items-center justify-center select-none shrink-0 align-middle transition-colors duration-200
                ${selectedSize}
                ${className}
            `}
            title={`Verified ${normalizedType}`}
            aria-label={`Verified ${normalizedType}`}
            style={{ color: selectedColor }}
        >
            {/* 📐 Isolated Google Fonts Material Shield Graphic Asset */}
            <svg
                className="w-full h-full fill-current"
                viewBox="0 -960 960 960"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="m424-296 254-254-56-56-198 198-90-90-56 56 146 146Zm56 216q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 151-90.5 275.5T480-80Z" />
            </svg>
        </span>
    );
};

export default VerificationBadge;
