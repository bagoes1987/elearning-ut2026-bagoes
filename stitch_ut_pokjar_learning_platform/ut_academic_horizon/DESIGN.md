---
name: UT Academic Horizon
colors:
  surface: '#f9f9ff'
  surface-dim: '#c7dbff'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d5e3ff'
  on-surface: '#001c3b'
  on-surface-variant: '#424751'
  inverse-surface: '#193151'
  inverse-on-surface: '#ebf1ff'
  outline: '#737782'
  outline-variant: '#c2c6d2'
  surface-tint: '#275ea6'
  primary: '#003367'
  on-primary: '#ffffff'
  primary-container: '#004990'
  on-primary-container: '#92baff'
  inverse-primary: '#a8c8ff'
  secondary: '#7a5900'
  on-secondary: '#ffffff'
  secondary-container: '#ffbf1d'
  on-secondary-container: '#6d4f00'
  tertiary: '#00316e'
  on-tertiary: '#ffffff'
  tertiary-container: '#004799'
  on-tertiary-container: '#98b9ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a8c8ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#00468b'
  secondary-fixed: '#ffdea2'
  secondary-fixed-dim: '#fbbc19'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5c4200'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004493'
  background: '#f9f9ff'
  on-background: '#001c3b'
  surface-variant: '#d5e3ff'
  surface-ice: '#F4F7FC'
  surface-card: '#FFFFFF'
  border-subtle: '#E2E8F0'
  academic-gold-muted: '#FEF3C7'
  academic-success: '#10B981'
  academic-danger: '#EF4444'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
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
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers a prestigious, reliable, and accessible digital learning environment for Universitas Terbuka, Indonesia's pioneer in open and distance higher education. 

The aesthetic embodies **Corporate / Modern Higher Education**: structured, democratic, and clear, balancing academic heritage with high-throughput digital agility. The user interface creates an empowering atmosphere that encourages self-directed learning, reduces cognitive strain for multi-generational students, and instills institutional authority across thousands of academic modules.

Visual hierarchy relies on crisp surfaces, authoritative royal blues, energetic golden-yellow accents representing illumination and achievement, and spacious functional typography.

## Colors

The color system is calibrated for institutional clarity and AA/AAA accessibility compliance:

- **Primary (`#004990`)**: Classic UT Royal Blue anchors high-stakes interface components: navigation headers, primary CTAs, institutional badges, and foundational layout anchors.
- **Secondary (`#F9BA15`)**: Academic Gold provides sharp visual focus, dedicated exclusively to active statuses, highlights, key callouts, and progress milestones.
- **Tertiary (`#0064D2`)**: Digital Cobalt Blue adds energetic contrast for interactive hyperlinks, active hover states, and dynamic charts.
- **Neutral (`#0B2545`)**: Deep Navy ensures superior contrast against white and tinted backgrounds without the clinical harshness of pitch black.

Backgrounds alternate between pristine pure white (`#FFFFFF`) for elevated cards and gentle ice blue-gray (`#F4F7FC`) for application canvas backdrops to reduce screen fatigue during long study sessions.

## Typography

The typographic scale uses **Inter** throughout, creating systematic legibility across instructional material, assessment portals, and administrative views.

- **Headlines & Display:** Set with tighter tracking and bold/extrabold weights to convey stability and institutional prominence.
- **Body Text:** Uses generous line-height ratios (1.5 to 1.55) to guarantee comfortable reading over lengthy course materials, modules, and syllabi.
- **Labels & Metadata:** Styled with medium to bold weights and subtle positive tracking for course codes, credits (SKS), deadlines, and categorical chips.

## Layout & Spacing

This design system uses a 12-column responsive fluid grid anchored by strict vertical rhythm:

- **Desktop (≥1200px):** 12 columns with `margin-lg` (3.5rem) side padding and `gutter` (1.5rem) column spacing, max-width capped at 1440px for comfortable scan lines.
- **Tablet (768px – 1199px):** 8 columns with `margin` (2rem) and `gutter` (1.5rem). Course directories collapse to two-column formats.
- **Mobile (<768px):** 4 columns with `margin-sm` (1rem) and `gutter-sm` (1rem). Dense dashboards convert to linear vertical stacks.

Component paddings apply `space-sm` for compact metadata containers, `space-md` for interactive controls and forms, and `space-lg` to `space-xl` for dashboard cards, lesson units, and test blocks.

## Elevation & Depth

Visual hierarchy uses **tonal layer separation combined with soft ambient navy shadows**, avoiding intrusive drop shadows:

- **Base Layer (Elevation 0):** Canvas set to `#F4F7FC`. Used for full-page backgrounds and structural borders.
- **Surface Layer (Elevation 1):** Pure `#FFFFFF` surfaces with a 1px solid border in `#E2E8F0` and an ultra-subtle tinted shadow: `box-shadow: 0 1px 3px rgba(11, 37, 69, 0.05), 0 1px 2px rgba(11, 37, 69, 0.03)`. Used for course modules, announcement cards, and content panels.
- **Hover & Active Layer (Elevation 2):** Elevated interactive components cast a soft ambient glow: `box-shadow: 0 10px 25px -5px rgba(0, 73, 144, 0.10), 0 8px 10px -6px rgba(0, 73, 144, 0.05)`.
- **Overlay & Modal Layer (Elevation 3):** Fixed navigation bars, dropdowns, and exam proctoring modals cast deep structural shadows: `box-shadow: 0 20px 25px -5px rgba(11, 37, 69, 0.15), 0 8px 10px -6px rgba(11, 37, 69, 0.08)`. Navigation headers feature a 95% opacity blur backdrop (`backdrop-filter: blur(8px)`).

## Shapes

The interface embraces a balanced **Rounded (`roundedness: 2`)** geometry:
- Standard elements (inputs, buttons, course list items) use **0.5rem (8px)** corner radiuses.
- Larger structures (dashboard cards, video lecture viewports, assignment pods) scale to **1rem (16px)** (`rounded-lg`).
- Micro-elements such as badge pills and progress tags use complete full-rounded pills (**9999px**) for distinct status recognition.

## Components

### Buttons
- **Primary Action:** Solid Royal Blue background (`#004990`), crisp white text (`#FFFFFF`), `0.5rem` radius, bold label. Hover transitions to `#0C3875` with a subtle elevation shift.
- **Accent Action:** Solid Academic Gold (`#F9BA15`) with Deep Navy text (`#0B2545`) reserved for high-priority academic operations (e.g., "Daftar Ujian", "Kirim Tugas").
- **Secondary / Outline:** White surface with 1.5px border in `#004990` and text in `#004990`. Hover applies a `#F4F7FC` tint.

### Inputs & Forms
- Background `#FFFFFF` encased in a 1px `#CBD5E1` border with a 0.5rem radius.
- Focus state switches the border to `#004990` with a 3px ring of `rgba(0, 73, 144, 0.15)`. 
- Placeholder text uses muted slate (`#64748B`), with persistent floating labels in `#0B2545`.

### Cards & Modules
- Maintained on pure white (`#FFFFFF`) with a 1px border (`#E2E8F0`).
- Top decorative progress indicator: 4px accent stroke running along the top border (`#F9BA15` for ongoing courses, `#004990` for completed tracks).
- Header sections separate titles from contextual course metadata using clean `space-md` inner paddings.

### Chips & Badges
- **Status Badges (SKS, Accreditation, Semester):** Full pill radius (`9999px`) with padding `0.25rem 0.75rem`.
- Active or ongoing courses use soft gold backgrounds (`#FEF3C7`) with dark gold text (`#92400E`).
- Completed/Verified certifications use pale green (`#D1FAE5`) with forest green text (`#065F46`).

### Lists & Tables
- Academic tables feature an authoritative `#004990` or `#F4F7FC` table head with bold navy text.
- Row items use alternating zebra striping (`#FFFFFF` to `#F8FAFC`) with subtle hover transitions to highlight grades, course codes, and schedules.

### Learning Management Specifics
- **Module Progress Bars:** 8px track height in `#E2E8F0` with a smooth animated fill in `#F9BA15` or `#004990`.
- **Tutor / Student Avatars:** Circular frame with a 2px offset border in Royal Blue or Academic Gold depending on user verification role.