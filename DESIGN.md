---
name: Unchurnly
description: Revenue protection dashboard for indie Stripe founders
colors:
  canvas: "#0F1117"
  sidebar-bg: "#161B27"
  card-bg: "#1A2035"
  accent-recovery: "#10B981"
  accent-metric: "#3B82F6"
  signal-risk: "#F59E0B"
  signal-loss: "#EF4444"
  ink-primary: "#F1F5F9"
  ink-secondary: "#94A3B8"
  ink-tertiary: "#475569"
  chart-grid: "#1E2D40"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  kpi:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  full: "9999px"
  card: "12px"
  button: "8px"
  sm: "6px"
spacing:
  card: "20px"
  section: "24px"
  row: "12px 16px"
  gap: "16px"
components:
  button-primary:
    backgroundColor: "{colors.accent-recovery}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  kpi-card:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  nav-item-active:
    backgroundColor: "rgba(255,255,255,0.08)"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.button}"
    padding: "8px 12px"
  badge-recovery:
    backgroundColor: "rgba(16,185,129,0.10)"
    textColor: "{colors.accent-recovery}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-risk:
    backgroundColor: "rgba(245,158,11,0.10)"
    textColor: "{colors.signal-risk}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-loss:
    backgroundColor: "rgba(239,68,68,0.10)"
    textColor: "{colors.signal-loss}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-metric:
    backgroundColor: "rgba(59,130,246,0.10)"
    textColor: "{colors.accent-metric}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: Unchurnly

## 1. Overview

**Creative North Star: "The Silent Guardian"**

Unchurnly's visual system is built around a single idea: the product is working right now, whether the founder is watching or not. The dashboard is a status report from something that never sleeps. Every surface should communicate stability and control — not urgency, not celebration, not alarm. The founder opens this and immediately feels that revenue is being defended.

The palette is deliberately dark and instrument-like. Three depth layers (canvas, sidebar, card) create a quiet spatial hierarchy without any shadows. Color is rationed: only four semantic signals (emerald = recovered, blue = neutral metrics, amber = at risk, red = loss) appear against a near-colorless ground. Nothing is used for decoration. The founder's eye lands on the number that matters, then on whether it's green or amber.

Typography reinforces the register: Inter for all interface text at a tight scale, JetBrains Mono reserved exclusively for financial values. The mono numbers carry physical weight — they read like accounting, not dashboards. Labels are uppercase with generous tracking to read at a glance from a distance.

This system explicitly rejects:
- **Intercom / HubSpot**: chatty, bubbly, rounded-everything SaaS. No color blocks as decoration, no friendly-casual copy, no celebration of routine events.
- **Baremetrics / ChartMogul**: analytics-as-hero, metric overload. The chart is context; it never competes with the primary KPI surface.
- **Linear / Vercel**: developer-cold ultra-minimalism. The tool serves founders under stress, not engineers in flow. Human warmth lives in the copy and the specificity of the numbers, not in visual flourishes.

**Key Characteristics:**
- Three-layer tonal depth: #0F1117 → #161B27 → #1A2035 (no shadows)
- Four semantic colors only; never decorative
- JetBrains Mono on all financial values; Inter on all UI text
- Uppercase tracking-widest labels as the only typographic hierarchy marker
- Full-width layout; no max-width cap on the dashboard canvas
- The pulsing emerald dot (Defense Status Bar) is the only motion at rest

## 2. Colors: The Instrument Palette

Four depth surfaces, four semantic signals, three ink grades. Every color has one job and stays in it.

### Primary
- **Emerald Signal** (#10B981): The most important color in the system. Appears on recovered MRR values, saved-outcome badges, progress fill, the logo mark, and the pulsing status dot. If it's green, money was saved. Never used for hover states, decoration, or neutral UI.
- **Deep Space** (#0F1117): The canvas. Every page renders on this. It reads as a near-black with a faint blue cast — darker than a pure neutral, never pure black.

### Secondary
- **Horizon Blue** (#3B82F6): Neutral metric color. ROI multipliers, cancellation-rate percentages, dunning type badges, the chart's impressions line. It means "data" without implying outcome. Used in 10% opacity fills for status chips.
- **Navy Vault** (#161B27): The sidebar surface. Slightly lighter than the canvas, same blue-navy cast. The spatial separator between navigation and content.

### Tertiary
- **Amber Risk** (#F59E0B): Active dunning sequences, at-risk MRR figures, warning banners. Means revenue is in motion but outcome unknown. Used in 10% opacity fills for risk chips. Never appears on resolved/positive outcomes.
- **Danger Red** (#EF4444): Losses only. Cancelled outcomes, failed dunning. Appears rarely. When it does, it is unambiguous.

### Neutral
- **Card Slate** (#1A2035): The card surface. All KPI cards, chart containers, the activity table, the at-risk panel. The highest surface layer in the depth stack.
- **Ink Primary** (#F1F5F9): Near-white. All primary text, KPI values displayed in emerald or blue still use this weight for the label above them. Body-legible on any of the three background layers.
- **Ink Secondary** (#94A3B8): Secondary text, section subtitles, table column labels, sidebar section text. The workhorse tone.
- **Ink Tertiary** (#475569): Dimmed text, chart axis labels, date stamps, footer links. Recedes intentionally.
- **Chart Grid** (#1E2D40): Grid lines only. Barely visible on card-bg; structural without competing with the data lines.

### Named Rules
**The Semantic Seal Rule.** Emerald, amber, and red are never used outside their semantic roles. No emerald hover states. No amber decorative accents. No red in illustrations. If you need a fourth color for something non-semantic, use Horizon Blue at 10% opacity.

**The Layering Rule.** Depth is created through three discrete background values (#0F1117, #161B27, #1A2035), never through shadows or gradients. Cards appear to float because of the tonal step, not because of blur or lift.

## 3. Typography

**Body / UI Font:** Inter (system-ui fallback)
**Financial / Mono Font:** JetBrains Mono (ui-monospace fallback)

**Character:** A two-voice system. Inter carries everything conversational — labels, navigation, body copy, timestamps. JetBrains Mono enters only when a number is being presented as an instrument reading. The contrast between the two is the typographic equivalent of a price tag on a financial terminal.

### Hierarchy
- **Display** (Inter, 600, 18px, 1.4 leading): Page-level titles only. "Analytics", "Settings", "Customers". Used once per page.
- **Headline** (Inter, 500, 14px, 1.5 leading): Section headings within cards. "Recovery Activity", "Recent Activity", "AT RISK THIS MONTH". Never bolder than 500.
- **KPI** (JetBrains Mono, 700, 36px, 1.0 leading, -0.02em tracking): Financial values only. MRR amounts, percentages, multipliers, sequence counts. Color varies by semantic role (emerald, blue, amber). This is the largest typographic element in the product.
- **Body** (Inter, 400, 14px, 1.5 leading): Descriptive text, banner copy, empty-state explanations. Max line length 65ch.
- **Label** (Inter, 500, 12px, 1.4 leading, 0.08em tracking, uppercase): Card category labels above KPI values. Table column headers. Navigation section dividers. The text-transform + tracking is the only typographic flourish in the system.
- **Caption** (Inter, 400, 11px, 1.4 leading): Dates, secondary table data, axis tick labels on charts. The smallest legible scale; nothing goes below 11px.

### Named Rules
**The Mono Gate Rule.** JetBrains Mono is used on financial values and code snippets only. Navigation text, button labels, table cell text, and descriptive copy always use Inter. The mono font's presence is the signal that "this number is what you came to see."

**The Scale Ceiling Rule.** No UI text exceeds 18px. The KPI values at 36px are the only exception, and they are visually separated from the UI layer by weight, family, and color contrast. Display headings are deliberately quiet (18px/600) so they never compete with the KPI numbers.

## 4. Elevation

This system is flat by doctrine. No box shadows appear anywhere on the dashboard surface. Depth is expressed entirely through tonal layering: the canvas (#0F1117) reads as the deepest plane, the sidebar (#161B27) as one step up, and cards (#1A2035) as the surface plane. The three values create clear spatial hierarchy without any blur, lift, or glow.

Card borders (`rgba(255,255,255,0.05)` — white at 5% opacity) provide structural definition without adding visual weight. They are threshold markers, not design elements.

The single exception is the recharts tooltip, which floats over chart content: it uses a card-bg background with a `rgba(255,255,255,0.10)` border. This is purposeful — it is a transient overlay, not a persistent surface.

### Named Rules
**The Flat-By-Default Rule.** If a shadow is considered, ask whether tonal layering or a more opaque border achieves the same goal. If yes, use those. Shadows are prohibited on cards, panels, sidebars, and tables. The tooltip override is the one documented exception.

## 5. Components

Components feel understated and precise. Interactive elements do not announce themselves with visual weight; affordance comes from hover state transitions and cursor changes. Only the primary action button (Connect Stripe, Generate Key) has strong visual presence.

### Buttons
- **Shape:** Gently rounded (8px radius, `rounded-lg`). Unambiguously a button; not a pill, not a square.
- **Primary:** Emerald Signal background (#10B981), white text, 10px/20px padding. The emerald fill on a button is the most saturated element in the product. Used for one action per screen — it earns the color by rarity.
- **Primary hover:** Background darkens to ~oklch(0.60 0.17 162). 150ms ease-out transition.
- **Ghost:** Transparent background, Ink Secondary (#94A3B8) text, white/5 border. Used for secondary actions, navigation CTAs, "Connect Stripe →" links.
- **Ghost hover:** Background shifts to white at 4% opacity; text lifts to Ink Primary (#F1F5F9).
- **Danger:** Signal Loss (#EF4444) at 10% opacity background, red text. Used only for destructive confirmations.

### Status Chips / Badges
Translucent pill badges are the primary state communication pattern in tables and event lists.
- **Recovery chip** (Recovered / Discounted / Paused): `rgba(16,185,129,0.10)` fill, `#10B981` text, `rgba(16,185,129,0.20)` border.
- **Risk chip** (Active dunning / Cancellation type): `rgba(245,158,11,0.10)` fill, `#F59E0B` text, `rgba(245,158,11,0.20)` border.
- **Loss chip** (Cancelled / Failed): `rgba(239,68,68,0.10)` fill, `#EF4444` text, `rgba(239,68,68,0.20)` border.
- **Metric chip** (Dunning type / neutral metric): `rgba(59,130,246,0.10)` fill, `#3B82F6` text, `rgba(59,130,246,0.20)` border.
- All chips: `rounded-full`, `text-xs font-medium`, 2px/8px padding. Borders are always present (they anchor the chip against dark backgrounds where fill alone would disappear).

### KPI Cards
- **Surface:** Card Slate background (#1A2035), white/5 border, 12px radius.
- **Padding:** 20px.
- **Label:** text-xs uppercase tracking-widest, Ink Tertiary (#475569). Above the value; semantic role, not a title.
- **Value:** JetBrains Mono 36px/700, color varies by semantic role (emerald for money, blue for rates, amber for active risk).
- **Subtext:** text-xs, Ink Tertiary. Below the value; one short phrase of context.
- No icons, no decorative elements.

### Navigation (Sidebar)
- **Container:** Navy Vault (#161B27), right border white/5, 260px fixed.
- **Active item:** white/8 background, white text, 600 weight, 8px radius.
- **Inactive item:** Ink Tertiary text (#475569), transparent background. Hover: text lifts to Ink Secondary (#94A3B8), background shifts to white at 4%.
- **Section labels:** 10px, 500 weight, uppercase, widest tracking, Ink Tertiary. Spacing markers, not interactive.
- **Logo mark:** Emerald Signal background (#10B981), white text, 7×7 rounded-lg. The only solid emerald surface in the sidebar.

### Defense Status Bar (Signature Component)
The top strip on every dashboard page. No card wrapper, no border on top or sides — only a bottom border at white/5. Left: a 2×2 pulsing emerald dot with a one-line status message in Ink Secondary. Right: "Last updated just now" in Ink Tertiary/caption. The pulsing dot is the only animation present at rest in the entire product. It communicates that the system is alive without demanding attention.

### Data Tables
- **Container:** Card Slate (#1A2035) background, white/5 border, 12px radius, overflow-hidden.
- **Header row:** black at 20% opacity background, Label typography, Ink Tertiary color.
- **Data rows:** white/5 bottom border, 12px/16px padding. Hover: white at 2% opacity.
- **Customer cells:** body text in Ink Secondary.
- **MRR cells:** JetBrains Mono, Emerald Signal if positive; Ink Tertiary dash if zero.
- **Date cells:** Caption, Ink Tertiary.

### Alert Strips (Banners)
Translucent full-width strips, not modals. Same translucency pattern as chips but at page width.
- **Risk (widget not installed):** amber/10 fill, amber/20 border, amber-300 text.
- **Success (widget verified):** emerald/10 fill, emerald/20 border, emerald-300 heading.
- **Info (demo mode):** blue/10 fill, blue/20 border, blue-300 text.
All strips: 12px radius, 12px/16px padding, dismissible with an X at the right edge.

### Recharts (Activity Chart)
- **Background:** transparent.
- **Grid lines:** Chart Grid (#1E2D40), strokeDasharray 3/3.
- **MRR Saved line:** Emerald Signal stroke, strokeWidth 2, with a gradient area fill (emerald from 15% to 0% opacity top to bottom).
- **Widget Opens line:** Horizon Blue stroke, strokeWidth 1.5, dashed (4/4).
- **Axis labels:** Ink Tertiary (#475569), 11px.
- **Tooltip:** Card Slate background (#1A2035), white/10 border, Ink Primary text.

## 6. Do's and Don'ts

### Do:
- **Do** use Emerald Signal (#10B981) exclusively for recovered/saved outcomes and the primary action button. Its rarity on screen is what gives it authority.
- **Do** render all financial figures (dollar amounts, percentages in KPI position, multipliers) in JetBrains Mono. The font is a signal that this is a number to trust.
- **Do** use uppercase + tracking-widest (0.08em) for all card category labels. This is the system's only typographic flourish — reserve it for labels above data, never for section headings or body copy.
- **Do** express all depth through tonal surface steps (#0F1117 → #161B27 → #1A2035). Add a white/5 border to cards for structural definition, nothing else.
- **Do** keep all semantic chip colors consistent: translucent fill + matching solid border. Chips without borders disappear against dark cards.
- **Do** keep the Defense Status Bar on every authenticated dashboard page. It is the primary signal that the product is active.
- **Do** keep the emerald pulsing dot as the only rest-state animation. Any additional ambient animation dilutes the signal that "something is happening."

### Don't:
- **Don't** use Emerald Signal, Amber Risk, or Danger Red decoratively. If a color appears on a surface where it doesn't represent a semantic outcome (saved, at-risk, lost), it is wrong.
- **Don't** use box shadows on card surfaces, sidebars, or panels. This is the Flat-By-Default Rule. Tonal layering handles depth.
- **Don't** use gradient backgrounds. The gradient Recovery Potential card was removed precisely because gradients introduce decorative energy that competes with the data. Flat fills only.
- **Don't** put colored icon circles on KPI cards (the TrendingUp / Zap / Target / AlertCircle pattern that was removed). Icons in colored containers are visual noise on a data surface.
- **Don't** use JetBrains Mono for navigation text, button labels, banner copy, or headings. The Mono Gate Rule: mono is only for values.
- **Don't** let the dashboard look like Baremetrics or ChartMogul. The chart is context, not the hero. KPI values are the primary visual hierarchy; the chart is below them in the layout and below them in visual weight.
- **Don't** use the Intercom/HubSpot aesthetic: no bubbly rounded-everything, no color blocks as decoration, no "you're doing great!" copy for routine events. Founders under revenue stress do not want cheerful UI.
- **Don't** drop below 11px for any visible text. Caption at 11px is the floor; below that, Ink Tertiary text becomes illegible against Card Slate on a dark display.
- **Don't** use more than one primary button per screen. The emerald fill is the primary action signal; two emerald buttons means neither is primary.
- **Don't** nest cards. The Card Slate surface is the top layer of the depth stack; placing a card inside a card breaks the spatial model and the Layering Rule.
