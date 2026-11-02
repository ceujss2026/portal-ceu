---
name: Civic Career Portal
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f484f'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6f7880'
  outline-variant: '#bfc8d0'
  surface-tint: '#00658e'
  primary: '#00628b'
  on-primary: '#ffffff'
  primary-container: '#037cae'
  on-primary-container: '#fcfcff'
  inverse-primary: '#85cfff'
  secondary: '#246486'
  on-secondary: '#ffffff'
  secondary-container: '#9fd9ff'
  on-secondary-container: '#1e5f81'
  tertiary: '#745800'
  on-tertiary: '#ffffff'
  tertiary-container: '#936f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7e7ff'
  primary-fixed-dim: '#85cfff'
  on-primary-fixed: '#001e2e'
  on-primary-fixed-variant: '#004c6c'
  secondary-fixed: '#c6e7ff'
  secondary-fixed-dim: '#94cdf4'
  on-secondary-fixed: '#001e2d'
  on-secondary-fixed-variant: '#004c6b'
  tertiary-fixed: '#ffdf9a'
  tertiary-fixed-dim: '#efc04b'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4300'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an authoritative, accessible, and structured civic interface tailored for official educational services, career pathway planning, and institutional administration under the Ministry of Education.

The visual direction balances institutional governance with modern, approachable civic utility:
- **Tone:** Authoritative, reassuring, structured, transparent, and service-oriented.
- **Target Audience:** Secondary and pre-university students, school career counselors, vocational institutions, and educational administrators operating across bilingual environments (Bahasa Melayu and English).
- **Core Style:** Modern Civic / Public Sector Utility. Surfaces are airy, content hierarchies prioritize quick scanning under varied mobile network conditions, and card layouts rely on defined soft contours rather than heavy visual noise or complex skeumorphism.
- **Form Factor Strategy:** Mobile-first responsive execution, providing dedicated touch ergonomics for hybrid Android application use, scaling smoothly into high-density desktop workflows for school administration.

## Colors

The palette is derived directly from the official departmental identity, grounding the civic presence in institutional trust and clarity.

### Primary & Brand Colors
- **Primary Cerulean (`#1883B5`):** Key brand touchpoint for active states, interactive controls, navigation bars, and primary links.
- **Deep Navy (`#0E5677`):** High-contrast structural tone for institutional banners, section headers, desktop sidebars, and elevated containers.
- **Accent Metallic Gold (`#C59A27`):** Selective highlight tone reserved for certified achievements, official circular notices, pathway milestones, and government seal accents.

### Neutral & Surface Palette
- **Canvas Background (`#F4F7FA`):** Low-strain, cool tinted civic background preventing stark white glare in field usage.
- **Surface Pure White (`#FFFFFF`):** High-clarity foreground for interactive cards, data sheets, and modal views.
- **Slate Text Primary (`#0F172A`):** Core body and headline color achieving WCAG AAA contrast against white surfaces.
- **Muted Slate (`#64748B`):** Descriptive metadata, subtitles, timestamps, and placeholder copy.
- **Subtle Border (`#E2E8F0`):** Default card outlines and input dividing lines.
- **Soft Accent Border (`#89C4F4`):** Focused states, active selection highlights, and structural emphasis rings.

### Semantic Tiers
- **Success / Validated:** Text `#15803D` on `#DCFCE7` background (verified qualifications, completed guidance logs).
- **Warning / Pending Action:** Text `#B45309` on `#FEF3C7` background (deadlines approaching, missing student declarations).
- **Error / Urgent:** Text `#B91C1C` on `#FEE2E2` background (overdue administrative logs, application errors).
- **Neutral / Draft Status:** Text `#475569` on `#F1F5F9` background (archived programs, standard advisories).

## Typography

Typography pairs `Plus Jakarta Sans` for display and section titling with `Inter` for data parsing, bilingual forms, and administrative reading.

- **Bilingual Typographic Harmony:** Both typefaces provide broad Latin character coverage with uniform vertical metrics, ensuring that Malay language text (containing longer compound nouns and diacritics) maintains identical bounding heights and baseline flow as English translations without triggering overflow bugs.
- **Hierarchy:** Display headers employ a slightly relaxed tracking to maintain dignity and clarity, while `Inter` handles dense tabular data, qualification criteria, and guidance checklists with high open apertures for mobile screens.
- **Clarity Over Embellishment:** Weights are strictly constrained to 400 (Regular), 500 (Medium), 600 (Semi-bold), and 700 (Bold) to preserve performance on mobile web and lower-tier Android client devices.

## Layout & Spacing

The layout model employs a mobile-first responsive fluid system constructed on an 8px grid (with a 4px half-step for micro-alignments).

- **Mobile Viewports (< 768px):** Content adheres to a 4-column structure with an outer canvas margin of `16px` (`margin: 1rem`) and a column gutter of `16px`. Structural controls are vertically aligned for thumb reach, prioritizing single-column stacks with minimum touch boundaries of 44×44px.
- **Tablet / Split Viewports (768px - 1024px):** Reflows into an 8-column layout with `32px` margins. Side panels fold into modal sheets or contextual drawers to accommodate counseling review forms.
- **Desktop Admin Workspaces (> 1024px):** Expands to a structured 12-column layout bounded by a max container width of `1280px` (`margin-desktop: 3rem`, `gutter-desktop: 1.5rem`). Facilitates persistent left-rail navigation for administrative personnel, alongside side-by-side student profile and pathway auditing tools.

## Elevation & Depth

This design system uses subtle, diffused ambient shadows and crisp architectural borders to express depth, avoiding heavy drops or dark skeuomorphic bevels.

- **Level 0 (Flat Canvas):** `#F4F7FA` base surface with no shadow. Used for page backgrounds, utility gutters, and muted card headers.
- **Level 1 (Card Rest State):** `#FFFFFF` surface accompanied by a structural `1px solid #E2E8F0` border and a soft ambient shadow: `0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Interactive Hover / Mobile Touch Focus):** Elevated card or action state. Retains `1px solid #89C4F4` with an expanded diffusion: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Floating Bars, Popovers & Drawers):** Touch navigation docks and dropdown menus: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
- **Level 4 (System Modals & Dialogs):** Centered civic dialogue windows and administrative panels: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The geometric identity applies a consistent tiered corner radius structure to combine civic structure with modern soft card geometry:

- **Cards & Primary Modules:** 16px (`1rem` / `rounded-lg`). Creates a clean, approachable card surface for career tracks, school notices, and information cards.
- **Controls & Form Elements:** 10px (`0.625rem`). Applied to text input fields, standard action buttons, dropdowns, and date pickers to provide balanced ergonomic precision.
- **Pills, Chips & Badges:** `9999px` (`rounded-full`). Used strictly for categorical filters, bilingual language toggles (BM/EN), status labels, and verification tags.
- **Micro-Elements:** 4px to 6px (`rounded-sm`). Dedicated to nested checkboxes, micro progress indicator ticks, and badge flags.

## Components

### Buttons & Interactive Touch Controls
- **Ergonomics:** All interactive buttons possess an enforced minimum boundary of `44px` in height and width for touch accessibility.
- **Primary Button:** Filled Cerulean Blue (`#1883B5`) with white typography (`#FFFFFF`), 10px corner radius, `space-sm` vertical by `space-lg` horizontal padding. Focus state includes a `2px` offset ring in `#89C4F4`.
- **Secondary Button:** Outlined container with a 1px border of `#1883B5`, transparent background, and `#0E5677` typography.
- **Institutional Neutral Button:** Surface Pure White (`#FFFFFF`) with `#E2E8F0` border, `#0F172A` text, and subtle Level 1 ambient shadow.

### Cards & Content Containers
- **Content Card:** Built using Pure White (`#FFFFFF`) background, 16px corner radius, `1px solid #E2E8F0`, and Level 1 elevation.
- **Official Notice Card:** Accented with an institutional 4px left-border stripe in Metallic Gold (`#C59A27`) or Cerulean Blue (`#1883B5`), designating ministry announcements and circulars.
- **Interactive Pathway Card:** Includes responsive hover/touch feedback shifting border tone from `#E2E8F0` to `#89C4F4` with Level 2 elevation lift.

### Input Fields & Selectors
- **Geometry:** Height calibrated to 44px (touch standard) with a 10px corner radius and a 1px border in `#E2E8F0`.
- **Field Styling:** Background of `#FFFFFF`, body text in `#0F172A`, placeholder copy in `#64748B`.
- **States:** Active focus transforms border to `#1883B5` alongside a 3px diffused outer halo using `rgba(24, 131, 181, 0.15)`. Error states convert the border to `#B91C1C`.
- **Bilingual Affordance:** Labels sit persistently above the input field (`label-md` in `#0F172A`) with supplementary translation helpers rendered in `#64748B` (`body-sm`).

### Chips, Pills & Status Badges
- **Status Pills:** Pill geometry (`9999px` radius) with `4px` vertical by `12px` horizontal padding.
  - *Certified/Active:* `#DCFCE7` surface with `#15803D` semi-bold text.
  - *Pending Verification:* `#FEF3C7` surface with `#B45309` semi-bold text.
  - *Requires Action:* `#FEE2E2` surface with `#B91C1C` semi-bold text.
  - *Information/Standard:* `#F1F5F9` surface with `#475569` text.
- **Filter Chips:** 36px touch height, pill-shaped, surfaced with `#FFFFFF` and `#E2E8F0` borders. Selected filter switches to Deep Navy (`#0E5677`) with white text.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** 20×20px box within a 44×44px touch target. 4px rounded radius, `1.5px solid #CBD5E1`. Checked state fills `#1883B5` with a white checkmark.
- **Radio Buttons:** 20×20px circle with a solid concentric dot in `#1883B5` on an active state.

### Lists & Navigation
- **Navigation Dock (Mobile / Hybrid Android):** Fixed bottom utility bar using Surface White (`#FFFFFF`) with a top border in `#E2E8F0` and Level 3 elevation. Height minimum 64px, dividing primary views (Beranda/Home, Kerjaya/Pathways, Kaunseling/Counseling, Profil/Profile).
- **Data & Assessment List Items:** Divided by 1px horizontal borders in `#E2E8F0`. List rows maintain a minimum 56px height to prevent accidental mis-taps on touch devices.