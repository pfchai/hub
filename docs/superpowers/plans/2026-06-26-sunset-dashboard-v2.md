# Sunset Dashboard v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade sunset prediction page from a simple text card to a data-dashboard visual experience with sun arc SVG, donut charts, composite score, and countdown timer.

**Architecture:** Extend `useSunsetPrediction.js` with per-metric quality ratings and composite score. Rewrite `SunsetView.vue` template with SVG arc, SVG ring donut charts, score bar, and real-time countdown using `setInterval`. All visuals are pure CSS + inline SVG — zero new dependencies.

**Tech Stack:** Vue 3 (Composition API), SunCalc, Vitest. No new npm deps. No new API calls.

## Global Constraints

- Pure CSS + SVG + Vue 3 + SunCalc. No new npm deps. No new API calls.
- All existing states preserved: loading skeleton, geo-denied manual input, degraded weather-fail view, success dashboard.
- Dark mode via `prefers-color-scheme: dark`. SVG uses `currentColor` or explicit dark color values.
- `prefers-reduced-motion: reduce` disables animations globally (already in global.css).
- Max content width 480px (existing `.sunset-view` constraint).
- WCAG AA contrast maintained (≥4.5:1 for body text). Module color `#e07b5a` already verified.
- Ring color ranges per spec:
  - High cloud good: 30-70%, maybe: 10-30%, poor: <10% or >70%
  - Low cloud good: <30%, maybe: 30-70%, poor: >70%
  - Humidity good: 40-80%, maybe: 30-40% or >80%, poor: <30%
- Composite score algorithm per spec (high cloud max 40pts, low cloud max 30pts, humidity max 30pts).

---

### Task 1: Extend useSunsetPrediction with per-metric quality + composite score

**Files:**
- Modify: `src/modules/sunset/useSunsetPrediction.js`

**Interfaces:**
- Consumes: (coordsRef, weatherDataRef) — existing
- Produces:
  - Existing: `sunsetTime`, `goldenHourStart`, `goldenHourEnd`, `prediction`, `quality`, `details`
  - New: `highCloudQuality` (Ref<'good'|'maybe'|'poor'|null>), `lowCloudQuality` (Ref<'good'|'maybe'|'poor'|null>), `humidityQuality` (Ref<'good'|'maybe'|'poor'|null>)
  - New: `compositeScore` (Ref<number>) — integer 0–100
  - New: `highCloudPct` (Ref<number>), `lowCloudPct` (Ref<number>), `humidityPct` (Ref<number>)

- [ ] **Step 1: Add new refs and per-metric quality helper**

Add to the top of `useSunsetPrediction()` body, after existing ref declarations:

```js
/** @type {import('vue').Ref<'good' | 'maybe' | 'poor' | null>} */
const highCloudQuality = ref(null)
/** @type {import('vue').Ref<'good' | 'maybe' | 'poor' | null>} */
const lowCloudQuality = ref(null)
/** @type {import('vue').Ref<'good' | 'maybe' | 'poor' | null>} */
const humidityQuality = ref(null)
/** @type {import('vue').Ref<number>} */
const compositeScore = ref(0)
/** @type {import('vue').Ref<number>} */
const highCloudPct = ref(0)
/** @type {import('vue').Ref<number>} */
const lowCloudPct = ref(0)
/** @type {import('vue').Ref<number>} */
const humidityPct = ref(0)

/**
 * Rate a single metric against good/maybe/poor thresholds.
 * @param {number} value — percent 0–100
 * @param {'highCloud' | 'lowCloud' | 'humidity'} metric
 * @returns {'good' | 'maybe' | 'poor'}
 */
function rateMetric(value, metric) {
  if (metric === 'highCloud') {
    if (value >= 30 && value <= 70) return 'good'
    if (value > 10 && value < 30) return 'maybe'
    return 'poor'
  }
  if (metric === 'lowCloud') {
    if (value < 30) return 'good'
    if (value >= 30 && value <= 70) return 'maybe'
    return 'poor'
  }
  // humidity
  if (value >= 40 && value <= 80) return 'good'
  if ((value >= 30 && value < 40) || value > 80) return 'maybe'
  return 'poor'
}
```

- [ ] **Step 2: Add composite score helper**

```js
/**
 * Compute composite score 0–100 from three metrics.
 * @param {number} highCloud
 * @param {number} lowCloud
 * @param {number} humidity
 * @returns {number} integer 0–100
 */
function computeScore(highCloud, lowCloud, humidity) {
  let score = 0
  // High cloud (max 40)
  if (highCloud >= 30 && highCloud <= 70) score += 40
  else if (highCloud >= 10 && highCloud <= 30) score += 20
  // Low cloud (max 30)
  if (lowCloud < 30) score += 30
  else if (lowCloud >= 30 && lowCloud <= 70) score += 15
  // Humidity (max 30)
  if (humidity >= 40 && humidity <= 80) score += 30
  else if ((humidity >= 30 && humidity < 40) || humidity > 80) score += 15
  return score
}
```

- [ ] **Step 3: Update weatherData watcher to compute new outputs**

Replace the existing weatherData watcher body (from `const { cloud_cover_high...` through the if/else chain) with:

```js
watch(
  weatherDataRef,
  (data) => {
    if (!data || !data.current) {
      prediction.value = null
      quality.value = null
      details.value = null
      highCloudQuality.value = null
      lowCloudQuality.value = null
      humidityQuality.value = null
      compositeScore.value = 0
      highCloudPct.value = 0
      lowCloudPct.value = 0
      humidityPct.value = 0
      return
    }

    const { cloud_cover_high, cloud_cover_low, relative_humidity_2m } = data.current
    const highCloud = cloud_cover_high ?? 0
    const lowCloud = cloud_cover_low ?? 0
    const humidity = relative_humidity_2m ?? 0

    // Expose raw percentages
    highCloudPct.value = highCloud
    lowCloudPct.value = lowCloud
    humidityPct.value = humidity

    // Per-metric quality
    highCloudQuality.value = rateMetric(highCloud, 'highCloud')
    lowCloudQuality.value = rateMetric(lowCloud, 'lowCloud')
    humidityQuality.value = rateMetric(humidity, 'humidity')

    // Composite score
    compositeScore.value = computeScore(highCloud, lowCloud, humidity)

    // Overall verdict (unchanged logic)
    if (highCloud > 30 && humidity >= 40 && humidity <= 80 && lowCloud < 70) {
      quality.value = 'good'
      prediction.value = '值得一看'
      details.value = '高云覆盖和适宜湿度，晚霞色彩会很丰富。'
    } else if (highCloud > 10 && humidity >= 30) {
      quality.value = 'maybe'
      prediction.value = '可以留意'
      details.value = '有一定云量，但条件可能不是最理想。'
    } else {
      quality.value = 'unlikely'
      prediction.value = '概率较低'
      details.value = '天空太干净或湿度不合适，晚霞可能不明显。'
    }
  },
  { immediate: true }
)
```

- [ ] **Step 4: Update return statement**

```js
return {
  sunsetTime, goldenHourStart, goldenHourEnd,
  prediction, quality, details,
  highCloudQuality, lowCloudQuality, humidityQuality,
  compositeScore,
  highCloudPct, lowCloudPct, humidityPct,
}
```

- [ ] **Step 5: Update JSDoc return type**

Replace the `@returns` block with:

```js
/**
 * @returns {{
 *   sunsetTime: import('vue').Ref<Date | null>,
 *   goldenHourStart: import('vue').Ref<Date | null>,
 *   goldenHourEnd: import('vue').Ref<Date | null>,
 *   prediction: import('vue').Ref<string | null>,
 *   quality: import('vue').Ref<'good' | 'maybe' | 'unlikely' | null>,
 *   details: import('vue').Ref<string | null>,
 *   highCloudQuality: import('vue').Ref<'good' | 'maybe' | 'poor' | null>,
 *   lowCloudQuality: import('vue').Ref<'good' | 'maybe' | 'poor' | null>,
 *   humidityQuality: import('vue').Ref<'good' | 'maybe' | 'poor' | null>,
 *   compositeScore: import('vue').Ref<number>,
 *   highCloudPct: import('vue').Ref<number>,
 *   lowCloudPct: import('vue').Ref<number>,
 *   humidityPct: import('vue').Ref<number>
 * }}
 */
```

- [ ] **Step 6: Run existing tests to confirm no regressions**

Run: `npx vitest run src/modules/sunset/__tests__/useSunsetPrediction.test.js`
Expected: All 11 existing tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/modules/sunset/useSunsetPrediction.js
git commit -m "feat(sunset): add per-metric quality ratings and composite score"
```

---

### Task 2: Update useSunsetPrediction tests for new outputs

**Files:**
- Modify: `src/modules/sunset/__tests__/useSunsetPrediction.test.js`

**Interfaces:**
- Consumes: `useSunsetPrediction(coordsRef, weatherRef)` — same signature
- Produces: Tests for `highCloudQuality`, `lowCloudQuality`, `humidityQuality`, `compositeScore`, `highCloudPct`, `lowCloudPct`, `humidityPct`

- [ ] **Step 1: Add test for per-metric quality ratings (good conditions)**

Insert after the existing "returns good for optimal conditions" test, inside the `describe('prediction quality', ...)` block:

```js
it('exposes per-metric quality ratings for good conditions', async () => {
  const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
  const weatherRef = ref({
    current: {
      cloud_cover_high: 50,
      cloud_cover_low: 20,
      relative_humidity_2m: 60,
    },
  })

  const { highCloudQuality, lowCloudQuality, humidityQuality } = useSunsetPrediction(coordsRef, weatherRef)

  await vi.waitFor(() => {
    expect(highCloudQuality.value).toBe('good')
  })
  expect(lowCloudQuality.value).toBe('good')
  expect(humidityQuality.value).toBe('good')
})
```

- [ ] **Step 2: Add test for per-metric quality (maybe conditions)**

```js
it('exposes per-metric quality ratings for maybe conditions', async () => {
  const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
  const weatherRef = ref({
    current: {
      cloud_cover_high: 20,
      cloud_cover_low: 50,
      relative_humidity_2m: 35,
    },
  })

  const { highCloudQuality, lowCloudQuality, humidityQuality } = useSunsetPrediction(coordsRef, weatherRef)

  await vi.waitFor(() => {
    expect(highCloudQuality.value).toBe('maybe')
  })
  expect(lowCloudQuality.value).toBe('maybe')
  expect(humidityQuality.value).toBe('maybe')
})
```

- [ ] **Step 3: Add test for per-metric quality (poor conditions)**

```js
it('exposes per-metric quality ratings for poor conditions', async () => {
  const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
  const weatherRef = ref({
    current: {
      cloud_cover_high: 5,
      cloud_cover_low: 80,
      relative_humidity_2m: 20,
    },
  })

  const { highCloudQuality, lowCloudQuality, humidityQuality } = useSunsetPrediction(coordsRef, weatherRef)

  await vi.waitFor(() => {
    expect(highCloudQuality.value).toBe('poor')
  })
  expect(lowCloudQuality.value).toBe('poor')
  expect(humidityQuality.value).toBe('poor')
})
```

- [ ] **Step 4: Add test for composite score**

```js
describe('composite score', () => {
  it('returns 100 for perfect conditions', async () => {
    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const weatherRef = ref({
      current: {
        cloud_cover_high: 50,
        cloud_cover_low: 20,
        relative_humidity_2m: 60,
      },
    })

    const { compositeScore } = useSunsetPrediction(coordsRef, weatherRef)

    await vi.waitFor(() => {
      expect(compositeScore.value).toBe(100)
    })
  })

  it('returns 0 for worst conditions', async () => {
    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const weatherRef = ref({
      current: {
        cloud_cover_high: 5,
        cloud_cover_low: 80,
        relative_humidity_2m: 20,
      },
    })

    const { compositeScore } = useSunsetPrediction(coordsRef, weatherRef)

    await vi.waitFor(() => {
      expect(compositeScore.value).toBe(0)
    })
  })

  it('returns intermediate scores for mixed conditions', async () => {
    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const weatherRef = ref({
      current: {
        cloud_cover_high: 50,  // good → 40
        cloud_cover_low: 50,   // maybe → 15
        relative_humidity_2m: 35, // maybe → 15
      },
    })

    const { compositeScore } = useSunsetPrediction(coordsRef, weatherRef)

    await vi.waitFor(() => {
      expect(compositeScore.value).toBe(70)
    })
  })

  it('returns 0 when weather data is missing', () => {
    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const weatherRef = ref(null)
    const { compositeScore } = useSunsetPrediction(coordsRef, weatherRef)

    expect(compositeScore.value).toBe(0)
  })
})
```

- [ ] **Step 5: Add test for exposed percentage refs**

```js
it('exposes raw percentage values', async () => {
  const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
  const weatherRef = ref({
    current: {
      cloud_cover_high: 45,
      cloud_cover_low: 22,
      relative_humidity_2m: 65,
    },
  })

  const { highCloudPct, lowCloudPct, humidityPct } = useSunsetPrediction(coordsRef, weatherRef)

  await vi.waitFor(() => {
    expect(highCloudPct.value).toBe(45)
  })
  expect(lowCloudPct.value).toBe(22)
  expect(humidityPct.value).toBe(65)
})
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/modules/sunset/__tests__/useSunsetPrediction.test.js`
Expected: All 16 tests PASS (11 existing + 5 new).

- [ ] **Step 7: Commit**

```bash
git add src/modules/sunset/__tests__/useSunsetPrediction.test.js
git commit -m "test(sunset): add tests for per-metric quality and composite score"
```

---

### Task 3: Rewrite SunsetView.vue template + script

**Files:**
- Modify: `src/modules/sunset/SunsetView.vue` (template + script sections only)

**Interfaces:**
- Consumes:
  - `useGeolocation()` — `{ coords, error: geoError, isLoading: geoLoading, retry: retryGeolocation }`
  - `useWeather(effectiveCoords)` — `{ data: weatherData, error: weatherError, isLoading: weatherLoading }`
  - `useSunsetPrediction(effectiveCoords, weatherData)` — all existing + new refs from Task 1
- Produces: Full dashboard UI template + countdown timer logic

- [ ] **Step 1: Read current SunsetView.vue to get the complete file**

Run: `cat src/modules/sunset/SunsetView.vue` to verify current state (we know it from earlier reads).

- [ ] **Step 2: Replace the template section**

Replace lines 1–125 (entire `<template>`) with:

```html
<template>
  <div class="sunset-view">
    <h1 class="sunset-title">晚霞预测</h1>
    <p class="sunset-subtitle">看看今晚有没有好看的晚霞</p>

    <!-- ── Loading skeleton ──────────────────────────────────── -->
    <div v-if="isLoading" class="skeleton-card">
      <div class="skeleton-arc pulse" />
      <div class="skeleton-divider" />
      <div class="skeleton-row skeleton-row--large pulse" />
      <div class="skeleton-row skeleton-row--medium pulse" />
      <div class="skeleton-divider" />
      <div class="skeleton-donuts">
        <div class="skeleton-donut pulse" />
        <div class="skeleton-donut pulse" />
        <div class="skeleton-donut pulse" />
      </div>
      <div class="skeleton-divider" />
      <div class="skeleton-row skeleton-row--wide pulse" />
    </div>

    <!-- ── Manual input card ─────────────────────────────────── -->
    <div v-else-if="!effectiveCoords" class="manual-input-card">
      <p v-if="geoError" class="manual-hint">{{ geoError }}</p>
      <p v-else class="manual-hint">请输入你的坐标来查看晚霞预测</p>
      <div class="input-group">
        <label class="input-label" for="manual-lat">纬度</label>
        <input
          id="manual-lat"
          v-model.number="manualLat"
          type="number"
          step="any"
          placeholder="31.23"
          class="coord-input"
        />
      </div>
      <div class="input-group">
        <label class="input-label" for="manual-lng">经度</label>
        <input
          id="manual-lng"
          v-model.number="manualLng"
          type="number"
          step="any"
          placeholder="121.47"
          class="coord-input"
        />
      </div>
      <button class="submit-btn" :disabled="!manualLat || !manualLng" @click="submitManualCoords">
        查询
      </button>
      <button v-if="geoError" class="retry-link" @click="retryGeolocation">
        重试定位
      </button>
    </div>

    <!-- ── Has coordinates — show prediction or degraded ────── -->
    <template v-else>
      <!-- Degraded: weather API failed → sunset times only + arc -->
      <div v-if="weatherError" class="degraded-card">
        <div class="degraded-banner">天气数据暂不可用</div>
        <div class="sun-arc" v-if="sunsetTime">
          <svg viewBox="0 0 400 130" class="sun-arc-svg" aria-label="太阳轨迹">
            <defs>
              <linearGradient id="arcGradDegraded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--border)" stop-opacity="0.3" />
                <stop offset="100%" stop-color="var(--border)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="arcPath" fill="url(#arcGradDegraded)" stroke="var(--text-muted)" stroke-width="1.5" fill-opacity="0.4" />
            <circle :cx="sunDotX" :cy="sunDotY" r="6" fill="var(--text-muted)" />
          </svg>
          <div class="arc-countdown">{{ countdownText }}</div>
        </div>
        <h2 class="section-title">日落时间</h2>
        <div class="time-row">
          <span class="time-label">日落</span>
          <span class="time-value prominent">{{ formatTime(sunsetTime) }}</span>
        </div>
        <div class="time-row">
          <span class="time-label">黄金时刻</span>
          <span class="time-value">{{ formatTime(goldenHourStart) }} — {{ formatTime(goldenHourEnd) }}</span>
        </div>
      </div>

      <!-- Success: full dashboard -->
      <div v-else-if="weatherData" class="dashboard" :class="`dashboard--${quality || 'unknown'}`">
        <!-- ── Header: location + date ──────────────────────── -->
        <div class="dashboard-header">
          <div class="location-badge">
            <span class="location-icon">&#127758;</span>
            <span>{{ locationLabel }}</span>
          </div>
          <span class="date-label">{{ formatDate(new Date()) }}</span>
        </div>

        <!-- ── Sun Arc ───────────────────────────────────────── -->
        <div class="sun-arc" v-if="sunsetTime">
          <svg viewBox="0 0 400 130" class="sun-arc-svg" aria-label="太阳轨迹">
            <defs>
              <linearGradient id="arcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="arcColor" stop-opacity="0.25" />
                <stop offset="100%" :stop-color="arcColor" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="arcPath" fill="url(#arcGrad)" :stroke="arcColor" stroke-width="2" fill-opacity="0.35" />
            <circle :cx="sunDotX" :cy="sunDotY" r="6" :fill="arcColor" />
          </svg>
          <div class="arc-countdown">{{ countdownText }}</div>
        </div>

        <!-- ── Sunset Time Hero ──────────────────────────────── -->
        <div class="sunset-hero">
          <span class="hero-label">日落时间</span>
          <span class="hero-time">{{ formatTime(sunsetTime) }}</span>
          <span class="hero-golden">
            黄金时刻 {{ formatTime(goldenHourStart) }} — {{ formatTime(goldenHourEnd) }}
          </span>
        </div>

        <!-- ── Three Donut Charts ────────────────────────────── -->
        <div class="donut-group">
          <div class="donut-item">
            <svg viewBox="0 0 80 80" class="donut-svg">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" stroke-width="6" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                :stroke="donutColor(highCloudQuality)"
                stroke-width="6" stroke-linecap="round"
                :stroke-dasharray="donutDash(highCloudPct)"
                stroke-dashoffset="0"
                transform="rotate(-90 40 40)"
                class="donut-ring"
              />
              <text x="40" y="38" text-anchor="middle" class="donut-value">{{ highCloudPct }}%</text>
            </svg>
            <span class="donut-label">高云</span>
          </div>
          <div class="donut-item">
            <svg viewBox="0 0 80 80" class="donut-svg">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" stroke-width="6" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                :stroke="donutColor(lowCloudQuality)"
                stroke-width="6" stroke-linecap="round"
                :stroke-dasharray="donutDash(lowCloudPct)"
                stroke-dashoffset="0"
                transform="rotate(-90 40 40)"
                class="donut-ring"
              />
              <text x="40" y="38" text-anchor="middle" class="donut-value">{{ lowCloudPct }}%</text>
            </svg>
            <span class="donut-label">低云</span>
          </div>
          <div class="donut-item">
            <svg viewBox="0 0 80 80" class="donut-svg">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" stroke-width="6" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                :stroke="donutColor(humidityQuality)"
                stroke-width="6" stroke-linecap="round"
                :stroke-dasharray="donutDash(humidityPct)"
                stroke-dashoffset="0"
                transform="rotate(-90 40 40)"
                class="donut-ring"
              />
              <text x="40" y="38" text-anchor="middle" class="donut-value">{{ humidityPct }}%</text>
            </svg>
            <span class="donut-label">湿度</span>
          </div>
        </div>

        <!-- ── Composite Score ───────────────────────────────── -->
        <div class="score-section">
          <div class="score-header">
            <span class="score-label">综合评分</span>
            <span class="score-number" :class="`score-number--${quality}`">{{ compositeScore }}</span>
          </div>
          <div class="score-track">
            <div class="score-fill" :class="`score-fill--${quality}`" :style="{ width: compositeScore + '%' }" />
          </div>
        </div>

        <!-- ── Verdict ───────────────────────────────────────── -->
        <div class="verdict" :class="verdictClass">
          <span class="verdict-badge">{{ verdictEmoji }} {{ prediction }}</span>
          <p class="verdict-detail">{{ details }}</p>
        </div>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 3: Replace the script section**

Replace lines 128–202 (entire `<script setup>`) with:

```js
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGeolocation } from './useGeolocation.js'
import { useWeather } from './useWeather.js'
import { useSunsetPrediction } from './useSunsetPrediction.js'

// ── Geolocation ─────────────────────────────────────────────────
const { coords, error: geoError, isLoading: geoLoading, retry: retryGeolocation } = useGeolocation()

// ── Pre-fill input fields when geolocation succeeds ──────────────
watch(coords, (newCoords) => {
  if (newCoords) {
    manualLat.value = newCoords.latitude
    manualLng.value = newCoords.longitude
  }
}, { immediate: true })

// ── Manual coordinate input ─────────────────────────────────────
const manualCoords = ref(null)
const manualLat = ref(null)
const manualLng = ref(null)

function submitManualCoords() {
  if (manualLat.value != null && manualLng.value != null) {
    manualCoords.value = { latitude: manualLat.value, longitude: manualLng.value }
  }
}

// Effective coordinates
const effectiveCoords = computed(() => coords.value || manualCoords.value)

// ── Weather ─────────────────────────────────────────────────────
const { data: weatherData, error: weatherError, isLoading: weatherLoading } = useWeather(effectiveCoords)

// ── Sunset prediction ───────────────────────────────────────────
const {
  sunsetTime,
  goldenHourStart,
  goldenHourEnd,
  prediction,
  quality,
  details,
  highCloudQuality,
  lowCloudQuality,
  humidityQuality,
  compositeScore,
  highCloudPct,
  lowCloudPct,
  humidityPct,
} = useSunsetPrediction(effectiveCoords, weatherData)

// ── Loading state ────────────────────────────────────────────────
const isLoading = computed(() => geoLoading.value || (effectiveCoords.value && weatherLoading.value))

// ── Verdict ──────────────────────────────────────────────────────
const verdictClass = computed(() => {
  if (!quality.value) return ''
  return `verdict--${quality.value}`
})

const verdictEmoji = computed(() => {
  if (quality.value === 'good') return '✨'
  if (quality.value === 'maybe') return '👀'
  return '🌫️'
})

// ── Location label ───────────────────────────────────────────────
const locationLabel = computed(() => {
  if (!effectiveCoords.value) return '未知位置'
  const { latitude, longitude } = effectiveCoords.value
  return `${latitude.toFixed(2)}°${latitude >= 0 ? 'N' : 'S'}, ${longitude.toFixed(2)}°${longitude >= 0 ? 'E' : 'W'}`
})

// ── Sun Arc computation ──────────────────────────────────────────
const arcColor = computed(() => {
  if (quality.value === 'good') return '#f59e0b'
  if (quality.value === 'maybe') return '#d97706'
  return '#78716c'
})

const arcPath = computed(() => {
  // Semi-ellipse arc from left (sunrise) to right (sunset)
  const w = 400, h = 130
  const margin = 30
  const cy = h - 15
  const startX = margin, endX = w - margin
  const controlY = cy - 90
  return `M ${startX} ${cy} Q ${w / 2} ${controlY} ${endX} ${cy}`
})

// Current sun position along the arc (0 = sunrise, 1 = sunset)
const sunProgress = ref(0.5)

const sunDotX = computed(() => {
  const t = sunProgress.value
  return 30 + t * 340 // 30 → 370 along 400px viewBox
})

const sunDotY = computed(() => {
  const t = sunProgress.value
  const cy = 115
  const controlY = 25
  // Quadratic bezier: y(t) = (1-t)²*y0 + 2(1-t)t*y1 + t²*y2
  return (1-t)*(1-t)*cy + 2*(1-t)*t*controlY + t*t*cy
})

function updateSunPosition() {
  if (!sunsetTime.value) {
    sunProgress.value = 0.5
    return
  }
  const now = Date.now()
  const sunsetMs = sunsetTime.value.getTime()
  // Sunrise is approx 12h before sunset in summer, use goldenHour as rough sunrise
  const sunriseMs = goldenHourStart.value
    ? goldenHourStart.value.getTime() - 3600000 * 8 // rough sunrise ~8h before golden hour
    : sunsetMs - 3600000 * 14

  if (now <= sunriseMs) {
    sunProgress.value = 0
  } else if (now >= sunsetMs) {
    sunProgress.value = 1
  } else {
    sunProgress.value = (now - sunriseMs) / (sunsetMs - sunriseMs)
  }
}

// ── Countdown timer ──────────────────────────────────────────────
const countdownText = ref('')

function updateCountdown() {
  if (!sunsetTime.value) {
    countdownText.value = ''
    return
  }
  const now = Date.now()
  const sunsetMs = sunsetTime.value.getTime()
  const diff = sunsetMs - now

  if (diff <= 0) {
    countdownText.value = '日落已过'
  } else {
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (hours > 0) {
      countdownText.value = `距日落 ${hours}h ${minutes}m`
    } else {
      countdownText.value = `距日落 ${minutes}m`
    }
  }
}

let countdownTimer = null

onMounted(() => {
  updateSunPosition()
  updateCountdown()
  countdownTimer = setInterval(() => {
    updateSunPosition()
    updateCountdown()
  }, 1000)
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

// ── Donut chart helpers ──────────────────────────────────────────
// Circumference of r=32 circle
const DONUT_CIRCUM = 2 * Math.PI * 32

function donutDash(pct) {
  const p = Math.min(100, Math.max(0, pct))
  const fill = (p / 100) * DONUT_CIRCUM
  return `${fill} ${DONUT_CIRCUM - fill}`
}

function donutColor(qualityRef) {
  const q = qualityRef?.value ?? null
  if (q === 'good') return '#16a34a'
  if (q === 'maybe') return '#ca8a04'
  return 'var(--text-muted)'
}

// ── Formatters ──────────────────────────────────────────────────
function formatTime(date) {
  if (!date) return '--:--'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDate(date) {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })
}
</script>
```

- [ ] **Step 4: Verify template/script integrity**

Run: `npx vite build --mode production 2>&1 | tail -5`
Expected: Build succeeds without errors.

- [ ] **Step 5: Run existing tests to catch regressions**

Run: `npx vitest run`
Expected: All previously passing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add src/modules/sunset/SunsetView.vue
git commit -m "feat(sunset): dashboard v2 template + script with sun arc, donuts, score, countdown"
```

---

### Task 4: Rewrite SunsetView.vue styles

**Files:**
- Modify: `src/modules/sunset/SunsetView.vue` (style section only)

**Interfaces:**
- Consumes: CSS classes from Task 3 template
- Produces: Complete visual styling for dashboard, arc, donuts, score bar, dark mode, reduced motion

- [ ] **Step 1: Replace the entire `<style scoped>` block (lines 204-555)**

Replace with:

```css
<style scoped>
.sunset-view {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
}

.sunset-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.sunset-subtitle {
  color: var(--text-muted, #78716c);
  font-size: 0.9rem;
  margin-bottom: 24px;
}

/* ── Skeleton (updated for dashboard proportions) ────────────── */
.skeleton-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #e7e5e4);
  border-radius: var(--radius, 8px);
  padding: 24px;
}

.skeleton-arc {
  height: 100px;
  background: var(--border, #e7e5e4);
  border-radius: 8px;
  margin-bottom: 20px;
}

.skeleton-row {
  height: 14px;
  background: var(--border, #e7e5e4);
  border-radius: 4px;
  margin-bottom: 12px;
}
.skeleton-row--wide { width: 70%; }
.skeleton-row--medium { width: 50%; }
.skeleton-row--large { height: 36px; width: 40%; margin-left: auto; margin-right: auto; }

.skeleton-divider {
  height: 1px;
  background: var(--border, #e7e5e4);
  margin: 20px 0;
}

.skeleton-donuts {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}
.skeleton-donut {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--border, #e7e5e4);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.pulse { animation: pulse 1.5s ease-in-out infinite; }

/* ── Manual input (unchanged from original) ──────────────────── */
.manual-input-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #e7e5e4);
  border-radius: var(--radius, 8px);
  padding: 24px;
}

.manual-hint {
  color: var(--text-muted, #78716c);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.input-group { margin-bottom: 12px; }

.input-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted, #78716c);
  margin-bottom: 4px;
  font-weight: 500;
}

.coord-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border, #e7e5e4);
  border-radius: 6px;
  background: var(--bg-primary, #fafaf9);
  color: var(--text-primary, #1c1917);
  font-size: 0.9rem;
  font-family: var(--font-mono, monospace);
}
.coord-input:focus {
  outline: none;
  border-color: var(--accent-own, #2563eb);
}

.submit-btn {
  display: block;
  width: 100%;
  padding: 10px 16px;
  margin-top: 16px;
  border: none;
  border-radius: 6px;
  background: var(--accent-own, #2563eb);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.retry-link {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border: none;
  background: none;
  color: var(--text-muted, #78716c);
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}
.retry-link:hover { color: var(--text-primary, #1c1917); }

/* ── Degraded card ───────────────────────────────────────────── */
.degraded-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #e7e5e4);
  border-radius: var(--radius, 8px);
  padding: 24px;
}

.degraded-banner {
  background: #fef3c7;
  color: #92400e;
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .degraded-banner {
    background: #3a2e1a;
    color: #fbbf24;
  }
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted, #78716c);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border, #e7e5e4);
}
.time-row:last-child { border-bottom: none; }

.time-label { color: var(--text-muted, #78716c); font-size: 0.85rem; }

.time-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.9rem;
  font-weight: 500;
}
.time-value.prominent {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary, #1c1917);
}

/* ── Dashboard card ──────────────────────────────────────────── */
.dashboard {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #e7e5e4);
  border-radius: var(--radius, 8px);
  padding: 24px;
  transition: background 0.8s ease, border-color 0.8s ease;
}

.dashboard--good {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, var(--bg-card, #ffffff) 60%);
}

.dashboard--maybe {
  border-color: rgba(217, 119, 6, 0.2);
  background: linear-gradient(180deg, rgba(217, 119, 6, 0.04) 0%, var(--bg-card, #ffffff) 60%);
}

@media (prefers-color-scheme: dark) {
  .dashboard--good {
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-card, #2a2723) 60%);
  }
  .dashboard--maybe {
    background: linear-gradient(180deg, rgba(217, 119, 6, 0.06) 0%, var(--bg-card, #2a2723) 60%);
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.location-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted, #78716c);
}

.location-icon { font-size: 1rem; }

.date-label {
  font-size: 0.8rem;
  color: var(--text-subtle, #a8a29e);
}

/* ── Sun Arc ─────────────────────────────────────────────────── */
.sun-arc {
  text-align: center;
  margin-bottom: 16px;
}

.sun-arc-svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

.arc-countdown {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  color: var(--text-muted, #78716c);
  margin-top: 4px;
}

/* ── Sunset Hero ─────────────────────────────────────────────── */
.sunset-hero {
  text-align: center;
  padding: 12px 0 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border, #e7e5e4);
}

.hero-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted, #78716c);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.hero-time {
  display: block;
  font-family: var(--font-mono, monospace);
  font-size: 3rem;
  font-weight: var(--font-weight-headline, 800);
  color: var(--text-primary, #1c1917);
  line-height: 1.1;
}

.hero-golden {
  display: block;
  font-size: 0.8rem;
  color: var(--text-subtle, #a8a29e);
  margin-top: 6px;
  font-family: var(--font-mono, monospace);
}

/* ── Donut Charts ────────────────────────────────────────────── */
.donut-group {
  display: flex;
  justify-content: space-around;
  gap: 12px;
  margin-bottom: 24px;
}

.donut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.donut-svg {
  width: 80px;
  height: 80px;
}

.donut-ring {
  transition: stroke-dasharray 0.6s ease, stroke 0.6s ease;
}

.donut-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 600;
  fill: var(--text-primary, #1c1917);
}

.donut-label {
  font-size: 0.75rem;
  color: var(--text-muted, #78716c);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Composite Score ─────────────────────────────────────────── */
.score-section {
  margin-bottom: 20px;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.score-label {
  font-size: 0.8rem;
  color: var(--text-muted, #78716c);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-number {
  font-family: var(--font-mono, monospace);
  font-size: 1.6rem;
  font-weight: 700;
  transition: color 0.6s ease;
}

.score-number--good { color: #16a34a; }
.score-number--maybe { color: #ca8a04; }
.score-number--unlikely { color: var(--text-muted, #78716c); }

.score-track {
  height: 8px;
  background: var(--border, #e7e5e4);
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease, background 0.6s ease;
}

.score-fill--good { background: #16a34a; }
.score-fill--maybe { background: #ca8a04; }
.score-fill--unlikely { background: var(--text-muted, #78716c); }

/* ── Verdict ─────────────────────────────────────────────────── */
.verdict {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border, #e7e5e4);
  transition: background 0.6s ease, border-color 0.6s ease;
}

.verdict--good {
  border-color: #86efac;
  background: #f0fdf4;
}
.verdict--maybe {
  border-color: #fde68a;
  background: #fefce8;
}
.verdict--unlikely {
  border-color: var(--border, #e7e5e4);
  background: var(--bg-secondary, #f5f3ef);
}

@media (prefers-color-scheme: dark) {
  .verdict--good {
    border-color: #166534;
    background: #052e16;
  }
  .verdict--maybe {
    border-color: #854d0e;
    background: #292524;
  }
  .verdict--unlikely {
    border-color: #3a3530;
    background: #24211d;
  }
}

.verdict-badge {
  display: inline-block;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.verdict--good .verdict-badge { color: #16a34a; }
.verdict--maybe .verdict-badge { color: #ca8a04; }
.verdict--unlikely .verdict-badge { color: var(--text-muted, #78716c); }

.verdict-detail {
  font-size: 0.85rem;
  color: var(--text-muted, #78716c);
  line-height: 1.5;
}

/* ── Reduced motion ──────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .donut-ring,
  .score-fill,
  .dashboard,
  .verdict,
  .score-number {
    transition: none;
  }
  .pulse { animation: none; }
}
</style>
```

- [ ] **Step 2: Verify build**

Run: `npx vite build --mode production 2>&1 | tail -8`
Expected: Build succeeds, no CSS warnings.

- [ ] **Step 3: Verify contrast compliance**

Run: `node scripts/check-contrast.js`
Expected: All module colors pass ≥4.5:1.

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/modules/sunset/SunsetView.vue
git commit -m "style(sunset): dashboard v2 visual styles — arc, donuts, score bar, gradients"
```
