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

/* ── Skeleton ───────────────────────────────────────────────────── */
.skeleton-card {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #e7e5e4);
  border-radius: var(--radius, 8px);
  padding: 24px;
}

.skeleton-row {
  height: 14px;
  background: var(--border, #e7e5e4);
  border-radius: 4px;
  margin-bottom: 12px;
}
.skeleton-row--wide { width: 60%; }
.skeleton-row--medium { width: 40%; }
.skeleton-row--large { height: 36px; width: 50%; }
.skeleton-row--full { width: 100%; }

.skeleton-divider {
  height: 1px;
  background: var(--border, #e7e5e4);
  margin: 20px 0;
}

.skeleton-bar-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.skeleton-bar {
  height: 8px;
  background: var(--border, #e7e5e4);
  border-radius: 4px;
  width: 100%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* ── Manual input ───────────────────────────────────────────────── */
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

.input-group {
  margin-bottom: 12px;
}

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
.retry-link:hover {
  color: var(--text-primary, #1c1917);
}

/* ── Degraded view ──────────────────────────────────────────────── */
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
.time-row:last-child {
  border-bottom: none;
}

.time-label {
  color: var(--text-muted, #78716c);
  font-size: 0.85rem;
}

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

/* ── Scorecard ──────────────────────────────────────────────────── */
.scorecard {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #e7e5e4);
  border-radius: var(--radius, 8px);
  padding: 24px;
}

.scorecard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.location-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-muted, #78716c);
}

.location-icon {
  font-size: 1rem;
}

.date-label {
  font-size: 0.8rem;
  color: var(--text-subtle, #a8a29e);
}

.sunset-hero {
  text-align: center;
  padding: 20px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border, #e7e5e4);
}

.hero-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted, #78716c);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.hero-time {
  display: block;
  font-family: var(--font-mono, monospace);
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-primary, #1c1917);
  line-height: 1.2;
}

.hero-golden {
  display: block;
  font-size: 0.8rem;
  color: var(--text-subtle, #a8a29e);
  margin-top: 8px;
  font-family: var(--font-mono, monospace);
}

/* ── Quality meter bars ─────────────────────────────────────────── */
.quality-meter-group {
  margin-bottom: 20px;
}

.meter-item {
  margin-bottom: 12px;
}
.meter-item:last-child {
  margin-bottom: 0;
}

.meter-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted, #78716c);
  margin-bottom: 4px;
}

.meter-track {
  height: 6px;
  background: var(--border, #e7e5e4);
  border-radius: 3px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: var(--accent-own, #2563eb);
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* ── Verdict badge ──────────────────────────────────────────────── */
.verdict {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border, #e7e5e4);
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
</style>
