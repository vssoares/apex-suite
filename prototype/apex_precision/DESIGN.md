---
name: Apex Precision
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#bec8d2'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#88929b'
  outline-variant: '#3e4850'
  surface-tint: '#89ceff'
  primary: '#89ceff'
  on-primary: '#00344d'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#006591'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00b17b'
  on-tertiary-container: '#003b26'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#111317'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: 1.625rem
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Geist
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: '0'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.125rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.04em
  metric-display:
    fontFamily: JetBrains Mono
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system defines an ultra-refined, high-performance desktop utility environment engineered for enthusiasts, overclockers, competitive players, and creative professionals. It departs decisively from the over-saturated, aggressive "gamer" aesthetics of the past decade—rejecting synthetic RGB flares, heavy drop shadows, and noisy polygonal accents in favor of architectural minimalism, instrument-grade legibility, and technical serenity.

The aesthetic blends **Modern Technical Minimalism** with **Industrial Precision Instrumentation**:
- **Tone**: Focused, deterministic, laboratory-clean, calm, and uncompromisingly fast.
- **Visual Weight**: Matte layered dark surfaces that absorb ambient visual distraction, allowing telemetry, frequency curves, and calibration metrics to stand out with razor-sharp acuity.
- **Interaction Feel**: Instantaneous, tactile, firm, and fluid—evoking high-end rack-mounted audio gear and aeronautical displays rather than disposable consumer software.

## Colors

The palette operates under a strict luminance discipline built upon deep slate-zinc neutral foundations. Light is treated as data, never decorative noise.

### Foundations & Surfaces
- **Canvas Base (`#0d0f12`)**: Deep void slate. Used for master application window backgrounds and frame gutters.
- **Surface Layer 1 (`#14171d`)**: Primary card, panel, and dashboard container background.
- **Surface Layer 2 (`#1c2027`)**: Elevated utility blocks, table headers, input wells, and segmented controls.
- **Surface Active / Hover (`#222731`)**: Micro-interactive states and highlighted table rows.

### Structural Lines
- **Subtle Structural Border (`#282d37`)**: The single source of structural separation across panels, dividers, and card boundaries. Replaces drop shadows entirely.
- **Border Focus / Interactive (`#384252`)**: Hover and active container boundary definition.

### Signal & Accents
- **Primary Accent (`#0ea5e9` - Electric Sapphire)**: Primary actionable controls, key switch toggles, active tab markers, and dominant telemetry line indicators.
- **Secondary Accent (`#38bdf8` - Crisp Sky)**: Micro-data highlights, active curve nodes, crosshairs, and live refresh pulses.
- **System Status (`#10b981` - Soft Emerald)**: Verified hardware health, stable clock indications, successful color profile matches, and optimal thermal brackets.
- **Warning & Hazard**: Amber (`#f59e0b`) for threshold warnings; Crimson (`#ef4444`) for critical thermal throttle or voltage limit states.

### Typography & Content
- **Text Primary (`#f8fafc`)**: Crisp neutral white for primary readouts, headlines, and primary values.
- **Text Secondary (`#94a3b8`)**: Muted cool gray for metric units, axis labels, field labels, and secondary metadata.
- **Text Tertiary (`#64748b`)**: Inactive states, disabled indicators, and fine grid guidelines.

## Typography

Typography acts as a calibrated instrument gauge. The system utilizes **Geist** for crisp structural layout and readable UI copy, paired with **JetBrains Mono** for all telemetry figures, hardware addresses, timing parameters, and calibration tables.

### Rules of Usage
- **Tabular Alignment**: All hardware metrics, temperatures, clock speeds, and millivolt values must strictly employ `JetBrains Mono` with tabular lining figures to prevent horizontal jitter during real-time data updates.
- **Hierarchy & Case**: Micro-labels (`label-sm`) indicating device state or axis metadata are set in full uppercase with expanded letter-spacing (+0.04em) for immediate recognition at rapid glance speeds.
- **Restraint**: Never apply gradient fills or chromatic glows to typographic elements. Contrast is derived exclusively through strict font weights (`400`, `500`, `600`) and the step-down from `#f8fafc` to `#94a3b8`.

## Layout & Spacing

The desktop architecture is constructed on a rigid **multi-pane workstation layout** designed for fixed or dynamically resizable non-browser application windows.

### Layout Mechanics
- **Master Grid**: 12-column modular grid with `gutter` spacing of `1rem` (16px) and an outer window boundary margin of `1.25rem` (20px).
- **Density Scaling**: Designed for dense spatial efficiency. Modules are packed to allow concurrent viewing of GPU core charts, fan curves, memory sub-timings, and monitor ICC profiling status without deep scrolling.
- **Split-Pane Architecture**:
  - **Global Sidebar / Nav**: Fixed 220px compact navigation rail docked to the left edge.
  - **Telemetry Inspector**: Optional collapsible right drawer (320px) for pin-point real-time logging.
  - **Central Viewport**: Fluid workspace adapting to the remaining window real estate with multi-card row arrangements.
- **Window Minima**: Minimum supported desktop shell dimension is 1024×680px; primary target workstation layout is optimized for 1440p and 4K displays with 100% or 125% OS scaling.

## Elevation & Depth

This design system avoids all diffuse, colorful, or fuzzy skeuomorphic drop shadows. Instead, visual depth and hierarchy are constructed through **flat tonal layering and razor-sharp micro-borders**:

1. **Base Layer (Elevation 0 - `#0d0f12`)**: The structural canvas host. Contains primary panel splitters and background gutters.
2. **Surface Layer (Elevation 1 - `#14171d`)**: All modular cards, chart containers, and settings groups. Outlined with a precise 1px stroke of `#282d37`.
3. **Elevated Utility Layer (Elevation 2 - `#1c2027`)**: Interactive controls, inner tool wells, sliders, drop-down menus, and modal dialogs.
4. **Focused / Flyout Layer (Elevation 3 - `#222731`)**: Contextual popovers, tooltip readouts, and monitor target crosshairs.

### Boundary Discipline
- Never use blur radii larger than 0px for layout definition.
- When an overlay or popover requires visual detachment from high-density data, apply a strictly neutral, ultra-fine drop-occlusion shadow: `0 4px 16px -2px rgba(0, 0, 0, 0.65)`, backed by a 1px `#384252` border. No chromatic accent tinting is permitted in shadows.

## Shapes

The shape system adopts a **Soft (Level 1)** geometric aesthetic. Corners remain compact, precise, and disciplined—communicating technical software rather than a consumer mobile application.

- **Standard Elements (`rounded`, 0.25rem / 4px)**: Buttons, text fields, small toggles, badge chips, segmented control switches, and table cells.
- **Container Panels (`rounded-lg`, 0.5rem / 8px)**: Hardware cards, monitor calibration viewports, modal surfaces, and real-time graph enclosures.
- **Curves & Gauges**: Circular meters and graph curves must use smooth, mathematical anti-aliased vectors, retaining sharp 4px terminations at terminal endpoints.

## Components

### Buttons
- **Primary Action**: Solid `#0ea5e9` fill, `#f8fafc` label (Geist 500), 4px border radius. Hover: `#38bdf8`. Active: `#0284c7`. No glow; instant 100ms ease transition.
- **Secondary / Ghost**: Background `#1c2027`, 1px border `#282d37`, `#f8fafc` label. Hover: border `#384252`, background `#222731`.
- **Destructive**: Background transparent, 1px border `#ef4444` at 40% opacity, label `#ef4444`. Hover: background `rgba(239, 68, 68, 0.12)`.

### Input Fields & Value Steppers
- Matte background `#14171d` with 1px border `#282d37`.
- Focus state: border `#0ea5e9`, no halo or focus ring, subtle interior background shift to `#1c2027`.
- Numeric tuning inputs pair with fixed mono-spaced unit tags (e.g., `MHz`, `mV`, `cd/m²`, `K`) colored in `#64748b` docked inside the right boundary.

### Segmented Switch Controls & Radios
- Contained within a `#0d0f12` inset well with 1px `#282d37` border.
- Selected tab: `#1c2027` background, 1px `#384252` border, crisp white text `#f8fafc`.
- Unselected tab: transparent background, `#94a3b8` text. Hover shifts text to `#f8fafc`.

### Checkboxes & Micro Toggles
- Square 16×16px box, 3px radius, 1px border `#384252`.
- Checked state: `#0ea5e9` fill with a sharp white checkmark vector.
- Toggle switches: 34×18px track in `#1c2027` with 1px border `#282d37`. Active track shifts to `#0ea5e9`. Thumb: solid `#f8fafc` 12×12px square with 2px radius.

### Cards & Telemetry Panels
- Container: Background `#14171d`, border 1px `#282d37`, corner radius 8px (`rounded-lg`).
- Header: Divided from card body by a horizontal 1px line (`#282d37`), housing an icon, panel title (`headline-md`), and quick status tag.
- Content zone: Padding `space-lg` (20px), organized using uniform metric columns and graph areas.

### Status Badges & Chips
- Background: 10% opacity tint of signal color (e.g., `rgba(16, 185, 129, 0.10)` for emerald).
- Border: 1px solid at 25% opacity of signal color.
- Typography: `label-sm`, monospace uppercase, 100% opacity of the signal color.
- Marker: Optional 4px solid status dot aligned left of label.

### Interactive Tuning Curves & Sliders (Hardware Specific)
- **Track**: 4px height, background `#1c2027` with a 1px border `#282d37`.
- **Filled Rail**: Solid `#0ea5e9` without gradients.
- **Node Handle**: 12×12px square, rotated 45 degrees (diamond geometry), solid white `#f8fafc` with a 1px `#0ea5e9` perimeter stroke.
- **Graph Grids**: 1px dashed grid lines in `#1c2027`, with baseline zero-points pinned in `#282d37`. Crosshair readouts appear as clean 1px solid lines in `#38bdf8` accompanied by floating monospace pill tags.