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
        <input id="manual-lat" v-model.number="manualLat" type="number" step="any" placeholder="31.23" class="coord-input" />
      </div>
      <div class="input-group">
        <label class="input-label" for="manual-lng">经度</label>
        <input id="manual-lng" v-model.number="manualLng" type="number" step="any" placeholder="121.47" class="coord-input" />
      </div>
      <button class="submit-btn" :disabled="!manualLat || !manualLng" @click="submitManualCoords">查询</button>
      <button v-if="geoError" class="retry-link" @click="retryGeolocation">重试定位</button>
    </div>

    <!-- ── Dashboard (success or degraded) ───────────────────── -->
    <template v-else>
      <div class="dashboard" :class="`dashboard--${quality || 'unknown'}`">
        <!-- Degraded banner -->
        <div v-if="weatherError" class="degraded-banner">天气数据暂不可用</div>

        <!-- Header (success only, not degraded) -->
        <div v-if="!weatherError" class="dashboard-header">
          <div class="location-row">
            <div class="location-badge"><span class="location-icon">&#127758;</span><span>{{ locationLabel }}</span></div>
            <button class="edit-coord-btn" title="修改经纬度" @click="openCoordEditor" v-if="!showCoordEditor">&#9998;</button>
          </div>
          <span class="date-label">{{ formatDate(dayDate) }}</span>
        </div>

        <!-- Inline coordinate editor -->
        <div v-if="showCoordEditor" class="coord-editor">
          <div class="coord-editor-fields">
            <input v-model.number="editLat" type="number" step="any" class="coord-input coord-input--sm" placeholder="纬度" aria-label="纬度" />
            <input v-model.number="editLng" type="number" step="any" class="coord-input coord-input--sm" placeholder="经度" aria-label="经度" />
          </div>
          <div class="coord-editor-actions">
            <button class="coord-apply-btn" @click="submitCoordEdit">更新</button>
            <button class="coord-cancel-btn" @click="cancelCoordEdit">取消</button>
          </div>
        </div>

        <!-- Shared: day-tabs + map + arc -->
        <div class="day-tabs">
          <button v-for="(label, i) in dayLabels" :key="i" class="day-tab" :class="{ 'day-tab--active': selectedDay === i }" :disabled="!weatherError && !daily[i]" @click="selectedDay = i">{{ label }}</button>
        </div>
        <MapPicker v-if="effectiveCoords" :lat="effectiveCoords.latitude" :lng="effectiveCoords.longitude" @update:coord="onMapCoord" />
        <div class="sun-arc" v-if="sunsetTime">
          <svg viewBox="0 0 400 130" class="sun-arc-svg" aria-label="太阳轨迹">
            <defs>
              <linearGradient :id="arcGradId" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="arcColor" :stop-opacity="weatherError ? 0.3 : 0.25" />
                <stop offset="100%" :stop-color="arcColor" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="arcPath" :fill="`url(#${arcGradId})`" :stroke="arcColor" :stroke-width="weatherError ? 1.5 : 2" fill-opacity="0.35" />
            <circle :cx="sunDotX" :cy="sunDotY" r="6" :fill="arcColor" />
          </svg>
          <div class="arc-countdown" v-if="selectedDay === 0">{{ countdownText }}</div>
          <div class="arc-countdown" v-else>{{ dayLabels[selectedDay] }}</div>
        </div>

        <!-- Success: full dashboard -->
        <template v-if="!weatherError && weatherData">
          <div class="sunset-hero">
            <span class="hero-label">日落时间</span>
            <span class="hero-time">{{ formatTime(sunsetTime) }}</span>
            <span class="hero-golden">黄金时刻 {{ formatTime(goldenHourStart) }} — {{ formatTime(goldenHourEnd) }}</span>
          </div>

          <div class="donut-group">
            <DonutChart :pct="highCloudPct" label="高云" :quality="highCloudQuality" />
            <DonutChart :pct="lowCloudPct" label="低云" :quality="lowCloudQuality" />
            <DonutChart :pct="humidityPct" label="湿度" :quality="humidityQuality" />
          </div>

          <div class="score-section">
            <div class="score-header">
              <span class="score-label">综合评分</span>
              <span class="score-number" :class="`score-number--${quality}`">{{ compositeScore }}</span>
            </div>
            <div class="score-track">
              <div class="score-fill" :class="`score-fill--${quality}`" :style="{ width: compositeScore + '%' }" />
            </div>
          </div>

          <div class="verdict" :class="verdictClass">
            <span class="verdict-badge">{{ verdictEmoji }} {{ prediction }}</span>
            <p class="verdict-detail">{{ details }}</p>
          </div>
        </template>

        <!-- Degraded: sunset times only -->
        <template v-if="weatherError">
          <h2 class="section-title">日落时间</h2>
          <div class="time-row">
            <span class="time-label">日落</span>
            <span class="time-value prominent">{{ formatTime(sunsetTime) }}</span>
          </div>
          <div class="time-row">
            <span class="time-label">黄金时刻</span>
            <span class="time-value">{{ formatTime(goldenHourStart) }} — {{ formatTime(goldenHourEnd) }}</span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGeolocation } from './useGeolocation.js'
import { useWeather } from './useWeather.js'
import { useSunsetPrediction } from './useSunsetPrediction.js'
import MapPicker from './MapPicker.vue'
import DonutChart from './DonutChart.vue'

// ── Geolocation + manual input ──────────────────────────────────
const { coords, error: geoError, isLoading: geoLoading, retry: retryGeolocation } = useGeolocation()
const manualCoords = ref(null)
const manualLat = ref(null)
const manualLng = ref(null)

watch(coords, (c) => { if (c) { manualLat.value = c.latitude; manualLng.value = c.longitude } }, { immediate: true })

function submitManualCoords() {
  if (manualLat.value != null && manualLng.value != null) {
    manualCoords.value = { latitude: manualLat.value, longitude: manualLng.value }
  }
}

const effectiveCoords = computed(() => manualCoords.value || coords.value)

// ── Inline coordinate editor ────────────────────────────────────
const showCoordEditor = ref(false)
const editLat = ref(null)
const editLng = ref(null)

function openCoordEditor() {
  if (effectiveCoords.value) { editLat.value = effectiveCoords.value.latitude; editLng.value = effectiveCoords.value.longitude }
  showCoordEditor.value = true
}
function submitCoordEdit() {
  if (editLat.value != null && editLng.value != null) { manualCoords.value = { latitude: editLat.value, longitude: editLng.value }; showCoordEditor.value = false }
}
function cancelCoordEdit() { showCoordEditor.value = false }

// ── Multi-day ────────────────────────────────────────────────────
const selectedDay = ref(0)
const dayOffset = computed(() => selectedDay.value)
const dayDate = computed(() => new Date(Date.now() + selectedDay.value * 86400000))
const dayLabels = computed(() => {
  const today = new Date()
  return [0, 1, 2].map((d) => {
    const date = new Date(today.getTime() + d * 86400000)
    return `${['今天', '明天', '后天'][d]} ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
  })
})

const uid = Math.random().toString(36).slice(2, 8)
const arcGradId = computed(() => `arcGrad-${uid}`)

// ── Weather + prediction ─────────────────────────────────────────
const { data: weatherData, daily, error: weatherError, isLoading: weatherLoading } = useWeather(effectiveCoords, { forecastDays: 3 })
const dailyWeather = computed(() => { const s = daily.value[selectedDay.value]; return s ? { current: s } : null })

const { sunsetTime, goldenHourStart, goldenHourEnd, prediction, quality, details, highCloudQuality, lowCloudQuality, humidityQuality, compositeScore, highCloudPct, lowCloudPct, humidityPct } = useSunsetPrediction(effectiveCoords, dailyWeather, dayOffset)

const isLoading = computed(() => geoLoading.value || (effectiveCoords.value && weatherLoading.value))

// ── Verdict helpers ──────────────────────────────────────────────
const verdictClass = computed(() => quality.value ? `verdict--${quality.value}` : '')
const verdictEmoji = computed(() => ({ good: '✨', maybe: '👀', unlikely: '🌫️' })[quality.value] || '🌫️')
const locationLabel = computed(() => {
  if (!effectiveCoords.value) return '未知位置'
  const { latitude, longitude } = effectiveCoords.value
  return `${latitude.toFixed(2)}°${latitude >= 0 ? 'N' : 'S'}, ${longitude.toFixed(2)}°${longitude >= 0 ? 'E' : 'W'}`
})

function onMapCoord({ latitude, longitude }) { manualCoords.value = { latitude, longitude }; manualLat.value = latitude; manualLng.value = longitude }

// ── Sun Arc ──────────────────────────────────────────────────────
const arcColor = computed(() => {
  if (weatherError.value) return '#78716c'
  if (quality.value === 'good') return '#f59e0b'
  if (quality.value === 'maybe') return '#d97706'
  return '#78716c'
})

const arcPath = computed(() => {
  const w = 400, h = 130, margin = 30, cy = h - 15, startX = margin, endX = w - margin
  return `M ${startX} ${cy} Q ${w / 2} ${cy - 90} ${endX} ${cy}`
})

const sunProgress = ref(0.5)
const sunDotX = computed(() => 30 + sunProgress.value * 340)
const sunDotY = computed(() => { const t = sunProgress.value, cy = 115, cp = 25; return (1-t)*(1-t)*cy + 2*(1-t)*t*cp + t*t*cy })

function updateSunPosition() {
  if (!sunsetTime.value) { sunProgress.value = 0.5; return }
  const now = Date.now(), sunsetMs = sunsetTime.value.getTime()
  const sunriseMs = goldenHourStart.value ? goldenHourStart.value.getTime() - 3600000 * 8 : sunsetMs - 3600000 * 14
  if (now <= sunriseMs) sunProgress.value = 0; else if (now >= sunsetMs) sunProgress.value = 1
  else sunProgress.value = (now - sunriseMs) / (sunsetMs - sunriseMs)
}

// ── Countdown ────────────────────────────────────────────────────
const countdownText = ref('')
function updateCountdown() {
  if (!sunsetTime.value) { countdownText.value = ''; return }
  const diff = sunsetTime.value.getTime() - Date.now()
  if (diff <= 0) { countdownText.value = '日落已过' }
  else { const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000); countdownText.value = h > 0 ? `距日落 ${h}h ${m}m` : `距日落 ${m}m` }
}

let countdownTimer = null
watch(sunsetTime, () => { updateSunPosition(); updateCountdown() })
onMounted(() => { updateSunPosition(); updateCountdown(); countdownTimer = setInterval(() => { updateSunPosition(); updateCountdown() }, 1000) })
onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })

// ── Formatters ──────────────────────────────────────────────────
function formatTime(date) { if (!date) return '--:--'; const d = date instanceof Date ? date : new Date(date); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }
function formatDate(date) { return date.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' }) }
</script>

<style scoped>
.sunset-view { max-width: 480px; margin: 0 auto; padding: 16px; }
.sunset-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 4px; }
.sunset-subtitle { color: var(--text-muted, #78716c); font-size: 0.9rem; margin-bottom: 24px; }

/* ── Skeleton ── */
.skeleton-card { background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e7e5e4); border-radius: var(--radius, 8px); padding: 24px; }
.skeleton-arc { height: 100px; background: var(--border, #e7e5e4); border-radius: 8px; margin-bottom: 20px; }
.skeleton-row { height: 14px; background: var(--border, #e7e5e4); border-radius: 4px; margin-bottom: 12px; }
.skeleton-row--wide { width: 70%; } .skeleton-row--medium { width: 50%; } .skeleton-row--large { height: 36px; width: 40%; margin: 0 auto; }
.skeleton-divider { height: 1px; background: var(--border, #e7e5e4); margin: 20px 0; }
.skeleton-donuts { display: flex; justify-content: space-around; gap: 16px; }
.skeleton-donut { width: 80px; height: 80px; border-radius: 50%; background: var(--border, #e7e5e4); }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.pulse { animation: pulse 1.5s ease-in-out infinite; }

/* ── Manual input ── */
.manual-input-card { background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e7e5e4); border-radius: var(--radius, 8px); padding: 24px; }
.manual-hint { color: var(--text-muted, #78716c); font-size: 0.85rem; margin-bottom: 16px; }
.input-group { margin-bottom: 12px; }
.input-label { display: block; font-size: 0.8rem; color: var(--text-muted, #78716c); margin-bottom: 4px; font-weight: 500; }
.coord-input { width: 100%; padding: 10px 12px; border: 1px solid var(--border, #e7e5e4); border-radius: 6px; background: var(--bg-primary, #fafaf9); color: var(--text-primary, #1c1917); font-size: 0.9rem; font-family: var(--font-mono, monospace); }
.coord-input:focus { outline: none; border-color: var(--accent-own, #2563eb); }
.submit-btn { display: block; width: 100%; padding: 10px 16px; margin-top: 16px; border: none; border-radius: 6px; background: var(--accent-own, #2563eb); color: #fff; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.retry-link { display: block; width: 100%; margin-top: 8px; padding: 8px; border: none; background: none; color: var(--text-muted, #78716c); font-size: 0.8rem; cursor: pointer; text-decoration: underline; }
.retry-link:hover { color: var(--text-primary, #1c1917); }

/* ── Degraded ── */
.degraded-banner { background: #fef3c7; color: #92400e; font-size: 0.85rem; padding: 8px 12px; border-radius: 6px; margin-bottom: 20px; text-align: center; }
@media (prefers-color-scheme: dark) { .degraded-banner { background: #3a2e1a; color: #fbbf24; } }
.section-title { font-size: 0.85rem; font-weight: 600; color: var(--text-muted, #78716c); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
.time-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border, #e7e5e4); }
.time-row:last-child { border-bottom: none; }
.time-label { color: var(--text-muted, #78716c); font-size: 0.85rem; }
.time-value { font-family: var(--font-mono, monospace); font-size: 0.9rem; font-weight: 500; }
.time-value.prominent { font-size: 1.3rem; font-weight: 700; color: var(--text-primary, #1c1917); }

/* ── Dashboard ── */
.dashboard { background: var(--bg-card, #ffffff); border: 1px solid var(--border, #e7e5e4); border-radius: var(--radius, 8px); padding: 24px; transition: background 0.8s ease, border-color 0.8s ease; }
.dashboard--good { border-color: rgba(245, 158, 11, 0.3); background: linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, var(--bg-card, #ffffff) 60%); }
.dashboard--maybe { border-color: rgba(217, 119, 6, 0.2); background: linear-gradient(180deg, rgba(217, 119, 6, 0.04) 0%, var(--bg-card, #ffffff) 60%); }
@media (prefers-color-scheme: dark) {
  .dashboard--good { background: linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-card, #2a2723) 60%); }
  .dashboard--maybe { background: linear-gradient(180deg, rgba(217, 119, 6, 0.06) 0%, var(--bg-card, #2a2723) 60%); }
}
.dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.location-row { display: flex; align-items: center; gap: 8px; }
.location-badge { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-muted, #78716c); }
.edit-coord-btn { background: none; border: none; color: var(--text-subtle, #a8a29e); cursor: pointer; font-size: 0.85rem; padding: 2px 4px; border-radius: 4px; line-height: 1; }
.edit-coord-btn:hover { color: var(--text-primary, #1c1917); background: var(--border, #e7e5e4); }
.coord-editor { margin-bottom: 16px; padding: 12px; background: var(--bg-secondary, #f5f3ef); border-radius: var(--radius, 8px); border: 1px solid var(--border, #e7e5e4); }
.coord-editor-fields { display: flex; gap: 8px; margin-bottom: 8px; }
.coord-input--sm { flex: 1; padding: 6px 10px; font-size: 0.85rem; }
.coord-editor-actions { display: flex; gap: 8px; }
.coord-apply-btn { flex: 1; padding: 6px 12px; border: none; border-radius: 6px; background: var(--accent-own, #2563eb); color: #fff; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.coord-cancel-btn { padding: 6px 12px; border: 1px solid var(--border, #e7e5e4); border-radius: 6px; background: var(--bg-card, #ffffff); color: var(--text-muted, #78716c); font-size: 0.8rem; cursor: pointer; }
.coord-cancel-btn:hover { color: var(--text-primary, #1c1917); }
.location-icon { font-size: 1rem; }
.date-label { font-size: 0.8rem; color: var(--text-subtle, #a8a29e); flex-shrink: 0; }

/* ── Day tabs ── */
.day-tabs { display: flex; gap: 0; margin-bottom: 16px; border: 1px solid var(--border, #e7e5e4); border-radius: var(--radius, 8px); overflow: hidden; }
.day-tab { flex: 1; padding: 8px 4px; border: none; background: var(--bg-card, #ffffff); color: var(--text-muted, #78716c); font-size: 0.82rem; font-weight: 500; cursor: pointer; text-align: center; transition: background 0.15s, color 0.15s; }
.day-tab:not(:last-child) { border-right: 1px solid var(--border, #e7e5e4); }
.day-tab:hover { background: var(--bg-secondary, #f5f3ef); color: var(--text-primary, #1c1917); }
.day-tab--active { background: var(--accent-own, #2563eb); color: #fff; font-weight: 600; }
.day-tab--active:hover { background: var(--accent-own, #2563eb); color: #fff; }
.day-tab:disabled { opacity: 0.4; cursor: not-allowed; }
@media (prefers-color-scheme: dark) {
  .day-tab { background: var(--bg-card, #2a2723); }
  .day-tab:hover { background: var(--bg-secondary, #24211d); }
  .day-tab--active { background: var(--accent-own, #3b82f6); }
}

/* ── Sun Arc ── */
.sun-arc { text-align: center; margin-bottom: 16px; }
.sun-arc-svg { width: 100%; max-width: 400px; height: auto; }
.arc-countdown { font-family: var(--font-mono, monospace); font-size: 0.85rem; color: var(--text-muted, #78716c); margin-top: 4px; }

/* ── Sunset Hero ── */
.sunset-hero { text-align: center; padding: 12px 0 20px; margin-bottom: 20px; border-bottom: 1px solid var(--border, #e7e5e4); }
.hero-label { display: block; font-size: 0.8rem; color: var(--text-muted, #78716c); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.hero-time { display: block; font-family: var(--font-mono, monospace); font-size: 3rem; font-weight: var(--font-weight-headline, 800); color: var(--text-primary, #1c1917); line-height: 1.1; }
.hero-golden { display: block; font-size: 0.8rem; color: var(--text-subtle, #a8a29e); margin-top: 6px; font-family: var(--font-mono, monospace); }

/* ── Donut Group ── */
.donut-group { display: flex; justify-content: space-around; gap: 12px; margin-bottom: 24px; }

/* ── Composite Score ── */
.score-section { margin-bottom: 20px; }
.score-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.score-label { font-size: 0.8rem; color: var(--text-muted, #78716c); text-transform: uppercase; letter-spacing: 0.05em; }
.score-number { font-family: var(--font-mono, monospace); font-size: 1.6rem; font-weight: 700; transition: color 0.6s ease; }
.score-number--good { color: #16a34a; } .score-number--maybe { color: #ca8a04; } .score-number--unlikely { color: var(--text-muted, #78716c); }
.score-track { height: 8px; background: var(--border, #e7e5e4); border-radius: 4px; overflow: hidden; }
.score-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease, background 0.6s ease; }
.score-fill--good { background: #16a34a; } .score-fill--maybe { background: #ca8a04; } .score-fill--unlikely { background: var(--text-muted, #78716c); }

/* ── Verdict ── */
.verdict { text-align: center; padding: 16px; border-radius: 8px; border: 1px solid var(--border, #e7e5e4); transition: background 0.6s ease, border-color 0.6s ease; }
.verdict--good { border-color: #86efac; background: #f0fdf4; }
.verdict--maybe { border-color: #fde68a; background: #fefce8; }
.verdict--unlikely { border-color: var(--border, #e7e5e4); background: var(--bg-secondary, #f5f3ef); }
@media (prefers-color-scheme: dark) {
  .verdict--good { border-color: #166534; background: #052e16; }
  .verdict--maybe { border-color: #854d0e; background: #292524; }
  .verdict--unlikely { border-color: #3a3530; background: #24211d; }
}
.verdict-badge { display: inline-block; font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; }
.verdict--good .verdict-badge { color: #16a34a; } .verdict--maybe .verdict-badge { color: #ca8a04; } .verdict--unlikely .verdict-badge { color: var(--text-muted, #78716c); }
.verdict-detail { font-size: 0.85rem; color: var(--text-muted, #78716c); line-height: 1.5; }

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .donut-ring, .score-fill, .dashboard, .verdict, .score-number { transition: none; }
  .pulse { animation: none; }
}
</style>
