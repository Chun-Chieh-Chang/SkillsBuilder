# Concept: Consulting Box & Premium Presentation Style

## Overview
The Consulting Box Style (also known as Consulting Slide layout or Swiss Grid Presentation Style) is a high-density, professional layout framework optimized for executive summaries, financial audits, strategic alignment decks, and research briefs. It ensures extreme readability, harmonious contrast, and clear visual hierarchy.

## 🎨 Color Master Palette (Aesthetic Guidelines)
Every visual element must adhere to the HSL-tailored Premium Palette to reduce eye strain and establish a modern, high-end feel. Do not use default high-saturation colors.

| UI Element | Light Mode (Day) | Dark Mode (Night) | Psychological Purpose / Application |
| :--- | :--- | :--- | :--- |
| **Background (Base)** | `#F9FAFB` (Cool Gray 50) | `#0F172A` (Slate 900) | Soothing base layer for visual comfort |
| **Surface (Card/Nav)**| `#FFFFFF` (Pure White) | `#1E293B` (Slate 800) | Elevating content blocks and cards |
| **Primary Text**      | `#111827` (Gray 900) | `#F1F5F9` (Slate 100) | Maximum reading clarity and contrast |
| **Secondary Text**    | `#6B7280` (Gray 500) | `#94A3B8` (Slate 400) | Subdued information hierarchy |
| **Accent/Brand**      | `#3B82F6` (Royal Blue) | `#60A5FA` (Sky Blue) | Directing focus to Call to Action (CTA) |
| **Success/Safe**      | `#10B981` (Emerald) | `#34D399` (Emerald Light) | Confirmations and positive statuses |
| **Warning/Error**     | `#EF4444` (Red) | `#F87171` (Red Light) | Warnings, alerts, and destructive actions |
| **Border/Divider**    | `#E5E7EB` (Gray 200) | `#334155` (Slate 700) | Micro-distinctions, kept subtle and thin |

## 📐 Layout & Spacing Rules
1. **Grid Multiples**: All padding, margin, and gaps must follow multiples of `4px` (`4`, `8`, `16`, `24`, `32`, `48`). No arbitrary pixel sizes.
2. **Consulting Cards**: Cards should feature subtle borders (`1px solid var(--border)`), a slight hover lifting animation (`transform: translateY(-4px)`), and thin elegant shadows to create premium depth.
3. **Typography Scaling**:
   - Title: `Bold`, size $\ge 24\text{px}$, line-height $1.25\times$.
   - Body: `Regular`, size $\ge 14\text{px}$ for readability, line-height $1.5\times$ to avoid dense visual clutter.
4. **Mobile Adaptability**: 
   - Mobile View ($\le 375\text{px}$ width): Grid layouts must stack vertically.
   - Click targets and touch regions must be $\ge 44\text{px} \times 44\text{px}$.

## 🗂️ Core Layout Patterns (Consulting Box Grids)
- **2x2 Quad Grid**: Four identical cards arranged in a grid for comparing quadrant items.
- **Double-Column Q&A Cards**: A split layout (e.g., FAQ style) featuring questions in highlighted accent cards on the left, and corresponding answers on the right.
- **Split Editorial (Asymmetric)**: 40% editorial emphasis card + 60% structured content box for premium editorial layouts.

## References
- `wiki/entities/ppt-master.md`: PPT Master pipeline specs.
- `skills/ppt-master/references/shared-standards.md`: Coding details.
