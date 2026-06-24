<template>
  <div class="sunset-view">
    <h1 class="sunset-title">晚霞预测</h1>
    <p class="sunset-subtitle">看看今晚有没有好看的晚霞</p>

    <!-- ── Loading skeleton ──────────────────────────────────── -->
    <div v-if="isLoading" class="skeleton-card">
      <div class="skeleton-row skeleton-row--wide pulse" />
      <div class="skeleton-row skeleton-row--medium pulse" />
      <div class="skeleton-divider" />
      <div class="skeleton-row skeleton-row--large pulse" />
      <div class="skeleton-row skeleton-row--full pulse" />
      <div class="skeleton-divider" />
      <div class="skeleton-bar-group">
        <div class="skeleton-bar pulse" />
        <div class="skeleton-bar pulse" />
        <div class="skeleton-bar pulse" />
      </div>
    </div>

    <!-- ── Geolocation denied — manual input fallback ────────── -->
    <div v-else-if="geoError && !coords" class="manual-input-card">
      <p class="manual-hint">{{ geoError }}</p>
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
      <button class="retry-link" @click="retryGeolocation">
        重试定位
      </button>
    </div>

    <!-- ── Has coordinates — show prediction or degraded ────── -->
    <template v-else-if="coords">
      <!-- Degraded: weather API failed → sunset times only -->
      <div v-if="weatherError" class="degraded-card">
        <div class="degraded-banner">天气数据暂不可用</div>
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

      <!-- Success: full scorecard -->
      <div v-else-if="weatherData" class="scorecard">
        <div class="scorecard-header">
          <div class="location-badge">
            <span class="location-icon">&#127758;</span>
            <span>{{ locationLabel }}</span>
          </div>
          <span class="date-label">{{ formatDate(new Date()) }}</span>
        </div>

        <div class="sunset-hero">
          <span class="hero-label">日落时间</span>
          <span class="hero-time">{{ formatTime(sunsetTime) }}</span>
          <span class="hero-golden">
            黄金时刻 {{ formatTime(goldenHourStart) }} — {{ formatTime(goldenHourEnd) }}
          </span>
        </div>

        <div class="quality-meter-group">
          <div class="meter-item">
            <div class="meter-label-row">
              <span>高云</span>
              <span>{{ highCloudPct }}%</span>
            </div>
            <div class="meter-track">
              <div class="meter-fill" :style="{ width: highCloudPct + '%' }" />
            </div>
          </div>
          <div class="meter-item">
            <div class="meter-label-row">
              <span>湿度</span>
              <span>{{ humidityPct }}%</span>
            </div>
            <div class="meter-track">
              <div class="meter-fill" :style="{ width: humidityPct + '%' }" />
            </div>
          </div>
          <div class="meter-item">
            <div class="meter-label-row">
              <span>低云</span>
              <span>{{ lowCloudPct }}%</span>
            </div>
            <div class="meter-track">
              <div class="meter-fill" :style="{ width: lowCloudPct + '%' }" />
            </div>
          </div>
        </div>

        <div class="verdict" :class="verdictClass">
          <span class="verdict-badge">{{ prediction }}</span>
          <p class="verdict-detail">{{ details }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGeolocation } from './useGeolocation.js'
import { useWeather } from './useWeather.js'
import { useSunsetPrediction } from './useSunsetPrediction.js'

// ── Geolocation ─────────────────────────────────────────────────
const { coords, error: geoError, isLoading: geoLoading, retry: retryGeolocation } = useGeolocation()

// ── Manual coordinate input ─────────────────────────────────────
const manualCoords = ref(null)
const manualLat = ref(null)
const manualLng = ref(null)

function submitManualCoords() {
  if (manualLat.value != null && manualLng.value != null) {
    manualCoords.value = { latitude: manualLat.value, longitude: manualLng.value }
  }
}

// Effective coordinates: geolocation result or manual input
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
} = useSunsetPrediction(effectiveCoords, weatherData)

// ── Derived state ───────────────────────────────────────────────
const isLoading = computed(() => geoLoading.value || (effectiveCoords.value && weatherLoading.value))

const highCloudPct = computed(() => weatherData.value?.current?.cloud_cover_high ?? 0)
const lowCloudPct = computed(() => weatherData.value?.current?.cloud_cover_low ?? 0)
const humidityPct = computed(() => weatherData.value?.current?.relative_humidity_2m ?? 0)

const verdictClass = computed(() => {
  if (!quality.value) return ''
  return `verdict--${quality.value}`
})

const locationLabel = computed(() => {
  if (!effectiveCoords.value) return '未知位置'
  const { latitude, longitude } = effectiveCoords.value
  return `${latitude.toFixed(2)}°${latitude >= 0 ? 'N' : 'S'}, ${longitude.toFixed(2)}°${longitude >= 0 ? 'E' : 'W'}`
})

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
