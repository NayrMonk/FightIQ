---
name: FightIQ
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#e6bcbc'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#ad8887'
  outline-variant: '#5d3f3f'
  surface-tint: '#ffb3b3'
  primary: '#ffb3b3'
  on-primary: '#680015'
  primary-container: '#ff5261'
  on-primary-container: '#5b0011'
  inverse-primary: '#bf002f'
  secondary: '#8affc0'
  on-secondary: '#003822'
  secondary-container: '#00e999'
  on-secondary-container: '#00633f'
  tertiary: '#c8c6c8'
  on-tertiary: '#303032'
  tertiary-container: '#929092'
  on-tertiary-container: '#2a292c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad9'
  primary-fixed-dim: '#ffb3b3'
  on-primary-fixed: '#400009'
  on-primary-fixed-variant: '#920022'
  secondary-fixed: '#4fffb0'
  secondary-fixed-dim: '#00e295'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#005233'
  tertiary-fixed: '#e4e2e4'
  tertiary-fixed-dim: '#c8c6c8'
  on-tertiary-fixed: '#1b1b1d'
  on-tertiary-fixed-variant: '#474649'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display-xl:
    fontFamily: Archivo Narrow
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Archivo Narrow
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  stats-numeric:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for elite performance and psychological focus. It caters to combat sports athletes and coaches who require a high-intensity, data-driven environment that minimizes distraction.

The visual style is **High-Contrast Professionalism** with a blend of **Glassmorphism**. It utilizes a "Dark Mode First" architecture to reduce eye strain in low-light gym environments while making data points "pop" with aggressive clarity. The aesthetic is raw and functional, mirroring the discipline of the mats, while remaining sophisticated through precise spacing and subtle translucent layering.

## Colors

The palette is built on deep obsidian tones to emphasize "Midnight" focus. 

- **Primary (Electric Crimson):** Reserved for critical actions, active timers, and high-intensity zones.
- **Secondary (Neon Mint):** Used for recovery phases, completion states, and positive performance deltas.
- **Surface (Combat Grey):** Defines the "work area." Used for cards and containers to separate content from the void of the background.
- **Accents:** Use 70% opacity on neutral text for secondary information to maintain a clear visual hierarchy against the pure white primary headers.

## Typography

This design system uses **Archivo Narrow** for all high-impact, data-heavy, and heading elements. Its condensed nature allows for larger font sizes and better legibility of long numbers or names within tight mobile layouts. 

**Inter** is utilized for body copy and UI labels to ensure maximum readability and a systematic, clean feel. 

- **Numerical Data:** Always use Archivo Narrow for timers and heart rate displays.
- **Upper Case:** Use `label-bold` for navigation items and section headers to evoke a sense of authority and structure.

## Layout & Spacing

The layout follows a strict **8px grid system** to ensure mathematical harmony. 

- **Grid:** On desktop, use a 12-column fluid grid with 24px gutters. On mobile, use a 4-column grid with 16px margins.
- **Density:** Maintain high density for data dashboards but increase vertical rhythm (using `lg` and `xl` spacing) for training walkthroughs to keep the athlete focused on one movement at a time.
- **Safe Areas:** Ensure all interactive elements have a minimum touch target of 48px, especially critical for sweaty or gloved hands during training sessions.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism**, rather than traditional shadows.

- **Level 0 (Background):** Pure #0A0A0B.
- **Level 1 (Cards/Surfaces):** #1C1C1E.
- **Level 2 (Active/Floating):** Use a background blur (20px) with a semi-transparent primary or surface tint (15% opacity). 
- **Outlines:** Use a 1px solid border of #FFFFFF at 10% opacity for all cards to define edges against the dark background without adding visual weight.
- **Glow:** Key performance indicators (like active timers) may use a subtle outer glow of the Primary color (15-20% spread) to simulate an emissive digital display.

## Shapes

The design system utilizes **Soft** corners (8px) to maintain a professional, high-performance edge while avoiding the aggressive sharpness of pure 0px corners. 

- **Standard Elements:** 8px radius (buttons, cards, inputs).
- **Large Containers:** 12px radius for secondary dashboard sections.
- **Data Rings:** Circular elements remain perfectly round (50% radius) to contrast against the structured, rectangular grid of the UI.

## Components

### High-Contrast Timers
The core of the training experience. Use `display-xl` Archivo Narrow. The countdown uses Electric Crimson (#FF2E4D), while the interval progress is tracked by a 4px thick circular stroke.

### Intensity Rings
Concentric circles representing Heart Rate, Output, and Technique. Use a 12px stroke width with rounded caps. Background strokes should be Surface color (#1C1C1E) with the active progress in Primary or Secondary colors.

### Performance Cards
Utilize the 1px white border (10% opacity) and a subtle backdrop blur. Headers within cards must use `label-bold` in Neon Mint (#22F2A1) for quick scanning of positive metrics.

### Conversational AI Chat
The "FightIQ Assistant" interface uses a left-aligned bubble style for the AI and right-aligned for the user. AI bubbles use the Surface color (#1C1C1E), while User bubbles use a dark Electric Crimson gradient to signify action and intent.

### Action Buttons
- **Primary:** Solid Electric Crimson with white `label-bold` text.
- **Secondary:** Outlined (1px) Neon Mint for recovery/log actions.
- **States:** On press, reduce opacity to 80%. Do not use traditional "lightening" effects; keep the colors saturated and deep.

### Input Fields
Dark backgrounds (#0A0A0B) with 1px borders. Focus state triggers a 1px Neon Mint border to signal "Ready for Input."