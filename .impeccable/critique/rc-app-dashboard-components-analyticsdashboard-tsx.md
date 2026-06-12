---
slug: rc-app-dashboard-components-analyticsdashboard-tsx
target: src/app/dashboard/components/AnalyticsDashboard.tsx
date: 2026-06-10
score: 24
p0: 0
p1: 3
p2: 2
detector: []
---

## Heuristic Scores

| # | Heuristic | Score | Note |
|---|-----------|-------|------|
| 1 | Visibility of System Status | 3 | "Last updated just now" is a hardcoded static string |
| 2 | Match System / Real World | 3 | Hardcoded 70% recovery bar is an industry estimate, not user data |
| 3 | User Control and Freedom | 2 | "View all →" is non-interactive; no date range control on chart |
| 4 | Consistency and Standards | 3 | Analytics is dark; Settings/Dunning/Retention pages still light-mode |
| 5 | Error Prevention | 2 | style={{width:'70%'}} hardcoded bar misrepresents personalized data |
| 6 | Recognition Rather Than Recall | 3 | Dead "View all →" creates false promise of deeper view |
| 7 | Flexibility and Efficiency | 1 | No shortcuts, no filters, no export, no click-through from activity rows |
| 8 | Aesthetic and Minimalist Design | 3 | At Risk card: opposite-valence rows at equal visual weight |
| 9 | Error Recovery | 2 | No error states designed; server failure would hard-break page |
| 10 | Help and Documentation | 2 | Docs sidebar link goes to #; no tooltips on KPI definitions |

**Total: 24/40**

## Priority Issues

### [P1] text-slate-500/600 on #1A2035 fails contrast
text-slate-500 (#64748B) on Card Slate (#1A2035) = ~3.4:1; text-slate-600 (#475569) on #1A2035 = ~2.2:1.
Both fail WCAG AA for text below 18px regular weight (requires 4.5:1).
Affected: KPI card sublabels, At Risk row labels, table headers, "Last updated just now", empty-state captions, chart legend.
Fix: Replace text-slate-500 → text-slate-400 (#94A3B8, 6.6:1 ✓) and drop text-slate-600 entirely on dark surfaces.

### [P1] "View all →" is a dead affordance
Line ~358: `<span className="text-xs text-slate-500 cursor-default">View all →</span>`
cursor-default + no href. Arrow implies navigation. Founders click it; nothing happens.
Fix: Remove entirely, or link to a real activity route when it exists.

### [P1] 70% recovery bar is hardcoded, not data-driven
`style={{ width: '70%' }}` is always 70% regardless of actual recovery performance.
"Unchurnly recovers ~70% of at-risk MRR" is an industry estimate presented as the user's personal rate.
Fix: Compute actual rate (mrr_saved / failed_est). Show estimate label only in demo mode.

### [P2] At Risk card: flat visual weight across opposite-valence rows
"Monthly at risk" (amber) + "Annual exposure" (amber) + "Recoverable (est.)" (emerald) at identical text-xl font-bold.
Problem → solution arc needs visual differentiation.
Fix: Add border-t border-white/5 separator before emerald row + optionally larger value size.

### [P2] "Last updated just now" is always "just now"
Static string. For a "Silent Guardian" experience, timestamp proves data is current.
Fix: Capture Date.now() at mount; display as "Updated at HH:MM".

## Persona Red Flags
- Alex: dead "View all", no filters, rows not interactive
- Sam: 2.2:1 table header contrast, icon-only dismiss with no aria-label, no aria-live on toast
- Marcus (anxious founder, 2am): hardcoded timestamp + 70% bar don't confirm specific payment was caught; Settings still light-mode

## What's Working
- Defense Status Bar pulsing dot: right kind of alive signal, achieves "Silent Guardian" brief
- Semantic badge discipline in activity table: translucent pills with text labels, colorblind-safe
- Three-layer tonal depth (canvas → sidebar → card) via flat hex: clean spatial hierarchy, no shadows
