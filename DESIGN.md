---
version: "alpha"
name: SkillsBuilder Design System
description: "Approachable Luxury" — A premium AI-tooling design system built on Morandi-style tones, card-based layering, and glassmorphism. Designed for both Light (Day) and Dark (Night) modes.

colors:
  # Light Mode
  base-light: "#F9FAFB"
  surface-light: "#FFFFFF"
  text-primary-light: "#111827"
  text-secondary-light: "#6B7280"
  accent-light: "#3B82F6"
  success-light: "#10B981"
  danger-light: "#EF4444"
  border-light: "#E5E7EB"

  # Dark Mode
  base-dark: "#0F172A"
  surface-dark: "#1E293B"
  text-primary-dark: "#F1F5F9"
  text-secondary-dark: "#94A3B8"
  accent-dark: "#60A5FA"
  success-dark: "#34D399"
  danger-dark: "#F87171"
  border-dark: "#334155"

typography:
  h1:
    fontFamily: "Inter, Outfit, system-ui, sans-serif"
    fontSize: 2.25rem
    fontWeight: "700"
    lineHeight: "1.2"
  h2:
    fontFamily: "Inter, Outfit, system-ui, sans-serif"
    fontSize: 1.5rem
    fontWeight: "600"
    lineHeight: "1.3"
  h3:
    fontFamily: "Inter, Outfit, system-ui, sans-serif"
    fontSize: 1.25rem
    fontWeight: "600"
    lineHeight: "1.4"
  body-md:
    fontFamily: "Inter, Outfit, system-ui, sans-serif"
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: "1.5"
  body-sm:
    fontFamily: "Inter, Outfit, system-ui, sans-serif"
    fontSize: 0.875rem
    fontWeight: "400"
    lineHeight: "1.5"
  label:
    fontFamily: "Inter, Outfit, system-ui, sans-serif"
    fontSize: 0.875rem
    fontWeight: "500"
    lineHeight: "1.5"
  caption:
    fontFamily: "Inter, Outfit, system-ui, sans-serif"
    fontSize: 0.75rem
    fontWeight: "400"
    lineHeight: "1.5"

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px

components:
  button-primary:
    backgroundColor: "{colors.accent-light}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "#2563EB"
    textColor: "#FFFFFF"
  button-primary-dark:
    backgroundColor: "{colors.accent-dark}"
    textColor: "#0F172A"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-dark:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  glass-pane:
    backgroundColor: "rgba(255, 255, 255, 0.4)"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  glass-pane-dark:
    backgroundColor: "rgba(15, 23, 42, 0.4)"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  nav:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary-light}"
    height: 64px
  nav-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-primary-dark}"
    height: 64px
---

## Overview

**Approachable Luxury** — the guiding philosophy of the SkillsBuilder design system.

The system balances premium aesthetics with functional clarity, drawing from Morandi-style muted tones and card-based layering. The goal is a UI that feels expensive without being intimidating — like a well-designed professional tool rather than a flashy consumer app.

Key aesthetic principles:
- **Morandi restraint**: Avoid over-saturated colours. Prefer cool grays, slate blues, and emerald greens tuned to reduce eye fatigue.
- **Breathing space**: Use generous but disciplined spacing (multiples of 4px) to let content breathe.
- **Glassmorphism accents**: Apply frosted-glass effects selectively for overlay panels, modals, and hero sections — never as a base surface.
- **Dual-mode parity**: Every design decision must work in both Light (Day) and Dark (Night) modes with equivalent contrast and visual weight.

## Colors

The palette is split into two mirror-image themes that an agent must treat as a toggle — never mix tokens from different modes in the same surface.

### Light Mode (Day)

- **Base Background (`#F9FAFB` · Cool Gray 50)**: The outermost canvas. Slightly off-white to reduce harshness. Use only for page backgrounds, never for cards.
- **Surface (`#FFFFFF` · Pure White)**: Card and navigation backgrounds. The "elevated" layer above the base.
- **Primary Text (`#111827` · Gray 900)**: Headlines, body copy, and all readable text requiring maximum contrast.
- **Secondary Text (`#6B7280` · Gray 500)**: Metadata, captions, timestamps, and supporting copy. Used to create information hierarchy without adding colour.
- **Accent/Brand (`#3B82F6` · Royal Blue)**: Call-to-action buttons, active states, links, focus rings, and loading indicators. This is the sole "action colour" in light mode.
- **Success (`#10B981` · Emerald)**: Positive feedback: pass states, confirmed actions, valid inputs.
- **Warning/Error (`#EF4444` · Red)**: Destructive actions, validation errors, critical warnings.
- **Border (`#E5E7EB` · Gray 200)**: Dividers, card outlines, input field borders. Must be subtle — a visual whisper, not a shout.

### Dark Mode (Night)

- **Base Background (`#0F172A` · Slate 900)**: Deep navy — evokes depth without being harsh black.
- **Surface (`#1E293B` · Slate 800)**: Cards and nav in dark mode. Lighter than base to create the same elevation effect.
- **Primary Text (`#F1F5F9` · Slate 100)**: Near-white, slightly warm — prevents the harshness of pure `#FFFFFF` on dark backgrounds.
- **Secondary Text (`#94A3B8` · Slate 400)**: Muted blue-gray — consistent with the slate family, creates harmony.
- **Accent/Brand (`#60A5FA` · Sky Blue)**: Lighter shade of the royal blue for dark backgrounds — ensures WCAG AA contrast compliance.
- **Success (`#34D399` · Emerald Light)**: Brighter than the light-mode emerald to maintain visibility on dark surfaces.
- **Warning/Error (`#F87171` · Red Light)**: Lightened red for dark-background contrast compliance.
- **Border (`#334155` · Slate 700)**: Very subtle — visible only as a faint outline, ensuring layers don't merge.

## Typography

All typography uses **Inter** (primary) or **Outfit** (secondary) — both geometric sans-serif families that convey precision and clarity. Fall back to `system-ui, sans-serif`.

**Core rules for agents:**
1. Minimum font size for any UI element: **14px (0.875rem)**. Never smaller for interactive or readable content.
2. Line height: always **1.5** for body text, **1.2–1.4** for headings.
3. Weight contrast: headings use `700` (Bold), body uses `400` (Regular), labels use `500` (Medium). Never use `300` (Light) for UI copy.
4. Letter spacing: default browser values; do not reduce for body text.

## Layout

### Spacing Grid

All padding, margin, and gap values **must** be multiples of 4px. Valid values:

```
4px · 8px · 16px · 24px · 32px · 48px · 64px
```

Agents must reject any spacing value not in this list (e.g., `10px`, `15px`, `22px` are non-compliant).

### Breakpoints

- **Mobile**: ≤ 375px (stack to single column; minimum touch target 44×44px)
- **Tablet**: 768px
- **Desktop**: 1280px

Always design Mobile First. Desktop is an enhancement of the mobile layout, not the reverse.

### Card Layering

Cards are the primary surface type. Every card must have:
- `border: 1px solid {colors.border}` (or dark equivalent)
- `border-radius: {rounded.lg}` (12px) for content cards, `{rounded.md}` (8px) for inline cards
- `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` (light) or `0 1px 3px rgba(0,0,0,0.3)` (dark)
- Sufficient internal padding: `{spacing.lg}` (24px) minimum

## Elevation & Depth

Three elevation tiers:

| Tier | Element | Shadow |
|:-----|:--------|:-------|
| 0 | Base background | none |
| 1 | Cards, inputs, nav | `0 1px 3px rgba(0,0,0,0.08)` |
| 2 | Dropdowns, tooltips, modals | `0 4px 16px rgba(0,0,0,0.12)` |

Glassmorphism elements use `backdrop-filter: blur(12px)` and belong at tier 2.

## Shapes

- `{rounded.sm}` (4px): Tags, badges, code snippets
- `{rounded.md}` (8px): Buttons, inputs, inline cards
- `{rounded.lg}` (12px): Content cards, panel containers
- `{rounded.xl}` (16px): Modal dialogs, glass panes, hero sections
- `{rounded.full}` (9999px): Avatars, pills, toggle switches

## Components

### Button (Primary)
- Background: `{colors.accent-light}` / hover: `#2563EB` (Blue 700)
- Text: `#FFFFFF`, weight `500`
- Padding: `10px 20px`, border-radius: `{rounded.md}`
- Dark variant: `{colors.accent-dark}`, text `#0F172A`

### Card
- Background: `{colors.surface-light}` / dark: `{colors.surface-dark}`
- Border: `1px solid {colors.border-light}` / dark: `{colors.border-dark}`
- Rounded: `{rounded.lg}`, padding: `{spacing.lg}`

### Glass Pane
- `backdrop-filter: blur(12px)`
- Light: `background: rgba(255, 255, 255, 0.4)`, border: `1px solid rgba(255,255,255,0.1)`
- Dark: `background: rgba(15, 23, 42, 0.4)`, border: `1px solid rgba(255,255,255,0.05)`
- Use only for overlays, modals, and hero feature sections.

### Navigation
- Height: `64px`, sticky, surface colour, `box-shadow` tier 1
- Logo left, primary actions right; hamburger at ≤768px

## Do's and Don'ts

### ✅ Do
- Use the 4px spacing grid consistently.
- Apply glassmorphism selectively as an accent, not a base surface.
- Ensure every interactive element has a visible focus ring using `{colors.accent}`.
- Test all colour combinations for WCAG AA (≥4.5:1 for text, ≥3:1 for UI components).
- Use card-based layering to create visual hierarchy.
- Keep typography weight contrast strong (700 vs 400).

### ❌ Don't
- Use plain saturated colours (pure `#FF0000`, `#00FF00`, `#0000FF`) — always use the curated palette.
- Mix light-mode and dark-mode tokens on the same surface.
- Use font sizes below 14px for any readable content.
- Use spacing values not on the 4px grid.
- Apply `backdrop-filter` to base-level surfaces (performance and visual coherence).
- Use `font-weight: 300` for any UI copy — it fails readability at small sizes.
- Create "403 buttons" — if a feature is restricted, hide or disable the button; never show it and let it fail.
