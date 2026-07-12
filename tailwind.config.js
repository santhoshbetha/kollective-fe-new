/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "secondary-container": "#d9aa00",
        "primary-container": "#cc0000",
        "on-tertiary": "#002681",
        "tertiary-fixed-dim": "#b7c4ff",
        "tertiary": "#b7c4ff",
        "surface": "#141414", // Base background updated from #131313
        "surface-crimson-low": "#2D0A0A",
        "on-secondary": "#3e2e00",
        "tertiary-container": "#0052f9",
        "error-container": "#93000a",
        "surface-ink": "#1A1616",
        "on-tertiary-fixed-variant": "#0039b4",
        "surface-container-lowest": "#0e0e0e",
        "on-primary-container": "#ffdad4",
        "on-secondary-fixed": "#241a00",
        "outline-variant": "#5e3f3a",
        "error": "#ffb4ab",
        "primary": "#ffb4a8",
        "surface-dim": "#141414", // Dim surface updated from #131313
        "secondary-fixed-dim": "#f2c025",
        "secondary-fixed": "#ffdf92",
        "on-secondary-fixed-variant": "#594400",
        "outline": "#ae8882",
        "gold-muted": "#D4A017",
        "on-tertiary-fixed": "#001551",
        "inverse-surface": "#e5e2e1",
        "on-primary": "#690000",
        "tertiary-fixed": "#dce1ff",
        "surface-variant": "#353534",
        "background": "#141414", // Background updated from #131313
        "inverse-primary": "#c00000",
        "surface-container-low": "#1c1b1b",
        "text-secondary": "#A19B95",
        "surface-container-highest": "#353534",
        "primary-fixed-dim": "#ffb4a8",
        "surface-bright": "#393939",
        "on-tertiary-container": "#dce1ff",
        "text-primary": "#F4F4F4",
        "on-error-container": "#ffdad6",
        "on-background": "#e5e2e1",
        "on-secondary-container": "#554100",
        "surface-container-high": "#2a2a2a",
        "surface-tint": "#ffb4a8",
        "on-primary-fixed": "#410000",
        "on-error": "#690005",
        "on-surface": "#e5e2e1",
        "inverse-on-surface": "#313030",
        "surface-container": "#201f1f",
        "primary-fixed": "#ffdad4",
        "on-primary-fixed-variant": "#930000",
        "on-surface-variant": "#e8bdb6",
        "secondary": "#f8c62c"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "card": "16px",
        "full": "9999px"
      },
      spacing: {
        "container-max": "1280px",
        "margin-desktop": "64px",
        "base": "8px",
        "gutter": "24px",
        "margin-mobile": "20px"
      },
      fontFamily: {
        "label-sm": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"],
        "display-lg": ["Plus Jakarta Sans"],
        "body-md": ["Plus Jakarta Sans"],
        "headline-lg-mobile": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
        "body-lg": ["Plus Jakarta Sans"],
        "label-md": ["Plus Jakarta Sans"]
      },
      fontSize: {
        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "700" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.02em", "fontWeight": "600" }]
      },
      //custom activist-coded verification color system
      badge: {
        activist: '#E32636',     // Signal Red
        organization: '#DAA520', // Premium Gold
        journalist: '#008080',   // Professional Teal
        citizen: '#1D9BF0',      // Classic Blue
      }
    },
  },
  plugins: [],
}
