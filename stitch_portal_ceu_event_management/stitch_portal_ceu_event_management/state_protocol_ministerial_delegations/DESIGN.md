---
name: State Protocol & Ministerial Delegations
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
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#206962'
  on-secondary: '#ffffff'
  secondary-container: '#a8ede3'
  on-secondary-container: '#266d66'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#aaefe6'
  secondary-fixed-dim: '#8fd3ca'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  ocean-dark: '#0369a1'
  ocean-light: '#38bdf8'
  ocean-wash: '#e0f2fe'
  teal-accent: '#167f77'
  teal-soft: '#e6f7f5'
  gold-hover: '#d97706'
  gold-subtle: '#fef3c7'
  semantic-error: '#ef4444'
  surface-bg: '#f8fafc'
  card-border: '#e2e8f0'
typography:
  display-hero:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes an authoritative ministerial digital experience balanced with high-efficiency mobile fluidity. Designed for ministerial officers, secondary educational institutions, external tertiary agencies, and diplomatic or industry stakeholders, the interface synthesizes sovereign credibility with modern administrative ergonomics.

The visual style follows a Corporate Modern design language rooted in disciplined structure, crystalline typographic hierarchy, and tactile clarity. High-density information modules—including ministerial summit schedules, VIP credentialing, seating arrangements, and accreditation passes—are organized into structured, high-legibility cards. The emotional tone conveys institutional pride, administrative punctuality, and welcoming hospitality, specifically calibrated for reliable rendering in web portals, mobile displays, and WebView environments.

## Colors

The color architecture shifts the primary anchor to authoritative ocean blue while preserving deep ministerial teal as an institutional secondary partner. This relationship guarantees WCAG AAA contrast across formal daylight, outdoor security gates, and ambient hall illumination:

- **Primary Ocean Blue (`#0284C7` / `#0369A1`)**: The leading institutional anchor. Applied to primary app navigation, authoritative banners, top progress bars, and critical credential verification seals. Hero containers utilize an authoritative directional gradient from `#38BDF8` to `#0284C7` (or `#0369A1`).
- **Secondary Teal (`#0C5C55` / `#167F77`)**: The established ministerial grounding hue. Applied to agency categorization pills, secondary action workflows, formal session track dividers, and institutional registry badges.
- **Tertiary Amber & Gold (`#F59E0B`)**: Evokes state protocol and national distinction. Reserved strictly for top-level transactional calls-to-action (RSVP confirmation, ticket issuance), confirmed badge highlights, and vehicular pass security perimeters.
- **Surfaces & Neutrals**: The foundation sits on a cool slate background (`#F8FAFC`). Pure crisp white (`#FFFFFF`) is reserved for card containers and elevated dialogs. Deep slate navy (`#0F172A`) ensures effortless reading on varied displays, complemented by structural borders in `#E2E8F0` and muted secondary text in `#64748B`.
- **System States**: Operational errors, deadlines, and security revocations use `#EF4444`, while informational highlights utilize `#E0F2FE` (Ocean Wash) and `#E6F7F5` (Teal Soft).

## Typography

The typographic system creates an unambiguous hierarchy pairing the geometric structure of **Manrope** for authoritative headers and display figures with the humanist legibility of **Plus Jakarta Sans** for running operational content:

- **Display & Headlines**: Set in Manrope with slightly condensed tracking (`-0.02em` to `-0.01em`). This maintains balanced line economy across formal bilingual titles and institutional terminology.
- **Body Content**: Set in Plus Jakarta Sans to maximize legibility across varying screen densities and form viewports.
- **Labels & Input Fields**: Labels prioritize weights `600` and `700` to ensure instant scannability for official registration records, national identification inputs, and delegation tallies.

## Layout & Spacing

The layout model is governed by an 8pt spatial rhythm adapted for cross-platform fluidity:

- **Mobile Viewport (&lt; 640px)**: 4-column responsive grid with `margin-mobile` (`1rem`) and `gutter-mobile` (`0.75rem`). Full-width structural cards ensure thumb-friendly readability.
- **Tablet (640px – 1024px)**: 8-column layout utilizing `margin` (`1.5rem`) and `gutter` (`1rem`) to support side-by-side delegation panels and calendar views.
- **Desktop Secretariat (&gt; 1024px)**: 12-column architecture capped at an optimal `1200px` content container, leveraging `space-lg` (`1.5rem`) gutters.
- **Touch & Rhythmic Spacing**: Interactive targets adhere strictly to a 48px baseline. Micro-gaps between controls use `space-sm` (`0.5rem`), while major functional sections are divided by `space-lg` (`1.5rem`) and `space-xl` (`2rem`).

## Elevation & Depth

Visual hierarchy is maintained through precise tonal layering combined with subtle ambient shadows and crisp perimeter definitions:

- **Level 0 (Canvas Base)**: `#F8FAFC`, flat baseline surface without elevation.
- **Level 1 (Section Cards & Modules)**: Pure white `#FFFFFF` surface framed by a crisp border (`1px solid #E2E8F0`) with a calm ambient drop shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Interactive Floating Controls & Modals)**: Lifted using a primary ocean-tinted ambient shadow: `0 10px 15px -3px rgba(2, 132, 199, 0.1), 0 4px 6px -4px rgba(2, 132, 199, 0.05)`, providing tactile separation for floating action bars and verification sheets.
- **Level 3 (Accreditation Badges & Digital QR Passes)**: Prominent focal depth: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`, framed with high-contrast borders for immediate verification at security checkpoints.

## Shapes

The design system incorporates roundedness level `2` (`0.5rem` / `8px` baseline), delivering a clean, modern institutional aesthetic:

- **Base Controls & Inputs**: Form inputs, standard buttons, and tab controls employ `0.5rem` (`8px`) corners.
- **Section Cards**: Information containers use `rounded-lg` (`1rem` / `16px`) for structured card rhythm.
- **Hero Containers & Passes**: Hero banners and primary passes use `rounded-xl` (`1.5rem` / `24px`) for balanced visual weight.
- **Status Pills & Chips**: Retain a complete pill radius (`9999px`) to create clear optical contrast against rectangular card components.

## Components

### Buttons
- **Primary Transactional (RSVP / Ticket Confirmation)**: Solid Amber/Gold (`#F59E0B`), text `#0F172A` (weight 700). Radius: `12px`. Height: `48px`. Active state shifts to `#D97706`. Ensures immediate optical priority across administrative panels.
- **Ministerial Action Button**: Solid Ocean Blue (`#0284C7`), text `#FFFFFF` (weight 600). Radius: `12px`. Height: `48px`. Hover shifts to `#0369A1`.
- **Secondary Institutional**: Outlined with `1.5px solid #0C5C55`, text `#0C5C55`, background transparent. Focus/Active states use `#E6F7F5`.
- **Destructive Action**: Soft background `#FEE2E2` with text `#EF4444` and weight 600.

### Input Fields & Steppers
- **Form Inputs & Selectors**: Height: `48px`. Surface: `#FFFFFF`. Border: `1.5px solid #E2E8F0`. Corner radius: `8px`. Active focus state transitions border to `#0284C7` with a matching outer focus ring `rgba(2, 132, 199, 0.2)`. Labels employ `label-md` (`Plus Jakarta Sans`, 600).
- **Delegation Workflow Stepper**: Linear progress track (`4px`). Completed segments render in Ocean Blue (`#0284C7`), current active segments highlight in Amber (`#F59E0B`), and upcoming segments remain in `#E2E8F0`.

### Cards & Event Panels
- **Hero Institutional Banner**: Directional gradient (`135deg, #0284C7 0%, #0369A1 100%`) with crisp white typography and `rounded-xl` geometry.
- **Agency Delegation Card**: Surface `#FFFFFF`, `rounded-lg` (`16px`), `1px solid #E2E8F0` border. Houses institutional crest, quota allocation, verification state, and secondary action triggers.

### Chips & Badges
- **Institutional Category Pills**: Pill-shaped (`9999px`), padding `4px 12px`. Uses Teal Soft background (`#E6F7F5`) with Deep Teal text (`#0C5C55`) in `label-sm`.
- **Verification Status Chips**: Confirmed status utilizes Ocean Wash (`#E0F2FE`) with Ocean Dark text (`#0369A1`). Pending accreditation displays Gold Subtle (`#FEF3C7`) with `#B45309`.

### Accreditation Passes & Credentials
- Elevated pure-white credential module surrounded by a `2px solid #F59E0B` perimeter border. Includes high-contrast QR display area (minimum 140×140px), delegation clearance level, and vehicular security tags.