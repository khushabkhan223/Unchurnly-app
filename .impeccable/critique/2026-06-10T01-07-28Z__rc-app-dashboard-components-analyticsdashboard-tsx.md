---
target: dashboard
total_score: 27
p0_count: 0
p1_count: 0
p2_count: 2
p3_count: 1
timestamp: 2026-06-10T01-07-28Z
slug: rc-app-dashboard-components-analyticsdashboard-tsx
---
## Heuristic Scores

| # | Heuristic | Score | Note |
|---|-----------|-------|------|
| 1 | Visibility of System Status | 4 | Focus rings + aria-hidden + role="alert" + dynamic timestamp + realtime — fully instrumented |
| 2 | Match System / Real World | 4 | "Offer Acceptance" matches % value; sublabels precise; DEMO CTA present; all labels founder-native |
| 3 | User Control and Freedom | 2 | Activity rows hover with no click destination; no date range on chart |
| 4 | Consistency and Standards | 3 | Internal consistency excellent; other dashboard pages may diverge |
| 5 | Error Prevention | 3 | Date null guard added; recovery_pct capped; failed_est > 0 guard |
| 6 | Recognition Rather Than Recall | 3 | DEMO CTA now visible; chart Legend present; no drill-down from activity rows |
| 7 | Flexibility and Efficiency | 1 | No shortcuts, filters, export, or bulk actions |
| 8 | Aesthetic and Minimalist Design | 3 | Timestamp text-slate-300 next to text-slate-400 primary — visual hierarchy inversion |
| 9 | Error Recovery | 2 | Silent catch on banner dismiss; no designed error states for data load failures |
| 10 | Help and Documentation | 2 | Docs sidebar link dead; no KPI tooltips; chart Y-axis unlabeled |

**Total: 27/40**

## Priority Issues

### [P3] Timestamp text-slate-300 inverts visual hierarchy
Line 236: text-slate-300 (#CBD5E1) is brighter than adjacent text-slate-400 primary text.
text-slate-400 on canvas = 7.36:1 — passes contrast. The fix overcorrected.
Fix: text-slate-300 → text-slate-400 on line 236.

### [P2] Activity table hover state promises interaction that doesn't exist
Line 410: hover:bg-white/[0.02] on rows that click to nothing. Universal convention: row hover = row is clickable.
Fix: remove hover class (display-only table) or add click handler + event detail route.

### [P2] ComposedChart Y-axis combines incommensurable series
MRR Saved ($) and Widget Opens (count) share one Y-axis. Tick labels are ambiguous (dollars or count?).
Fix: add second YAxis with yAxisId="right" orientation="right"; assign yAxisId to each series. Or drop Widget Opens.

## Persona Red Flags
- Alex: row click does nothing; no date range; no export
- Sam: AlertTriangle and CheckCircle icons missing aria-hidden="true"; chart empty state ambiguous to SR users

## What's Working
- Label/value contract clean throughout: every KPI label predicts its value type correctly
- All banners are action-complete: widget missing, demo, verified all have clear next action
- Accessibility baseline solid: role="alert", focus-visible rings, aria-labels on chart and table

## Trend
24 → 26 → 27
