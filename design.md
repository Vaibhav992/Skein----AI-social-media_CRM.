# Northloop Design System

*Source of truth for colors, gradients, type, spacing, and UI patterns.*
*Read from `src/app/globals.css` and the live components. Use this file to build other products so they look like the same studio.*

**The look in one sentence:** warm off-white pages, near-black “ink” bands, a sharp lime accent on dark, indigo as the quiet link color, and one moving lime → indigo → pink gradient reserved for hero headlines.

Do not invent a second palette. If a new product needs a color that is not here, reuse lime or ink first.

---

## Contents

1. How to copy this into a new product
2. Color tokens
3. Gradients (copy-paste)
4. Surfaces — light vs dark
5. Typography
6. Spacing, radius, shadows, layout
7. Motion
8. Component recipes
9. Icons and brand mark
10. Do / don’t

---

# 1. How to copy this into a new product

Paste the token block into that product’s CSS (Tailwind v4 `@theme inline`, or CSS variables). Then use the **class names** in the tables below. Hex values are listed so you can use them in Figma, emails, OG images, and native apps.

```css
@theme inline {
  --color-background: #faf9f5;
  --color-foreground: #0d0d0d;
  --color-border: #e5e7eb;
  --color-primary: #0d0d0d;
  --color-primary-foreground: #faf9f5;
  --color-secondary: #171717;
  --color-secondary-foreground: #faf9f5;
  --color-muted: #f3f2ee;
  --color-muted-foreground: #5b6474;
  --color-card: #ffffff;
  --color-accent: #6366f1;
  --color-accent-violet: #8b5cf6;
  --color-accent-pink: #ec4899;
  --color-lime: #d9f99d;
  --color-lime-strong: #bef264;
  --color-ink: #07080d;
  --color-ink-soft: #0e1018;
  --color-ink-line: #1d2030;
  --font-body: var(--font-geist-sans);
  --font-headings: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
}
```

**Fonts:** [Geist](https://vercel.com/font) + Geist Mono, loaded in `src/app/layout.tsx`. Fallback: `ui-sans-serif, system-ui` and `ui-monospace`.

**Theme color / browser chrome:** `#07080d` (ink).

**Favicon / app icon:** ink `#0D0D0D` tile, lime `#D9F99D` bolt, 7px corner radius (`src/app/icon.svg`).

---

# 2. Color tokens

## Core (use these first)

| Token | Hex | Tailwind | Role |
| --- | --- | --- | --- |
| **Ink** | `#07080d` | `bg-ink` `text-ink` | Dark surfaces: nav, hero, footer, CTA bands, featured cards |
| **Ink soft** | `#0e1018` | `bg-ink-soft` | Panels / dropdowns on ink. Hover state for ink buttons |
| **Ink line** | `#1d2030` | `border-ink-line` | Hairlines on dark (rarely used; prefer `white/10`) |
| **Lime** | `#d9f99d` | `bg-lime` `text-lime` | Primary accent **on dark**. Logo tile, primary CTA on ink, active dots, badges |
| **Lime strong** | `#bef264` | `bg-lime-strong` | Lime button hover |
| **Background** | `#faf9f5` | `bg-background` | Page body (warm paper, not pure white) |
| **Foreground** | `#0d0d0d` | `text-foreground` | Body text on paper |
| **Card** | `#ffffff` | `bg-card` | Cards, inputs, secondary buttons on paper |
| **Muted** | `#f3f2ee` | `bg-muted` | Chips, tags, icon wells, closed FAQ toggle |
| **Muted text** | `#5b6474` | `text-muted-foreground` | Subcopy, captions, inactive nav |
| **Border** | `#e5e7eb` | `border-border` | Default 1px card / divider on paper |
| **Accent (indigo)** | `#6366f1` | `text-accent` `bg-accent` | Links, eyebrows on paper, check icons, “engineering” badges |
| **Accent violet** | `#8b5cf6` | `via-accent-violet` | Middle stop of progress gradients only |
| **Accent pink** | `#ec4899` | — | Hero shimmer stop only (use `#f0abfc` in the shimmer) |

## Opacity recipes (already used in the site)

On **ink** (dark):

| Need | Class |
| --- | --- |
| Soft panel | `bg-white/5` or `bg-ink-soft/85` |
| Hairline | `border-white/10` |
| Secondary text | `text-white/65` |
| Quiet text | `text-white/40` or `text-white/55` |
| Hover row | `hover:bg-white/5` |
| Lime wash | `bg-lime/15` (icon wells) or `bg-lime/[0.07]` (blur orbs) |
| Lime glow orb | `bg-indigo-600/25 blur-[120px]` |

On **paper** (light):

| Need | Class |
| --- | --- |
| Accent wash | `bg-accent/[0.05]` + `border-accent/20` |
| Lime wash | `bg-lime/[0.08]` + `border-lime/40` |
| Hover lift border | `hover:border-accent/50` |
| Card hover glow | `bg-accent/10 blur-3xl` (absolute, opacity 0 → 100 on hover) |

## Semantic pairing (do not mix)

| Surface | Background | Body text | Eyebrow / rule | Primary button | Secondary button |
| --- | --- | --- | --- | --- | --- |
| **Paper** | `#faf9f5` | `#0d0d0d` | indigo `#6366f1` | ink + white text | white card + border |
| **Ink** | `#07080d` | `#ffffff` | lime `#d9f99d` | lime + ink text | `border-white/15 bg-white/5` |

**Rule:** lime is the accent *on ink*. Indigo is the accent *on paper*. Never put lime headlines on the cream background. Never put indigo CTAs on ink.

The only exception: lime still appears on paper as a **badge** (`bg-lime text-foreground`) for “CLIENT” / verified metrics.

---

# 3. Gradients (copy-paste)

These are the only gradients in the system. Reuse them; do not add rainbows.

## A. Hero headline shimmer (THE brand gradient)

Used on the last line of the homepage H1 only (`.text-shimmer`).

```css
background-image: linear-gradient(90deg, #d9f99d, #a5b4fc, #f0abfc, #d9f99d);
background-size: 200% auto;
-webkit-background-clip: text;
background-clip: text;
color: transparent;
animation: shimmer 8s linear infinite;

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
```

Stops: **lime `#d9f99d` → indigo-200 `#a5b4fc` → pink-200 `#f0abfc` → lime**.

Tailwind equivalent if you cannot use the class:

`bg-linear-to-r from-lime via-indigo-300 to-pink-300 bg-clip-text text-transparent`

Always animate the gradient on the **same element** that has `background-clip: text`. A parent clip will not paint through transforming children.

## B. Dark atmospheric orbs (hero, page heroes, booking CTA)

Not a fill — two huge blurred circles over ink + a grid.

```html
<div class="relative overflow-hidden bg-ink text-white">
  <div class="pointer-events-none absolute inset-0" aria-hidden>
    <div class="bg-grid-dark absolute inset-0"></div>
    <div class="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-indigo-600/25 blur-[120px]"></div>
    <div class="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-lime/[0.07] blur-[120px]"></div>
  </div>
  <!-- content -->
</div>
```

- Left / center orb: `bg-indigo-600/25` = indigo `#4f46e5` at 25%, `blur-[120px]`
- Right orb: `bg-lime/[0.07]`, same blur
- Booking CTA uses one centered orb: `h-[360px] w-[720px] bg-indigo-600/25 blur-[120px]`

## C. Dark grid (`.bg-grid-dark`)

```css
.bg-grid-dark {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%);
}
```

Light variant (`.bg-grid-light`) uses `rgb(13 13 13 / 0.05)` on a 48px grid. Use only on paper if you need a faint floor.

## D. Progress / workflow line

Accent → violet → lime. Used on the process timeline and the animated workflow connector.

```
bg-linear-to-r from-accent via-accent-violet to-lime
bg-linear-to-b from-accent via-accent-violet to-lime
bg-linear-to-b from-lime via-indigo-400 to-lime
```

Hex: `#6366f1` → `#8b5cf6` → `#d9f99d`

## E. Soft card wash (demo frames on ink)

```
bg-linear-to-br from-indigo-500/20 via-transparent to-lime/10
bg-linear-to-br from-indigo-500/30 to-lime/10
```

Sit this **behind** a rounded panel (`rounded-[36px] blur-2xl`), not as text.

## F. Footer wordmark shine

Lime flash sweeping through `NORTHLOOP` letters.

```css
background-image: linear-gradient(
  100deg,
  rgb(255 255 255 / 0.1) 0%,
  rgb(255 255 255 / 0.1) 40%,
  #d9f99d 50%,
  rgb(255 255 255 / 0.1) 60%,
  rgb(255 255 255 / 0.1) 100%
);
background-size: 400% 100%;
/* animate background-position 100% → 0% over 6s, staggered per letter */
```

Letters start as `white/10`, peak at lime.

## G. Marquee / image fade

`[mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]`

## H. Open Graph / social image

```
linear-gradient(135deg, #07080d 0%, #111427 60%, #1b1f3d 100%)
```

Ink → deep indigo. Put lime wordmark or headline on top.

## Gradient cheatsheet

| Name | CSS | Where |
| --- | --- | --- |
| Shimmer text | `90deg, #d9f99d, #a5b4fc, #f0abfc, #d9f99d` | Hero H1 tail only |
| Progress | `#6366f1 → #8b5cf6 → #d9f99d` | Timelines, steppers |
| Orb indigo | `#4f46e5` @ 25% + 120px blur | Dark heroes |
| Orb lime | `#d9f99d` @ 7% + 120px blur | Dark heroes |
| Card wash | indigo-500/20 → lime/10 | Demo chrome on ink |
| Wordmark | white/10 → `#d9f99d` → white/10 | Footer |
| OG | `#07080d → #111427 → #1b1f3d` | Share images |

---

# 4. Surfaces — light vs dark

The site **alternates bands**. That rhythm is the design.

1. **Ink hero** (nav sits on ink too)
2. **Paper sections** (`bg-background`, `pt-24`, max width 1240)
3. **Ink interlude** (workflow demo, architecture, booking CTA)
4. **Paper again**
5. **Ink footer** + oversized wordmark

| Surface | Class | Typical padding |
| --- | --- | --- |
| Paper section | `mx-auto max-w-[1240px] px-4 pt-24 sm:px-8` | 96px top |
| Ink band | `relative overflow-hidden bg-ink py-20 text-white sm:py-24` | 80–96px |
| Closing CTA | `mt-28` then ink band | Extra gap before the close |
| Page shell | `min-h-screen bg-background text-foreground` | — |

**Nav:** `sticky top-0 z-50`, `bg-ink/85 backdrop-blur-xl`. Border appears after 12px scroll: `border-white/10` + `shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]`.

**Footer:** `border-t border-white/10 bg-ink`. Links `text-white/70 hover:text-lime`.

---

# 5. Typography

One family for UI and headlines: **Geist**. Mono for tags, step numbers, “plain English” labels.

| Role | Size | Weight | Tracking | Line height | Color on paper | Color on ink |
| --- | --- | --- | --- | --- | --- | --- |
| Hero H1 | 38px → 64px (`text-[38px] sm:text-6xl lg:text-[64px]`) | 800 | tight | 1.03 | — | white + shimmer tail |
| Page H1 | `text-4xl sm:text-5xl lg:text-6xl` | 800 | tight | 1.04 | — | white |
| Section H2 | `text-3xl sm:text-4xl lg:text-[44px]` | 700 | tight | 1.1 | foreground | white |
| Card H3 | `text-xl` or `text-2xl` | 700 | tight | — | foreground | white |
| Body | `text-base sm:text-lg` | 400 | — | relaxed | muted-foreground | `white/65` |
| Small body | `text-sm` | 400 | — | relaxed | muted-foreground | `white/70` |
| Eyebrow | `text-xs font-semibold uppercase tracking-[0.2em]` | 600 | 0.2em | — | accent | lime |
| Pill / chip | `text-xs font-semibold` | 600 | — | — | foreground | — |
| Mono tag | `font-mono text-[10px] font-semibold uppercase tracking-[0.12em]` | 600 | 0.12em | — | muted / accent | lime |
| Nav link | `text-[13px] font-medium` | 500 | — | — | — | `white/65`, active white |

**Eyebrow pattern (every section):**

```
[ 6px rule ]  UPPERCASE LABEL
```

- Paper: `h-px w-6 bg-accent` + `text-accent`
- Ink: `h-px w-6 bg-lime` + `text-lime`
- Centered CTA: rule on **both** sides

**Headline rules**

- Short. Tracking tight. No italic display fonts.
- Only the **last phrase** of the homepage hero uses shimmer.
- Inner pages: solid white H1, no shimmer.

---

# 6. Spacing, radius, shadows, layout

## Layout

| Token | Value |
| --- | --- |
| Page max width | `1240px` |
| Gutter | `px-4` (16px) → `sm:px-8` (32px) |
| Section top | `pt-24` (96px) |
| Scroll offset for `#` links | `84px` (`scroll-margin-top`) |
| Card grid gap | `gap-5` (20px) |

## Radius

| Token | px | Use |
| --- | --- | --- |
| `rounded-lg` | 8 | Icon buttons, small wells |
| `rounded-xl` | 12 | Logo tile (36×36), small inputs |
| `rounded-2xl` | 16 | Buttons (md/lg), icon squares (48×48), chips |
| `rounded-3xl` | 24 | Work cards, dropdowns, pricing cards (`rounded-[24px]`) |
| `rounded-[28px]` | 28 | Feature cards, demo frames, ink panels |
| `rounded-[32px]` | 32 | Large ink quote / CTA cards |
| `rounded-[36px]` | 36 | Glow shell behind a demo |
| `rounded-full` | pill | Nav links, toggles, tags, eyebrows |

## Shadows

| Name | Value | Use |
| --- | --- | --- |
| Card rest | `shadow-sm` | Paper cards |
| Card hover | `shadow-xl` + `-translate-y-1` | Work / service cards |
| Lime CTA glow | `shadow-[0_0_40px_-10px_#d9f99d]` | Primary button on ink |
| Ink CTA | `shadow-[0_12px_30px_-14px_rgba(7,8,13,0.6)]` | Primary button on paper |
| Nav scrolled | `shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]` | Sticky header |
| Dropdown | `shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]` | Solutions menu |
| Lime dot | `shadow-[0_0_14px_#d9f99d]` | Live / active pulse |

## Borders

- Paper: `border border-border` (`#e5e7eb`)
- Paper hover: `hover:border-accent/50` or `hover:border-foreground/20`
- Ink: `border-white/10`
- Featured ink card: `border-ink` (the card *is* ink)

---

# 7. Motion

**Easing (everywhere):** `[0.22, 1, 0.36, 1]` — same cubic-bezier as `.hero-in`.

| Motion | Duration | Notes |
| --- | --- | --- |
| Hero fade/rise | 0.7s | CSS, first paint (`--d` delay) |
| Hero word rise | 0.8s | overflow hidden + translateY 110% |
| Word stagger | 60ms per word | |
| Scroll reveal | 0.7s, y: 24 | once, margin `-80px` |
| Stagger children | 80ms | grids |
| Hover lift | 200–300ms | buttons `-translate-y-0.5`, cards `-translate-y-1` |
| Arrow nudge | — | `group-hover:translate-x-1` |
| Marquee | 40s linear | pause on hover |
| Shimmer | 8s linear loop | |
| Wordmark shine | 6s, 120ms letter delay | |
| Menu | 180–300ms | |

**Respect reduced motion.** `MotionConfig reducedMotion="user"` wraps the app. CSS animations are disabled in `@media (prefers-reduced-motion: reduce)`.

Do not add bounce, spring-overshoot, or parallax unless it is this ease.

---

# 8. Component recipes

Copy these class strings so products match without restyling.

## Primary button

On **paper** (dark button):

```
inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5
text-sm font-bold bg-ink text-white hover:bg-ink-soft
shadow-[0_12px_30px_-14px_rgba(7,8,13,0.6)]
transition-all duration-200 hover:-translate-y-0.5
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
```

On **ink** (lime button):

```
bg-lime text-ink hover:bg-lime-strong
shadow-[0_0_40px_-10px_#d9f99d]
```

Sizes: sm `px-4 py-2.5 text-xs rounded-xl` · md (default) · lg `px-6 py-4 text-sm sm:text-base rounded-2xl`

Icon: Lucide, `h-4 w-4`, stroke 2.4–2.5. Calendar on Book a Call; ArrowRight that slides on hover.

## Secondary button

On paper: `border border-border bg-card text-foreground hover:border-foreground/40 font-semibold`

On ink: `border border-white/15 bg-white/5 text-white hover:bg-white/10`

## Pill / segmented toggle

```
inline-flex rounded-full border border-border bg-card p-1
active: absolute inset-0 rounded-full bg-ink  (layoutId animation)
label: relative text-xs font-bold; active = text-white
```

## Paper card

```
rounded-[28px] border border-border bg-card p-6 sm:p-8 shadow-sm
transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
```

Optional hover glow: absolute `h-48 w-48 rounded-full bg-accent/10 blur-3xl` top-right, opacity 0 → 100.

## Ink card (featured / custom price)

```
rounded-[28px] bg-ink p-6 text-white sm:p-8
```

## Icon well

On paper: `flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-lime`

On ink: `rounded-full bg-lime/15 text-lime` (16–20px) or `bg-lime text-ink` for numbered steps.

## Eyebrow + heading

See SectionHeading: 6px rule + uppercase 0.2em + H2 at 44px.

## Work / list card

```
rounded-3xl border border-border bg-card p-6 shadow-sm
hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl
```

Tags: `rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] text-muted-foreground`

## Badges

| Kind | Classes |
| --- | --- |
| Client / verified | `bg-lime text-foreground border border-lime` |
| Engineering | `bg-accent text-white border border-accent` |
| Internal R&D | `bg-transparent text-accent border border-accent/60` |
| Representative | `bg-transparent text-muted-foreground border border-border` |
| Illustrative | `border-dashed border-muted-foreground/50` |

All: `rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]`

## Chip / filter

Idle: `border-border bg-card text-muted-foreground hover:border-accent/50`

Active: `border-ink bg-ink text-white`

## Check row

`Check` icon `h-4 w-4 text-accent` stroke 2.5 on paper; `bg-lime/15 text-lime` circle on ink.

## FAQ row

Closed toggle: `bg-muted text-foreground`

Open toggle: `bg-ink text-lime`

## Input / calendar embed chrome

Ink button fallback: `rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-ink-soft`

Accent icon: `text-accent`

## Logo

36×36 `rounded-xl bg-lime`, Zap icon `text-ink` 18px. Wordmark `font-headings text-sm font-bold text-white` (nav is always on ink). Hover: rotate 6° + scale 105%.

---

# 9. Icons and brand mark

- Library: **Lucide** (`lucide-react`).
- Default stroke: **2.5**. Decorative large icons: 1.5.
- Size: 16px inline, 20px in 48px wells, 18px in the logo.

**Mark:** lime rounded square + ink bolt (or Zap). Favicon inverts that (ink square + lime bolt) so it reads on a browser tab.

**Wordmark:** Geist ExtraBold, tracking tighter, used giant in the footer (`19.5vw` so nine letters span the viewport).

Do not introduce a second icon set or a 3D logo.

---

# 10. Do / don’t

**Do**

- Alternate ink bands and paper sections.
- Put lime only on ink (except CLIENT badges).
- Put indigo only on paper (except gradient stops).
- Keep one max-width (1240) and one ease curve.
- Label proof honestly (CLIENT / DEMO / R&D) with the badge styles above.
- Use Geist + Geist Mono only.

**Don’t**

- Use pure `#000` or `#fff` as page backgrounds. Paper is `#faf9f5`. Ink is `#07080d`.
- Put the shimmer gradient on more than one headline per page.
- Add orange, cyan, or a second green. Lime is the only green (`#d9f99d`, not `#84cc16`).
- Use drop shadows on text.
- Animate with default ease-in-out bounce.
- Build a “light nav on paper” unless you also restyle the logo (it is designed for ink).

---

## Quick copy for Figma / native / email

```
Paper          #FAF9F5
Ink            #07080D
Ink soft       #0E1018
Text           #0D0D0D
Muted text     #5B6474
Card           #FFFFFF
Border         #E5E7EB
Muted fill     #F3F2EE
Lime           #D9F99D
Lime hover     #BEF264
Indigo         #6366F1
Violet         #8B5CF6
Pink           #EC4899
Shimmer        #D9F99D → #A5B4FC → #F0ABFC
Orb indigo     #4F46E5 @ 25%
Radius button  16px
Radius card    28px
Radius pill    999px
Shadow lime    0 0 40px -10px #D9F99D
Font           Geist / Geist Mono
```

Live tokens live in `src/app/globals.css`. If this file and the CSS disagree, **trust the CSS** and update this file.
