import React from 'react';

/**
 * CategoryGraphic Component
 * Renders custom, vibrant SVG vector illustrations for event and business categories.
 */

const CATEGORY_STYLES = {
    // --- EVENT CATEGORIES ---
    'Music': {
        gradient: ['#2e0854', '#581c87', '#1e1b4b'],
        accent: '#c084fc',
        type: 'music'
    },
    'Business & professional': {
        gradient: ['#0f172a', '#1e293b', '#0369a1'],
        accent: '#38bdf8',
        type: 'business'
    },
    'Community & culture': {
        gradient: ['#451a03', '#78350f', '#92400e'],
        accent: '#fbbf24',
        type: 'community'
    },
    'Performing & visual arts': {
        gradient: ['#4c0519', '#881337', '#9f1239'],
        accent: '#fb7185',
        type: 'arts'
    },
    'Film, media, & entertainment': {
        gradient: ['#1e1b4b', '#312e81', '#4338ca'],
        accent: '#818cf8',
        type: 'film'
    },
    'Fitness & Wellness': {
        gradient: ['#064e3b', '#047857', '#0f766e'],
        accent: '#34d399',
        type: 'fitness'
    },
    'Technology': {
        gradient: ['#090d16', '#0f172a', '#1e1b4b'],
        accent: '#38bdf8',
        type: 'tech'
    },
    'Travel & outdoor': {
        gradient: ['#134e4a', '#115e59', '#065f46'],
        accent: '#2dd4bf',
        type: 'travel'
    },
    'Charity & causes': {
        gradient: ['#701a75', '#86198f', '#9f1239'],
        accent: '#f472b6',
        type: 'charity'
    },
    'Religion & spirituality': {
        gradient: ['#3b0764', '#581c87', '#7c2d12'],
        accent: '#fde047',
        type: 'spirituality'
    },
    'Family & education': {
        gradient: ['#0c4a6e', '#0369a1', '#0284c7'],
        accent: '#38bdf8',
        type: 'education'
    },
    'Seasonal & holiday': {
        gradient: ['#831843', '#9d174d', '#be123c'],
        accent: '#f472b6',
        type: 'holiday'
    },

    // --- BUSINESS CATEGORIES ---
    'Food & Beverage': {
        gradient: ['#451a03', '#78350f', '#9a3412'],
        accent: '#fb923c',
        type: 'food'
    },
    'Grocery Store': {
        gradient: ['#064e3b', '#065f46', '#047857'],
        accent: '#4ade80',
        type: 'grocery'
    },
    'Healthcare': {
        gradient: ['#0c4a6e', '#0284c7', '#0369a1'],
        accent: '#38bdf8',
        type: 'health'
    },
    'Transportation': {
        gradient: ['#0f172a', '#1e293b', '#0284c7'],
        accent: '#38bdf8',
        type: 'transport'
    },
    'Retail & Crafts': {
        gradient: ['#581c87', '#7e22ce', '#a21caf'],
        accent: '#e879f9',
        type: 'retail'
    },
    'Beauty & Personal Care': {
        gradient: ['#701a75', '#9d174d', '#be123c'],
        accent: '#f472b6',
        type: 'beauty'
    },
    'Agriculture': {
        gradient: ['#14532d', '#15803d', '#166534'],
        accent: '#86efac',
        type: 'agriculture'
    },
    'Cleaning Services': {
        gradient: ['#115e59', '#0f766e', '#0284c7'],
        accent: '#2dd4bf',
        type: 'cleaning'
    },
    'Movers': {
        gradient: ['#78350f', '#b45309', '#d97706'],
        accent: '#fde047',
        type: 'movers'
    },
    'Professional Services': {
        gradient: ['#0f172a', '#334155', '#475569'],
        accent: '#94a3b8',
        type: 'pro_services'
    },
    'Legal Services': {
        gradient: ['#1c1917', '#44403c', '#78350f'],
        accent: '#fde047',
        type: 'legal'
    },
    'Tax Services': {
        gradient: ['#064e3b', '#047857', '#0284c7'],
        accent: '#34d399',
        type: 'tax'
    },
    'Manufacturing': {
        gradient: ['#450a0a', '#7f1d1d', '#991b1b'],
        accent: '#f87171',
        type: 'manufacturing'
    },
    'Construction': {
        gradient: ['#7c2d12', '#c2410c', '#ea580c'],
        accent: '#fdba74',
        type: 'construction'
    },
};

const DEFAULT_STYLE = {
    gradient: ['#881337', '#4c0519', '#0f172a'],
    accent: '#f43f5e',
    type: 'default'
};

export function CategoryGraphic({ category = '', title = '', className = '' }) {
    const config = CATEGORY_STYLES[category] || DEFAULT_STYLE;
    const [c1, c2, c3] = config.gradient;
    const accent = config.accent;

    return (
        <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
            <svg
                className="w-full h-full object-cover"
                viewBox="0 0 400 225"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id={`grad-${category.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={c1} />
                        <stop offset="50%" stopColor={c2} />
                        <stop offset="100%" stopColor={c3} />
                    </linearGradient>

                    <radialGradient id={`glow-${category.replace(/\s+/g, '-')}`} cx="75%" cy="25%" r="60%">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={c1} stopOpacity="0" />
                    </radialGradient>

                    <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.8" />
                    </pattern>
                </defs>

                {/* Base Gradient Fill */}
                <rect width="400" height="225" fill={`url(#grad-${category.replace(/\s+/g, '-')})`} />

                {/* Grid Texture Overlay */}
                <rect width="400" height="225" fill="url(#grid-pattern)" />

                {/* Radial Glow */}
                <rect width="400" height="225" fill={`url(#glow-${category.replace(/\s+/g, '-')})`} />

                {/* Category Vector Illustrative Graphics */}
                {renderVectorElements(config.type, accent)}

                {/* Foreground Overlay Gradient for Depth */}
                <rect width="400" height="225" fill="black" fillOpacity="0.25" />
            </svg>

            {/* Category Badge overlay at bottom */}
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between z-10 pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/90 bg-black/60 px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-md shadow-md">
                    {category || 'Collective'}
                </span>
            </div>
        </div>
    );
}

function renderVectorElements(type, accent) {
    switch (type) {
        case 'music':
            return (
                <g>
                    {/* Floating Equalizer Bars */}
                    {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x, i) => (
                        <rect
                            key={i}
                            x={x}
                            y={110 - (i % 5) * 16}
                            width="14"
                            height={40 + (i % 5) * 20}
                            rx="7"
                            fill={accent}
                            fillOpacity={0.25 + (i % 3) * 0.2}
                        />
                    ))}
                    {/* Glowing Wave Line */}
                    <path
                        d="M 0 140 Q 100 80 200 130 T 400 110"
                        fill="none"
                        stroke={accent}
                        strokeWidth="3"
                        strokeOpacity="0.8"
                    />
                </g>
            );

        case 'tech':
            return (
                <g>
                    {/* Circuit Board Trace Lines */}
                    <path d="M 50 200 L 120 130 L 220 130 L 260 90 L 350 90" fill="none" stroke={accent} strokeWidth="2" strokeOpacity="0.6" />
                    <path d="M 100 225 L 180 145 L 280 145 L 340 85" fill="none" stroke={accent} strokeWidth="1.5" strokeOpacity="0.4" />
                    {/* Nodes */}
                    <circle cx="220" cy="130" r="5" fill={accent} />
                    <circle cx="260" cy="90" r="5" fill={accent} />
                    <circle cx="350" cy="90" r="6" fill={accent} />
                </g>
            );

        case 'community':
            return (
                <g>
                    {/* Concentric Radiating Rings */}
                    <circle cx="200" cy="112" r="90" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" />
                    <circle cx="200" cy="112" r="65" fill="none" stroke={accent} strokeWidth="1.5" strokeOpacity="0.4" />
                    <circle cx="200" cy="112" r="40" fill="none" stroke={accent} strokeWidth="2" strokeOpacity="0.6" />
                    <circle cx="200" cy="112" r="15" fill={accent} fillOpacity="0.5" />
                </g>
            );

        case 'fitness':
            return (
                <g>
                    {/* Energetic Speed Pulse Waves */}
                    <path d="M 20 160 L 120 160 L 150 70 L 180 190 L 210 110 L 240 160 L 380 160" fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
            );

        case 'arts':
            return (
                <g>
                    {/* Spotlight Beams */}
                    <polygon points="50,0 150,225 100,225" fill={accent} fillOpacity="0.15" />
                    <polygon points="350,0 250,225 300,225" fill={accent} fillOpacity="0.2" />
                    {/* Curving Paint Wave */}
                    <path d="M 0 180 Q 150 80 400 160" fill="none" stroke={accent} strokeWidth="5" strokeOpacity="0.6" />
                </g>
            );

        case 'food':
            return (
                <g>
                    {/* Steam Rings */}
                    <circle cx="180" cy="90" r="25" fill="none" stroke={accent} strokeWidth="2" strokeOpacity="0.3" />
                    <circle cx="220" cy="70" r="35" fill="none" stroke={accent} strokeWidth="2" strokeOpacity="0.4" />
                    <path d="M 120 180 C 180 140 220 140 280 180" fill="none" stroke={accent} strokeWidth="3" strokeOpacity="0.7" />
                </g>
            );

        case 'health':
            return (
                <g>
                    {/* Medical Cross Graphic */}
                    <rect x="180" y="72" width="40" height="80" rx="10" fill={accent} fillOpacity="0.4" />
                    <rect x="160" y="92" width="80" height="40" rx="10" fill={accent} fillOpacity="0.4" />
                    <path d="M 40 180 L 140 180 L 160 140 L 180 200 L 200 150 L 220 180 L 360 180" fill="none" stroke={accent} strokeWidth="2" strokeOpacity="0.6" />
                </g>
            );

        case 'agriculture':
            return (
                <g>
                    {/* Farmland Perspective Rows */}
                    <line x1="200" y1="90" x2="0" y2="225" stroke={accent} strokeWidth="2" strokeOpacity="0.4" />
                    <line x1="200" y1="90" x2="100" y2="225" stroke={accent} strokeWidth="2" strokeOpacity="0.5" />
                    <line x1="200" y1="90" x2="200" y2="225" stroke={accent} strokeWidth="2" strokeOpacity="0.6" />
                    <line x1="200" y1="90" x2="300" y2="225" stroke={accent} strokeWidth="2" strokeOpacity="0.5" />
                    <line x1="200" y1="90" x2="400" y2="225" stroke={accent} strokeWidth="2" strokeOpacity="0.4" />
                </g>
            );

        case 'construction':
            return (
                <g>
                    {/* Hazard Stripes */}
                    <path d="M 0 225 L 60 0 H 90 L 30 225 Z" fill={accent} fillOpacity="0.2" />
                    <path d="M 80 225 L 140 0 H 170 L 110 225 Z" fill={accent} fillOpacity="0.2" />
                    <path d="M 160 225 L 220 0 H 250 L 190 225 Z" fill={accent} fillOpacity="0.2" />
                    <path d="M 240 225 L 300 0 H 330 L 270 225 Z" fill={accent} fillOpacity="0.2" />
                    <polygon points="200,30 360,200 40,200" fill="none" stroke={accent} strokeWidth="2.5" strokeOpacity="0.5" />
                </g>
            );

        default:
            return (
                <g>
                    {/* Abstract Polygons */}
                    <circle cx="320" cy="50" r="80" fill={accent} fillOpacity="0.15" />
                    <circle cx="80" cy="180" r="100" fill={accent} fillOpacity="0.1" />
                    <polygon points="200,40 280,180 120,180" fill="none" stroke={accent} strokeWidth="2" strokeOpacity="0.4" />
                </g>
            );
    }
}
