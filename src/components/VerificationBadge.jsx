import React from 'react';

/**
 * Reusable Google Font Shield Verification Badge
 * @param {string} type - Options: 'activist', 'organization', 'journalist', 'citizen'
 * @param {string} className - Additional Tailwind utility modifiers
 */
export const VerificationBadge = ({ type = 'citizen', size = 'sm', className = '' }) => {
    const typeClasses = {
        activist: '#E32636',     // Signal Red
        organization: '#DAA520', // Premium Gold
        journalist: '#008080',   // Professional Teal
        scholar: '#107C41',      // Deep Emerald Green (Academic Proof)
        citizen: '#1D9BF0',      // Classic Blue
        warned: '#F4D000',       // Warning Yellow
    };

    const selectedType = typeClasses[type] || typeClasses.citizen;

    const sizeClasses = {
        // ⬇️ DYNAMIC EM MATRIX: 1em matches the parent line's current font-size exactly
        dynamic: 'w-[1em] h-[1em]',
        sm: 'w-3.5 h-3.5',          // 14px static fallback
        md: 'w-[18px] h-[18px]',    // 18px static fallback
        lg: 'w-6 h-6',              // 24px static fallback
    };

    const selectedSize = sizeClasses[size] || sizeClasses.dynamic;

    return (
        <span
            className={`
            inline-flex items-center justify-center select-none shrink-0 align-middle
            ${selectedSize}
            
            /* Apply the specific activist-coded color utility */
            ${className}
        `}
            title={`Verified ${type}`}
            aria-label={`Verified ${type}`}
            style={{ color: selectedType }}
        >
            {/* 📐 Isolated Google Fonts Material Symbols Vector Graphic */}
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

