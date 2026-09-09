---
name: Kinetic Civic
colors:
  surface: '#11131a'
  surface-dim: '#11131a'
  surface-bright: '#373941'
  surface-container-lowest: '#0c0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d1f27'
  surface-container-high: '#282a31'
  surface-container-highest: '#33343c'
  on-surface: '#e2e2ec'
  on-surface-variant: '#e4bdc2'
  inverse-surface: '#e2e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#ab888c'
  outline-variant: '#5b3f43'
  surface-tint: '#ffb2be'
  primary: '#ffb2be'
  on-primary: '#660025'
  primary-container: '#ff4e7c'
  on-primary-container: '#5a0020'
  inverse-primary: '#bc004b'
  secondary: '#c0c4e7'
  on-secondary: '#2a2f4a'
  secondary-container: '#434764'
  on-secondary-container: '#b2b6d8'
  tertiary: '#c5c5d5'
  on-tertiary: '#2e303c'
  tertiary-container: '#8f909e'
  on-tertiary-container: '#272935'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd9de'
  primary-fixed-dim: '#ffb2be'
  on-primary-fixed: '#400014'
  on-primary-fixed-variant: '#900038'
  secondary-fixed: '#dee1ff'
  secondary-fixed-dim: '#c0c4e7'
  on-secondary-fixed: '#151a33'
  on-secondary-fixed-variant: '#404561'
  tertiary-fixed: '#e1e1f1'
  tertiary-fixed-dim: '#c5c5d5'
  on-tertiary-fixed: '#191b26'
  on-tertiary-fixed-variant: '#444653'
  background: '#11131a'
  on-background: '#e2e2ec'
  surface-variant: '#33343c'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-edge: 32px
---

## Brand & Style

This design system is engineered for high-stakes civic engagement, combining the precision of a developer tool with the accessibility of a modern social platform. The visual narrative centers on **"The Digital Commons"**—a space that feels secure, authoritative, and momentum-driven.

The aesthetic leans into **Corporate Modernism** with a **Tech-Forward** edge. It utilizes deep, atmospheric backgrounds to reduce eye strain during long sessions of data review, punctuated by high-vibrancy "Action Pink" to signal agency and participation. The mood is intentionally professional and decisive, utilizing structured card layouts and precise linework to convey a sense of systemic order and institutional reliability.

## Colors

The palette is anchored by **Deep Space Neutrals**, using a multi-layered dark mode strategy.
- **Primary (Action Pink):** A high-chroma magenta used exclusively for calls to action, active states, and brand-critical identifiers. It represents the "voice" of the user.
- **Secondary (Navy Slate):** Used for elevated surfaces like cards and headers to provide soft contrast against the base.
- **Backgrounds:** A tiered system of `#0B0D14` (Base) and `#10121D` (Surface) ensures depth without relying on heavy shadows.
- **Accents:** Functional colors (success, warning, error) should be desaturated to maintain the sophisticated tech aesthetic, except when critical for user attention.

## Typography

The typography system uses a tri-font approach to balance impact with utility:
1. **Hanken Grotesk** handles the heavy lifting for headlines. Its sharp, contemporary geometry feels "tech-first" and authoritative.
2. **Inter** is the workhorse for all body copy and interface elements, chosen for its exceptional legibility in dark environments.
3. **JetBrains Mono** is used sparingly for metadata, codes, and "system-level" labels to reinforce the platform's precision and civic-tech roots.

High contrast is maintained by using pure white (`#FFFFFF`) for primary headings and a muted silver-grey (`#94A3B8`) for secondary body text.

## Layout & Spacing

The system uses a **Fixed-Fluid Hybrid Grid**. 
- **Desktop:** A 12-column grid with a max-width of 1440px. Content is centered. Sidebars are fixed at 280px.
- **Tablet:** An 8-column grid with 24px margins.
- **Mobile:** A 4-column grid with 16px margins.

Spacing follows a strict **8px base unit** rhythm to ensure mathematical harmony. Layouts should prioritize information density while maintaining "breathing room" through purposeful 40px+ gaps between major content sections. Cards use internal padding of 24px (md) to ensure content feels premium and not cramped.

## Elevation & Depth

In this dark-themed system, depth is communicated through **Tonal Elevation** and **Subtle Outlines** rather than heavy shadows:
- **Level 0 (Base):** The darkest neutral (`#0B0D14`).
- **Level 1 (Cards/Sidebar):** Slightly lighter (`#10121D`). These surfaces receive a 1px solid border of `#1E293B` to define their edges.
- **Level 2 (Modals/Popovers):** The lightest background tier (`#1E293B`). These are the only elements to receive an ambient shadow (24px blur, 0.4 opacity, black).

A "Ghost Glow" effect is used for active states: a subtle primary-colored outer glow (4px blur) combined with the primary border.

## Shapes

The design uses **Soft Geometry (0.25rem / 4px base)**. 
This subtle rounding strikes a balance between the rigid "seriousness" of government platforms and the approachability of modern SaaS. 
- **Standard UI (Buttons, Inputs):** 4px radius.
- **Containers (Cards, Sections):** 8px (rounded-lg) to provide a distinct frame for content.
- **Icons:** Should follow a linear, 2px stroke weight with slight corner rounds to match the UI.

## Components

### Buttons
- **Primary:** Solid Action Pink with white text. High contrast, no gradient.
- **Secondary:** Transparent background with a 1px Navy Slate border. Text in white.
- **Ghost:** No border or background. Action Pink text. Used for low-priority utility actions.

### Inputs
- Background matches the surface level (Level 1).
- 1px border using `#334155`.
- On focus: Border changes to Action Pink with a subtle 2px outer glow. Labels use `label-caps` typography positioned above the field.

### Cards
- Background: Level 1 Tonal Surface.
- Border: 1px `#1E293B`.
- Header: Uses a slightly darker sub-section or a thin 1px bottom divider to separate title from body content.

### Chips & Tags
- Used for status (e.g., "Federal," "Active").
- Small, `label-caps` font. 
- Dark backgrounds with high-contrast text colors (e.g., dark red background with light red text).

### Navigation
- Sidebar-led navigation. Icons are 20px, stroke-based. 
- Active state: Vertical 4px "pill" indicator on the far left or right of the menu item using Action Pink.