---
name: premium-design
description: Enforces premium UI/UX design standards (Approachable Luxury) using the Color Master Palette, Morandi tones, glassmorphism, 4px grid spacing, and modern typography.
---

# Premium UI/UX Design System (設計總監視角)

This skill guides the AI to design and build stunning, high-end web interfaces. It is based on the **Color Master Palette** and **Glassmorphism (毛玻璃)** design systems.

## Trigger Keywords
- "美化網頁", "優化 UI", "設計樣式", "premium design", "luxurious ui", "glass effect"

## Core Design Tokens (Color Master Palette)

### Light Mode (Day)
- Base Background: `#F9FAFB` (Cool Gray 50)
- Surface (Card/Nav): `#FFFFFF` (Pure White)
- Primary Text: `#111827` (Gray 900)
- Secondary Text: `#6B7280` (Gray 500)
- Accent/Brand: `#3B82F6` (Royal Blue)
- Success: `#10B981` (Emerald)
- Warning/Error: `#EF4444` (Red)
- Border: `#E5E7EB` (Gray 200)

### Dark Mode (Night)
- Base Background: `#0F172A` (Slate 900)
- Surface (Card/Nav): `#1E293B` (Slate 800)
- Primary Text: `#F1F5F9` (Slate 100)
- Secondary Text: `#94A3B8` (Slate 400)
- Accent/Brand: `#60A5FA` (Sky Blue)
- Success: `#34D399` (Emerald Light)
- Warning/Error: `#F87171` (Red Light)
- Border: `#334155` (Slate 700)

## Layout & Typography Standards
1. **Grid Spacing**: All Margins, Paddings, and gaps must follow a 4px grid system (4, 8, 16, 24, 32, 48, 64px). Refuse random pixel values.
2. **Typography**: Font size must not be smaller than 14px for UI elements. Headings must have strong visual weight weight (Bold) vs content (Regular/Medium). Line height must be set to 1.5x (e.g., `line-height: 1.5`).
3. **Card Layering**: Cards must have a subtle border (`1px solid var(--border)`), soft shadow (`box-shadow`), and rounded corners (`border-radius: 8px` or `12px`) to create depth and floating layers.
4. **Responsive (Mobile First)**: Always test layouts at 375px viewport width. Ensure single-column stacking for mobile and min button touch target size of 44x44px.

## Glassmorphism (毛玻璃) Rules
- **Layer 1 (Background)**: Vibrant, high-blur gradients.
- **Layer 2 (Glass Pane)**: High blur (`backdrop-filter: blur(12px)`), high transparency (`background: rgba(255, 255, 255, 0.4)` or `rgba(15, 23, 42, 0.4)`), and delicate 1px white border with 0.1 opacity.

## Verification Loop
1. Verify color tokens -> verify: CSS variables map to the Color Master Palette.
2. Verify spacing rules -> verify: All margins and paddings are multiples of 4px.
3. Verify mobile responsiveness -> verify: Grid/Flex elements collapse cleanly under 375px width.
