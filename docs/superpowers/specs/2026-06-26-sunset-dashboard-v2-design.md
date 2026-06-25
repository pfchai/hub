# Sunset Dashboard v2 — Design Spec

**Date:** 2026-06-26
**Status:** Approved
**Module:** `src/modules/sunset/`
**Constraint:** Pure CSS + SVG + existing deps (Vue 3, SunCalc). No new npm deps. No new API calls.

## Overview

Upgrade the sunset prediction page from a simple text card to a data-dashboard visual experience. Preserve all existing functionality (geolocation, manual input, weather fetch, prediction, degraded/error states). Add 5 visual elements + polish.

## Layout (480px single-column, top to bottom)

```
┌─────────────────────────────────┐
│  📍 31.23°N, 121.47°E   周五 6/26 │  ← location + date
├─────────────────────────────────┤
│                                 │
│       🌤️ Sun arc                │  ← SVG arc (w400×h140)
│       sunrise → sunset path      │     current sun position dot
│       Countdown: 3h 24m          │     countdown below arc
│                                 │
├─────────────────────────────────┤
│     Sunset      18:52           │  ← large time (3rem)
│     Golden Hour 18:22 — 18:52   │
├─────────────────────────────────┤
│  High Cloud  Low Cloud  Humidity │  ← 3-column donut chart
│    ●45%        ●20%       ●65%  │     SVG ring progress
│                                 │     ring color changes with value
├─────────────────────────────────┤
│  ████████████░░░░  Score 72     │  ← composite bar + number
│  值得一看 ✨                     │  ← verdict
│  高云+适宜湿度，晚霞色彩会丰富    │
└─────────────────────────────────┘
```

## Visual Elements

### 1. Sun Arc (SVG, 400×140px)

- SVG `<path>` semi-arc showing sunrise → current → sunset trajectory
- `<circle>` for sun position at current time
- Sky gradient fill background (warm tones)
- Countdown timer below arc: "距日落 Xh Ym", updates every second via `setInterval`
- On `prefers-reduced-motion`: hide animation, show static arc

### 2. Large Sunset Time

- Font size increased to 3rem (`--font-weight-headline` 800)
- Centered below arc
- Golden hour time line underneath in `--text-muted`

### 3. Three-Column Donut Charts

- 3 × SVG ring progress circles (80×80px each)
- High cloud / Low cloud / Humidity
- Ring color depends on value quality:
  - **Good range (green):** high cloud 30-70%, low cloud <30%, humidity 40-80%
  - **Maybe range (yellow):** high cloud 10-30%, low cloud 30-70%, humidity 30-40%
  - **Poor range (gray):** ≤10% high cloud, ≥70% low cloud, <30% or >80% humidity
- Percent text centered inside each ring
- Labels below each ring

### 4. Composite Score

- 0-100 progress bar, color changes with verdict (green/yellow/gray)
- Large score number
- Verdict badge with emoji: ✨ = good, 👀 = maybe, 🌫️ = unlikely

### 5. Polish

- Card background gets a subtle gradient tint based on verdict (warm orange for good, muted for unlikely)
- Smooth transitions on all value changes (0.6s ease)
- Dark mode: all SVG use `currentColor` or explicit dark palette
- `prefers-reduced-motion`: disable arc animation, use instant transitions

## Ring Color Rules

| Metric | Good (green #16a34a) | Maybe (yellow #ca8a04) | Poor (--text-muted) |
|--------|----------------------|------------------------|---------------------|
| High Cloud | 30-70% | 10-30% | <10% or >70% |
| Low Cloud | <30% | 30-70% | >70% |
| Humidity | 40-80% | 30-40% or >80% | <30% |

## Composite Score Algorithm

```
score = 0
if highCloud between 30-70: score += 40
else if highCloud between 10-30: score += 20
if lowCloud < 30: score += 30
else if lowCloud between 30-70: score += 15
if humidity between 40-80: score += 30
else if humidity between 30-40 or >80: score += 15
// max = 100, min = 0
```

## Files Changed

| File | Change | Est. Lines |
|------|--------|------------|
| `src/modules/sunset/SunsetView.vue` | Full visual rewrite — SVG arc, donut charts, score bar, countdown, gradients | ~300 (template + style) |
| `src/modules/sunset/useSunsetPrediction.js` | Expose per-metric quality + composite score | ~50 |
| `src/modules/sunset/useSunsetPrediction.test.js` | Test new score/metric outputs | ~30 |

## States Preserved

All existing states remain:
- **Loading:** Skeleton card (keep existing, tweak to match new layout proportions)
- **Geo denied / manual input:** Keep existing input card
- **Degraded (weather fail):** Keep existing degraded card + add sun arc (works with just suncalc)
- **Success:** New dashboard layout

## Not in Scope

- Multi-day forecast (tomorrow/day-after) — deferred to v3
- Static map thumbnail — deferred to v3
- New API calls
- New npm dependencies
- Responsive breakpoints beyond existing 480px max-width
