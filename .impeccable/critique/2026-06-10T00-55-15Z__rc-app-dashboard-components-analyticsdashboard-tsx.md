---
timestamp: 2026-06-10T00-55-15Z
slug: rc-app-dashboard-components-analyticsdashboard-tsx
---
## Heuristic Scores

| # | Heuristic | Score | Note |
|---|-----------|-------|------|
| 1 | Visibility of System Status | 4 | Dynamic timestamp + role="alert" toast + realtime widget detection + aria-hidden pulsing dot — fully instrumented |
| 2 | Match System / Real World | 3 | Recovery bar now data-driven; "Cancellations Saved" label implies count but value is % rate |
| 3 | User Control and Freedom | 2 | No date range on chart; activity rows non-interactive; no drill-down paths |
| 4 | Consistency and Standards | 3 | Dashboard dark theme consistent internally; other pages may still diverge |
| 5 | Error Prevention | 3 | Recovery bar replaced with actual math; recovery_pct capped at 100%; failed_est > 0 guard |
| 6 | Recognition Rather Than Recall | 3 | Dead "View all →" removed; chart Legend present; no new discovery paths added |
| 7 | Flexibility and Efficiency | 1 | No shortcuts, filters, export, or bulk actions |
| 8 | Aesthetic and Minimalist Design | 3 | Two text-slate-500 contrast survivors; uppercase tracking-widest on 7 elements |
| 9 | Error Recovery | 2 | handleDismiss try-catch good; no designed error states for data load failures |
| 10 | Help and Documentation | 2 | Docs sidebar link points to #; no KPI tooltips |

**Total: 26/40**

## Priority Issues

### [P2] text-slate-500 survives on two secondary labels
- Line 231: timestamp span text-xs text-slate-500 on canvas #0F1117 = ~3.97:1 fails WCAG AA small text
- Line 381: "Last 10 events" span text-xs text-slate-500 on card #1A2035 = ~3.39:1 fails
Fix: change both to text-slate-400; use text-slate-300 on canvas position for highest confidence.

### [P2] "Cancellations Saved" label implies count; value is % rate
KPI card 3: label "CANCELLATIONS SAVED" + value "31.2%". "Saved" implies integer count. Sublabel corrects below the value, too late for scan-reading.
Fix: rename label to "Offer Acceptance" and sublabel to "of cancel attempts retained".

### [P2] new Date(ev.date) renders "Invalid Date" with null/malformed input
Line 440: no null guard on ev.date before toLocaleDateString().
Fix: ev.date ? new Date(ev.date).toLocaleDateString(...) : '—'

## Persona Red Flags
- Alex: hover state on activity rows implies click with no destination; no date range; no export; DEMO banner has no CTA button
- Sam: X icons in dismiss buttons missing aria-hidden; no focus-visible ring on interactive elements; table missing caption/aria-label; chart SVG has no accessible description

## What's Working
- H1 fully instrumented: dynamic timestamp, role="alert", realtime widget detection, pulsing dot
- Data integrity guardrails: hasRealRecoveryData, Math.min(100,...), failed_est > 0 guard
- Semantic badge discipline: 6 outcome states, consistent translucent pill treatment, colorblind-safe
