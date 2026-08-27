# BudgetRick Design System

Notion-inspired design tokens for BudgetRick.

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| primary | `#5645d4` | CTAs only |
| primary-pressed | `#4534b3` | Button hover/active |
| navy | `#0a1530` | Headers, hero bands |
| canvas | `#ffffff` | Page background (light) |
| surface | `#f6f5f4` | App background |
| ink | `#1a1a1a` | Primary text |
| charcoal | `#37352f` | Secondary text |
| steel | `#787671` | Muted text |
| hairline | `#e5e3df` | Borders, dividers |
| success | `#1aae39` | Under budget |
| warning | `#dd5b00` | Close to limit |
| error | `#e03131` | Over budget |

### Pastel Tints (category cards)

- tint-peach: `#ffe8d4`
- tint-rose: `#fde0ec`
- tint-mint: `#d9f3e1`
- tint-lavender: `#e6e0f5`
- tint-sky: `#dcecfa`
- tint-yellow: `#fef7d6`

## Typography

- Font: Inter (400, 500, 600, 700)
- Headings: 600-700 weight, charcoal/ink
- Body: 400 weight, 14-16px
- Labels: 500 weight, 12-13px, steel

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| notion-sm | 6px | Small elements |
| notion | 8px | Buttons |
| notion-lg | 12px | Cards |
| notion-xl | 16px | Modals |

## Component Rules

- **Buttons**: 8px rounded rectangles (NOT pills). Primary purple reserved for main CTAs.
- **Cards**: 12px rounded, subtle border or shadow.
- **Inputs**: 8px rounded, hairline border, focus ring in primary.
- **Tables**: Clean rows, hairline dividers, no heavy borders.
- **Sidebar**: Notion-style, icon + label navigation.
